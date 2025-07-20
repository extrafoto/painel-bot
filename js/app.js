// app.js

import APIManager from './api.js';
import UIManager from './ui.js';

class WhatsAppBotPanel {
  constructor() {
    console.log("Inicializando Painel do Bot WhatsApp...");
    this.checkDependencies();
    this.initialize();
  }

  async checkDependencies() {
    try {
      if (!APIManager || !UIManager) {
        throw new Error("Dependência não encontrada: APIManager ou UIManager");
      }
      console.log("Todas as dependências verificadas com sucesso");
    } catch (error) {
      console.error("Erro na verificação de dependências:", error);
      throw error;
    }
  }

  async initialize() {
    try {
      await this.loadContacts(); // ✅ REMOVIDO: await this.checkAPIHealth();
      UIManager.initialize();
      console.log("Aplicação inicializada com sucesso!");
    } catch (error) {
      console.error("Erro na inicialização:", error);
    }
  }

  async loadContacts() {
    console.log("Carregando contatos...");
    try {
      const contatos = await APIManager.getContacts();
      console.log(`${contatos.length} contatos carregados com sucesso`);
      UIManager.renderContacts(contatos);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
    }
  }
}

new Wh
