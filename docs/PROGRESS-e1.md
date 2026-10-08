# PROGRESS-e1 — HabitFlow · Semântica unificada do day-cell no Calendário global (E1..E5)

> Estado 3 — implementação do ciclo e1. Fonte da ordem/deps: `docs/PLAN-e1.md`. Contrato:
> `docs/SPEC-e1.md` (e1.1–e1.6). Baseline de regressão: **266 testes / 41 suites** (v0.2.3-c4fix).
> Verificado por `npx jest` · `npx tsc --noEmit` · `npx expo lint` · web export.

## Legenda
- **ok** — implementado e verificado.
- **deferred** — não executado (justificado).
- **fail** — bloqueado (justificado).

| Task | Descrição | Status | Nota |
|---|---|---|---|
| E1 | `calendarDayInfo` (domínio, reusa `isConqueredDay`) | ok | `overallStreak.ts:39-78`; +7 casos (conquered/partial/skip/pending/vazio/arquivado/equivalência) |
| E2 | `CalendarDayCell` (componente + a11y + skip bar) | ok | novo componente; +8 casos; zero hex cru; tokens compartilhados (zero token novo) |
| E3 | Wire do calendário global (`MonthGrid` → `CalendarDayCell`, fonte `calendarDayInfo`) | ok | `calendar/index.tsx` deixa de ler `completed`/`monthlySeries` no grid; `dayStatus`/detalhe intactos |
| E4 | Verificação final DoD + regressão | ok | **281 testes / 42 suites** (266 + 15); tsc/lint limpos; web export ok; `REVIEW-e1.md` |
| E5 | Bump + release `v0.2.4-e1` | ok | ver §Release |

## Resumo

- **Total:** 5 · **ok:** 5 · **deferred:** 0 · **fail:** 0
- **Regressão:** baseline 266/41 preservado; suite total **281 testes / 42 suites** verdes (+15).
- **Invioláveis:** charts c4fix (`WeeklyChart`/`CompletionChart`) e `opens.ts` §15.1 `git diff` = vazio;
  `MonthView`/`monthDayStatus`/`dayStatus` **sem mudança de comportamento**; **zero token novo** em `theme/`.
- **Semântica unificada (c3):** conquered = `isConqueredDay` (completed **ou** skipped); flag de skip
  quando `skipped>0` e não conquered; pending de hoje neutro; dia só-skipado não ganha borda de failure.
- **Não-só-cor (§37):** `accessibilityLabel` textual por cell (`Vencido (n/n)` / `Parcial (n/n)` /
  `Com pulados (n)` / `Pendente` / `Sem hábitos`); símbolo + skip bar posicional + detalhe ao tocar.

## Release

- Bump: `versionCode 14` / `versionName "2.3.0"` (`app.json` + `android/app/build.gradle`); regras do
  `build.gradle` intocadas.
- APK release arm64: **36,449,850 bytes / 34.8 MB** (< 50 MB); Gradle `BUILD SUCCESSFUL` (1m18s,
  `--no-daemon`, `ANDROID_HOME=C:\AndroidSdkJ` junction, `JAVA_HOME=C:\android-jdk21`).
- Tag `v0.2.4-e1` + GitHub release **"E1 - dia vencido + skip no calendário"**; asset
  `HabitFlow-arm64.apk`; download **anônimo HTTP 200** verificado; releases antigas preservadas.
- `git push origin main` (`0cff029..ef00b57`).

## Device

- Device verify: **deferred/SKIP** — device não disponível nesta janela (mesmo critério do c4). Não
  bloqueante: web export + build release arm64 + download anônimo HTTP 200.

## Codebase Memory (norma v2 — re-index por fase com prova)

- Re-index `full` **1×** ao fim do ciclo (projeto `C-Coding-Projetos-Pessoal-HabitFlow`).
- **Nodes/edges:** baseline (fim do c4fix) **1.780 nós / 4.781 edges** → **1.836 nós / 4.889 edges**
  (**+56 nós / +108 edges**; variação de re-scan incluída). Frescor comprovado: `calendarDayInfo`
  (`overallStreak.ts:49-78`), `CalendarDayInfo` e `CalendarDayCell` (`CalendarDayCell.tsx:12-75`)
  presentes no grafo (`search_graph` = 5 matches). `parse_partial`: só `android/gradlew` e
  `android/settings.gradle` (fora de `src/`, sem impacto); `skipped`: 0; `not_indexed`: 65 por design.