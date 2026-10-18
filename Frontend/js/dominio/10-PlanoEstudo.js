/*
 * MISSÃO 8 (parte 1) — PlanoEstudo ◆── ItemCronograma
 * Conceito: COMPOSIÇÃO
 *
 * O ItemCronograma nasce DENTRO do PlanoEstudo: adicionarItem() recebe só
 * dados primitivos (dia e minutos) e faz o "new ItemCronograma" lá dentro.
 * A lista nunca é devolvida para fora — quem está fora só recebe textos e
 * números. Assim, nenhum código externo consegue adulterar um item sem
 * passar pelas regras do PlanoEstudo. Se o plano deixar de existir, os
 * itens deixam de existir junto.
 */

/** Item do cronograma: um dia da semana e os minutos planejados. Só existe dentro de um PlanoEstudo. */
class ItemCronograma {
    #diaSemana;
    #minutosPlanejados;

    /**
     * @param {string} diaSemana - Dia já validado pelo plano.
     * @param {number} minutosPlanejados - Minutos já validados pelo plano.
     */
    constructor(diaSemana, minutosPlanejados) {
        this.#diaSemana = diaSemana;
        this.#minutosPlanejados = minutosPlanejados;
    }

    /**
     * Dia da semana.
     * @returns {string}
     */
    getDiaSemana() { return this.#diaSemana; }
    /**
     * Minutos planejados.
     * @returns {number}
     */
    getMinutosPlanejados() { return this.#minutosPlanejados; }

    /**
     * Texto do item.
     * @returns {string} Ex.: "Segunda: 60 min".
     */
    exibirResumo() {
        return `${this.#diaSemana}: ${this.#minutosPlanejados} min`;
    }
}

/** Plano de estudo semanal (COMPOSIÇÃO com ItemCronograma). */
class PlanoEstudo {
    static DIAS_VALIDOS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

    #itens = []; // composição: os itens pertencem ao plano

    /**
     * Valida os dados e cria o item dentro do plano.
     * @param {string} diaSemana - Um dos DIAS_VALIDOS.
     * @param {number} minutos - Inteiro entre 1 e 600.
     * @returns {boolean} true se adicionou.
     */
    adicionarItem(diaSemana, minutos) {
        const dia = String(diaSemana ?? "").trim();
        const min = Number(minutos);
        if (!PlanoEstudo.DIAS_VALIDOS.includes(dia)) return false;
        if (!Number.isInteger(min) || min <= 0 || min > 600) return false;
        this.#itens.push(new ItemCronograma(dia, min)); // criado AQUI dentro
        return true;
    }

    /**
     * Soma os minutos de todos os itens.
     * @returns {number}
     */
    calcularTotalPlanejado() {
        return this.#itens.reduce((soma, item) => soma + item.getMinutosPlanejados(), 0);
    }

    /**
     * Quantidade de itens do plano.
     * @returns {number}
     */
    quantidadeItens() { return this.#itens.length; }

    /**
     * Lista os itens como texto.
     * Devolve só textos — nunca as referências dos itens.
     * @returns {string[]}
     */
    listarResumo() {
        return this.#itens.map((item) => item.exibirResumo());
    }
}
