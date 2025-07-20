
const SHEET_URL = "https://api.sheetbest.com/sheets/ec6ca1f8-de13-4cad-a4b1-1e1919ff5d48";

async function carregarContatos() {
  const res = await fetch(SHEET_URL);
  const dados = await res.json();
  const painel = document.getElementById("painel");
  painel.innerHTML = "";

  dados.forEach(contato => {
    const nome = contato.Nome || "Sem nome";
    const numero = contato.numero || "Sem número";
    const modo = contato.modo === "bot" ? "bot" : "humano";
    const novoModo = modo === "bot" ? "humano" : "bot";
    const data = contato.timestamp_ultima || "Sem data";

    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="info"><strong>Nome:</strong> ${nome}</div>
      <div class="info"><strong>Telefone:</strong> ${numero}</div>
      <div class="info"><strong>Data da Conversa:</strong> ${data}</div>
      <div class="info">
        <button class="${modo === 'bot' ? 'off' : ''}" onclick="alternarModo('${numero}', '${novoModo}')">
          ${modo === 'bot' ? 'Desligar Bot' : 'Ligar Bot'}
        </button>
      </div>
    `;
    painel.appendChild(div);
  });
}

async function alternarModo(numero, novoModo) {
  try {
    const patchUrl = `${SHEET_URL}/numero/${numero}`;
    const response = await fetch(patchUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ modo: novoModo })
    });

    const data = await response.json();
    console.log("Atualização realizada:", data);
    await carregarContatos();
  } catch (error) {
    console.error("Erro ao atualizar o modo no SheetBest:", error);
  }
}

carregarContatos();
