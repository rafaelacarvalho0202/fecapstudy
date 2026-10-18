/*
 * MISSÃO 3 — Usuario (abstrata) → Administrador, Responsavel, Discente
 * Conceitos: CLASSE ABSTRATA, HERANÇA e ENCAPSULAMENTO da senha
 *
 * Não existe "usuário genérico": toda pessoa é Administrador, Responsável ou
 * Discente. Como o JS não tem "abstract", bloqueamos a instanciação direta
 * com new.target, e os métodos abstratos lançam erro se a filha esquecer
 * de sobrescrevê-los.
 *
 * Responsavel e Discente estão em arquivos próprios (07 e 06), pois
 * participam também das Missões 5 e 7.
 */

/**
 * Usuário do sistema (CLASSE ABSTRATA): não pode ser instanciado diretamente.
 * A senha é privada e não existe getSenha().
 */
class Usuario {
    #id;
    #nome;
    #email;
    #senha; // totalmente privada: NÃO existe getSenha()

    /**
     * Valida a abstração e guarda os dados básicos.
     * @param {number} id - Identificador do usuário.
     * @param {string} nome - Nome completo.
     * @param {string} email - E-mail usado no login.
     * @param {string} senha - Senha (fica só dentro do objeto).
     * @throws {Error} Se for chamado diretamente com new Usuario().
     */
    constructor(id, nome, email, senha) {
        if (new.target === Usuario) {
            throw new Error("Usuario é uma classe abstrata! Instancie Administrador, Responsavel ou Discente.");
        }
        this.#id = id;
        this.#nome = String(nome ?? "").trim();
        this.#email = String(email ?? "").trim();
        this.#senha = String(senha ?? "");
    }

    /**
     * Identificador do usuário.
     * @returns {number}
     */
    getId() { return this.#id; }
    /**
     * Nome do usuário.
     * @returns {string}
     */
    getNome() { return this.#nome; }
    /**
     * E-mail do usuário.
     * @returns {string}
     */
    getEmail() { return this.#email; }

    /**
     * Confere a senha sem expô-la.
     * Método concreto: compara sem nunca expor a senha.
     * @param {string} senhaDigitada - Senha informada na tela de login.
     * @returns {boolean} true se a senha confere.
     */
    autenticar(senhaDigitada) {
        return this.#senha.length > 0 && senhaDigitada === this.#senha;
    }

    // Métodos abstratos (as filhas DEVEM sobrescrever)
    /**
     * Nome do perfil (abstrato: as filhas sobrescrevem).
     * @returns {string}
     */
    obterTipoPerfil() {
        throw new Error(`${this.constructor.name} precisa implementar obterTipoPerfil()`);
    }

    /**
     * Texto de resumo do usuário (abstrato: as filhas sobrescrevem).
     * @returns {string}
     */
    gerarPainelResumo() {
        throw new Error(`${this.constructor.name} precisa implementar gerarPainelResumo()`);
    }

    // Usados pela tela de login (polimorfismo: cada perfil responde do seu jeito)
    /**
     * Permissões do perfil (polimorfismo); padrão: nenhuma.
     * Por padrão, o usuário não pode nada; cada filha sobrescreve com as suas permissões.
     * @returns {{registrarEstudo: boolean, definirMeta: boolean, notificarResponsavel: boolean}}
     */
    obterPermissoes() {
        return { registrarEstudo: false, definirMeta: false, notificarResponsavel: false };
    }

    /**
     * Discentes que o usuário pode acompanhar.
     * Quais discentes este usuário pode acompanhar na tela.
     * @param {Discente[]} todosDiscentes - Todos os discentes do sistema.
     * @returns {Discente[]}
     */
    obterDiscentesVisiveis(todosDiscentes) {
        return [];
    }
}

/** Administrador (coordenação): acompanha todos os discentes e ajusta metas. */
class Administrador extends Usuario {
    #cargo;

    /**
     * Cria um administrador.
     * @param {number} id - Identificador.
     * @param {string} nome - Nome completo.
     * @param {string} email - E-mail de login.
     * @param {string} senha - Senha.
     * @param {string} cargo - Cargo na faculdade.
     */
    constructor(id, nome, email, senha, cargo) {
        super(id, nome, email, senha);
        this.#cargo = String(cargo ?? "Administração");
    }

    /**
     * Cargo do administrador.
     * @returns {string}
     */
    getCargo() { return this.#cargo; }

    /** @returns {string} "Administrador" */
    obterTipoPerfil() { return "Administrador"; }

    /**
     * Resumo do administrador.
     * @returns {string}
     */
    gerarPainelResumo() {
        return `Administrador: ${this.getNome()} — ${this.#cargo}`;
    }

    /**
     * Permissões do administrador.
     * A coordenação acompanha todos os discentes e pode ajustar metas.
     * @returns {{registrarEstudo: boolean, definirMeta: boolean, notificarResponsavel: boolean}}
     */
    obterPermissoes() {
        return { registrarEstudo: false, definirMeta: true, notificarResponsavel: true };
    }

    /**
     * O administrador enxerga todos os discentes.
     * @param {Discente[]} todosDiscentes - Todos os discentes do sistema.
     * @returns {Discente[]} Cópia da lista completa.
     */
    obterDiscentesVisiveis(todosDiscentes) {
        return [...todosDiscentes];
    }
}
