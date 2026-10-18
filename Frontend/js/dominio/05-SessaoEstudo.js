/*
 * MISSÃO 4 — SessaoEstudo (abstrata) → Pomodoro, Exercicios, Leitura
 * Conceito: POLIMORFISMO DINÂMICO (sobrescrita / override)
 *
 * Cada modalidade sabe calcular o próprio XP e montar o próprio feedback.
 * Quem usa a sessão só chama sessao.calcularXp() — sem nenhum
 * "if (modalidade == ...)": o JavaScript despacha para a classe certa.
 *
 * Também implementa IExportavelJson (Missão 6): paraJson() já devolve os
 * campos no formato que o backend C# espera em POST /api/sessoes.
 */

/**
 * Sessão de estudo (CLASSE ABSTRATA).
 * Cada modalidade (Pomodoro, Exercícios, Leitura) calcula o próprio XP e feedback.
 * Implementa IExportavelJson.
 */
class SessaoEstudo {
    #disciplina;      // associação com Disciplina (Missão 1)
    #duracaoMinutos;
    #dataRegistro;

    /**
     * Valida a abstração, a disciplina e a duração.
     * @param {Disciplina} disciplina - Disciplina estudada.
     * @param {number} duracaoMinutos - Inteiro maior que zero.
     * @throws {Error} Se for instanciada diretamente ou se os dados forem inválidos.
     */
    constructor(disciplina, duracaoMinutos) {
        if (new.target === SessaoEstudo) {
            throw new Error("SessaoEstudo é abstrata! Use SessaoPomodoro, SessaoExercicios ou SessaoLeitura.");
        }
        if (!(disciplina instanceof Disciplina)) {
            throw new Error("A sessão precisa de um objeto Disciplina.");
        }
        const minutos = Number(duracaoMinutos);
        if (!Number.isInteger(minutos) || minutos <= 0) {
            throw new Error("A duração deve ser um número inteiro de minutos maior que zero.");
        }
        this.#disciplina = disciplina;
        this.#duracaoMinutos = minutos;
        this.#dataRegistro = SessaoEstudo.#agoraFormatado();
    }

    /**
     * Disciplina estudada.
     * @returns {Disciplina}
     */
    getDisciplina() { return this.#disciplina; }
    /**
     * Duração da sessão.
     * @returns {number} Minutos.
     */
    getDuracaoMinutos() { return this.#duracaoMinutos; }
    /**
     * Data/hora do registro.
     * @returns {string} Formato "yyyy-MM-dd HH:mm".
     */
    getDataRegistro() { return this.#dataRegistro; }

    // Métodos abstratos
    /**
     * Nome da modalidade (abstrato).
     * @returns {string}
     */
    obterModalidade() {
        throw new Error(`${this.constructor.name} precisa implementar obterModalidade()`);
    }

    /**
     * XP ganho na sessão (abstrato).
     * @returns {number}
     */
    calcularXp() {
        throw new Error(`${this.constructor.name} precisa implementar calcularXp()`);
    }

    /**
     * Texto de feedback da sessão.
     * Método "virtual": tem comportamento padrão, mas as filhas podem sobrescrever.
     * @returns {string}
     */
    gerarFeedback() {
        return `${this.obterModalidade()} em ${this.#disciplina.getNome()} ` +
               `(${this.#duracaoMinutos} min) -> +${this.calcularXp()} XP`;
    }

    /**
     * Exporta a sessão no formato do backend.
     * IExportavelJson — nomes dos campos iguais aos do SessaoEstudoDto do backend.
     * @returns {string} JSON no padrão SessaoEstudoDto.
     */
    paraJson() {
        return JSON.stringify({
            disciplina: this.#disciplina.getNome(),
            tipoModalidade: this.obterModalidade(),
            duracaoMinutos: this.#duracaoMinutos,
            xpGanho: this.calcularXp(),
            resumoFeedback: this.gerarFeedback(),
            dataRegistro: this.#dataRegistro
        });
    }

    /**
     * Data e hora atuais.
     * Mesmo formato que o backend usa: "yyyy-MM-dd HH:mm"
     * @returns {string} Formato "yyyy-MM-dd HH:mm".
     */
    static #agoraFormatado() {
        const d = new Date();
        const p = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
    }
}

Interface.garantir(SessaoEstudo, IExportavelJson);

/** Sessão Pomodoro: o XP depende da duração e dos ciclos concluídos. */
class SessaoPomodoro extends SessaoEstudo {
    #ciclosCompletos;

    /**
     * @param {Disciplina} disciplina - Disciplina estudada.
     * @param {number} duracaoMinutos - Duração em minutos.
     * @param {number} ciclosCompletos - Ciclos de foco concluídos (inválido vira 0).
     */
    constructor(disciplina, duracaoMinutos, ciclosCompletos) {
        super(disciplina, duracaoMinutos);
        const ciclos = Math.trunc(Number(ciclosCompletos));
        this.#ciclosCompletos = Number.isFinite(ciclos) && ciclos > 0 ? ciclos : 0;
    }

    /**
     * Ciclos concluídos.
     * @returns {number}
     */
    getCiclosCompletos() { return this.#ciclosCompletos; }

    /** @returns {string} "Pomodoro" */
    obterModalidade() { return "Pomodoro"; } // texto igual ao aceito pelo backend

    /**
     * XP do Pomodoro.
     * XP = duração * 2 + ciclos * 15
     * @returns {number}
     */
    calcularXp() {
        return this.getDuracaoMinutos() * 2 + this.#ciclosCompletos * 15;
    }

    /**
     * Feedback com o número de ciclos.
     * @returns {string}
     */
    gerarFeedback() {
        return `${super.gerarFeedback()} · ${this.#ciclosCompletos} ciclo(s) concluído(s)`;
    }
}

/** Sessão de exercícios: o XP depende dos acertos. */
class SessaoExercicios extends SessaoEstudo {
    #totalQuestoes;
    #acertos;

    /**
     * @param {Disciplina} disciplina - Disciplina estudada.
     * @param {number} duracaoMinutos - Duração em minutos.
     * @param {number} totalQuestoes - Questões resolvidas.
     * @param {number} acertos - Questões certas.
     * @throws {Error} Se acertos for maior que totalQuestoes.
     */
    constructor(disciplina, duracaoMinutos, totalQuestoes, acertos) {
        super(disciplina, duracaoMinutos);
        const total = Math.max(0, Math.trunc(Number(totalQuestoes)) || 0);
        const certos = Math.max(0, Math.trunc(Number(acertos)) || 0);
        if (certos > total) {
            throw new Error("O número de acertos não pode ser maior que o total de questões.");
        }
        this.#totalQuestoes = total;
        this.#acertos = certos;
    }

    /**
     * Total de questões.
     * @returns {number}
     */
    getTotalQuestoes() { return this.#totalQuestoes; }
    /**
     * Total de acertos.
     * @returns {number}
     */
    getAcertos() { return this.#acertos; }

    /**
     * Percentual de acerto.
     * @returns {number} De 0 a 100, com uma casa decimal.
     */
    calcularPercentualAcerto() {
        if (this.#totalQuestoes === 0) return 0;
        return Math.round((this.#acertos * 1000) / this.#totalQuestoes) / 10;
    }

    /** @returns {string} "Exercicios" */
    obterModalidade() { return "Exercicios"; }

    /**
     * XP dos exercícios.
     * XP = duração + acertos * 10
     * @returns {number}
     */
    calcularXp() {
        return this.getDuracaoMinutos() + this.#acertos * 10;
    }

    /**
     * Feedback com acertos e percentual.
     * @returns {string}
     */
    gerarFeedback() {
        return `${super.gerarFeedback()} · ${this.#acertos}/${this.#totalQuestoes} acertos ` +
               `(${this.calcularPercentualAcerto()}%)`;
    }
}

/** Sessão de leitura: o XP depende das páginas lidas e do resumo. */
class SessaoLeitura extends SessaoEstudo {
    #paginasLidas;
    #fezResumo;

    /**
     * @param {Disciplina} disciplina - Disciplina estudada.
     * @param {number} duracaoMinutos - Duração em minutos.
     * @param {number} paginasLidas - Páginas lidas.
     * @param {boolean} fezResumo - Se o aluno escreveu um resumo.
     */
    constructor(disciplina, duracaoMinutos, paginasLidas, fezResumo) {
        super(disciplina, duracaoMinutos);
        this.#paginasLidas = Math.max(0, Math.trunc(Number(paginasLidas)) || 0);
        this.#fezResumo = Boolean(fezResumo);
    }

    /**
     * Páginas lidas.
     * @returns {number}
     */
    getPaginasLidas() { return this.#paginasLidas; }
    /**
     * Se houve resumo.
     * @returns {boolean}
     */
    getFezResumo() { return this.#fezResumo; }

    /** @returns {string} "Leitura" */
    obterModalidade() { return "Leitura"; }

    /**
     * XP da leitura.
     * XP = duração + páginas * 3 + (fez resumo ? 25 : 0)
     * @returns {number}
     */
    calcularXp() {
        return this.getDuracaoMinutos() + this.#paginasLidas * 3 + (this.#fezResumo ? 25 : 0);
    }

    /**
     * Feedback com páginas e resumo.
     * @returns {string}
     */
    gerarFeedback() {
        const resumo = this.#fezResumo ? "com resumo" : "sem resumo";
        return `${super.gerarFeedback()} · ${this.#paginasLidas} página(s), ${resumo}`;
    }
}
