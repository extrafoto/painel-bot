
function validarSenha() {
  const senha = document.getElementById("senha").value;
  const painel = document.getElementById("painel");
  const erro = document.getElementById("mensagemErro");

  if (senha === "1234") {
    document.getElementById("loginModal").style.display = "none";
    painel.classList.remove("hidden");
  } else {
    erro.textContent = "Senha incorreta.";
  }
}
