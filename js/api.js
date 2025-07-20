// api.js

class APIManager {
  static BASE_URL = "https://api.sheetbest.com/sheets/ec6ca1f8-de13-4cad-a4b1-1e1919ff5d48";

  static async fetchWithTimeout(resource, options = {}) {
    const { timeout = 5000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  }

  static async executeRequestWithRetry(url, options = {}, retries = 3, backoff = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Tentativa ${i + 1}/${retries} para ${url}`);
        const response = await this.fetchWithTimeout(url, options);
        return await response.json();
      } catch (error) {
        console.error(`Tentativa ${i + 1} falhou:`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
        } else {
          console.error("Falha na requisição após todas as tentativas:", error);
          throw error;
        }
      }
    }
  }

  static async makeRequest(url, options = {}) {
    try {
      return await this.executeRequestWithRetry(url, options);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static handleError(error) {
    console.error("Erro ao fazer requisição:", error);
  }

  static async getContacts() {
    console.log("Carregando contatos da planilha...");
    const data = await this.makeRequest(this.BASE_URL);
    console.log(`${data.length} contatos carregados com sucesso`);
    return data;
  }

  static async updateBotMode(numero, modo) {
    console.log("Enviando requisição para atualizar modo do número:", numero, "com modo:", modo);

    try {
      const response = await fetch("https://gazeredo.app.n8n.cloud/webhook/atualizar-modo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          numero: numero,
          modo: modo
        })
      });

      const data = await response.json();
      console.log("Resposta do webhook:", data);

      if (!response.ok) {
        throw new Error("Erro na resposta do servidor");
      }

      return data;
    } catch (error) {
      console.error("Erro ao atualizar modo do bot:", error);
      throw new Error("Falha ao atualizar modo: " + error.message);
    }
  }

  static async updateSheet(numero, modo) {
    const url = `${this.BASE_URL}/Key/${numero}`;
    return this.makeRequest(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ modo })
    });
  }
}

export default APIManager;
