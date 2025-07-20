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
      console.error("Erro na inicialização:", error);
      throw error;
    }
  }

  async initialize() {
    try {
      await this.checkAPIHealth();
      await this.loadContacts();
      UIManager.initialize();
      console.log("Aplicação inicializada com sucesso!");
    } catch (error) {
      console.error("Erro na inicialização:", error);
    }
  }

  async checkAPIHealth() {
    console.log("Verificando saúde das APIs...");
    try {
      await APIManager.makeRequest(APIManager.BASE_URL);
      console.log("SheetBest API está respondendo corretamente");

      const webhookResponse = await fetch("https://gazeredo.app.n8n.cloud/webhook/atualizar-modo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ numero: "teste", modo: "bot" })
      });

      if (!webhookResponse.ok) throw new Error("Webhook não está respondendo corretamente");
      console.log("Webhook N8N está respondendo corretamente");
    } catch (error) {
      console.error("N8N Webhook não está respondendo:", error);
    }
  }

  async loadContacts() {
    console.log("Carregando contatos...");
    const contatos = await APIManager.getContacts();
    console.log(`${contatos.length} contatos carregados com sucesso`);
    // Aqui você pode integrar a UI se necessário
  }
}

new WhatsAppBotPanel();
