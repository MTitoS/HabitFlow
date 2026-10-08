# PROGRESS-c3 — HabitFlow · Status por task (R1..R9)

> Estado 3 — implementação do ciclo 3 (refinamentos T1 retroativo + T2 streak hoje-pendente).
> Fonte da ordem/deps: `docs/PLAN-c3.md`. Contrato: `docs/SPEC-c3.md` (§10 decisões fechadas c3.1–c3.6).
> Baseline de regressão: **213 testes / 38 suites** (v2.0.0). Verificado por jest · tsc · eslint · web export.

## Legenda
- **ok** — implementado e verificado.
- **deferred** — não executado (justificado).
- **fail** — bloqueado (justificado).

---

## F1 — T2 domínio (streak hoje-pendente)

| Task | Descrição | Status | Nota |
|---|---|---|---|
| R1 | `currentStreak.scanCurrent`: hoje-pendente neutro (não zera) | ok | alinhado a `overallStreak.ts:73-77`; flag `broke` removida; +5 casos T2 |

## F2 — T1 domínio + repositor

| Task | Descrição | Status | Nota |
|---|---|---|---|
| R2 | `canCompleteRetroactive` + `RETROACTIVE_WINDOW_DAYS=2` + `retroactiveCompletionValue` | ok | guard puro único; +10 casos T1 |
| R3 | `RecordRepository.setCompletedRetroactive` | ok | defesa em profundidade reusa o guard; +7 casos |

## F3 — T1 config

| Task | Descrição | Status | Nota |
|---|---|---|---|
| R4 | Prefs `retroEdit` (`get`/`setRetroEditEnabled`) | ok | default `false`; roundtrip + inválido; +3 casos |
| R5 | `settings/advanced.tsx` + `RetroEditCard` + linha no índice | ok | switch off por padrão, texto de exceção (janela de 2 dias); +2 casos |

## F4 — T1 UI

| Task | Descrição | Status | Nota |
|---|---|---|---|
| R6 | `WeekStatusRow` (células retro elegíveis) | ok | affordance só nas elegíveis; a11y explícita; +3 casos |
| R7 | Fiação retroativa no HabitDetail | ok | confirmação inline + `setCompletedRetroactive` + `reload` + toast |

## F5 — Verificação / release

| Task | Descrição | Status | Nota |
|---|---|---|---|
| R8 | Verificação final DoD + regressão + a11y/polish | ok | `docs/REVIEW-c3.md`; 243 testes verdes |
| R9 | Release `v0.2.1-c3` (State 3) | ok | ver §Release |

---

## Resumo

- **Total:** 9 · **ok:** 9 · **deferred:** 0 · **fail:** 0
- **Regressão:** baseline 213/38 preservado; suite total **243 testes / 40 suites** verdes.
- **Invioláveis:** `opens.ts` §15.1 (grant semanal) intocado (só export aditivo);
  histórico append-only §9/§41 preservado (retro é o path guardado: `date` = dia alvo,
  `completedAt` = instante da edição); sem migration/schema novo.
- **Interação repo/domínio:** o gate `enabled` (prefs) é enforçado no domínio/UI; o repo
  revalida janela + `isScheduled` + conflito como defesa em profundidade.

## Release

- Bump: `versionCode 11` / `versionName "2.1.0"` (`app.json` + `android/app/build.gradle`).
- APK release arm64: < 50 MB, build Gradle `BUILD SUCCESSFUL`.
- Tag `v0.2.1-c3` + GitHub release "C3 - retro-complete + streak hoje"
  (asset `HabitFlow-arm64.apk`, download anônimo HTTP 200; releases antigas preservadas).
