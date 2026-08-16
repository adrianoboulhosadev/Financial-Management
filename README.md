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

## Arquitetura

Monorepo Turborepo + npm workspaces, TypeScript, **hexagonal (ports & adapters) por bounded
context**, com **modelagem rica** (entidades com comportamento + value objects; invariantes no
modelo). Contextos: `auth`, `category`, `transaction`, `budget`, `income`, `notification`.

Deployables de produção: **backend** (API NestJS) e **worker** (recorrências e alerta de orçamento
via BullMQ). O **web** é o front (Next.js). Postgres + Redis sobem via docker no dev.

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
