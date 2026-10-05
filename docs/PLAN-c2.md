# PLAN-c2 — HabitFlow · Plano de implementação TDD (ciclo 2, refinamentos fase B)

> Derivado de [`docs/SPEC-c2.md`](SPEC-c2.md) (contrato do ciclo 2, decisões fechadas no grilling
> Tito 04–05/10/2026) e [`docs/SPEC.md`](SPEC.md) (ciclo 1) + [`docs/SPEC_DRIVER.md`](SPEC_DRIVER.md)
> §44 (ordem) / §45 (qualidade).
>
> Este plano cobre os 6 refinamentos T1–T6 do SPEC-c2 em **5 fases (F1–F5)** e **17 tasks atômicas
> `C1..C17`**. É *plan only* — **nenhum código** foi alterado.
>
> Baseline de regressão: **171 testes / 31 suites verdes** (medido em 05/10/2026). Nenhum teste
> existente pode quebrar.

---

## 1. Como usar este plano

- Fases F1–F5 = §8 do SPEC-c2: `F1 domínio → F2 Home → F3 Hábitos → F4 Estatísticas → F5 polish`.
- Tasks TDD atômicas `C1..C17`, executar em ordem de `id` respeitando `Dependências`.
- RED → GREEN → REFACTOR. **Escrever o teste que falha primeiro**, implementar, refatorar.
- `src/domain/` é 100% puro: **sem I/O, sem RN/Expo/banco, sem `new Date()` interno** — `now` é sempre
  argumento. Quem injeta `now` é o caller (tela/hook).
- **Nunca** duplicar regra de negócio na UI. A UI chama as funções de domínio.
- Decisões fechadas mudam só no arquivo de custódia (`SPEC-c2 §10`).

### Comandos de verificação (valem para toda task)

| Verificação | Comando |
|---|---|
| Testes (por regex) | `npm test -- <regex>` (ex.: `npm test -- overallstreak`) |
| Suite completa (regressão 171) | `npm test` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| App dev | `npm start` |
| Web (resposta UI) | `npm run web` |
| Build estático web | `npx expo export --platform web` |

**Cada task, ao terminar, exige `npx tsc --noEmit` e `npm run lint` limpos + o teste citado verde.**
Ao fechar cada fase: `npm test` integral (sem regressão dos 171).

### Baseline de regressão (não pode regredir)

- `src/domain/stats/aggregate.test.ts` (daySummary/weekly/monthly/totals)
- `src/domain/stats/achievements.test.ts`, `earnedAchievements.test.ts`
- `src/domain/streak/currentStreak.test.ts`, `bestStreak.test.ts`
- `src/components/feature/HabitRow.test.tsx`, `dashboard.test.tsx`
- `src/data/__tests__/repository*.test.ts`, `integration.test.ts`
- restantes 31 suites / 171 testes.

---

## 2. DoD — Definition of Done GLOBAL (SPEC-c2 §9 / driver §45)

**Produto**

- [ ] Cada hábito da Home e da tela Hábitos mostra seu streak atual (coerente com a frequência).
- [ ] Home mostra streak **geral (dias vencidos)** + **frase motivacional fixa do dia** no topo, antes da lista.
- [ ] `missed` zera nos 2 níveis; **skip NUNCA quebra** nenhum dos dois; skip **não soma**.
- [ ] Hábitos filtráveis por rotina, buscáveis por nome e ordenáveis (added / rotina / A–Z), com persistência.
- [ ] Estatísticas **sem** a visão Calendário duplicada; `ConsistencyCalendar.tsx` removido; aba Calendário intacta.
- [ ] Estatísticas com **visão Mês** funcional e modular (headline + heatmap + resumo).

**Técnica**

- [ ] Regra de streak geral em **função única** (`src/domain/streak/overallStreak.ts`), sem lógica espalhada.
- [ ] Skip-neutro coberto por testes nos 2 níveis (individual já existe; **geral novo**).
- [ ] Campos novos do `DaySummary` **sempre aditivos** — legado preservado (achievements/celebração intactos).
- [ ] `opens.ts` §15.1 (grant de crédito semanal) **intocado**.
- [ ] Tokens semânticos, zero hex solto; estados **não dependentes só de cor**.
- [ ] Sem migration/schema novo; histórico append-only preservado.
- [ ] `npm test` (171 + novos) + `npx tsc --noEmit` + `npm run lint` verdes.

**UX**

- [ ] Header da Home **não empurra a lista** para fora da primeira dobra (componente compacto, `numberOfLines`).
- [ ] Busca/filtros **não escondem** o botão de adicionar hábito.
- [ ] `prefers-reduced-motion` respeitado (sem animação obrigatória no header).

### Critério de saída do RUG (State 2 → ship)

- `npm test` **100% verde** (171 baseline + testes novos deste plano).
- `npx tsc --noEmit` e `npm run lint` **limpos**.
- `npm run web` renderiza Home (header + streak) e Estatísticas (Mês, sem Calendário) em mobile e desktop.
- APK/IPA só se o Tito pedir (fora do MVP; SPEC §3).
- Releases no fluxo padrão do projeto: bump `version` + `versionCode` (`vc10+`) e tag `v0.1.9-mvp`
  (segue `v0.1.0..v0.1.8`; último commit retheme ≥ vc9).

---

## 3. Central de decisões fechadas (custódia) — SPEC-c2 §10

Nenhuma das linhas abaixo é OPEN. Trocar depois = editar **só** o arquivo indicado (+ teste do caller).

| Ref | Decisão | Arquivo único (custódia) |
|---|---|---|
| 10.1 | 50 frases locais `{text, author}`, **fixa por dia** (determinística por `dateKey`) | `src/config/motivationalPhrases.ts` |
| 10.2 | Default ordem **inclusão** + filtro **Ativos**; após trocar, **persistir** | `src/app/habits/index.tsx` + `src/services/prefs.ts` |
| 10.3 | Mês = headline streak geral + heatmap (vencido/parcial/neutro) + resumo; `ConsistencyCalendar` **removido** | `src/components/feature/dashboard/MonthView.tsx` |
| 10.4 | Streak usa frequência **vigente** (config atual); "vigente-no-dia" **OFF-FUTURE** | `src/domain/streak/*` |
| 10.5 | `StreakCard` exibe **streak geral (dias vencidos)**; best individual fica no **HabitDetail** | `src/app/statistics/index.tsx` |
| 10.6 | Filtros/ordenação **persistidos** entre sessões | `src/services/prefs.ts` |
| 10.7 | **OPEN NOVA** — curadoria do texto final das 50 frases (Tito no setup inicial) | `src/config/motivationalPhrases.ts` |

**Regra dura:** `src/config/opens.ts` §15.1 (grant semanal) **não é tocado** neste ciclo.

---

# FASE F1 — Núcleo de streak geral (domínio primeiro, T2/T3)

> **Regra de ouro:** domínio 100% puro e testado ANTES de qualquer UI. Sem UI em F1.
> Autoridade das regras: SPEC-c2 §3.2 (dia vencido) e §10.4 (frequência vigente).

**Gate da fase:** `npm test -- overallstreak` verde; `npm test` sem regressão; `tsc` + `lint` limpos.

### C1 — `overallStreak.ts`: `computeOverallStreaks` + `isConqueredDay` (RED-GREEN)

- **Dependências:** — (usa `isScheduled`, dateUtils, `indexRecords` existentes)
- **Fazer:** novo `src/domain/streak/overallStreak.ts` (função única; **não** reimplementa data/índice):
  ```ts
  export interface OverallStreakResult { current: number; best: number; }

  // Dia vencido (SPEC-c2 §3.2): ≥1 hábito agendado e TODOS os agendados completed OU skipped.
  // Qualquer pending/missed/sem-record em dia agendado passado ⇒ não vencido.
  export function isConqueredDay(habits: Habit[], records: HabitRecord[], dateKey: string): boolean;

  export function computeOverallStreaks(
    habits: Habit[], records: HabitRecord[], now: Date,
  ): OverallStreakResult;
  ```
  Regras do scan (hoje → trás, espelhando `scanCurrent`/`scanBest`):
  - **Dia vencido** → soma 1.
  - **Skip neutro:** dia com skip no lugar de alguma conclusão, sem pendência/missed → **vencido**.
  - **Dia sem nenhum agendado** → **neutro** (pula; não soma, não zera).
  - **Dia de hoje ainda não 100%** → **não soma, não zera** (para).
  - **Dia agendado passado com pendência/missed** → **zera e para**.
  - Apenas hábitos **ativos** (`!archivedAt`); `createdAt` como lower bound (menor `createdAt` entre
    ativos, ou menor data de record) — mesma disciplina de `computeStreaks`.
  - `best` = maior corrida varrendo todo o histórico (mesma definição).
- **Arquivos:** `src/domain/streak/overallStreak.ts`, `src/domain/streak/overallStreak.test.ts`.
- **Testes de referência (RED primeiro):**
  - `T3: all-done` — 3 dias seguidos todos completed ⇒ `current = 3`.
  - `T3: all-done-except-skip` — dia com 1 completed + 1 skipped (todos agendados cobertos) ⇒ soma.
  - `T3: missed` — dia agendado sem record ou `missed` ⇒ zera (current para no dia anterior).
  - `dia sem agendados` no meio do histórico ⇒ neutro (não quebra, não soma).
  - `hoje pending` ⇒ não soma, não zera.
  - `createdAt` descarta dias anteriores ao 1º hábito.
  - `best` com corrida histórica maior que a atual.
- **Verificar:** `npm test -- overallstreak`; `npx tsc --noEmit`; `npm run lint`.
- **Aceite:** regra (pura, sem I/O) em **função única**; skip neutro e missed-zera cobertos por teste.

### C2 — `monthDayStatus`: estado do heatmap do mês (domínio puro)

- **Dependências:** C1
- **Fazer:** adicionar a `src/domain/streak/overallStreak.ts`:
  ```ts
  export type MonthDayState = 'conquered' | 'partial' | 'neutral';
  export function monthDayStatus(
    habits: Habit[], records: HabitRecord[], now: Date,
  ): { dateKey: string; state: MonthDayState }[];
  ```
  Derivação por dia do mês corrente (via `buildMonthGrid`/`monthlySeries` ou varredura de dias):
  - sem hábito agendado → `neutral`;
  - `isConqueredDay(...)` (C1) → `conquered`;
  - algum progresso (`completed > 0`) mas não vencido → `partial`;
  - caso contrário (pendência/missed/sem record em dia agendado) → `neutral`.
  - Usa `isConqueredDay` — **nenhuma regra nova** de "vencido".
- **Arquivos:** `src/domain/streak/overallStreak.ts`, `src/domain/streak/overallStreak.test.ts`.
- **Verificar:** `npm test -- overallstreak` (casos: vencido/parcial/neutro por dia).
- **Aceite:** MonthView vira componente "burro"; o critério de vencido vem do domínio único.

### C3 — `DaySummary` aditivo + fiação em `aggregate.ts` (legado preservado)

- **Dependências:** C1
- **Fazer:** em `src/domain/stats/aggregate.ts`:
  - `DaySummary` ganha **campos novos aditivos**:
    ```ts
    dayStreakCurrent: number; // = computeOverallStreaks(...).current
    dayStreakBest: number;    // = computeOverallStreaks(...).best
    ```
  - **Manter** `overallCurrentStreak`/`overallBestStreak` (max individual legado) **intactos** — são
    consumidos por `buildDerivedStats` (`src/app/index.tsx`) → achievements/celebração.
  - `daySummary` calcula os 4 campos (2 legados + 2 novos).
- **Arquivos:** `src/domain/stats/aggregate.ts`, `src/domain/stats/aggregate.test.ts`.
- **Testes de referência:** preservar os casos existentes; **adicionar**:
  - `dayStreakCurrent` soma dias vencidos; skip neutro; missed zera.
  - `overallCurrentStreak` continua = maior streak individual (legado não muda).
- **Verificar:** `npm test -- aggregate`; `npm test` (regressão 171); `tsc`; `lint`.
- **Aceite:** campos aditivos, zero quebra de consumer; arquivos de achievements/celebração **não alterados**.

**— Fim FASE F1 —**

---

# FASE F2 — Home (T1/T2: header streak geral + frase + streak por hábito)

**Gate da fase:** Home renderiza header (streak geral + frase do dia) acima de `TodayProgress`, sem
empurrar a lista; `HabitRow` mostra streak sem crescer de altura; `tsc`/`lint`/testes limpos.

### C4 — `motivationalPhrases.ts` (50 frases) + `phraseForDate` determinística (RED-GREEN)

- **Dependências:** —
- **Fazer:** novo `src/config/motivationalPhrases.ts` (padrão custódia de `opens.ts`):
  ```ts
  export interface MotivationalPhrase { text: string; author: string; }
  export const MOTIVATIONAL_PHRASES: MotivationalPhrase[]; // 50 itens {text, author}
  export function phraseForDate(dateKey: string): MotivationalPhrase; // determinística
  ```
  - 50 frases curtas PT-BR com **atribuição** (esforço-como-recompensa): Goggins, Sêneca, Marco Aurélio,
    Naval Ravikant, Jim Rohn, Eric Thomas (e afins). Conteúdo exato = **OPEN NOVA §10.7** (curadoria
    do Tito), mas a lista precisa existir com 50 itens.
  - `phraseForDate` = hash **puro** da `dateKey` (ex.: soma de char codes) `% MOTIVATIONAL_PHRASES.length`;
    **sem `Math.random()`**. Mesmo `dateKey` ⇒ mesma frase.
- **Arquivos:** `src/config/motivationalPhrases.ts`, `src/config/motivationalPhrases.test.ts`.
- **Testes de referência (RED):**
  - `MOTIVATIONAL_PHRASES.length === 50`; todo item tem `text` e `author` não-vazios.
  - `phraseForDate('2026-05-06')` é **estável** entre chamadas e dentro do mesmo dia.
  - dias diferentes tendem a variar (ao menos 2 chaves distintas retornam índice válido).
- **Verificar:** `npm test -- motivational`; `tsc`; `lint`.
- **Aceite:** frase fixa por dia; nenhum acesso a `Date`/`Math.random` dentro de `phraseForDate`.

### C5 — `HomeStreakHeader` (componente modular, não-só-cor)

- **Dependências:** C4
- **Fazer:** novo `src/components/feature/HomeStreakHeader.tsx` no padrão dos cards do dashboard:
  - Props `{ streak: number; phrase: MotivationalPhrase }`.
  - Card `surface` + `border`, `radius.card`; ícone `fire` (`accent`) + número `PlusJakartaSans_800ExtraBold`
    + rótulo textual ("dias seguidos" / "N dias seguidos"); frase em `Inter_400Regular` `textSecondary`
    com `numberOfLines={1}`; atribuição em `textMuted`, `numberOfLines={1}`.
  - **Restrição dura:** uma linha de frase + atribuição; sem animação obrigatória (reduced-motion safe).
  - `accessibilityLabel` no container (streak + frase), estado **não-só-cor**.
- **Arquivos:** `src/components/feature/HomeStreakHeader.tsx` + `src/components/feature/HomeStreakHeader.test.tsx`.
- **Testes de referência:** renderiza número do streak, texto da frase e autor; `getByText`.
- **Verificar:** `npm test -- homestreakheader`; `tsc`; `lint`.
- **Aceite:** componente isolado, reposicionável sem tocar a Home; compacto.

### C6 — `HabitRow` com streak opcional (card NÃO cresce)

- **Dependências:** C1
- **Fazer:** `src/components/feature/HabitRow.tsx`:
  - Nova prop opcional `streak?: number`.
  - Renderiza `<HabitStreak days={streak} />` **dentro da linha de frequência/subtítulo** (posição
    recomendada pelo executor conforme espaço), mantendo a altura atual do card.
  - `HabitStreak` já é ícone+valor (não-só-cor) e retorna `null` quando `days <= 0`.
- **Arquivos:** `src/components/feature/HabitRow.tsx`, `src/components/feature/HabitRow.test.tsx`.
- **Testes de referência (RED):** com `streak={5}` o texto `5 dias` aparece; sem `streak` (ou `0`) some.
- **Verificar:** `npm test -- habitrow`; `npm test` (regressão); `tsc`; `lint`.
- **Aceite:** streak visível sem aumentar a altura do row; testes existentes do HabitRow continuam verdes.

### C7 — Fiação na Home (`src/app/index.tsx`)

- **Dependências:** C3, C4, C5, C6
- **Fazer:** em `src/app/index.tsx` (Today):
  - Inserir `<HomeStreakHeader streak={summary.dayStreakCurrent} phrase={phraseForDate(today)} />`
    **após o `AppScaffold`/título e antes de `TodayProgress`** (SPEC-c2 §5.1).
  - Calcular `summary = daySummary(active, records, new Date())` no render (ou reusar o já existente).
  - Passar `streak={computeStreaks(habit, recordsOf(habit.id), now).current}` ao `HabitRow`.
  - Não alterar a lógica de skip/celebração existente.
- **Arquivos:** `src/app/index.tsx`.
- **Verificar:** `npx tsc --noEmit`; `npm run lint`; `npm run web` (header acima da lista, na 1ª dobra).
- **Aceite:** header + streak por hábito visíveis; lista não é empurrada para fora do primeiro scroll.

**— Fim FASE F2 —**

---

# FASE F3 — Hábitos (T4: busca, ordenação, filtro por rotina, persistência)

**Gate da fase:** tela Hábitos com busca, seletor de 3 ordenações, filtro por rotina, agrupamento com
subtítulo e empty state de "sem resultado"; preferências persistem no restart; `tsc`/`lint`/testes limpos.

### C8 — Domínio: `sortHabits` + `filterHabitsByName` (puro, RED-GREEN)

- **Dependências:** — (usa `groupHabitsByRoutine` existente)
- **Fazer:** novo `src/domain/habit/sortHabits.ts` (puro):
  ```ts
  export type HabitSortMode = 'added' | 'routine' | 'alpha';
  export function sortHabits(habits: Habit[], mode: HabitSortMode, locale = 'pt-BR'): Habit[];
  export function filterHabitsByName(habits: Habit[], query: string): Habit[];
  ```
  - `added` → ordem de inclusão (ordem recebida estável).
  - `alpha` → `name.localeCompare(other.name, locale)`.
  - `routine` → reusa `groupHabitsByRoutine`; hábitos sem rotina no **fim** ("Sem rotina").
  - `filterHabitsByName` → case-insensitive e **accent-insensitive**
    (`normalize('NFD').replace(/\p{Diacritic}/gu, '')`); query vazia ⇒ todos.
- **Arquivos:** `src/domain/habit/sortHabits.ts`, `src/domain/habit/sortHabits.test.ts`.
- **Testes de referência (RED):** alpha ordena A–Z; `added` preserva; `routine` agrupa (sem rotina no fim);
  busca “leitura” acha “Leitura”, “água” acha “Agua”, case/accent-insensitive; query vazia = todos.
- **Verificar:** `npm test -- sorthabits`; `tsc`; `lint`.
- **Aceite:** regra de ordenação/busca em funções puras testáveis.

### C9 — Prefs: persistir ordem + filtro de rotina (RED-GREEN)

- **Dependências:** C8
- **Fazer:** `src/services/prefs.ts` — nova superfície persistida (coexiste com as chaves atuais):
  ```ts
  export interface HabitsViewPrefs { mode: HabitSortMode; routineFilter: string | null; }
  export async function getHabitsViewPrefs(): Promise<HabitsViewPrefs | null>;
  export async function setHabitsViewPrefs(prefs: HabitsViewPrefs): Promise<void>;
  ```
  - Chave nova `habitflow:prefs:habitsView`; **default antes da 1ª troca** = `{ mode: 'added', routineFilter: null }`
    (SPEC-c2 §10.2/§10.6) — a *tela* aplica o default quando `get` retorna `null`.
- **Arquivos:** `src/services/prefs.ts`, `src/services/prefs.test.ts`.
- **Testes de referência (RED):** roundtrip get/set; `null` quando nunca salvo; `JSON` inválido ⇒ `null`.
- **Verificar:** `npm test -- prefs`; `tsc`; `lint`.
- **Aceite:** última escolha sobrevive ao restart; leitura resiliente.

### C10 — `EmptyState`: novo kind `no-results`

- **Dependências:** —
- **Fazer:** `src/components/feature/EmptyState.tsx` — adicionar `'no-results'` ao `EmptyKind` + COPY
  (emoji + título "Nenhum hábito encontrado" + body orientando limpar busca/filtros).
- **Arquivos:** `src/components/feature/EmptyState.tsx` (+ teste se houver; caso contrário validar via C11).
- **Verificar:** `npx tsc --noEmit`; `npm run lint`; `npm test` (regressão).
- **Aceite:** busca sem resultado tem mensagem própria (sem esconder o botão de adicionar).

### C11 — Tela Hábitos: busca + ordenação + filtro de rotina + agrupamento + prefs

- **Dependências:** C8, C9, C10
- **Fazer:** `src/app/habits/index.tsx`:
  - `TextInput` controlado (busca) **após** o `MetricTabSelector`; placeholder e `accessibilityLabel`.
  - Seletor de ordenação (3 modos: "Adicionados"/"Por rotina"/"A–Z").
  - Chips de rotina (Todas + cada rotina + "Sem rotina"), derivados de `routines`.
  - Modo `routine`: agrupar com **subtítulo do grupo** (estilo subtítulo da Home: `textMuted`, uppercase,
    12px); "Sem rotina" no fim.
  - Pipeline: `filter(tab) → filterHabitsByName → filtro de rotina → sortHabits`.
  - Empty state `no-results` quando filtro/busca esvaziam a lista (mantendo `AddHabitButton` visível).
  - Carregar prefs no mount (`getHabitsViewPrefs`) e **persistir** a cada troca (`setHabitsViewPrefs`).
  - **Não** alterar o cálculo de streak/percent dos `HabitCard` existentes.
- **Arquivos:** `src/app/habits/index.tsx` (+ extrair `src/components/feature/HabitsToolbar.tsx` se ajudar a
  testar) + teste correspondente.
- **Testes de referência (RED):** componente de toolbar/lista — digitar busca filtra; trocar ordenação
  reordena; escolher rotina filtra; estado vazio `no-results` aparece. (Teste de unidade no domínio já
  coberto em C8; aqui validar a fiação se extraído em componente testável.)
- **Verificar:** `npm test -- habits` (ou smoke `npm test -- toolbar`); `npm test`; `npx tsc --noEmit`;
  `npm run lint`; `npm run web` (busca/filtros não escondem o `+`).
- **Aceite:** T4 completo; preferências persistem entre sessões; regressão verde.

**— Fim FASE F3 —**

---

# FASE F4 — Estatísticas (T5 remoção + T6 visão Mês)

**Gate da fase:** Estatísticas sem Calendário; visão Mês funcional (headline + heatmap + resumo);
`StreakCard` com streak geral; aba Calendário intacta; `tsc`/`lint`/testes limpos.

### C12 — T5: remover `ConsistencyCalendar` (componente + imports, sem órfão)

- **Dependências:** —
- **Fazer:**
  - `src/app/statistics/index.tsx`: remover import e uso de `<ConsistencyCalendar>`; remover imports
    exclusivos `monthKey`/`todayKey` (usados só por ele). **Manter** `month` (`monthlySeries`), consumido
    por `CompletionChart`.
  - **Remover o arquivo** `src/components/feature/dashboard/ConsistencyCalendar.tsx` (SPEC-c2 §10.3 —
    nada de arquivo órfão).
  - Aba `src/app/calendar/index.tsx` **intacta**.
- **Arquivos:** `src/app/statistics/index.tsx`, `src/components/feature/dashboard/ConsistencyCalendar.tsx` (delete).
- **Verificar:** `npx tsc --noEmit`; `npm run lint`; `npm test` (regressão — `dashboard.test.tsx` não usa
  ConsistencyCalendar); `grep -r ConsistencyCalendar src` ⇒ zero referências.
- **Aceite:** Estatísticas sem a visão duplicada; nenhuma referência quebrada; Calendário intacto.

### C13 — T6: `MonthView` (headline streak geral + heatmap + resumo) + teste

- **Dependências:** C1, C2
- **Fazer:** novo `src/components/feature/dashboard/MonthView.tsx` (padrão `CompletionChart`/`WeeklyChart`:
  card `surface` + borda + título uppercase `textMuted`):
  - **(a) Headline:** streak geral (dias vencidos) — recebe `streakCurrent: number` (ou calcula via
    `computeOverallStreaks`), exibido ícone `fire` + número + rótulo (não-só-cor).
  - **(b) Heatmap:** grade via `buildMonthGrid` (`src/domain/date/monthGrid.ts`); estado por dia vindo de
    `monthDayStatus` (C2): **vencido** `✓` / **parcial** `◐` / **neutro** `○`; **legenda não-só-cor**
    (símbolo + label textual).
  - **(c) Resumo:** dias vencidos no mês + taxa do mês (`completed/scheduled` no mês, via `monthlySeries`).
  - Props (proposta): `{ series: DayPoint[]; statuses: {dateKey; state}[]; streakCurrent: number }`
    (componente de apresentação; dados vêm do domínio).
- **Arquivos:** `src/components/feature/dashboard/MonthView.tsx` + `MonthView.test.tsx`
  (ou estender `dashboard.test.tsx`).
- **Testes de referência (RED):** renderiza headline do streak; renderiza legenda com os 3 estados;
  renderiza resumo (nº de dias vencidos + %).
- **Verificar:** `npm test -- monthview`; `tsc`; `lint`.
- **Aceite:** visão Mês modular, componentes independentes; regra de vencido vinda do domínio único.

### C14 — Fiação em Estatísticas: `StreakCard` geral + `MonthView`

- **Dependências:** C3, C13
- **Fazer:** `src/app/statistics/index.tsx`:
  - `StreakCard` passa a receber o **streak geral**: `current={summary.dayStreakCurrent}`
    `best={summary.dayStreakBest}` (SPEC-c2 §10.5). `Stats` **não** exibe max individual.
  - Adicionar `<MonthView series={month} statuses={monthDayStatus(habits, records, now)} streakCurrent={summary.dayStreakCurrent} />`.
  - Manter `ProgressRing`, `Stat`, `WeeklyChart`, `CompletionChart`; manter empty state `no-stats`.
  - (Garantia T2/§10.5) `HabitDetail` (`src/app/habits/[id]/index.tsx`) mantém `bestStreak` visível —
    sem alteração funcional; validar label "Melhor".
- **Arquivos:** `src/app/statistics/index.tsx`; conferir `src/app/habits/[id]/index.tsx`.
- **Verificar:** `npx tsc --noEmit`; `npm run lint`; `npm test -- statistics` (smoke render);
  `npm run web` (Mês aparece; Calendário ausente).
- **Aceite:** Stats mostra streak geral; Mês funcional; best individual acessível no detalhe do hábito.

**— Fim FASE F4 —**

---

# FASE F5 — Polish (a11y, reduced-motion, states)

**Gate da fase:** acessibilidade dos novos componentes, reduced-motion respeitado, light≈dark,
empty states coerentes; suite completa + tsc + lint verdes.

### C15 — Acessibilidade dos componentes novos

- **Dependências:** C5, C6, C11, C13
- **Fazer:** revisão §37 (SPEC §10):
  - `HomeStreakHeader`: `accessibilityLabel` combinando streak + frase + autor.
  - `HabitRow` streak: label "sequência de N dias".
  - `MonthView`: legenda com símbolo + texto; dias com `accessibilityLabel` de estado.
  - Filtros/busca/toolbar: `accessibilityLabel`/`accessibilityRole` no `TextInput` e nos chips/tabs.
  - Confirmar estado **nunca só por cor** em todos os novos elementos.
- **Arquivos:** componentes de C5/C6/C11/C13.
- **Verificar:** `npm run lint`; `npx tsc --noEmit`; ajustar/estender testes de a11y (`getByLabelText`).
- **Aceite:** novos elementos com símbolo+label; navegável por teclado no web.

### C16 — Reduced-motion + consistência light/dark + empty states

- **Dependências:** C5, C11, C13, C14
- **Fazer:**
  - Confirmar que o header não exige animação (reduced-motion safe); qualquer motion passa pelo
    sistema existente (`src/services/motion.ts`) — nada de animação obrigatória no header.
  - Revisar light/dark dos novos cards (tokens `surface`/`surfaceElevated`/`border`; zero hex solto).
  - Revisar empty states: `no-results` (busca) e `no-stats` (Estatísticas) coerentes e acionáveis.
- **Arquivos:** `HomeStreakHeader`, `MonthView`, `habits/index.tsx`, `EmptyState.tsx`.
- **Verificar:** `npm run web` em light e dark; `npm run lint`; `npx tsc --noEmit`.
- **Aceite:** mesmo produto nos 2 temas; nenhuma tela "branca".

### C17 — Verificação final DoD + regressão completa

- **Dependências:** C1..C16
- **Fazer:**
  - `npm test` integral: **171 baseline + todos os novos**, 100% verde.
  - `npx tsc --noEmit` e `npm run lint` limpos.
  - `npm run web` smoke: Home (header + streak por hábito) e Estatísticas (Mês, sem Calendário).
  - Checklist produto/técnica/UX do §2 deste plano.
  - Release no fluxo padrão: bump `version`/`versionCode` (`vc10+`) + tag `v0.1.9-mvp`.
  - Registrar resultado em `docs/REVIEW.md`.
- **Arquivos:** `docs/REVIEW.md` (resultado); bump de versão conforme fluxo do projeto.
- **Verificar:** tudo verde; relatar gaps.
- **Aceite:** DoD global §2 cumprido; zero regressão dos 171; `opens.ts` §15.1 intocado.

**— Fim FASE F5 —**

---

## 4. Dependências (resumo)

```
F1: C1 → C2
       C1 → C3
F2: C4 → C5 → C7
    C1 → C6 → C7
    (C3, C4, C5, C6) → C7
F3: C8 → C9 → C11
          C10 → C11
F4: C1,C2 → C13
    C3,C13 → C14
    C12 (independente)
F5: C5,C6,C11,C13 → C15
    C5,C11,C13,C14 → C16
    C1..C16 → C17
```

Corrente crítica: `C1 → C3 → C7 (Home)` e `C1 → C2 → C13 → C14 (Mês)`.
F1 (domínio) **antes** de qualquer UI. C12 (remoção) independente, pode começar cedo.

## 5. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `daySummary` legado consumido por achievements/celebração (`src/app/index.tsx` `buildDerivedStats`) | Campos novos **sempre aditivos**; `overallCurrentStreak`/`overallBestStreak` **preservados**; teste de regressão C3. |
| Grant de crédito semanal (`opens.ts` §15.1) | **Não tocar** neste ciclo. Nenhuma task referencia o grant. |
| Header da Home empurra a lista (mobile-first) | Componente compacto, 1 linha de frase + 1 de atribuição; validar na 1ª dobra (C7/C16). |
| Heatmap marcar "parcial" onde deveria ser "vencido" (skip neutro) | Estado por dia vem de `isConqueredDay` (C1) via `monthDayStatus` (C2) — não de `completed===scheduled`. |
| `ConsistencyCalendar` órfão | C12 **remove o arquivo** (nada de órfão); grep de referências no aceite. |
| Persistência de filtros quebrar a tela no 1º boot | `getHabitsViewPrefs` retorna `null` e a tela aplica default (`added` + Ativos) — C9/C11. |
| `Math.random` em render (frase trocando) | `phraseForDate(dateKey)` determinística + teste de estabilidade (C4). |
| Regressão dos 171 testes | Gate obrigatório `npm test` ao fim de cada fase. |

## 6. Matriz de rastreabilidade task → refinamento → artefato

| Task | T | Fase | Artefato principal | Teste |
|---|---|---|---|---|
| C1 | T2/T3 | F1 | `domain/streak/overallStreak.ts` | `overallstreak.test.ts` |
| C2 | T6 | F1 | `monthDayStatus` (mesmo módulo) | `overallstreak.test.ts` |
| C3 | T2 | F1 | `domain/stats/aggregate.ts` | `aggregate.test.ts` |
| C4 | T2 | F2 | `config/motivationalPhrases.ts` | `motivationalPhrases.test.ts` |
| C5 | T2 | F2 | `feature/HomeStreakHeader.tsx` | `HomeStreakHeader.test.tsx` |
| C6 | T1 | F2 | `feature/HabitRow.tsx` | `HabitRow.test.tsx` |
| C7 | T1/T2 | F2 | `app/index.tsx` | `tsc` + `web` |
| C8 | T4 | F3 | `domain/habit/sortHabits.ts` | `sortHabits.test.ts` |
| C9 | T4 | F3 | `services/prefs.ts` | `prefs.test.ts` |
| C10 | T4 | F3 | `feature/EmptyState.tsx` | regressão |
| C11 | T4 | F3 | `app/habits/index.tsx` | `habits`/`toolbar` |
| C12 | T5 | F4 | `app/statistics/index.tsx` (+ delete) | regressão + grep |
| C13 | T6 | F4 | `feature/dashboard/MonthView.tsx` | `MonthView.test.tsx` |
| C14 | T5/T6 | F4 | `app/statistics/index.tsx` | smoke + web |
| C15 | — | F5 | componentes novos (a11y) | `getByLabelText` |
| C16 | — | F5 | temas/states | web light/dark |
| C17 | — | F5 | `docs/REVIEW.md` | suite + tsc + lint |

## 7. Ordem de execução sugerida

`C1 → C2 → C3` (F1) · `C4 → C5 → C6 → C7` (F2) · `C8 → C9 → C10 → C11` (F3) ·
`C12 → C13 → C14` (F4) · `C15 → C16 → C17` (F5).
