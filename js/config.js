/**
 * Configurações da aplicação
 */
const CONFIG = {
    // URLs das APIs
    API: {
        SHEET_BEST: 'https://api.sheetbest.com/sheets/ec6ca1f8-de13-4cad-a4b1-1e1919ff5d48',
        N8N_WEBHOOK: 'https://gazeredo.app.n8n.cloud/webhook-test/604b8346-e309-4199-ad53-419ab978fd28'
    },
    
    // Configurações de requisições
    REQUEST: {
        TIMEOUT: 10000, // 10 segundos
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 segundo
    },
    
    // Configurações da interface
    UI: {
        AUTO_REFRESH_INTERVAL: 30000, // 30 segundos
        TOAST_DURATION: 5000, // 5 segundos
        ANIMATION_DURATION: 300, // 300ms
        DEBOUNCE_DELAY: 500 // 500ms para busca
    },
    
    // Modos do bot
    BOT_MODES: {
        ACTIVE: 'bot',
        INACTIVE: 'OFF'
    },
    
    // Mensagens da aplicação
    MESSAGES: {
        LOADING: 'Carregando dados...',
        ERROR_LOAD: 'Erro ao carregar contatos',
        ERROR_UPDATE: 'Erro ao atualizar modo do bot',
        SUCCESS_UPDATE: 'Modo do bot atualizado com sucesso',
        CONFIRM_ACTIVATE: 'Tem certeza que deseja ativar o bot para este contato?',
        CONFIRM_DEACTIVATE: 'Tem certeza que deseja desativar o bot para este contato?',
        NO_CONTACTS: 'Nenhum contato encontrado',
        NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
        TIMEOUT_ERROR: 'Tempo limite excedido. Tente novamente.',
        UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.'
    },
    
    // Configurações de validação
    VALIDATION: {
        MIN_PHONE_LENGTH: 10,
        MAX_PHONE_LENGTH: 15,
        PHONE_PATTERN: /^[\d\s\-\+\(\)]+$/
    }
};

// Função para validar configurações
function validateConfig() {
    const requiredFields = [
        'API.SHEET_BEST',
        'API.N8N_WEBHOOK'
    ];
    
    for (const field of requiredFields) {
        const value = field.split('.').reduce((obj, key) => obj?.[key], CONFIG);
        if (!value) {
            console.error(`Configuração obrigatória não encontrada: ${field}`);
            return false;
        }
    }
    
    return true;
}

// Validar configurações ao carregar
if (!validateConfig()) {
    console.error('Erro na validação das configurações');
}

// Exportar configurações globalmente
window.CONFIG = CONFIG;

