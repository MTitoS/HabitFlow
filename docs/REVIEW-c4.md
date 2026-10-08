# REVIEW-c4 — HabitFlow · RUG ciclo 4 (State 3 Verification)

Data: 2026-10-08 · Autor: executor State 3 · Ambiente: Windows, Node, Expo SDK 57, RN 0.86.

Entrada: tasks `C1..C6` implementadas (commit `239cad8`), baseline c3 = **243 testes / 40 suites**.
Contrato: `docs/SPEC-c4.md` (§11 fechado) · Plano: `docs/PLAN-c4.md` (C1–C8, F1–F5) ·
Padrão: `docs/REVIEW-c3.md`.

## Verdict

**APPROVED (C1–C7)** — os 4 refinamentos (T1 barras segmentadas, T2 legenda, T3 paleta unificada,
T4 tokens próprios) estão implementados, testados e rastreados. `npx jest` **259/259** verdes
(243 baseline + 16 novos), `npx tsc --noEmit` e `npx expo lint` limpos, `expo export --platform web`
(= sanity de `npm run web`) OK, zero hex cru fora de `theme/`. Release executada em C8 (§Release).

---

## 1. Cross-check C1–C8 → commit/código/teste

| Task | Fase | Commit | Artefato | Teste | Status |
|---|---|---|---|---|---|
| C1 | F1 | `239cad8` | `domain/stats/aggregate.ts` (`DayComposition`+`composeDay`) | `aggregate.test.ts` (+6) | ok |
| C2 | F1 | `239cad8` | `DayPoint` estendido + `weeklySeries`/`monthlySeries` (`indexRecords` 1×) | `aggregate.test.ts` (+5) | ok |
| C3 | F2 | `239cad8` | `theme/colors.ts` + `theme/types.ts` + `ALL_COLOR_TOKENS` | `theme.test.ts` (+1 contraste) | ok |
| C4 | F3 | `239cad8` | `feature/dashboard/ChartLegend.tsx` | `ChartLegend.test.tsx` (+3) | ok |
| C5 | F3 | `239cad8` | `feature/dashboard/WeeklyChart.tsx` | `dashboard.test.tsx` (label composta) | ok |
| C6 | F4 | `239cad8` | `feature/dashboard/CompletionChart.tsx` | `dashboard.test.tsx` (+1) | ok |
| C7 | F5 | este documento | `docs/REVIEW-c4.md` | suite + tsc + lint + web | ok |
| C8 | F5 | (release) | `app.json` + `android/app/build.gradle` + `PROGRESS-c4.md` | HTTP 200 + push | ver §Release |

Distribuição dos 16 testes novos: +6 (C1), +5 (C2), +1 (C3), +3 (C4), +1 (C6) = **16**.
C5/C6 alteraram a **label de a11y** (contrato deliberado, SPEC-c4 §2.6/§12) — teste de C2 fixture
apenas recebeu os campos aditivos.

---

## 2. Regras críticas — verificação

| Regra | Verificação | Resultado |
|---|---|---|
| Buckets concluído / skipado / não concluído | `composeDay` (`aggregate.ts`): `completed`→`done`; `skipped`→`skipped` (bucket próprio); `pending`/`missed`/sem-record→`undone` | ✅ |
| Invariante `done+skipped+undone === scheduled` | garantida por construção (`undone = scheduled - done - skipped`); teste dedicado C1 | ✅ |
| Dia sem agendados fora da composição | `scheduled===0` ⇒ `{0,0,0,0}`; charts renderizam só trilha neutra | ✅ |
| Hábito arquivado não conta | `composeDay` pula `habit.archivedAt`; testes C1 e C2 (`done=0`) | ✅ |
| Composição **derivada** (zero schema) | só `indexRecords` + `isScheduled`; nenhuma migration/coluna | ✅ |
| Legado `completed`/`percent`/`completedOn` intacto | `weeklySeries`/`monthlySeries` mantêm as 3 expressões; `calendar/index.tsx` e `MonthView.tsx` inalterados | ✅ |
| `DayPoint` aditivo | campos novos `done/skipped/undone`; nenhum removido/alterado | ✅ |
| Tokens próprios (T4) | `chartDone`/`chartSkip`/`chartUndone` em `theme/tokens` + `ColorToken` + `ALL_COLOR_TOKENS` | ✅ |
| Contraste ≥3:1 light/dark sobre `surface` | teste `chart status tokens keep >= 3:1` | ✅ |
| Mesmas cores nos 2 cards (T3) | `WeeklyChart` e `CompletionChart` usam o mesmo `segmentsOf` (`chartDone/Skip/Undone`) — sem `accent`/`border` | ✅ |
| Zero hex fora de `theme/` | grep `#xxxxxx` em `components/feature/dashboard` = 0 | ✅ |
| Não-só-cor (§37) | separador 1px (cor do card) + `ChartLegend` textual + `accessibilityLabel` com contagens | ✅ |
| Ordem vertical base→topo | `segmentsOf(...).reverse()` ⇒ JSX topo=undone, meio=skip, base=done | ✅ |
| Normalização por `maxScheduled` | altura total `scheduled/maxScheduled`; segmento `count/maxScheduled` | ✅ |
| Dia corrente pendente reflete leitura | `undone` inclui `pending`; sem cache/materialização (c4-O1) | ✅ |
| Sem hatch / sem `react-native-svg` novo | nenhum import de SVG nos charts; distinção por separador+legenda+label (c4-O2) | ✅ |
| Sem animação obrigatória | Views estáticas (reduced-motion safe) | ✅ |
| `opens.ts` §15.1 intocado | `git diff` não toca `src/config/opens.ts` | ✅ |
| `MonthView`/`calendar` sem mudança de comportamento | só fixtures de teste ganharam campos; lógica day-level intocada | ✅ |

---

## 3. Evidência de execução

```
npx jest           -> Test Suites: 41 passed / Tests: 259 passed (243 baseline + 16)
npx tsc --noEmit   -> TypeScript: No errors found
npx expo lint      -> No issues found
npx expo export --platform web -> Exported: dist (rotas /statistics e /calendar presentes)
```

---

## 4. Observações (baixa severidade)

- **O1** — O bug latente de §2.1 do SPEC (`completedOn` conta record de hábito arquivado em
  `DayPoint.completed`, podendo inflar o `percent` legado) permanece **não corrigido** por decisão
  de escopo (não tocar superfícies congeladas). Os charts agora usam a composição per-scheduled e
  não são afetados; `calendar`/`MonthView` seguem lendo o legado. Registrado como risco separado.
- **O2** — `segmentsOf` é duplicado em `WeeklyChart`/`CompletionChart` (3 linhas). Optou-se por não
  extrair um módulo compartilhado para manter o diff mínimo e coeso por card; `ChartLegend` é o
  único componente compartilhado exigido por contrato (c4.4).

---

## 5. Release (C8)

- Bump: `versionCode 12` / `versionName "2.2.0"` (`app.json` + `android/app/build.gradle`); regras do
  `build.gradle` intocadas.
- APK release arm64: **34.8 MB** (36,447,598 bytes, < 50 MB), Gradle `BUILD SUCCESSFUL` (2m18s,
  `--no-daemon`, `ANDROID_HOME=C:/AndroidSdkJ`, `JAVA_HOME=C:/android-jdk21`).
- Tag `v0.2.2-c4` + GitHub release "C4 - composição de status nos charts"; asset
  `HabitFlow-arm64.apk`; download **anônimo HTTP 200** verificado via `node fetch`; releases antigas
  preservadas.
- `git push origin main`.
- Device verify (`adb` wireless `192.168.15.26:34263`): ver `PROGRESS-c4.md` §Device (SKIP se offline).
