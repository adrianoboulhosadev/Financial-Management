# CLAUDE.md — guia de engenharia do Financial

Instruções e padrões deste monorepo. **Siga à risca** — estas decisões estão travadas.
Para contexto de produto, veja o `README.md`.

> **Idioma do código: INGLÊS.** O projeto inteiro é em inglês — tabelas/colunas do banco,
> arquivos, pastas, tipos, funções, variáveis, rotas, códigos de erro e comentários. **Nada de
> português no código.** Este guia (CLAUDE.md) e as mensagens de commit ficam em PT. O **texto
> que o usuário lê na tela** também é português.

## Base de referência

Este projeto nasce copiando o **Devs-Bet**: monorepo Turborepo, pacotes por bounded context
(`packages/<ctx>/{core,adapters}`), `shared`/`database` separados, CQRS, portas, driven adapters
no app, `DomainExceptionFilter` global, JWT stateful, worker BullMQ, kebab-case, código em inglês,
**modelagem rica** (entidades com comportamento e invariantes + value objects). A **autenticação é
cópia direta** dele, com o login com Google desligado pelo interruptor da chave — **menos a
portaria de aprovação, que aqui não existe**: este é um produto aberto ao público. Onde os dois
divergem, vale o que está escrito aqui.

## Visão geral

Monorepo **Turborepo + npm workspaces** em TypeScript. Arquitetura **hexagonal (ports & adapters)
por bounded context**, com **modelagem RICA** (regras de negócio moram no modelo, não nos casos de
uso).

Contextos de domínio: `auth`, `category`, `transaction`, `budget`, `income`, `notification`.
O `auth` é a **referência canônica** de fiação (core → adapters → backend).

Fluxo do produto: o usuário monta a **árvore de categorias** dele (casa → contas → luz), cadastra a
**renda** (salário), define **orçamentos** por categoria (lazer = R$500) e vai **lançando** cada
gasto. O dashboard responde a pergunta que o produto existe pra responder: **quanto sobra no mês**.
O que se repete todo mês vira **recorrência** e o worker lança sozinho.

**Deployables de produção: 2** — `backend` (API web) e `worker` (recorrências + alerta de
orçamento). O `web` é o front. Postgres/Redis sobem via docker no dev.

## Estrutura

```
packages/
  shared/                              # kernel: Id, Entity, AggregateRoot, Money, MonthPeriod, UseCase, Validator, DomainError, Errors
  database/  (database)                # Prisma: schema + migrations + client gerado
  ui/        (ui)                      # TUDO que web e mobile dividem: tokens + preset Tailwind + formatação,
                                       # http, portas (TokenStorage/Notifier/EventStream), AuthProvider e hooks de dados
  <contexto>/
    core/      (@<contexto>/core)      # src/{model,providers,use-cases,domain-services} + index.ts; test/ irmão de src/
    adapters/  (@<contexto>/adapters)  # src/{controllers,facade,dto,@types,model,providers} + index.ts (sem testes)
apps/
  backend/   # NestJS: API. Driven adapters (repos Prisma, bcrypt, jwt), middleware, controllers, produtores BullMQ.
  worker/    # consumidor BullMQ: roda as recorrências e avalia os orçamentos. Tem testes.
  web/       # Next.js (App Router) + Tailwind + TanStack Query + Axios + react-hook-form.
  mobile/    # Expo + Expo Router + NativeWind. Consome os MESMOS packages do web.
  database/  (container-db)            # docker-compose: Postgres + Redis (dev)
```

Contextos e scopes: `@auth/*`, `@category/*`, `@transaction/*`, `@budget/*`, `@income/*`,
`@notification/*`. `core` e `adapters` são **pacotes separados**. Workspaces:
`["apps/*","packages/shared","packages/database","packages/ui","packages/*/core","packages/*/adapters"]`.

**São TRÊS frontes de um produto só**: o `web` (navegador) e o `mobile` (app) precisam ser
**visualmente idênticos**, e é por isso que existe o `ui` — ver a seção própria.

## Modelagem rica (TRAVADA)

O `model/` NÃO é anêmico. Regras vivem no modelo:

- **Value Objects (VO)**: classe pequena que encapsula um conceito com regra própria (`Money`,
  `MonthPeriod`, `Email`, `StrongPassword`). Padrão:
  - **valida no construtor** e lança erro tipado (`ValidationError.throwError(...)`) se inválido;
  - expõe o dado por `value` (ou getters derivados);
  - regex/limites são `static readonly` **dentro do VO**;
  - é **imutável**; operações devolvem novo VO.
- **Entity base** (`Entity<T, Props>` no `shared`): carrega `id: Id` + `props`, com `equals`/`clone`.
- **Entidades ricas**: agregam VOs e **comportamento com invariantes**. O construtor recebe `Props`
  (com `id?` opcional — ausência = entidade nova), monta os VOs e **rejeita estados inválidos**.
- **Edição valida ANTES de atribuir.** `Transaction.edit`, `Recurrence.edit` e `IncomeSource.edit`
  calculam os valores candidatos, rodam as invariantes sobre eles e só então atribuem. A primeira
  versão mutava campo a campo e validava no fim: uma edição recusada deixava a entidade **meio
  aplicada** (categoria já nula numa despesa), e a chamada seguinte tropeçava nesse estado. Um
  teste pegou isso — é regra, não detalhe.
- **Use-cases orquestram, não regram**: carregam a entidade pela porta, chamam métodos do domínio
  (que se autovalidam) e persistem. Se você está escrevendo um `if` de regra no use-case, ele
  provavelmente pertence a um VO ou entidade.
- **Reconstituição no repositório**: o repo (Prisma e fakes) **reconstitui** a entidade via
  construtor a partir da linha (`new Transaction({ id, amount, ... })`) e **serializa** lendo os VOs
  (`transaction.amount.cents`). Sem helpers `toDTO/toDomain` genéricos — montagem **inline**. Use
  Prisma **tipado** (nada de `$queryRaw`).
- **CQRS mantido**: o lado de **leitura** devolve **DTO plano** (interface simples, sem entidade),
  montado direto da query. Entidade rica só no lado de **escrita**.

## Regras de arquitetura (TRAVADAS)

- **Casos de uso**: um por arquivo, `export default class implements UseCase<INPUT, OUTPUT>` com
  método público `execute`, dependências injetadas pelo **construtor** (DI manual). Constantes/regex
  de regra ficam **no VO/entidade**; nada de arquivos `validations.ts`.
- **CQRS**: porta de escrita `<X>Repository` + porta de leitura `<X>QueryRepository` (retorna DTO).
  **Comandos retornam `Promise<void>`**; só os casos de uso de leitura (`...Query`) retornam DTO.
- **Ports** = interfaces em `core/src/providers`. **Driven adapters** (repos Prisma, bcrypt, jwt,
  fila) ficam **no APP que consome a porta** (`apps/backend` e/ou `apps/worker`), nunca nos pacotes
  de contexto. A **única infra compartilhada** é o `PrismaClient`, em `packages/database`.
- **App NUNCA importa `@ctx/core` — só `@ctx/adapters`.** O `@ctx/adapters` é a **única superfície
  pública** do contexto e reexporta (curado) DTOs, portas, **entidades/VOs/domain services** e tipos
  de infra. **Só o pacote `adapters` importa o `core`.** Rodar um use-case a partir do app é sempre
  via controller/facade do adapters (ex.: o worker chama `TransactionFacade.runRecurrence`, nunca
  `new RunRecurrence`).
- **`core` só depende de `shared`** (e `uuid`, via shared). **Proibido**: Zod ou qualquer outra lib
  no core. Validação usa `Validator`/`ValidationError`/`Errors` do `shared`.
- **Adapters**: `controllers/` são presenters finos (instanciam o use-case e devolvem só o que o
  front precisa); `facade/` é a entrada única que o app chama (ports **opcionais** no construtor).
- **Controllers do backend (Nest)** montam a Facade num helper `private facade()` que injeta os
  driven adapters uma vez; cada rota chama `this.facade().xxx(...)`.
- **Domain services**: regras puras que cruzam entidades/linhas → classe em `core/src/domain-services/`
  com métodos **estáticos**, sem portas e sem efeito. Hoje: `MonthlyTotalsCalculator` (transaction),
  `BudgetUsageCalculator` (budget) e `MonthlyIncomeCalculator` (income). Reexportados como **valor**
  pelo `@ctx/adapters`.
- **Eventos de domínio**: a base continua no `shared` (`DomainEvent`, `AggregateRoot` com `record`/
  `pullDomainEvents`, porta `EventPublisher`), mas **nenhum contexto emite evento hoje** — os dois
  que existiam (`UserRegistered`, `UserApproved`) eram da portaria e saíram com ela. Se um dia
  voltar a haver um: `pullDomainEvents()` **DRENA** a lista e ela **nunca é `props`** (reconstituir
  uma linha do banco nasce sem evento), **quem publica é o CASO DE USO** (com `eventPublisher?`
  opcional no construtor, chamado **depois** do `repository.xxx(...)`) e evento de **CRIAÇÃO** é
  montado no caso de uso, não pela entidade — o construtor serve tanto pra criar quanto pra
  RECONSTITUIR.
- **Não existe role nem caso de uso privilegiado.** Todo dado é do próprio usuário e a autorização
  é sempre a mesma: o `ownerId` sai do JWT e o recurso de outro dono responde `NOT_FOUND`. Não há
  `AdminUseCase`, guard de role, nem `AuthenticatedActor` — se um caso de uso pede "quem é o ator"
  além do `userId`, ele está resolvendo o problema errado.
- **Fronteiras**: contextos se tocam **só por portas**, nunca import direto entre cores.
  Orquestração cross-context fica na camada de app (backend/worker).

## Dados são de UM usuário (anti-IDOR)

**Não existe catálogo compartilhado nem visão de terceiros.** `Category`, `Transaction`,
`Recurrence`, `Budget` e `IncomeSource` têm `ownerId` (FK lógica pro `users`), e:

- o `ownerId` **sempre** vem do JWT, resolvido no `AuthMiddleware` e lido via `@authenticatedUser()`
  — **nunca** do corpo ou da rota;
- a entidade expõe `belongsTo(userId)` e o use-case checa antes de tocar em qualquer coisa;
- recurso de outro usuário responde **`NOT_FOUND`, nunca 403**: confirmar a existência já seria
  vazar informação. Vale pra categoria, lançamento, recorrência, orçamento, fonte de renda e
  notificação;
- toda listagem é `listByOwnerQuery(ownerId)` — a porta nem tem como perguntar "todos".

**Cadastro é aberto**: qualquer pessoa cria a conta e entra na hora. Não existe fila de aprovação,
tela de contas nem conta privilegiada — o único estado que barra um login é `active` (soft delete
do próprio usuário, via `DELETE /user/deactivate`).

## Dinheiro, mês e cálculo

- **Dinheiro em centavos** (`Int`), nunca float. O VO `Money` (no `shared`) encapsula centavos e as
  operações; colunas Prisma em `Int`.
- **Valor é sempre magnitude POSITIVA.** A direção mora no `type` do lançamento (`expense` |
  `income`), nunca no sinal do número — quem lê nunca precisa adivinhar o que um negativo queria
  dizer. `Money` rejeita negativo; a entidade rejeita zero (movimento de nada não é movimento).
- **`MonthPeriod` (VO no `shared`)** é o mês de competência no formato `YYYY-MM` que a API e o front
  já falam. Está no kernel porque **três contextos raciocinam em meses** e nenhum é dono do conceito.
  Tudo em **UTC** — montar a janela em horário local deslocaria a borda pelo offset e jogaria os
  lançamentos do primeiro/último dia pro mês vizinho.
  - a janela é **`[start, end)`**, com o topo EXCLUSIVO: `end` é o primeiro instante do mês seguinte,
    então o último dia inteiro entra (um `<= último dia` montado à meia-noite cortaria o dia);
  - `dayAt(dia)` faz **clamp** no último dia do mês — dia 31 em fevereiro cai no 28/29, nunca vira
    março.
- **`occurredOn` é DATE, não timestamp.** O que importa é o dia em que o dinheiro andou; uma coluna
  de data não consegue deslocar o registro pro mês vizinho dependendo do fuso de quem lê.
- **Onde cada conta mora**: `MonthlyTotalsCalculator` define o que é "quanto entrou/saiu/sobra";
  `BudgetUsageCalculator` define o que é "quase estourando" (80%) e "estourado" (≥100%);
  `MonthlyIncomeCalculator` define que **só fonte ativa conta**. Domain services puros, um lugar só
  — é isso que impede o dashboard e o relatório de discordarem de um total.

## packages/ui — o que o web e o mobile dividem (TRAVADO)

**É UM pacote só, e isso é decisão do dono.** Tudo que os dois fronts dividem mora em
`packages/ui`: tokens, preset Tailwind, formatação, tabelas de rótulo, cliente http, portas,
contexto de sessão e hooks de dados. O nome é `ui` mesmo sabendo que ele **não guarda componente
React** — e não guarda porque JSX não atravessa a fronteira DOM/React Native (`<div>` x `<View>`).
Não existe um segundo pacote separando "aparência" de "dados": a divisão foi tentada e desfeita,
porque partir em dois só multiplicava `package.json`, tsconfig e import sem impedir nada.

O `mobile` **carrega os packages do monorepo** como qualquer app do repo. Isso costuma confundir, e
vale registrar por quê: o Metro empacota em **build time** — ele compila `packages/*` a partir do
FONTE e inlina tudo no bundle JS que viaja dentro do `.ipa`/`.apk`. Não existe carregamento de
módulo em runtime, nem servidor servindo chunk; o app referencia `packages/ui` tanto quanto
referencia o `react`, ou seja, já está lá dentro. (Conferível: `apps/mobile/dist/**.hbc` contém
`configureClient`, `MonthPeriod` e as rotas dos hooks.)

O `src/index.ts` é dividido em duas metades comentadas, que é como o pacote se mantém legível
sendo um só: **como o produto SE PARECE** (tokens, formatação, `data/`) e **como o produto
FUNCIONA** (config, portas, http, `AuthProvider`, hooks).

- **Como o produto SE PARECE** — `COLORS`/`RADIUS`/`FONT_FAMILY`, o **preset Tailwind** que os dois
  apps estendem, a formatação (dinheiro, mês) e as tabelas de rótulo/classe que as duas telas usam.
  O que isso garante é que uma cor fique **fisicamente impossível** de divergir.
  - o preset carrega **só o que o NativeWind honra**: cor, raio, fonte. Sombra e keyframe ficam no
    config do web — token que não faz nada numa das plataformas é pior que token nenhum.
  - o preset tem **entrada própria** (`ui/tailwind-preset`), e os dois `tailwind.config.ts` importam
    de lá, **nunca** do barril: config de Tailwind é lido por uma ferramenta de BUILD, e passar pelo
    barril arrastaria os contextos React e o axios junto só pra ler uma paleta — além de quebrar de
    fato, porque o loader que lê esse arquivo resolve `.ts` e não o `.tsx` do `auth-context`. É
    também por isso que o config do mobile é `.ts` e não `.js`: sendo o pacote source-only, não há
    `.js` construído pra dar `require`.
- **Como o produto FUNCIONA** — http, sessão e hooks de dados. As **portas** são a única coisa que
  muda entre as plataformas: `TokenStorage` (cookie httpOnly x Keychain), `Notifier` (sonner x toast
  nativo) e `EventStreamFactory` (`EventSource` x `react-native-sse`). Cada app injeta as suas em
  `configureClient()` no boot, e daí pra frente os hooks não sabem onde estão rodando.
  - **hook compartilhado NÃO tem estado de tela.** O `ui` expõe query+mutation; filtro, mês
    selecionado, formulário e "o que está prestes a ser excluído" são do app. É o que permite as
    duas interfaces divergirem no formato sem duplicar a busca de dados.
- **É um pacote SOURCE-ONLY** (`main` aponta pro `src/index.ts`, sem build). Publicar bundle fazia
  o Next resolver uma segunda cópia do `@tanstack/react-query` e os hooks liam um contexto
  diferente do provider — todo prerender morria com "No QueryClient set". Compilado dentro do
  grafo de quem consome (Next via `transpilePackages`, Metro nativamente), existe uma cópia só.
- **O que NÃO entra**: `database`, `backend` e `worker` **nunca** podem alcançar o grafo do mobile —
  Prisma no bundle quebra o app. A dependência é sempre `mobile/web → ui → adapters (tipos) →
  shared`.

## Uma versão de React no repo inteiro (TRAVADO)

React Native 0.86 exige React 19, então o **monorepo inteiro** está em React 19 e o `web` roda
**Next 15**. Isso não é gosto: com dois majors na mesma árvore o npm iça um deles pra raiz e aninha
o outro, e **qual** ele escolhe muda entre instalações. O mesmo problema apareceu de três formas
antes de a versão ser unificada — duas cópias do react-query ("No QueryClient set"), dois
`@types/react` (ReactNode incompatível consigo mesmo) e dois React em runtime ("Cannot read
properties of null (reading 'useContext')").

⚠️ **Não conserte isso com `alias` no webpack.** O Next resolve um build de React DIFERENTE por
runtime (a condição `react-server` é quem fornece o `React.cache`), e apontar `react` pra uma pasta
entrega o build de cliente pro runtime de servidor — as rotas de API morrem com "cache is not a
function". Se um dia voltar a haver duas versões, a saída é alinhar as versões, não mascarar a
resolução.

O `metro.config.js` do mobile ainda força **singletons** (`react`, `react-dom`, `react-native`,
`@tanstack/react-query`) resolvendo como se todo import viesse da raiz do app: é barato e mantém o
resultado igual independentemente do que o npm resolva içar.

## Erros de domínio

Use-cases, VOs e entidades lançam erros **tipados** do `shared` (base `DomainError`, com
`code`/`value`/`extras` + `throwError`/`create`). O domínio **não conhece HTTP** — quem traduz
tipo → status é o `DomainExceptionFilter` (global, em `apps/backend/src/shared`), por `instanceof`:

| Erro (shared) | HTTP | Quando |
|---|---|---|
| `ValidationError` | 400 | entrada/regra de formato; **único acumulável** via `Validator.combineErrors` |
| `UnauthorizedError` | 401 | credencial inválida / não autenticado |
| `AccessDeniedError` | 403 | autenticado, sem permissão — **hoje sem uso** (não há privilégio) |
| `NotFoundError` | 404 | recurso inexistente **ou de outro usuário** |
| `ConflictError` | 409 | estado duplicado/conflitante |

Use-case/domínio **nunca** lança erro interno/500. Códigos ficam em `Errors` (constantes no
`shared`); body de erro `{ statusCode, errors: [{ code }] }`.

## Contextos

- **auth** — cópia do Devs-Bet. `User` (email, password, active, nickname, avatarUrl),
  `AuthSession`, `OAuthAccount`.
  JWT access 15m + refresh 7d **stateful** (rotação + detecção de reuso). VOs: `Email`,
  `StrongPassword`, `PasswordHash`. `nickname`/`avatarUrl` são display-only (nunca autenticam).
  **Plataforma ABERTA — sem portaria**: cadastrar já basta pra entrar, pelo formulário E pelo
  primeiro login via Google. O front faz os dois numa gesto só — o `register` do `AuthProvider`
  chama `/auth/register` e emenda `/auth/login` com as mesmas credenciais, porque `RegisterUser`
  devolve `void` (criar identidade não emite sessão) e obrigar a redigitar a senha seria custo sem
  razão.
  **O único estado de conta que barra o login é `active`**, e ele responde
  `UnauthorizedError`/`INVALID_EMAIL_OR_PASSWORD` (401) — **de propósito idêntico a senha errada**:
  a resposta nunca descreve o estado de uma conta pra quem está batendo na porta. `RefreshToken`
  recusa o mesmo e o **`AuthMiddleware` relê o usuário a cada request**, que é o que faz uma
  desativação valer na hora em vez de esperar o access token de 15m expirar.
  **Onde o refresh token dorme muda por cliente, e é a ÚNICA divergência da sessão**: o front manda
  `X-Client-Type` e o `AuthController.issue` decide — cookie `httpOnly` no web (o JavaScript nunca o
  vê, que é a proteção contra XSS) e **corpo da resposta** no mobile, porque React Native não tem
  jar de cookie confiável e o destino lá é o Keychain/Keystore via `expo-secure-store`. Entregar no
  corpo só é aceitável POR CAUSA desse destino; se um dia for pra `localStorage`, é pior que o
  cookie, não equivalente. `/auth/refresh` e `/user/logout` leem o token do corpo OU do cookie, e a
  rotação/detecção de reuso é a mesma nos dois. Qualquer `X-Client-Type` desconhecido cai no web,
  que é o default mais seguro.
- **category** — árvore auto-referente **por usuário** (`Category` com `ownerId` + `parentId`
  opcional). CRUD é do próprio dono. `isLeaf` é do read
  model, calculado numa consulta só. Nome único **entre irmãos do mesmo dono** (dois usuários podem
  ter cada um o seu "Lazer"). Apagar exige nó **sem filhos** (`CATEGORY_HAS_CHILDREN`) e **sem uso**
  (`CATEGORY_IN_USE`) — quem resolve "está em uso" é o **backend**, consultando `transaction`,
  `recurrence` e `budget` e passando `inUse` como dado puro; o contexto `category` nunca importa os
  outros.
- **transaction** — o registro do dinheiro que andou. `Transaction` (`expense` | `income`;
  `amount` em centavos positivos; `occurredOn` como DATE; `attachmentUrl` opcional pro comprovante).
  **Despesa exige categoria** (`CATEGORY_REQUIRED_FOR_EXPENSE`) — é o que faz a árvore valer a pena;
  receita avulsa pode não ter. A categoria tem que ser **folha** (`CATEGORY_NOT_LEAF`): teto e gasto
  num nó que só agrupa contariam duas vezes.
  **`Recurrence`** é o que se repete todo mês (aluguel, streaming, salário): guarda `dayOfMonth`
  (1–31, com clamp) e `nextRunAt`. `nextRunAt` é **coluna**, não só job no Redis — é o que permite
  recuperar um job perdido. Métodos: `nextOccurrenceFrom` (este mês se o dia não passou, senão o
  próximo; comparado por DIA, então criar no próprio dia ainda lança hoje), `dueOn`, `markPosted`
  (avança um mês), `pause`/`resume` (**resume reagenda a partir de hoje**, pra uma recorrência
  pausada por meses não acordar devendo todos eles).
  `RunRecurrence` é **system** (não tem actor — quem pediu foi o calendário) e **idempotente**:
  recorrência ausente/pausada vira no-op, e `postOccurrence` é **operação composta na porta**
  (lançamento + avanço num commit só) porque fazer em duas chamadas deixaria um crash no meio ou
  lançar o mês duas vezes ou pular pra sempre.
  Domain service `MonthlyTotalsCalculator` (puro/estático) fecha o mês: entrou, saiu, sobra e o
  gasto por categoria (maior primeiro, com o id como desempate pra ordem estável).
- **budget** — teto mensal por categoria ("lazer = R$500"), em centavos. É **recorrente**: o mesmo
  teto vale pra todo mês e o consumo é calculado ao vivo a partir dos lançamentos, então **não há
  linha por competência e nada pra recriar em janeiro**. Um teto por `(dono, categoria)` — aumentar
  é edição, não linha nova (`SetBudget` faz os dois).
  **O teto NUNCA bloqueia um gasto**: dinheiro gasto é fato, e recusar o registro só faria o número
  mentir. Estourar vira **notificação**.
  `BudgetUsageCalculator` (puro/estático) classifica em `ok`/`warning` (≥80%)/`exceeded` (≥100%) e
  devolve `remainingCents` **negativo** quando estoura — "quanto passou" é justamente o que o dono
  precisa ver. `EvaluateBudgetAlert` devolve **`null` quando está tudo bem**, então o worker não
  precisa de caminho especial pra "sem novidade".
- **income** — fontes de renda recorrentes (`IncomeSource`: valor mensal + dia do recebimento).
  É o lado **planejado** do mês: **não gera lançamento nenhum**, então nunca duplica com uma receita
  avulsa que o usuário registrou na mão. Fonte que parou de pagar é **desativada, não apagada** — o
  registro do que era o plano continua. `MonthlyIncomeCalculator` soma **só as ativas**, ordenadas
  por dia de recebimento (a ordem em que o dinheiro chega).
- **notification** — caixa de entrada (sininho + tela `/notifications`). `Notification.for(input)` é
  um factory com `switch` sobre uma **união discriminada** (`NotificationInput`, um shape por tipo),
  então nenhum caller inventa campo nem esquece o valor, e o texto fica numa decisão só em vez de
  espalhado por dois apps. O texto é gravado **já renderizado** — a notificação é o registro do que
  foi dito na época. Tipos e quem dispara:
  | tipo | quem recebe | onde dispara |
  |---|---|---|
  | `budget_warning` / `budget_exceeded` | dono do teto | worker, na fila `budget-check` |
  | `recurrence_posted` | dono | worker, **dentro da transação** que posta o mês |
  Os três saem do **worker**, e é por isso que o backend não escreve notificação nenhuma hoje.
  **Idempotência** vem do banco:
  `@@unique([userId, type, referenceId])` + `createMany({ skipDuplicates: true })`.

## Filas (Redis/BullMQ) — o que entra e por quê

Duas filas, pras duas coisas que **não podem acontecer no caminho da requisição**:

- **`recurrence`** — job **atrasado** por lançamento fixo. `CreateRecurrence`/`UpdateRecurrence`/
  `SetRecurrenceActive` agendam via porta `RecurrenceQueue` (produtor BullMQ no backend); quando
  dispara, o worker roda `RunRecurrence`, que posta o mês e **agenda o próximo pela mesma porta**.
  A corrente se mantém sozinha: **sem cron e sem varrer tabela**. O `jobId` é
  `${recurrenceId}_${dia-devido}`, então o mesmo mês nunca é enfileirado duas vezes — e se
  escapasse, `RunRecurrence` é idempotente. ⚠️ O separador é `_` e **nunca `:`**: o BullMQ
  namespaceia as próprias chaves do Redis com `:` e recusa um job id customizado que contenha um
  ("Custom Id cannot contain :") — com dois-pontos, TODA criação de recorrência respondia 500.
- **`budget-check`** — enfileirada pelo `TransactionController` **depois** de gravar uma despesa
  (inclusive na **edição**: um valor aumentado é exatamente o que estoura um teto). O worker soma o
  mês, pergunta ao domínio se vale avisar e grava a notificação. Está fora do caminho de escrita
  porque **registrar um gasto não pode ficar mais lento — nem falhar — por causa de uma
  notificação**. Sem `jobId`: cada despesa é mesmo um evento novo, e a idempotência do aviso vem do
  `referenceId`.

**Os literais de fila/job precisam bater** entre `apps/backend/src/queue/queue.config.ts` e
`apps/worker/src/queue/queue.config.ts` — o BullMQ não avisa que você está publicando numa fila que
ninguém escuta, então as duas cópias são o contrato.

**Onde a notificação é escrita muda por caminho, e é decisão consciente**:
- no **worker**, `postOccurrence` grava a notificação **dentro da transação** que posta o
  lançamento, porque ali ela é derivada das **mesmas linhas** sendo escritas — não pode se perder
  se o commit deu certo nem sobreviver a um rollback;
- o alerta de orçamento é escrita **avulsa** (não há mais nada sendo escrito junto, então não há com
  o que ser atômico), e gravar o mesmo cruzamento duas vezes já é no-op.

O **`referenceId` do alerta é `${budgetId}:${período}:${severidade}`**: toda despesa seguinte no mês
já estourado reconstrói a mesma chave e não vira linha nova, mas passar de 80% pra 100% **é chave
diferente** e ainda avisa — que é o ponto, já que é notícia pior.

## Rotas HTTP

**Nomes de rota em INGLÊS** (kebab-case). Todas as rotas abaixo, exceto `auth/*`, passam pelo
`AuthMiddleware` e usam **sempre** o id do token.

- `auth/{register,login,refresh,oauth/google}` — `login`/`oauth/google` devolvem `{ accessToken }`
  e, **só pra `X-Client-Type: mobile`**, também o `refreshToken`; `refresh` aceita o token no corpo
  ou no cookie
- `user/{me [GET, PATCH],change-password,logout,deactivate}`
- `category` (`/` [GET lista a minha árvore; POST cria], `/:id` [PATCH renomeia, DELETE])
- `transaction` (`/` [GET com `?period=` ou `?from=&to=`, `?type=`, `?categoryId=`; POST],
  `/summary` [GET, totais do mês], `/:id` [PATCH, DELETE])
- `recurrence` (`/` [GET, POST], `/:id` [PATCH, DELETE], `/:id/active` [POST, pausa/retoma])
- `budget` (`/` [GET, POST define/ajusta], `/usage` [GET com `?period=`, teto × gasto], `/:id` [DELETE])
- `income` (`/` [GET, POST], `/monthly` [GET, renda do mês], `/:id` [PATCH, DELETE],
  `/:id/active` [POST])
- `report/monthly` (GET com `?period=` — **rota composta**, cruza income + transaction + budget)
- `notification` (`GET /` [`?limit=`; devolve `{ unreadCount, items }`], `POST /read-all`,
  `POST /:id/read`, `DELETE /all`, `DELETE /:id`, `GET /stream` [**SSE**, ver abaixo — é a ÚNICA
  rota autenticada por token na **query string**, porque `EventSource` não manda header])
- `upload/{receipts,avatars}` — os dois self-service (o próprio usuário autenticado envia o seu)

**O `report/monthly` é a única rota composta**: o shape (`MonthlyReportDTO`) não pertence a nenhum
`@ctx/adapters` — é local ao controller, e o front **espelha o tipo à mão** (em
`app/(private)/dashboard/types/`), que é o custo honesto de um shape que não é de contexto nenhum.

## Banco de dados

- Prisma em **`packages/database`**: `prisma/schema.prisma` + client gerado em `generated/`
  (gitignored). Backend e worker fazem `import { PrismaClient } from 'database'`.
- **Models/tabelas**: `User`(users), `AuthSession`(auth_sessions), `OAuthAccount`(oauth_accounts),
  `Notification`(notifications; `@@unique([userId, type, referenceId])`), `Category`(categories;
  self-relation `parent_id` com `onDelete: Restrict`), `Transaction`(transactions;
  `@@unique([recurrenceId, occurredOn])`), `Recurrence`(recurrences), `Budget`(budgets;
  `@@unique([ownerId, categoryId])`), `IncomeSource`(income_sources; `@@unique([ownerId, name])`).
- **FKs entre contextos são LÓGICAS** (sem relation Prisma cruzando contexto — `owner_id`,
  `category_id`, `user_id`). A self-relation da `Category` e a `Recurrence → Transaction` são
  intra-contexto, então têm relation Prisma de verdade.
- **A unicidade de `(dono, pai, nome)` da categoria é do USE-CASE, não um `@@unique`**: `parentId` é
  nulo na raiz e o Postgres deixa dois NULL coexistirem, então a constraint não cobriria exatamente
  as raízes — justo o caso que mais importa.
- **MIGRATIONS (TRAVADO) — nada de `db push`.** O schema evolui por migration versionada em
  `packages/database/prisma/migrations/`, commitada junto com a mudança do `schema.prisma`. Não
  existe script `prisma:push` de propósito: com histórico versionado, um push aplicaria mudança sem
  registrar migration e faria o `migrate deploy` seguinte divergir.
  - **Mudou o schema?** `npm run db:migrate -- --name <descricao>` (= `prisma migrate dev`).
  - **Subir o que falta** (boot de dev, deploy): `npm run db:deploy` (= `prisma migrate deploy`) —
    só replica migrations já commitadas. É o que o `npm run dev` roda e o que o Dockerfile do
    backend executa antes de servir tráfego.
  - `0_init` foi gerada por `prisma migrate diff --from-empty`, sem precisar de banco no ar.

## Worker

- Consome as duas filas descritas acima. **Tem os próprios driven adapters**
  (`apps/worker/src/persistence/`), e isso é deliberado: um driven adapter pertence ao app que
  precisa dele, e o `WorkerRecurrenceRepository` faz algo que o do backend não faz — grava a
  notificação dentro da mesma transação.
- Os métodos da porta que o worker **nunca chama** lançam em vez de fingir que funcionam: uma fiação
  errada falha alto na primeira chamada, em vez de devolver dado vazio pra sempre.
- **Depois** do commit (nunca dentro), publica o ping ao vivo (`pushLiveUpdates`) — um ping por
  linhas que um rollback apagou mandaria o cliente procurar o que não existe.
- O nome da categoria pro texto do alerta sai de **uma** consulta direta na tabela (mesmo raciocínio
  do `NotificationAudience` lendo `users` no backend: não decide nada, só rotula), com **fallback
  genérico** — categoria renomeada ou apagada nunca pode quebrar o aviso.

## Notificação ao vivo (SSE) — sem polling

**Não existe polling no front.** O backend **empurra** um aviso e o front só reage:

- **Redis pub/sub** é o transporte (`notifications-{userId}`, um canal por destinatário — nenhum
  filtro no cliente e zero chance de vazar a atividade de um pro outro). Redis e não um emitter em
  memória porque só ele funciona com **mais de uma instância** de backend. O literal do canal
  precisa bater entre `apps/backend/src/notification/live-updates.ts` e
  `apps/worker/src/live-updates.ts`. Publicar exige **conexão própria**: uma conexão em modo
  `subscribe` recusa comando normal.
- **O payload não tem significado** (`data: refresh`). O cliente relê `/notification`. Mandar o
  conteúdo duplicaria o read model em dois transportes.
- **SSE e não WebSocket**: o tráfego só vai num sentido e o `EventSource` **reconecta sozinho**
  depois de queda/restart — exatamente o comportamento desejado, de graça.
- **Autenticação**: `EventSource` não manda header customizado, então o access token vai na **query
  string** — é o MESMO token de 15min que já circula, direto pro nosso backend. Feito por **guard**
  (`StreamAuthGuard`) e não dentro do handler, porque guard roda antes e devolve **401 de verdade**;
  um handler `@Sse` **não pode ser async** (o Nest não faz `await` no retorno dele).
- **`NotificationStreamController` fica FORA do `AuthMiddleware`** (aplicado por classe e baseado em
  header) — daí ser um controller separado.
- **Não vaza conexão**: cada stream abre a sua conexão Redis e o teardown do `Observable` a fecha
  quando o cliente desconecta.
- Front: `useNotificationStream` montado **uma vez** no `(private)/layout.tsx`, invalidando a query
  `['notifications']` a cada ping. O token vive numa variável de módulo (`lib/api/interceptors.ts`),
  que um hook não consegue observar — então `setAccessToken` **avisa** os interessados via
  `onAccessTokenChange`, e o stream se reabre sozinho quando o token gira. **Nada de retry manual**:
  fechar o `EventSource` é justamente o que quebraria a reconexão nativa.

## Uploads (armazenamento local, sem nuvem)

- Arquivos ficam em **`apps/backend/uploads/<tema>/`**, servidos estáticos em **`/uploads/**`** via
  `app.useStaticAssets` (o `main.ts` cria as subpastas no boot, lendo `UPLOADS_SUBDIRS`). A pasta é
  gitignored e, no docker, é **volume nomeado**.
- Os dois uploads são **self-service** (só `AuthMiddleware`): o usuário autenticado manda o que é
  dele.
  - `POST /upload/receipts` — comprovante/nota de um lançamento. Aceita `image/*` **ou**
    `application/pdf`, 10 MB. **Nunca recortado nem reencodado**: é documento, e alterá-lo seria
    alterar a prova. A URL vai pra `Transaction.attachmentUrl`.
  - `POST /upload/avatars` — foto de perfil. Só `image/*`, 5 MB. A URL vai pra `User.avatarUrl` via
    `PATCH /user/me`.
- Nome do arquivo é `uuid.ext`; o front monta a URL absoluta com `lib/media.ts` (`mediaUrl`).

## apps/web (Next.js SPA)

**Stack travada**: Next.js (App Router) + **Tailwind** + **TanStack Query** + **Axios** +
**react-hook-form**. **SEM zod** no front (validação de negócio já está no domínio; no front só
validação de UI simples).

**`components/loading/`**: um anel girando e o rótulo. **Três tamanhos, um por contexto de uso** —
nenhum aceita filho, então quem chama sempre escolhe um dos três: `fullScreen` (`min-h-screen`, só as
duas guardas de auth que rodam **antes** do shell (`Sidebar`/`Header`) montar — `(private)/layout.tsx`
e `(public)/layout.tsx` —, onde não existe header ainda pra medir contra); default sem prop
(`h-full`, toda tela que faz `if (loading) return <Loading />` **antes de qualquer outro JSX**,
porque ali ele é o único filho do `<main>` do `(private)/layout.tsx`, uma caixa `flex-1` cuja altura
o flexbox já calculou como "tela menos o header" — inclusive quando o header quebra em duas linhas
numa tela estreita, conta que uma altura fixa em `vh` nunca acerta); `compact` (sem altura própria,
pra quando o loading é só uma seção dentro de uma página que já tem outra coisa renderizada em volta
— a lista de lançamentos com o formulário do lado). **`flex flex-col items-center justify-center`,
nunca `grid place-items-center`**: grid com linhas implícitas estica cada linha pra dividir a caixa
igualmente e centraliza cada uma dentro da própria metade, abrindo um vão errado entre o ícone e o
texto — o `justify-content` do flex centraliza o par como um grupo só.

**Tema**: sóbrio/financeiro, não o retrô-arcade do Devs-Bet. Tokens em `tailwind.config.ts`: fundo
slate escuro (`ink-*`) e **apenas duas cores saturadas com significado** — `positive` (dinheiro
entrando) e `negative` (saindo) —, mais `accent` pra ação e `warning` pro teto perto do limite.
Cor nunca é decorativa aqui. Tipografia: Inter pra interface, JetBrains Mono **com números
tabulares** pros valores, que são lidos em coluna e comparados de relance.

- **TODO componente é uma PASTA com `index.tsx`** — `components/button/index.tsx`, nunca
  `components/button.tsx`. É o que deixa cada componente carregar o que é dele sem virar um monte de
  arquivo solto na pasta de cima: `<componente>/hooks/` (o hook exclusivo dele) e `<componente>/data/`
  (constantes/config, ex.: `sidebar/data/nav-items.ts` e `sidebar/data/icons.tsx`). O import não muda
  (`@/components/button` resolve o `index.tsx`), então mover um componente pra pasta nunca mexe em
  quem o usa.
- **Visual ≠ lógica**: o `index.tsx`/`page.tsx` é só JSX; states, effects, handlers e chamadas moram
  num hook. **Onde o hook fica é o que diz de quem ele é**: hook de UMA tela → `<rota>/hooks/`; hook
  de UM componente → `<componente>/hooks/` (ex.: `use-transaction-form` dentro do formulário,
  `use-notification-bell` dentro do sininho); só o que várias telas compartilham fica em `src/hooks/`
  (`use-categories`, `use-notifications`, `use-notification-stream`, as guardas de rota). Hook usado
  por vários pontos da MESMA rota (o `page.tsx` **e** um sub-componente) fica em `<rota>/hooks/`,
  irmão do `page.tsx` — não tem "componente raiz" pra ser dono dele. **Duas exceções**, e só essas:
  chamada ISOLADA de hook de terceiro sem nenhum state/handler seu ao lado, e **função pura** de
  formatação de apresentação (não é lógica no sentido da regra) — as duas podem ficar inline no
  arquivo visual.
- **`hooks/`, `data/` e `types/` sempre com nome descritivo** (`use-transaction-form.ts`,
  `nav-items.ts`) — **nunca** um `index.ts` dentro delas: a pasta pode ter mais de um arquivo, então
  um "index" único não faria sentido. Só o **componente** tem `index.tsx`.
- **Pasta de sub-componente nunca aninha dentro da pasta de outro sub-componente** — todas irmãs,
  direto em `<rota>/components/` (ou em `src/components/`), mesmo quando um só é usado pelo outro.
- **As quatro pastas de um componente/rota, e quando cada uma existe**: `hooks/` (se tem lógica
  própria), `data/` (se tem dado fixo próprio), `types/` (se tem interface **exportada** e lida por
  mais de um arquivo dali) e, na ROTA, `lib/` (se tem função pura usada só por aquela rota). Nenhuma
  é obrigatória: cria quando o caso aparece. Hoje só o `dashboard` tem `types/`
  (`monthly-report.ts`, o shape composto da rota de relatório, lido pelo hook e pela tela).
  ⚠️ **`<rota>/lib/` ainda NÃO existe aqui** — não porque a regra não valha, mas porque o caso não
  apareceu: toda função pura até agora é usada por mais de uma tela e mora em `src/lib/`. Quando
  aparecer uma exclusiva de uma rota, é lá que vai — não empurre pro hook nem invente um
  `src/lib/` pra ela.
- **Dado fixo (array de opções, mapa de estilo, tabela de rótulos) SEMPRE em `data/`** — nunca solto
  no topo de um `.tsx`/`.ts`. Um arquivo por grupo coeso (`transaction-filters.ts`,
  `inbox-filters.ts`), nunca um `constants.ts` genérico. O nível segue **quem usa**: `data/` do
  componente (uso local, ex. `BUTTON_VARIANT_CLASSES` em `button/data/` — nunca num
  `components/data/` misturando componentes), `data/` da rota (vários componentes da mesma rota) ou
  `src/data/` global (usado por **rotas diferentes**). **Escalar de ajuste local** (`BADGE_CAP = 99`,
  chave de query) pode ficar inline junto de quem usa — a regra é sobre estrutura de dado, não sobre
  todo `const` maiúsculo.
  ⚠️ **Dado igual em duas rotas é sempre bug esperando acontecer**: `TRANSACTION_TYPES` nasceu em
  `transactions/data/` e a tela de fixos passou a importar `../transactions/data/...` — foi pro
  `src/data/` global. O filtro da listagem ficou na rota, porque só ela filtra.
- **Tipo união que enumera um dado mora JUNTO do dado, no `data/`** — `ButtonVariant` com
  `BUTTON_VARIANT_CLASSES`, `TransactionFilterValue` com `TRANSACTION_FILTERS`, `AmountTone` com
  `TONE_CLASSES`, `StatCardAccent` com `ACCENT_CLASSES`, `InboxFilter` com `INBOX_FILTERS`. Quando a
  união vem do DOMÍNIO (`BudgetStatus`, `NotificationType`), o `data/` guarda só a tabela que a rotula
  — a tela nunca redeclara o que o domínio já decidiu. O `types/` é pra **modelo de dado** que não é
  o tipo de nenhuma constante. Props que só o próprio arquivo lê (sem `export`) ficam inline — não
  move.
- **JSX de wrapper repetido entre `page.tsx` do MESMO route group sobe pro `layout.tsx` do grupo** —
  se a moldura é igual pra todo mundo do grupo, duplicá-la em cada `page.tsx` só porque cada rota tem
  o seu arquivo é repetição à toa. Foi o caso do `(public)`: login e register repetiam o
  mesmo `<main>` de fundo radial + o card `max-w-md` centralizado. ⚠️ A guarda de
  `Loading fullScreen` fica **fora** desse wrapper: ela reivindica a viewport inteira e o `max-w-md`
  do card a espremeria. E a regra é sobre JSX **idêntico** — o `<h1>` de cada tela não sobe, porque
  cada uma diz uma coisa diferente.
- **Dado estático → `data/`; lógica (parse, cálculo, formatação) → `lib/`.** Paleta/constante que é a
  implementação privada de uma função pura continua junto dela no `lib/` (ex. o `ACCENTS` de
  `lib/notifications.ts`, que só existe pro `accentFor`) — separar o dado da única função que o
  consome não ajuda ninguém.
- **`page.tsx` É a tela** — ele mesmo tem o JSX e chama o hook da rota; não existe um
  `components/<rota>.tsx` que é só o wrapper da página inteira (indireção sem ganho: um arquivo a
  mais pra abrir e nenhuma reutilização). `<rota>/components/` guarda só os **pedaços** da tela
  (`transactions/components/transaction-form/`).
- **Não existe `AppShell`**: o cromo da área privada são dois componentes independentes,
  `components/sidebar/` e `components/header/`, compostos direto no `(private)/layout.tsx` (que é
  também quem abre o SSE). Um componente que só embrulha outros dois não ganha nada por existir e
  esconde o layout de quem procura por ele.
- **Route groups por acesso**: `app/(public)/` e `app/(private)/`. Guard no `layout.tsx` do grupo,
  nunca por página.
- **Navegação em duas formas, um conjunto só de destinos**: `components/sidebar/` no desktop e
  `components/bottom-tab-bar/` (`sm:hidden`) no celular, com os quatro destinos primários mais
  "Mais" (`/more`) — exatamente as cinco abas do app. Os itens vivem em `src/data/nav-items.ts`
  (global, porque DOIS componentes irmãos leem a lista) e o `<main>` reserva `pb-24` abaixo de `sm`
  pra última linha não ficar embaixo da barra. ⚠️ Antes da tab bar a sidebar era `hidden sm:flex`
  **sem substituto**: no celular o app não tinha navegação nenhuma.
- **Reusar os tipos dos `@ctx/adapters`** via `import type` (request e resposta). Não redeclarar
  contratos — a única exceção é o `MonthlyReport`, que não é de contexto nenhum.
- **Auth do SPA**: `accessToken` em memória (nunca localStorage); refresh no cookie httpOnly; axios
  com `withCredentials`; interceptor de 401 chama `/auth/refresh` (dedup) e repete; silent refresh
  no boot.
- **Todo valor na tela passa pelo `<Amount>`**: números tabulares e a cor decidida em UM lugar, em
  vez de re-derivada em cada call site.
- **Categoria só é escolhida entre FOLHAS** (`CategoryPicker`), rotuladas pelo caminho completo
  ("casa / contas / luz"). Um galho nunca é oferecido — a mesma regra que o backend aplica, feita
  inclicável aqui pra ninguém descobri-la como mensagem de erro.

## PWA — instalar o web na tela inicial

O `web` é instalável (mesmo desenho do Devs-Bet). **Sem lib nova** — nada de Workbox nem next-pwa,
a mesma decisão que o resto do front já toma:

- **`app/manifest.ts`** (Next monta o `<link rel="manifest">` sozinho) + `viewport.themeColor` e
  `metadata.appleWebApp` no `layout.tsx`, que é o que dá o comportamento de "adicionar à tela
  inicial" no iOS. Cores vêm de `COLORS` do `ui` — o ícone da tela inicial não pode divergir do app
  que ele abre.
  **O nome instalado é "Financial Management"**, e ele mora em TRÊS lugares que precisam bater:
  `name`/`short_name` do manifest (Android/desktop), `metadata.appleWebApp.title` (iOS) e o
  `metadata.title` da aba. Divergir faz o mesmo app aparecer com dois nomes dependendo de onde foi
  instalado.
- **Ícones gerados**, não desenhados: `app/icons/icon-mark.tsx` renderiza o mesmo "F" da sidebar via
  `ImageResponse` (`next/og`, que já vem com o Next) e as cinco rotas em `app/icons/*` só escolhem o
  tamanho — um gerador em vez de cinco PNGs quase idênticos. São `force-static`, então saem prontas
  no build. São **rotas próprias**, e não os nomes reservados `icon.tsx`/`apple-icon.tsx`, pra a URL
  continuar nossa e bater com a lista de ícones do manifest.
- **`public/sw.js` é escrito à mão e intercepta SÓ navegação.** Chamada de API, payload RSC e
  `/uploads` passam direto: **nada auth-gated nem de dinheiro** (saldo do mês, lançamentos,
  comprovantes) pode ficar num cache do cliente — num aparelho compartilhado isso serviria os
  números de um pro outro. O único item do cache é o `public/offline.html`, e é ele que aparece
  quando a rede falha. Esse handler de `fetch` é também o que o Chrome exige pra considerar o app
  instalável.
- **`components/pwa-register`** registra o service worker **só em produção** (em dev o Fast Refresh
  e um SW vivo brigam por quem serve a requisição) e engole o erro — não conseguir instalar não é
  problema que o usuário precise ver.
- ⚠️ **Service worker exige HTTPS** (exceto em `localhost`). Enquanto o `deploy/nginx.conf` estiver
  em `listen 80` sem TLS, o app **não instala** — mesma pendência de certbot que o cookie `secure`
  do refresh já tem.

## apps/mobile (Expo + Expo Router + NativeWind)

**Stack travada**: Expo (SDK 57) + **Expo Router** + **NativeWind v4** + TanStack Query +
react-hook-form. O app consome `ui`, `shared` e os tipos dos `@ctx/adapters` — os MESMOS
do web.

- **NativeWind e não StyleSheet**: as telas escrevem `className` com a mesma sintaxe do web e
  estendem o mesmo preset, então portar uma tela é quase mecânico e a paridade fica garantida pelo
  código, não por disciplina. Exige `jsxImportSource: 'nativewind'` no `babel.config.js` — sem isso
  todo estilo silenciosamente não faz nada.
- **`app/` contém SÓ rotas.** O Expo Router transforma todo arquivo ali numa rota, então hook e
  sub-componente de uma tela virariam rotas quebradas. Por isso a tela mora em
  `src/screens/<nome>/` com o próprio `hooks/`, e o arquivo em `app/` é **uma linha** reexportando.
  É a única divergência consciente da regra "o arquivo de rota É a tela" — e existe por imposição do
  roteador, não por gosto.
- **Cinco abas** (`(private)/(tabs)/`): mês, lançamentos, orçamentos, renda e "Mais"; o resto
  (fixos, categorias, notificações, perfil) é empilhado por cima e ganha o botão de voltar
  de graça. A mesma divisão do web abaixo de `sm`.
- **Ícones**: `react-native-svg` com **o mesmo path data** do web (`src/data/icons.tsx`). A cor vem
  por prop (`ColorValue`), porque React Native não tem herança de CSS pra `currentColor`.
- **Formulário longo vira sheet** (`Modal` de baixo pra cima) em vez do painel lateral do web —
  mesmos campos e mesmas regras, no formato que a viewport permite.
- **Polyfill obrigatório**: `import 'react-native-get-random-values'` é a PRIMEIRA linha do
  `_layout.tsx` raiz. O `Id` do `shared` usa uuid, que precisa de uma fonte de aleatoriedade que o
  RN não traz; importar depois de qualquer coisa que toque nisso já é tarde.
- **`metro.config.js`** faz três coisas e nenhuma é opcional: `watchFolders` na raiz (senão o Metro
  não enxerga mudança em `packages/*`), `nodeModulesPaths` com o app primeiro, e os **singletons**
  (ver a seção do React). Hierarchical lookup fica **ligado**: o npm aninha dependências do próprio
  Expo em `node_modules/expo/node_modules`, e desligá-lo as torna irresolvíveis.
- **`babel-preset-expo` é declarado no app** mesmo sendo transitivo: o Babel resolve preset a partir
  da pasta do config, e o npm pode aninhá-lo sob o `expo`, fora desse caminho.
- **A API não pode ser `localhost` num aparelho físico** — ali `localhost` é o telefone. Use o IP da
  máquina na mesma rede (`EXPO_PUBLIC_API_URL`).
- **Verificação**: `npm run build` do mobile é `expo export --platform android`, ou seja **bundla de
  verdade com o Metro**. É o que prova que os packages do monorepo entram no app; um erro de
  resolução aparece aí, não no `check-types`.

## Testes

- Têm testes: **`core`** de cada contexto, **`shared`** e **`apps/worker`**. Com modelagem rica, os
  testes cobrem **invariantes de VOs/entidades** (`MonthPeriod.dayAt` faz clamp, `Recurrence` recusa
  dia 32, `BudgetUsageCalculator` vira pra `exceeded` em 100% cravado) além dos use-cases.
- Use-cases testados com **fakes das portas em memória** em `test/in-memory/` (cada fake
  `export default`; `index.ts` reexporta com nome). Testes importam de `'../src'`.
- Jest + ts-jest; `moduleNameMapper` resolve `shared`/`@ctx/core` pro source.
- **O anti-IDOR é testado em todo contexto**: sempre há um caso "recurso de outro usuário responde
  como inexistente".

## Dev e verificação

- `npm run dev` = `db:up` (Postgres + Redis no docker, via `apps/database` = workspace
  `container-db`) → `db:deploy` (`prisma migrate deploy`) → `turbo run dev`.
- **Stack inteiro containerizado**: `docker compose up --build` sobe Postgres, Redis, backend,
  worker e web juntos. `NEXT_PUBLIC_API_URL` é `ARG` (Next.js inlina em build time); as demais
  variáveis vêm do `env_file` de cada app.
  - **Todo Dockerfile PRECISA de `RUN npm ci`.** O `.dockerignore` exclui `node_modules`, então sem
    isso a imagem não tem dependência nenhuma e o build morre com **exit 127** no primeiro pacote.
  - **`.dockerignore`: padrão sem `**/` só casa na RAIZ.** Os `**/.env` são obrigatórios, senão
    `apps/backend/.env` e `apps/web/.env` entram na imagem com JWT_SECRET e NEXTAUTH_SECRET.
  - **`uploads` é volume nomeado** — sem ele, recriar o container apaga todo comprovante e avatar.
    A pasta precisa existir **e pertencer ao `node`** na imagem (o `RUN mkdir -p ... && chown`),
    porque o volume herda o dono do que a imagem tem naquele caminho.
  - **O schema é aplicado no BOOT do backend** (`prisma migrate deploy && npm start`). Se falhar, o
    container **não sobe** — melhor que servir com o schema errado. Só o backend migra; o worker
    sobe sem migrar.
  ⚠️ Portas do compose (`5434`/`6381`/`5002`/`3004` no host) são **só o mapeamento pro host**. A
  comunicação entre containers usa as portas INTERNAS (`db:5432`, `redis:6379`).
- **Antes de declarar pronto** (não bootar servidor — precisa de Postgres/Redis):
  ```bash
  npx turbo run check-types test build
  ```
  Tudo verde = ok. Isso inclui o `expo export` do mobile, que é o único passo capaz de pegar erro de
  resolução do Metro.
  ⚠️ O `check-types` do `web` **depende do `build` do próprio web** (ver `apps/web/turbo.json`):
  `next build` regenera `.next/types/**`, que o tsconfig inclui, e rodar os dois em paralelo faz o
  `tsc` ler esses arquivos enquanto o Next os reescreve — falhando com TS6053 em toda rota.

## Commits

`tipo(escopo): assunto`, escopo = caminho do pacote/app (ex.: `feat(packages/budget/core)`),
mensagem em português, corpo enxuto, **um commit por escopo**, **sem rodapé de co-autoria**.
Ver `.claude/skills/commit/SKILL.md`.
