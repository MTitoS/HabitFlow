# REVIEW-c3 — HabitFlow · RUG ciclo 3 (State 3 execução / verificação)

Data: 2026-10-08 · Autor: executor State 3 · Ambiente: Windows, Node, Expo SDK 57, RN 0.86.
Entrada: 9/9 tasks `ok` (`docs/PROGRESS-c3.md`), baseline c2 = 213 testes / 38 suites.
Contrato: `docs/SPEC-c3.md` (§10 c3.1–c3.6) · Plano: `docs/PLAN-c3.md`.

## Verdict

**APPROVED** — os 2 refinamentos (T1 edição retroativa opt-in, T2 streak hoje-pendente)
estão implementados, testados e cobrindo a matriz R1–R9.

---

## 1. Verificação prática (re-executada)

| Comando | Exit | Resultado |
|---|---|---|
| `npx jest` | 0 | **40 suites / 243 testes** passando (213 baseline + 30 novos) |
| `npx tsc --noEmit` | 0 | No errors found |
| `npx expo lint` | 0 | sem warnings |
| `npx expo export --platform web` | 0 | 20 rotas estáticas, incluindo `/settings/advanced` |

Distribuição dos 30 testes novos: +5 (R1 streak T2), +10 (R2 guard T1), +7 (R3 repo),
+3 (R4 prefs), +2 (R5 RetroEditCard), +3 (R6 WeekStatusRow).

## 2. Cross-check R1–R9

| Task | Fase | Commit | Artefato | Teste | Status |
|---|---|---|---|---|---|
| R1 | F1 | `325ff89` | `domain/streak/currentStreak.ts` | `currentStreak.test.ts` (+5) | ok |
| R2 | F2 | `f2c7361` | `domain/record/transitions.ts` + `config/opens.ts` | `record.test.ts` (+10) | ok |
| R3 | F2 | `f2c7361` | `data/repositories/{types,impl}.ts` | `repositories.test.ts` (+7) | ok |
| R4 | F3 | `2278af1` | `services/prefs.ts` | `prefs.test.ts` (+3) | ok |
| R5 | F3 | `2278af1` | `app/settings/advanced.tsx` + `RetroEditCard.tsx` | `RetroEditCard.test.tsx` (+2) | ok |
| R6 | F4 | `46186f0` | `feature/WeekStatusRow.tsx` | `WeekStatusRow.test.tsx` (+3) | ok |
| R7 | F4 | `46186f0` | `app/habits/[id]/index.tsx` | web export + regressão | ok |
| R8 | F5 | — | este documento | suite + tsc + lint | ok |
| R9 | F5 | — | release `v0.2.1-c3` + `PROGRESS-c3.md` | HTTP 200 + push | ok |

## 3. Regras críticas — verificação

| Regra | Verificação | Resultado |
|---|---|---|
| T2: hoje-pendente neutro | `currentStreak.test.ts` novos casos (5 dias concluídos ⇒ 5; hoje concluído ⇒ 6; ontem perdido ⇒ 0; skip neutro; bound por `createdAt`) | ✅ |
| T1: guard puro único | `canCompleteRetroactive` centraliza `enabled` + janela + `isScheduled` + estado do record; UI/repo não duplicam | ✅ |
| Janela = dia-calendário, constante única | `RETROACTIVE_WINDOW_DAYS = 2` em `config/opens.ts`, consumida pelo guard | ✅ |
| Escrita passada só pelo path guardado | `setCompleted` segue hoje-only (`record_write_past_date`); passado só via `setCompletedRetroactive` | ✅ |
| Sem retro-skip / sem overwrite | repo rejeita record existente `completed`/`skipped` (`record_conflict`) | ✅ |
| `opens.ts` §15.1 intocado | diff `d393bb6..HEAD` = apenas export aditivo `+3` linhas; bloco `OPEN` intacto | ✅ |
| Quantitativo retroativo | `retroactiveCompletionValue` grava `habit.targetValue`; binário grava `undefined` | ✅ |
| Append-only preservado | `date` = dia alvo, `completedAt` = instante da edição (fato novo, não reescrita) | ✅ |
| Zero hex fora de `theme/` | componentes novos usam só tokens semânticos (`surface`, `border`, `successBright`, ...) | ✅ |
| Estados não-só-cor | `WeekStatusRow` mantém vocabulário ✓/—/✕/○ + `accessibilityLabel` explícito | ✅ |

## 4. UX / A11y

- Célula elegível = `Pressable` com `accessibilityRole="button"` e label
  `"Marcar {hábito} como concluído em {dia}"`; inelegível = `View` read-only (`accessibilityRole="text"`)
  com label descritivo do estado.
- Confirmação leve inline (Cancelar/Confirmar) antes de gravar; toast `success`
  "Concluído (retroativo)" reusa `useToast`.
- Sem animação obrigatória (reduced-motion safe); contraste por tokens light/dark.

## 5. Desvios do plano (não bloqueiam)

1. **`RETRO_EDIT_WINDOW_DAYS`** citado em SPEC-c3 §4/§6 é superseded por **`RETROACTIVE_WINDOW_DAYS`**
   (custódia c3.5 em `config/opens.ts`), conforme decisão registrada.
2. **R5** extraiu `RetroEditCard` (componente de apresentação) do screen para permitir smoke test
   co-locado fora de `src/app/` (evita que um `.test.tsx` vire rota no Expo Router). Sem mudança de
   comportamento.
3. **R7** não tem teste de tela próprio (exigiria mock pesado de `expo-router` + `DataProvider`); a
   fiação é coberta por `tsc`/`lint`, web export e pelos testes da unidade de UI (`WeekStatusRow`).

## 6. Riscos

| Item | Severidade | Nota |
|---|---|---|
| `overallCurrentStreak` (max individual) sobe em dias hoje-pendente | Baixo | Comportamento mais correto; `StreakCard` usa o geral (não afetado) |
| Worker Jest não encerra com elegância | Baixo | Herdado de c1/c2; nenhum fail |
| Device verify (`adb` wireless) | Baixo | Tentado; se offline, `deferred` sem bloquear (web export + build release OK) |

## 7. Bloqueadores

Nenhum.

## 8. Recomendação / Signoff

- **APPROVED** para o escopo do RUG ciclo 3 (T1 retro-complete + T2 streak hoje-pendente).
- DoD global (`PLAN-c3 §2`) cumprido: 243 testes verdes, `tsc`/`lint` limpos, web export OK,
  `opens.ts` §15.1 intocado, histórico append-only.
- Release `v0.2.1-c3` publicada — ver `docs/PROGRESS-c3.md` §Release.

Executor State 3: **DONE** · Data: 2026-10-08
