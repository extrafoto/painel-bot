const SHEET_URL = "https://api.sheetbest.com/sheets/ec6ca1f8-de13-4cad-a4b1-1e1919ff5d48";

let contatosGlobais = [];

async function carregarContatos() {
  try {
    const res = await fetch(SHEET_URL);
    const dados = await res.json();
    contatosGlobais = dados;
    atualizarDashboard(dados);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}

function atualizarDashboard(contatos) {
  const painel = document.getElementById("painel");
  const totalContatos = document.getElementById("total-contatos");
  const botsAtivos = document.getElementById("bots-ativos");
  const horaAtual = document.getElementById("hora-atual");

  painel.innerHTML = "";

  const filtroAtivo = document.querySelector(".filtros .ativo").dataset.filtro;
  const busca = document.getElementById("busca").value.toLowerCase();

  const filtrados = contatos.filter(c => {
    const emBusca = (c.Nome + c.numero).toLowerCase().includes(busca);
    const emFiltro = filtroAtivo === "todos" || c.modo === filtroAtivo;
    return emBusca && emFiltro;
  });

  filtrados.sort((a, b) => {
    const parseData = (str) => {
      if (!str || str.toLowerCase() === "nunca") return new Date(0);
      const [data, hora] = str.split(" ");
      const [dia, mes, ano] = data.split("/");
      return new Date(`${ano}-${mes}-${dia}T${hora || "00:00"}`);
    };

    return parseData(b.timestamp_ultima) - parseData(a.timestamp_ultima);
  });

  filtrados.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";

    const nome = c.Nome || "Sem Nome";
    const numero = c.numero || "Sem número";
    const modo = c.modo === "bot" ? "bot" : "humano";
    const data = c.timestamp_ultima || "Nunca";
    const mensagem = c.mensagem_ultima || "Sem mensagem";
    const cidade = c.Cidade || "Indefinida";

    card.innerHTML = `
      <h3>${nome}</h3>
      <small>📱 ${numero}</small><br>
      <div><span>🗺️ ${cidade}</span></div>
      <div class="mensagem"><strong>💬 Última mensagem:</strong> ${mensagem}</div>
      <div class="status ${modo}">${modo === "bot" ? "BOT ATIVO" : "BOT DESLIGADO"}</div>
      <div><strong>Modo Atual:</strong> ${modo}</div>
      <button class="${modo === "bot" ? "desligar" : "ligar"}" onclick="alternarModo('${numero}', '${modo === "bot" ? "humano" : "bot"}')">
        ${modo === "bot" ? "Desligar Bot" : "Ligar Bot"}
      </button>
    `;

    painel.appendChild(card);
  });

  totalContatos.textContent = contatos.length;
  botsAtivos.textContent = contatos.filter(c => c.modo === "bot").length;
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  const hora = String(agora.getHours()).padStart(2, '0');
  const min = String(agora.getMinutes()).padStart(2, '0');
  horaAtual.textContent = `${dia}/${mes}/${ano} ${hora}:${min}`;
}

async function alternarModo(numero, novoModo) {
  try {
    const patchUrl = `${SHEET_URL}/numero/${numero}`;
    await fetch(patchUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modo: novoModo })
    });

    await carregarContatos();
  } catch (error) {
    console.error("Erro ao alternar modo:", error);
  }
}

document.getElementById("busca").addEventListener("input", () => atualizarDashboard(contatosGlobais));

document.querySelectorAll(".filtro").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    atualizarDashboard(contatosGlobais);
  });
});

document.getElementById("btn-recarregar").addEventListener("click", () => carregarContatos());

carregarContatos();

// Atualização automática a cada 15 minutos
setInterval(() => {
  console.log("Atualizando automaticamente...");
  carregarContatos();
}, 15 * 60 * 1000);
