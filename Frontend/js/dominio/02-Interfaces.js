/*
 * MISSÃO 6 (parte 1) — Interfaces: INotificador e IExportavelJson
 * Conceito: INTERFACE (contrato)
 *
 * O JavaScript não tem a palavra-chave "interface". Por isso representamos
 * cada interface como um objeto que lista os métodos obrigatórios, e usamos:
 *   - Interface.garantir(Classe, IContrato)  -> confere, ao carregar o arquivo,
 *     se a classe implementa todos os métodos (parecido com o compilador do C#
 *     reclamando quando falta um método da interface);
 *   - Interface.implementa(objeto, IContrato) -> "duck typing": confere em
 *     tempo de execução se um objeto cumpre o contrato.
 *
 * Este arquivo vem antes das classes porque elas usam os contratos.
 */

/**
 * Representa uma interface (contrato) como a lista de métodos obrigatórios.
 * Os objetos são imutáveis (Object.freeze).
 */
class Interface {
    #nome;
    #metodos;

    /**
     * Cria um contrato.
     * @param {string} nome - Nome da interface (ex.: "INotificador").
     * @param {string[]} metodos - Nomes dos métodos que o contrato exige.
     */
    constructor(nome, metodos) {
        this.#nome = nome;
        this.#metodos = Object.freeze([...metodos]);
        Object.freeze(this);
    }

    /**
     * Nome da interface.
     * @returns {string}
     */
    getNome() { return this.#nome; }
    /**
     * Métodos exigidos pelo contrato.
     * @returns {readonly string[]}
     */
    getMetodos() { return this.#metodos; }

    /**
     * Duck typing: confere em tempo de execução se um objeto cumpre o contrato.
     * Verifica se um objeto qualquer possui todos os métodos do contrato.
     * @param {object} objeto - Objeto a verificar.
     * @param {Interface} contrato - Contrato esperado.
     * @returns {boolean} true se o objeto tem todos os métodos do contrato.
     */
    static implementa(objeto, contrato) {
        if (objeto == null) return false;
        return contrato.getMetodos().every((m) => typeof objeto[m] === "function");
    }

    /**
     * Confere se uma classe implementa o contrato; chamada ao carregar o arquivo.
     * Verifica se a CLASSE (o protótipo dela) implementa o contrato.
     * Se faltar algum método, o erro aparece assim que a página carrega.
     * @param {Function} Classe - Classe a verificar.
     * @param {Interface} contrato - Contrato que ela deve assinar.
     * @throws {Error} Se faltar algum método do contrato.
     */
    static garantir(Classe, contrato) {
        const faltando = contrato.getMetodos().filter((m) => typeof Classe.prototype[m] !== "function");
        if (faltando.length > 0) {
            throw new Error(`${Classe.name} não implementa ${contrato.getNome()}: falta(m) ${faltando.join(", ")}`);
        }
        // Guarda na classe a lista de interfaces que ela assina (para consulta/apresentação).
        const lista = Object.prototype.hasOwnProperty.call(Classe, "interfaces") ? Classe.interfaces : [];
        Object.defineProperty(Classe, "interfaces", {
            value: [...lista, contrato.getNome()],
            configurable: true
        });
    }
}

// «interface» INotificador
//   + obterCanal() : string
//   + enviarAlerta(destinatario, mensagem) : bool
const INotificador = new Interface("INotificador", ["obterCanal", "enviarAlerta"]);

// «interface» IExportavelJson
//   + paraJson() : string
const IExportavelJson = new Interface("IExportavelJson", ["paraJson"]);
