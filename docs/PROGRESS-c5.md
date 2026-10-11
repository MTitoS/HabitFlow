# PROGRESS-c5 — Implementação ciclo RUG c5 (aba Tarefas + detalhe do dia em Estatísticas)

> Base: `docs/PLAN-c5.md` (15 tasks D1–D15, fases F1–F7) · SPEC-c5 (contrato fechado 23/23).
> Baseline: 281 testes / 42 suites · Alvo: +25–35.

## FASE F1 — Modelo de domínio

### D1 — `src/domain/todo/model.ts` (Todo puro + helpers) — ✅
- `Todo {id,title,date?,completed,completedAt?,createdAt,updatedAt}` + `validateTodoTitle`, `isOverdue`,
  `groupedByDay`, `todosForDay`, `undatedTodos`, `sortTodos` (Q7 com completos por último).
- Sem I/O; `now`/`today` sempre argumento; zero referência a stats/streak.
- Testes: `src/domain/todo/model.test.ts` (10 casos RED→GREEN).
- Gate: `npx jest src/domain/todo` verde; `tsc` limpo.

## FASE F2 — Persistência

### D2 — Schema + migration `todos` (Q6/L8) — ✅
- `DB_VERSION` 1→2; `TABLES += 'todos'`; `TABLE_DEFINITIONS += todos`.
- `MIGRATIONS += {from:1,to:2, up: +todos: []}` aditiva.
- Testes (exportImport.test.ts): +4 (tabela declarada, migração v1, backup v1 sem todos aceito,
  v2 não re-roda migration). Teste `payload carries version` atualizado (agora DB_VERSION).
- Gate: `npx jest exportImport` verde; tsc limpo.

### D3 — `TodoRepository` (CRUD + toggle) — ✅
- `types.ts`: interface `TodoRepository` + `Repositories.todos`.
- `impl.ts`: `createTodoRepository(store)`; create gera id/timestamps; `setCompleted` grava
  `completedAt=now`; `setUncompleted` **remove** `completedAt` (c5.2); **sem guarda temporal** (Q9);
  toggle idempotente; update bumpa updatedAt; remove por id.
- Testes (repositories.test.ts): +8 (contracto CRUD+toggle).
- Gate: `npx jest repositories` verde; tsc limpo.

### D4 — `DataProvider`: `todos` no reload + contexto — ✅
- `DataContextValue.todos`; `Promise.all += repos.todos.all()`; `setTodos`.
- Teste (dataProvider.test.tsx, novo): +1 (cria via repos → reload → `todos` no snapshot).
- Gate: `npx jest dataProvider|integration` verde; tsc limpo.

## FASE F3 — UI da aba Tarefas
_pendente (D5→D6→D7→D8)_

## FASE F4 — Hoje
_pendente (D9)_

## FASE F5 — Estatísticas + remoção Calendário
_pendente (D10→D11)_

## FASE F6 — Export/import + isolamento
_pendente (D12)_

## FASE F7 — Verificação + release
_pendente (D13→D14→D15)_

## Contagem acumulada
| Marco | Testes | Suites |
|---|---|---|
| Baseline (v0.2.3-c4fix) | 281 | 42 |
| Após F1+F2 (D1–D4) | 304 | 44 |