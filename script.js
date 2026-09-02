// eScouter — interações da tela de login
// (a validação/autenticação real com Firebase entra aqui depois)

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".toggle-senha");
  const senhaInput = document.getElementById("senha");

  if (toggleBtn && senhaInput) {
    toggleBtn.addEventListener("click", () => {
      const mostrando = senhaInput.type === "text";
      senhaInput.type = mostrando ? "password" : "text";
      toggleBtn.setAttribute("aria-pressed", String(!mostrando));
      toggleBtn.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
    });
  }
});