# REVIEW-c4 — HabitFlow · RUG ciclo 4 (State 4 Review)

Data: 2026-10-08 · Autor: executor State 4 (review) · Ambiente: Windows, Node, Expo SDK 57, RN 0.86.

Entrada: 8/8 tasks `ok` (`docs/PROGRESS-c4.md`), baseline c3 = **243 testes / 40 suites**, release
`v0.2.2-c4` publicada. Contrato: `docs/SPEC-c4.md` (§11 c4.1–c4.5, c4-O1/c4-O2) · Plano:
`docs/PLAN-c4.md` (C1–C8, F1–F5) · Padrão: `docs/REVIEW-c3.md`.

> Este documento **supersede** o check-in do State 3 (`REVIEW-c4` v1) e registra o review independente
> do State 4: cross-check de commits/código/testes, regras críticas, delta do grafo, re-execução da
> suite e verdict.

## Verdict

**APPROVED** — os 4 refinamentos do ciclo (T1 barras segmentadas por status, T2 legenda nos 2 cards,
T3 paleta unificada, T4 tokens próprios) estão implementados, testados e rastreados por commits.
`npm test` **259/259** verdes (243 baseline + 16 novos / 41 suites), `tsc --noEmit` e `lint` com
exit **0**, download anônimo do release **HTTP 200**. Nenhum bloqueador. Observações de baixa
severidade em §6 (todas herdadas ou por escopo).

---

## 1. Cross-check C1–C8 → commit/código/teste

Mapeamento verificado por `git log --name-status`, `git diff b70fc71..936a8ae` e leitura direta dos
arquivos. Nenhum artefato órfão.

| Task | Fase | Commit | Artefato | Teste | Status |
|---|---|---|---|---|---|
| C1 | F1 | `239cad8` | `domain/stats/aggregate.ts` (`DayComposition`+`composeDay`) | `aggregate.test.ts` (+6) | ok |
| C2 | F1 | `239cad8` | `DayPoint` estendido + `weeklySeries`/`monthlySeries` (`indexRecords` 1×) | `aggregate.test.ts` (+5) | ok |
| C3 | F2 | `239cad8` | `theme/colors.ts` + `theme/types.ts` + `ALL_COLOR_TOKENS` | `theme.test.ts` (+1 contraste) | ok |
| C4 | F3 | `239cad8` | `feature/dashboard/ChartLegend.tsx` | `ChartLegend.test.tsx` (+3) | ok |
| C5 | F3 | `239cad8` | `feature/dashboard/WeeklyChart.tsx` | `dashboard.test.tsx` (label composta) | ok |
| C6 | F4 | `239cad8` | `feature/dashboard/CompletionChart.tsx` | `dashboard.test.tsx` (+1) | ok |
| C7 | F5 | `8aa1e37` | `docs/REVIEW-c4.md` | suite + tsc + lint + web | ok |
| C8 | F5 | `2e5aa0f` / `1bf7162` | `app.json` + `android/app/build.gradle` + `PROGRESS-c4.md` | HTTP 200 + push | ok |

Distribuição dos 16 testes novos: +6 (C1), +5 (C2), +1 (C3), +3 (C4), +1 (C6) = **16**.
C5/C6 alteraram a **label de a11y** (contrato deliberado, SPEC-c4 §2.6/§12) — a fixture de C2 em
`dashboard.test.tsx` e `MonthView.test.tsx` só recebeu os campos aditivos.

Cadeia de commits: `c1a7383` (PLAN/SPEC) → `239cad8` (C1–C6) → `8aa1e37` (C7) → `2e5aa0f` (C8 bump)
→ `413049c` (**tag `v0.2.2-c4`**) → `1bf7162` (verificação de release) → `936a8ae` (State 3 → 4).
Gaps: nenhum artefato faltante.

---

## 2. Regras críticas — verificação

| Regra | Verificação (arquivo:linha) | Resultado |
|---|---|---|
| Buckets concluído / skipado / não concluído | `aggregate.ts:58-63`: `completed`→`done`; `skipped`→`skipped`; qualquer outro/ausente→`undone` | ✅ |
| `undone` = pending + missed + sem-record | bucket único por construção (`undone = scheduled - done - skipped`); testes C1 (3 casos) | ✅ |
| Dia sem agendados fora da composição | `aggregate.ts:56` pula `!isScheduled`; teste C1 `{0,0,0,0}` | ✅ |
| Invariante `done+skipped+undone === scheduled` | `aggregate.ts:63`; teste dedicado C1 `aggregate.test.ts:151-159` | ✅ |
| Hábito arquivado não conta | `aggregate.ts:55` pula `habit.archivedAt`; testes C1 (`:145-149`) e C2 (`:197-204`) | ✅ |
| `DayPoint` **aditivo** (legado intacto) | diff `b70fc71..936a8ae -- aggregate.ts` = **+42/−1**; `completed`/`percent`/`weekday` inalterados; `completedOn` intocado (`:70-72`) | ✅ |
| Composição derivada (zero schema/migration) | só `indexRecords` + `isScheduled`; nenhum modelo/coluna tocado | ✅ |
| Tokens próprios (T4) | `types.ts:50-52`; `colors.ts:54-56, 126-128, 197-199`; `ALL_COLOR_TOKENS:271-273` | ✅ |
| Contraste ≥3:1 light/dark sobre `surface` | `theme.test.ts:64-69` (`chartDone/Skip/Undone` × light/dark) | ✅ |
| **Mesmos** tokens/legenda nos 2 cards (T3) | `WeeklyChart.tsx:15-22,65` e `CompletionChart.tsx:14-21,61` usam idêntico `segmentsOf` (@chartDone/Skip/Undone) + `<ChartLegend/>` | ✅ |
| Paleta divergente **removida** | `CompletionChart` não usa mais `accent`/`border` para a barra | ✅ |
| Ordem vertical base→topo | `segmentsOf(...).reverse()` ⇒ JSX topo=undone, meio=skip, base=done (`WeeklyChart:36`, `CompletionChart:34`) | ✅ |
| Normalização por `maxScheduled` | `WeeklyChart:26,53`; `CompletionChart:25,50` (scheduled/maxScheduled) | ✅ |
| Separador de 1px (não-só-cor §37) | `index>0 && borderTopWidth:1` com `theme.color('surface')` (`WeeklyChart:51`, `CompletionChart:48`) | ✅ |
| Legenda textual com swatch | `ChartLegend.tsx:26-34` + `accessibilityLabel` textual (`:26`) | ✅ |
| `accessibilityLabel` composta por barra | `WeeklyChart:41` / `CompletionChart:39` (`{n} concluídos, {n} skipados, {n} não concluídos ({pct}%)`) | ✅ |
| Dia sem agendado = trilha neutra | `hasData = scheduled>0 && maxScheduled>0` — sem segmentos | ✅ |
| Sem animação obrigatória / sem hatch | Views estáticas; sem import de `react-native-svg` nos charts (c4-O2) | ✅ |
| Zero hex cru fora de `theme/` | grep `#xxxxxx` em `src/**/*.tsx` = 0; `dashboard/` = 0 | ✅ |
| `opens.ts` §15.1 intocado | `git diff b70fc71..936a8ae -- src/config/opens.ts` = **vazio** | ✅ |
| `calendar/index.tsx` e `MonthView.tsx` intactos | diff do ciclo não toca nenhum dos dois (só fixtures de teste) | ✅ |

---

## 3. Delta check — Codebase Memory (norma v2)

- `index_status` (1×) do projeto `C-Coding-Projetos-Pessoal-HabitFlow`: **1.774 nós / 4.756 edges**.
- Implement reportou **1.771 / 4.753**. Delta solicitado é `>= reportado` ⇒ **PASS** (`+3 / +3`,
  variação de re-scan; consistência implement ↔ grafo).
- Frescor comprovado: `search_graph` acha `composeDay` (`aggregate.ts:45-64`) e `ChartLegend`
  (`ChartLegend.tsx:22-35`) no grafo.
- `coverage`: `parse_partial` só em `android/gradlew` e `android/settings.gradle` (fora de `src/`,
  sem impacto). `skipped`: 0. `not_indexed`: 65 por design (gitignore/sufixos).

---

## 4. Verificação prática (re-executada nesta review)

| Comando | Exit | Resultado |
|---|---|---|
| `npm test` | 0 | **41 suites / 259 testes** passando (243 baseline + 16 novos) |
| `npx tsc --noEmit` | 0 | No errors found |
| `npm run lint` | 0 | sem erros/warnings |
| `node fetch` asset `HabitFlow-arm64.apk` (`v0.2.2-c4`, HEAD) | 0 | **HTTP 200** |

Bump conferido: `app.json` `"version": "2.2.0"` / `versionCode 12` e `android/app/build.gradle`
`versionCode 12` / `versionName "2.2.0"`; regras do `build.gradle` intocadas. Push registrado
`b70fc71..413049c` (tag no remoto = `413049c`).

---

## 5. Code review pontual

- **`src/domain/stats/aggregate.ts:45-64`** — `composeDay` puro (sem `now`, sem I/O); itera sobre os
  hábitos e só conta `isScheduled`; `undone` derivado por subtração, garantindo a invariante por
  construção. Filtro extra `habit.archivedAt` (`:55`) é defesa em profundidade (o caller já passa
  ativos). Atende c4.1/c4-O1.
- **`aggregate.ts:106-131 / 133-162`** — `weeklySeries`/`monthlySeries` constroem `indexRecords` **1×**
  (`:108,135`) e preenchem a composição; as 3 expressões legadas (`scheduled`/`completed`/`percent`)
  permanecem idênticas. Extensão puramente aditiva.
- **`src/components/feature/dashboard/WeeklyChart.tsx:15-66`** — `segmentsOf` filtra segmentos não
  nulos e `reverse()` para empilhar base=done → topo=undone; `track` fixo 96 com `overflow:hidden` e
  separador `surface`. `pct` legado mantido no topo (`:34,43`). `<ChartLegend/>` no rodapé (`:65`).
- **`src/components/feature/dashboard/CompletionChart.tsx:14-63`** — mesma estratégia preservando
  barras finas (`row` gap 3, `barWrap` height 64); label a11y por `monthDay`. Unificação de paleta T3.
- **`src/components/feature/dashboard/ChartLegend.tsx:22-35`** — 3 swatches 10×10 + label curta;
  `accessibilityLabel` textual concatenada; tokens via `theme.color`. Reusável (props `items`).
- **`src/theme/colors.ts` / `types.ts`** — 3 tokens nos 2 temas e em `ALL_COLOR_TOKENS`; `chartDone`
  reusa a família do `MonthView` (`calendarDoneFill`), `chartSkip` a família de `skipFill`, `chartUndone`
  novo (dark `#C0795F` por contraste — c4.5/§6.2).
- **`src/config/opens.ts`** — não tocado (regra dura §15.1).

---

## 6. Desvios e observações (baixa severidade — não bloqueiam)

| Item | Severidade | Nota |
|---|---|---|
| C1–C6 entregues em um **único commit** (`239cad8`) | Baixa | PLAN pede tasks atômicas; rastreabilidade preservada por código/teste (tabela §1), mas sem um commit por task. |
| Mensagem do commit da tag `v0.2.2-c4` (`413049c`) = "state: c4 gate 2 aprovado, advance to implementation" | Baixa | Nome confuso para o ponto de release; ancestralidade contém C1–C8. Cosmético. |
| `main` local **1 commit à frente** do remoto (`936a8ae` State 3 → 4 não empurrado) | Baixa | Esperado no fluxo (push no selo do State 4); `origin/main = 1bf7162`. |
| Bug latente §2.1 (`completedOn` conta record de hábito arquivado podendo inflar `completed`/`percent` **legado**) | Baixa | Não corrigido por escopo; charts usam composição per-scheduled (não afetados). Em dia com record de arquivado o **rótulo `%`** legado pode divergir dos segmentos — risco documentado, decisão de não tocar superfícies congeladas. |
| `segmentsOf` duplicado em `WeeklyChart`/`CompletionChart` | Baixa | Diff mínimo por card; `ChartLegend` é o único compartilhado exigido por contrato (c4.4). |
| Gramática da label a11y ("1 concluídos") | Baixa | Formato fixado por contrato SPEC-c4 §6.3; manter verbatim. |
| Device verify (`adb` wireless) `SKIP` — device offline (`10061`) | Baixa | Mitigado por build release arm64 + download anônimo HTTP 200. |
| Jest: `A worker process has failed to exit gracefully` | Baixa | Herdado de c1–c3; nenhum fail, exit 0. |

---

## 7. Bloqueadores

Nenhum.

---

## 8. Recomendação / Signoff

- **APPROVED** para o escopo do RUG ciclo 4 (T1 barras segmentadas, T2 legenda, T3 paleta unificada,
  T4 tokens próprios).
- DoD global (`PLAN-c4 §2`) cumprido: **259 testes** sem regressão dos 243, `tsc`/`lint` limpos,
  `opens.ts` §15.1 intocado, `calendar`/`MonthView` sem mudança de comportamento, composição derivada
  (zero schema), zero hex cru fora de `theme/`, não-só-cor (§37) garantido.
- Release `v0.2.2-c4` publicada com download anônimo HTTP 200 (reconfirmado nesta review).
- Follow-ups opcionais (não bloqueiam): empurrar `936a8ae`; corrigir a mensagem do commit da tag numa
  janela de manutenção; eventual correção futura do bug §2.1; validar em device quando disponível.

Executor State 4: **APPROVED** · Data: 2026-10-08
