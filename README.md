# Financial

Controle de gastos pessoal. Você monta a sua **árvore de categorias**, cadastra a sua **renda**,
define **quanto pretende gastar** em cada categoria e vai lançando o que sai. A tela principal
responde a única pergunta que importa no fim do mês: **quanto sobra**.

## Como funciona

**Categorias com subcategorias.** A árvore é sua e só sua — `Casa → Contas → Luz`, `Lazer`,
`Cartão de crédito`, `Investimentos`. Cada gasto é lançado na **folha** (o nível mais específico),
porque um nó que só agrupa outros contaria o mesmo dinheiro duas vezes.

**Renda.** Você cadastra o salário (valor mensal + dia do recebimento) e quantas outras fontes fixas
quiser. Isso é o lado *planejado* do mês e não vira lançamento — receita avulsa (um freela, um
reembolso) você registra em Lançamentos como qualquer outra movimentação.

**Orçamento por categoria.** "Lazer = R$500". O teto vale para **todo mês** (não tem que ser
recriado em janeiro) e o consumo é calculado ao vivo a partir dos lançamentos. Ele **nunca bloqueia
um gasto** — dinheiro gasto é fato, e recusar o registro só faria o número mentir. Quando você passa
de 80% do teto, e de novo quando estoura, chega uma notificação.

**Quanto sobra.** `renda fixa + receitas do mês − despesas do mês`. É o número que abre o
dashboard, junto com o consumo de cada orçamento e para onde o dinheiro foi.

**Lançamentos fixos.** Aluguel, streaming, mensalidade: você cadastra uma vez com o dia do mês e o
worker lança sozinho todo mês, avisando quando lança. Dia 31 em fevereiro entra no último dia — não
pula nem vira março.

**Acesso.** Cada usuário vê **apenas** o que é dele. Não existe visão compartilhada; o
administrador existe só para liberar (ou barrar) o cadastro de alguém, e não enxerga a finança de
ninguém.

## Web e app

O produto tem **dois fronts** e eles são o mesmo produto: o **web** (Next.js) e o **app**
(React Native com Expo). Num celular as duas telas são propositalmente idênticas — mesma paleta,
mesma tipografia, mesma navegação por abas — porque as decisões de design moram num pacote só
(`packages/ui`) que os dois estendem, e os dados vêm dos mesmos hooks (`packages/client`).

O que muda entre eles é só o que **não tem como** ser igual: onde o refresh token dorme (cookie
httpOnly no navegador, Keychain/Keystore no aparelho), como um aviso aparece e o que carrega o push
da caixa de entrada. Cada um injeta o seu no boot; o resto do código é o mesmo.

## Arquitetura

Monorepo Turborepo + npm workspaces, TypeScript, **hexagonal (ports & adapters) por bounded
context**, com **modelagem rica** (entidades com comportamento + value objects; invariantes no
modelo). Contextos: `auth`, `category`, `transaction`, `budget`, `income`, `notification`.

Deployables de produção: **backend** (API NestJS) e **worker** (recorrências e alerta de orçamento
via BullMQ). Os fronts são o **web** (Next.js) e o **mobile** (Expo). Postgres + Redis sobem via
docker no dev.

O padrão de arquitetura, autenticação e convenções vem do projeto **Devs-Bet** — a autenticação é
praticamente cópia direta (JWT stateful com rotação e detecção de reuso, portaria de aprovação,
login com Google desligado pela ausência da chave).

## Rodando localmente

Precisa de **Docker** em execução. Copie os `.env.example` (raiz + cada `apps/*` +
`packages/database`) para `.env` e ajuste os valores; um único comando sobe o resto:

```bash
npm install
npm run dev
```

`npm run dev` sobe o Postgres + Redis (docker) e espera ficar pronto, aplica as migrations
pendentes (`prisma migrate deploy`) e inicia backend + worker + web em watch:

- Web: http://localhost:3000
- Backend: http://localhost:5000

### O primeiro usuário

A plataforma é fechada: **toda conta nasce pendente** e precisa ser liberada por um administrador.
Num banco zerado não existe administrador ainda, então o primeiro acesso se resolve por SQL — o
mesmo processo usado para promover alguém a admin depois:

```bash
docker compose exec db psql -U postgres -d financial \
  -c "UPDATE users SET role = 'admin', approval_status = 'approved' WHERE email = 'voce@exemplo.com';"
```

Feito isso, esse usuário libera os demais pela tela **Contas** (`/admin`).

### Rodando o app

```bash
npm run -w mobile dev        # abre o Expo; leia o QR code com o app Expo Go
```

⚠️ Num aparelho físico o `EXPO_PUBLIC_API_URL` **não pode ser `localhost`** — ali `localhost` é o
próprio telefone. Use o IP da sua máquina na mesma rede (ex.: `http://192.168.0.10:5000`).

### Outros comandos

```bash
npm run build                        # build de todo o monorepo
npx turbo run check-types test build # valida tudo (tipos, testes, build)
npm run db:migrate -- --name <nome>  # cria e aplica uma migration nova
npm run db:stop                      # para os containers de Postgres/Redis
```

Também dá para rodar o stack inteiro containerizado (backend/worker/web incluídos), útil para
simular produção: `docker compose up --build`.

Detalhes de engenharia e regras travadas: veja `CLAUDE.md`.
