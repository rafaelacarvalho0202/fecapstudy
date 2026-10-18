/*
 * MISSÃO 7 — TrilhaEstudo
 * Conceitos: AGREGAÇÃO (TrilhaEstudo ◇── Disciplina) e ASSOCIAÇÃO (com Administrador)
 *
 * Agregação: as disciplinas são criadas FORA da trilha (no catálogo da
 * faculdade) e apenas adicionadas a ela. Se a trilha for apagada, as
 * disciplinas continuam existindo — e a mesma disciplina pode estar em
 * duas trilhas diferentes.
 */

/** Trilha de estudo montada por um administrador (AGREGAÇÃO com Disciplina). */
class TrilhaEstudo {
    #titulo;
    #administrador;     // associação: quem montou a trilha
    #disciplinas = [];  // agregação

    /**
     * @param {string} titulo - Nome da trilha.
     * @param {Administrador} administrador - Quem montou a trilha.
     * @throws {Error} Se não for um Administrador.
     */
    constructor(titulo, administrador) {
        if (!(administrador instanceof Administrador)) {
            throw new Error("A trilha precisa de um Administrador responsável.");
        }
        this.#titulo = String(titulo ?? "").trim();
        this.#administrador = administrador;
    }

    /**
     * Título da trilha.
     * @returns {string}
     */
    getTitulo() { return this.#titulo; }
    /**
     * Administrador responsável.
     * @returns {Administrador}
     */
    getAdministrador() { return this.#administrador; }
    /**
     * Disciplinas da trilha.
     * @returns {Disciplina[]} Cópia da lista.
     */
    getDisciplinas() { return [...this.#disciplinas]; }

    /**
     * Adiciona uma disciplina já existente, sem duplicar.
     * Recebe a disciplina PRONTA (não faz "new Disciplina" aqui dentro).
     * @param {Disciplina} disciplina - Disciplina pronta.
     * @returns {boolean} true se adicionou.
     */
    adicionarDisciplina(disciplina) {
        if (!(disciplina instanceof Disciplina)) return false;
        if (this.#disciplinas.includes(disciplina)) return false;
        this.#disciplinas.push(disciplina);
        return true;
    }

    /**
     * Remove a disciplina da trilha (ela continua existindo fora dela).
     * @param {Disciplina} disciplina - Disciplina a remover.
     * @returns {boolean} true se removeu.
     */
    removerDisciplina(disciplina) {
        const i = this.#disciplinas.indexOf(disciplina);
        if (i === -1) return false;
        this.#disciplinas.splice(i, 1); // a disciplina sai da trilha, mas continua existindo
        return true;
    }

    /**
     * Soma a carga das disciplinas.
     * @returns {number} Horas por semana.
     */
    calcularCargaHorariaTotal() {
        return this.#disciplinas.reduce((soma, d) => soma + d.getCargaHorariaSemanalHoras(), 0);
    }

    /**
     * Resumo da trilha.
     * @returns {string}
     */
    exibirResumo() {
        return `${this.#titulo} (por ${this.#administrador.getNome()}) — ` +
               `${this.#disciplinas.length} disciplina(s), ${this.calcularCargaHorariaTotal()}h/semana`;
    }
}
