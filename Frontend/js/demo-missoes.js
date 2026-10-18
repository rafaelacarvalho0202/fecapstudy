/*
 * "PROGRAMA PRINCIPAL" DAS MISSÕES 1 a 8
 *
 * Cada missão pede para instanciar objetos e imprimir resultados. Esta função
 * faz isso, missão por missão, incluindo os "testes de mesa" pedidos nas dicas.
 * Na tela, o botão "Rodar demonstração" mostra a saída; ela também aparece no
 * console do navegador (F12).
 */

/**
 * Executa a demonstração das Missões 1 a 8, uma após a outra.
 * Usa objetos próprios (não mexe nos dados da tela).
 * @param {function(string): void} [log] - Função que recebe cada linha de saída (padrão: console.log).
 */
function executarDemonstracaoMissoes(log = console.log) {
    const titulo = (t) => log(`\n===== ${t} =====`);

    // Missão 1
    titulo("Missão 1 — Abstração, Classes e Objetos");
    const poo = new Disciplina("ADS201", "Programação Orientada a Objetos", "Computação", 4);
    const bd = new Disciplina("ADS202", "Banco de Dados e Modelagem SQL", "Dados", 4);
    const pi = new Disciplina("ADS203", "Projeto Interdisciplinar (PI)", "Prática", 6);
    [poo, bd, pi].forEach((d) => log(d.exibirResumo()));
    const corrigida = new Disciplina("TST001", "Teste de carga negativa", "Teste", -4);
    log(`Carga -4h corrigida para: ${corrigida.getCargaHorariaSemanalHoras()}h (${corrigida.calcularCargaEmMinutos()} min)`);

    // Missão 2
    titulo("Missão 2 — Encapsulamento (MetaEstudo)");
    const meta = new MetaEstudo(100);
    log(`registrarAvanco(-20) -> ${meta.registrarAvanco(-20)}`);
    log(`registrarAvanco(900) -> ${meta.registrarAvanco(900)}`);
    log(`Minutos cumpridos depois das tentativas inválidas: ${meta.getMinutosCumpridos()}`);
    log(`registrarAvanco(60) -> ${meta.registrarAvanco(60)} | percentual: ${meta.calcularPercentual()}%`);
    meta.minutosCumpridos = 99999; // tentativa de "sabotagem": cria outra propriedade, não mexe no #privado
    log(`Após "meta.minutosCumpridos = 99999": percentual continua ${meta.calcularPercentual()}%`);
    log(`new MetaEstudo(10) vira ${new MetaEstudo(10).getMetaMinutosSemana()} min; new MetaEstudo(9999) vira ${new MetaEstudo(9999).getMetaMinutosSemana()} min`);

    // Missão 3
    titulo("Missão 3 — Classe Abstrata e Herança");
    try {
        new Usuario(0, "Genérico", "x@x.com", "123");
    } catch (e) {
        log(`new Usuario(...) -> erro: ${e.message}`);
    }
    const admin = new Administrador(1, "Profa. Helena", "helena@fecap.br", "admin123", "Coordenação PI");
    const resp = new Responsavel(2, "Carlos Silva", "carlos@email.com", "pai123", "Pai");
    const lucas = new Discente(3, "Lucas Silva", "lucas.silva@edu.fecap.br", "lucas123", "RA-2026101");
    const usuarios = [admin, resp, lucas];
    usuarios.forEach((u) => log(`[${u.obterTipoPerfil()}] ${u.gerarPainelResumo()}`));
    log(`lucas.autenticar("errada") -> ${lucas.autenticar("errada")} | lucas.autenticar("lucas123") -> ${lucas.autenticar("lucas123")}`);
    log(`Existe getSenha()? ${typeof lucas.getSenha === "function" ? "sim" : "não"}`);

    // Missão 4
    titulo("Missão 4 — Polimorfismo Dinâmico");
    const sessoes = [
        new SessaoPomodoro(poo, 50, 2),
        new SessaoExercicios(bd, 30, 10, 8),
        new SessaoLeitura(pi, 40, 12, true)
    ];
    let xpTotal = 0;
    for (const sessao of sessoes) { // nenhum if testando o tipo!
        log(sessao.gerarFeedback());
        xpTotal += sessao.calcularXp();
    }
    log(`XP total da lista polimórfica: ${xpTotal}`);

    // Missão 5
    titulo("Missão 5 — Polimorfismo Estático (sobrecarga de registrarEstudo)");
    lucas.registrarEstudo(new SessaoExercicios(poo, 20, 5, 4));     // Forma 1
    lucas.registrarEstudo(bd, 50);                                  // Forma 2 (Pomodoro, 2 ciclos)
    lucas.registrarEstudo(pi, 14, 16, 20);                          // Forma 3 (Leitura 120 min)
    lucas.getHistorico().forEach((s, i) => log(`Forma ${i + 1}: ${s.gerarFeedback()}`));
    log(lucas.gerarPainelResumo());

    // Missão 6
    titulo("Missão 6 — Interfaces");
    const notificadores = [new NotificadorEmail(), new NotificadorWhatsApp(), new NotificadorPainel()];
    for (const n of notificadores) {
        const ok = n.enviarAlerta(resp.getEmail(), "Teste de alerta do FecapStudy");
        log(`${n.obterCanal()} implementa INotificador? ${Interface.implementa(n, INotificador)} | enviado: ${ok}`);
    }
    log(`Objeto comum {} implementa INotificador? ${Interface.implementa({}, INotificador)}`);
    log(`MetaEstudo.paraJson(): ${meta.paraJson()}`);
    log(`SessaoPomodoro.paraJson(): ${sessoes[0].paraJson()}`);

    // Missão 7
    titulo("Missão 7 — Associação e Agregação");
    const mariana = new Discente(4, "Mariana Costa", "mariana.costa@edu.fecap.br", "mari123", "RA-2026102");
    log(`vincularDiscente(lucas) -> ${resp.vincularDiscente(lucas)}`);
    log(`vincularDiscente(lucas) de novo -> ${resp.vincularDiscente(lucas)} (não duplica)`);
    log(`vincularDiscente(mariana) -> ${resp.vincularDiscente(mariana)}`);
    log(resp.gerarPainelResumo());
    const trilhaAds = new TrilhaEstudo("Trilha 2º Semestre ADS", admin);
    const trilhaDados = new TrilhaEstudo("Trilha Dados", admin);
    [poo, bd, pi].forEach((d) => trilhaAds.adicionarDisciplina(d));
    trilhaDados.adicionarDisciplina(bd); // a MESMA disciplina em duas trilhas
    log(trilhaAds.exibirResumo());
    log(trilhaDados.exibirResumo());
    trilhaAds.removerDisciplina(bd);
    log(`Removida da trilha ADS, "${bd.getNome()}" continua existindo: ${bd.exibirResumo()}`);

    // Missão 8
    titulo("Missão 8 — Composição e Dependência");
    const plano = new PlanoEstudo();
    plano.adicionarItem("Segunda", 60);
    plano.adicionarItem("Quarta", 45);
    plano.adicionarItem("Sexta", 75);
    log(`adicionarItem("Feriado", 30) -> ${plano.adicionarItem("Feriado", 30)} (dia inválido)`);
    plano.listarResumo().forEach((linha) => log(`  ${linha}`));
    log(`Total planejado: ${plano.calcularTotalPlanejado()} min em ${plano.quantidadeItens()} itens`);

    const metaLucas = resp.definirMeta(lucas, 180);
    metaLucas.registrarAvanco(90);
    const servico = new ServicoAlertaResponsavel();
    for (const n of [new NotificadorEmail(), new NotificadorWhatsApp()]) {
        const r = servico.avaliarDiscente(lucas, metaLucas, resp, n);
        log(`[${r.canal}] enviado=${r.enviado} -> ${r.mensagem}`);
    }
    metaLucas.registrarAvanco(90);
    const final = servico.avaliarDiscente(lucas, metaLucas, resp, new NotificadorPainel());
    log(`[${final.canal}] -> ${final.mensagem}`);

    log("\nDemonstração concluída.");
}
