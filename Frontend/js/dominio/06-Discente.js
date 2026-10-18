/*
 * MISSÕES 3 e 5 — Discente
 * Conceitos: HERANÇA (extends Usuario) e POLIMORFISMO ESTÁTICO (sobrecarga)
 *
 * Sobrecarga em JS: a linguagem não aceita dois métodos com o mesmo nome
 * (o último sobrescreveria o primeiro). Então escrevemos UM registrarEstudo()
 * que olha os argumentos recebidos e decide qual das 3 "formas" executar —
 * exatamente como a dica do professor sugere (instanceof / undefined).
 *
 *   Forma 1: registrarEstudo(sessao)
 *   Forma 2: registrarEstudo(disciplina, minutos)                      -> Pomodoro
 *   Forma 3: registrarEstudo(disciplina, horaInicio, horaFim, paginas) -> Leitura
 */

/** Discente (aluno): acumula XP e mantém o histórico das próprias sessões. */
class Discente extends Usuario {
    #ra;
    #xpTotal = 0;      // começa em 0
    #historico = [];   // sessões realizadas (lista privada)

    /**
     * Cria um discente.
     * @param {number} id - Identificador.
     * @param {string} nome - Nome completo.
     * @param {string} email - E-mail de login.
     * @param {string} senha - Senha.
     * @param {string} ra - Registro acadêmico.
     */
    constructor(id, nome, email, senha, ra) {
        super(id, nome, email, senha);
        this.#ra = String(ra ?? "");
    }

    /**
     * Registro acadêmico.
     * @returns {string}
     */
    getRa() { return this.#ra; }
    /**
     * XP acumulado.
     * @returns {number}
     */
    getXpTotal() { return this.#xpTotal; }

    /**
     * Histórico de sessões.
     * Devolve uma CÓPIA: quem está fora não consegue apagar ou trocar o histórico.
     * @returns {SessaoEstudo[]}
     */
    getHistorico() { return [...this.#historico]; }

    /**
     * Soma pontos ao XP total.
     * @param {number} pontos - Inteiro positivo.
     * @returns {boolean} true se somou.
     */
    adicionarXp(pontos) {
        if (!Number.isInteger(pontos) || pontos <= 0) return false;
        this.#xpTotal += pontos;
        return true;
    }

    // Sobrecarga (polimorfismo estático)
    /**
     * Registra um estudo (SOBRECARGA: o comportamento depende dos argumentos).
     * @param {SessaoEstudo|Disciplina} arg1 - Sessão pronta (forma 1) ou disciplina (formas 2 e 3).
     * @param {number} [arg2] - Minutos (forma 2) ou hora de início (forma 3).
     * @param {number} [arg3] - Hora de fim (forma 3).
     * @param {number} [arg4] - Páginas lidas (forma 3).
     * @returns {SessaoEstudo} A sessão registrada.
     * @throws {Error} Se a combinação de argumentos não for suportada.
     */
    registrarEstudo(arg1, arg2, arg3, arg4) {
        // Forma 1 — recebeu uma sessão pronta
        if (arg1 instanceof SessaoEstudo && arg2 === undefined) {
            this.#historico.push(arg1);
            this.adicionarXp(arg1.calcularXp());
            return arg1;
        }

        // Forma 2 — atalho rápido: disciplina + minutos => Pomodoro padrão
        if (arg1 instanceof Disciplina && arg3 === undefined) {
            const minutos = Number(arg2);
            const ciclos = Math.max(1, Math.floor(minutos / 25));
            return this.registrarEstudo(new SessaoPomodoro(arg1, minutos, ciclos));
        }

        // Forma 3 — por horário: disciplina + hora início + hora fim + páginas => Leitura com resumo
        if (arg1 instanceof Disciplina && arg4 !== undefined) {
            const minutos = (Number(arg3) - Number(arg2)) * 60;
            return this.registrarEstudo(new SessaoLeitura(arg1, minutos, arg4, true));
        }

        throw new Error("registrarEstudo: combinação de parâmetros não suportada.");
    }

    // Sobrescrita dos métodos abstratos
    /** @returns {string} "Discente" */
    obterTipoPerfil() { return "Discente"; }

    /**
     * Resumo com RA, XP e quantidade de sessões.
     * @returns {string}
     */
    gerarPainelResumo() {
        return `Discente: ${this.getNome()} · RA ${this.#ra} · ${this.#xpTotal} XP · ` +
               `${this.#historico.length} sessão(ões) registrada(s)`;
    }

    /**
     * Permissões do discente.
     * O discente registra os próprios estudos, mas não mexe na própria meta.
     * @returns {{registrarEstudo: boolean, definirMeta: boolean, notificarResponsavel: boolean}}
     */
    obterPermissoes() {
        return { registrarEstudo: true, definirMeta: false, notificarResponsavel: true };
    }

    /**
     * @param {Discente[]} todosDiscentes - Todos os discentes do sistema.
     * O discente só enxerga a si mesmo.
     * @returns {Discente[]} Só o próprio discente.
     */
    obterDiscentesVisiveis(todosDiscentes) {
        return [this];
    }
}
