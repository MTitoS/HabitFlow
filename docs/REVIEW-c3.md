# REVIEW-c3 — HabitFlow · RUG ciclo 3 (State 4 Review)

Data: 2026-10-08 · Autor: executor State 4 (review) · Ambiente: Windows, Node, Expo SDK 57, RN 0.86.

Entrada: 9/9 tasks `ok` (`docs/PROGRESS-c3.md`), baseline c2 = **213 testes / 38 suites**, release
`v0.2.1-c3` publicada. Contrato: `docs/SPEC-c3.md` (§10 c3.1–c3.6) · Plano: `docs/PLAN-c3.md` ·
Padrão: `docs/REVIEW-c2.md`.

> Este documento **supersede** o check-in do State 3 (`R8`) e registra o review independente do
> State 4: cross-check de commits/código/testes, regras críticas, re-execução da suite e verdict.

## Verdict

**APPROVED** — os 2 refinamentos do ciclo (T1 edição retroativa opt-in, T2 streak hoje-pendente)
estão implementados, testados e rastreados por commits. `npm test` **243/243** verdes (213 baseline +
30 novos), `tsc`/`lint` limpos, web export OK, release com download anônimo **HTTP 200** reconfirmado.
Nenhum bloqueador. Uma observação de baixa severidade (futuro no guard) é documentada em §6 e não
afeta o escopo entregue.

---

## 1. Cross-check R1–R9 → commits/código/testes

Todos os artefatos do plano foram implementados; nenhum órfão. Mapeamento verificado por
`git log --name-status`, `git diff d393bb6..HEAD --stat` e leitura direta dos arquivos.

| Task | Fase | Commit | Artefato | Teste | Status |
|---|---|---|---|---|---|
| R1 | F1 | `325ff89` | `domain/streak/currentStreak.ts` (scanCurrent neutro) | `currentStreak.test.ts` (+5) | ok |
| R2 | F2 | `f2c7361` | `domain/record/transitions.ts` + `config/opens.ts` | `record.test.ts` (+10) | ok |
| R3 | F2 | `f2c7361` | `data/repositories/{types,impl}.ts` | `repositories.test.ts` (+7) | ok |
| R4 | F3 | `2278af1` | `services/prefs.ts` (`retroEdit`) | `prefs.test.ts` (+3) | ok |
| R5 | F3 | `2278af1` | `settings/advanced.tsx` + `RetroEditCard.tsx` + `settings/index.tsx` | `RetroEditCard.test.tsx` (+2) | ok |
| R6 | F4 | `46186f0` | `feature/WeekStatusRow.tsx` | `WeekStatusRow.test.tsx` (+3) | ok |
| R7 | F4 | `46186f0` | `app/habits/[id]/index.tsx` | web export + regressão¹ | ok |
| R8 | F5 | `c571c4d` | `docs/REVIEW-c3.md` | suite + tsc + lint | ok |
| R9 | F5 | `a32520d` / `0bde18b` | `app.json` + `build.gradle` + `PROGRESS-c3.md` | HTTP 200 + push | ok |

¹ R7 é fiação de tela; cobertura por `tsc`/`lint` + web export + testes da unidade de UI
(`WeekStatusRow`). Sem teste de tela dedicado (exigiria mock de `expo-router`/`DataProvider`).
Distribuição dos 30 testes novos: +5 (R1), +10 (R2), +7 (R3), +3 (R4), +2 (R5), +3 (R6) = **30**.

Gaps: nenhum artefato faltante. Nenhum arquivo órfão.

---

## 2. Regras críticas — verificação

| Regra | Verificação | Resultado |
|---|---|---|
| T2: hoje-pendente **não zera** | `currentStreak.ts:50-53` (`day === today` ⇒ `day = addDays(day,-1); continue;`), alinhado a `overallStreak.ts:73-77`; flag `broke` ausente | ✅ |
| T2: 5 casos de referência | `currentStreak.test.ts:99-154`: pendente 5⇒5; concluído 5⇒6; ontem perdido⇒0; ontem `skipped` neutro (4); bound por `createdAt` (2) | ✅ |
| T2: hoje concluído soma 1 | ramo `record?.status === 'completed'` precede o ramo `day === today` (`currentStreak.ts:46-53`) | ✅ |
| T1: guard puro único | `canCompleteRetroactive` (`transitions.ts:62-77`) centraliza `enabled` + janela + `isScheduled` + estado do record; repo/UI não duplicam a regra | ✅ |
| Janela = **dia-calendário** `{today-1, today-2}` | `RETROACTIVE_WINDOW_DAYS = 2` em `config/opens.ts:23`; `min = addDays(today,-2)`; `dateKey < min` ⇒ false | ✅ |
| Config ligada (uma constante) | constante única importada por `transitions.ts:5`; nenhum outro literal de janela no código | ✅ |
| `isScheduled` inclui lowerBound `createdAt` | `isScheduled.ts:7` rejeita `dateKey < createdAt`; guard chama antes do estado do record | ✅ |
| `setCompleted` (hoje-only) **intacto** | `impl.ts:124-127` mantém `toDateKey(now) !== dateKey ⇒ record_write_past_date`; teste R3 confirma que rejeita passado | ✅ |
| `opens.ts` §15.1 intocado | `git diff d393bb6..HEAD -- src/config/opens.ts` = apenas `+3` linhas aditivas (constante); bloco `OPEN` intacto | ✅ |
| `completedAt` = momento real da edição | `complete()` usa `now.getTime()`; repo/UI passam `now` da edição (não backdate); teste R3 verifica `completedAt === now.getTime()` | ✅ |
| `value = targetValue` p/ quantitativo | `retroactiveCompletionValue` (`transitions.ts:79-81`); teste + repo repassa o valor | ✅ |
| Sem retro-skip / sem overwrite | repo rejeita record existente `completed`/`skipped` (`record_conflict`); `skipped` também bloqueado | ✅ |
| Prefs `retroEdit` persiste | `prefs.ts:110-117` (`KEYS.retroEdit`); default `false`; roundtrip + inválido nos testes | ✅ |
| Células inelegíveis **read-only** | `WeekStatusRow.tsx:52-70`: elegível = `Pressable` + `accessibilityRole="button"`; inelegível = `View` `accessibilityRole="text"` sem `onPress` | ✅ |
| Estados **não-só-cor** | vocabulário ✓/—/✕/○ preservado + `accessibilityLabel` explícito (elegível e inelegível) | ✅ |
| Zero hex fora de `theme/` | grep nos arquivos novos/alterados do ciclo = 0 literais hex | ✅ |
| Sem novo schema/migration | `git diff --stat` não toca `data/database`/modelo; nenhuma coluna nova | ✅ |
| Sem campo `displayStreak` | grep `displayStreak` em `src` = 0 ocorrências | ✅ |

---

## 3. Verificação prática (re-executada nesta review)

| Comando | Exit | Resultado |
|---|---|---|
| `npm test` | 0 | **40 suites / 243 testes** passando (213 baseline + 30 novos) |
| `npx tsc --noEmit` | 0 | No errors found |
| `npm run lint` | 0 | sem warnings |
| `npx expo export --platform web` | 0 | 20 rotas estáticas, incluindo `/settings/advanced` |
| `node fetch` release asset (`HabitFlow-arm64.apk`) | 0 | **HTTP 200** (redirect-follow), `v0.2.1-c3` |

Alertas (não falham nada):
- Jest: `A worker process has failed to exit gracefully` — herdado de c1/c2, sem correlação com o
  ciclo 3.

Bump de release conferido: `app.json` `"version": "2.1.0"` / `versionCode 11` e
`android/app/build.gradle` `versionCode 11` / `versionName "2.1.0"`.

---

## 4. Code review pontual

- **`src/domain/streak/currentStreak.ts:29-63`** — o ramo hoje-pendente agora faz
  `day = addDays(day, -1); continue;` sem tocar em `run`, espelhando `overallStreak.scanCurrent`.
  Ordem correta: `completed` soma, `skipped` é neutro, `today` é neutro, `missed` zera e para.
  `scanBest` inalterado. Puro (recebe `now`), sem I/O. Atende SPEC-c3 §3.2 e §2.1.
- **`src/config/opens.ts:22-23`** — constante aditiva com comentário ligando ao texto de produto
  "48h". Bloco `OPEN` e §15.1 preservados. Custódia c3.5 respeitada.
- **`src/domain/record/transitions.ts:62-81`** — guard puro na ordem `enabled → hoje → janela →
  isScheduled → estado do record`; helper `retroactiveCompletionValue` isola a regra do valor
  (c3.6). `canCompleteToday`/`complete` intactos.
- **`src/data/repositories/impl.ts:137-154`** — `setCompletedRetroactive` implementado **sem** o
  guard de hoje; faz defesa em profundidade: lê a tabela `habits` (`habit_not_found`), revalida o
  guard (`record_write_out_of_window`), rejeita conflito (`record_conflict`), remove `pending`
  residual do mesmo `(habitId,date)` e grava `complete(...)`. `setCompleted` hoje-only preservado.
- **`src/services/prefs.ts:110-117`** — `getRetroEditEnabled`/`setRetroEditEnabled` no molde
  existente (`KEYS` + `getItem`/`setItem`), leitura resiliente (`false` em ausência/inválido).
- **`src/app/settings/advanced.tsx` + `RetroEditCard.tsx`** — tela carrega o pref no mount e persiste
  a cada troca; card `surface`+borda+`spacing.lg` com `Switch` (`accessibilityRole="switch"`) e
  texto de exceção ("...janela de 2 dias... Desligado por padrão"). Linha "Avançado" sempre visível
  em `settings/index.tsx:13` (fora de submenu profundo). Atende c3.2.
- **`src/components/feature/WeekStatusRow.tsx`** — componente de apresentação puro; só a célula
  elegível é `Pressable`; label `"Marcar {hábito} como concluído em {dia}"`; inelegível vira `View`
  read-only com label de estado. Sem animação obrigatória. Atende §5.
- **`src/app/habits/[id]/index.tsx:58-96`** — `weekKeys` limitado a `[today-6, today]`;
  `isRetroEligible` = `canCompleteRetroactive(habit, record, key, now, retroEnabled)`; toque seta
  `confirmingKey` e abre confirmação **inline** (Cancelar/Confirmar); `confirmRetro` chama
  `setCompletedRetroactive(..., retroactiveCompletionValue(habit))`, faz `reload()` e
  `showToast('success','Concluído (retroativo)')`. Erro ⇒ toast de erro. Streak "Atual" deriva de
  `computeStreaks` (sem materialização). Sem undo. Atende SPEC-c3 §3.1 e §5.

---

## 5. Desvios do plano (documentados, não bloqueiam)

1. **`RETRO_EDIT_WINDOW_DAYS`** (citado em SPEC-c3 §4/§6) foi superseded por
   **`RETROACTIVE_WINDOW_DAYS`** (custódia c3.5 em `config/opens.ts`), conforme a própria decisão
   fechada. Nome único no código.
2. **R5** extraiu `RetroEditCard` (componente de apresentação) do screen para permitir smoke test
   co-locado fora de `src/app/` — evita que um `.test.tsx` vire rota no Expo Router. Sem mudança de
   comportamento.
3. **R7** sem teste de tela próprio (mock pesado de `expo-router`/`DataProvider`); coberto por
   `tsc`/`lint`, web export e testes da unidade de UI.
4. **Device verify (`adb` wireless)** permanece `deferred` (device offline no State 3); mitigado por
   web export + build release arm64 + download anônimo HTTP 200.

---

## 6. Riscos e observações

| Item | Severidade | Nota |
|---|---|---|
| Guard permite `dateKey` **futuro** (só rejeita `> hoje` via `dateKey === today`/`< min`; não rejeita `> today`) | Baixo | Fiel ao pseudocódigo de SPEC-c3 §6. Não é alcançável pela UI (`weekKeys` termina em hoje). Endurecer com `dateKey > today ⇒ false` numa manutenção futura é recomendável como defesa em profundidade. |
| Comparação de janela por string (`dateKey < min`) em vez de `compareDateKeys` | Baixo | Correto porque as chaves são ISO `YYYY-MM-DD` (lexicográfico = cronológico); difere da convenção do módulo. |
| `overallCurrentStreak` (max individual) sobe em dias hoje-pendente | Baixo | Comportamento mais correto (o streak só morre ao fechar o dia); `StreakCard` usa o geral, não afetado. |
| `now` capturado no render do HabitDetail | Baixo | Padrão pré-existente; janela de "agora" reavaliada a cada render (sem timer cross-midnight). |
| Worker Jest não encerra com elegância | Baixo | Herdado de c1/c2; nenhum fail. |
| Device verify pendente | Baixo | Web export + build release + HTTP 200 cobrem a lacuna. |

---

## 7. Bloqueadores

Nenhum.

---

## 8. Recomendação / Signoff

- **APPROVED** para o escopo do RUG ciclo 3 (T1 retro-complete + T2 streak hoje-pendente).
- DoD global (`PLAN-c3 §2`) cumprido: **243 testes** sem regressão dos 213, `tsc`/`lint` limpos, web
  export OK, `opens.ts` §15.1 intocado, histórico append-only preservado, sem schema novo.
- Release `v0.2.1-c3` publicada com download anônimo HTTP 200 (reconfirmado nesta review).
- Follow-ups opcionais (não bloqueiam): adicionar o check `dateKey > today` ao guard; considerar
  `compareDateKeys` na janela; validar em device quando disponível.

Executor State 4: **APPROVED** · Data: 2026-10-08
