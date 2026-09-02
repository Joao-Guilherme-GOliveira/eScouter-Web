// eScouter — autenticação da tela de login (Área Administrativa)

import { auth } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const form = document.getElementById("login-form");
const errorBox = document.getElementById("login-error");
const submitBtn = form.querySelector(".btn-entrar");

const mensagensErro = {
  "auth/invalid-email": "Email inválido.",
  "auth/user-not-found": "Email ou senha incorretos.",
  "auth/wrong-password": "Email ou senha incorretos.",
  "auth/invalid-credential": "Email ou senha incorretos.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo."
};

function mostrarErro(codigo) {
  errorBox.textContent = mensagensErro[codigo] || "Não foi possível entrar. Tente novamente.";
  errorBox.hidden = false;
}

function esconderErro() {
  errorBox.hidden = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  esconderErro();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Entrando...";

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "dashboard.html";
  } catch (erro) {
    mostrarErro(erro.code);
    submitBtn.disabled = false;
    submitBtn.textContent = "Entrar";
  }
});