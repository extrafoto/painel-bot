const SHEET_URL = "https://api.sheetbest.com/sheets/ec6ca1f8-de13-4cad-a4b1-1e1919ff5d48";

let contatosGlobais = [];

async function carregarContatos() {
  try {
    const res = await fetch(SHEET_URL);
    const dados = await res.json();
    contatosGlobais = dados;
    atualizarDashboard(dados);
    preencherCidades(dados);
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

  const filtroAtivo = document.querySelector(".filtros .ativo")?.dataset.filtro || "todos";
  const busca = document.getElementById("busca").value.toLowerCase();
  const cidadeSelecionada = document.getElementById("filtro-cidade").value;

  const filtrados = contatos.filter(c => {
    const emBusca = (c.Nome + c.numero).toLowerCase().includes(busca);
    const emFiltro = filtroAtivo === "todos" || c.modo === filtroAtivo;
    const emCidade = !cidadeSelecionada || c.Cidade === cidadeSelecionada;
    return emBusca && emFiltro && emCidade;
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
      <div><strong>Última Atualização:</strong> ${data}</div>
      <button class="${modo === "bot" ? "desligar" : "ligar"}" onclick="alternarModo('${numero}', '${modo === "bot" ? "humano" : "bot"}')">
        ${modo === "bot" ? "Desligar Bot" : "Ligar Bot"}
      </button>
    `;

    painel.appendChild(card);
  });

  totalContatos.textContent = contatos.length;
  botsAtivos.textContent = contatos.filter(c => c.modo === "bot").length;
  horaAtual.textContent = new Date().toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  atualizarGraficoCidades(filtrados);
}

function preencherCidades(contatos) {
  const select = document.getElementById("filtro-cidade");
  select.innerHTML = '<option value="">Todas as Cidades</option>';
  const cidades = [...new Set(contatos.map(c => c.Cidade).filter(Boolean))].sort();
  cidades.forEach(cidade => {
    const opt = document.createElement("option");
    opt.value = cidade;
    opt.textContent = cidade;
    select.appendChild(opt);
  });
}

function atualizarGraficoCidades(contatos) {
  const ctx = document.getElementById("grafico-cidades").getContext("2d");
  const contagem = {};
  contatos.forEach(c => {
    if (!c.Cidade) return;
    contagem[c.Cidade] = (contagem[c.Cidade] || 0) + 1;
  });
function atualizarDashboard(contatos) {
  // ...
  const cidadeSelecionada = document.getElementById("filtro-cidade").value;
  // Filtrados é o array filtrado já usado nos cards
  document.getElementById("contatos-cidade").textContent =
    cidadeSelecionada
      ? `Contatos em ${cidadeSelecionada}: ${filtrados.length}`
      : "";
  // ...
}

  const cidadesOrdenadas = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const labels = cidadesOrdenadas.map(c => c[0]);
  const data = cidadesOrdenadas.map(c => c[1]);

  if (window.grafico) window.grafico.destroy();
  window.grafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Contatos por Cidade",
        data,
        backgroundColor: "#007bff"
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Eventos
document.getElementById("busca").addEventListener("input", () => atualizarDashboard(contatosGlobais));
document.querySelectorAll(".filtro").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    atualizarDashboard(contatosGlobais);
  });
});
document.getElementById("btn-recarregar").addEventListener("click", () => carregarContatos());
document.getElementById("filtro-cidade").addEventListener("change", () => atualizarDashboard(contatosGlobais));

// Inicialização
carregarContatos();
setInterval(() => carregarContatos(), 15 * 60 * 1000);
