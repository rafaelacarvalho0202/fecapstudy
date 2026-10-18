// Testes automáticos das regras de negócio (Missões 1 a 8).
// Como rodar (opcional, precisa do Node.js):   node testes/testar-dominio.js
const assert = require("assert");
const C = require("./carregar-dominio.js")();

let ok = 0;
const teste = (nome, fn) => {
    try { fn(); ok++; console.log(`  ✔ ${nome}`); }
    catch (e) { console.log(`  ✘ ${nome}\n     ${e.message}`); process.exitCode = 1; }
};

const poo = new C.Disciplina("ADS201", "POO", "Computação", 4);

console.log("Missão 1");
teste("carga <= 0 vira 2h", () => assert.strictEqual(new C.Disciplina("X", "Y", "Z", -4).calcularCargaEmMinutos(), 120));
teste("exibirResumo no formato pedido", () =>
    assert.strictEqual(poo.exibirResumo(), "[ADS201] POO (Computação) — 4h/semana (240 min)"));

console.log("Missão 2");
teste("teste de mesa da MetaEstudo", () => {
    const m = new C.MetaEstudo(100);
    assert.strictEqual(m.registrarAvanco(-20), false);
    assert.strictEqual(m.registrarAvanco(900), false);
    assert.strictEqual(m.getMinutosCumpridos(), 0);
    assert.strictEqual(m.registrarAvanco(60), true);
    assert.strictEqual(m.calcularPercentual(), 60);
});
teste("meta travada entre 30 e 3000", () => {
    assert.strictEqual(new C.MetaEstudo(5).getMetaMinutosSemana(), 30);
    assert.strictEqual(new C.MetaEstudo(5000).getMetaMinutosSemana(), 3000);
});
teste("percentual trava em 100", () => {
    const m = new C.MetaEstudo(30); m.registrarAvanco(400);
    assert.strictEqual(m.calcularPercentual(), 100); assert.ok(m.estaCumprida());
});

console.log("Missão 3");
teste("Usuario não pode ser instanciado", () => assert.throws(() => new C.Usuario(1, "a", "b", "c")));
teste("sem getter de senha + autenticar", () => {
    const d = new C.Discente(1, "Ana", "a@a", "s3nha", "RA1");
    assert.strictEqual(d.getSenha, undefined);
    assert.ok(d.autenticar("s3nha")); assert.ok(!d.autenticar("x"));
});

console.log("Missão 4");
teste("fórmulas de XP das 3 modalidades", () => {
    assert.strictEqual(new C.SessaoPomodoro(poo, 50, 2).calcularXp(), 130);
    assert.strictEqual(new C.SessaoExercicios(poo, 30, 10, 8).calcularXp(), 110);
    assert.strictEqual(new C.SessaoLeitura(poo, 40, 12, true).calcularXp(), 101);
    assert.strictEqual(new C.SessaoLeitura(poo, 40, 12, false).calcularXp(), 76);
});
teste("SessaoEstudo é abstrata", () => assert.throws(() => new C.SessaoEstudo(poo, 10)));

console.log("Missão 5");
teste("3 formas de registrarEstudo", () => {
    const d = new C.Discente(1, "Ana", "a@a", "s", "RA1");
    d.registrarEstudo(new C.SessaoPomodoro(poo, 25, 1));
    const f2 = d.registrarEstudo(poo, 60);
    const f3 = d.registrarEstudo(poo, 14, 16, 10);
    assert.ok(f2 instanceof C.SessaoPomodoro); assert.strictEqual(f2.getCiclosCompletos(), 2);
    assert.ok(f3 instanceof C.SessaoLeitura); assert.strictEqual(f3.getDuracaoMinutos(), 120);
    assert.strictEqual(d.getHistorico().length, 3);
    assert.strictEqual(d.getXpTotal(), 65 + 150 + (120 + 30 + 25));
});
teste("histórico não pode ser alterado por fora", () => {
    const d = new C.Discente(1, "Ana", "a@a", "s", "RA1");
    d.registrarEstudo(poo, 25); d.getHistorico().pop();
    assert.strictEqual(d.getHistorico().length, 1);
});

console.log("Missão 6");
teste("notificadores cumprem INotificador", () => {
    for (const n of [new C.NotificadorEmail(), new C.NotificadorWhatsApp(), new C.NotificadorPainel()])
        assert.ok(C.Interface.implementa(n, C.INotificador));
    assert.ok(!C.Interface.implementa({}, C.INotificador));
});
teste("paraJson com os campos do backend", () => {
    const j = JSON.parse(new C.SessaoPomodoro(poo, 25, 1).paraJson());
    assert.deepStrictEqual(Object.keys(j).sort(),
        ["dataRegistro", "disciplina", "duracaoMinutos", "resumoFeedback", "tipoModalidade", "xpGanho"]);
});

console.log("Missão 7");
teste("vincularDiscente não duplica", () => {
    const r = new C.Responsavel(1, "R", "r@r", "s", "Mãe"); const d = new C.Discente(2, "D", "d@d", "s", "RA");
    assert.ok(r.vincularDiscente(d)); assert.ok(!r.vincularDiscente(d));
    assert.strictEqual(r.getDiscentes().length, 1);
});
teste("agregação: mesma disciplina em 2 trilhas", () => {
    const a = new C.Administrador(1, "A", "a@a", "s", "Coord");
    const t1 = new C.TrilhaEstudo("T1", a), t2 = new C.TrilhaEstudo("T2", a);
    t1.adicionarDisciplina(poo); t2.adicionarDisciplina(poo);
    assert.strictEqual(t1.calcularCargaHorariaTotal() + t2.calcularCargaHorariaTotal(), 8);
});

console.log("Missão 8");
teste("composição: plano cria os itens e não expõe a lista", () => {
    const p = new C.PlanoEstudo();
    assert.ok(p.adicionarItem("Segunda", 60)); assert.ok(!p.adicionarItem("Feriado", 60));
    assert.strictEqual(p.calcularTotalPlanejado(), 60);
    assert.strictEqual(typeof p.listarResumo()[0], "string");
});
teste("serviço de alerta parabeniza em 100%", () => {
    const r = new C.Responsavel(1, "R", "r@r", "s", "Pai"); const d = new C.Discente(2, "D", "d@d", "s", "RA");
    r.vincularDiscente(d); const m = r.definirMeta(d, 30); m.registrarAvanco(30);
    const res = new C.ServicoAlertaResponsavel().avaliarDiscente(d, m, r, new C.NotificadorEmail());
    assert.ok(res.enviado); assert.ok(res.mensagem.startsWith("Parabéns"));
});

console.log(`\n${ok} teste(s) passaram.`);
