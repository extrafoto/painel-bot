/**
 * Aplicação Principal - Coordena todos os módulos
 */
class WhatsAppBotPanel {
    constructor() {
        this.isInitialized = false;
        this.healthCheckInterval = null;
        
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Inicializa a aplicação
     */
    async initialize() {
        try {
            console.log('Inicializando Painel do Bot WhatsApp...');
            
            // Verificar dependências
            this.checkDependencies();
            
            // Configurar handlers de erro global
            this.setupErrorHandlers();
            
            // Verificar saúde das APIs
            await this.checkAPIHealth();
            
            // Carregar dados iniciais
            await this.loadContacts();
            
            // Iniciar auto-refresh
            uiManager.startAutoRefresh();
            
            // Iniciar monitoramento de saúde
            this.startHealthMonitoring();
            
            this.isInitialized = true;
            console.log('Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.handleInitializationError(error);
        } finally {
            uiManager.hideLoading();
        }
    }

    /**
     * Verifica se todas as dependências estão disponíveis
     */
    checkDependencies() {
        const dependencies = [
            { name: 'CONFIG', obj: window.CONFIG },
            { name: 'apiManager', obj: window.apiManager },
            { name: 'uiManager', obj: window.uiManager }
        ];

        for (const dep of dependencies) {
            if (!dep.obj) {
                throw new Error(`Dependência não encontrada: ${dep.name}`);
            }
        }

        console.log('Todas as dependências verificadas com sucesso');
    }

    /**
     * Configura handlers de erro global
     */
    setupErrorHandlers() {
        // Erros JavaScript não capturados
        window.addEventListener('error', (event) => {
            console.error('Erro JavaScript não capturado:', event.error);
            this.handleGlobalError(event.error);
        });

        // Promises rejeitadas não capturadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada não capturada:', event.reason);
            this.handleGlobalError(event.reason);
        });

        // Erros de rede
        window.addEventListener('offline', () => {
            uiManager.showToast('Aviso', 'Conexão com a internet perdida', 'warning');
            uiManager.stopAutoRefresh();
        });

        window.addEventListener('online', () => {
            uiManager.showToast('Sucesso', 'Conexão com a internet restaurada', 'success');
            uiManager.startAutoRefresh();
            this.loadContacts();
        });
    }

    /**
     * Verifica saúde das APIs
     */
    async checkAPIHealth() {
        console.log('Verificando saúde das APIs...');
        
        try {
            const health = await apiManager.checkAPIHealth();
            
            if (!health.sheetBest) {
                console.warn('Sheet.best API não está respondendo');
                uiManager.showToast('Aviso', 'API de dados pode estar instável', 'warning');
            }
            
            if (!health.n8nWebhook) {
                console.warn('N8N Webhook não está respondendo');
                uiManager.showToast('Aviso', 'Webhook de atualização pode estar instável', 'warning');
            }
            
            if (health.sheetBest && health.n8nWebhook) {
                console.log('Todas as APIs estão funcionando normalmente');
            }
            
        } catch (error) {
            console.warn('Erro na verificação de saúde das APIs:', error);
        }
    }

    /**
     * Carrega contatos da API
     */
    async loadContacts() {
        try {
            console.log('Carregando contatos...');
            
            const contacts = await apiManager.loadContacts();
            
            if (!contacts || contacts.length === 0) {
                console.warn('Nenhum contato encontrado');
                uiManager.showEmptyState();
                return;
            }
            
            // Atualizar UI com os contatos
            uiManager.updateContacts(contacts);
            
            console.log(`${contacts.length} contatos carregados com sucesso`);
            
        } catch (error) {
            console.error('Erro ao carregar contatos:', error);
            uiManager.showErrorState(error.message);
            throw error;
        }
    }

    /**
     * Inicia monitoramento de saúde das APIs
     */
    startHealthMonitoring() {
        // Verificar saúde das APIs a cada 5 minutos
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.checkAPIHealth();
            } catch (error) {
                console.warn('Erro no monitoramento de saúde:', error);
            }
        }, 5 * 60 * 1000); // 5 minutos
    }

    /**
     * Para monitoramento de saúde
     */
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }

    /**
     * Manipula erros de inicialização
     */
    handleInitializationError(error) {
        const errorMessage = error.message || 'Erro desconhecido na inicialização';
        
        uiManager.showErrorState(`Falha na inicialização: ${errorMessage}`);
        uiManager.showToast('Erro Crítico', 'Falha ao inicializar aplicação', 'error');
        
        // Tentar reinicializar após 10 segundos
        setTimeout(() => {
            console.log('Tentando reinicializar aplicação...');
            window.location.reload();
        }, 10000);
    }

    /**
     * Manipula erros globais
     */
    handleGlobalError(error) {
        // Não mostrar toast para erros menores
        if (error && error.message && error.message.includes('Non-Error promise rejection')) {
            return;
        }
        
        console.error('Erro global capturado:', error);
        
        // Mostrar notificação apenas para erros críticos
        if (error && error.message && !error.message.includes('NetworkError')) {
            uiManager.showToast('Erro', 'Ocorreu um erro inesperado', 'error');
        }
    }

    /**
     * Força atualização dos dados
     */
    async forceRefresh() {
        try {
            uiManager.showLoading();
            await this.loadContacts();
            uiManager.showToast('Sucesso', 'Dados atualizados com sucesso', 'success');
        } catch (error) {
            console.error('Erro no refresh forçado:', error);
            uiManager.showToast('Erro', 'Falha ao atualizar dados', 'error');
        } finally {
            uiManager.hideLoading();
        }
    }

    /**
     * Reinicia a aplicação
     */
    restart() {
        console.log('Reiniciando aplicação...');
        
        // Parar intervalos
        uiManager.stopAutoRefresh();
        this.stopHealthMonitoring();
        
        // Limpar dados
        uiManager.clear();
        
        // Reinicializar
        this.isInitialized = false;
        this.initialize();
    }

    /**
     * Limpa recursos antes de sair
     */
    cleanup() {
        console.log('Limpando recursos da aplicação...');
        
        uiManager.stopAutoRefresh();
        this.stopHealthMonitoring();
        
        // Remover event listeners globais se necessário
        // (os event listeners do DOM são automaticamente removidos)
    }

    /**
     * Obtém estatísticas da aplicação
     */
    getStats() {
        if (!this.isInitialized) {
            return null;
        }
        
        const contacts = uiManager.contacts;
        const activeBots = contacts.filter(c => c.modo === CONFIG.BOT_MODES.ACTIVE).length;
        const inactiveBots = contacts.filter(c => c.modo === CONFIG.BOT_MODES.INACTIVE).length;
        
        return {
            totalContacts: contacts.length,
            activeBots,
            inactiveBots,
            lastUpdate: new Date().toISOString(),
            isHealthy: this.isInitialized
        };
    }

    /**
     * Exporta dados para backup
     */
    exportData() {
        if (!this.isInitialized) {
            throw new Error('Aplicação não inicializada');
        }
        
        const data = {
            contacts: uiManager.contacts,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `whatsapp-bot-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        uiManager.showToast('Sucesso', 'Backup exportado com sucesso', 'success');
    }
}

// Inicializar aplicação
const app = new WhatsAppBotPanel();

// Exportar para uso global e debugging
window.app = app;

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
    app.cleanup();
});

// Comandos de debug disponíveis no console
window.debug = {
    getStats: () => app.getStats(),
    forceRefresh: () => app.forceRefresh(),
    restart: () => app.restart(),
    exportData: () => app.exportData(),
    checkHealth: () => apiManager.checkAPIHealth(),
    showToast: (title, message, type) => uiManager.showToast(title, message, type)
};

console.log('Painel do Bot WhatsApp carregado. Use window.debug para comandos de debug.');

