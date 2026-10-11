# PROGRESS-c5fix1 — UI tweaks pós-ship (feedback Tito)

> Base: `docs/MISSION_c5fix1.md` · Ciclo micro-fix pós-ship v0.3.0 (vc15). Só UI, zero mudança de modelo/dados/repos, zero token novo.

## FIX 1 — Botão de edição da tarefa (TodoRow) ✅
- `src/components/feature/TodoRow.tsx`: affordance de edição agora `minWidth/minHeight 44` (hit target ≥ 44×44 dp,
  alinhado/centralizado) + glifo `›` 22dp (20–22 recomendados). Tokens visuais mantidos (`textMuted`, spacing).
- Teste: `TodoRow.test.tsx` +1 (toca 44×44, glifo ≥ 20, onPress segue disparando).
- Gate: `npx jest TodoRow` verde.

## FIX 2 — Campo de data abrindo calendário nativo (create/edit todo) ✅
- **Decisão de dependência:** SEM dep nova. `@expo/ui` ~57.0.21 (já no repo, compatível RN0.86) **expõe**
  `@expo/ui/community/datetime-picker` (`DateTimePicker` com `value`/`mode`/`presentation`/`onValueChange`/
  `onDismiss`/`positiveButton`/`negativeButton`) — PREFIRA conforme instrução da missão (zero dep nova).
  Fallback `@react-native-community/datetimepicker` **não** foi necessário.
- `src/components/ui/forms/DatePicker.tsx` **reescrito**: box grid de dias → **input** (estilizado como `Input`:
  `radius.input`, minHeight 48, `spacing.lg`) que exibe data **formatada pt-BR** (`formatDateKeyPtBR`) ou
  placeholder "Algum dia"; toque abre `DateTimePicker` nativo (dialog Android, `positiveButton 'OK'` /
  `negativeButton 'Cancelar'`), `mode="date"`, `presentation="dialog"` (Android). Seleção → `onChange(dateKey)`
  e fecha (unmount, conforme contrato do componente); dismiss → mantém valor.
- `src/domain/date/dateUtils.ts`: nova função pura `formatDateKeyPtBR(dateKey)` (`05 de mai. de 2026`).
- Limpeza de data ("→ Algum dia") permanece no `todo-form` (botão "Remover data" preexistente) — sem mudança.
- Testes: `DatePicker.test.tsx` **novo** +5 (placeholder/pt-BR/abre picker/seleciona→fecha/dismiss mantém);
  `dateUtils.test.ts` +1; `todo-form.test.tsx` atualizado p/ interação (picker mockado) +1.
- **Mock jest:** `jest.setup.js` mocka `@expo/ui/community/datetime-picker` (harness `__test.registry` com
  `lastProps` para dirigir `onValueChange`/`onDismiss` — sem native module no CI).

## VERIFICAÇÃO
- `npx jest` **351 / 55 suites** (baseline 343/54, **sem regressão**, +8/+1).
- `npx tsc --noEmit` limpo; `npx expo lint` limpo; `expo export --platform web` OK (pickern web é no-op `null`).
- Release build `./gradlew assembleRelease` **BUILD SUCCESSFUL (1m24s)**.

## RELEASE v3.0.1 (vc16)
- Bump `versionCode 16` / `versionName "3.0.1"` (`app.json` + `android/app/build.gradle`); regras do
  `build.gradle` (signing/minify/abiFilters) **intocadas**.
- APK arm64 assinado (debug keystore, padrão repo): `HabitFlow-arm64.apk` **34.8 MB**; `aapt` confirma
  `versionCode='16' versionName='3.0.1'` `native-code: arm64-v8a`; `apksigner` OK.

## Device
- Verify device (`adb`): **deferred/SKIP** (não bloqueante), padrão ciclos c4fix/e1/c5 — recomenda-se
  validação do dialog nativo Compose/SwiftUI do `@expo/ui` em device no próximo ciclo.