/**
 * Módulo de Interface do Usuário - Gerencia todas as interações visuais
 */
class UIManager {
    constructor() {
        this.contacts = [];
        this.filteredContacts = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.isLoading = false;
        this.autoRefreshInterval = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Inicializa referências dos elementos DOM
     */
    initializeElements() {
        this.elements = {
            // Loading
            loadingOverlay: document.getElementById('loading-overlay'),
            
            // Header
            totalContacts: document.getElementById('total-contacts'),
            activeBots: document.getElementById('active-bots'),
            lastUpdate: document.getElementById('last-update'),
            refreshBtn: document.getElementById('refresh-btn'),
            
            // Controls
            searchInput: document.getElementById('search-input'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            
            // Content
            contactsGrid: document.getElementById('contacts-grid'),
            emptyState: document.getElementById('empty-state'),
            errorState: document.getElementById('error-state'),
            errorMessage: document.getElementById('error-message'),
            retryBtn: document.getElementById('retry-btn'),
            
            // Modal
            modal: document.getElementById('confirmation-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalMessage: document.getElementById('modal-message'),
            modalClose: document.getElementById('modal-close'),
            modalCancel: document.getElementById('modal-cancel'),
            modalConfirm: document.getElementById('modal-confirm'),
            
            // Toast
            toastContainer: document.getElementById('toast-container')
        };
    }

    /**
     * Vincula eventos aos elementos
     */
    bindEvents() {
        // Refresh button
        this.elements.refreshBtn.addEventListener('click', () => this.handleRefresh());
        
        // Search input
        this.elements.searchInput.addEventListener('input', 
            this.debounce((e) => this.handleSearch(e.target.value), CONFIG.UI.DEBOUNCE_DELAY)
        );
        
        // Filter buttons
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleFilter(btn.dataset.filter));
        });
        
        // Retry button
        this.elements.retryBtn.addEventListener('click', () => this.handleRefresh());
        
        // Modal events
        this.elements.modalClose.addEventListener('click', () => this.hideModal());
        this.elements.modalCancel.addEventListener('click', () => this.hideModal());
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) this.hideModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Mostra o overlay de loading
     */
    showLoading() {
        this.isLoading = true;
        this.elements.loadingOverlay.classList.remove('hidden');
        this.elements.refreshBtn.classList.add('loading');
    }

    /**
     * Esconde o overlay de loading
     */
    hideLoading() {
        this.isLoading = false;
        this.elements.loadingOverlay.classList.add('hidden');
        this.elements.refreshBtn.classList.remove('loading');
    }

    /**
     * Atualiza as estatísticas do header
     */
    updateStats() {
        const totalContacts = this.contacts.length;
        const activeBots = this.contacts.filter(c => c.modo === CONFIG.BOT_MODES.ACTIVE).length;
        const now = new Date().toLocaleTimeString('pt-BR');
        
        this.elements.totalContacts.textContent = totalContacts;
        this.elements.activeBots.textContent = activeBots;
        this.elements.lastUpdate.textContent = now;
    }

    /**
     * Renderiza a lista de contatos
     */
    renderContacts() {
        const container = this.elements.contactsGrid;
        
        if (this.filteredContacts.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideStates();
        
        container.innerHTML = this.filteredContacts
            .map(contact => this.createContactCard(contact))
            .join('');
        
        // Bind events para os botões dos cards
        this.bindContactEvents();
    }

    /**
     * Cria o HTML de um card de contato
     */
    createContactCard(contact) {
        const isActive = contact.modo === CONFIG.BOT_MODES.ACTIVE;
        const statusClass = isActive ? 'active' : 'inactive';
        const statusText = isActive ? 'Bot Ativo' : 'Bot Desligado';
        const buttonClass = isActive ? 'btn-danger' : 'btn-primary';
        const buttonIcon = isActive ? 'fa-robot' : 'fa-play';
        const buttonText = isActive ? 'Desligar Bot' : 'Ligar Bot';
        
        const lastUpdate = contact.timestamp_ultima 
            ? new Date(contact.timestamp_ultima).toLocaleString('pt-BR')
            : 'Nunca';
        
        return `
            <div class="contact-card" data-numero="${contact.numero}">
                <div class="contact-header">
                    <div class="contact-info">
                        <h3>${this.escapeHtml(contact.nome)}</h3>
                        <div class="contact-number">
                            <i class="fab fa-whatsapp"></i>
                            ${this.formatPhoneNumber(contact.numero)}
                        </div>
                    </div>
                    <div class="status-badge ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                
                <div class="contact-meta">
                    <div class="meta-item">
                        <span class="meta-label">Modo Atual</span>
                        <span class="meta-value">${contact.modo}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Última Atualização</span>
                        <span class="meta-value">${lastUpdate}</span>
                    </div>
                </div>
                
                <div class="contact-actions">
                    <button class="btn ${buttonClass}" 
                            data-action="toggle-bot" 
                            data-numero="${contact.numero}"
                            data-current-mode="${contact.modo}">
                        <i class="fas ${buttonIcon}"></i>
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Vincula eventos aos botões dos cards de contato
     */
    bindContactEvents() {
        const actionButtons = document.querySelectorAll('[data-action="toggle-bot"]');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToggleBot(e));
        });
    }

    /**
     * Manipula o clique no botão de alternar bot
     */
    async handleToggleBot(event) {
        const button = event.currentTarget;
        const numero = button.dataset.numero;
        const currentMode = button.dataset.currentMode;
        const newMode = currentMode === CONFIG.BOT_MODES.ACTIVE 
            ? CONFIG.BOT_MODES.INACTIVE 
            : CONFIG.BOT_MODES.ACTIVE;
        
        const contact = this.contacts.find(c => c.numero === numero);
        if (!contact) {
            this.showToast('Erro', 'Contato não encontrado', 'error');
            return;
        }
        
        // Mostrar modal de confirmação
        const isActivating = newMode === CONFIG.BOT_MODES.ACTIVE;
        const message = isActivating 
            ? CONFIG.MESSAGES.CONFIRM_ACTIVATE
            : CONFIG.MESSAGES.CONFIRM_DEACTIVATE;
        
        const confirmed = await this.showConfirmationModal(
            `${isActivating ? 'Ativar' : 'Desativar'} Bot`,
            `${message}\n\nContato: ${contact.nome}\nNúmero: ${contact.numero}`
        );
        
        if (!confirmed) return;
        
        // Desabilitar botão durante a operação
        button.disabled = true;
        button.classList.add('loading');
        
        try {
            await apiManager.updateBotMode(numero, newMode);
            
            // Atualizar dados locais
            contact.modo = newMode;
            contact.timestamp_ultima = new Date().toISOString();
            
            // Re-renderizar
            this.applyFilters();
            this.updateStats();
            
            // Mostrar sucesso
            this.showToast(
                'Sucesso',
                `Bot ${isActivating ? 'ativado' : 'desativado'} para ${contact.nome}`,
                'success'
            );
            
        } catch (error) {
            console.error('Erro ao alterar modo do bot:', error);
            this.showToast('Erro', error.message, 'error');
        } finally {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    /**
     * Manipula o refresh dos dados
     */
    async handleRefresh() {
        if (this.isLoading) return;
        
        try {
            this.showLoading();
            await window.app.loadContacts();
            this.showToast('Sucesso', 'Dados atualizados com sucesso', 'success');
        } catch (error) {
            console.error('Erro no refresh:', error);
            this.showToast('Erro', 'Falha ao atualizar dados', 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Manipula a busca
     */
    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        this.applyFilters();
    }

    /**
     * Manipula os filtros
     */
    handleFilter(filter) {
        this.currentFilter = filter;
        
        // Atualizar botões ativos
        this.elements.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.applyFilters();
    }

    /**
     * Aplica filtros e busca
     */
    applyFilters() {
        let filtered = [...this.contacts];
        
        // Aplicar filtro de modo
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(contact => contact.modo === this.currentFilter);
        }
        
        // Aplicar busca
        if (this.searchTerm) {
            filtered = filtered.filter(contact => 
                contact.nome.toLowerCase().includes(this.searchTerm) ||
                contact.numero.includes(this.searchTerm)
            );
        }
        
        this.filteredContacts = filtered;
        this.renderContacts();
    }

    /**
     * Manipula atalhos de teclado
     */
    handleKeyboard(event) {
        // Escape para fechar modal
        if (event.key === 'Escape') {
            this.hideModal();
        }
        
        // Ctrl+R para refresh
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            this.handleRefresh();
        }
        
        // Ctrl+F para focar na busca
        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            this.elements.searchInput.focus();
        }
    }

    /**
     * Mostra estado vazio
     */
    showEmptyState() {
        this.elements.contactsGrid.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        this.elements.emptyState.style.display = 'block';
    }

    /**
     * Mostra estado de erro
     */
    showErrorState(message) {
        this.elements.contactsGrid.style.display = 'none';
        this.elements.emptyState.style.display = 'none';
        this.elements.errorMessage.textContent = message;
        this.elements.errorState.style.display = 'block';
    }

    /**
     * Esconde todos os estados especiais
     */
    hideStates() {
        this.elements.emptyState.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        this.elements.contactsGrid.style.display = 'grid';
    }

    /**
     * Mostra modal de confirmação
     */
    showConfirmationModal(title, message) {
        return new Promise((resolve) => {
            this.elements.modalTitle.textContent = title;
            this.elements.modalMessage.textContent = message;
            this.elements.modal.style.display = 'flex';
            
            const handleConfirm = () => {
                cleanup();
                resolve(true);
            };
            
            const handleCancel = () => {
                cleanup();
                resolve(false);
            };
            
            const cleanup = () => {
                this.elements.modalConfirm.removeEventListener('click', handleConfirm);
                this.elements.modalCancel.removeEventListener('click', handleCancel);
                this.hideModal();
            };
            
            this.elements.modalConfirm.addEventListener('click', handleConfirm);
            this.elements.modalCancel.addEventListener('click', handleCancel);
        });
    }

    /**
     * Esconde modal
     */
    hideModal() {
        this.elements.modal.style.display = 'none';
    }

    /**
     * Mostra notificação toast
     */
    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${iconMap[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Adicionar evento de fechar
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));
        
        // Adicionar ao container
        this.elements.toastContainer.appendChild(toast);
        
        // Auto-remover após o tempo configurado
        setTimeout(() => this.removeToast(toast), CONFIG.UI.TOAST_DURATION);
    }

    /**
     * Remove notificação toast
     */
    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    /**
     * Inicia auto-refresh
     */
    startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        this.autoRefreshInterval = setInterval(() => {
            if (!this.isLoading) {
                console.log('Auto-refresh executado');
                window.app.loadContacts();
            }
        }, CONFIG.UI.AUTO_REFRESH_INTERVAL);
    }

    /**
     * Para auto-refresh
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    /**
     * Utilitários
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatPhoneNumber(phone) {
        // Formato brasileiro: (XX) XXXXX-XXXX
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return phone;
    }

    /**
     * Atualiza dados dos contatos
     */
    updateContacts(contacts) {
        this.contacts = contacts;
        this.applyFilters();
        this.updateStats();
    }

    /**
     * Limpa todos os dados
     */
    clear() {
        this.contacts = [];
        this.filteredContacts = [];
        this.elements.contactsGrid.innerHTML = '';
        this.updateStats();
    }
}

// Instância global do gerenciador de UI
const uiManager = new UIManager();

// Exportar para uso global
window.uiManager = uiManager;

