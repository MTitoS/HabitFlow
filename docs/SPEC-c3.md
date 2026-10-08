# SPEC-c3 — HabitFlow · Refinamento fase C (T1–T2)

> Ciclo 3. Derivado de [`docs/SPEC.md`](SPEC.md) (ciclo 1) e [`docs/SPEC-c2.md`](SPEC-c2.md) (ciclo 2, v2.0.0 em produção).
> Autoridade das regras de streak/skip: driver §7 e §8.
>
> Este documento cobre **2 refinamentos** com decisões **JÁ FECHADAS** no grilling (não reabrir):
> T1 (edição retroativa, exceção) e T2 (streak display do dia de hoje). É *spec only* — nenhum
> código foi alterado no discovery. Cada gap cita o caminho e a linha reais do código auditado (v2.0.0).
> Baseline: **213 testes verdes** (`npx jest`, 38 suites) — confirmado no discovery.

---

## 1. Escopo

### 1.1 Incluído

| # | Refinamento | Tipo |
|---|---|---|
| T1 | Edição retroativa excepcional: marcar hábito de **ontem/anteontem** como concluído (janela 48h, opt-in em Ajustes) | Domínio novo + repositor + prefs + UI |
| T2 | Corrigir exibição do streak individual quando o dia de hoje ainda está **pendente** (hoje-pendente NÃO zera) | Domínio (bug) |

### 1.2 Fora do escopo

- Alterar a regra de concessão de crédito semanal (permanece OPEN §15.1 do ciclo 1 / `src/config/opens.ts` — **intocado**).
- Retro-editar **skip** (skip continua só-hoje e só-com-crédito).
- Alterar a aba Calendário (`src/app/calendar/index.tsx`).
- Alterar schema WatermelonDB / modelo persistido (nenhuma coluna nova).
- Reminders/notificações/EAS/build/login/cloud.

---

## 2. Estado atual auditado (v2.0.0)

### 2.1 Streak individual — bug de hoje-pendente (T2)

`src/domain/streak/currentStreak.ts`, `scanCurrent` (linhas 29–65):

```ts
} else if (day === today) {
  // pending today: streak not extended, not broken
  break;                       // ← linhas 51–53
}
```

O scan parte de `today` e, no primeiro dia agendado (hoje), o ramo hoje-pendente executa `break`
**antes de qualquer incremento**, retornando `run = 0`. Resultado: um hábito com N dias anteriores
concluídos exibe **0** enquanto hoje está pendente — exatamente o bug relatado.

**Contraprova interna:** `src/domain/streak/overallStreak.ts`, `scanCurrent` (linhas 59–83), resolve
o mesmo caso corretamente:

```ts
if (day === today) {
  day = addDays(day, -1);
  continue;                    // ← linhas 73–77: preserva o run e segue para ontem
}
```

Coberto por `src/domain/streak/overallStreak.test.ts:70` ("pending today does not add or reset").
`scanBest` individual (`currentStreak.ts:67–98`) já é neutro para hoje-pendente.

**Conclusão:** o gap de T2 **NÃO é só de exibição** — é um bug de domínio em `currentStreak.ts:51-53`.
A hipótese de "scan correto, só o display errado" está incorreta. Corrigir o domínio resolve todas
as superfícies de uma vez (Home / Habits / HabitDetail), pois todas consomem o mesmo `current`.

### 2.2 Consumidores do streak individual

| Superfície | Arquivo:linha | Chamada |
|---|---|---|
| Home (HabitRow) | `src/app/index.tsx:196` | `currentStreak(...)` |
| Tela Hábitos (HabitCard) | `src/app/habits/index.tsx:73` | `computeStreaks(...).current` |
| HabitDetail (header, "Atual", streak) | `src/app/habits/[id]/index.tsx:38,65,68` | `computeStreaks(...).current` |

Todos passam por `currentStreak`/`computeStreaks` — **uma correção no domínio cobre os 3**.

### 2.3 Ripple: `daySummary.overallCurrentStreak` (max individual)

`src/domain/stats/aggregate.ts:52-59` calcula `overallCurrentStreak` = **maior streak individual**
via `currentStreak`. Consumido por `buildDerivedStats` (`src/app/index.tsx:34-35`) → achievements/
celebração. Corrigir T2 **aumenta** esse valor em dias com hoje-pendente (o streak deixa de "sumir"
antes do dia fechar). Comportamento mais correto; sem teste existente quebrando (não há caso
hoje-pendente em `currentStreak.test.ts`). `StreakCard` de Estatísticas usa `dayStreakCurrent`
(geral), **não afetado**.

### 2.4 Escrita de record — bloqueio de data passada (T1)

`src/data/repositories/impl.ts`:

- `setCompleted` (linha 119): `if (toDateKey(now) !== dateKey) throw 'record_write_past_date';` (linha 120).
- `setSkipped` (linha 132) e `setPending` (linha 145): mesmo guard de hoje.

`src/domain/record/transitions.ts`:

- `canCompleteToday` (linha 15) e `canEditToday` (linha 21) retornam `false` se `dateKey !== today`.
- `complete(habitId, dateKey, now, value)` (linha 25) **já** grava `date = dateKey` e
  `completedAt = now.getTime()` — isto é, registra o **dia histórico** e o **instante da edição**.
  É exatamente a semântica não-metadb pedida. **Nenhuma mudança de modelo é necessária.**

**Conclusão:** T1 precisa de um caminho novo (guarda + método de repo), não de mudar `complete()`.

### 2.5 Guard de agendamento/criação (T1)

`src/domain/habit/isScheduled.ts:7` já rejeita qualquer `dateKey` anterior a `createdAt`. Portanto a
restrição "não editar dia em que o hábito não estava agendado ou foi criado depois" é atendida por
`isScheduled(habit, dateKey)` — sem lógica nova.

### 2.6 Ajustes (T1)

`src/app/settings/index.tsx:8-15` é uma lista de rotas (Rotinas, Aparência, Notificações, Padrões,
Dados, Sobre). **Não existe** seção "Avançado". Padrões de tela de ajuste: `appearance.tsx` /
`defaults.tsx` (card `surface` + borda + `Switch`/`Select` de `components/ui/forms/Controls.tsx`).
Existe primitivo `Switch` com `accessibilityRole="switch"` (`Controls.tsx:76`).

### 2.7 Prefs

`src/services/prefs.ts` já tem o padrão `getItem/setItem` + `KEYS` + funções tipadas
(`getHabitsViewPrefs`/`setHabitsViewPrefs`, linhas 90–107). Novo pref booleano segue o mesmo molde.

### 2.8 HabitDetail — "Últimos 7 dias"

`src/app/habits/[id]/index.tsx:79-96` renderiza uma linha de 7 células (`weekStatus`) com símbolo
por dia, **read-only**. É o ponto natural para a edição retroativa (já tem dia, hábito e estado).

---

## 3. Regras fechadas

### 3.1 T1 — Edição retroativa (exceção)

- **Janela:** apenas **ontem** e **anteontem** (`dateKey ∈ {today-1, today-2}` por dia-calendário).
- **Opt-in:** switch "Permitir edição retroativa" em **Avançado** (sempre visível, descrito como
  exceção/excepcional). Desligado por padrão.
- **Escrita:** cria `HabitRecord` com `date = dia passado` e `completedAt = agora` (fato novo, não
  reescrita). Reusa `complete()`.
- **Streak:** recalculado automaticamente (derivado; nenhuma materialização).
- **Restrições:**
  - Nunca retroativo para **skip** (skip = só-hoje + crédito).
  - Nunca em dia **não agendado** ou **anterior ao `createdAt`** → `isScheduled` cobre.
  - Nunca no dia de hoje (use o fluxo normal) nem antes da janela.
  - Nunca sobrescrever registro já `completed`/`skipped`.
  - **Sem undo** de retro-conclusão (desfazer reescreveria história; fora do MVP).

### 3.2 T2 — Streak exibido com hoje-pendente

- Streak exibido = dias agendados concluídos **do último dia fechado para trás**; **hoje-pendente
  NÃO zera** (permanece a contagem pré-existente).
- Hoje **completado** → soma 1 (vira N+1).
- Dia fechado perdido (`missed`/sem-record em dia agendado passado) → zera e para.
- `skip` segue neutro (não soma, não zera).
- Aplica-se a **todas** as superfícies (Home, Habits, HabitDetail) por serem o mesmo `current`.

---

## 4. Gaps por arquivo (T1 + T2)

| Arquivo | Mudança | Task |
|---|---|---|
| `src/domain/streak/currentStreak.ts` (51–53) | Trocar `break` por `day = addDays(day, -1); continue;` no ramo `day === today` de `scanCurrent` (alinhar a `overallStreak.scanCurrent`). Remover a flag `broke` (não usada). **Não** criar campo `displayStreak`. | T2 |
| `src/domain/streak/currentStreak.test.ts` | Novo caso: hoje-pendente com N dias concluídos → `current === N`; hoje-completado → `N+1`; dia fechado perdido → 0. | T2 |
| `src/domain/record/transitions.ts` | Novo guard puro `canCompleteRetroactive(habit, record \| undefined, dateKey, now, enabled): boolean` (janela 2 dias-calendário + `isScheduled` + estado do record + `enabled`). Exportar `RETRO_EDIT_WINDOW_DAYS = 2`. | T1 |
| `src/domain/record/record.test.ts` | Casos red-green de T1 (ver §7). | T1 |
| `src/data/repositories/types.ts` | `RecordRepository.setCompletedRetroactive(habitId, dateKey, now, value?): Promise<void>`. | T1 |
| `src/data/repositories/impl.ts` | Implementar `setCompletedRetroactive` (sem o guard `toDateKey(now) !== dateKey`; reusa `complete()`; rejeita se registro existente `completed`/`skipped`). `setCompleted` **permanece** hoje-only. | T1 |
| `src/services/prefs.ts` | `KEYS.retroEdit` + `getRetroEditEnabled(): Promise<boolean>` / `setRetroEditEnabled(v): Promise<void>`. | T1 |
| `src/app/settings/advanced.tsx` | **Nova tela** "Avançado" com o `Switch` + texto de exceção (padrão `appearance.tsx`). | T1 |
| `src/app/settings/index.tsx` | Adicionar `{ href: '/settings/advanced', label: 'Avançado', icon: 'settings' }` à lista (sempre visível). | T1 |
| `src/app/habits/[id]/index.tsx` | Células de "Últimos 7 dias": tornar `Pressable` as de ontem/anteontem quando elegíveis; disparar confirmação + `setCompletedRetroactive`; recarregar. | T1 |

---

## 5. UI de acesso retroativo — recomendação

**Recomendado (primário): edição pelas células de "Últimos 7 dias" do HabitDetail**
(`src/app/habits/[id]/index.tsx:79-96`).

Fundamentos:
1. **Já é per-hábito e per-dia:** cada célula carrega `key` (data) e `status` — o alvo da edição já
   existe e é exibido com o mesmo vocabulário não-só-cor (✓/—/✕/○).
2. **Descoberta natural, sem gesto novo:** tocar a célula do dia. `long-press` no `HabitRow` seria
   invisível e sujeito a disparo acidental no fluxo principal (Home é "today first").
3. **Mantém a exceção longe do caminho principal:** a Home permanece intocada; a edição mora em um
   contexto de detalhe/inspeção, coerente com "excepcional".
4. **Reuso máximo:** a tela já tem `habit`, `habitRecords`, `now` e a infra de recarregar via store.

Regras de UI:
- Célula elegível (ontem/anteontem + `canCompleteRetroactive`) vira `Pressable` com
  `accessibilityRole="button"` e label `"Marcar {hábito} como concluído em {dia}"`.
- Célula inelegível permanece read-only (sem affordance).
- Se o switch estiver **desligado**, nenhuma célula é tocável (sem mudança visual além disso).
- Confirmação leve (toast "concluído (retroativo)") reusando `useToast`.

**Alternativas avaliadas e não recomendadas:**
- `long-press` no `HabitRow` (Home/Habits): poucos taps, mas baixa descobribilidade e risco de toque
  acidental na tela de maior tráfego. Fica como acelerador **futuro**, fora do ciclo 3.
- Aba **Calendário** global (`src/app/calendar/index.tsx`): compartilha superfície congelada no ciclo
  2 e mistura edição com visualização global; alto impacto para uma exceção. Não tocar.

---

## 6. Encanamento de T1 (detalhe)

```ts
// transitions.ts (puro, sem I/O)
export const RETRO_EDIT_WINDOW_DAYS = 2;

export function canCompleteRetroactive(
  habit: Habit,
  record: HabitRecord | undefined,
  dateKey: string,
  now: Date,
  enabled: boolean,
): boolean {
  if (!enabled) return false;
  const today = toDateKey(now);
  if (dateKey === today) return false;                // hoje usa o fluxo normal
  const min = addDays(today, -RETRO_EDIT_WINDOW_DAYS); // today-2
  if (dateKey < min) return false;                    // fora da janela
  if (!isScheduled(habit, dateKey)) return false;     // inclui lowerBound createdAt
  if (record && (record.status === 'completed' || record.status === 'skipped')) return false;
  return true;
}
```

- `isScheduled` já é a autoridade de agendamento/criação (§2.5).
- `complete()` já produz `{ date: dateKey, status: 'completed', completedAt: now.getTime() }`.
- `setCompletedRetroactive` no repo: valida novamente via guard (defesa em profundidade), remove
  qualquer `pending` residual do mesmo `(habitId, dateKey)` e grava `complete(...)`.

**Custódia:** a janela/janela de guarda vive em `transitions.ts`; o switch/persistência em
`prefs.ts`; nenhum outro módulo duplica a regra. `opens.ts` §15.1 **não é tocado** (a janela de 48h
é decisão **fechada**, não OPEN de negócio).

---

## 7. Testes (red-green)

### T1 — `src/domain/record/record.test.ts` (guard puro)

| Cenário | Esperado |
|---|---|
| hoje com switch on (via fluxo normal) | `canCompleteRetroactive` = false (hoje não é retroativo) |
| ontem agendado, switch on, sem record | true |
| anteontem agendado, switch on, sem record | true |
| hoje-3 (fim de janela), switch on | false |
| ontem agendado, switch **off** | false |
| ontem **não agendado** (`weekdays` em fim de semana) | false |
| dia anterior ao `createdAt` | false |
| ontem com record `completed` | false |
| ontem com record `skipped` | false (sem retro-skip) |

### T1 — repositor

- `setCompletedRetroactive` grava record com `date` passado e `completedAt` = agora; não lança.
- `setCompleted` (hoje-only) mantém o guard `record_write_past_date` (não regredir).

### T2 — `src/domain/streak/currentStreak.test.ts`

| Cenário | Esperado |
|---|---|
| hoje **pendente**, 5 dias anteriores concluídos | `current === 5` |
| hoje **concluído**, 5 anteriores | `current === 6` |
| hoje pendente, ontem perdido (sem record) | `current === 0` |
| hoje pendente, ontem `skipped`, dias antes concluídos | conta os concluídos (skip neutro) |
| retro-conclusão de ontem | `current` sobe em 1 no próximo cálculo (derivado) |

---

## 8. Fases de implementação (ordem de dependência)

1. **F1 — T2 domínio (primeiro, menor e desbloqueia UI).**
   Ajustar `scanCurrent` (`currentStreak.ts:51-53`) + testes. Validar `npx jest src/domain/streak`.
2. **F2 — T1 domínio + repositor.**
   `canCompleteRetroactive` + `RETRO_EDIT_WINDOW_DAYS` + `setCompletedRetroactive` + testes.
3. **F3 — T1 config.**
   `prefs.ts` (retroEdit) + `settings/advanced.tsx` + linha em `settings/index.tsx`.
4. **F4 — T1 UI.**
   Células retroativas em `habits/[id]/index.tsx` + toast + reload.
5. **F5 — Polish/verificação.**
   Acessibilidade (labels, não-só-cor), `prefers-reduced-motion` (sem animação obrigatória),
   contraste light/dark, `npx tsc --noEmit` + `npx expo lint` + `npx jest` (213 + novos).

---

## 9. Critérios de aceite

**Produto**
- [ ] Hábito com N dias concluídos e **hoje pendente** exibe **N** (não 0) na Home, Habits e detail.
- [ ] Hoje concluído exibe **N+1**; dia fechado perdido exibe **0**.
- [ ] Switch "Permitir edição retroativa" visível em Avançado, off por padrão, descrito como exceção.
- [ ] Com o switch on, ontem/anteontem podem ser concluídos pelo detail; fora da janela, não.
- [ ] Retro-conclusão grava fato (`date` passado, `completedAt` = agora) e recalcula streak.
- [ ] Skip **não** é retroativo; dia não agendado/antes do `createdAt` não é editável.

**Técnica**
- [ ] Regra de streak em função única (`currentStreak.ts`), alinhada a `overallStreak.ts`.
- [ ] Guard retroativo em função pura única (`transitions.ts`); `setCompleted` segue hoje-only.
- [ ] Sem migration/schema novo; `opens.ts` §15.1 intocado.
- [ ] Tokens semânticos, zeros hex; estados não-só-cor.
- [ ] Baseline **213 testes** sem regressão + novos verdes; `tsc --noEmit` e lint verdes.

---

## 10. Registro de decisões / OPENs

Decisões fechadas (grilling) e custódia:

| # | Questão | Local de custódia | Decisão |
|---|---|---|---|
| c3.1 | Janela de edição retroativa | `src/domain/record/transitions.ts` | `RETRO_EDIT_WINDOW_DAYS = 2` → ontem + anteontem (dia-calendário) |
| c3.2 | Como ligar/desligar | `src/services/prefs.ts` + `src/app/settings/advanced.tsx` | Switch persistido, off por padrão; sempre visível em Avançado |
| c3.3 | Semântica do fato retroativo | `transitions.complete` | `date` = dia passado, `completedAt` = instante da edição; sem undo |
| c3.4 | Exibição do streak hoje-pendente | `src/domain/streak/currentStreak.ts` | Alinhar ao `overallStreak`: neutro → continua; sem campo `displayStreak` |

**Decisões fechadas adicionais (grilling 08/10/2026 — encerram as OPENs c3.5/c3.6):**

| # | Questão | Local de custódia | Decisão |
|---|---|---|---|
| c3.5 | Janela "48h": literal (wall-clock) ou dia-calendário? Nome/custódia da constante | `src/config/opens.ts` | **Dia-calendário** `{today-1, today-2}` (ontem + anteontem), ambos editáveis até o fim do dia atual. Records são por dia; 48h wall-clock não é representável de forma estável. Constante única `RETROACTIVE_WINDOW_DAYS = 2` em config, com comentário ligando ao texto de produto "48h", consumida pelo guard — supersede o nome ilustrativo `RETRO_EDIT_WINDOW_DAYS` citado em §4/§6. |
| c3.6 | Retro-conclusão de hábito **quantitativo**: qual `value`? | `src/domain/record/transitions.ts` (helper) + `habits/[id]/index.tsx` | Gravar `value = habit.targetValue` (meta do dia marcada como batida). Sem diálogo de input, sem restrição a binários. |

**OPENs restantes:** nenhum — todas as decisões do ciclo 3 estão fechadas e com custódia (c3.1–c3.6).

---

## 11. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| T2 altera `overallCurrentStreak` (achievements) ao não zerar hoje-pendente | Comportamento mais correto (streak só morre ao fechar o dia); coberto por novo teste; `StreakCard` usa o geral (não afetado) |
| Retro escrever em dia não agendado/antes do `createdAt` | `isScheduled` (inclui `createdAt`) + guard puro no domínio e revalidação no repo |
| Retro sobrescrever história | Repo rejeita registro existente `completed`/`skipped`; `setCompleted` segue hoje-only |
| Switch "escondido" contrariar "sempre visível" | Linha fixa em `settings/index.tsx` (não em submenu profundo) |
| Discoverabilidade do acesso retroativo | Célula tocável no detail com label a11y explícito; Home intocada |

---

## 12. Comandos de verificação (ao implementar)

```
npx tsc --noEmit
npx expo lint
npx jest            # baseline 213 + novos (streak/record)
```
