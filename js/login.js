document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("loginModal");
  const senhaInput = document.getElementById("senha");
  const btnEntrar = document.getElementById("btnEntrar");
  const senhaCorreta = "1234"; // você pode mudar aqui

  modal.style.display = "flex"; // força o login aparecer

  btnEntrar.addEventListener("click", function () {
    const senhaDigitada = senhaInput.value;

    if (senhaDigitada === senhaCorreta) {
      modal.style.display = "none"; // oculta o modal
      document.body.classList.remove("bloqueado"); // libera o scroll, se tiver
      carregarPainel(); // CHAMA a função para iniciar o painel
    } else {
      alert("Senha incorreta!");
    }
  });
});
