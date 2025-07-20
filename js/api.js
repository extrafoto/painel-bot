// api.js

const SPREADSHEET_ID = "1qDTH5FdDF2w6p76F5rOfxwmrKFY8_xS6IdVPnmpOa_k";
const API_KEY = "AIzaSyCr_GlRIXzldcsamu_qfxE5DO69HspfcRw";
const SHEET_NAME = "Sheet1";

const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:H100?key=${API_KEY}`;

async function getContacts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Erro ao buscar dados do Google Sheets");

    const data = await response.json();
    const [header, ...rows] = data.values;

    // Mapeia os dados em objetos com base no cabeçalho
    const contatos = rows.map((row) => {
      const obj = {};
      header.forEach((key, index) => {
        obj[key] = row[index] || "";
      });
      return obj;
    });

    return contatos;
  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
    return [];
  }
}

export default {
  getContacts
};
