/*
 * MISSÃO 2 — MetaEstudo
 * Conceito: ENCAPSULAMENTO
 *
 * O estado interno (meta e minutos cumpridos) é privado. Não existe
 * setMinutosCumpridos(): a ÚNICA forma de somar minutos é registrarAvanco(),
 * que valida as regras de negócio. Assim ninguém consegue fazer
 * "meta.minutosCumpridos = 99999" para enganar o painel do responsável.
 *
 * Também implementa IExportavelJson (Missão 6).
 */

/**
 * Meta semanal de estudo de um discente (ENCAPSULAMENTO).
 * Implementa IExportavelJson.
 */
class MetaEstudo {
    static MINUTOS_MAX_POR_SESSAO = 480; // 8h seguidas = provável erro de digitação
    static META_MINIMA = 30;
    static META_MAXIMA = 3000;

    #metaMinutosSemana = 0;
    #minutosCumpridos = 0; // sempre começa em 0

    /**
     * Cria a meta reaproveitando a validação de redefinirMeta().
     * @param {number} metaMinutosSemana - Meta pedida (será limitada entre 30 e 3000).
     */
    constructor(metaMinutosSemana) {
        // Dica de ouro da missão: reaproveitar a validação chamando redefinirMeta().
        this.redefinirMeta(metaMinutosSemana);
    }

    /**
     * Meta semanal em minutos.
     * @returns {number}
     */
    getMetaMinutosSemana() { return this.#metaMinutosSemana; }
    /**
     * Minutos já cumpridos na semana.
     * @returns {number}
     */
    getMinutosCumpridos() { return this.#minutosCumpridos; }

    /**
     * Soma minutos à meta se forem válidos.
     * Única porta de entrada para somar minutos. Retorna true/false.
     * @param {number} minutos - Inteiro entre 1 e MINUTOS_MAX_POR_SESSAO.
     * @returns {boolean} true se aceitou, false se recusou.
     */
    registrarAvanco(minutos) {
        if (!Number.isInteger(minutos)) return false;
        if (minutos <= 0) return false;
        if (minutos > MetaEstudo.MINUTOS_MAX_POR_SESSAO) return false;
        this.#minutosCumpridos += minutos;
        return true;
    }

    /**
     * Troca a meta semanal, travando o valor entre META_MINIMA e META_MAXIMA.
     * Usado pelo Responsável. Trava a meta entre 30 e 3000 minutos.
     * @param {number} novaMeta - Nova meta em minutos.
     */
    redefinirMeta(novaMeta) {
        let valor = Math.trunc(Number(novaMeta));
        if (!Number.isFinite(valor) || valor < MetaEstudo.META_MINIMA) valor = MetaEstudo.META_MINIMA;
        if (valor > MetaEstudo.META_MAXIMA) valor = MetaEstudo.META_MAXIMA;
        this.#metaMinutosSemana = valor;
    }

    /**
     * Percentual da meta cumprido.
     * De 0 a 100.0 — trava em 100 mesmo se o aluno estudar além da meta.
     * @returns {number} De 0 a 100, com uma casa decimal.
     */
    calcularPercentual() {
        const pct = (this.#minutosCumpridos * 100) / this.#metaMinutosSemana;
        return Math.min(100, Math.round(pct * 10) / 10);
    }

    /**
     * Indica se a meta semanal já foi atingida.
     * @returns {boolean}
     */
    estaCumprida() {
        return this.#minutosCumpridos >= this.#metaMinutosSemana;
    }

    /**
     * Exporta a meta no formato esperado pelo backend (IExportavelJson).
     * @returns {string} JSON com metaMinutosSemana e minutosCumpridos.
     */
    paraJson() {
        return JSON.stringify({
            metaMinutosSemana: this.#metaMinutosSemana,
            minutosCumpridos: this.#minutosCumpridos
        });
    }
}

Interface.garantir(MetaEstudo, IExportavelJson);
