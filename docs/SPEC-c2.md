# SPEC-c2 — HabitFlow · Refinamento fase B (T1–T6)

> Ciclo 2. Derivado de [`docs/SPEC.md`](SPEC.md) (ciclo 1, referência) e [`docs/SPEC_DRIVER.md`](SPEC_DRIVER.md)
> (fonte de verdade do produto). Autoridade das regras de streak/skip: driver §7 e §8.
>
> Este documento cobre **6 refinamentos** pedidos pelo Tito (T1–T6). É *spec only* — nenhuma
> implementação foi feita. Cada gap é citado com o caminho real do código auditado (v0.1.8).
>
> As decisões do ciclo 2 foram **fechadas no grilling de 04–05/10/2026** e estão registradas na seção
> [10. Registro de decisões](#10-registro-de-decisões-fechadas--grilling-tito-0405102026); a única
> pendência é a 10.7 (curadoria do texto das frases).

---

## 1. Escopo

### 1.1 Incluído

| # | Refinamento | Tipo |
|---|---|---|
| T1 | Streak individual visível na Home (por hábito, na lista de hoje) | UI + reuso de domínio |
| T2 | Streak geral (dias com todas as tarefas concluídas) + frase motivacional no topo da Home | **Domínio novo** + UI |
| T3 | Skip não quebra nenhum streak (individual e geral) — conformidade estrita + testes | Domínio + testes |
| T4 | Filtros na tela de Hábitos: por rotina, busca por nome, 3 ordenações | UI + domínio de ordenação |
| T5 | Remover visão Calendário de dentro de Estatísticas | UI (remoção) |
| T6 | Adicionar visão Mês em Estatísticas (layout modular) | UI nova |

### 1.2 Fora do escopo

- Alterar a regra de concessão de crédito semanal (permanece OPEN §15.1 do ciclo 1 / `src/config/opens.ts`).
- Alterar a tela/aba Calendário (`src/app/calendar/index.tsx`) — intocada (T5 só remove o bloco duplicado em Estatísticas).
- Alterar schema WatermelonDB / modelo de dados persistido (o ciclo 2 é leitura/derivação; nenhuma coluna nova é necessária).
- Reminders, notificações, EAS, build.
- Login/cloud/social (fora do MVP, driver §3.2).

---

## 2. Estado atual auditado (v0.1.8)

### 2.1 Domínio de streak — já existe e é a base das regras

`src/domain/streak/currentStreak.ts`:

- `computeStreaks(habit, records, now): StreakResult` → `{ current, best }` (linha 11).
- `currentStreak()` (linha 100) e `bestStreak()` (linha 104) são wrappers.
- `scanCurrent` (linha 29): percorre dias agendados de trás para frente; `completed` soma;
  `skipped` é **neutro** (linha 49–52); dia agendado sem record e que não é hoje → zera
  (linha 54–57); dia de hoje ainda pendente → para sem zerar (linha 51–53).
- `scanBest` (linha 67): mesma semântica, varre histórico, skip neutro (linha 88–89).
- Respeita `isScheduled` (frequência real, não assume diário) e `createdAt` como lower bound.

**Conclusão:** a regra individual do driver §7/§8 **já está implementada e testada**
(`src/domain/streak/currentStreak.test.ts:39` cobre skip-neutro; `:29` cobre missed-zera;
`bestStreak.test.ts` cobre melhor streak). T1 é **gap de UI**, T3 individual **já conforme**.

### 2.2 "Streak geral" atual NÃO é o que T2 pede

`src/domain/stats/aggregate.ts:40` `daySummary()` calcula:

```ts
for (const habit of active) {
  const c = currentStreak(habit, records, now);   // linha 52
  if (c > current) current = c;                    // linha 54
}
```

Ou seja, `overallCurrentStreak` = **maior streak individual** (max), consumido em
`src/app/index.tsx:31`, `src/app/statistics/index.tsx:48` e `StreakCard`.

T2 exige outro conceito: **streak de dias com TODAS as tarefas agendadas concluídas**
(dia "vencido"), com skip neutro. Isso **não existe** em nenhum módulo.

**Conclusão:** T2 = **gap de domínio (função nova)** + gap de UI. Ver §4.

### 2.3 Tela Home (`src/app/index.tsx`)

- Ordem atual: `TodayProgress` (linha 158) → lista agrupada por rotina (linha 167) → créditos (linha 206).
- Cada item da lista usa `HabitRow` (`src/components/feature/HabitRow.tsx`).
- `HabitRow` mostra ícone, nome, label de frequência e checkbox/skip. **Não mostra streak**
  (o componente `src/components/feature/HabitStreak.tsx` existe e é usado só em `HabitCard`).

**Conclusão:** T1 = gap de UI (reusar `HabitStreak` + `currentStreak`/`computeStreaks`).
T2 = bloco de header novo entre a saudação/título e a lista.

### 2.4 Tela Hábitos (`src/app/habits/index.tsx`)

- Abas Ativos/Arquivados via `MetricTabSelector` (linha 28).
- Lista renderizada na ordem de `habits` do provider (linha 22 → `habits.filter`), sem sort
  explícito — "ordem de inclusão" atual.
- **Sem campo de busca** (não há `TextInput`/search em nenhum ponto da tela).
- **Sem agrupamento por rotina** na lista (embora `groupHabitsByRoutine` exista em
  `src/domain/routine/group.ts:9` e seja usado na Home).
- Já calcula streak e completion rate por card (`computeStreaks`, `completionRate`, linhas 39–41).

**Conclusão:** T4 = gap de UI (search + seletor de ordenação + modo agrupado por rotina com subtítulo).
Domínio de agrupamento/ordenação já existe e é reutilizável.

### 2.5 Tela Estatísticas (`src/app/statistics/index.tsx`)

Renderiza, nesta ordem: `ProgressRing` (linha 37) → `StreakCard` (linha 48) → bloco de `Stat`
(linha 50) → `WeeklyChart` (linha 56) → `CompletionChart` (linha 57) → `ConsistencyCalendar`
(linha 58).

- `ConsistencyCalendar` (`src/components/feature/dashboard/ConsistencyCalendar.tsx`) é a
  **visão Calendário duplicada** que T5 manda remover da aba Estatísticas.
- `CompletionChart` já recebe a série mensal (`month`), título default "Progresso mensal"
  (linha 12) — é uma visão mensal em barras finas.
- A aba Calendário (`src/app/calendar/index.tsx`) é mais rica (navegação de mês, seleção de dia,
  detalhe por hábito) e **não será tocada**.

**Conclusão:** T5 = remoção de 1 import + 1 uso + (avaliar) o arquivo do componente.
T6 = novo componente de visão Mês no padrão da tela (ver §6).

### 2.6 Rotinas / Ajustes

- Configuração de rotinas vive em `src/app/routines/index.tsx` (+ `create.tsx`, `[id]/`), acessível
  por `src/app/settings/index.tsx:9` (`{ href: '/routines', label: 'Rotinas' }`).
- T4 **mantém** esse local e apenas adiciona filtro/categorização na tela de Hábitos.

### 2.7 Infra relevante

- `src/config/opens.ts` centraliza decisões OPEN (padrão a seguir no ciclo 2).
- `src/i18n/` está **vazio** — strings PT-BR estão inline nos componentes. O ciclo 2 segue o padrão
  vigente (inline); as "frases motivacionais" ficam em `src/config/motivationalPhrases.ts` (só o texto final é OPEN NOVA §10.7).
- Cores/estilos sempre via tokens (`useTheme().color(...)`) e `spacing`/`radius`.

---

## 3. Regras de negócio (T1–T3)

Autoridade: driver §7 (missed zera) e §8 (skip neutro, não soma, não quebra). Aplicadas em **dois níveis**.

### 3.1 Nível individual (por hábito) — já conforme

Para cada hábito, varrendo dias **agendados** (via `isScheduled`) de hoje para trás:

- `completed` → soma 1 e continua.
- `skipped` → **neutro**: não soma, não zera, continua.
- dia agendado sem record (passado) ou `missed` → **zera e para**.
- dia de hoje ainda pendente → **não soma, não zera** (para).
- dias não agendados são ignorados.
- `createdAt` é o limite inferior.

Zerado, a contagem **recomeça na próxima conclusão** (comportamento natural do scan).

### 3.2 Nível geral (dia "vencido") — NOVO

Definição de **dia vencido** (conquered day):

> Um dia é *vencido* quando tem **≥1 hábito agendado** e **todos** os hábitos agendados naquele dia
> estão `completed` **ou** `skipped`. Se houver qualquer `pending`/`missed`/sem-record em dia
> agendado passado, o dia **não** é vencido.

Streak geral atual: varre dias-calendário de hoje para trás:

- dia vencido → soma 1.
- dia com `skipped` no lugar de alguma conclusão, mas sem pendência/missed → **dia vencido** (skip neutro).
- dia sem nenhum hábito agendado → **neutro** (não soma, não zera; pula).
- dia de hoje ainda não 100% concluído → **não soma, não zera** (para, como no individual).
- dia agendado com pendência/missed em dia passado → **zera e para**.

Melhor streak geral: mesma definição varrendo todo o histórico.

### 3.3 Consistência com o núcleo do app

- Derivação pura, sem I/O, sem duplicar dado (§35 driver).
- Considera apenas hábitos ativos (`!archivedAt`) — mesma convenção de `aggregate.ts`.
- Nota de fidelidade histórica: hoje o app avalia "agendado" com a configuração **atual** do hábito
  (mesma aproximação já usada por `daySummary`/`weeklySeries`). O ciclo 2 mantém essa convenção;
  qualquer evolução para "frequência vigente no dia" é registrada como OPEN (ver §10.4).

---

## 4. Mudanças de domínio propostas

### 4.1 Novo módulo `src/domain/streak/overallStreak.ts`

```ts
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';

export interface OverallStreakResult {
  current: number;
  best: number;
}

export function computeOverallStreaks(
  habits: Habit[],
  records: HabitRecord[],
  now: Date,
): OverallStreakResult;
```

Função única (mesma disciplina de `currentStreak.ts`). Deve usar `isScheduled`, `addDays`,
`compareDateKeys`, `toDateKey`, `indexRecords` — sem reimplementar data/índice. Hedge de
`createdAt`: lower bound = menor `createdAt` entre os hábitos ativos (ou menor data de record),
espelhando `computeStreaks`.

### 4.2 Ajuste de `src/domain/stats/aggregate.ts`

`DaySummary` ganha dois campos derivados da nova função (mantendo o comportamento legado intacto):

```ts
interface DaySummary {
  // ...existente...
  overallCurrentStreak: number;   // LEGADO: max individual — preservar para não quebrar StreakCard
  overallBestStreak: number;      // LEGADO
  dayStreakCurrent: number;       // NOVO: streak de dias vencidos
  dayStreakBest: number;          // NOVO
}
```

- T2 consome `dayStreakCurrent` na Home.
- **DECIDIDO §10.5:** `StreakCard` de Estatísticas passa a exibir o **streak geral de dias vencidos**
  (`dayStreakCurrent`); o max individual legado **não** é exibido em Stats. O best individual por hábito
  permanece na tela de detalhe. Os campos legados `overallCurrentStreak`/`overallBestStreak` são
  preservados no `DaySummary` (consumidos por achievments/celebração) mas a `StreakCard` recebe os novos.
- `daySummary.test.ts` (`src/domain/stats/aggregate.test.ts`) precisa ganhar casos para os novos campos.

### 4.3 Nenhuma mudança de schema

`HabitRecord`/`Habit` já contêm tudo o que T1–T3 precisam. Zero migration.

---

## 5. Mudanças de UI — Home (T1, T2)

### 5.1 Bloco de header (T2) — DECIDIDO

Inserir **abaixo da saudação/título e acima da `TodayProgress`/lista**:

```
Hoje                         (título atual do AppScaffold)
────────────────────────────
🔥 5 dias seguidos            ← streak geral (dias vencidos)
"Um passo de cada vez."       ← frase motivacional (pequena, textSecondary)
— Sêneca                      ← atribuição do autor
────────────────────────────
[ TodayProgress ]
[ lista de hábitos do dia ]
```

- Novo componente `src/components/feature/HomeStreakHeader.tsx` (modular) recebendo
  `{ streak: number; phrase: { text: string; author: string } }`, permitindo reposicionamento futuro sem tocar na Home.
- Estilo: `surface`/`surfaceElevated`, `radius.card`, `fire` (accent) + número em
  `PlusJakartaSans_800ExtraBold`; frase em `Inter_400Regular`, `textSecondary`, 1 linha (`numberOfLines={1}`);
  atribuição em `textMuted`, 1 linha.
- Não dependente só de cor (ícone + número + rótulo textual).
- **Restrição dura de layout (mobile-first):** o header é compacto e **não empurra a lista para fora da primeira dobra** (§9 UX).

### 5.2 Frase motivacional (T2) — DECIDIDO (§10.1)

- Lista **LOCAL** de **50 frases curtas** em `src/config/motivationalPhrases.ts` (padrão `opens`), cada uma
  **com atribuição de autor**; foco em esforço como recompensa (ex.: David Goggins, Sêneca, Marco Aurélio,
  Naval Ravikant, Jim Rohn, Eric Thomas).
- Formato do item: `{ text: string; author: string }`.
- **FIXA POR DIA (determinística pela data):** a mesma frase vale o dia inteiro; a seleção é função pura da
  `dateKey` (índice = `hash(dateKey) % phrases.length`), **sem `Math.random()` em render**. A frase só muda
  quando o dia muda (reabrir a Home no mesmo dia não troca).
- Local/custódia: `src/config/motivationalPhrases.ts`; seleção na Home via helper puro
  (`phraseForDate(dateKey)`), testável.
- Deve sobreviver a `reduced-motion` (sem animação obrigatória).
- **OPEN §10.7 (NOVA):** curadoria do texto final das 50 frases (Tito detalha no setup inicial); a
  estrutura/local/rotatividade por dia já está fechada.

### 5.3 Streak individual por hábito nos cards (T1) — DECIDIDO

- Fonte: `computeStreaks(habit, records, now).current` (módulo `src/domain/streak` existente — **sem domínio novo**).
- Alvos: **Home** (`HabitRow`) e **tela Hábitos** (`HabitCard`, que já exibe streak).
- **Posição/formato:** recomendação do EXECUTOR conforme o espaço de cada card (ex.: linha secundária junto
  à frequência, ou extremidade direita). Reusar `HabitStreak` (`{days}`, ícone `fire` + valor).
- **Restrição dura:** o card **NÃO cresce de altura** ao adicionar o streak (aditivo dentro da altura atual;
  `numberOfLines` onde couber).
- Acessibilidade: exibição **ícone + valor** (não-só-cor); label "sequência de N dias" (o `HabitStreak` já é textual).

---

## 6. Mudanças de UI — Hábitos (T4)

### 6.1 Busca

- `TextInput` controlado no topo (após o `MetricTabSelector`).
- Filtro **client-side**, case-insensitive e accent-insensitive, por `habit.name`.
- Busca aplica-se tanto a Ativos quanto a Arquivados (respeitando a aba).
- Empty state específico para "nenhum resultado" (novo `EmptyKind` ou reuso com mensagem).

### 6.2 Ordenações (seletor de 3 modos)

| Modo | Rótulo | Comportamento |
|---|---|---|
| `added` | "Adicionados" | Ordem de inclusão (padrão atual) |
| `routine` | "Por rotina" | Agrupa por rotina com **subtítulo do grupo** (ex.: "Espiritual"); hábitos sem rotina no fim, sob "Sem rotina" |
| `alpha` | "A–Z" | Ordem alfabética por `name` (`localeCompare` pt-BR) |

- Reutilizar `groupHabitsByRoutine` (`src/domain/routine/group.ts:9`) para o modo `routine`.
- Subtítulo do grupo no mesmo estilo dos subtítulos da Home (`textMuted`, uppercase, 12px).
- Default **antes da 1ª troca**: `added` + aba "Ativos" (§10.2, DECIDIDO).
- Persistência: a última ordem + o último filtro de rotina são **PERSISTIDOS** em `prefs` (§10.2/§10.6, DECIDIDO).

### 6.3 Filtro por rotina

- Chips/`Select` de rotina acima/abaixo da busca (derivado de `routines`).
- Opção "Todas" + cada rotina + "Sem rotina".
- Coexiste com busca e com o modo de ordenação.

### 6.4 Domínio

Se a ordenação/busca precisar de teste unitário, isolar em
`src/domain/habit/sortHabits.ts` (função pura: `sortHabits(habits, mode, locale)`), seguindo o padrão
`domain/` puro. Filtro de busca pode ser função pura `filterHabitsByName(habits, query)`.

---

## 7. Mudanças de UI — Estatísticas (T5, T6)

### 7.1 Remover Calendário (T5) — DECIDIDO

Em `src/app/statistics/index.tsx`: remover o import de `ConsistencyCalendar` e o seu uso
(`<ConsistencyCalendar ...>`), além dos imports/expressões exclusivos dele — `monthKey`/`todayKey`
(importados só para ele). Manter `month` (`monthlySeries`), que continua consumido por `CompletionChart`.
Manter a aba `src/app/calendar/index.tsx` **intacta**.
**ConsistencyCalendar.tsx: REMOVER o componente e todos os imports — nada de arquivo órfão** (§10.3 fechado).

### 7.2 Nova visão Mês (T6) — DECIDIDO (§10.3)

- Novo componente modular em `src/components/feature/dashboard/MonthView.tsx`, no padrão
  `CompletionChart`/`WeeklyChart` (card `surface` + borda + título uppercase `textMuted`).
- Fonte de dados: `monthlySeries(habits, records, now)` (`src/domain/stats/aggregate.ts`) para o estado
  por dia, + `computeOverallStreaks(...)` (`src/domain/streak/overallStreak.ts`) para a headline.
- Conteúdo do card (3 blocos):
  1. **Headline do streak geral** (dias vencidos, `current`) — mesmo número/definição da `StreakCard` (§3.2).
  2. **Heatmap do mês** — grade via `buildMonthGrid` (`src/domain/date/monthGrid.ts`, já existe); estado por
     dia: **vencido** (todos os agendados completed/skipped) `✓` / **parcial** (algum progresso) `◐` /
     **neutro** (sem agendados ou sem dados) `○`. Legenda **não-só-cor** (símbolo + label).
  3. **Resumo** — dias vencidos no mês + taxa do mês (`completed/scheduled` no mês).
- Reuso: `buildMonthGrid` (grid) e `overallStreak` (headline); nenhuma regra nova fora do domínio puro.

---

## 8. Fases de implementação sugeridas (ordem de dependência)

1. **F1 — Núcleo de streak geral (T2/T3, domínio primeiro).**
   `overallStreak.ts` + campos novos em `DaySummary` + testes (3 cenários de T3: all-done,
   all-done-except-skip, missed). Sem UI.
2. **F2 — Home header (T1/T2, UI).**
   `HomeStreakHeader` + `motivationalPhrases` + fiação de `dayStreakCurrent`; streak individual no `HabitRow`.
3. **F3 — Hábitos (T4).**
   Busca + seletor de ordenação + filtro por rotina + agrupamento com subtítulo (+ testes de domínio se houver).
4. **F4 — Estatísticas (T5/T6).**
   Remover `ConsistencyCalendar`; adicionar `MonthView`.
5. **F5 — Polish.**
   Acessibilidade (labels, não-cor-only), reduzir motion, contraste light/dark, revisão de empty states.

Cada fase termina com `npx tsc --noEmit`, `npx expo lint` e `bun test`/`npx jest` do domínio afetado.

---

## 9. Critérios de qualidade (driver §45)

**Produto**

- [ ] Cada hábito da Home mostra seu streak atual, coerente com a frequência programada.
- [ ] Home mostra streak geral (dias 100% vencidos) + frase motivacional no topo, antes da lista.
- [ ] Missed zera (individual e geral); skip **nunca** quebra nenhum dos dois; skip não soma.
- [ ] Hábitos filtráveis por rotina, buscáveis por nome e ordenáveis (added/rotina/A–Z).
- [ ] Estatísticas sem a visão Calendário duplicada; aba Calendário intacta.
- [ ] Estatísticas com visão Mês funcional e modular.

**Técnica**

- [ ] Regras de streak geral em **função única** (`overallStreak.ts`), sem lógica espalhada.
- [ ] Skip-neutro coberto por testes nos 2 níveis (individual já existe; geral novo).
- [ ] Tokens semânticos, zero hex solto; estados não dependentes só de cor.
- [ ] Sem migration/schema novo; histórico append-only preservado.
- [ ] `tsc --noEmit` + lint + testes verdes.

**UX**

- [ ] Header da Home não empurra a lista para fora da primeira dobra no mobile.
- [ ] Busca/filtros não escondem o botão de adicionar hábito.
- [ ] `prefers-reduced-motion` respeitado (sem animação obrigatória no header).

---

## 10. Registro de decisões (fechadas — grilling Tito, 04–05/10/2026)

As questões 10.1–10.6 do ciclo 2 foram **fechadas**; a tabela abaixo é a decisão vigente. As decisões
mudam **só no arquivo indicado** (custódia). Regras OPEN remanescentes do ciclo 1 (`opens.ts` §15.1 etc.)
**permanecem intocadas**.

| # | Questão | Local de custódia | DECISÃO FECHADA |
|---|---|---|---|
| 10.1 | Frase motivacional: fonte e rotatividade | `src/config/motivationalPhrases.ts` + `phraseForDate` | Lista **LOCAL** de **50 frases** com **atribuição** (`{text, author}`), estilo esforço-como-recompensa (Goggins, Sêneca, Marco Aurélio, Naval, Jim Rohn, Eric Thomas). **FIXA POR DIA** (determinística pela `dateKey`, sem `Math.random()` em render). Conteúdo final das 50 = **OPEN NOVA §10.7**. |
| 10.2 | Filtro/ordenação padrão na tela Hábitos | `src/app/habits/index.tsx` + `src/services/prefs.ts` | Default **antes da 1ª troca**: ordem de **inclusão** (`added`) + filtro **"Ativos"**. Após troca, **PERSISTIR** a última escolha (ordem + filtro de rotina) em `prefs`. |
| 10.3 | Visão Mês: métricas exatas; destino de `ConsistencyCalendar` | `src/components/feature/dashboard/MonthView.tsx` | Card com **(a) headline do streak geral** (dias vencidos) + **(b) heatmap do mês** (vencido/parcial/neutro, legenda não-só-cor) + **(c) resumo** (dias vencidos no mês + taxa do mês). Dados: `monthlySeries` + `computeOverallStreaks`. `ConsistencyCalendar.tsx`: **REMOVER** (componente + imports), sem arquivo órfão. Aba Calendário intacta. |
| 10.4 | Streak usa frequência **vigente no dia** vs config atual | `src/domain/streak/*` | **Manter a frequência VIGENTE** (config atual do hábito), igual `aggregate`. "Frequência vigente no dia" fica explicitamente **OFF-FUTURE** (não implementar no ciclo 2). |
| 10.5 | `StreakCard` de Estatísticas: max individual vs streak de dias vencidos | `src/app/statistics/index.tsx` + `StreakCard` | `StreakCard` passa a exibir o **streak GERAL (dias vencidos, `current`)**. Stats **NÃO** mostra max individual. Best individual de cada hábito fica na **tela de detalhe** (`HabitDetail`, `bestStreak` já presente — garantir visível). |
| 10.6 | Persistência de filtros/ordenação entre sessões | `src/services/prefs.ts` | **PERSISTIR** (mesma decisão de 10.2): última ordem + último filtro de rotina sobrevivem ao restart. |

**OPEN NOVA (marcada como tal):**

| # | Questão | Local | Estado |
|---|---|---|---|
| 10.7 | Conteúdo/curadoria das 50 frases motivacionais (texto + autoria final) | `src/config/motivationalPhrases.ts` | OPEN NOVA — Tito detalha no setup inicial. Estrutura/formato/rotatividade por dia já fechados em 10.1. |

**Regra de custódia:** decisões fechadas mudam só no arquivo indicado; nenhum outro módulo lê a regra.

---

## 11. Rastreabilidade demanda → gap → local

| Task | Pedido | Existe hoje | Gap | Local de mudança |
|---|---|---|---|---|
| T1 | Streak por hábito na Home | `currentStreak`/`computeStreaks` prontos; `HabitStreak` pronto | UI: `HabitRow` não recebe/renderiza streak | `src/app/index.tsx`, `src/components/feature/HabitRow.tsx` |
| T2 | Streak geral + frase no topo | `overallCurrentStreak` = **max individual** (não é streak de dias vencidos); sem frase | **Domínio novo** + UI header + lista de frases | `src/domain/streak/overallStreak.ts` (novo), `src/domain/stats/aggregate.ts`, `src/components/feature/HomeStreakHeader.tsx` (novo), `src/config/motivationalPhrases.ts` (novo) |
| T3 | Skip neutro nos 2 níveis | Individual conforme + testado (`currentStreak.test.ts:39`) | Geral não existe → sem cobertura | `src/domain/streak/overallStreak.ts` + `.test.ts` (novo) |
| T4 | Filtros/busca/ordenação | Só abas Ativos/Arquivados; `groupHabitsByRoutine` existe | Sem busca, sem sort, sem filtro de rotina | `src/app/habits/index.tsx`, `src/domain/habit/sortHabits.ts` (novo, opcional), `src/components/feature/…` |
| T5 | Remover Calendário de Estatísticas | `ConsistencyCalendar` na linha 58 | Duplicação | `src/app/statistics/index.tsx` |
| T6 | Adicionar visão Mês | `monthlySeries` existe; `CompletionChart` já é mensal em barras | Sem componente "Mês" dedicado e modular | `src/components/feature/dashboard/MonthView.tsx` (novo), `src/app/statistics/index.tsx` |

---

## 12. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| "Streak geral" ambíguo (max individual vs dias vencidos) | Spec fixa a definição de *dia vencido* (§3.2); `overallStreak.ts` é função única testável |
| Regressão em `daySummary` (consumido por Home + Estatísticas + achievements) | Campos legados preservados; novos campos aditivos; testes existentes mantidos |
| Header da Home empurra a lista (mobile-first) | Componente compacto, 1 linha de frase, `numberOfLines`; validar na primeira dobra |
| `ConsistencyCalendar` órfão | **DECIDIDO §10.3:** remover o componente + todos os imports (sem órfão); grep de referências no aceite |
| Duplicar regra de streak | Proibido: `overallStreak` reusa `isScheduled`/date/index utilities; nenhuma regra nova fora do módulo |

---

## 13. Artefatos e comandos de verificação

- Artefato desta missão: `docs/SPEC-c2.md` (este documento).
- Nada de código alterado no ciclo de discovery.
- Verificação futura (ao implementar): `npx tsc --noEmit`, `npx expo lint`,
  `npx jest src/domain/streak src/domain/stats` (ou runner do projeto).
