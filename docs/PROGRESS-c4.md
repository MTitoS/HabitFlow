# PROGRESS-c4 — HabitFlow · Status por task (C1..C8)

> Estado 3 — implementação do ciclo 4 (refinamentos T1 barras segmentadas, T2 legenda, T3 paleta
> unificada, T4 tokens próprios). Fonte da ordem/deps: `docs/PLAN-c4.md`. Contrato: `docs/SPEC-c4.md`
> (§11 decisões fechadas c4.1–c4.5, c4-O1/c4-O2). Baseline de regressão: **243 testes / 40 suites**
> (v0.2.1-c3). Verificado por `npx jest` · `npx tsc --noEmit` · `npx expo lint` · web export.

## Legenda
- **ok** — implementado e verificado.
- **deferred** — não executado (justificado).
- **fail** — bloqueado (justificado).

---

## F1 — Domínio (counts)

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C1 | `DayComposition` + `composeDay` (puro) | ok | buckets concluído/skipado/não concluído; skip neutro com bucket próprio; invariante por teste; +6 casos |
| C2 | `DayPoint` aditivo + `weeklySeries`/`monthlySeries` (T1) | ok | `done/skipped/undone` via `indexRecords` 1×; `completed`/`percent`/`completedOn` legado intactos; +5 casos |

## F2 — Tokens de status (T3/T4)

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C3 | `chartDone`/`chartSkip`/`chartUndone` (light+dark) | ok | `theme/colors.ts` + `types.ts` + `ALL_COLOR_TOKENS`; contraste ≥3:1 sobre `surface` coberto por teste; +1 caso |

## F3 — WeeklyChart (T1/T2/T3)

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C4 | `ChartLegend` (3 swatches + labels, a11y) | ok | componente único reutilizável; zero hex cru; +3 casos |
| C5 | `WeeklyChart` segmentado + legenda + a11y composta | ok | segmentos verticais (base=done, meio=skip, topo=undone), separador 1px, % mantido, dia vazio = trilha neutra |

## F4 — CompletionChart (T1/T2/T3)

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C6 | `CompletionChart` segmentado (mesmos tokens/legenda) | ok | barras finas preservadas (`row` gap 3, `barWrap` height 64); paleta `accent`/`border` removida; +1 caso |

## F5 — Verificação / polish / release

| Task | Descrição | Status | Nota |
|---|---|---|---|
| C7 | Verificação final DoD + regressão + a11y/polish | ok | `docs/REVIEW-c4.md`; 259 testes verdes; tsc/lint/web limpos |
| C8 | Release `v0.2.2-c4` (State 3) | ok | ver §Release |

---

## Resumo

- **Total:** 8 · **ok:** 8 · **deferred:** 0 · **fail:** 0
- **Regressão:** baseline 243/40 preservado; suite total **259 testes / 41 suites** verdes.
- **Invioláveis:** `opens.ts` §15.1 (grant semanal) intocado; `completed`/`percent`/`completedOn`
  legado preservado; `calendar/index.tsx` e `MonthView.tsx` sem mudança de comportamento;
  composição **derivada** (zero schema/migration); **zero hex cru fora de `theme/`**.
- **Não-só-cor (§37):** separador de 1px entre segmentos (cor do card) + legenda textual com swatch
  + `accessibilityLabel` com contagens; sem animação obrigatória (reduced-motion safe); sem hatch
  (c4-O2, sem `react-native-svg` novo).

## Release

- Bump: `versionCode 12` / `versionName "2.2.0"` (`app.json` + `android/app/build.gradle`);
  regras do `build.gradle` intocadas.
- APK release arm64: **34.8 MB** (36,447,598 bytes, < 50 MB), Gradle `BUILD SUCCESSFUL` (2m18s,
  `--no-daemon`, junction `C:/AndroidSdkJ`, `JAVA_HOME=C:/android-jdk21`).
- Tag `v0.2.2-c4` + GitHub release "C4 - composição de status nos charts"; asset
  `HabitFlow-arm64.apk`; download **anônimo HTTP 200** verificado via `node fetch`; releases
  antigas preservadas.
- `git push origin main` (`b70fc71..413049c`).

## Device

- Device verify (`adb` wireless `192.168.15.26:34263`): **deferred/SKIP** — device recusou conexão
  (`cannot connect ... 10061`, `adb devices` vazio = offline). Não bloqueante; mitigado por web
  export dist + build release arm64 + download anônimo HTTP 200 do release.

## Codebase Memory (norma v2 — re-index por fase com prova)

- Re-index `full` **1×** ao fim do ciclo (projeto `C-Coding-Projetos-Pessoal-HabitFlow`).
- **Nodes/edges:** baseline do ciclo (nota de governança 09/10) **1.678 nós / 4.601 edges** →
  **1.771 nós / 4.753 edges** (**+93 nós, +152 edges**).
- Frescor comprovado: `composeDay` e `ChartLegend` presentes no grafo
  (`search_graph` = 4 matches). Nota: o snapshot lido imediatamente antes do re-index já mostrava
  1.771/4.753 (auto-refresh de projeto observado aplicou as mudanças antes da chamada explícita),
  por isso o delta é medido contra o baseline de governança.
- `parse_partial`: `android/gradlew`, `android/settings.gradle` (não-`src`, sem impacto no ciclo).
  `skipped`: 0. `not_indexed`: 65 por design (gitignore/sufixos).

---

## Fix pós-review — `v0.2.3-c4fix` (State 4 reopen)

Fato reportado em device (print): Ter/Qua com rótulo **100%** mas barra preenchida em ~metade;
Sex/Sáb/Dom com **0%** exibindo terracota (não concluído) mesmo sendo **dias futuros**.

**Root cause (confirmado no código):**
- A altura da barra era normalizada por `maxScheduled` (máximo de hábitos agendados do período):
  um dia 100% concluído, com menos hábitos agendados que o pico da semana, renderizava barra mais
  curta que o rótulo (`WeeklyChart.tsx`/`CompletionChart.tsx`, `count / maxScheduled`).
- O rótulo usava o `percent` legado (`completedOn`), fonte **diferente** da composição
  (`composeDay`), permitindo divergência rótulo ↔ segmentos.
- `weeklySeries`/`monthlySeries` preenchiam `done/skipped/undone` para **dias futuros**, pintando
  "não concluído" (terracota) em dias que ainda não encerraram.

**Fix (mínimo, sem refactor):**
- `src/domain/stats/aggregate.ts`: `dateKey > today` ⇒ `NO_COMPOSITION` (zera `done/skipped/undone`)
  nas duas séries, preservando `scheduled`/`completed`/`percent` legados (calendar/MonthView).
- `WeeklyChart.tsx` / `CompletionChart.tsx`: altura de cada segmento = `count / point.scheduled`
  (dia), de modo que 100% = barra cheia; rótulo `%` derivado da composição (`done/scheduled`);
  `maxScheduled` removido. Skip permanece neutro (não entra no `%`).
- Legado `completed`/`percent`/`completedOn` **intocados**; `opens.ts` §15.1 intocado.

**TDD (RED → GREEN):** 7 testes novos — 4 de domínio (`aggregate.test.ts`: dia completo sem undone;
futuro sem composição no semanal e no mensal; hoje não é futuro) + 3 de chart (`dashboard.test.tsx`:
altura por composição via `toHaveStyle`, dia vazio neutro, futuro sem terracota e passado sem record
com undone). Suite **266 testes / 41 suites** verdes; `tsc --noEmit` e `expo lint` limpos.

**Release `v0.2.3-c4fix`** ("C4 fix - composição consistente"): asset `HabitFlow-arm64.apk`
(34,647,314 bytes / 34.8 MB), download **anônimo HTTP 200**; releases antigas preservadas.

**Codebase Memory (delta do fix):** re-index `full` 1× — **1.779 nós / 4.780 edges** →
**1.780 nós / 4.781 edges** (**+1 / +1**; variação de re-scan/auto-refresh). Frescor comprovado:
`composeDay`, `weeklySeries` e `monthlySeries` presentes no grafo.
