# PLAN-c3 — HabitFlow · Plano de implementação TDD (ciclo 3, refinamentos fase C)

> Derivado de [`docs/SPEC-c3.md`](SPEC-c3.md) (contrato do ciclo 3; decisões fechadas no grilling
> 08/10/2026) e de [`docs/SPEC.md`](SPEC.md) (ciclo 1) + [`docs/PLAN-c2.md`](PLAN-c2.md) (estilo de
> tasks). Autoridade das regras de streak/skip: driver §7 e §8. Autoridade da janela retroativa:
> SPEC-c3 §10.
>
> Este plano cobre os **2 refinamentos T1–T2** do SPEC-c3 em **5 fases (F1–F5)** e **9 tasks atômicas
> `R1..R9`**. É *plan only* — **nenhum código** foi alterado.
>
> Baseline de regressão: **213 testes / 38 suites verdes** (medido no discovery, v2.0.0). Nenhum
> teste existente pode quebrar.

---

## 1. Como usar este plano

- Fases F1–F5 = SPEC-c3 §8: `F1 T2 domínio → F2 T1 domínio+repo → F3 T1 config → F4 T1 UI → F5 polish`.
- Tasks TDD atômicas `R1..R9`, executar em ordem de `id` respeitando `Dependências`.
- RED → GREEN → REFACTOR. **Escrever o teste que falha primeiro**, implementar, refatorar.
- `src/domain/` é 100% puro: **sem I/O, sem RN/Expo/banco, sem `new Date()` interno** — `now` é sempre
  argumento. Quem injeta `now` é o caller (tela/hook).
- **Nunca** duplicar regra de negócio na UI. A UI chama as funções de domínio.
- Decisões fechadas mudam só no arquivo de custódia (SPEC-c3 §10).

### Comandos de verificação (valem para toda task)

| Verificação | Comando |
|---|---|
| Testes (por regex) | `npx jest <regex>` (ex.: `npx jest src/domain/streak`) |
| Suite completa (regressão 213) | `npx jest` / `npm test` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx expo lint` / `npm run lint` |
| Web (resposta UI) | `npm run web` |

**Cada task, ao terminar, exige `npx tsc --noEmit` e `npx expo lint` limpos + o teste citado verde.**
Ao fechar cada fase: `npx jest` integral (sem regressão dos 213).

### Baseline de regressão (não pode regredir)

- `src/domain/streak/currentStreak.test.ts` (7 casos), `bestStreak.test.ts`, `overallStreak.test.ts`
- `src/domain/record/record.test.ts` (7 casos)
- `src/data/__tests__/repositories.test.ts` (append-only + toggles), `integration.test.ts`
- restantes suites / 213 testes.

---

## 2. DoD — Definition of Done GLOBAL + saída do RUG

**Produto (SPEC-c3 §9)**

- [ ] Hábito com N dias concluídos e **hoje pendente** exibe **N** (não 0) na Home, Habits e detail.
- [ ] Hoje concluído exibe **N+1**; dia fechado perdido exibe **0**; skip não zera.
- [ ] Switch "Permitir edição retroativa" visível em Avançado, off por padrão, descrito como exceção.
- [ ] Com o switch on, ontem/anteontem podem ser concluídos pelo detail; fora da janela, não.
- [ ] Retro-conclusão grava fato (`date` passado, `completedAt` = agora) e recalcula streak.
- [ ] Skip **não** é retroativo; dia não agendado/antes do `createdAt` não é editável.

**Técnica**

- [ ] Regra de streak em função única (`currentStreak.ts`), alinhada a `overallStreak.ts:73-77`.
- [ ] Guard retroativo em função pura única (`transitions.ts`); `setCompleted` segue hoje-only.
- [ ] Janela de 48h = dia-calendário, **uma constante** (`RETROACTIVE_WINDOW_DAYS = 2`) consumida pelo guard.
- [ ] Quantitativo retroativo grava `value = habit.targetValue` (c3.6).
- [ ] Sem migration/schema novo; `src/config/opens.ts` §15.1 **intocado**.
- [ ] Tokens semânticos, zero hex solto; estados **não dependentes só de cor**.
- [ ] **213 testes** sem regressão + novos verdes; `tsc --noEmit` e lint verdes.

**UX**

- [ ] Célula retroativa elegível com affordance clara; inelegível read-only.
- [ ] A11y: `accessibilityRole`/`accessibilityLabel` explícitos nas células.
- [ ] Contraste coerente light/dark; sem animação obrigatória (reduced-motion safe).

### Critério de saída do RUG (State 2 → ship / State 3)

- `npx jest` **100% verde** (213 baseline + testes novos).
- `npx tsc --noEmit` e `npx expo lint` **limpos**.
- `npm run web` renderiza o fluxo retroativo e o streak hoje-pendente correto.
- Release publicada (`v0.2.1-c3`) com download anônimo **HTTP 200** (fluxo padrão do projeto).

---

## 3. Central de decisões fechadas (custódia) — SPEC-c3 §10

Nenhuma das linhas abaixo é OPEN. Trocar depois = editar **só** o arquivo indicado (+ teste do caller).

| Ref | Decisão | Arquivo único (custódia) |
|---|---|---|
| c3.1 | Janela de edição retroativa = ontem + anteontem (dia-calendário) | `src/config/opens.ts` (`RETROACTIVE_WINDOW_DAYS = 2`) |
| c3.2 | Switch persistido, off por padrão, sempre visível em Avançado | `src/services/prefs.ts` + `src/app/settings/advanced.tsx` |
| c3.3 | Fato retroativo: `date` = dia passado, `completedAt` = agora; sem undo | `src/domain/record/transitions.ts` (`complete`) |
| c3.4 | Streak hoje-pendente neutro (continua); sem campo `displayStreak` | `src/domain/streak/currentStreak.ts` |
| c3.5 | Janela "48h" = dia-calendário `{today-1, today-2}`; constante `RETROACTIVE_WINDOW_DAYS = 2` | `src/config/opens.ts` |
| c3.6 | Quantitativo retroativo grava `value = habit.targetValue` | `src/domain/record/transitions.ts` (helper) |

**Regra dura:** `src/config/opens.ts` §15.1 (grant semanal) **não é tocado** neste ciclo.

---

# FASE F1 — T2 domínio (streak hoje-pendente)

> **Regra de ouro:** domínio 100% puro e testado ANTES de qualquer UI. Sem UI em F1.
> Autoridade da regra: SPEC-c3 §2.1/§3.2 e `overallStreak.ts:73-77`.

**Gate da fase:** `npx jest src/domain/streak` verde; `npx jest` sem regressão; `tsc` + `lint` limpos.

### R1 — `currentStreak.scanCurrent`: hoje-pendente não zera (RED-GREEN)

- **Dependências:** —
- **Fazer:** em `src/domain/streak/currentStreak.ts`, no ramo `day === today` de `scanCurrent`
  (linhas 51–53), trocar `break` por `day = addDays(day, -1); continue;` — realinhar ao padrão de
  `overallStreak.ts:73-77`. Remover a flag `broke` (não usada) e simplificar o retorno para `return run`.
  Hoje-pendente passa a ser **neutro**: não soma, não zera. `scanBest` **não** muda.
- **Arquivos:** `src/domain/streak/currentStreak.ts`, `src/domain/streak/currentStreak.test.ts`.
- **Testes de referência (RED primeiro — 5 casos T2):**
  - hoje **pendente**, 5 dias anteriores concluídos ⇒ `current === 5`.
  - hoje **concluído**, 5 anteriores ⇒ `current === 6`.
  - hoje pendente, **ontem perdido** (dia agendado sem record) ⇒ `current === 0`.
  - hoje pendente, ontem **`skipped`**, dias antes concluídos ⇒ conta os concluídos (skip neutro).
  - hábito com **`createdAt` recente** (metade do run) ⇒ streak limitado ao `createdAt`
    (não conta dias antes da criação).
- **Verificar:** `npx jest src/domain/streak`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** hoje-pendente preserva o run; os 7 casos existentes de `currentStreak.test.ts` seguem verdes;
  nenhuma lógica nova fora de `scanCurrent`.

**— Fim FASE F1 —**

---

# FASE F2 — T1 domínio + repositor (guard retroativo + escrita passada)

**Gate da fase:** `npx jest src/domain/record repositories` verde; `npx jest` sem regressão; `tsc`/`lint` limpos.

### R2 — `canCompleteRetroactive` + `RETROACTIVE_WINDOW_DAYS` + helper de valor (T1)

- **Dependências:** —
- **Fazer:**
  - Em `src/config/opens.ts` (custódia c3.5): `export const RETROACTIVE_WINDOW_DAYS = 2;` com comentário
    `// janela de produto "48h" = dia-calendário {today-1, today-2}`.
  - Em `src/domain/record/transitions.ts`, guard puro:
    ```ts
    export function canCompleteRetroactive(
      habit: Habit,
      record: HabitRecord | undefined,
      dateKey: string,
      now: Date,
      enabled: boolean,
    ): boolean;
    ```
    Regras (nesta ordem): `!enabled` ⇒ `false`; `dateKey === today` ⇒ `false`; `dateKey <
    addDays(today, -RETROACTIVE_WINDOW_DAYS)` ⇒ `false`; `!isScheduled(habit, dateKey)` ⇒ `false`
    (inclui o lowerBound `createdAt`); `record.status` `completed`/`skipped` ⇒ `false`; senão `true`.
  - Helper puro do valor (custódia c3.6): `retroactiveCompletionValue(habit): number | undefined` =
    `habit.type === 'quantitative' ? habit.targetValue : undefined`.
- **Arquivos:** `src/config/opens.ts`, `src/domain/record/transitions.ts`, `src/domain/record/record.test.ts`.
- **Testes de referência (RED-GREEN — 9 casos T1 + valor):** switch **off** ⇒ false; **hoje** ⇒ false;
  **ontem** agendado sem record ⇒ true; **anteontem** agendado sem record ⇒ true; **hoje-3** (fim de
  janela) ⇒ false; ontem **não agendado** (`weekdays` em fim de semana) ⇒ false; dia **anterior ao
  `createdAt`** ⇒ false; ontem com record **`completed`** ⇒ false; ontem com record **`skipped`** ⇒ false;
  + `retroactiveCompletionValue` (quant → `targetValue`; binary → `undefined`).
- **Verificar:** `npx jest src/domain/record`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** janela/estado em **função pura única**; `canCompleteToday`/`complete` intactos;
  nenhuma duplicação de regra na UI.

### R3 — `RecordRepository.setCompletedRetroactive` (T1)

- **Dependências:** R2
- **Fazer:**
  - `src/data/repositories/types.ts`: adicionar
    `setCompletedRetroactive(habitId: string, dateKey: string, now: Date, value?: number): Promise<void>`.
  - `src/data/repositories/impl.ts`: implementar **sem** o guard `toDateKey(now) !== dateKey`.
    Defesa em profundidade (repo lê a tabela `habits` para o `habitId`): revalida a janela
    `{today-1, today-2}` + `isScheduled`; se registro existente `completed`/`skipped` ⇒
    `throw new Error('record_conflict')`; remove qualquer `pending` residual do mesmo `(habitId, dateKey)`;
    grava `completeRecord(habitId, dateKey, now, value)`. `setCompleted` (hoje-only) **permanece**.
  - O gate `enabled` (config/prefs) **não** entra no repo — é enforçado no domínio/UI (repo não lê prefs).
- **Arquivos:** `src/data/repositories/types.ts`, `src/data/repositories/impl.ts`,
  `src/data/__tests__/repositories.test.ts`.
- **Testes de referência (RED-GREEN):** grava record com `date` **passado** e `completedAt = now` (não lança);
  rejeita overwrite de **`completed`** (`record_conflict`); rejeita **`skipped`** (sem retro-skip);
  rejeita **fora da janela** (`today-3`); `setCompleted` (hoje-only) **ainda** rejeita data passada
  (`record_write_past_date` — não regredir); valor repassado para quantitativo.
- **Verificar:** `npx jest repositories`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** escrita passada **só** pelo path guardado; append-only e conflito preservados.

**— Fim FASE F2 —**

---

# FASE F3 — T1 config (Avançado + tela de Ajustes)

**Gate da fase:** switch "Permitir edição retroativa" visível em Avançado, off por padrão, persistido;
`tsc`/`lint`/testes limpos.

### R4 — Prefs: `retroEdit` (RED-GREEN)

- **Dependências:** —
- **Fazer:** `src/services/prefs.ts` — seguir o molde existente (`KEYS` + `getItem`/`setItem`):
  - `KEYS.retroEdit = 'habitflow:prefs:retroEdit'`.
  - `getRetroEditEnabled(): Promise<boolean>` — `false` quando nunca salvo/inválido.
  - `setRetroEditEnabled(v: boolean): Promise<void>`.
- **Arquivos:** `src/services/prefs.ts`, `src/services/prefs.test.ts`.
- **Testes de referência (RED-GREEN):** default `false`; roundtrip `true`/`false`; valor inválido ⇒ `false`.
- **Verificar:** `npx jest prefs`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** preferência sobrevive ao restart; leitura resiliente.

### R5 — Tela `settings/advanced.tsx` + linha no índice

- **Dependências:** R4
- **Fazer:**
  - Nova tela `src/app/settings/advanced.tsx` (padrão `appearance.tsx`: card `surface` + borda +
    `spacing.lg`): `Switch` de `components/ui/forms/Controls.tsx` com label "Permitir edição retroativa";
    texto de exceção ("Exceção: permite marcar ontem/anteontem como concluído. Desligado por padrão.");
    carrega `getRetroEditEnabled` no mount e persiste via `setRetroEditEnabled`.
  - `src/app/settings/index.tsx`: adicionar `{ href: '/settings/advanced', label: 'Avançado', icon: 'settings' }`
    à lista `ITEMS` (sempre visível, fora de submenu profundo).
- **Arquivos:** `src/app/settings/advanced.tsx`, `src/app/settings/index.tsx`.
- **Testes de referência:** smoke de render (switch com `accessibilityRole="switch"`, estado inicial off,
  texto de exceção presente).
- **Verificar:** `npx tsc --noEmit`; `npx expo lint`; `npm run web` (linha visível, tela abre).
- **Aceite:** switch off por padrão, descrito como exceção; persiste entre sessões.

**— Fim FASE F3 —**

---

# FASE F4 — T1 UI (células retroativas no HabitDetail + fluxo completo)

**Gate da fase:** células {ontem, anteontem} tocáveis quando o switch está on; toque confirma, grava o
fato retroativo, recarrega e o streak sobe; fora da janela/off permanece read-only; `tsc`/`lint`/testes limpos.

### R6 — Componente de células de semana com retro elegível (T1)

- **Dependências:** R1, R2
- **Fazer:** extrair o bloco "Últimos 7 dias" (`habits/[id]/index.tsx:79-96`) para um componente de
  apresentação testável `src/components/feature/WeekStatusRow.tsx`:
  - Props: `{ days: { key: string; status: ViewStatus }[]; isRetroEligible(key: string): boolean;
    onRetroComplete(key: string): void; accessibilityLabelFor?(key: string): string }`.
  - Célula elegível vira `Pressable` com `accessibilityRole="button"` e label
    `"Marcar {hábito} como concluído em {dia}"`; inelegível permanece read-only (**sem** affordance).
  - Preserva o vocabulário não-só-cor (✓ / — / ✕ / ○) e as cores atuais.
- **Arquivos:** `src/components/feature/WeekStatusRow.tsx` (+ `.test.tsx`);
  `src/app/habits/[id]/index.tsx` passa a usar o componente.
- **Testes de referência (RED-GREEN):** célula elegível é pressionável e dispara `onRetroComplete(key)`;
  célula inelegível **não** dispara; label a11y presente na célula elegível.
- **Verificar:** `npx jest weekstatusrow`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** affordance só nas células elegíveis; a11y explícita; 7 células sem regressão visual.

### R7 — Fiação retroativa no HabitDetail (T1)

- **Dependências:** R3, R4, R5, R6
- **Fazer:** em `src/app/habits/[id]/index.tsx`:
  - Carregar `getRetroEditEnabled()` (state) no mount.
  - `isRetroEligible(key)` = `canCompleteRetroactive(habit, record, key, now, enabled)`.
  - Toque em célula elegível ⇒ **confirmação inline/microdiálogo** (cancelar/confirmar) ⇒
    `repos.records.setCompletedRetroactive(habit.id, key, now, retroactiveCompletionValue(habit))` ⇒
    `reload()` ⇒ `showToast('Concluído (retroativo)')` (reusa `useToast`). O streak "Atual" sobe no
    próximo render (derivado de `computeStreaks` — **sem** materializar).
  - Switch **off** ⇒ nenhuma célula tocável (sem mudança visual além disso).
  - **Sem undo** de retro-conclusão (SPEC-c3 §3.1).
- **Arquivos:** `src/app/habits/[id]/index.tsx`.
- **Testes de referência:** smoke de fiação (toque em dia elegível chama o repo e `reload`; switch off
  não expõe affordance). Domínio já coberto por R1/R2/R3.
- **Verificar:** `npx tsc --noEmit`; `npx expo lint`; `npm run web` (toque em ontem conclui e o "Atual"
  sobe); `npx jest` (regressão).
- **Aceite:** retro-conclusão grava fato e recalcula streak; fora da janela/off não edita; skip não é
  retroativo; a11y coerente.

**— Fim FASE F4 —**

---

# FASE F5 — Verificação final / polish / release (State 3)

**Gate da fase:** suite completa verde sem regressão, `tsc`/`lint` limpos, release publicada.

### R8 — Verificação final DoD + regressão + a11y/polish (T1+T2)

- **Dependências:** R1..R7
- **Fazer:**
  - `npx jest` integral: **213 baseline + todos os novos**, 100% verde.
  - `npx tsc --noEmit` e `npx expo lint` limpos.
  - `npm run web` smoke: Home/Habits/HabitDetail exibem streak hoje-pendente correto (T2); switch em
    Avançado; células retro funcionam (T1).
  - A11y (labels, não-só-cor), contraste light/dark, reduced-motion (sem animação obrigatória).
  - Checklist produto/técnica/UX do §2 deste plano.
  - Registrar resultado em `docs/REVIEW-c3.md`.
- **Arquivos:** `docs/REVIEW-c3.md` (resultado).
- **Verificar:** tudo verde; relatar gaps.
- **Aceite:** DoD §2 cumprido; **zero regressão dos 213**; `opens.ts` §15.1 intocado.

### R9 — Release (State 3 — FUTURO; NÃO executar nesta missão de PLAN)

- **Dependências:** R8
- **Fazer (predefinido, executar só no State 3):**
  - Bump `app.json` `version "2.1.0"` / `android.versionCode 11` (+ `android/app/build.gradle`
    `versionCode 11` / `versionName "2.1.0"`), regras do `build.gradle` **intocadas**.
  - Build release **arm64**: junction `C:/AndroidSdkJ`, `JAVA_HOME=C:/android-jdk21`,
    `gradlew assembleRelease --no-daemon` (`BUILD SUCCESSFUL`, APK < 50 MB).
  - GitHub release `v0.2.1-c3` (asset `HabitFlow-arm64.apk`); token via
    `git credential fill` host `github.com` username `MTitoS`; verificação **anônima HTTP 200** (`node fetch`).
  - `git push main`; `docs/PROGRESS-c3.md` 100%.
- **Arquivos:** `app.json`, `android/app/build.gradle`, `docs/PROGRESS-c3.md`.
- **Aceite:** release publicada, download anônimo **HTTP 200**; PROGRESS-c3 100%; zero regressão.

**— Fim FASE F5 —**

---

## 4. Dependências (resumo)

```
F1: R1
F2: R2 → R3
F3: R4 → R5
F4: R1,R2 → R6 ; R3,R4,R5,R6 → R7
F5: R1..R7 → R8 → R9
```

Corrente crítica: `R1` (T2) e `R2 → R3 → R7` (T1). F1/F2 (domínio) **antes** de qualquer UI.
R4 (prefs) é independente e pode começar cedo.

## 5. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| T2 altera `aggregate.overallCurrentStreak` (max individual) ao não zerar hoje-pendente | Comportamento mais correto (streak só morre ao fechar o dia); coberto por novo teste (R1); `StreakCard` usa o geral, não afetado |
| Nome/custódia da constante divergente entre §4/§6 (`RETRO_EDIT_WINDOW_DAYS`) e a decisão c3.5 (`RETROACTIVE_WINDOW_DAYS`) | §10 c3.5 é a autoridade: constante única em `src/config/opens.ts`, consumida pelo guard; nome ilustrativo de §4/§6 fica superseded |
| Repo não consegue enforçar o `enabled` (prefs fora do repo) | Defesa do repo = janela + `isScheduled` + conflito; `enabled` enforçado no domínio/UI (R7) |
| Retro escrever em dia não agendado/antes do `createdAt` | `isScheduled` (inclui `createdAt`) no guard puro (R2) **e** revalidação no repo (R3) |
| Retro sobrescrever história | Repo rejeita registro existente `completed`/`skipped`; `setCompleted` segue hoje-only |
| Quantitativo sem `targetValue` | Helper retorna `undefined`; record completa sem valor (edge documentado; sem restrição a binários, c3.6) |
| Regressão dos 213 testes | Gate obrigatório `npx jest` ao fim de cada fase |

## 6. Matriz de rastreabilidade task → refinamento → artefato

| Task | T | Fase | Artefato principal | Teste |
|---|---|---|---|---|
| R1 | T2 | F1 | `domain/streak/currentStreak.ts` | `currentStreak.test.ts` |
| R2 | T1 | F2 | `domain/record/transitions.ts` + `config/opens.ts` | `record.test.ts` |
| R3 | T1 | F2 | `data/repositories/{types,impl}.ts` | `repositories.test.ts` |
| R4 | T1 | F3 | `services/prefs.ts` | `prefs.test.ts` |
| R5 | T1 | F3 | `app/settings/advanced.tsx` + `settings/index.tsx` | smoke |
| R6 | T1 | F4 | `feature/WeekStatusRow.tsx` | `WeekStatusRow.test.tsx` |
| R7 | T1 | F4 | `app/habits/[id]/index.tsx` | smoke + web |
| R8 | T1/T2 | F5 | `docs/REVIEW-c3.md` | suite + tsc + lint |
| R9 | — | F5 | release `v0.2.1-c3` + `docs/PROGRESS-c3.md` | HTTP 200 + push |

## 7. Ordem de execução sugerida

`R1` (F1) · `R2 → R3` (F2) · `R4 → R5` (F3) · `R6 → R7` (F4) · `R8 → R9` (F5).
