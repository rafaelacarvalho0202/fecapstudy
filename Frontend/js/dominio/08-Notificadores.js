/*
 * MISSÃO 6 (parte 2) — Classes que assinam a interface INotificador
 * Conceito: INTERFACE + POLIMORFISMO
 *
 * Email, WhatsApp e Painel são classes sem parentesco entre si. O que elas
 * têm em comum é só o CONTRATO: obterCanal() e enviarAlerta(dest, msg).
 * Quem usa um notificador (ServicoAlertaResponsavel) não sabe como a
 * mensagem viaja — e nem precisa saber.
 *
 * Neste projeto o envio é simulado: cada notificador guarda as mensagens
 * "enviadas" e avisa a tela por um callback opcional (aoEnviar), assim a
 * classe de domínio não depende do HTML.
 */

/** Notificador por e-mail (implementa INotificador). O envio é simulado. */
class NotificadorEmail {
    #enviados = [];
    #aoEnviar;

    /** @param {function(object): void} [aoEnviar] - Callback chamado a cada envio (a tela mostra o aviso). */
    constructor(aoEnviar = null) { this.#aoEnviar = aoEnviar; }

    /** @returns {string} "E-mail" */
    obterCanal() { return "E-mail"; }

    /**
     * Envia um alerta; o destinatário precisa ter "@".
     * @param {string} destinatario - E-mail de destino.
     * @param {string} mensagem - Texto do alerta.
     * @returns {boolean} true se enviou.
     */
    enviarAlerta(destinatario, mensagem) {
        // Regra simples: e-mail precisa ter "@"
        if (!destinatario || !String(destinatario).includes("@") || !mensagem) return false;
        const registro = { canal: this.obterCanal(), destinatario, mensagem, assunto: "FecapStudy — acompanhamento" };
        this.#enviados.push(registro);
        this.#aoEnviar?.(registro);
        return true;
    }

    /**
     * Mensagens enviadas.
     * @returns {object[]} Cópia da lista.
     */
    getEnviados() { return [...this.#enviados]; }
}

/** Notificador por WhatsApp (implementa INotificador). Mensagens passam por um limite de 300 caracteres. */
class NotificadorWhatsApp {
    #enviados = [];
    #aoEnviar;

    /** @param {function(object): void} [aoEnviar] - Callback chamado a cada envio. */
    constructor(aoEnviar = null) { this.#aoEnviar = aoEnviar; }

    /** @returns {string} "WhatsApp" */
    obterCanal() { return "WhatsApp"; }

    /**
     * Envia um alerta, cortando mensagens maiores que 300 caracteres.
     * @param {string} destinatario - Número ou contato de destino.
     * @param {string} mensagem - Texto do alerta.
     * @returns {boolean} true se enviou.
     */
    enviarAlerta(destinatario, mensagem) {
        if (!destinatario || !mensagem) return false;
        // WhatsApp tem limite de tamanho por mensagem; cortamos para simular.
        const texto = mensagem.length > 300 ? mensagem.slice(0, 297) + "..." : mensagem;
        const registro = { canal: this.obterCanal(), destinatario, mensagem: texto };
        this.#enviados.push(registro);
        this.#aoEnviar?.(registro);
        return true;
    }

    /**
     * Mensagens enviadas.
     * @returns {object[]} Cópia da lista.
     */
    getEnviados() { return [...this.#enviados]; }
}

/** Notificador pelo painel interno (implementa INotificador). */
class NotificadorPainel {
    #enviados = [];
    #aoEnviar;

    /** @param {function(object): void} [aoEnviar] - Callback chamado a cada envio. */
    constructor(aoEnviar = null) { this.#aoEnviar = aoEnviar; }

    /** @returns {string} "Painel" */
    obterCanal() { return "Painel"; }

    /**
     * Envia um alerta; só exige mensagem.
     * @param {string} destinatario - Destino (opcional neste canal).
     * @param {string} mensagem - Texto do alerta.
     * @returns {boolean} true se enviou.
     */
    enviarAlerta(destinatario, mensagem) {
        if (!mensagem) return false;
        const registro = { canal: this.obterCanal(), destinatario, mensagem };
        this.#enviados.push(registro);
        this.#aoEnviar?.(registro);
        return true;
    }

    /**
     * Mensagens enviadas.
     * @returns {object[]} Cópia da lista.
     */
    getEnviados() { return [...this.#enviados]; }
}

// "Assinando" a interface — se faltar algum método, dá erro ao carregar a página.
Interface.garantir(NotificadorEmail, INotificador);
Interface.garantir(NotificadorWhatsApp, INotificador);
Interface.garantir(NotificadorPainel, INotificador);
