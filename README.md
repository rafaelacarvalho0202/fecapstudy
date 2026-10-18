# Intengrante

Rafaela Carvalho Barcos Mello - 26029304

# FecapStudy — Plataforma de Apoio ao Estudo

**Disciplina:** Programação Orientada a Objetos — Mini-Projeto (Aula 9)

O FecapStudy é uma plataforma web para acompanhar a rotina de estudos de
alunos universitários. O aluno registra o que estudou, ganha pontos de
experiência (XP) e vê o quanto já cumpriu da meta semanal. O responsável
acompanha esse progresso e recebe alertas. A coordenação tem uma visão
geral de todos os alunos.

## O problema que o projeto resolve

Durante o semestre, três situações costumam acontecer ao mesmo tempo:

- **Alunos** estudam sem métricas claras de foco e deixam matérias acumularem.
- **Responsáveis** querem apoiar e acompanhar as metas sem precisar cobrar o tempo todo.
- **Coordenadores** precisam organizar as disciplinas e acompanhar o engajamento da turma.

O FecapStudy junta os três em um só lugar: o aluno registra, o sistema calcula
o progresso e quem acompanha vê o resultado.

## O que o sistema faz

### Perfis de acesso

| Perfil | O que pode fazer |
|---|---|
| **Discente** (aluno) | Registrar as próprias sessões de estudo, acompanhar o XP e a meta |
| **Responsável** | Ver os alunos vinculados a ele, definir a meta semanal e enviar alertas |
| **Administrador** (coordenação) | Ver todos os alunos e ajustar metas |

Cada perfil vê e faz apenas o que lhe cabe.

### Funcionalidades

- **Login** com e-mail e senha.
- **Registro de sessões de estudo** em três modalidades, cada uma com o próprio cálculo de XP:

  | Modalidade | Como o XP é calculado |
  |---|---|
  | Pomodoro | `duração × 2 + ciclos × 15` |
  | Exercícios | `duração + acertos × 10` |
  | Leitura | `duração + páginas × 3 + 25 (se fez resumo)` |

- **Prévia do XP** antes de registrar.
- **Registro rápido:** informa só a disciplina e os minutos, e o sistema cria um Pomodoro padrão.
- **Meta semanal** com barra de progresso, limitada entre 30 e 3000 minutos.
- **Histórico** das sessões, indicando quais já foram gravadas no servidor.
- **Alertas para o responsável** por e-mail, WhatsApp ou painel (envio simulado).
- **Relatório do servidor:** total de sessões, minutos, XP e percentual da meta, lidos do banco.
- **Indicador de conexão** no topo da tela, mostrando se a API e o MySQL estão disponíveis.

### Regras de negócio

- Uma sessão precisa ter de 1 a 480 minutos. Acima disso, é recusada como provável erro de digitação.
- Em exercícios, o número de acertos não pode passar o total de questões.
- A meta só aumenta por meio do registro de estudos; não é possível alterar os minutos cumpridos diretamente.
- A senha fica guardada só dentro do objeto do usuário e nunca é exibida nem enviada ao servidor.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Interface | HTML5, CSS3 e JavaScript (classes ES6), sem frameworks |
| API | C# / ASP.NET Core (`http://localhost:5080`) |
| Banco de dados | MySQL (banco `fecap_estudo`) |

Não é preciso instalar pacotes nem fazer build: a interface abre direto pelo `index.html`.

## Como executar

**Pré-requisitos:** MySQL rodando e .NET 10 (ASP.NET Core Runtime) instalado.

1. Inicie o **MySQL**.
2. Em `Backend/mysql_config.txt`, ajuste a senha do usuário `root`, se houver:
   ```
   Server=localhost;Port=3306;Database=fecap_estudo;Uid=root;Pwd=SUA_SENHA;
   ```
   Se o arquivo não existir, a API cria um com a senha vazia.
3. Execute `Backend/iniciar_backend.bat`. Na primeira execução, a API cria o
   banco `fecap_estudo`, as tabelas e alguns dados de exemplo.
4. Abra `Frontend/index.html` no navegador.

O indicador no topo da tela mostra o estado da conexão:

| Indicador | Significado |
|---|---|
| "Backend online · MySQL conectado" | Tudo funcionando; os dados vão para o MySQL |
| "Backend online · modo JSON (sem MySQL)" | API ativa, mas sem banco; os dados vão para um arquivo local |
| "Backend offline" | API fechada; a tela funciona só em memória |

### Contas de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Discente | `lucas.silva@edu.fecap.br` | `lucas123` |
| Discente | `mariana.costa@edu.fecap.br` | `mari123` |
| Responsável | `carlos@email.com` | `pai123` |
| Administrador | `helena@fecap.br` | `admin123` |

Na tela de login, clicar em uma conta preenche os campos automaticamente.

### Roteiro de uso

1. Entre como **Lucas** e registre uma sessão de cada modalidade. Veja a prévia do XP, o histórico e a barra de meta.
2. Use o **Registro rápido**.
3. Clique em **Carregar Histórico do Servidor / Relatório** para ver o que foi gravado no banco.
4. Saia e entre como **Carlos**: altere a meta do Lucas e envie um alerta.
5. Entre como **Helena** e como **Mariana** para comparar o que cada perfil pode fazer.
6. No fim da página, clique em **Rodar demonstração** para ver as classes de cada missão funcionando.

Para conferir no banco:
```sql
SELECT * FROM fecap_estudo.sessoes_estudo ORDER BY id DESC;
```

---

## Programação Orientada a Objetos

O projeto aplica os conceitos estudados na disciplina. Caminhos relativos a `Frontend/`.

| Missão | Conceito | Onde está |
|---|---|---|
| 1 | Abstração, classe e objeto | `js/dominio/01-Disciplina.js` |
| 2 | Encapsulamento | `js/dominio/03-MetaEstudo.js`: estado privado; os minutos só mudam por `registrarAvanco()`, que valida |
| 3 | Classe abstrata e herança | `04-Usuario.js` (`Usuario`, `Administrador`), `06-Discente.js`, `07-Responsavel.js` |
| 4 | Polimorfismo dinâmico | `05-SessaoEstudo.js`: `calcularXp()` e `gerarFeedback()` sobrescritos em cada modalidade |
| 5 | Polimorfismo estático (sobrecarga) | `06-Discente.js`: `registrarEstudo()` com 3 formas de chamada |
| 6 | Interfaces | `02-Interfaces.js` (`INotificador`, `IExportavelJson`), `08-Notificadores.js` |
| 7 | Associação e agregação | `07-Responsavel.js` (Responsável → Discente), `09-TrilhaEstudo.js` (Trilha ◇ Disciplina) |
| 8 | Composição e dependência | `10-PlanoEstudo.js` (Plano ◆ Item), `11-ServicoAlertaResponsavel.js` |
| 9 | Interface gráfica | `index.html`, `css/style.css`, `js/app.js` |
| 10 | Integração com API e banco | `js/ClienteBackendEstudo.js` |

### Como o JavaScript representa esses conceitos

- **Classe abstrata:** o construtor impede a criação direta (`new.target`), e os
  métodos abstratos lançam erro se a subclasse não os implementar.
- **Interface:** cada contrato lista os métodos obrigatórios.
  `Interface.garantir()` confere, ao carregar a página, se a classe implementa
  todos eles, e `Interface.implementa()` faz a mesma checagem em tempo de execução.
- **Sobrecarga:** um único `registrarEstudo(...)` examina os argumentos recebidos
  e escolhe entre as três formas de registro.
- **Encapsulamento:** campos `#privados`, sem getter para a senha, e listas
  sempre devolvidas como cópia.
- **Permissões por polimorfismo:** cada perfil sobrescreve `obterPermissoes()` e
  `obterDiscentesVisiveis()`, então a tela nunca testa o tipo do usuário com `if`.

---

## Arquitetura

O código é dividido em camadas, e cada uma só conhece a de baixo:

```
 index.html + css/style.css        apresentação
            │
        js/app.js                  tela: lê os campos, chama os objetos, atualiza a página
            │
 ┌──────────┴───────────┐
 js/dominio/*.js     js/ClienteBackendEstudo.js
 regras de negócio    comunicação com a API
```

- As classes de domínio não conhecem HTML nem HTTP.
- A tela não contém regra de negócio: não há nenhuma fórmula de XP em `app.js`.
- Só o `ClienteBackendEstudo` se comunica com a API.
- A página é montada sem `innerHTML`, evitando injeção de HTML.

**Fluxo de "Registrar Estudo":** a tela lê os campos → cria a modalidade certa de
`SessaoEstudo` → a `MetaEstudo` valida os minutos → o `Discente` soma o XP → o
`ClienteBackendEstudo` envia a sessão para a API (`POST /api/sessoes`), que grava no MySQL.

### Rotas da API utilizadas

| Rota | Uso na tela |
|---|---|
| `GET /api/status` | Indicador de conexão |
| `POST /api/sessoes` | Gravar cada estudo registrado |
| `POST /api/metas` | Gravar a meta definida pelo responsável |
| `GET /api/relatorio/{discente}` | Relatório do servidor |

### Estrutura de pastas

```
├── Backend/                          API em C# + configuração do MySQL
└── Frontend/
    ├── index.html                    página única (login + tela principal)
    ├── css/style.css                 estilos
    ├── img/logo.png                  logotipo
    ├── js/
    │   ├── dominio/                  classes de negócio (01 a 11)
    │   ├── ClienteBackendEstudo.js   comunicação com a API
    │   ├── demo-missoes.js           demonstração das Missões 1 a 8
    │   └── app.js                    eventos e atualização da tela
    └── testes/                       testes automatizados
```

A numeração dos arquivos em `dominio/` segue a ordem de carregamento: contratos e
classes base vêm antes das classes derivadas.

## Testes

Há 17 testes automatizados das regras de negócio, que rodam com Node.js sem
instalar nada:

```
cd Frontend
node testes/testar-dominio.js
```

## Observações

- O histórico da tela fica na memória da página: ao recarregar (F5), ele é zerado.
  O que já foi gravado no banco continua disponível pelo relatório do servidor.
- Os alertas por e-mail, WhatsApp e painel são simulados: a mensagem é gerada e
  mostrada na tela, sem envio real.
