# PLAN-e1 — HabitFlow · Plano de implementação TDD (ciclo e1, semântica do calendário global)

> Derivado de [`docs/SPEC-e1.md`](SPEC-e1.md) e da autoridade c3 (`docs/SPEC-c3.md` / `overallStreak.ts`).
> Tasks TDD atômicas **E1..E5**. Plan only — **nenhum código** alterado pelo plano.
>
> Baseline: **266 testes / 41 suites** (v0.2.3-c4fix). Nenhum teste existente pode quebrar.

## Comandos de verificação (valem para toda task)

| Verificação | Comando |
|---|---|
| Testes (por regex) | `npx jest <regex>` |
| Suite completa | `npx jest` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx expo lint` |
| Web | `npx expo export --platform web` |

## Regra dura

- Charts c4fix (`WeeklyChart`/`CompletionChart`) e `opens.ts` §15.1 **intocados**.
- `MonthView`/`monthDayStatus`/`dayStatus` **sem mudança de comportamento**.
- **Zero token novo** em `theme/`.

---

## E1 — `calendarDayInfo` (domínio puro, RED→GREEN)

- **Dependências:** — (reusa `isConqueredDay`, `scheduledOn`, `indexRecords`).
- **Fazer:** em `src/domain/streak/overallStreak.ts` adicionar `CalendarDayMark`,
  `CalendarDayInfo`, `calendarDayInfo` (SPEC-e1 §4): marca `conquered` via **`isConqueredDay`**;
  senão `partial` se `done>0`; senão `skip` se `skipped>0`; senão `pending`. `scheduled===0` → pending c/ 0.
- **Testes RED (7):** conquered (all done/skip), partial (parte done), skip (só skip, não conquered),
  pending sem record, vazio (`scheduled:0`), arquivado ignorado, equivalência conquered ⇔ `isConqueredDay`.
- **Verificar:** `npx jest overallStreak`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** regra única em função pura; reuso da regra do streak (sem duplicação).

## E2 — `CalendarDayCell` (novo componente + testes, RED→GREEN)

- **Dependências:** E1.
- **Fazer:** novo `src/components/feature/CalendarDayCell.tsx` (RN Views puras): prop
  `{ dateKey, info?, isToday, onPress }`; mark → visual da SPEC-e1 §5 (fill/símbolo/tokens
  `calendarDoneFill/Fg`, `calendarSkipFill/Fg`, `accent`); **skip bar** 2px `accent` quando
  `skipped>0 && mark!=='conquered'`; borda pending **só quando mark==='pending'**; ring de hoje;
  `accessibilityLabel` textual; `testID cal-day-<key>` / `cal-skip-<key>`.
- **Testes RED (8):** conquered ✓+label; parcial ◐; só-skip número+skip bar+label; parcial c/ skip tem
  skip bar; conquered **sem** skip bar; pending neutro+número; vazio `Sem hábitos`; press retorna dateKey.
- **Verificar:** `npx jest CalendarDayCell`.
- **Aceite:** zero hex cru (só `theme.color`); estados não-só-cor.

## E3 — Wire do calendário global (E3 do SPEC)

- **Dependências:** E1, E2.
- **Fazer:** em `src/app/calendar/index.tsx`: `MonthGrid` passa a receber `dayInfos` (Map de
  `calendarDayInfo(habits, records, key)` para o grid) e renderiza `CalendarDayCell`; remover leitura
  de `monthlySeries`/`completed`/`byDate` do grid (SPEC-e1 §2, bugs 1–3); `dayStatus`/detalhe intacto.
- **Verificar:** `npx jest`; `npx tsc --noEmit`; `npx expo lint`; `npx expo export --platform web`.
- **Aceite:** aba calendário mostra conquered/partial/skip/pending consistentes com o `MonthView`;

## E4 — Verificação final (regressão + polish)

- **Dependências:** E1..E3.
- **Fazer:** suite completa verde (266 + 15); tsc/lint/web; checklist SPEC-e1 §8; `docs/REVIEW-e1.md`.

## E5 — Bump + Release `v0.2.4-e1` (State 3 — ao final)

- Bump `versionCode 14` / `versionName "2.3.0"` (`app.json` + `android/app/build.gradle`); regras do
  `build.gradle` **intocadas**.
- Build release arm64 (junction `C:/AndroidSdkJ`, `JAVA_HOME=C:/android-jdk21`,
  `gradlew assembleRelease --no-daemon`, APK < 50 MB).
- GitHub release `v0.2.4-e1` — "E1 - dia vencido + skip no calendário"; asset `HabitFlow-arm64.apk`;
  auth via `git credential fill` host `github.com` user `MTitoS`; **HTTP 200** download anônimo;
  releases antigas preservadas.
- `git push origin main`; `docs/PROGRESS-e1.md` 100%; re-index Codebase Memory 1× + delta.

## Dependências (resumo)

```
E1 → E2 → E3 → E4 → E5
```
Corrente crítica: `E1 → E3` (semântica antes de UI) e `E2` (componente) paralela a E1.

## Riscos

| Risco | Mitigação |
|---|---|
| `completed` legado ainda usado em outro lugar (chart %) | Não tocado; charts c4fix usam `composeDay`; calendário migra para `calendarDayInfo` |
| Aparência em dark dos 3 tons quentes | Tokens existentes validados (c3/c4); skip bar usa `accent` (mesma família do `WeekStatusRow`) |
| Regressão de a11y da aba calendário | Sem teste prévio de a11y; contrato **novo** testado em E2 |
| Regressão `monthlySeries` usada por `statistics`/`calendar` | `monthlySeries` continuará existindo p/ `statistics`; só o grid do calendário muda de fonte |