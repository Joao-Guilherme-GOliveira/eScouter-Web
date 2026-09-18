import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  doc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
  app,
  db
} from "./firebase-init.js";


// ======================================================
// FIREBASE SECUNDÁRIO
// ======================================================
// Usado somente para criar as contas dos atletas.
// Assim, o ADMIN continua logado no site.
// ======================================================

const adminApp = initializeApp(
  app.options,
  "adminUserCreation"
);

const adminAuth = getAuth(adminApp);


// ======================================================
// DADOS
// ======================================================

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

    // Os campos dos atletas agora são
    // construídos manualmente em construirFormulario()
    campos: [],

    // Os atletas serão carregados do Firestore
    registros: []
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
      {
        chave: "nome",
        label: "Nome do Clube",
        tipo: "text"
      },

      {
        chave: "fundacao",
        label: "Fundação",
        tipo: "number",
        linha: 1
      },

      {
        chave: "cidade",
        label: "Cidade",
        tipo: "text",
        linha: 1
      },

      {
        chave: "atletas",
        label: "Atletas",
        tipo: "number"
      },

      {
        chave: "categoria",
        label: "Categoria",
        tipo: "text"
      }
    ],

    // Clubes continuam como estavam
    registros: [
      {
        id: 1,
        nome: "IFES Serra",
        fundacao: 2024,
        atletas: 15,
        cidade: "Serra-ES",
        categoria: "Escolar"
      },

      {
        id: 2,
        nome: "União FC",
        fundacao: 2015,
        atletas: 40,
        cidade: "Vitoria-ES",
        categoria: "Amador"
      },

      {
        id: 3,
        nome: "IFES Vix",
        fundacao: 2010,
        atletas: 20,
        cidade: "Vitória-ES",
        categoria: "Escolar"
      },

      {
        id: 4,
        nome: "Rio Branco",
        fundacao: 1913,
        atletas: 80,
        cidade: "Cariacica-ES",
        categoria: "Profissional"
      },

      {
        id: 5,
        nome: "Porto Vitória",
        fundacao: 2014,
        atletas: 67,
        cidade: "Serra-ES",
        categoria: "Profissional"
      },

      {
        id: 6,
        nome: "Bons Amigos FC",
        fundacao: 2019,
        atletas: 12,
        cidade: "Serra-ES",
        categoria: "Amador"
      },

      {
        id: 7,
        nome: "Álvares Cabral",
        fundacao: 1902,
        atletas: 42,
        cidade: "Vitória-ES",
        categoria: "Amador"
      }
    ]
  }
};


// ======================================================
// VARIÁVEIS
// ======================================================

let entidadeAtual = "atletas";

let idParaExcluir = null;

let idEmEdicao = null;


// ======================================================
// ELEMENTOS
// ======================================================

const tableHead =
  document.getElementById("table-head");

const tableBody =
  document.getElementById("table-body");

const btnNovo =
  document.getElementById("btn-novo");

const statCards =
  document.querySelectorAll(".stat-card");

const formModal =
  document.getElementById("form-modal");

const formModalTitle =
  document.getElementById("form-modal-title");

const entityForm =
  document.getElementById("entity-form");

const deleteModal =
  document.getElementById("delete-modal");

const deleteText =
  document.getElementById("delete-text");

const btnCancelarExcluir =
  document.getElementById("btn-cancelar-excluir");

const btnConfirmarExcluir =
  document.getElementById("btn-confirmar-excluir");


// ======================================================
// CONTADORES
// ======================================================

function renderContadores() {

  document.getElementById(
    "count-atletas"
  ).textContent =
    dados.atletas.registros.length;


  document.getElementById(
    "count-clubes"
  ).textContent =
    dados.clubes.registros.length;
}


// ======================================================
// TABELA
// ======================================================

function renderTabela() {

  const cfg =
    dados[entidadeAtual];


  tableHead.innerHTML =
    "<tr>" +

    cfg.colunas
      .map(
        ([label]) =>
          `<th>${label}</th>`
      )
      .join("") +

    "<th>Ações</th>" +

    "</tr>";


  tableBody.innerHTML =
    cfg.registros

      .map((registro) => {

        const valores =
          cfg.colunas.map(
            ([, chave]) => {

              // Clube não existe no Usuario.kt.
              // Portanto mostramos S/T.
              if (
                entidadeAtual === "atletas" &&
                chave === "clube"
              ) {
                return registro[chave] ?? "S/T";
              }

              return registro[chave] ?? "";
            }
          );


        return (

          "<tr>" +

          valores
            .map(
              (v) =>
                `<td>${v}</td>`
            )
            .join("") +

          `<td class="row-actions">

            <button
              type="button"
              class="icon-btn edit"
              data-id="${registro.id}"
              aria-label="Editar">

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <path
                  d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"/>

              </svg>

            </button>


            <button
              type="button"
              class="icon-btn delete"
              data-id="${registro.id}"
              aria-label="Excluir">

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">

                <path
                  d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>

              </svg>

            </button>

          </td>` +

          "</tr>"
        );

      })

      .join("");
}


// ======================================================
// BOTÃO NOVO
// ======================================================

function atualizarBotaoNovo() {

  btnNovo.textContent =
    `Novo ${dados[entidadeAtual].label}`;
}


// ======================================================
// TROCAR ENTIDADE
// ======================================================

function trocarEntidade(entidade) {

  entidadeAtual = entidade;


  statCards.forEach((card) => {

    card.classList.toggle(
      "active",
      card.dataset.entity === entidade
    );

  });


  atualizarBotaoNovo();

  renderTabela();
}


// ======================================================
// CONSTRUIR FORMULÁRIO
// ======================================================

function construirFormulario(registro) {

  const cfg =
    dados[entidadeAtual];


  entityForm.innerHTML = "";


  // ==================================================
  // FORMULÁRIO DE ATLETA
  // ==================================================

  if (entidadeAtual === "atletas") {

    entityForm.innerHTML = `

      <div class="form-field">

        <label for="campo-nome">
          Nome
        </label>

        <input
          type="text"
          id="campo-nome"
          value="${registro?.nome ?? ""}"
          required>

      </div>


      <div class="form-field">

        <label for="campo-email">
          E-mail
        </label>

        <input
          type="email"
          id="campo-email"
          value="${registro?.email ?? ""}"
          ${registro ? "readonly" : ""}
          required>

      </div>


      ${
        registro
          ? ""
          : `

            <div class="form-field">

              <label for="campo-senha">
                Senha
              </label>

              <input
                type="password"
                id="campo-senha"
                minlength="6"
                required>

            </div>

          `
      }


      <div class="form-row">

        <div class="form-field">

          <label for="campo-dataNascimento">
            Data de nascimento
          </label>

          <input
            type="date"
            id="campo-dataNascimento"
            value="${registro?.dataNascimento ?? ""}"
            required>

        </div>


        <div class="form-field">

          <label for="campo-cidade">
            Cidade
          </label>

          <input
            type="text"
            id="campo-cidade"
            value="${registro?.cidade ?? ""}"
            required>

        </div>

      </div>


      <div class="form-row">

        <div class="form-field">

          <label for="campo-estado">
            Estado
          </label>

          <input
            type="text"
            id="campo-estado"
            value="${registro?.estado ?? ""}"
            required>

        </div>


        <div class="form-field">

          <label for="campo-posicao">
            Posição
          </label>

          <input
            type="text"
            id="campo-posicao"
            value="${registro?.posicao ?? ""}"
            required>

        </div>

      </div>


      <div class="modal-actions">

        <button
          type="button"
          class="btn-ghost"
          id="btn-cancelar-form">

          Cancelar

        </button>


        <button
          type="submit"
          class="btn-primary">

          Salvar Atleta

        </button>

      </div>

    `;


    document
      .getElementById(
        "btn-cancelar-form"
      )
      .addEventListener(
        "click",
        fecharModalForm
      );


    return;
  }


  // ==================================================
  // FORMULÁRIO DE CLUBE
  // ==================================================

  let linhaAberta = null;


  cfg.campos.forEach((campo) => {

    const valor =
      registro
        ? registro[campo.chave]
        : "";


    const campoHtml = `

      <div class="form-field">

        <label
          for="campo-${campo.chave}">

          ${campo.label}

        </label>


        <input
          type="${campo.tipo}"
          id="campo-${campo.chave}"
          name="${campo.chave}"
          value="${valor}">

      </div>

    `;


    if (campo.linha) {

      if (!linhaAberta) {

        linhaAberta =
          document.createElement("div");

        linhaAberta.className =
          "form-row";

        entityForm.appendChild(
          linhaAberta
        );
      }


      linhaAberta.insertAdjacentHTML(
        "beforeend",
        campoHtml
      );

    } else {

      linhaAberta = null;

      entityForm.insertAdjacentHTML(
        "beforeend",
        campoHtml
      );
    }

  });
}


// ======================================================
// CALCULAR IDADE
// ======================================================

function calcularIdade(dataNascimento) {

  if (!dataNascimento) {
    return "";
  }


  const nascimento =
    new Date(
      `${dataNascimento}T00:00:00`
    );


  const hoje =
    new Date();


  let idade =
    hoje.getFullYear() -
    nascimento.getFullYear();


  const mes =
    hoje.getMonth() -
    nascimento.getMonth();


  if (
    mes < 0 ||
    (
      mes === 0 &&
      hoje.getDate() <
      nascimento.getDate()
    )
  ) {

    idade--;

  }


  return idade;
}


// ======================================================
// CARREGAR ATLETAS DO FIRESTORE
// ======================================================

async function carregarAtletas() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "usuarios"
        )
      );


    dados.atletas.registros =
      snapshot.docs

        .filter((documento) => {

          const usuario =
            documento.data();

          return (
            usuario.tipoUsuario ===
            "Atleta"
          );

        })


        .map((documento) => {

          const usuario =
            documento.data();


          return {

            id:
              documento.id,

            nome:
              usuario.nome ?? "",

            email:
              usuario.email ?? "",

            dataNascimento:
              usuario.dataNascimento ?? "",

            idade:
              calcularIdade(
                usuario.dataNascimento
              ),

            cidade:
              usuario.cidade ?? "",

            posicao:
              usuario.posicao ?? "",

            // Não existe no Usuario.kt.
            clube:
              "S/T"

          };

        });


    renderContadores();

    renderTabela();


  } catch (erro) {

    console.error(
      "Erro ao carregar atletas:",
      erro
    );


    alert(
      "Erro ao carregar os atletas."
    );

  }
}


// ======================================================
// CRIAR ATLETA NO FIREBASE
// ======================================================

async function criarAtletaFirebase() {

  const nome =
    document
      .getElementById("campo-nome")
      .value
      .trim();


  const email =
    document
      .getElementById("campo-email")
      .value
      .trim();


  const senha =
    document
      .getElementById("campo-senha")
      .value;


  const dataNascimento =
    document
      .getElementById(
        "campo-dataNascimento"
      )
      .value;


  const estado =
    document
      .getElementById("campo-estado")
      .value
      .trim();


  const cidade =
    document
      .getElementById("campo-cidade")
      .value
      .trim();


  const posicao =
    document
      .getElementById("campo-posicao")
      .value
      .trim();


  if (
    !nome ||
    !email ||
    !senha ||
    !dataNascimento ||
    !estado ||
    !cidade ||
    !posicao
  ) {

    alert(
      "Preencha todos os campos."
    );

    return;
  }


  if (senha.length < 6) {

    alert(
      "A senha deve ter pelo menos 6 caracteres."
    );

    return;
  }


  try {

    // ============================================
    // CRIA CONTA NO AUTHENTICATION
    // ============================================

    const resultado =
      await createUserWithEmailAndPassword(
        adminAuth,
        email,
        senha
      );


    const usuario =
      resultado.user;


    const uid =
      usuario.uid;


    // ============================================
    // CRIA DOCUMENTO NO FIRESTORE
    // ============================================

    await setDoc(
      doc(
        db,
        "usuarios",
        uid
      ),
      {

        nome:

          nome,

        email:

          email,

        dataNascimento:

          dataNascimento,

        estado:

          estado,

        cidade:

          cidade,

        tipoUsuario:

          "Atleta",

        posicao:

          posicao,

        peso:

          "",

        altura:

          "",

        experiencia:

          "",

        descricao:

          "",

        dataCadastro:

          new Date().toISOString(),

        cnpj:

          "",

        telefone:

          "",

        documento:

          "",

        midias:

          []

      }
    );


    // ============================================
    // DESLOGA A AUTENTICAÇÃO SECUNDÁRIA
    // ============================================

    await signOut(adminAuth);


    alert(
      "Atleta criado com sucesso!"
    );


    fecharModalForm();


    await carregarAtletas();


  } catch (erro) {

    console.error(
      "Erro ao criar atleta:",
      erro
    );


    if (
      erro.code ===
      "auth/email-already-in-use"
    ) {

      alert(
        "Este e-mail já está cadastrado."
      );

    }

    else if (
      erro.code ===
      "auth/invalid-email"
    ) {

      alert(
        "O e-mail informado é inválido."
      );

    }

    else if (
      erro.code ===
      "auth/weak-password"
    ) {

      alert(
        "A senha deve ter pelo menos 6 caracteres."
      );

    }

    else {

      alert(
        "Erro ao criar atleta: " +
        erro.message
      );

    }

  }
}


// ======================================================
// EDITAR ATLETA NO FIRESTORE
// ======================================================

async function editarAtletaFirebase() {

  const uid =
    idEmEdicao;


  const nome =
    document
      .getElementById("campo-nome")
      .value
      .trim();


  const dataNascimento =
    document
      .getElementById(
        "campo-dataNascimento"
      )
      .value;


  const estado =
    document
      .getElementById("campo-estado")
      .value
      .trim();


  const cidade =
    document
      .getElementById("campo-cidade")
      .value
      .trim();


  const posicao =
    document
      .getElementById("campo-posicao")
      .value
      .trim();


  try {

    await updateDoc(
      doc(
        db,
        "usuarios",
        uid
      ),
      {

        nome:
          nome,

        dataNascimento:
          dataNascimento,

        estado:
          estado,

        cidade:
          cidade,

        posicao:
          posicao

      }
    );


    alert(
      "Atleta atualizado com sucesso!"
    );


    fecharModalForm();


    await carregarAtletas();


  } catch (erro) {

    console.error(
      "Erro ao editar atleta:",
      erro
    );


    alert(
      "Erro ao atualizar atleta."
    );

  }
}


// ======================================================
// ABRIR FORMULÁRIO
// ======================================================

function abrirModalForm(
  modo,
  registro
) {

  idEmEdicao =
    registro
      ? registro.id
      : null;


  formModalTitle.textContent =
    `${modo} ${dados[entidadeAtual].label}`;


  construirFormulario(
    registro
  );


  formModal.hidden = false;
}


// ======================================================
// FECHAR FORMULÁRIO
// ======================================================

function fecharModalForm() {

  idEmEdicao = null;

  formModal.hidden = true;
}


// ======================================================
// ABRIR EXCLUSÃO
// ======================================================

function abrirModalExcluir(id) {

  idParaExcluir = id;


  deleteText.textContent =
    `Você tem certeza que deseja excluir este ${dados[entidadeAtual].label.toLowerCase()}? Essa ação não poderá ser desfeita.`;


  deleteModal.hidden = false;
}


// ======================================================
// FECHAR EXCLUSÃO
// ======================================================

function fecharModalExcluir() {

  idParaExcluir = null;

  deleteModal.hidden = true;
}


// ======================================================
// EVENTOS DOS CARDS
// ======================================================

statCards.forEach((card) => {

  card.addEventListener(
    "click",
    () => {

      trocarEntidade(
        card.dataset.entity
      );

    }
  );

});


// ======================================================
// BOTÃO NOVO
// ======================================================

btnNovo.addEventListener(
  "click",
  () => {

    abrirModalForm(
      "Adicionar",
      null
    );

  }
);


// ======================================================
// EDITAR / EXCLUIR
// ======================================================

tableBody.addEventListener(
  "click",
  (e) => {

    const editBtn =
      e.target.closest(
        ".icon-btn.edit"
      );


    const deleteBtn =
      e.target.closest(
        ".icon-btn.delete"
      );


    // ==========================================
    // EDITAR
    // ==========================================

    if (editBtn) {

      const id =
        editBtn.dataset.id;


      const registro =
        dados[
          entidadeAtual
        ].registros.find(
          (r) =>
            String(r.id) ===
            String(id)
        );


      if (registro) {

        abrirModalForm(
          "Alterar",
          registro
        );

      }

    }


    // ==========================================
    // EXCLUIR
    // ==========================================

    if (deleteBtn) {

      const id =
        deleteBtn.dataset.id;


      abrirModalExcluir(id);

    }

  }
);


// ======================================================
// SUBMIT DO FORMULÁRIO
// ======================================================

entityForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();


    // ==========================================
    // ATLETAS
    // ==========================================

    if (
      entidadeAtual === "atletas"
    ) {

      // NOVO ATLETA
      if (
        idEmEdicao === null
      ) {

        await criarAtletaFirebase();

      }

      // EDITAR ATLETA
      else {

        await editarAtletaFirebase();

      }


      return;
    }


    // ==========================================
    // CLUBES
    // ==========================================

    const cfg =
      dados[entidadeAtual];


    const valores = {};


    cfg.campos.forEach(
      (campo) => {

        const input =
          document.getElementById(
            `campo-${campo.chave}`
          );


        valores[campo.chave] =
          campo.tipo === "number"
            ? Number(input.value)
            : input.value;

      }
    );


    if (
      idEmEdicao !== null
    ) {

      const registro =
        cfg.registros.find(
          (r) =>
            r.id === idEmEdicao
        );


      Object.assign(
        registro,
        valores
      );

    }

    else {

      const proximoId =
        cfg.registros.length

          ? Math.max(
              ...cfg.registros.map(
                (r) => r.id
              )
            ) + 1

          : 1;


      cfg.registros.push({
        id:
          proximoId,

        ...valores
      });

    }


    renderContadores();

    renderTabela();

    fecharModalForm();

  }
);


// ======================================================
// CANCELAR EXCLUSÃO
// ======================================================

btnCancelarExcluir.addEventListener(
  "click",
  fecharModalExcluir
);


// ======================================================
// CONFIRMAR EXCLUSÃO
// ======================================================

btnConfirmarExcluir.addEventListener(
  "click",
  async () => {

    // ==========================================
    // EXCLUIR ATLETA
    // ==========================================

    if (
      entidadeAtual === "atletas"
    ) {

      try {

        await deleteDoc(
          doc(
            db,
            "usuarios",
            idParaExcluir
          )
        );


        alert(
          "Dados do atleta excluídos do Firestore."
        );


        await carregarAtletas();


        fecharModalExcluir();


      } catch (erro) {

        console.error(
          "Erro ao excluir atleta:",
          erro
        );


        alert(
          "Erro ao excluir atleta."
        );

      }


      return;
    }


    // ==========================================
    // EXCLUIR CLUBE
    // ==========================================

    const cfg =
      dados[entidadeAtual];


    cfg.registros =
      cfg.registros.filter(
        (r) =>
          r.id !== idParaExcluir
      );


    renderContadores();

    renderTabela();

    fecharModalExcluir();

  }
);


// ======================================================
// FECHAR MODAIS CLICANDO FORA
// ======================================================

[
  formModal,
  deleteModal

].forEach((overlay) => {

  overlay.addEventListener(
    "click",
    (e) => {

      if (
        e.target === overlay
      ) {

        overlay.hidden = true;

      }

    }
  );

});


// ======================================================
// INICIALIZAÇÃO
// ======================================================

renderContadores();

atualizarBotaoNovo();

renderTabela();

carregarAtletas();