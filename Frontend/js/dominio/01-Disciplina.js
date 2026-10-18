/*
 * MISSÃO 1 — Disciplina
 * Conceitos: ABSTRAÇÃO, CLASSE e OBJETO
 *
 * Em vez de guardar a matéria como um texto solto, modelamos o conceito
 * "disciplina" com os atributos essenciais e os comportamentos que fazem
 * sentido para ela (calcular carga em minutos e exibir um resumo).
 */

/**
 * Disciplina da faculdade (abstração do mundo real).
 * Todos os atributos são privados (#); a leitura é feita pelos getters.
 */
class Disciplina {
    // Campos privados (#): só a própria classe enxerga — já preparando o encapsulamento.
    #codigo;
    #nome;
    #categoria;
    #cargaHorariaSemanalHoras;

    /**
     * Cria uma disciplina validando os dados recebidos.
     * @param {string} codigo - Código da disciplina (ex.: "ADS201").
     * @param {string} nome - Nome da disciplina.
     * @param {string} categoria - Área da disciplina (padrão "Geral").
     * @param {number} cargaHorariaSemanalHoras - Horas por semana; valor inválido ou <= 0 vira 2.
     */
    constructor(codigo, nome, categoria, cargaHorariaSemanalHoras) {
        this.#codigo = String(codigo ?? "").trim();
        this.#nome = String(nome ?? "").trim();
        this.#categoria = String(categoria ?? "Geral").trim();

        // Regra da missão: carga <= 0 (ou inválida) vira o padrão de 2 horas.
        const horas = Number(cargaHorariaSemanalHoras);
        this.#cargaHorariaSemanalHoras = Number.isFinite(horas) && horas > 0 ? Math.trunc(horas) : 2;
    }

    /**
     * Código da disciplina.
     * @returns {string}
     */
    getCodigo() { return this.#codigo; }
    /**
     * Nome da disciplina.
     * @returns {string}
     */
    getNome() { return this.#nome; }
    /**
     * Categoria (área) da disciplina.
     * @returns {string}
     */
    getCategoria() { return this.#categoria; }
    /**
     * Carga horária semanal em horas.
     * @returns {number}
     */
    getCargaHorariaSemanalHoras() { return this.#cargaHorariaSemanalHoras; }

    /**
     * Converte a carga horária semanal de horas para minutos.
     * @returns {number} Minutos por semana.
     */
    calcularCargaEmMinutos() {
        return this.#cargaHorariaSemanalHoras * 60;
    }

    /**
     * Monta o texto de apresentação da disciplina.
     * Ex.: "[ADS201] Programação Orientada a Objetos (Computação) — 4h/semana (240 min)"
     * @returns {string} Resumo em uma linha.
     */
    exibirResumo() {
        return `[${this.#codigo}] ${this.#nome} (${this.#categoria}) — ` +
               `${this.#cargaHorariaSemanalHoras}h/semana (${this.calcularCargaEmMinutos()} min)`;
    }
}
