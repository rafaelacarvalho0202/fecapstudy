/*
 * MISSÕES 3 e 7 — Responsavel
 * Conceitos: HERANÇA (extends Usuario) e ASSOCIAÇÃO (Responsavel ——> Discente)
 *
 * Associação: o Responsável recebe objetos Discente que JÁ EXISTEM fora dele
 * (foram criados em outro lugar) e apenas guarda a referência. Se o
 * responsável deixar de existir, os discentes continuam existindo.
 *
 * Também guarda um "dicionário" (Map) Discente -> MetaEstudo.
 */

/** Responsável: acompanha discentes (associação) e define as metas deles. */
class Responsavel extends Usuario {
    #parentesco;
    #discentes = [];       // associação com Discente
    #metas = new Map();    // Discente -> MetaEstudo

    /**
     * Cria um responsável.
     * @param {number} id - Identificador.
     * @param {string} nome - Nome completo.
     * @param {string} email - E-mail de login e destino dos alertas.
     * @param {string} senha - Senha.
     * @param {string} parentesco - Relação com o discente (ex.: "Pai").
     */
    constructor(id, nome, email, senha, parentesco) {
        super(id, nome, email, senha);
        this.#parentesco = String(parentesco ?? "Responsável");
    }

    /**
     * Parentesco com o discente.
     * @returns {string}
     */
    getParentesco() { return this.#parentesco; }
    /**
     * Discentes vinculados.
     * @returns {Discente[]} Cópia da lista.
     */
    getDiscentes() { return [...this.#discentes]; }

    /**
     * Vincula um discente já existente, sem duplicar.
     * Recebe um Discente criado fora e o adiciona sem duplicar.
     * @param {Discente} discente - Discente a vincular.
     * @returns {boolean} true se vinculou.
     */
    vincularDiscente(discente) {
        if (!(discente instanceof Discente)) return false;
        if (this.#discentes.includes(discente)) return false;
        this.#discentes.push(discente);
        return true;
    }

    /**
     * Cria ou redefine a meta semanal de um discente vinculado.
     * Cria a meta do discente ou redefine a que já existe.
     * @param {Discente} discente - Discente dono da meta.
     * @param {number} metaMinutosSemana - Meta pedida em minutos.
     * @returns {MetaEstudo} A meta criada ou atualizada.
     * @throws {Error} Se o discente não estiver vinculado.
     */
    definirMeta(discente, metaMinutosSemana) {
        if (!this.#discentes.includes(discente)) {
            throw new Error(`${discente?.getNome?.() ?? "Discente"} não está vinculado a ${this.getNome()}.`);
        }
        const existente = this.#metas.get(discente);
        if (existente) {
            existente.redefinirMeta(metaMinutosSemana);
            return existente;
        }
        const nova = new MetaEstudo(metaMinutosSemana);
        this.#metas.set(discente, nova);
        return nova;
    }

    /**
     * Meta atual de um discente.
     * @param {Discente} discente - Discente consultado.
     * @returns {MetaEstudo|null} null se ainda não houver meta.
     */
    obterMeta(discente) {
        return this.#metas.get(discente) ?? null;
    }

    /** @returns {string} "Responsavel" */
    obterTipoPerfil() { return "Responsavel"; } // mesmo texto usado pelo backend

    /**
     * Resumo com os discentes acompanhados.
     * @returns {string}
     */
    gerarPainelResumo() {
        const nomes = this.#discentes.map((d) => d.getNome()).join(", ") || "nenhum discente";
        return `Responsável: ${this.getNome()} (${this.#parentesco}) · acompanha ${nomes}`;
    }

    /**
     * Permissões do responsável.
     * O responsável define metas e acompanha, mas não registra estudo pelo discente.
     * @returns {{registrarEstudo: boolean, definirMeta: boolean, notificarResponsavel: boolean}}
     */
    obterPermissoes() {
        return { registrarEstudo: false, definirMeta: true, notificarResponsavel: true };
    }

    /**
     * @param {Discente[]} todosDiscentes - Ignorado: vale a associação.
     * Só enxerga os discentes vinculados a ele (associação).
     * @returns {Discente[]} Só os discentes vinculados.
     */
    obterDiscentesVisiveis(todosDiscentes) {
        return this.getDiscentes();
    }
}
