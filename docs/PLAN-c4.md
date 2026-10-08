# PLAN-c4 — HabitFlow · Plano de implementação TDD (ciclo 4, refinamentos fase D)

> Derivado de [`docs/SPEC-c4.md`](SPEC-c4.md) (contrato do ciclo 4; opens c4-O1/c4-O2 fechadas no
> grilling 08/10/2026) e de [`docs/SPEC.md`](SPEC.md) (ciclo 1) + [`docs/PLAN-c3.md`](PLAN-c3.md)
> (estilo de tasks). Autoridade das regras de status: driver §8 (skip neutro), §9 (histórico
> imutável), §35 (derivado) e §37 (a11y / não-só-cor).
>
> Este plano cobre os **4 refinamentos T1–T4** do SPEC-c4 em **5 fases (F1–F5)** e **8 tasks atômicas
> `C1..C8`**. É *plan only* — **nenhum código** foi alterado.
>
> Baseline de regressão: **243 testes / 40 suites verdes** (medido no discovery deste ciclo). Nenhum
> teste existente pode quebrar.

---

## 1. Como usar este plano

- Fases F1–F5 = composição deste plano: `F1 domínio (counts) → F2 tokens → F3 WeeklyChart (+ legenda)
  → F4 CompletionChart → F5 legenda/polish/release`. A legenda (`ChartLegend`, T2/T4) é criada em F3
  (antes de ser consumida pelos 2 cards) e reaproveitada em F4.
- Tasks TDD atômicas `C1..C8`, executar em ordem de `id` respeitando `Dependências`.
- RED → GREEN → REFACTOR. **Escrever o teste que falha primeiro**, implementar, refatorar.
- `src/domain/` é 100% puro: **sem I/O, sem RN/Expo/banco, sem `new Date()` interno** — `now` é sempre
  argumento. Quem injeta `now` é o caller (tela/hook).
- **Nunca** duplicar regra de negócio na UI. A UI chama as funções de domínio.
- Decisões fechadas mudam só no arquivo de custódia (SPEC-c4 §11).
- **Aditivo por contrato:** `completed`/`percent`/`completedOn` (ponte com `calendar` e `MonthView`)
  **não mudam**; os campos novos `done/skipped/undone` são adicionados ao `DayPoint`.

### Comandos de verificação (valem para toda task)

| Verificação | Comando |
|---|---|
| Testes (por regex) | `npx jest <regex>` (ex.: `npx jest src/domain/stats`) |
| Suite completa (regressão 243) | `npx jest` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx expo lint` |
| Web (resposta UI) | `npm run web` |

**Cada task, ao terminar, exige `npx tsc --noEmit` e `npx expo lint` limpos + o teste citado verde.**
Ao fechar cada fase: `npx jest` integral (sem regressão dos 243).

### Baseline de regressão (não pode regredir)

- `src/domain/stats/aggregate.test.ts` (daySummary/weekly/monthly/totals — **inclui T7 e C3**).
- `src/components/feature/dashboard.test.tsx` (label `Seg: 50%` — contrato de a11y, muda em C5).
- `src/components/feature/dashboard/MonthView.test.tsx` (heatmap/legenda/resumo — **sem mudança funcional**).
- `src/domain/streak/*`, `src/domain/record/*`, `src/data/__tests__/*`, `src/theme/theme.test.ts`.
- restantes suites / 243 testes.

---

## 2. DoD — Definition of Done GLOBAL + saída do RUG

**Produto (SPEC-c4 §10)**

- [ ] Cada barra (semana e mês) mostra a composição **concluído / skipado / não concluído**, não só %.
- [ ] Os 2 cards usam **as mesmas 3 cores** de status (T3).
- [ ] Cada card tem **legenda de 3 itens** no rodapé; o card cresce de forma controlada e consistente (T2).
- [ ] Dia **sem hábito agendado** é barra neutra/trilha, fora da composição (sem segmentos na legenda).
- [ ] Skip aparece com **cor própria**, sem semântica de falha.

**Técnica**

- [ ] Invariante `done + skipped + undone === scheduled` garantida por teste de domínio (C1/C2).
- [ ] Composição **derivada** (zero schema/migration); `opens.ts` §15.1 **intocado**.
- [ ] Tokens semânticos `chartDone`/`chartSkip`/`chartUndone`; **zero hex cru fora de `theme/`**;
      estados **não-só-cor**.
- [ ] `calendar/index.tsx` e `MonthView.tsx` **sem mudança de comportamento** (leem só o legado).
- [ ] Baseline **243 testes** sem regressão + novos verdes; `tsc --noEmit` e lint verdes.

**A11y (§37)**

- [ ] Separador de **1px** entre segmentos (fronteira não-cromática).
- [ ] Legenda **textual** com swatch em cada card; símbolo/label nunca só cor.
- [ ] `accessibilityLabel` por barra: `"{dia}: {done} concluídos, {skipped} skipados, {undone} não concluídos ({pct}%)"`.
- [ ] Sem animação obrigatória (reduced-motion safe).

### Critério de saída do RUG (State 2 → ship / State 3)

- `npx jest` **100% verde** (243 baseline + testes novos).
- `npx tsc --noEmit` e `npx expo lint` **limpos**.
- `npm run web` renderiza os 2 charts segmentados com legenda, em light e dark.
- Release publicada (`v0.2.2-c4`) com download anônimo **HTTP 200** (fluxo padrão do projeto).

---

## 3. Central de decisões fechadas (custódia) — SPEC-c4 §11

Nenhuma das linhas abaixo é OPEN. Trocar depois = editar **só** o arquivo indicado (+ teste do caller).

| Ref | Decisão | Arquivo único (custódia) |
|---|---|---|
| c4.1 | Semântica dos 3 buckets: concluído / skipado / não concluído (`pending`+`missed`+sem-record) | `src/domain/stats/aggregate.ts` (`composeDay`) |
| c4.2 | Barra = segmentos empilhados verticais (bottom=concluído, meio=skip, topo=não-concluído) | `WeeklyChart` / `CompletionChart` |
| c4.3 | Cores de status `chartDone`/`chartSkip`/`chartUndone`, ≥3:1, mesmos nos 2 cards | `src/theme/colors.ts` |
| c4.4 | Legenda no rodapé de **cada** card, 3 itens swatch+label | `src/components/feature/dashboard/ChartLegend.tsx` |
| c4.5 | T4 — tokens **próprios**, ancorados na família do `MonthView` (não herda day-level) | SPEC-c4 §7 |
| c4-O1 | Bucket **único** "não concluído" (`pending` de hoje + `missed` + sem-record); refleto do dia no instante da leitura | `composeDay` |
| c4-O2 | **Sem hatch**; `react-native-svg` fora do ciclo. Não-só-cor = separador 1px + legenda textual + label | `WeeklyChart`/`CompletionChart`/`ChartLegend` |

**Regra dura:** `src/config/opens.ts` §15.1 (grant semanal) **não é tocado** neste ciclo.

**Nota de nomenclatura:** o briefing do grilling citou `chartMissed`; a autoridade é o SPEC-c4
§6.1/§7/§8, que usa **`chartUndone`** (o bucket é "não concluído", não "missed"). Manter `chartUndone`.

---

# FASE F1 — Domínio (counts)

> **Regra de ouro:** domínio 100% puro e testado ANTES de qualquer UI. Sem UI em F1.
> Autoridade: SPEC-c4 §3 (semântica), §4 (modelo derivado).

**Gate da fase:** `npx jest src/domain/stats` verde; `npx jest` sem regressão; `tsc` + `lint` limpos.

### C1 — `DayComposition` + `composeDay` (domínio puro, RED-GREEN)

- **Dependências:** — (usa `isScheduled` e `indexRecords` existentes)
- **Fazer:** em `src/domain/stats/aggregate.ts`, adicionar helper puro (SPEC-c4 §4.1):
  ```ts
  export interface DayComposition {
    scheduled: number;
    done: number;
    skipped: number;
    undone: number; // pending + missed + sem-record
  }

  export function composeDay(
    activeHabits: Habit[],
    recordsByHabit: Map<string, Map<string, HabitRecord>>,
    dateKey: string,
  ): DayComposition;
  ```
  Regras: para cada `habit` de `activeHabits`, se `!isScheduled(habit, dateKey)` **pula** (não conta
  record de arquivado/não agendado); `scheduled += 1`; lê `recordsByHabit.get(habit.id)?.get(dateKey)?.status`
  — `completed` → `done`, `skipped` → `skipped` (bucket próprio, neutro), qualquer outro/ausente →
  cai em `undone`. Retorna `undone = scheduled - done - skipped`. **Não** aceita `now` nem I/O.
- **Arquivos:** `src/domain/stats/aggregate.ts`, `src/domain/stats/aggregate.test.ts`.
- **Testes de referência (RED primeiro — 6 casos):**
  - soma `scheduled` = nº de hábitos ativos agendados no dia; `done`/`skipped` nos buckets certos.
  - `skipped` vai para o **bucket próprio** (não `done`, não `undone`) — skip é neutro.
  - `undone` = `pending` + `missed` + **sem-record** (os 3 viram o mesmo bucket).
  - **dia sem agendados** (`scheduled === 0`) → `{0,0,0,0}` (não entra na composição).
  - **hábito arquivado** com record no dia **não conta** (nem `scheduled`, nem `done`).
  - **invariante** `done + skipped + undone === scheduled` em todos os cenários.
- **Verificar:** `npx jest src/domain/stats`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** regra em **função pura única**; invariant garantido por teste; skip com bucket próprio.

### C2 — `DayPoint` estendido (aditivo) + `weeklySeries`/`monthlySeries` (T1)

- **Dependências:** C1
- **Fazer:** em `src/domain/stats/aggregate.ts`:
  - Estender a interface `DayPoint` (SPEC-c4 §4.2) **sem remover/alterar** nada:
    ```ts
    scheduled: number;
    completed: number;   // LEGADO — inalterado (completedOn)
    percent: number;     // LEGADO — inalterado
    done: number;        // NOVO
    skipped: number;     // NOVO
    undone: number;      // NOVO
    ```
  - `weeklySeries`/`monthlySeries`: construir `recordsByHabit = indexRecords(records)` **1×** por
    chamada e preencher `done/skipped/undone` via `composeDay(active, recordsByHabit, dateKey)`.
    Manter `scheduled`/`completed`/`percent` exatamente como hoje (`completedOn` + `active.filter(isScheduled)`).
  - `completedOn` e `daySummary` **não são alterados**.
- **Arquivos:** `src/domain/stats/aggregate.ts`, `src/domain/stats/aggregate.test.ts`,
  `src/components/feature/dashboard.test.tsx` (fixture), `src/components/feature/dashboard/MonthView.test.tsx`
  (fixture) — apenas **campos novos** nos literais `DayPoint` para o `tsc` passar.
- **Testes de referência (RED-GREEN):**
  - `weeklySeries`/`monthlySeries` trazem `done/skipped/undone` por dia, coerentes com `composeDay`.
  - **legado preservado:** `completed`/`percent` idênticos aos de hoje (regressão de `aggregate.test.ts` verde).
  - **arquivado não conta** em `done`; `skip` entra em `skipped`; `missed`/sem-record em `undone`.
  - dia sem agendados → `done/skipped/undone === 0` e `percent === 0`.
- **Verificar:** `npx jest src/domain/stats`; `npx jest` (regressão 243); `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** extensão **aditiva**; `monthlySeries` continua servindo `MonthView` (`completed`/`percent`);
  `calendar/index.tsx` inalterado.

**— Fim FASE F1 —**

---

# FASE F2 — Tokens de status (T3/T4)

**Gate da fase:** 3 tokens novos em ambos os temas, cobertos pela invariante do `theme.test.ts`;
`tsc`/`lint`/testes limpos.

### C3 — Tokens `chartDone` / `chartSkip` / `chartUndone` (light + dark) (T3/T4)

- **Dependências:** —
- **Fazer:** (SPEC-c4 §6.1) adicionar os 3 tokens semânticos:
  - `src/theme/colors.ts`: entradas em `ThemeColors` + `lightColors` + `darkColors` + `ALL_COLOR_TOKENS`.
  - `src/theme/types.ts`: 3 entradas em `ColorToken`.
  - Valores (custódia dos hex **só** em `theme/`):
    | Token | light | dark |
    |---|---|---|
    | `chartDone` | `#4A6B3E` | `#EFCA93` |
    | `chartSkip` | `#A5763C` | `#DCBAAE` |
    | `chartUndone` | `#AD2F21` | `#C0795F` |
- **Arquivos:** `src/theme/colors.ts`, `src/theme/types.ts`.
- **Testes de referência:** `theme.test.ts` já valida `ALL_COLOR_TOKENS` × `ThemeColors` nos 2 temas —
  os novos tokens passam automaticamente. **Adicionar** (opcional mas recomendado) um caso de contraste
  `≥3:1` dos 3 tokens contra a `surface` do respectivo tema usando os helpers já existentes no arquivo.
- **Verificar:** `npx jest theme`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** tokens presentes nos 2 temas, ≥3:1 sobre `surface`; nenhum componente com hex cru.

**— Fim FASE F2 —**

---

# FASE F3 — WeeklyChart (T1/T2/T3)

**Gate da fase:** `WeeklyChart` com barras segmentadas verticais + legenda no rodapé, nos 3 tokens;
`dashboard.test.tsx` atualizado (label composta); `tsc`/`lint`/testes limpos.

### C4 — `ChartLegend` (novo componente, 3 swatches + labels) (T2)

- **Dependências:** C3
- **Fazer:** novo `src/components/feature/dashboard/ChartLegend.tsx` (padrão dos cards: RN Views puras,
  sem `react-native-svg`):
  - Props `{ items?: { token: ColorToken; label: string }[] }` com default
    `[{chartDone,'Concluído'},{chartSkip,'Skipado'},{chartUndone,'Não concluído'}]`.
  - Cada item: `swatch` 10×10 (cor do token, `radius.sm`) + label curta (`textMuted`, 12px).
  - `accessibilityLabel` do conjunto (ex.: "Concluído, Skipado, Não concluído") — **não-só-cor**.
- **Arquivos:** `src/components/feature/dashboard/ChartLegend.tsx` (+ `.test.tsx`).
- **Testes de referência (RED):** renderiza os 3 labels (`getByText('Concluído')` etc.); presente sem depender de cor.
- **Verificar:** `npx jest chartlegend`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** componente único reutilizável pelos 2 cards; zero hex cru (usa `theme.color(token)`).

### C5 — `WeeklyChart`: barras segmentadas + a11y + legenda (T1/T2/T3)

- **Dependências:** C2, C3, C4
- **Fazer:** reescrever o corpo das barras de `src/components/feature/dashboard/WeeklyChart.tsx`
  (SPEC-c4 §5 alternativa A, §6.3):
  - Normalização: `maxScheduled = Math.max(...series.map(p => p.scheduled), 0)`. Altura total da barra =
    `scheduled / maxScheduled` (0 se `maxScheduled === 0`). Segmentos: `done/maxScheduled`,
    `skipped/maxScheduled`, `undone/maxScheduled` — somam a altura total.
  - **Ordem vertical** (bottom→top): **concluído → skipado → não concluído** (no `track` com
    `justifyContent: 'flex-end'`, o segmento `done` renderiza por último para ficar na base).
  - **Separador de 1px** na cor do card (`surface`) entre segmentos (fronteira não-cromática).
  - Cores pelos tokens `chartDone`/`chartSkip`/`chartUndone` (T3) — **não** `primary`, **não** `accent`.
  - **Percent label mantido:** mantém o texto do topo `round(percent * 100)%`.
  - `accessibilityLabel` por barra: `"{dia}: {done} concluídos, {skipped} skipados, {undone} não concluídos ({pct}%)"`.
  - **Dia sem agendado** (`scheduled === 0`): só track neutro (`surfaceElevated`), sem segmentos.
  - `<ChartLegend />` no rodapé do card; card cresce por `gap: spacing.md` + `padding: spacing.lg`
    (sem altura hardcoded nova).
  - Sem animação obrigatória (reduced-motion safe).
- **Arquivos:** `src/components/feature/dashboard/WeeklyChart.tsx`, `src/components/feature/dashboard.test.tsx`.
- **Testes de referência (RED-GREEN):** atualizar `dashboard.test.tsx` — a label deixou de ser
  `Seg: 50%` e passou a ser composta (ex.: `Seg: 1 concluídos, 0 skipados, 1 não concluídos (50%)`);
  `Dom` (sem agendado) com label de 0/0/0 e barra neutra; a legenda com os 3 itens renderiza.
  *(Mudança deliberada de contrato de a11y — não é regressão, SPEC-c4 §2.6/§12.)*
- **Verificar:** `npx jest dashboard`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`; `npm run web`.
- **Aceite:** composição visível, mesmas cores de status, legenda no rodapé, a11y composta, dia vazio neutro.

**— Fim FASE F3 —**

---

# FASE F4 — CompletionChart (T1/T2/T3 — unificação de paleta)

**Gate da fase:** `CompletionChart` com **mesma semântica, mesmas cores e legenda idêntica** do semanal
(fecha o gap de paleta T3); barras finas preservadas; `tsc`/`lint`/testes limpos.

### C6 — `CompletionChart`: segmentos verticais + mesmos tokens/legenda (T1/T2/T3)

- **Dependências:** C2, C3, C4
- **Fazer:** em `src/components/feature/dashboard/CompletionChart.tsx`:
  - Aplicar a **mesma** estratégia de C5 (segmentos bottom=done / meio=skip / topo=undone, separador
    1px, normalização por `maxScheduled`, cor por `chartDone/Skip/Undone`) — mantendo as barras **finas**
    (`row` gap 3, `barWrap height 64`).
  - Remover a paleta divergente `completed > 0 ? accent : border` (hex via tokens antigos) — agora usa os
    tokens de status.
  - `accessibilityLabel` composta por dia (formato de C5, usando `monthDay`); legenda `<ChartLegend />` no rodapé.
  - Dia sem agendado → track neutro, sem segmentos.
- **Arquivos:** `src/components/feature/dashboard/CompletionChart.tsx` (+ teste; pode estender
  `dashboard.test.tsx` com um caso de `CompletionChart`).
- **Testes de referência (RED-GREEN):** `CompletionChart` usa os 3 tokens (não `accent`/`border`);
  renderiza a legenda (3 itens); label composta por dia.
- **Verificar:** `npx jest dashboard`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`; `npm run web`.
- **Aceite:** os 2 cards com **as mesmas 3 cores** de status; barras finas preservadas; `MonthView`/`calendar`
  intocados.

**— Fim FASE F4 —**

---

# FASE F5 — Verificação final / polish / release (State 3)

**Gate da fase:** suite completa verde sem regressão, `tsc`/`lint` limpos, release publicada.

### C7 — Verificação final DoD + regressão + a11y/polish (T1–T4)

- **Dependências:** C1..C6
- **Fazer:**
  - `npx jest` integral: **243 baseline + todos os novos**, 100% verde.
  - `npx tsc --noEmit` e `npx expo lint` limpos.
  - `npm run web` smoke: Estatísticas exibe os 2 charts segmentados com legenda (light **e** dark).
  - A11y §37: separador 1px, legenda textual com swatch, labels com contagens, estados nunca só-cor;
    reduced-motion (sem animação obrigatória).
  - Contraste light/dark dos 3 tokens ≥3:1 sobre `surface`.
  - Checklist produto/técnica/UX do §2 deste plano.
  - Registrar resultado em `docs/REVIEW-c4.md`.
  - **Re-index Codebase Memory 1×** no fim e reportar nodes/edges antes→depois (norma v2).
- **Arquivos:** `docs/REVIEW-c4.md` (resultado).
- **Verificar:** tudo verde; relatar gaps.
- **Aceite:** DoD §2 cumprido; **zero regressão dos 243**; `calendar`/`MonthView` sem mudança de
  comportamento; `opens.ts` §15.1 intocado.

### C8 — Release (State 3 — FUTURO; NÃO executar nesta missão de PLAN)

- **Dependências:** C7
- **Fazer (predefinido, executar só no State 3):**
  - Bump `app.json` `version "2.2.0"` / `android.versionCode 12` (+ `android/app/build.gradle`
    `versionCode 12` / `versionName "2.2.0"`), regras do `build.gradle` **intocadas**.
  - Build release **arm64**: junction `C:/AndroidSdkJ`, `JAVA_HOME=C:/android-jdk21`,
    `gradlew assembleRelease --no-daemon` (`BUILD SUCCESSFUL`, APK < 50 MB).
  - GitHub release `v0.2.2-c4` (asset `HabitFlow-arm64.apk`); token via
    `git credential fill` host `github.com` username `MTitoS`; verificação **anônima HTTP 200**
    (`node fetch`); **não apagar releases antigas**.
  - Device verify oportunístico (`adb -s 192.168.15.26:34263`); se offline, **SKIP**.
  - `git push main`; `docs/PROGRESS-c4.md` 100%.
- **Arquivos:** `app.json`, `android/app/build.gradle`, `docs/PROGRESS-c4.md`.
- **Aceite:** release publicada, download anônimo **HTTP 200**; PROGRESS-c4 100%; zero regressão.

**— Fim FASE F5 —**

---

## 4. Dependências (resumo)

```
F1: C1 → C2
F2: C3                     (independente)
F3: C3 → C4 ; C2,C3,C4 → C5
F4: C2,C3,C4 → C6
F5: C1..C6 → C7 → C8
```

Corrente crítica: `C1 → C2 → C5` (semana) e `C1 → C2 → C6` (mês). F1/F2 (domínio + tokens) **antes**
de qualquer UI. C3 (tokens) é independente e pode começar cedo; C4 (legenda) depende só de C3.

## 5. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Estender `DayPoint` quebraria literais de teste (`dashboard.test.tsx`, `MonthView.test.tsx`) | Campos **aditivos**; literais ganham os campos novos em C2 (mecânico, sem mudança de comportamento) |
| `completedOn` infla `completed` com record de arquivado (SPEC-c4 §2.1) | Documentado como risco separado; **não corrigido** neste ciclo; charts usam `composeDay` (per-scheduled) |
| Mudar a label de a11y quebra `dashboard.test.tsx:34-38` | Atualização **deliberada** do contrato em C5 (SPEC-c4 §2.6); não é regressão |
| Três tons quentes do dark com pouca separação de luminância | Separador 1px + legenda textual + `accessibilityLabel` com contagens (não-só-cor) — C5/C6 |
| Nome do token divergente (`chartMissed` no briefing × `chartUndone` no SPEC) | §3 deste plano: SPEC §6.1/§7/§8 é autoridade → **`chartUndone`** |
| Legenda "inchando" o card de forma inconsistente | Padding `spacing.lg` + `gap: spacing.md` já existentes; nenhuma altura fixa nova |
| Regressão dos 243 testes | Gate obrigatório `npx jest` ao fim de cada fase |

## 6. Matriz de rastreabilidade task → refinamento → artefato

| Task | T | Fase | Artefato principal | Teste |
|---|---|---|---|---|
| C1 | T1 | F1 | `domain/stats/aggregate.ts` (`composeDay`) | `aggregate.test.ts` |
| C2 | T1 | F1 | `DayPoint` estendido + séries (aditivo) | `aggregate.test.ts` |
| C3 | T3/T4 | F2 | `theme/colors.ts` + `theme/types.ts` | `theme.test.ts` |
| C4 | T2 | F3 | `feature/dashboard/ChartLegend.tsx` | `ChartLegend.test.tsx` |
| C5 | T1/T2/T3 | F3 | `feature/dashboard/WeeklyChart.tsx` | `dashboard.test.tsx` |
| C6 | T1/T2/T3 | F4 | `feature/dashboard/CompletionChart.tsx` | `dashboard.test.tsx` |
| C7 | T1–T4 | F5 | `docs/REVIEW-c4.md` | suite + tsc + lint |
| C8 | — | F5 | release `v0.2.2-c4` + `docs/PROGRESS-c4.md` | HTTP 200 + push |

## 7. Ordem de execução sugerida

`C1 → C2` (F1) · `C3` (F2) · `C4 → C5` (F3) · `C6` (F4) · `C7 → C8` (F5).
