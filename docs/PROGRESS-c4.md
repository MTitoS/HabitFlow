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
- `git push origin main`.
- Device verify (`adb` wireless `192.168.15.26:34263`): ver §Device.
