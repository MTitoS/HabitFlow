# PROGRESS-c5fix2 — fix divergência de data no DateTimePicker (-1 dia)

> Base: `docs/MISSION_c5fix2.md` · Micro-fix 2 pós-ship v0.3.1 (vc16). Bug in-app reportado
> por Tito: selecionar o dia 13 no calendário nativo grava dia 12 — TODAS as datas desviam −1.

## DIAGNÓSTICO (root cause, systematic-debugging)

Hipótese da missão: conversão `Date → dateKey` via `toISOString().slice(0,10)` / `new Date(dateKey)`.
**Evidência no código: essa hipótese NÃO se aplica — a investigação mostrou o inverso.**

- `src/domain/date/dateUtils.ts#toDateKey` **já** usa componentes **locais** (`getFullYear/Month/Date`)
  e `parseDateKey` usa `new Date(y, m-1, d)` local. Nenhum uso de `toISOString` no caminho de data.
- `src/components/ui/forms/DatePicker.tsx#handleChange` faz `onChange(toDateKey(date))`, onde `date`
  vem do `NativePicker`.

Fonte real (verificado no pacote instalado `@expo/ui@57.0.21`):

1. Android — `node_modules/@expo/ui/src/community/datetime-picker/DateTimePicker.android.tsx` entrega
   a seleção via `@expo/ui/android/.../DatePickerView.kt`, onde `onDateSelected` devolve
   `DatePickerState.selectedDateMillis`. Pela convenção **Material3**, `selectedDateMillis` é
   **meia-noite UTC** do dia selecionado (`.../DatePickerView.kt` confirma o uso de UTC via
   `toUtcDayMillis`/`Calendar.getInstance(TimeZone "UTC")`).
2. JS: `new Date(selectedDateMillis)` → instante exato `YYYY-MM-DDT00:00:00Z`.
3. `toDateKey` lê componentes **locais**. Em UTC-3, `2026-05-13T00:00:00Z` = `2026-05-12T21:00` local
   → `getDate() = 12` → `"2026-05-12"`. **Bug reproduzido.**
4. Testes mascaravam: `jest.setup.js` força `process.env.TZ='UTC'`, onde o dia local == dia UTC.

Prova empírica (Node, TZ=`America/Sao_Paulo`):
`new Date(Date.UTC(2026,4,13)).getDate() === 12` (local) mas `.getUTCDate() === 13`. Exatamente o −1.

iOS difere: `node_modules/@expo/ui/ios/DatePickerView.swift` emite `newDate.timeIntervalSince1970*1000`
(instante absoluto com o wall-clock local do device) → componentes locais estão corretos lá.

## FIX (camada de conversão, zero modelo/dados/repos)

- `src/domain/date/dateUtils.ts`: novas funções puras `toDateKeyUtc(date)` / `parseDateKeyUtc(dateKey)`
  (componentes UTC / meia-noite UTC). `toDateKey`/`parseDateKey` (locais) permanecem intactos.
- `src/components/ui/forms/DatePicker.tsx`: converte conforme a plataforma — Android usa a convenção
  UTC do Material3 (`toDateKeyUtc`/`parseDateKeyUtc`); iOS usa as locais (`toDateKey`/`parseDateKey`).
  Cobre as duas direções (valor inicial do picker ↔ seleção devolvida), idempotente em ambas.

## TESTES

- `src/domain/date/dateUtils.test.ts` +2: `toDateKeyUtc` lê o dia UTC; roundtrip por meia-noite UTC.
- `src/components/ui/forms/DatePicker.tz.test.tsx` **novo** +2 (TZ=`America/Sao_Paulo`, `Platform.OS='android'`
  mockado): seleção de meia-noite UTC de 13 → `"2026-05-13"`; abrir dia 13 e reconfirmar → inalterado.
  **Regressão comprovada:** com o código antigo (`toDateKey` local) os 2 testes falham
  (`Received: "2026-05-12"`, `Expected: "2026-05-13"`).

## VERIFICAÇÃO

- `npx jest` **355 / 56 suites** (baseline 351/55, **sem regressão**, +4/+1).
- `npx tsc --noEmit` limpo; `npx expo lint` limpo.
- Release `./gradlew assembleRelease` **BUILD SUCCESSFUL**; APK `HabitFlow-arm64.apk` (34.8 MB),
  assinado (debug keystore, padrão repo); `aapt` confirma `versionCode='17' versionName='3.0.2'`
  `native-code: arm64-v8a`.

## RELEASE v3.0.2 (vc17)

- Bump `versionCode 17` / `versionName "3.0.2"` (`app.json` + `android/app/build.gradle`);
  regras de signing/minify/abiFilters intocadas.
- Nota: a missão escreveu "v0.3.2"; a série real do `app.json`/`build.gradle` é `3.0.x`
  (c5fix1 shipou `3.0.1`/vc16), então o bump seguiu `3.0.2`.

## Device

- Validação em device (`adb`): deferred/SKIP (não bloqueante), padrão dos ciclos anteriores.
  Recomenda-se confirmar visualmente o dialog nativo num aparelho em UTC-3 no próximo ciclo.
