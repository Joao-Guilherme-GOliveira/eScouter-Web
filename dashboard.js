// eScouter — Dashboard (admin)
// Lê e grava direto na coleção "usuarios" do Firestore,
// filtrando por tipoUsuario ("Atleta" ou "Clube/Olheiro").

import { db } from "./firebase-init.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const ENTIDADES = {
  atletas: {
    tipoUsuario: "Atleta",
    label: "Atleta",
    colunas: [
      ["Nome", "nome"],
      ["Idade", "idade"],
      ["Cidade", "cidade"],
      ["Estado", "estado"],
      ["Posição", "posicao"]
    ],
    campos: [
      { chave: "nome", label: "Nome" },
      { chave: "dataNascimento", label: "Data de Nascimento (DD/MM/AAAA)", linha: 1 },
      { chave: "cidade", label: "Cidade", linha: 1 },
      { chave: "estado", label: "Estado", linha: 2 },
      { chave: "posicao", label: "Posição", linha: 2 },
      { chave: "email", label: "Email", linha: 3 },
      { chave: "telefone", label: "Telefone", linha: 3 },
      { chave: "altura", label: "Altura (cm)", linha: 4 },
      { chave: "peso", label: "Peso (kg)", linha: 4 },
      { chave: "experiencia", label: "Experiência" },
      { chave: "descricao", label: "Descrição" }
    ],
    registros: [],
    carregando: true
  },
  clubes: {
    tipoUsuario: "Clube/Olheiro",
    label: "Clube",
    colunas: [
      ["Nome", "nome"],
      ["Cidade", "cidade"],
      ["Estado", "estado"],
      ["CNPJ", "cnpj"]
    ],
    campos: [
      { chave: "nome", label: "Nome do Clube" },
      { chave: "dataNascimento", label: "Data de Fundação (DD/MM/AAAA)", linha: 1 },
      { chave: "cidade", label: "Cidade", linha: 1 },
      { chave: "estado", label: "Estado", linha: 2 },
      { chave: "cnpj", label: "CNPJ", linha: 2 },
      { chave: "email", label: "Email", linha: 3 },
      { chave: "telefone", label: "Telefone", linha: 3 },
      { chave: "descricao", label: "Descrição" }
    ],
    registros: [],
    carregando: true
  }
};

let entidadeAtual = "atletas";
let idParaExcluir = null;
let idEmEdicao = null;

const tableHead = document.getElementById("table-head");
const tableBody = document.getElementById("table-body");
const btnNovo = document.getElementById("btn-novo");
const statCards = document.querySelectorAll(".stat-card");

const formModal = document.getElementById("form-modal");
const formModalTitle = document.getElementById("form-modal-title");
const entityForm = document.getElementById("entity-form");

const deleteModal = document.getElementById("delete-modal");
const deleteText = document.getElementById("delete-text");
const btnCancelarExcluir = document.getElementById("btn-cancelar-excluir");
const btnConfirmarExcluir = document.getElementById("btn-confirmar-excluir");

// --- Utilidades ---

function calcularIdade(dataNascimentoStr) {
  if (!dataNascimentoStr) return "—";
  const partes = dataNascimentoStr.split("/").map(Number);
  const [dia, mes, ano] = partes;
  if (!dia || !mes || !ano) return "—";

  const hoje = new Date();
  const nascimento = new Date(ano, mes - 1, dia);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade;
}

function formatarDataHoje() {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${hoje.getFullYear()}`;
}

// --- Renderização ---

function renderContadores() {
  document.getElementById("count-atletas").textContent = ENTIDADES.atletas.registros.length;
  document.getElementById("count-clubes").textContent = ENTIDADES.clubes.registros.length;
}

function renderTabela() {
  const cfg = ENTIDADES[entidadeAtual];

  tableHead.innerHTML =
    "<tr>" +
    cfg.colunas.map(([label]) => `<th>${label}</th>`).join("") +
    "<th>Ações</th></tr>";

  if (cfg.carregando) {
    tableBody.innerHTML = `<tr><td colspan="${cfg.colunas.length + 1}">Carregando...</td></tr>`;
    return;
  }

  if (cfg.registros.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="${cfg.colunas.length + 1}">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  tableBody.innerHTML = cfg.registros
    .map((registro) => {
      const valores = cfg.colunas.map(([, chave]) => {
        if (chave === "idade") return calcularIdade(registro.dataNascimento);
        const valor = registro[chave];
        return valor === undefined || valor === "" ? "—" : valor;
      });

      return (
        "<tr>" +
        valores.map((v) => `<td>${v}</td>`).join("") +
        `<td class="row-actions">
          <button type="button" class="icon-btn edit" data-id="${registro.id}" aria-label="Editar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            </svg>
          </button>
          <button type="button" class="icon-btn delete" data-id="${registro.id}" aria-label="Excluir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </td>` +
        "</tr>"
      );
    })
    .join("");
}

function atualizarBotaoNovo() {
  btnNovo.textContent = `Novo ${ENTIDADES[entidadeAtual].label}`;
}

function trocarEntidade(entidade) {
  entidadeAtual = entidade;
  statCards.forEach((card) =>
    card.classList.toggle("active", card.dataset.entity === entidade)
  );
  atualizarBotaoNovo();
  renderTabela();
}

// --- Formulário (Adicionar / Alterar) ---

function construirFormulario(registro) {
  const cfg = ENTIDADES[entidadeAtual];
  entityForm.innerHTML = "";

  let linhaAberta = null;
  let linhaAtualId = null;

  cfg.campos.forEach((campo) => {
    const valor = registro && registro[campo.chave] !== undefined ? registro[campo.chave] : "";
    const campoHtml = `
      <div class="form-field">
        <label for="campo-${campo.chave}">${campo.label}</label>
        <input type="text" id="campo-${campo.chave}" name="${campo.chave}" value="${valor}">
      </div>`;

    if (campo.linha) {
      if (linhaAberta === null || campo.linha !== linhaAtualId) {
        linhaAberta = document.createElement("div");
        linhaAberta.className = "form-row";
        entityForm.appendChild(linhaAberta);
        linhaAtualId = campo.linha;
      }
      linhaAberta.insertAdjacentHTML("beforeend", campoHtml);
    } else {
      linhaAberta = null;
      linhaAtualId = null;
      entityForm.insertAdjacentHTML("beforeend", campoHtml);
    }
  });

  entityForm.insertAdjacentHTML(
    "beforeend",
    `<div class="modal-actions">
      <button type="button" class="btn-ghost" id="btn-cancelar-form">Cancelar</button>
      <button type="submit" class="btn-primary" id="btn-salvar-form">Salvar ${cfg.label}</button>
    </div>`
  );

  document
    .getElementById("btn-cancelar-form")
    .addEventListener("click", () => fecharModalForm());
}

function abrirModalForm(modo, registro) {
  idEmEdicao = registro ? registro.id : null;
  formModalTitle.textContent = `${modo} ${ENTIDADES[entidadeAtual].label}`;
  construirFormulario(registro);
  formModal.hidden = false;
}

function fecharModalForm() {
  idEmEdicao = null;
  formModal.hidden = true;
}

function abrirModalExcluir(id) {
  idParaExcluir = id;
  deleteText.textContent = `Você tem certeza que deseja excluir este ${ENTIDADES[entidadeAtual].label.toLowerCase()}? Essa ação não poderá ser desfeita.`;
  deleteModal.hidden = false;
}

function fecharModalExcluir() {
  idParaExcluir = null;
  deleteModal.hidden = true;
}

// --- Firestore: listeners em tempo real ---

function iniciarListener(entidadeKey) {
  const cfg = ENTIDADES[entidadeKey];
  const q = query(collection(db, "usuarios"), where("tipoUsuario", "==", cfg.tipoUsuario));

  onSnapshot(
    q,
    (snapshot) => {
      cfg.registros = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      cfg.carregando = false;
      renderContadores();
      if (entidadeAtual === entidadeKey) renderTabela();
    },
    (erro) => {
      console.error(`Erro ao carregar ${entidadeKey}:`, erro);
      cfg.carregando = false;
      renderTabela();
    }
  );
}

// --- Eventos ---

statCards.forEach((card) => {
  card.addEventListener("click", () => trocarEntidade(card.dataset.entity));
});

btnNovo.addEventListener("click", () => abrirModalForm("Adicionar", null));

tableBody.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".icon-btn.edit");
  const deleteBtn = e.target.closest(".icon-btn.delete");

  if (editBtn) {
    const id = editBtn.dataset.id;
    const registro = ENTIDADES[entidadeAtual].registros.find((r) => r.id === id);
    abrirModalForm("Alterar", registro);
  }

  if (deleteBtn) {
    abrirModalExcluir(deleteBtn.dataset.id);
  }
});

entityForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cfg = ENTIDADES[entidadeAtual];
  const valores = {};
  cfg.campos.forEach((campo) => {
    valores[campo.chave] = document.getElementById(`campo-${campo.chave}`).value;
  });

  const btnSalvar = document.getElementById("btn-salvar-form");
  btnSalvar.disabled = true;
  btnSalvar.textContent = "Salvando...";

  try {
    if (idEmEdicao !== null) {
      await updateDoc(doc(db, "usuarios", idEmEdicao), valores);
    } else {
      await addDoc(collection(db, "usuarios"), {
        ...valores,
        tipoUsuario: cfg.tipoUsuario,
        dataCadastro: formatarDataHoje(),
        midias: []
      });
    }
    fecharModalForm();
  } catch (erro) {
    console.error("Erro ao salvar:", erro);
    alert("Não foi possível salvar. Veja o console para detalhes.");
    btnSalvar.disabled = false;
    btnSalvar.textContent = `Salvar ${cfg.label}`;
  }
});

btnCancelarExcluir.addEventListener("click", fecharModalExcluir);

btnConfirmarExcluir.addEventListener("click", async () => {
  btnConfirmarExcluir.disabled = true;
  btnConfirmarExcluir.textContent = "Excluindo...";

  try {
    await deleteDoc(doc(db, "usuarios", idParaExcluir));
    fecharModalExcluir();
  } catch (erro) {
    console.error("Erro ao excluir:", erro);
    alert("Não foi possível excluir. Veja o console para detalhes.");
  } finally {
    btnConfirmarExcluir.disabled = false;
    btnConfirmarExcluir.textContent = "Excluir";
  }
});

[formModal, deleteModal].forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.hidden = true;
    }
  });
});

// --- Inicialização ---
atualizarBotaoNovo();
renderTabela();
iniciarListener("atletas");
iniciarListener("clubes");