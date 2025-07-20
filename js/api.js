/**
 * Módulo de API - Gerencia todas as comunicações com APIs externas
 */
class APIManager {
    constructor() {
        this.requestQueue = new Map();
        this.retryAttempts = new Map();
    }

    /**
     * Realiza uma requisição HTTP com retry automático e tratamento de erros
     */
    async makeRequest(url, options = {}) {
        const requestId = this.generateRequestId();
        const config = {
            timeout: CONFIG.REQUEST.TIMEOUT,
            retries: CONFIG.REQUEST.RETRY_ATTEMPTS,
            retryDelay: CONFIG.REQUEST.RETRY_DELAY,
            ...options
        };

        try {
            return await this.executeRequestWithRetry(url, config, requestId);
        } catch (error) {
            console.error('Falha na requisição após todas as tentativas:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Executa requisição com lógica de retry
     */
    async executeRequestWithRetry(url, config, requestId) {
        let lastError;
        
        for (let attempt = 1; attempt <= config.retries; attempt++) {
            try {
                console.log(`Tentativa ${attempt}/${config.retries} para ${url}`);
                
                const response = await this.fetchWithTimeout(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                this.clearRetryAttempts(requestId);
                return data;
                
            } catch (error) {
                lastError = error;
                console.warn(`Tentativa ${attempt} falhou:`, error.message);
                
                if (attempt < config.retries) {
                    const delay = config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
                    await this.sleep(delay);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Fetch com timeout personalizado
     */
    async fetchWithTimeout(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        
        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout: A requisição demorou muito para responder');
            }
            throw error;
        }
    }

    /**
     * Carrega todos os contatos da planilha
     */
    async loadContacts() {
        try {
            console.log('Carregando contatos da planilha...');
            
            const data = await this.makeRequest(CONFIG.API.SHEET_BEST, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!Array.isArray(data)) {
                throw new Error('Formato de dados inválido recebido da API');
            }

            const validatedContacts = this.validateContacts(data);
            console.log(`${validatedContacts.length} contatos carregados com sucesso`);
            
            return validatedContacts;
            
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
            throw new Error(`Falha ao carregar contatos: ${error.message}`);
        }
    }

    /**
     * Atualiza o modo do bot para um contato específico
     */
    async updateBotMode(numero, novoModo) {
        try {
            console.log(`Atualizando modo do bot para ${numero}: ${novoModo}`);
            
            // Validar dados de entrada
            if (!this.validatePhoneNumber(numero)) {
                throw new Error('Número de telefone inválido');
            }
            
            if (!this.validateBotMode(novoModo)) {
                throw new Error('Modo do bot inválido');
            }

            const payload = {
                numero: numero,
                modo: novoModo,
                timestamp: new Date().toISOString()
            };

            const response = await this.makeRequest(CONFIG.API.N8N_WEBHOOK, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('Modo do bot atualizado com sucesso:', response);
            return response;
            
        } catch (error) {
            console.error('Erro ao atualizar modo do bot:', error);
            throw new Error(`Falha ao atualizar modo: ${error.message}`);
        }
    }

    /**
     * Valida lista de contatos
     */
    validateContacts(contacts) {
        if (!Array.isArray(contacts)) {
            throw new Error('Lista de contatos deve ser um array');
        }

        return contacts
            .filter(contact => this.isValidContact(contact))
            .map(contact => this.sanitizeContact(contact));
    }

    /**
     * Verifica se um contato é válido
     */
    isValidContact(contact) {
        if (!contact || typeof contact !== 'object') {
            console.warn('Contato inválido encontrado:', contact);
            return false;
        }

        // Verificar se tem número
        if (!contact.numero || typeof contact.numero !== 'string') {
            console.warn('Campo numero ausente ou inválido:', contact);
            return false;
        }

        // Verificar se tem nome (aceitar "nome" ou "Nome")
        const nome = contact.nome || contact.Nome;
        if (!nome || typeof nome !== 'string') {
            console.warn('Campo nome ausente ou inválido:', contact);
            return false;
        }

        if (!this.validatePhoneNumber(contact.numero)) {
            console.warn('Número de telefone inválido:', contact.numero);
            return false;
        }

        return true;
    }

    /**
     * Sanitiza dados do contato
     */
    sanitizeContact(contact) {
        const nome = contact.nome || contact.Nome || 'Sem nome';
        return {
            Key: contact.Key || contact.numero,
            nome: nome.trim(),
            numero: contact.numero.trim(),
            modo: contact.modo || CONFIG.BOT_MODES.INACTIVE,
            timestamp_ultima: contact.timestamp_ultima || null
        };
    }

    /**
     * Valida número de telefone
     */
    validatePhoneNumber(phone) {
        if (!phone || typeof phone !== 'string') {
            return false;
        }

        const cleanPhone = phone.replace(/\s/g, '');
        
        return cleanPhone.length >= CONFIG.VALIDATION.MIN_PHONE_LENGTH &&
               cleanPhone.length <= CONFIG.VALIDATION.MAX_PHONE_LENGTH &&
               CONFIG.VALIDATION.PHONE_PATTERN.test(cleanPhone);
    }

    /**
     * Valida modo do bot
     */
    validateBotMode(mode) {
        return Object.values(CONFIG.BOT_MODES).includes(mode);
    }

    /**
     * Trata erros de forma padronizada
     */
    handleError(error) {
        if (error.message.includes('Timeout')) {
            return new Error(CONFIG.MESSAGES.TIMEOUT_ERROR);
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return new Error(CONFIG.MESSAGES.NETWORK_ERROR);
        }
        
        if (error.message.includes('HTTP 4')) {
            return new Error('Erro de autorização ou dados inválidos');
        }
        
        if (error.message.includes('HTTP 5')) {
            return new Error('Erro interno do servidor. Tente novamente mais tarde.');
        }
        
        return new Error(error.message || CONFIG.MESSAGES.UNKNOWN_ERROR);
    }

    /**
     * Utilitários
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    clearRetryAttempts(requestId) {
        this.retryAttempts.delete(requestId);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Verifica status da conexão com as APIs
     */
    async checkAPIHealth() {
        const results = {
            sheetBest: false,
            n8nWebhook: false
        };

        try {
            // Teste básico do Sheet.best (apenas HEAD request se possível)
            await this.makeRequest(CONFIG.API.SHEET_BEST, {
                method: 'GET',
                retries: 1,
                timeout: 5000
            });
            results.sheetBest = true;
        } catch (error) {
            console.warn('Sheet.best não está respondendo:', error.message);
        }

        try {
            // Teste do webhook n8n com payload mínimo
            await this.makeRequest(CONFIG.API.N8N_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test: true }),
                retries: 1,
                timeout: 5000
            });
            results.n8nWebhook = true;
        } catch (error) {
            console.warn('N8N Webhook não está respondendo:', error.message);
        }

        return results;
    }
}

// Instância global do gerenciador de API
const apiManager = new APIManager();

// Exportar para uso global
window.apiManager = apiManager;

