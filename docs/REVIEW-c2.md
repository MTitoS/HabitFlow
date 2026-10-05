# REVIEW-c2 — HabitFlow · RUG ciclo 2 (State 4 Review)

Data: 2026-10-05 · Autor: executor State 4 (review) · Ambiente: Windows, Node, Expo SDK 57, RN 0.86.

Entrada: 17/17 tasks `ok` (`docs/PROGRESS-c2.md`), baseline c1 = 171 testes, release `v0.2.0-c2` publicada.
Contrato: `docs/SPEC-c2.md` (§10 decisões fechadas) · Plano: `docs/PLAN-c2.md` · Qualidade: driver §45 / `docs/SPEC.md` §14.

## Verdict

**APPROVED** — os 6 refinamentos T1–T6 (C1..C17) estão implementados, testados e cobertos por commits.
`npm test` 213/213 verdes (171 baseline + 42 novos), `tsc` e `lint` limpos, web export OK. Nenhum
bloqueador. Divergências e observações são de baixa severidade e estão documentadas em §5/§6.

---

## 1. Cross-check C1–C17 → commits/código/testes

Todos os commits de código do ciclo 2 estão na branch (`1133492..HEAD`); nenhum artefato do plano ficou
sem implementação. Mapeamento verificado por `git log --name-status` + leitura dos arquivos.

| Task | Fase | Commit | Artefato | Teste | Status |
|---|---|---|---|---|---|
| C1 | F1 | `1133492` | `src/domain/streak/overallStreak.ts` (`computeOverallStreaks`, `isConqueredDay`) | `overallStreak.test.ts` (9 casos) | ok |
| C2 | F1 | `1133492` | `monthDayStatus` (mesmo módulo) | `overallStreak.test.ts` (2 casos) | ok |
| C3 | F1 | `1133492` | `DaySummary` aditivo + `aggregate.ts` | `aggregate.test.ts` (+3 casos C3) | ok |
| C4 | F2 | `119e545` | `src/config/motivationalPhrases.ts` (50) + `phraseForDate` | `motivationalPhrases.test.ts` | ok |
| C5 | F2 | `119e545` | `src/components/feature/HomeStreakHeader.tsx` | `HomeStreakHeader.test.tsx` | ok |
| C6 | F2 | `119e545` | `HabitRow.tsx` prop `streak?` | `HabitRow.test.tsx` (+2 casos) | ok |
| C7 | F2 | `119e545` | fiação `src/app/index.tsx` | `tsc` + web export | ok |
| C8 | F3 | `62b43cb` | `src/domain/habit/sortHabits.ts` | `sortHabits.test.ts` | ok |
| C9 | F3 | `62b43cb` | `src/services/prefs.ts` (`HabitsViewPrefs`) | `prefs.test.ts` | ok |
| C10 | F3 | `62b43cb` | `EmptyState` kind `no-results` | regressão | ok |
| C11 | F3 | `62b43cb` | `HabitsToolbar.tsx` + `habits/index.tsx` | `HabitsToolbar.test.tsx` | ok |
| C12 | F4 | `d7bf8b3` | remoção de `ConsistencyCalendar` (arquivo + import) | regressão + grep | ok |
| C13 | F4 | `3dcfcdd` | `dashboard/MonthView.tsx` | `MonthView.test.tsx` (4 casos) | ok |
| C14 | F4 | `3dcfcdd` | fiação `statistics/index.tsx` (`StreakCard` geral + `MonthView`) | smoke + web | ok |
| C15 | F5 | `eb94ec3` | a11y nos componentes novos | `getByLabelText` `*.test` | ok |
| C16 | F5 | `eb94ec3` | revisão reduced-motion / light-dark | web light/dark (revisão, sem artefato novo) | ok¹ |
| C17 | F5 | `114a5dc`/`f49e822` | `PROGRESS-c2.md` + verificação final | suite + tsc + lint + export | ok |

¹ C16 é task de revisão (sem código novo além do ajuste a11y de C15); a conformidade é evidenciada por
tokens semânticos e ausência de animação obrigatória — não gera teste próprio. Não bloqueia.

Gaps: nenhum artefato faltante. Nenhum arquivo órfão.

---

## 2. Regras críticas — verificação

| Regra | Verificação | Resultado |
|---|---|---|
| Skip-neutro nos 2 níveis | `overallStreak.test.ts` (`all-done-except-skip`, skip cobre agendado ⇒ soma); `aggregate.test.ts` C3 skip; individual já coberto por `currentStreak.test.ts` | ✅ |
| `missed` zera (geral) | `overallStreak.test.ts` (`missed` ⇒ current/best = 1); `aggregate.test.ts` C3 reset | ✅ |
| `opens.ts` §15.1 intocado | `git diff 3d4887e..HEAD -- src/config/opens.ts src/domain/skip-credit` ⇒ vazio | ✅ |
| `daySummary` aditivo | Campos legados `overallCurrentStreak`/`overallBestStreak` preservados e consumidos por `buildDerivedStats` (achievements/celebração intactos); novos `dayStreakCurrent`/`dayStreakBest` consumidos por Home/`StreakCard` | ✅ |
| Histórico append-only | `src/data/**`, `record/model.ts`, repositórios sem diff no ciclo 2 | ✅ |
| Frase determinística por dia | `phraseForDate` = hash puro de `dateKey` `% 50`, sem `Math.random()` (grep: único `Math.random` é `impl.ts:22` `generateId`, pré-existente); teste de estabilidade | ✅ |
| Prefs persistido | `get/setHabitsViewPrefs` chave `habitflow:prefs:habitsView`, roundtrip + `null` + JSON inválido testados; tela persiste a cada troca e aplica default no 1º boot | ✅ |
| `ConsistencyCalendar` removido | Arquivo deletado; `grep -r ConsistencyCalendar src` ⇒ 0 referências; `src/app/calendar/index.tsx` sem diff | ✅ |
| Zero hex cru fora de `theme/` | Nenhum hex nos arquivos do ciclo 2; únicos literais fora de `src/theme/` são `shadowColor: '#000'` em `AddHabitButton.tsx:93` e `Toast.tsx:114` (pré-existentes, c1) | ✅ |
| Estados não-só-cor | `HabitStreak`/`HomeStreakHeader`/`MonthView` usam símbolo + rótulo textual + `accessibilityLabel`; chips expõem `accessibilityState.selected` | ✅ |

---

## 3. Verificação prática (re-executada nesta review)

| Comando | Exit | Resultado |
|---|---|---|
| `npm test` | 0 | 38 suites / 213 testes passando (171 baseline + 42 novos) |
| `npx tsc --noEmit` | 0 | No errors found |
| `npm run lint` | 0 | sem warnings |
| `npx expo export --platform web` | 0 | 19 rotas estáticas, incluindo `/statistics` e `/calendar` |

Alertas (não falham nada):
- Jest: `A worker process has failed to exit gracefully` — herdado do c1, sem correlação com o ciclo 2.
- React `act()`: "You seem to have overlapping act() calls" emitido por `HabitsToolbar.test.tsx`
  (o teste usa `fireEvent` síncrono após `await render()`). Cosmético; nenhum teste quebra.

---

## 4. Code review pontual

- **`src/domain/streak/overallStreak.ts`** — bem isolado e puro (usa `isScheduled`, `addDays`,
  `compareDateKeys`, `toDateKey`, `indexRecords`; sem I/O). `isConqueredDay` = ≥1 agendado **e** todos
  `completed`/`skipped`; `scanCurrent` (hoje → trás, neutro para dia sem agendados, não soma/não zera hoje)
  e `scanBest` espelham a semântica de `currentStreak`. Lower bound por menor `createdAt`/record. Apenas
  hábitos ativos. Correto para o SPEC §3.2/§10.4.
  - Observação menor: `isConqueredDay` re-indexa `records` e re-filtra hábitos a cada dia dentro de
    `scanCurrent`/`scanBest` (`O(dias × registros)`). Irrelevante no volume do MVP; candidato a *hoist* do
    índice em manutenção futura.
- **`HomeStreakHeader.tsx`** — card compacto (`surface`+`border`+`radius.card`), ícone `fire` + número em
  `PlusJakartaSans_800ExtraBold` + rótulo textual; frase e autor com `numberOfLines={1}`; sem animação
  obrigatória; `accessibilityLabel` combinando streak + frase + autor. Atende §5.1 e §9 UX.
- **`HabitRow.tsx`** — `streak?: number` renderiza `HabitStreak` na mesma `subRow` da frequência (altura do
  card inalterada); `HabitStreak` retorna `null` quando `days <= 0`. Testes novos confirmam exibição e
  omissão. Correto para §5.3.
- **`HabitsToolbar.tsx` + `habits/index.tsx`** — busca `TextInput` rotulada; 3 chips de ordenação; chips
  "Todas"/rotinas/"Sem rotina" com `accessibilityState.selected`; pipeline
  `tab → filterHabitsByName → rotina → sortHabits`; empty state `no-results` mantendo o `+` visível;
  prefs carregadas no mount e persistidas a cada troca. Fluxo correto para T4.
- **`MonthView.tsx`** — headline (ícone+valor+rótulo), heatmap via `buildMonthGrid` e estado por dia vindo
  de `monthDayStatus` (domínio único), legenda `✓/◐/○` com rótulo textual, resumo (dias vencidos + taxa).
  `ConsistencyCalendar` removido; regra de "vencido" não duplicada. Correto para T5/T6.
- **`HabitDetail` (`src/app/habits/[id]/index.tsx:69`)** — métrica "Melhor" (best individual) permanece
  visível, conforme §10.5.

---

## 5. Desvios do plano (documentados, não bloqueiam)

1. **Release**: o PLAN-c2 sugeria tag `v0.1.9-mvp`; o ciclo entregou `versionName "2.0.0"` /
   `versionCode 10` / tag **`v0.2.0-c2`**. Divergência de nomenclatura já registrada em `PROGRESS-c2.md` e
   coerente com a missão (release `v0.2.0-c2` publicada).
2. **`sortHabits('routine')`** agrupa por `routineId` (ordenação por string), sem depender da ordem da
   tabela de rotinas; a tela faz o mapeamento de nomes/subtítulos. Registrado em `PROGRESS-c2.md`; o
   domínio está testado.
3. **Device verify (`adb` wireless)**: `deferred` — device offline no momento; mitigado por web export e
   build release arm64 bem-sucedidos.

---

## 6. Riscos

| Item | Severidade | Nota |
|---|---|---|
| Worker Jest não encerra com elegância | Baixo | Herdado do c1; nenhum fail. `--detectOpenHandles` em manutenção. |
| `act()` warning em `HabitsToolbar.test.tsx` | Baixo | Cosmético; ajustar o await/`act` do teste futuramente. |
| `isConqueredDay` re-indexa por dia | Baixo | Custo O(dias × registros); irrelevante no MVP. |
| Device verify pendente | Baixo | Build/web OK; retomar quando o device voltar. |
| Notificações em device | Médio (herdado c1) | Não alterado neste ciclo. |

## 7. Bloqueadores

Nenhum.

## 8. Recomendação / Signoff

- **APPROVED** para o escopo do RUG ciclo 2 (refinamentos T1–T6).
- DoD global (`PLAN-c2 §2`) cumprido: 213 testes verdes, `tsc`/`lint` limpos, web export OK, `opens.ts`
  §15.1 intocado, `daySummary` aditivo, histórico append-only.
- Follow-ups opcionais (não bloqueiam): limpar o warning de `act()` no teste da toolbar; considerar *hoist*
  do índice em `overallStreak`; validar em device quando disponível.

Executor State 4: **APPROVED** · Data: 2026-10-05
