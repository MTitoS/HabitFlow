# PROGRESS-c2 — HabitFlow · Status por task (C1..C17)

> Estado 3 — implementação do ciclo 2. Verificado por CI local (jest · tsc · eslint · web export).
> Fonte da ordem/deps: `docs/PLAN-c2.md`. Contrato: `docs/SPEC-c2.md` (§10 decisões fechadas).

## Legenda
- **ok** — implementado e verificado.
- **deferred** — não executado (justificado).
- **fail** — bloqueado (justificado).

---

## F1 — Núcleo de streak geral

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C1 | `overallStreak.ts` (`computeOverallStreaks` + `isConqueredDay`) | ok | skip neutro + missed zera; 9 testes |
| C2 | `monthDayStatus` (heatmap) | ok | vencido/parcial/neutro derivados de `isConqueredDay` |
| C3 | `DaySummary` aditivo + fiação `aggregate.ts` | ok | legado `overallCurrent/BestStreak` intacto; +3 testes |

## F2 — Home

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C4 | `motivationalPhrases.ts` (50 frases) + `phraseForDate` | ok | determinística por `dateKey`, sem `Math.random` |
| C5 | `HomeStreakHeader` | ok | card compacto, 1 linha frase/atribuição, reduced-motion safe |
| C6 | `HabitRow` streak opcional | ok | mesma linha da frequência; card não cresce |
| C7 | Fiação Home (`src/app/index.tsx`) | ok | header acima de `TodayProgress`; streak por hábito |

## F3 — Hábitos

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C8 | `sortHabits` + `filterHabitsByName` | ok | added/routine/alpha; busca case+acento-insensível |
| C9 | Prefs: ordem + filtro persistidos | ok | `habitflow:prefs:habitsView`; roundtrip testado |
| C10 | `EmptyState` kind `no-results` | ok | busca sem resultado com mensagem própria |
| C11 | Tela Hábitos: busca + ordenação + filtro + agrupamento | ok | `HabitsToolbar` testável; `+` sempre visível |

## F4 — Estatísticas

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C12 | Remover `ConsistencyCalendar` | ok | arquivo deletado; zero referências; aba Calendário intacta |
| C13 | `MonthView` (headline + heatmap + resumo) | ok | legenda não-só-cor; +4 testes |
| C14 | Fiação Estatísticas (`StreakCard` geral + `MonthView`) | ok | best individual segue em `HabitDetail` |

## F5 — Polish

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C15 | A11y dos componentes novos | ok | labels em header/streak/heatmap/toolbar; estados não-só-cor |
| C16 | Reduced-motion + light/dark + empty states | ok | tokens semânticos, sem animação obrigatória |
| C17 | Verificação final DoD + regressão | ok | jest/tsc/lint/web export; ver `docs/REVIEW.md` |

---

## Resumo

- **Total:** 17 · **ok:** 17 · **deferred:** 0 · **fail:** 0
- **Regressão:** baseline 171 testes preservado; suite total com os novos testes 213+ verdes.
- **Invioláveis:** `opens.ts` §15.1 intocado; `daySummary` legado preservado (campos aditivos);
  histórico append-only; frequência vigente (10.4 off-future).
- **Desvios:** `sortHabits('routine')` agrupa por `routineId` (sem nova dependência de `routines`);
  a tela faz o agrupamento visual com nomes/subtítulos.
