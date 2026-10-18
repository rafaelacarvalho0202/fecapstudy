/*
 * MISSÃO 10 — ClienteBackendEstudo
 * Conceito: DEPENDÊNCIA (e separação de responsabilidades)
 *
 * É a ÚNICA classe do front que conversa com o backend C# do professor
 * (BackendEstudoAPI.exe em http://localhost:5080). As classes de domínio não
 * sabem que existe HTTP; a tela não sabe montar URLs. Os métodos recebem os
 * objetos de domínio como parâmetro, usam o paraJson() deles
 * (IExportavelJson) e não guardam esses objetos — dependência.
 *
 * Rotas usadas (definidas no Program.cs do backend):
 *   GET /api/status        POST /api/sessoes
 *   POST /api/metas        GET  /api/relatorio/{discente}
 */

/** Cliente HTTP do backend C# (única classe do front que usa fetch). */
class ClienteBackendEstudo {
    #urlBase;
    #tempoLimiteMs;

    /**
     * @param {string} [urlBase] - Endereço do backend.
     * @param {number} [tempoLimiteMs] - Tempo máximo de espera por requisição.
     */
    constructor(urlBase = "http://localhost:5080", tempoLimiteMs = 5000) {
        this.#urlBase = urlBase.replace(/\/+$/, "");
        this.#tempoLimiteMs = tempoLimiteMs;
    }

    // Status
    /**
     * GET /api/status: situação do backend e do MySQL.
     * @returns {Promise<object>}
     */
    async obterStatus() {
        return this.#requisitar("GET", "/api/status");
    }

    // Sessões
    /**
     * POST /api/sessoes: envia uma sessão concluída.
     * O backend soma os minutos na meta.
     * @param {Discente} discente - Dono da sessão.
     * @param {SessaoEstudo} sessao - Sessão com paraJson().
     * @returns {Promise<object>} Sessão salva (com id).
     * @throws {Error} Se a sessão não implementar IExportavelJson ou o backend falhar.
     */
    async salvarSessao(discente, sessao) {
        if (!Interface.implementa(sessao, IExportavelJson)) {
            throw new Error("A sessão precisa implementar IExportavelJson.");
        }
        const corpo = { discenteNome: discente.getNome(), ...JSON.parse(sessao.paraJson()) };
        return this.#requisitar("POST", "/api/sessoes", corpo);
    }

    // Metas
    /**
     * POST /api/metas: grava a meta de um discente.
     * @param {Discente} discente - Dono da meta.
     * @param {Responsavel} responsavel - Quem definiu a meta.
     * @param {MetaEstudo} meta - Meta com paraJson().
     * @returns {Promise<object>}
     */
    async salvarMeta(discente, responsavel, meta) {
        const corpo = {
            discenteNome: discente.getNome(),
            responsavelNome: responsavel.getNome(),
            ...JSON.parse(meta.paraJson())
        };
        return this.#requisitar("POST", "/api/metas", corpo);
    }

    // Relatório
    /**
     * GET /api/relatorio/{discente}: relatório calculado pelo backend.
     * @param {string} nomeDiscente - Nome do discente.
     * @returns {Promise<object>}
     */
    async gerarRelatorio(nomeDiscente) {
        return this.#requisitar("GET", `/api/relatorio/${encodeURIComponent(nomeDiscente)}`);
    }

    // Método privado que centraliza o fetch
    /**
     * Centraliza o fetch: timeout, JSON e tratamento de erros.
     * @param {string} metodo - Verbo HTTP.
     * @param {string} caminho - Rota (ex.: "/api/status").
     * @param {object} [corpo] - Objeto enviado como JSON.
     * @returns {Promise<any>} Corpo da resposta já convertido.
     * @throws {Error} Com mensagem amigável se o backend falhar ou não responder.
     */
    async #requisitar(metodo, caminho, corpo) {
        const controle = new AbortController();
        const timer = setTimeout(() => controle.abort(), this.#tempoLimiteMs);
        try {
            const opcoes = { method: metodo, signal: controle.signal, headers: {} };
            if (corpo !== undefined) {
                opcoes.headers["Content-Type"] = "application/json";
                opcoes.body = JSON.stringify(corpo);
            }
            const resposta = await fetch(this.#urlBase + caminho, opcoes);
            const texto = await resposta.text();
            const dados = texto ? JSON.parse(texto) : null;
            if (!resposta.ok) {
                throw new Error(dados?.erro ?? `Erro HTTP ${resposta.status} em ${metodo} ${caminho}`);
            }
            return dados;
        } catch (erro) {
            if (erro.name === "AbortError" || erro instanceof TypeError) {
                throw new Error(`Backend não respondeu em ${this.#urlBase}. O BackendEstudoAPI.exe está aberto?`);
            }
            throw erro;
        } finally {
            clearTimeout(timer);
        }
    }
}
