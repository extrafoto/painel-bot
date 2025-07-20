// ui.js

import APIManager from './api.js';

class UIManager {
  static initialize() {
    document.querySelectorAll('.bot-toggle-button').forEach(button => {
      button.addEventListener('click', UIManager.handleToggleBot);
    });
  }

  static async handleToggleBot(event) {
    const button = event.currentTarget;
    const numero = button.dataset.numero;
    const modoAtual = button.dataset.modo;
    const novoModo = modoAtual === "bot" ? "OFF" : "bot";

    console.log("Botão clicado para número:", numero, "Novo modo:", novoModo);

    try {
      await APIManager.updateBotMode(numero, novoModo);
      button.dataset.modo = novoModo;
      button.textContent = novoModo === "bot" ? "Desligar Bot" : "Ligar Bot";
      console.log("Modo atualizado com sucesso para:", novoModo);
    } catch (error) {
      console.error("Erro ao alterar modo do bot:", error);
    }
  }
}

export default UIManager;
