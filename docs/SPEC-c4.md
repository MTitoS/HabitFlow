# SPEC-c4 — HabitFlow · Refinamento fase D (T1–T4)

> Ciclo 4. Derivado de [`docs/SPEC.md`](SPEC.md) (ciclo 1), [`docs/SPEC-c2.md`](SPEC-c2.md) (ciclo 2, v2.0.0)
> e [`docs/SPEC-c3.md`](SPEC-c3.md) (ciclo 3, v0.2.1-c3 — retroativo + streak hoje-pendente).
> Autoridade das regras de status: driver §8 (skip neutro), §9 (histórico imutável), §35 (derivado).
>
> Foco: **composição de status nos charts de Estatísticas**. Os 2 gráficos hoje mostram só taxa (%)
> agregada; o produto decidiu exibir, por dia, a decomposição em **concluído / skipado / não concluído**.
>
> Este documento é *spec only* — nenhum código foi alterado no discovery. Cada gap cita caminho e
> linha reais do código auditado. Baseline: **243 testes verdes / 40 suites** (`npx jest`, confirmado
> no discovery deste ciclo).

---

## 1. Escopo

### 1.1 Incluído

| # | Refinamento | Tipo |
|---|---|---|
| T1 | Barras segmentadas por status: cada barra compõe **concluídos + skipados + não concluídos** (não empilhamento de %), em `WeeklyChart` e `CompletionChart` | Domínio (counts) + UI |
| T2 | Legenda no rodapé de **cada** card (3 itens: cor + label curta); card cresce de forma controlada | UI + tokens |
| T3 | **Mesmas cores** de status nos 2 charts (semana e mês) — unificar a paleta de status hoje divergente (semanal laranja, mensal creme/cinza) | Tokens |
| T4 | Avaliar se os 3 status herdam tokens do `MonthView` (c3) ou ganham tokens próprios — com justificativa | Decisão (spec) |

### 1.2 Fora do escopo

- Alterar a **aba Calendário** global (`src/app/calendar/index.tsx`) e o `MonthView` como superfície
  day-level — a mudança é **aditiva** nos dados; nenhum comportamento visual do calendário é reescrito.
- Alterar a regra semanal de skip (permanece OPEN §15.1 ciclo 1 / `src/config/opens.ts` — **intocado**).
- Split `pending` vs `missed` dentro de "não concluído" (default: bucket único — ver §11).
- Schema WatermelonDB / coluna persistida (tudo é **derivado** de records — zero migration).
- Reminders/notificações/EAS/build/login/cloud.
- Novo padrão de animação (opcional, gated por reduced-motion — ver §6.4).

---

## 2. Estado atual auditado (v0.2.1-c3)

### 2.1 `src/domain/stats/aggregate.ts` — o que existe hoje

`DayPoint` (linhas 20–27):

```ts
export interface DayPoint {
  dateKey: string;
  scheduled: number;
  completed: number;
  percent: number;
  monthDay: number;
  weekday: string;
}
```

- `completedOn(records, dateKey)` (linhas 39–41) conta **todos** os records `completed` daquela data,
  **sem filtrar por hábito ativo/agendado**.
- `weeklySeries` (75–95): 7 pontos, `scheduled = active.filter(isScheduled)`, `completed = completedOn(...)`,
  `percent = scheduled > 0 ? completed / scheduled : 0`.
- `monthlySeries` (97–121): mesmo padrão, todos os dias do mês corrente.

**O que falta:** contagem de `skipped` e de `notCompleted` por dia. Hoje não há como compor a barra.

**Bug latente identificado:** `completed` (de `completedOn`) conta records de hábitos arquivados,
enquanto `scheduled` filtra ativos — logo `completed` pode exceder `scheduled` e o `percent` pode passar
de 100%. Só aparece com hábito arquivado possuindo records na data. Não é coberto por teste hoje.

### 2.2 `src/components/feature/dashboard/WeeklyChart.tsx`

- RN **Views puras** (sem `react-native-svg`, sem `reanimated`).
- `track` (70–76): `height: 96`, `width: 20`, `justifyContent: 'flex-end'`, `surfaceElevated`.
- `bar` (77–80): `height: '${pct}%'`, cor `theme.color('primary')` (laranja), `borderRadius: radius.sm`.
- Label a11y (25): `` `${label}: ${pct}%` `` (ex.: `Seg: 50%`).
- `styles.card`: `padding: spacing.lg`, `gap: spacing.md`, `radius.card`, `borderWidth: 1`.

### 2.3 `src/components/feature/dashboard/CompletionChart.tsx`

- Mesma tecnologia (Views). `row` (54–58): `flexDirection: 'row'`, `gap: 3`.
- `barWrap` (59–63): `flex: 1`, `height: 64`, `justifyContent: 'flex-end'`.
- `bar` (23–31): `height: '${pct}%'`; cor `completed > 0 ? theme.color('accent') : theme.color('border')`
  (creme/cinza) — **paleta divergente** do WeeklyChart (laranja). É o gap de T3.
- Sem legenda. Sem contagem por status.

### 2.4 `src/components/feature/dashboard/MonthView.tsx` + tokens do calendário

- `stateMeta` (12–21) mapeia estados **day-level** `conquered | partial | neutral`
  (`MonthDayState`, `src/domain/streak/overallStreak.ts:18`):
  - `conquered` → `calendarDoneFill` / `calendarDoneFg` / `✓` / "Vencido".
  - `partial` → `calendarSkipFill` / `calendarSkipFg` / `◐` / "Parcial".
  - `neutral` → `surfaceElevated` / `textMuted` / `○` / "Neutro".
- Tokens (`src/theme/colors.ts`):
  - light (115–122): `calendarDoneFill #4A6B3E`, `calendarSkipFill #E4D7C0`, `calendarMissedFill #E8D6C6`.
  - dark (183–190): `calendarDoneFill #EFCA93`, `calendarSkipFill #DCBAAE`, `calendarMissedFill #AD2F21`.
- **MonthView NÃO tem estado "missed"**: "perdido" cai fora de `conquered`/`partial` → vira `neutral`.
  Logo, qualquer reuso literal dos tokens do MonthView **não** cobre o bucket "não concluído".

### 2.5 Consumidores mapeados

| Símbolo | Consumidor | Uso |
|---|---|---|
| `weeklySeries` | `src/app/statistics/index.tsx:20` | `WeeklyChart` |
| `monthlySeries` | `src/app/statistics/index.tsx:21` | `CompletionChart` + `MonthView` |
| `monthlySeries` | `src/app/calendar/index.tsx:26` | grid do calendário (`point.completed`/`scheduled`) |
| `DayPoint` | `WeeklyChart`, `CompletionChart`, `MonthView`, `calendar/index.tsx` | tipo |
| `completedOn` | `aggregate.ts:49` (`daySummary`) e séries | contagem |
| `indexRecords` | `src/domain/record/model.ts:17` | map `habitId → date → record` (reusar) |

⚠️ `statistics/index.tsx:58` passa o **mesmo** `month` para `CompletionChart` e `MonthView`. Estender
`DayPoint` é **aditivo** — MonthView ignora os campos novos e nada quebra.

### 2.6 Teste que trava contrato de a11y

`src/components/feature/dashboard.test.tsx:34-38` espera `getByLabelText('Seg: 50%')` e `'Dom: 0%'`.
Trocar a label para incluir a composição **altera este teste** (mudança deliberada de contrato, não
regressão). Deve ser atualizado junto com T1.

---

## 3. Semântica fechada (produto)

1. **Concluído** = hábitos `completed` no dia.
2. **Skipado** = hábitos `skipped` no dia (skip é **neutro** §8; cor própria, não pode parecer falha).
3. **Não concluído** = `pending` (dia corrente) + `missed` (passado) + ausência de record em dia agendado.
   **Bucket único** por ora (split pending/missed fica OPEN — §11).
4. **Dia sem nenhum hábito agendado** (`scheduled === 0`) = **barra neutra/trilha**, não entra na composição
   (sem segmentos, sem swatch na legenda).
5. Invariante por dia agendado: `done + skipped + undone === scheduled`.
6. Classificação é **derivada** de records (zero schema novo, zero materialização) e por
   **hábito ativo agendado** — nunca conta record de hábito arquivado/não agendado.

---

## 4. Modelo derivado (domínio)

### 4.1 Novo helper puro — `src/domain/stats/aggregate.ts`

```ts
export interface DayComposition {
  scheduled: number;
  done: number;
  skipped: number;
  undone: number; // pending + missed + sem-record
}

// recordsByHabit = indexRecords(activeRecords) — O(1) por hábito/dia
export function composeDay(
  activeHabits: Habit[],
  recordsByHabit: Map<string, Map<string, HabitRecord>>,
  dateKey: string,
): DayComposition {
  let scheduled = 0, done = 0, skipped = 0;
  for (const habit of activeHabits) {
    if (!isScheduled(habit, dateKey)) continue;
    scheduled += 1;
    const status = recordsByHabit.get(habit.id)?.get(dateKey)?.status;
    if (status === 'completed') done += 1;
    else if (status === 'skipped') skipped += 1;
  }
  return { scheduled, done, skipped, undone: scheduled - done - skipped };
}
```

### 4.2 `DayPoint` estendido (aditivo, não destrutivo)

```ts
export interface DayPoint {
  dateKey: string;
  scheduled: number;
  completed: number;   // LEGADO — inalterado (completedOn) para calendar/MonthView
  percent: number;     // LEGADO — inalterado
  done: number;        // NOVO — composição (por agendado ativo)
  skipped: number;     // NOVO
  undone: number;      // NOVO
  monthDay: number;
  weekday: string;
}
```

- `weeklySeries`/`monthlySeries` passam a construir o índice 1× (`indexRecords(records)`) e preencher
  `done/skipped/undone` via `composeDay`. Mantêm `completed`/`percent` exatamente como hoje → **zero
  regressão** em `calendar` e `MonthView`.
- **Charts (T1) leem `done/skipped/undone`** (o tripleto canônico). `completed` legado permanece para
  os consumidores congelados.
- `completedOn` **não é alterado** (segue usado por `daySummary`).
- O bug latente de §2.1 fica documentado como risco separado (não corrigido neste ciclo para não tocar
  superfícies congeladas).

Normalização de altura da barra: `maxScheduled = max(point.scheduled)` do período visível; altura total
do segmento composto = `scheduled / maxScheduled` (0 se `maxScheduled === 0`). Rotulo de `%` segue
`round(percent * 100)` (contrato atual preservado).

---

## 5. Proposta visual (2 alternativas)

### A) Segmentos empilhados verticalmente — **RECOMENDADA**

Cada barra é uma coluna vertical; de baixo para cima: **concluído → skipado → não concluído**. Altura
total = nº de hábitos agendados do dia (normalizado); cada segmento proporcional à sua contagem. Track
neutro (`surfaceElevated`) aparece apenas em dia sem agendados (stub).

- Alinha com o `track`/`fill` vertical atual do `WeeklyChart` (`justifyContent: 'flex-end'`) — menor diff.
- "Preencher de baixo" é o idioma mental já usado no app (progress ring/bar).
- Escala para o mês (barras finas): o empilhamento vertical funciona com largura pequena.
- Permite separador de 1px (cor do card) entre segmentos → **codificação não-só-cor** (§6.3).

### B) Barra única com 3 cores em sequência horizontal / estado por segmento

- Conflita com a leitura vertical das barras da semana; em barras finas (~5px) segmento horizontal vira ruído.
- **Descartada.**

**Recomendação: A.** Mesma linguagem nos 2 cards; unifica com a trilha existente.

Legenda (T2) — rodapé de **cada** card, 3 itens (`swatch` 10×10 + label curta): "Concluído",
"Skipado", "Não concluído". Componente único reutilizado (`ChartLegend`, §8).

---

## 6. Tokens de cor + validação

### 6.1 Novos tokens semânticos (`chartDone`, `chartSkip`, `chartUndone`)

Adicionar em `src/theme/colors.ts` (interface `ThemeColors` + `lightColors` + `darkColors`),
`src/theme/types.ts` (`ColorToken`) e `ALL_COLOR_TOKENS`.

| Token | light | dark | Papel |
|---|---|---|---|
| `chartDone` | `#4A6B3E` | `#EFCA93` | concluído (= `success`/`calendarDoneFill`) |
| `chartSkip` | `#A5763C` | `#DCBAAE` | skipado (= família `calendarSkipFill`/`skipFill`) |
| `chartUndone` | `#AD2F21` | `#C0795F` | não concluído (nova semântica de contagem) |

### 6.2 Contraste validado (WCAG, contra `surface` do card)

| Token | light vs `#EFE8D8` | dark vs `#5D312C` | ≥3:1? |
|---|---|---|---|
| `chartDone` | 4.97 | 6.98 | ✓ |
| `chartSkip` | 3.27 | 6.02 | ✓ |
| `chartUndone` | 5.37 | 3.16 | ✓ |

- Todos os 3 passam **≥3:1** (limiar de gráfico não-textual / WCAG 1.4.11) nos 2 temas.
- O "terracota escuro/marrom médio" literal do briefing (ex. `#AD2F21` no dark) dá **1.65:1** sobre a
  surface — **reprovado**; por isso o dark usa `#C0795F` (terracota médio, 3.16:1). No light o valor
  literal `#AD2F21` já passa (5.37) e é adotado.
- No dark os 3 tons são quentes e próximos em luminância (done/skip ≈ 1.16 de distância). Por isso a
  **codificação não-só-cor é obrigatória** (§6.3).

### 6.3 Acessibilidade / não-só-cor (§37)

- Separador de **1px** na cor do card entre segmentos (fronteira não-cromática).
- Legenda **textual** em cada card (T2).
- `accessibilityLabel` por barra: `"{dia}: {done} concluídos, {skipped} skipados, {undone} não concluídos ({pct}%)"`.
- Estados nunca só por cor (símbolo/legenda/posição + cor).
- *Hatch* diagonal no segmento "não concluído" exigiria `react-native-svg` (novo native module) — **fora
  do ciclo**; registrado como melhoria opcional (§11).

### 6.4 Motion

Sem animação obrigatória. Se houver crescimento animado das barras, **gated** por
`prefers-reduced-motion` (padrão já usado no app — §37 do SPEC).

---

## 7. T4 — herdar tokens do MonthView ou tokens próprios?

**Recomendação: tokens próprios (`chartDone`/`chartSkip`/`chartUndone`), ancorados na mesma família de
paleta do MonthView.**

Justificativa:

1. **Eixos semânticos diferentes.** `MonthView` é **day-level** (`conquered = TODOS os hábitos do dia
   vencidos`; `partial = ao menos um`) e **não possui estado `missed`** — "perdido" vira `neutral`.
   Os charts são **contagem por status** com 3 buckets fixos (`done/skipped/undone`). Não há mapeamento 1:1;
   reusar `calendarSkipFill` (que significa **partial**, não skip) seria semântica errada.
2. **`calendarMissedFill` não serve.** No dark é `#AD2F21` (1.65:1 sobre surface — reprovado); e o
   MonthView nem o usa como estado.
3. **Coerência visual sem acoplamento.** `chartDone` reusa o valor de `calendarDoneFill`/`success` e
   `chartSkip` a família de `calendarSkipFill`/`skipFill`; só `chartUndone` é novo. Mantém "o mesmo
   produto" (light/dark) sem sobrecarregar tokens day-level com semântica de contagem.
4. **Custódia.** Os valores vivem exclusivamente em `theme/colors.ts`; nenhum componente hardcoda hex.

---

## 8. Gaps por arquivo

| Arquivo | Mudança | Task |
|---|---|---|
| `src/domain/stats/aggregate.ts` | `DayComposition` + `composeDay` (puro); `weeklySeries`/`monthlySeries` preenchem `done/skipped/undone` via `indexRecords` 1×; `DayPoint` estendido (aditivo); `completed`/`percent`/`completedOn` inalterados | T1 |
| `src/domain/stats/aggregate.test.ts` | Casos: composição soma `scheduled`; skip bucket; undone = pending/missed/sem-record; dia vazio; hábito arquivado não conta | T1 |
| `src/theme/colors.ts` | +3 tokens (`chartDone/Skip/Undone`) em interface + light + dark | T3 |
| `src/theme/types.ts` | +3 entradas em `ColorToken` | T3 |
| `src/theme/colors.ts` (`ALL_COLOR_TOKENS`) | +3 entradas (invariante de teste do theme) | T3 |
| `src/theme/theme.test.ts` | Cobre `ALL_COLOR_TOKENS` × `ThemeColors`; validará os novos tokens automaticamente | T3 |
| `src/components/feature/dashboard/WeeklyChart.tsx` | Barras segmentadas (A), normalização por `maxScheduled`, separador 1px, `accessibilityLabel` composta, `<ChartLegend/>` no rodapé | T1+T2+T3 |
| `src/components/feature/dashboard/CompletionChart.tsx` | Idem, mantendo barras finas e `height 64`; `<ChartLegend/>` no rodapé | T1+T2+T3 |
| `src/components/feature/dashboard/ChartLegend.tsx` | **Novo** componente (3 itens swatch+label), reusado pelos 2 cards | T2 |
| `src/components/feature/dashboard.test.tsx` | Atualizar `WeeklyChart` (label agora composta); adicionar teste de `ChartLegend` e do segmento | T1+T2 |
| `src/app/statistics/index.tsx` | Nenhuma lógica nova (já passa `week`/`month`); consome charts atualizados | — |

Consumidores congelados preservados: `calendar/index.tsx` e `MonthView.tsx` continuam lendo
`completed`/`scheduled`/`percent` — **inalterados**.

---

## 9. Fases de implementação (ordem de dependência)

1. **F1 — Domínio (counts).** `composeDay` + `DayPoint` estendido + `weeklySeries`/`monthlySeries` +
   testes. Validar `npx jest src/domain/stats`.
2. **F2 — Weekly chart.** Segmentação vertical A no `WeeklyChart` + normalização + a11y. Atualizar
   `dashboard.test.tsx`.
3. **F3 — Monthly chart.** Mesma segmentação no `CompletionChart` (barras finas, `maxScheduled`).
4. **F4 — Legenda + padding.** `ChartLegend` + rodapé nos 2 cards (padding `spacing.lg` consistente,
   card cresce por `gap`, sem alturas hardcoded novas).
5. **F5 — Polish/verificação.** Não-só-cor (separadores, labels), reduced-motion, contraste light/dark,
   `npx tsc --noEmit` + `npx expo lint` + `npx jest` (243 baseline + novos).

---

## 10. Critérios de aceite

**Produto**
- [ ] Cada barra (semana e mês) mostra a composição concluído/skipado/não concluído, não só %.
- [ ] Os 2 cards usam **as mesmas 3 cores** de status (T3).
- [ ] Cada card tem legenda de 3 itens no rodapé; o card cresce de forma controlada e consistente (T2).
- [ ] Dia sem hábito agendado é barra neutra/trilha, fora da composição.
- [ ] Skip aparece com cor própria, sem semântica de falha.

**Técnica**
- [ ] Invariante `done + skipped + undone === scheduled` garantida por teste de domínio.
- [ ] Composição é derivada (zero schema/migration); `opens.ts §15.1` intocado.
- [ ] Tokens semânticos; **zero hex cru fora de `theme/`**; estados não-só-cor.
- [ ] `calendar/index.tsx` e `MonthView.tsx` sem mudança de comportamento.
- [ ] Baseline **243 testes** sem regressão + novos verdes; `tsc --noEmit` e lint verdes.

---

## 11. Registro de decisões / OPENs

Decisões fechadas (grilling / produto):

| # | Questão | Local de custódia | Decisão |
|---|---|---|---|
| c4.1 | Semântica dos 3 buckets | `aggregate.composeDay` | concluído / skipado / não concluído (pending+missed+sem-record) |
| c4.2 | Forma da barra | `WeeklyChart`/`CompletionChart` | Segmentos empilhados verticais (alternativa A) |
| c4.3 | Cores de status | `theme/colors.ts` | `chartDone`/`chartSkip`/`chartUndone`, validados ≥3:1, mesmos nos 2 cards |
| c4.4 | Legenda | `components/feature/dashboard/ChartLegend.tsx` | Rodapé de cada card, 3 itens swatch+label |
| c4.5 | T4 herança MonthView | spec (esta seção) | Tokens próprios, ancorados na família do MonthView |

Sem OPENs pendentes neste ciclo. As 2 questões abertas do discovery foram **fechadas no grilling**:

| # | Questão | Decisão (fechada) |
|---|---|---|
| c4-O1 | Distinguir `pending` (hoje) de `missed` (passado) na composição | **Bucket único "não concluído"** (`pending` + `missed` + sem-record). Pending de hoje conta como não concluído e pode virar concluído — o chart reflete o estado do dia no instante da leitura. |
| c4-O2 | Padrão/hatch diagonal no bucket "não concluído" (a11y extra) | **Sem hatch; `react-native-svg` fica fora do ciclo.** Distinção não-só-cor garantida por: separador de 1px entre segmentos (cor do card) + legenda textual com swatch + `accessibilityLabel` com contagens. |

---

## 12. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Mudar `DayPoint.completed` quebraria `calendar`/`MonthView` (superfícies c3) | Campos novos aditivos (`done/skipped/undone`); legado intocado |
| `completedOn` infla `completed` com records de hábito arquivado (§2.1) | Documentado como risco separado; não corrigido neste ciclo; charts usam `composeDay` (per-scheduled) |
| Três tons quentes do dark com pouca separação de luminância | Separador 1px + legenda textual + `accessibilityLabel` com contagens (não-só-cor) |
| Teste `dashboard.test.tsx:34-38` quebra com label nova | Atualização deliberada do contrato de a11y em T1 (não é regressão) |
| Legenda "inchando" o card de forma inconsistente | Padding `spacing.lg` + `gap: spacing.md` já existentes; nenhuma altura fixa nova |

---

## 13. Comandos de verificação (ao implementar)

```
npx tsc --noEmit
npx expo lint
npx jest            # baseline 243 / 40 suites + novos (aggregate/chart)
```

(Verificado no discovery: `Test Suites: 40 passed`, `Tests: 243 passed`.)
