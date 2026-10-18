/*
 * MISSÃO 8 (parte 2) — ServicoAlertaResponsavel - - -> Discente, MetaEstudo, INotificador
 * Conceito: DEPENDÊNCIA
 *
 * O serviço NÃO tem atributos de instância. Ele só usa os objetos que
 * recebe como parâmetro durante a execução do método e depois os "esquece".
 * Graças à interface, dá para passar NotificadorEmail, NotificadorWhatsApp
 * ou NotificadorPainel sem mudar uma linha desta classe.
 */

/** Serviço que avalia o progresso do discente e avisa o responsável (DEPENDÊNCIA: não guarda estado). */
class ServicoAlertaResponsavel {
    /**
     * Monta a mensagem conforme a meta e a envia pelo canal escolhido.
     * @param {Discente} discente - Discente avaliado.
     * @param {MetaEstudo} meta - Meta do discente.
     * @param {Responsavel} responsavel - Quem recebe o alerta.
     * @param {INotificador} notificador - Canal de envio (qualquer objeto que cumpra o contrato).
     * @returns {{enviado: boolean, canal: string, mensagem: string}} Resultado do envio.
     * @throws {Error} Se o notificador não cumprir INotificador.
     */
    avaliarDiscente(discente, meta, responsavel, notificador) {
        if (!Interface.implementa(notificador, INotificador)) {
            throw new Error("O notificador informado não cumpre o contrato INotificador.");
        }

        const percentual = meta.calcularPercentual();
        let mensagem;
        if (meta.estaCumprida()) {
            mensagem = `Parabéns! ${discente.getNome()} concluiu 100% da meta semanal ` +
                       `(${meta.getMinutosCumpridos()} de ${meta.getMetaMinutosSemana()} min) ` +
                       `e já soma ${discente.getXpTotal()} XP.`;
        } else {
            const faltam = meta.getMetaMinutosSemana() - meta.getMinutosCumpridos();
            mensagem = `${discente.getNome()} está com ${percentual}% da meta semanal ` +
                       `(${meta.getMinutosCumpridos()} de ${meta.getMetaMinutosSemana()} min). ` +
                       `Faltam ${faltam} min.`;
        }

        const enviado = notificador.enviarAlerta(responsavel.getEmail(), mensagem);
        return { enviado, canal: notificador.obterCanal(), mensagem };
    }
}
