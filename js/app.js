function atualizarDashboard(contatos) {
  // Elementos
  const painel = document.getElementById("painel");
  const totalContatos = document.getElementById("total-contatos");
  const botsAtivos = document.getElementById("bots-ativos");
  const horaAtual = document.getElementById("hora-atual");
  const busca = document.getElementById("busca").value.toLowerCase();
  const filtroAtivo = document.querySelector(".filtro.ativo")?.dataset.filtro || "todos";
  const cidadeSelecionada = document.getElementById("filtro-cidade").value;
  const contatosCidade = document.getElementById("contatos-cidade");

  // Filtrar contatos
  const filtrados = contatos.filter(c => {
    const emBusca = (c.Nome + c.numero).toLowerCase().includes(busca);
    const emFiltro = filtroAtivo === "todos" || c.modo === filtroAtivo;
    const emCidade = !cidadeSelecionada || c.Cidade === cidadeSelecionada;
    return emBusca && emFiltro && emCidade;
  });

  // Exibir total de contatos filtrados por cidade
  contatosCidade.textContent = cidadeSelecionada
    ? `Contatos em ${cidadeSelecionada}: ${contatos.filter(c => c.Cidade === cidadeSelecionada).length}`
    : "";

  // Ordenação por data mais recente
  filtrados.sort((a, b) => {
    const parseData = (str) => {
      if (!str || str.toLowerCase() === "nunca") return new Date(0);
      const [data, hora] = str.split(" ");
      const [dia, mes, ano] = data.split("/");
      return new Date(`${ano}-${mes}-${dia}T${hora || "00:00"}`);
    };
    return parseData(b.timestamp_ultima) - parseData(a.timestamp_ultima);
  });

  // Render cards
  painel.innerHTML = "";
  filtrados.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${c.Nome || "Sem Nome"}</h3>
      <small>📱 ${c.numero || "Sem número"}</small><br>
      <div><span>🗺️ ${c.Cidade || "Indefinida"}</span></div>
      <div class="mensagem"><strong>💬 Última mensagem:</strong> ${c.mensagem_ultima || "Sem mensagem"}</div>
      <div class="status ${c.modo === "bot" ? "bot" : "humano"}">
        ${c.modo === "bot" ? "BOT ATIVO" : "BOT DESLIGADO"}
      </div>
      <div><strong>Modo Atual:</strong> ${c.modo === "bot" ? "bot" : "humano"}</div>
      <div><strong>Última Atualização:</strong> ${c.timestamp_ultima || "Nunca"}</div>
      <button class="${c.modo === "bot" ? "desligar" : "ligar"}" onclick="alternarModo('${c.numero}', '${c.modo === "bot" ? "humano" : "bot"}')">
        ${c.modo === "bot" ? "Desligar Bot" : "Ligar Bot"}
      </button>
    `;
    painel.appendChild(card);
  });

  // Totais
  totalContatos.textContent = contatos.length;
  botsAtivos.textContent = contatos.filter(c => c.modo === "bot").length;
  horaAtual.textContent = new Date().toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  atualizarGraficoCidades(filtrados);
}
