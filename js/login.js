document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("loginModal");
  const senhaInput = document.getElementById("senha");
  const btnEntrar = document.getElementById("btnEntrar");
  const senhaCorreta = "1234"; // Altere aqui se quiser

  modal.style.display = "flex";

  btnEntrar.addEventListener("click", function () {
    if (senhaInput.value === senhaCorreta) {
      modal.style.display = "none";
      carregarPainel(); // função que carrega o app
    } else {
      alert("Senha incorreta");
    }
  });
});
