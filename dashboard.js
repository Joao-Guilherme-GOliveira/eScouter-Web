// eScouter — Dashboard (admin)
// Dados de exemplo por enquanto — entram via Firestore depois.

const dados = {
  atletas: {
    label: "Atleta",
    labelPlural: "Atletas",
    colunas: [
      ["Atletas", "nome"],
      ["ID", "id"],
      ["Idade", "idade"],
      ["Clube", "clube"],
      ["Cidade", "cidade"],
      ["Posição", "posicao"]
    ],
    campos: [
      { chave: "nome", label: "Nome", tipo: "text" },
      { chave: "idade", label: "Idade", tipo: "number", linha: 1 },
      { chave: "cidade", label: "Cidade", tipo: "text", linha: 1 },
      { chave: "posicao", label: "Posição", tipo: "text" },
      { chave: "clube", label: "Clube", tipo: "text" }
    ],
    registros: [
      { id: 1, nome: "Joao Braw", idade: 17, clube: "S/T", cidade: "Cariacica-ES", posicao: "Zagueiro" },
      { id: 2, nome: "Danilo", idade: 18, clube: "Serrão", cidade: "Serra-ES", posicao: "Atacante" },
      { id: 3, nome: "Fillipy Magrão", idade: 18, clube: "Fluminense", cidade: "Novo Horizonte-ES", posicao: "MC" },
      { id: 4, nome: "Pablo Nistal", idade: 18, clube: "União FC", cidade: "Vitória-ES", posicao: "MC" },
      { id: 5, nome: "Yan Hashirama", idade: 16, clube: "IFES-Serra", cidade: "Vitória-ES", posicao: "VOL" },
      { id: 6, nome: "Pedro Sousa", idade: 19, clube: "S/T", cidade: "Cariacica-ES", posicao: "ZAG" },
      { id: 7, nome: "Davi Belz", idade: 18, clube: "S/T", cidade: "Serra-ES", posicao: "LE" }
    ]
  },
  clubes: {
    label: "Clube",
    labelPlural: "Clubes",
    colunas: [
      ["Clubes", "nome"],
      ["ID", "id"],
      ["Fundação", "fundacao"],
      ["Atletas", "atletas"],
      ["Cidade", "cidade"],
      ["Categoria", "categoria"]
    ],
    campos: [
      { chave: "nome", label: "Nome do Clube", tipo: "text" },
      { chave: "fundacao", label: "Fundação", tipo: "number", linha: 1 },
      { chave: "cidade", label: "Cidade", tipo: "text", linha: 1 },
      { chave: "atletas", label: "Atletas", tipo: "number" },
      { chave: "categoria", label: "Categoria", tipo: "text" }
    ],
    registros: [
      { id: 1, nome: "IFES Serra", fundacao: 2024, atletas: 15, cidade: "Serra-ES", categoria: "Escolar" },
      { id: 2, nome: "União FC", fundacao: 2015, atletas: 40, cidade: "Vitoria-ES", categoria: "Amador" },
      { id: 3, nome: "IFES Vix", fundacao: 2010, atletas: 20, cidade: "Vitória-ES", categoria: "Escolar" },
      { id: 4, nome: "Rio Branco", fundacao: 1913, atletas: 80, cidade: "Cariacica-ES", categoria: "Profissional" },
      { id: 5, nome: "Porto Vitória", fundacao: 2014, atletas: 67, cidade: "Serra-ES", categoria: "Profissional" },
      { id: 6, nome: "Bons Amigos FC", fundacao: 2019, atletas: 12, cidade: "Serra-ES", categoria: "Amador" },
      { id: 7, nome: "Álvares Cabral", fundacao: 1902, atletas: 42, cidade: "Vitória-ES", categoria: "Amador" }
    ]
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

function renderContadores() {
  document.getElementById("count-atletas").textContent = dados.atletas.registros.length;
  document.getElementById("count-clubes").textContent = dados.clubes.registros.length;
}

function renderTabela() {
  const cfg = dados[entidadeAtual];

  tableHead.innerHTML =
    "<tr>" +
    cfg.colunas.map(([label]) => `<th>${label}</th>`).join("") +
    "<th>Ações</th></tr>";

  tableBody.innerHTML = cfg.registros
    .map((registro) => {
      const valores = cfg.colunas.map(([, chave]) => registro[chave]);

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
  btnNovo.textContent = `Novo ${dados[entidadeAtual].label}`;
}

function trocarEntidade(entidade) {
  entidadeAtual = entidade;
  statCards.forEach((card) =>
    card.classList.toggle("active", card.dataset.entity === entidade)
  );
  atualizarBotaoNovo();
  renderTabela();
}

function construirFormulario(registro) {
  const cfg = dados[entidadeAtual];
  entityForm.innerHTML = "";

  let linhaAberta = null;

  cfg.campos.forEach((campo) => {
    const valor = registro ? registro[campo.chave] : "";
    const campoHtml = `
      <div class="form-field">
        <label for="campo-${campo.chave}">${campo.label}</label>
        <input type="${campo.tipo}" id="campo-${campo.chave}" name="${campo.chave}" value="${valor}">
      </div>`;

    if (campo.linha) {
      if (!linhaAberta) {
        linhaAberta = document.createElement("div");
        linhaAberta.className = "form-row";
        entityForm.appendChild(linhaAberta);
      }
      linhaAberta.insertAdjacentHTML("beforeend", campoHtml);
    } else {
      linhaAberta = null;
      entityForm.insertAdjacentHTML("beforeend", campoHtml);
    }
  });

  entityForm.insertAdjacentHTML(
    "beforeend",
    `<div class="modal-actions">
      <button type="button" class="btn-ghost" id="btn-cancelar-form">Cancelar</button>
      <button type="submit" class="btn-primary">Salvar ${dados[entidadeAtual].label}</button>
    </div>`
  );

  document
    .getElementById("btn-cancelar-form")
    .addEventListener("click", () => fecharModalForm());
}

function abrirModalForm(modo, registro) {
  idEmEdicao = registro ? registro.id : null;
  formModalTitle.textContent = `${modo} ${dados[entidadeAtual].label}`;
  construirFormulario(registro);
  formModal.hidden = false;
}

function fecharModalForm() {
  idEmEdicao = null;
  formModal.hidden = true;
}

function abrirModalExcluir(id) {
  idParaExcluir = id;
  deleteText.textContent = `Você tem certeza que deseja excluir este ${dados[entidadeAtual].label.toLowerCase()}? Essa ação não poderá ser desfeita.`;
  deleteModal.hidden = false;
}

function fecharModalExcluir() {
  idParaExcluir = null;
  deleteModal.hidden = true;
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
    const id = Number(editBtn.dataset.id);
    const registro = dados[entidadeAtual].registros.find((r) => r.id === id);
    abrirModalForm("Alterar", registro);
  }

  if (deleteBtn) {
    abrirModalExcluir(Number(deleteBtn.dataset.id));
  }
});

entityForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const cfg = dados[entidadeAtual];
  const valores = {};

  cfg.campos.forEach((campo) => {
    const input = document.getElementById(`campo-${campo.chave}`);
    valores[campo.chave] = campo.tipo === "number"
      ? Number(input.value)
      : input.value;
  });

  if (idEmEdicao !== null) {
    // Alterar: encontra o registro existente e sobrescreve os campos editados
    const registro = cfg.registros.find((r) => r.id === idEmEdicao);
    Object.assign(registro, valores);
  } else {
    // Adicionar: cria um novo registro com o próximo id disponível
    const proximoId = cfg.registros.length
      ? Math.max(...cfg.registros.map((r) => r.id)) + 1
      : 1;
    cfg.registros.push({ id: proximoId, ...valores });
  }

  renderContadores();
  renderTabela();
  fecharModalForm();
});

btnCancelarExcluir.addEventListener("click", fecharModalExcluir);

btnConfirmarExcluir.addEventListener("click", () => {
  const cfg = dados[entidadeAtual];
  cfg.registros = cfg.registros.filter((r) => r.id !== idParaExcluir);
  renderContadores();
  renderTabela();
  fecharModalExcluir();
});

[formModal, deleteModal].forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.hidden = true;
    }
  });
});

// --- Inicialização ---
renderContadores();
atualizarBotaoNovo();
renderTabela();