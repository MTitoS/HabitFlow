# REVIEW-e1 — HabitFlow · RUG ciclo e1 (State 4 Review)

Data: 2026-10-08 · Ambiente: Windows, Node, Expo SDK 57, RN 0.86.

Entrada: 5/5 tasks `ok` (`docs/PROGRESS-e1.md`), baseline c4fix = **266 testes / 41 suites**, release
`v0.2.4-e1`. Contrato: `docs/SPEC-e1.md` (e1.1–e1.6) · Plano: `docs/PLAN-e1.md` (E1–E5).

## Verdict

**APPROVED** — a aba Calendário global agora usa **a mesma semântica do `MonthView`/streak (c3)**:
dia **conquered** (todos completed **ou** skipped) destacado com ✓ fill, dias com **≥1 skip**
(exceto conquered) com **flag de skip** (`accent`), pending de hoje neutro, e detalhe por-task ao
tocar preservado. `npx jest` **281/281** verdes (266 baseline + 15 novos / 42 suites), `tsc --noEmit`
e lint exit **0**, web export ok, download anônimo do release **HTTP 200**.

## 1. Cross-check E1–E5 → commit/código/teste

| Task | Commit (mais recente) | Artefato | Teste | Status |
|---|---|---|---|---|
| E1 | `b2f4146` | `overallStreak.ts:39-78` (`calendarDayInfo`) | `overallStreak.test.ts` (+7) | ok |
| E2 | `b2f4146` | `CalendarDayCell.tsx` | `CalendarDayCell.test.tsx` (+8) | ok |
| E3 | `b2f4146` | `calendar/index.tsx` (`MonthGrid` → `CalendarDayCell`) | suite | ok |
| E4 | `b2f4146` | `REVIEW-e1.md` | suite + tsc + lint + web | ok |
| E5 | `ef00b57` | `app.json` + `build.gradle` + `PROGRESS-e1.md` | HTTP 200 + push | ok |

Cadeia de commits: `0cff029` (SPEC/PLAN) → `b2f4146` (E1–E4) → `ef00b57` (bump + PROGRESS) →
`v0.2.4-e1` (tag). Gaps: nenhum artefato faltante.

## 2. Regras críticas — verificação

| Regra | Verificação (arquivo:linha) | Resultado |
|---|---|---|
| Conquered = `isConqueredDay` (reuso, zero duplicação) | `overallStreak.ts:69` chama `isConqueredDay(active, records, dateKey)` | ✅ |
| `done`/`skipped` só por agendado ativo | `overallStreak.ts:60-67`: itera `scheduledOn(activeHabits(...))` | ✅ |
| Flag de skip quando `skipped>0` e não conquered | `CalendarDayCell.tsx` (`showSkip`), inclui dia parcial | ✅ |
| Sem skip bar em conquered | teste `CalendarDayCell.test.tsx` (`queryByTestId` null) | ✅ |
| Pending neutro / miss neutro / vazio neutro | `CalendarDayCell.tsx` mark `pending` (sem fill) | ✅ |
| Dia só-skipado **sem** borda pending | borda `calendarPendingBorder` só `mark==='pending'` | ✅ |
| Zero token novo / tokens compartilhados | `git diff` em `theme/` = vazio; usa `calendarDoneFill/Fg`, `calendarSkipFill/Fg`, `accent` | ✅ |
| Detalhe por-task intacto | `calendar/index.tsx` `dayStatus`/`statusForView` sem diff funcional | ✅ |
| Charts c4fix + `opens.ts` §15.1 + `MonthView` intocados | `git diff` nos arquivos = vazio (só imports do calendário) | ✅ |

## 3. Delta check — Codebase Memory

Re-index `full` 1×: before **1.780 / 4.781** → after **1.836 / 4.889** (**+56 / +108**).
Frescor: `calendarDayInfo`, `CalendarDayInfo` e `CalendarDayCell` presentes no grafo (`search_graph`).

## 4. Verificação prática (re-executada)

| Comando | Exit | Resultado |
|---|---|---|
| `npx jest` | 0 | **42 suites / 281 testes** passando |
| `npx tsc --noEmit` | 0 | No errors found |
| `npx expo lint` | 0 | sem erros/warnings |
| `npx expo export --platform web` | 0 | `dist` (rota `/calendar` presente) |
| Download anônimo `HabitFlow-arm64.apk` (`v0.2.4-e1`) | 0 | **HTTP 200** |

## 5. Observações (baixa severidade)

- Comportamento novo: ao navegar para outros meses, o grid agora deriva de `calendarDayInfo` (não mais
  de `monthlySeries`, que era limitado ao mês corrente) — marcação por records reais em qualquer mês.
  Melhoria aditiva, consistente com e1.5; sem regressão.
- `28 teste` novos da fixture de `MonthView.test.tsx`/`dashboard.test.tsx` não tocados (sem campos novos).
- Advertência Gradle (versão futura 10) e aviso do worker jest — herdados, exit 0.

## 6. Bloqueadores

Nenhum.

## 7. Signoff

**APPROVED** · Data: 2026-10-08 · Executor State 4.