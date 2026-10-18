// Carrega os scripts do front (que são scripts "clássicos" do navegador) dentro do Node.
const fs = require("fs"), path = require("path"), vm = require("vm");
module.exports = function carregar() {
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, AbortController, fetch: globalThis.fetch });
  const raiz = path.join(__dirname, "..", "js");
  const arquivos = [
    ...fs.readdirSync(path.join(raiz, "dominio")).sort().map((f) => path.join(raiz, "dominio", f)),
    path.join(raiz, "demo-missoes.js"), path.join(raiz, "ClienteBackendEstudo.js"),
  ];
  let codigo = arquivos.map((f) => fs.readFileSync(f, "utf8")).join("\n;\n");
  // expõe as classes para o teste
  codigo += "\n;globalThis.__ = {Disciplina,MetaEstudo,Usuario,Administrador,Responsavel,Discente,SessaoEstudo,SessaoPomodoro,SessaoExercicios,SessaoLeitura,Interface,INotificador,IExportavelJson,NotificadorEmail,NotificadorWhatsApp,NotificadorPainel,TrilhaEstudo,PlanoEstudo,ItemCronograma,ServicoAlertaResponsavel,ClienteBackendEstudo,executarDemonstracaoMissoes};";
  vm.runInContext(codigo, ctx);
  return ctx.__;
};
