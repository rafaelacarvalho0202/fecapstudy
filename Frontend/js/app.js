/*
 * MISSÕES 9 e 10 — Tela (camada de interface)
 *
 * Boa prática da Aula 4: a tela NÃO tem regra de negócio. Os eventos só:
 *   1) leem os campos;
 *   2) criam/chamam os objetos de domínio (que calculam XP, percentual etc.);
 *   3) mandam o ClienteBackendEstudo salvar no servidor;
 *   4) redesenham a tela com o que os objetos devolvem.
 * Não existe nenhuma fórmula de XP neste arquivo.
 */

// 1. Objetos do sistema (mesmos nomes dos dados iniciais do backend)

// Missão 1: catálogo de disciplinas
const catalogo = [
    new Disciplina("ADS201", "Programação Orientada a Objetos", "Computação", 4),
    new Disciplina("ADS202", "Banco de Dados e Modelagem SQL", "Dados", 4),
    new Disciplina("ADS203", "Projeto Interdisciplinar (PI)", "Prática", 6),
    new Disciplina("ADS204", "Desenvolvimento Full Stack", "Computação", 4)
];

// Missão 3: usuários
const admin = new Administrador(1, "Profa. Helena (Coordenação)", "helena@fecap.br", "admin123", "Coordenação PI");
const responsavel = new Responsavel(2, "Carlos Silva (Pai do Lucas)", "carlos@email.com", "pai123", "Pai");
const discentes = [
    new Discente(3, "Lucas Silva", "lucas.silva@edu.fecap.br", "lucas123", "RA-2026101"),
    new Discente(4, "Mariana Costa", "mariana.costa@edu.fecap.br", "mari123", "RA-2026102")
];

// Missão 7: associação Responsável ——> Discente + metas
discentes.forEach((d) => responsavel.vincularDiscente(d));
responsavel.definirMeta(discentes[0], 180);
responsavel.definirMeta(discentes[1], 240);

// Missão 8: dependência + Missão 10: cliente HTTP
const servicoAlerta = new ServicoAlertaResponsavel();
const cliente = new ClienteBackendEstudo("http://localhost:5080");

// Missão 6: notificadores (o callback só mostra o toast — a classe não conhece o HTML)
const aoEnviarAlerta = (r) => mostrarToast(`Alerta enviado via ${r.canal}`, `Para: ${r.destinatario}\n${r.mensagem}`);
const notificadores = {
    email: new NotificadorEmail(aoEnviarAlerta),
    whatsapp: new NotificadorWhatsApp(aoEnviarAlerta),
    painel: new NotificadorPainel(aoEnviarAlerta)
};

// Fábrica de sessões: cada modalidade sabe criar a subclasse certa.
const fabricaSessao = {
    Pomodoro: (disc, min, extra) => new SessaoPomodoro(disc, min, extra.ciclos),
    Exercicios: (disc, min, extra) => new SessaoExercicios(disc, min, extra.questoes, extra.acertos),
    Leitura: (disc, min, extra) => new SessaoLeitura(disc, min, extra.paginas, extra.resumo)
};

// Situação de sincronização de cada sessão com o servidor (sessão -> {estado, id, erro})
const sincronizacao = new WeakMap();
let discenteAtual = discentes[0];

// Login: lista polimórfica de usuários (Administrador, Responsavel e Discente juntos)
const usuarios = [admin, responsavel, ...discentes];
let discentesVisiveis = [];

// Contas de teste mostradas na tela de login (as senhas são as dos construtores acima).
const contasTeste = [
    { email: "lucas.silva@edu.fecap.br", senha: "lucas123", descricao: "Discente · registra estudos" },
    { email: "mariana.costa@edu.fecap.br", senha: "mari123", descricao: "Discente · registra estudos" },
    { email: "carlos@email.com", senha: "pai123", descricao: "Responsável · define metas dos filhos" },
    { email: "helena@fecap.br", senha: "admin123", descricao: "Administrador · vê todos os discentes" }
];

// 2. Atalhos para o DOM
/**
 * Atalho para document.getElementById.
 * @param {string} id - Id do elemento.
 * @returns {HTMLElement}
 */
const $ = (id) => document.getElementById(id);

/**
 * Cria um elemento do DOM com atributos e filhos (sem innerHTML, evitando injeção de HTML).
 * @param {string} tag - Nome da tag.
 * @param {object} [props] - "texto", "classe" ou qualquer atributo.
 * @param {Array<Node|string>} [filhos] - Filhos do elemento.
 * @returns {HTMLElement}
 */
function criarEl(tag, props = {}, filhos = []) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
        if (k === "texto") el.textContent = v;
        else if (k === "classe") el.className = v;
        else el.setAttribute(k, v);
    });
    filhos.forEach((f) => el.append(f));
    return el;
}

/**
 * Exibe uma mensagem temporária no canto da tela.
 * @param {string} titulo - Título do aviso.
 * @param {string} [texto] - Linhas separadas por \n.
 * @param {"ok"|"alerta"|"erro"} [tipo] - Define a cor e o tempo na tela.
 */
function mostrarToast(titulo, texto = "", tipo = "ok") {
    const toast = criarEl("div", { classe: `toast ${tipo === "ok" ? "" : tipo}` }, [
        criarEl("strong", { texto: titulo }),
        ...String(texto).split("\n").filter(Boolean).map((linha) => criarEl("div", { texto: linha }))
    ]);
    $("toasts").append(toast);
    setTimeout(() => toast.remove(), tipo === "erro" ? 7000 : 4500);
}

// 3. Desenhar a tela a partir dos objetos
/** Atualiza o XP e os painéis de resumo (polimorfismo de gerarPainelResumo). */
function renderizarPerfis() {
    $("xpDiscente").textContent = discenteAtual.getXpTotal();
    $("painelDiscente").textContent = discenteAtual.gerarPainelResumo();   // polimorfismo
    $("painelResponsavel").textContent = responsavel.gerarPainelResumo();  // polimorfismo
}

/** Atualiza a barra, o texto e o selo da meta do discente atual. */
function renderizarMeta() {
    const meta = responsavel.obterMeta(discenteAtual);
    const pct = meta.calcularPercentual();
    $("pctMeta").textContent = String(pct).replace(".", ",");
    $("barraMetaPreenchida").style.width = `${pct}%`;
    $("barraMeta").setAttribute("aria-valuenow", pct);
    $("barraMeta").classList.toggle("cumprida", meta.estaCumprida());
    $("textoMeta").textContent = `${meta.getMinutosCumpridos()} de ${meta.getMetaMinutosSemana()} minutos nesta semana`;
    $("inpMeta").value = meta.getMetaMinutosSemana();

    const badge = $("badgeMeta");
    badge.textContent = meta.estaCumprida() ? "Meta cumprida" : "Em andamento";
    badge.className = `pill ${meta.estaCumprida() ? "pill-ok" : "pill-neutro"}`;
}

/** Redesenha a lista de sessões do discente atual, mais recente primeiro. */
function renderizarHistorico() {
    const lista = $("listaHistorico");
    lista.replaceChildren();
    const historico = discenteAtual.getHistorico().reverse(); // mais recente primeiro
    historico.forEach((sessao) => {
        const sync = sincronizacao.get(sessao) ?? { estado: "local" };
        const textos = {
            enviando: ["Enviando ao servidor…", "sync"],
            ok: [`Salvo no servidor · id ${sync.id}`, "sync ok"],
            falhou: [`Não salvo no servidor: ${sync.erro}`, "sync falhou"],
            local: ["Somente nesta tela", "sync"]
        };
        const [txt, classe] = textos[sync.estado];
        lista.append(criarEl("li", { "data-modalidade": sessao.obterModalidade() }, [
            criarEl("span", { texto: sessao.gerarFeedback() }),   // polimorfismo
            criarEl("span", { classe, texto: txt })
        ]));
    });
    $("contHistorico").textContent = historico.length;
    $("historicoVazio").hidden = historico.length > 0;
}

/** Redesenha perfis, meta, histórico e prévia. */
function renderizarTudo() {
    renderizarPerfis();
    renderizarMeta();
    renderizarHistorico();
    atualizarPrevia();
}

// 4. Formulário
/**
 * Lê os campos do formulário de estudo.
 * @returns {{disciplina: Disciplina, modalidade: string, minutos: number, extra: object}}
 */
function lerFormulario() {
    const disciplina = catalogo[Number($("selDisciplina").value)];
    const modalidade = $("selModalidade").value;
    const minutos = Number($("inpDuracao").value);
    const extra = {
        ciclos: Number($("inpCiclos").value),
        questoes: Number($("inpQuestoes").value),
        acertos: Number($("inpAcertos").value),
        paginas: Number($("inpPaginas").value),
        resumo: $("chkResumo").checked
    };
    return { disciplina, modalidade, minutos, extra };
}

/**
 * Cria a subclasse de SessaoEstudo correspondente à modalidade escolhida.
 * @returns {SessaoEstudo}
 * @throws {Error} Se os dados forem inválidos.
 */
function criarSessaoDoFormulario() {
    const { disciplina, modalidade, minutos, extra } = lerFormulario();
    return fabricaSessao[modalidade](disciplina, minutos, extra);
}

/**
 * Mostra a prévia do feedback/XP (calculada pelo próprio objeto) ou a mensagem de erro.
 * Prévia do XP calculada pelo próprio objeto (sem fórmula aqui).
 */
function atualizarPrevia() {
    const previa = $("previaXp");
    try {
        const sessao = criarSessaoDoFormulario();
        previa.textContent = `Prévia: ${sessao.gerarFeedback()}`;
        previa.classList.remove("erro");
    } catch (erro) {
        previa.textContent = erro.message;
        previa.classList.add("erro");
    }
}

/** Mostra apenas os campos extras da modalidade selecionada. */
function alternarCamposExtras() {
    const modalidade = $("selModalidade").value;
    document.querySelectorAll(".extra").forEach((grupo) => {
        grupo.hidden = grupo.dataset.modalidade !== modalidade;
    });
    atualizarPrevia();
}

/**
 * Pergunta à MetaEstudo se aceita os minutos; se recusar, avisa o usuário.
 * A MetaEstudo é quem decide se os minutos são válidos (encapsulamento).
 * Se ela recusar, a sessão inteira é cancelada: não ganha XP nem vai ao servidor.
 * @param {number} minutos - Duração da sessão.
 * @returns {boolean} true se a meta aceitou.
 */
function metaAceitou(minutos) {
    const meta = responsavel.obterMeta(discenteAtual);
    if (meta.registrarAvanco(minutos)) return true;
    mostrarToast("Sessão recusada pela meta",
        `A MetaEstudo não aceita ${minutos} min numa única sessão ` +
        `(precisa ser de 1 a ${MetaEstudo.MINUTOS_MAX_POR_SESSAO} min).`, "alerta");
    return false;
}

/**
 * Salva a sessão no backend e atualiza a tela com o resultado.
 * Fluxo comum depois que o discente registrou a sessão (forma 1 ou forma 2).
 * @param {SessaoEstudo} sessao - Sessão já registrada no discente.
 */
async function concluirRegistro(sessao) {
    sincronizacao.set(sessao, { estado: "enviando" });
    renderizarTudo();

    // Missão 10: grava no backend C# + MySQL
    const discente = discenteAtual;
    try {
        const salvo = await cliente.salvarSessao(discente, sessao);
        sincronizacao.set(sessao, { estado: "ok", id: salvo.id });
        mostrarToast("Estudo registrado", `${sessao.gerarFeedback()}\nGravado no servidor (id ${salvo.id}).`);
    } catch (erro) {
        sincronizacao.set(sessao, { estado: "falhou", erro: erro.message });
        mostrarToast("Registrado só na tela", erro.message, "erro");
        atualizarStatus();
    }
    if (discente === discenteAtual) renderizarHistorico();
}

/**
 * Evento de submit do formulário (sobrecarga forma 1).
 * @param {SubmitEvent} evento
 */
async function aoRegistrarEstudo(evento) {
    evento.preventDefault();
    let sessao;
    try {
        sessao = criarSessaoDoFormulario();          // instancia a subclasse certa
    } catch (erro) {
        mostrarToast("Verifique os dados", erro.message, "erro");
        return;
    }
    if (!metaAceitou(sessao.getDuracaoMinutos())) return; // meta.registrarAvanco(minutos)
    discenteAtual.registrarEstudo(sessao);                 // sobrecarga — forma 1
    await concluirRegistro(sessao);
}

/** Evento do botão de registro rápido (sobrecarga forma 2). */
async function aoRegistroRapido() {
    const { disciplina, minutos } = lerFormulario();
    if (!metaAceitou(minutos)) return;
    const sessao = discenteAtual.registrarEstudo(disciplina, minutos); // sobrecarga — forma 2
    await concluirRegistro(sessao);
}

// 5. Meta e notificação
/**
 * Evento de submit do formulário de meta: redefine localmente e envia ao backend.
 * @param {SubmitEvent} evento
 */
async function aoDefinirMeta(evento) {
    evento.preventDefault();
    const pedido = Number($("inpMeta").value);
    const meta = responsavel.definirMeta(discenteAtual, pedido);
    renderizarTudo();
    const ajustada = meta.getMetaMinutosSemana() !== pedido ? ` (ajustada de ${pedido})` : "";
    try {
        await cliente.salvarMeta(discenteAtual, responsavel, meta);
        mostrarToast("Meta definida", `${discenteAtual.getNome()}: ${meta.getMetaMinutosSemana()} min/semana${ajustada}. Enviada ao servidor.`);
    } catch (erro) {
        mostrarToast("Meta definida só na tela", erro.message, "erro");
    }
}

/** Evento do botão de alerta: envia pelo canal escolhido usando o serviço de alerta. */
function aoNotificar() {
    const notificador = notificadores[$("selCanal").value];
    const meta = responsavel.obterMeta(discenteAtual);
    const resultado = servicoAlerta.avaliarDiscente(discenteAtual, meta, responsavel, notificador);
    if (!resultado.enviado) {
        mostrarToast("Alerta não enviado", `O canal ${resultado.canal} recusou o envio.`, "erro");
    }
}

// 6. Servidor
/**
 * Consulta o backend e atualiza a etiqueta de status do topo.
 * @returns {Promise<object|null>} Status do backend ou null se estiver offline.
 */
async function atualizarStatus() {
    const pill = $("statusPill");
    try {
        const st = await cliente.obterStatus();
        if (st.usandoMySql) {
            pill.textContent = "Backend online · MySQL conectado";
            pill.className = "pill pill-ok";
            pill.title = st.modoBanco;
        } else {
            pill.textContent = "Backend online · modo JSON (sem MySQL)";
            pill.className = "pill pill-alerta";
            pill.title = st.ultimoErroMySql || st.modoBanco;
        }
        return st;
    } catch (erro) {
        pill.textContent = "Backend offline";
        pill.className = "pill pill-erro";
        pill.title = erro.message;
        return null;
    }
}

/** Evento do botão "Testar conexão". */
async function aoTestarConexao() {
    const st = await atualizarStatus();
    if (!st) {
        mostrarToast("Backend offline", "Abra o iniciar_backend.bat (ou BackendEstudoAPI.exe) e tente de novo.", "erro");
    } else if (st.usandoMySql) {
        mostrarToast("Conectado", `MySQL ativo · ${st.totalSessoes} sessões e ${st.totalUsuarios} usuários no banco.`);
    } else {
        mostrarToast("Backend sem MySQL", `Gravando em dados_estudo_local.json.\n${st.ultimoErroMySql}`, "alerta");
    }
}

/** Busca o relatório no backend e preenche o painel e a tabela de sessões gravadas. */
async function aoCarregarServidor() {
    const botao = $("btnCarregarServidor");
    botao.disabled = true;
    try {
        const rel = await cliente.gerarRelatorio(discenteAtual.getNome());
        $("relSessoes").textContent = rel.totalSessoes;
        $("relMinutos").textContent = rel.totalMinutosEstudados;
        $("relXp").textContent = rel.totalXpAcumulado;
        $("relPct").textContent = String(rel.percentualMetaConcluida).replace(".", ",");
        $("relMeta").textContent = rel.metaMinutosSemana;
        const status = $("relStatus");
        status.textContent = `${rel.discente}: ${rel.statusAcompanhamento}`;
        status.className = `relatorio-status ${rel.percentualMetaConcluida >= 50 ? "ok" : "alerta"}`;

        const corpo = $("tabelaServidor");
        corpo.replaceChildren();
        rel.sessoesRecentes.forEach((s) => {
            corpo.append(criarEl("tr", {}, [
                criarEl("td", { texto: s.id }),
                criarEl("td", { texto: s.dataRegistro }),
                criarEl("td", { texto: s.disciplina }),
                criarEl("td", { texto: s.tipoModalidade }),
                criarEl("td", { classe: "num", texto: s.duracaoMinutos }),
                criarEl("td", { classe: "num", texto: s.xpGanho }),
                criarEl("td", { texto: s.resumoFeedback })
            ]));
        });
        if (rel.sessoesRecentes.length === 0) {
            corpo.append(criarEl("tr", {}, [criarEl("td", { colspan: 7, texto: "Nenhuma sessão gravada para este discente." })]));
        }
        $("relatorio").hidden = false;
    } catch (erro) {
        mostrarToast("Não foi possível carregar", erro.message, "erro");
        atualizarStatus();
    } finally {
        botao.disabled = false;
    }
}

// 7. Demonstração das missões
/** Executa a demonstração das missões e mostra a saída na tela. */
function aoRodarDemo() {
    const linhas = [];
    executarDemonstracaoMissoes((txt) => { linhas.push(txt); console.log(txt); });
    const saida = $("saidaDemo");
    saida.textContent = linhas.join("\n");
    saida.hidden = false;
}

// 8. Login
/**
 * Evento de submit do login: procura o usuário e confere a senha.
 * A senha nunca sai do objeto: a tela só pergunta "esta senha confere?" via autenticar().
 * @param {SubmitEvent} evento
 */
function aoEntrar(evento) {
    evento.preventDefault();
    const email = $("inpEmail").value.trim().toLowerCase();
    const senha = $("inpSenha").value;
    const usuario = usuarios.find((u) => u.getEmail().toLowerCase() === email && u.autenticar(senha));

    if (!usuario) {
        $("erroLogin").hidden = false;
        $("inpSenha").value = "";
        return;
    }
    $("erroLogin").hidden = true;
    entrarComo(usuario);
}

/**
 * Libera a tela principal conforme as permissões do perfil (polimorfismo).
 * @param {Usuario} usuario - Usuário autenticado.
 */
function entrarComo(usuario) {
    // Polimorfismo: cada perfil devolve os próprios discentes e permissões.
    discentesVisiveis = usuario.obterDiscentesVisiveis(discentes);
    const permissoes = usuario.obterPermissoes();

    const sel = $("selDiscente");
    sel.replaceChildren(...discentesVisiveis.map((d, i) => criarEl("option", { value: i, texto: d.getNome() })));
    sel.disabled = discentesVisiveis.length <= 1;
    discenteAtual = discentesVisiveis[0];

    // Liga/desliga partes da tela conforme o perfil
    $("formSessao").querySelectorAll("input, select, button").forEach((el) => { el.disabled = !permissoes.registrarEstudo; });
    $("avisoSessao").hidden = permissoes.registrarEstudo;
    $("formMeta").hidden = !permissoes.definirMeta;
    $("avisoMeta").hidden = permissoes.definirMeta;
    $("btnNotificar").disabled = !permissoes.notificarResponsavel;

    $("nomeLogado").textContent = `${usuario.getNome()} · ${usuario.obterTipoPerfil()}`;
    $("usuarioLogado").hidden = false;
    $("telaLogin").hidden = true;
    $("telaApp").hidden = false;
    $("relatorio").hidden = true;
    renderizarTudo();
    mostrarToast(`Bem-vindo(a), ${usuario.getNome()}`, usuario.gerarPainelResumo());
}

/** Evento do botão Sair: limpa a sessão e volta ao login. */
function aoSair() {
    $("formLogin").reset();
    $("erroLogin").hidden = true;
    $("usuarioLogado").hidden = true;
    $("telaApp").hidden = true;
    $("telaLogin").hidden = false;
    $("saidaDemo").hidden = true;
    $("toasts").replaceChildren();
    $("inpEmail").focus();
}

// 9. Inicialização
/** Monta a tela inicial e liga todos os eventos. Roda quando o DOM termina de carregar. */
function iniciar() {
    catalogo.forEach((d, i) => $("selDisciplina").append(criarEl("option", { value: i, texto: d.exibirResumo() })));

    contasTeste.forEach((conta) => {
        const botao = criarEl("button", { classe: "conta", type: "button" }, [
            criarEl("b", { texto: conta.email }),
            criarEl("span", { texto: `senha: ${conta.senha} · ${conta.descricao}` })
        ]);
        botao.addEventListener("click", () => {
            $("inpEmail").value = conta.email;
            $("inpSenha").value = conta.senha;
            $("erroLogin").hidden = true;
        });
        $("listaContas").append(botao);
    });

    $("formLogin").addEventListener("submit", aoEntrar);
    $("btnSair").addEventListener("click", aoSair);

    $("selDiscente").addEventListener("change", (e) => {
        discenteAtual = discentesVisiveis[Number(e.target.value)];
        $("relatorio").hidden = true;
        renderizarTudo();
    });
    $("selModalidade").addEventListener("change", alternarCamposExtras);
    $("formSessao").addEventListener("input", atualizarPrevia);
    $("formSessao").addEventListener("submit", aoRegistrarEstudo);
    $("btnRapido").addEventListener("click", aoRegistroRapido);
    $("formMeta").addEventListener("submit", aoDefinirMeta);
    $("btnNotificar").addEventListener("click", aoNotificar);
    $("btnTestarConexao").addEventListener("click", aoTestarConexao);
    $("btnCarregarServidor").addEventListener("click", aoCarregarServidor);
    $("btnDemo").addEventListener("click", aoRodarDemo);

    atualizarStatus();
    $("inpEmail").focus();
}

document.addEventListener("DOMContentLoaded", iniciar);
