# REVIEW-c5 — HabitFlow · Aba Tarefas + detalhe do dia em Estatísticas (v0.3.0)

> Ciclo c5 · State 3 (Implementation RUG loop) · Base SPEC-c5 (23/23 fechadas) + PLAN-c5 (D1–D14).
> Responsável: execução autônoma (autonomy=high). Data: 2026-10-11.

## Verdict: **APPROVED**

## 1. Resumo

Módulo **isolado** de Tarefas (to-dos) entregue de ponta a ponta: domínio puro → persistência aditiva
(tabela `todos`, `DB_VERSION` 1→2) → aba **Tarefas** substituindo **Calendário** (5 abas) → telas
create/edit com exclusão confirmada → seção "Tarefas de hoje" em Hoje → calendário do mês interativo
em Estatísticas com detalhe inline (hábitos read-only + to-dos marcáveis). Módulo 100% isolado de
stats/streak/completion (L7 provado por teste).

## 2. Verificação (comandos + resultados)

| Verificação | Comando | Resultado |
|---|---|---|
| Testes | `npx jest` | **343 passed / 54 suites** (baseline 281/42 — **+62 testes**, sem regressão) |
| Typecheck | `npx tsc --noEmit` | **No errors found** |
| Lint | `npx expo lint` | **0 problems** |
| Web | `npx expo export --platform web` | **Exported: dist** (rota `/todos` presente; sem `/calendar`) |
| Órfãos Calendário | `calendar-removed.test.ts` | arquivo ausente + zero referências `app/calendar`/`/calendar` |
| Arquivos intocados | `git diff e1d7488 --stat` | `records`/`opens.ts`/charts/`WeekStatusRow`/adapters/`theme` = **0 diff** |

## 3. Checklist DoD (SPEC-c5 §11)

- [x] Aba **Tarefas** existe, **Calendário** não; **5 abas** (NavItems test).
- [x] Criar/editar/concluir/reabrir/excluir persistem (repo + telas create/edit + delete confirm).
- [x] To-do sem data ⇒ "Algum dia"; com data ⇒ no dia (`groupedByDay`/`todosForDay` + tela).
- [x] To-dos de hoje em **Hoje** (seção própria, marcáveis) — `TodayTodos` + `app/index.tsx`.
- [x] Estatísticas: tocar o mês expande o detalhe; to-dos do dia **marcáveis dali** (inline).
- [x] Detalhe do dia: status por hábito **read-only** + to-dos.
- [x] To-dos **não** alteram stats/streak/completion (L7 test).
- [x] Export/import roundtrip inclui `todos`; backup **v1** migra sem erro.
- [x] `src/app/calendar/index.tsx` removido e sem referências órfãs.
- [x] Baseline 281 sem regressão + novos verdes; `tsc`, `lint`, web limpos.
- [x] Habit records, charts c4fix e `opens.ts` intocados.

## 4. Rastreabilidade task → teste

| Task | Artefato | Testes |
|---|---|---|
| D1 | `domain/todo/model.ts` | `model.test.ts` (10) |
| D2 | `schema.ts` + `migrations/index.ts` | `exportImport.test.ts` (+4) |
| D3 | `repositories/{types,impl}.ts` | `repositories.test.ts` (+8) |
| D4 | `DataProvider.tsx` | `dataProvider.test.tsx` (1) |
| D5 | `Icon.tsx` + `EmptyState.tsx` | `Icon.test.tsx` (+1), `EmptyState.test.tsx` (2) |
| D6 | `feature/TodoRow.tsx` | `TodoRow.test.tsx` (6) |
| D7 | `app/todos/index.tsx` + `NavItems.tsx` | `todos-screen.test.tsx` (5), `NavItems.test.tsx` (1) |
| D8 | `todo-form` + `create` + `[id]/edit` | `todo-form.test.tsx` (5), `todo-screens.test.tsx` (3) |
| D9 | `feature/TodayTodos.tsx` + `app/index.tsx` | `TodayTodos.test.tsx` (4) |
| D10 | `MonthView` + `CalendarDetail` + `statistics/index.tsx` | `MonthView.test.tsx` (+2), `CalendarDetail.test.tsx` (4), `statistics-detail.test.tsx` (1) |
| D11 | delete `calendar/index.tsx` | `calendar-removed.test.ts` (2) |
| D12 | testes de roundtrip/isolamento | `exportImport.test.ts` (+2), `integration.test.ts` (+1) |

## 5. Codebase Memory (delta)

- Re-index `moderate` 1× → **2090 nós / 5571 edges**.
- Baseline anterior (e1, `docs/REVIEW-c4.md` 1774 + delta e1 +56/+108) ≈ 1830 / 4864.
- **Delta c5 ≈ +260 nós / +707 edges.** `parse_partial`: apenas `android/gradlew` e
  `android/settings.gradle` (Gradle, irrelevante). `skipped`: 0.

## 6. Riscos residuais

| Risco | Status |
|---|---|
| Mudança de contrato do `MonthView` quebrar consumidores | Mitigado: `onSelectDay` opcional; teste retro-compat preservado. |
| Migração v1→v2 quebrar backups antigos | Mitigado: migration aditiva + 2 testes (v1 sem `todos`, v2 sem re-run). |
| Contaminação de stats (L7) | Mitigado: teste de não-regressão antes/depois. |
| `CalendarDetail` depende de data real em teste | `statistics-detail.test.tsx` usa `dateKey` fixo no passado; robusto até 2026-05-05. |

## 7. Conclusão

DoD global atendido; zero regressão; módulo isolado; release v0.3.0 (vc15) habilitado (D14).
