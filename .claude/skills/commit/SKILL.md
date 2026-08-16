---
name: commit
description: Cria commits no padrão do Financial-Management — Conventional Commits com o escopo = bounded context/pacote afetado (ex.: feat(packages/budget/core), feat(packages/transaction/adapters), fix(apps/backend)). Sempre em português, com corpo detalhado porém enxuto. Use sempre que for commitar mudanças neste monorepo.
---

# Padrão de commit — Financial-Management

## Formato
```
<tipo>(<escopo>): <assunto curto em português>

- <ponto 1: o que foi feito, com detalhe enxuto>
- <ponto 2>
```

- **tipo**: `feat` (novo comportamento), `fix` (correção de bug), `refactor` (sem mudar comportamento), `test` (só testes), `chore` (config/build/deps), `docs`, `perf`, `style`.
- **escopo**: o **caminho do bounded context / pacote / app** afetado, exatamente como na árvore do repo:
  - `packages/shared`
  - `packages/database`
  - `packages/<contexto>/core` — ex.: `packages/auth/core`, `packages/category/core`, `packages/transaction/core`, `packages/budget/core`, `packages/income/core`
  - `packages/<contexto>/adapters` — ex.: `packages/auth/adapters`, `packages/budget/adapters`
  - `apps/backend`, `apps/worker`, `apps/web`, `apps/database`
- **assunto**: curto, em **português**, no imperativo/presente, sem ponto final. (ex.: `adiciona use case de login`, `corrige soma do gasto do mês por categoria`).

## Regras

1. **Sempre em português** — assunto e corpo.
2. **Um commit por bounded context / pacote.** Se a mudança tocou `core` E `adapters` E `backend`, são **3 commits separados** (um por escopo), não um commit gigante. Faça o stage seletivo por caminho (`git add packages/budget/core`, depois commitar; e assim por diante).
3. **Corpo detalhado porém enxuto**: bullets curtos explicando O QUE mudou e por quê quando não for óbvio. Citar nomes reais (use-cases, portas, VOs, entidades, arquivos). Nada de encher linguiça; 1–5 bullets costuma bastar.
4. Sem escopo só quando a mudança é genuinamente cross-repo (ex.: `chore: ajusta turbo.json`). Prefira sempre ter escopo.
5. Não commitar `dist/`, `generated/`, `.env`, `node_modules` (já no .gitignore).
6. Commitar **só** quando o dono pedir.
7. **NUNCA** adicionar rodapé de atribuição/co-autoria (nada de `Co-authored-by`, `Generated with Claude Code` ou similar). A mensagem termina no último bullet do corpo.
8. O commit sai no nome do dono (`Adriano Boulhosa <adrianoamaral1621@gmail.com>`) — conferir com `git config user.name`/`user.email` antes do primeiro commit de uma máquina nova.

## Exemplos

```
feat(packages/budget/core): entidade Budget com teto mensal por categoria

- Budget.changeAmount rejeita teto zerado (INVALID_AMOUNT)
- BudgetUsageCalculator: domain service puro que cruza teto x gasto do mês e
  classifica em ok/warning/exceeded (80% e 100%)
- testes cobrindo virada de faixa e orçamento sem gasto
```

```
feat(packages/transaction/core): recorrência que materializa o lançamento do mês

- Recurrence.advance() move nextRunAt pro próximo mês, com clamp no último dia
  (dia 31 em fevereiro cai no dia 28/29)
- RunRecurrence é idempotente: o par (recurrenceId, occurredOn) é único
- porta RecurrenceQueue pro job atrasado agendado pelo backend
```

```
fix(apps/backend): corrige o mês usado no resumo quando o fuso vira o dia

- o intervalo passa a ser montado em UTC, igual ao que o Prisma grava
```

## Fluxo
1. `git status` + `git diff` para ver o que mudou e agrupar por escopo.
2. Para cada escopo: `git add <caminho>` → `git commit -m "..."` (use o formato acima).
3. Repita até o working tree estar limpo. Confirme com `git status`.
