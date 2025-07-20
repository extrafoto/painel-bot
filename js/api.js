const APIManager = {
  apiKey: "AIzaSyCr_GlRIXzldcsamu_qfxE5DO69HspfcRw",
  spreadsheetId: "COLE_AQUI_SEU_SPREADSHEET_ID", // exemplo: 1aBcD123xYz
  sheetRange: "Sheet1!A1:H100", // ajuste conforme seu layout

  async getContacts() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetRange}?key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      const json = await response.json();

      const rows = json.values || [];
      const headers = rows[0];
      const contatos = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || "";
        });
        return obj;
      });

      return contatos;
    } catch (error) {
      console.error("Erro ao carregar dados da planilha:", error);
      return [];
    }
  }
};

export default APIManager;
