# PLAN-c5 — HabitFlow · Plano de implementação TDD (ciclo 5, módulo Tarefas + calendário detalhado em Estatísticas)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans`. Tasks usam checkbox (`- [ ]`) para tracking.

**Goal:** Introduzir um módulo **isolado** de Tarefas (to-dos): nova aba **Tarefas** substituindo **Calendário**, to-dos marcáveis em **Hoje** e no **detalhe do dia dentro de Estatísticas** (expansível ao tocar o mês). Zero impacto em stats/streak (L7).

**Architecture:** Domínio puro `src/domain/todo/` → persistência aditiva no `DataStore` próprio (`todos` na tabela + `DB_VERSION` 1→2 + migration) + `TodoRepository` → UI testável por camadas (`TodoRow`, `TodayTodos`, telas Tarefas, `CalendarDetail`, mês interativo em Estatísticas). To-dos são um módulo fechado: nenhum derivado de stats/streak os lê.

**Tech Stack:** Expo/RN (SDK 57), TypeScript, `lucide-react-native` (glifo `squareCheck` novo), persistência via AsyncStorage + abstração própria (`DataStore`), `@testing-library/react-native` (`renderWithProviders`), Jest.

**Spec:** [`docs/SPEC-c5.md`](SPEC-c5.md) — contrato do ciclo; todas as decisões Q1–Q23 já fechadas no grilling (não reabrir). Baseline **281 testes / 42 suites** (v0.2.3-c4fix).

## Global Constraints

- **Sem recorrência** de to-dos (L2).
- To-dos **isolados de stats/streak/completion/achievements** (L7) — módulo fechado.
- To-do sem data = **"Algum dia"** (L3).
- Nova aba **Tarefas substitui Calendário**; mantêm-se **5 abas** (L4).
- Calendário detalhado migra para **dentro de Estatísticas** (L5); to-dos aparecem em **Hoje** e no detalhe do dia, **marcáveis dali** (L6).
- Nova tabela + migration de tabela nova (L8) no **`DataStore` próprio** (não WatermelonDB).
- **Zero token novo de cor** em `theme/` (Q22); empty state reusa `EmptyState` com `kind: 'no-todos'`.
- `src/domain/` 100% puro: sem I/O, sem RN/Expo/banco, sem `new Date()` interno — `now`/`today` sempre argumento.
- `records` / `Habit` / `opens.ts` / charts c4fix / `WeekStatusRow` / `CalendarDayCell` **intocados** (C5-1/§1.2).
- RED → GREEN → REFACTOR em toda task; **teste que falha primeiro**.

| Verificação | Comando |
|---|---|
| Testes (por regex) | `npx jest <regex>` |
| Suite completa (regressão 281) | `npx jest` |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx expo lint` |
| Web | `npx expo export --platform web` |

**Cada task, ao terminar, exige `npx tsc --noEmit` e `npx expo lint` limpos + os testes citados verdes.** Ao fechar cada fase: `npx jest` integral (sem regressão dos 281).

---

## 1. Central de decisões fechadas (custódia) — SPEC-c5 §12/Q1..Q23

> Nenhuma linha é OPEN. Trocar depois = editar **só** o arquivo indicado (+ teste do caller).

| Ref | Decisão | Arquivo único (custódia) |
|---|---|---|
| c5.1 | `Todo` = `{id, title, date?, completed, completedAt?, createdAt, updatedAt}` (Q4); `date` = `dateKey` `YYYY-MM-DD`, ausente ⇒ "Algum dia" (Q5) | `src/domain/todo/model.ts` |
| c5.2 | `completed ⇔ completedAt`; `title` não vazio (trim) | `src/domain/todo/model.ts` |
| c5.3 | Nome canônico `todo`/`todos` no código/rota; label PT "Tarefa(s)" (Q1) | rota `/todos` + `domain/todo/` |
| c5.4 | Aba Tarefas na **4ª posição** substituindo Calendário; 5 abas (Q2) | `NavItems.tsx` |
| c5.5 | Glifo novo `squareCheck` (Q3) | `Icon.tsx` |
| c5.6 | `DB_VERSION` **1→2** + migration `{from:1,to:2}` aditiva (`todos: []`) (Q6) | `schema.ts` + `migrations/index.ts` |
| c5.7 | `TodoRepository`: `all`/`byDate`/`undated`/`create`/`update`/`setCompleted`/`setUncompleted`/`remove` (Q8) | `repositories/{types,impl}.ts` |
| c5.8 | **Sem guarda temporal** ("só hoje") p/ to-dos; toggle idempotente (Q9) | `repositories/impl.ts` |
| c5.9 | `setCompleted` grava `completedAt=now`; `setUncompleted` **remove** `completedAt` (Q10) | `repositories/impl.ts` |
| c5.10 | Seções da aba: `Hoje` (date===hoje ∪ atrasados), `Algum dia` (sem data), `Próximas` (date>hoje) só quando existir (Q11/Q15) | `app/todos/index.tsx` + `domain/todo/model.ts` |
| c5.11 | Telas dedicadas create/edit geradas por `todo-form` (Q12) | `app/todos/create.tsx`, `app/todos/[id]/edit.tsx`, `features/todo/todo-form.tsx` |
| c5.12 | Excluir = ação explícita com confirmação (Q13) | `app/todos/[id]/edit.tsx` |
| c5.13 | Concluídos visíveis (riscados, no fim/abaixo), não somem (Q14) | `TodoRow` + telas |
| c5.14 | Hoje: seção "Tarefas de hoje" após grupos de hábitos, antes da linha de créditos; atrasados com marca discreta (Q15) | `app/index.tsx` + `TodayTodos` |
| c5.15 | Expansão do dia em Estatísticas **inline** em `statistics/index.tsx` (Q17) | `statistics/index.tsx` |
| c5.16 | Dias do `MonthView` **Pressable** + reuso `CalendarDayCell`/`calendarDayInfo`; remover `calendar/index.tsx` (Q18) | `MonthView.tsx` + `CalendarDetail.tsx` |
| c5.17 | Detalhe: status por hábito **read-only** + to-dos marcáveis (Q19) | `CalendarDetail.tsx` |
| c5.18 | Feedback = toast + `triggerSuccess()`; **sem** celebração/achievements (Q20) | telas com toggle |
| c5.19 | Export/import: `todos` via `snapshotTables`; migration cobre backups v1 legados (Q21) | `exportImport.ts` (intacto) + teste |
| c5.20 | `EmptyState` `kind: 'no-todos'`; zero token novo; atrasado usa `danger` existente (Q22) | `EmptyState.tsx` |
| c5.21 | Baseline 281; alvo **+~25–35** testes (Q23) | suite |

---

# FASE F1 — Modelo de domínio (tabela lógica)

> **Regra de ouro:** domínio 100% puro e testado ANTES de qualquer UI/dados. Autoridade: SPEC-c5 §4.

**Gate da fase:** `npx jest src/domain/todo` verde; sem regressão; `tsc` + `lint` limpos.

### D1 — `src/domain/todo/model.ts` (Todo puro + helpers) — RED→GREEN

- **Dependências:** — (reusa `dateUtils`).
- **Fazer:** criar `src/domain/todo/model.ts` (SPEC-c5 §4):
  ```ts
  export interface Todo {
    id: string;
    title: string;
    date?: string;          // dateKey 'YYYY-MM-DD'; ausente = "Algum dia"
    completed: boolean;
    completedAt?: number;   // epoch ms; presente só quando completed
    createdAt: number;
    updatedAt: number;
  }
  export function validateTodoTitle(title: string): boolean;                 // trim não vazio
  export function isOverdue(todo: Todo, todayKey: string): boolean;          // !completed && date && date < today
  export function groupedByDay(todos: Todo[], todayKey: string): {          // "Hoje"/"Algum dia"/"Próximas"
    today: Todo[]; someday: Todo[]; upcoming: Todo[];
  };
  export function todosForDay(todos: Todo[], dateKey: string): Todo[];       // date === dateKey
  export function undatedTodos(todos: Todo[]): Todo[];
  export function sortTodos(todos: Todo[]): Todo[];                          // Q7: completos por último; date asc; createdAt asc
  ```
  Regras: `isOverdue` = `!completed && date && date < todayKey`; sem `archivedAt` (hard delete — YAGNI).
- **Arquivos:** Create `src/domain/todo/model.ts`, `src/domain/todo/model.test.ts`.
- **Testes de referência (RED primeiro — 7 casos):** título vazio/whitespace inválido; título válido; `groupedByDay` separa hoje/someday/futuro; atrasado não concluído cai em "Hoje" (Q15); concluído do dia fica em "Hoje"; `todosForDay`/`undatedTodos` filtram certo; `sortTodos` completa por último + `createdAt` asc; `isOverdue` true/false.
- **Verificar:** `npx jest src/domain/todo`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** regras em funções puras únicas; zero I/O; nenhuma referência a stats/streak.

**— Fim FASE F1 —**

---

# FASE F2 — Persistência (schema + migration + repositório + DataProvider)

**Gate da fase:** `npx jest` sem regressão; migration testada; `tsc`+`lint` limpos.

### D2 — Schema + migration `todos` (Q6/L8) — RED→GREEN

- **Dependências:** —
- **Fazer:**
  - `src/data/schema.ts`: `DB_VERSION = 2`; `TABLES` += `'todos'`; `TABLE_DEFINITIONS` += `{ name: 'todos', fields: ['id','title','date','completed','completedAt','createdAt','updatedAt'] }`.
  - `src/data/migrations/index.ts`: `MIGRATIONS = [{ from: 1, to: 2, up: (t) => ({ ...t, todos: t.todos ?? [] }) }]`.
  - **Nada mais muda** em adapters/export (genérico).
- **Arquivos:** Modify `src/data/schema.ts`, `src/data/migrations/index.ts`; Modify `src/data/exportImport.test.ts`.
- **Testes de referência (RED primeiro — 3):** `TABLES` contém `todos`; snapshot v1 legado ganha `todos: []` via `applyMigrations` (`validatePayload` de backup v1 não quebra — Q21); `DB_VERSION === 2`.
- **Verificar:** `npx jest exportImport`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** tabela ausente continua lendo `[]`; backups v1 migram sem erro.

### D3 — `TodoRepository` (CRUD + toggle) — RED→GREEN

- **Dependências:** D1, D2.
- **Fazer:**
  - `src/data/repositories/types.ts`: interface `TodoRepository`:
    ```ts
    export interface TodoRepository {
      all(): Promise<Todo[]>;
      byDate(dateKey: string): Promise<Todo[]>;
      undated(): Promise<Todo[]>;
      create(input: Omit<Todo,'id'|'completed'|'completedAt'|'createdAt'|'updatedAt'>): Promise<Todo>;
      update(todo: Todo): Promise<void>;
      setCompleted(id: string, now: number): Promise<void>;
      setUncompleted(id: string): Promise<void>;
      remove(id: string): Promise<void>;
    }
    ```
    e `Repositories.todos: TodoRepository`.
  - `src/data/repositories/impl.ts`: `T_TODOS = 'todos'` + `createTodoRepository(store)`: `create` gera `id`/`createdAt`/`updatedAt` (completed:false); `setCompleted` grava `completed:true, completedAt:now, updatedAt:now`; `setUncompleted` grava `completed:false` e **remove** `completedAt`; **sem guarda temporal** (Q9); update/remove por id. `createRepositories` += `todos`.
- **Arquivos:** Modify `src/data/repositories/types.ts`, `src/data/repositories/impl.ts`; Modify `src/data/__tests__/repositories.test.ts`.
- **Testes de referência (RED primeiro — 8):** create persiste c/ timestamps e completed:false; sem-data vs com-data (`undated`/`byDate`); update altera e bumpa `updatedAt`; setCompleted grava completedAt=now; setCompleted idempotente (re-toggling não duplica); setUncompleted remove completedAt (invariante c5.2); setCompleted em dia não-hoje **funciona** (Q9 — contraste com records); remove apaga.
- **Verificar:** `npx jest repositories`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** repository isolado; `records` intocado; toggle idempotente.

### D4 — `DataProvider`: `todos` no reload + contexto — RED→GREEN

- **Dependências:** D3.
- **Fazer:** (`src/data/DataProvider.tsx`) `DataContextValue.todos: Todo[]`; no `reload()`, `Promise.all` += `repos.todos.all()`; `setTodos`; contexto/memo += `todos`.
- **Arquivos:** Modify `src/data/DataProvider.tsx`; Modify `src/data/__tests__/integration.test.ts`.
- **Testes de referência (RED primeiro — 1):** cria to-do via repos e vê `todos` no snapshot `reload()` — integração com `DataProvider` (ou, se inviável no harness, coberto via repo test; marcar como cobertura indireta).
- **Verificar:** `npx jest integration`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** consumidores de `useData()` continuam compile; `todos` exposto.

**— Fim FASE F2 —**

---

# FASE F3 — UI da aba Tarefas (token/glifo + componente + telas)

**Gate da fase:** aba navegável 5 abas; `npx jest` sem regressão; `tsc`+`lint` limpos.

### D5 — Glifo `squareCheck` + `EmptyState` `'no-todos'` — RED→GREEN

- **Dependências:** —
- **Fazer:** `src/components/ui/Icon.tsx`: importar `SquareCheckBig` de `lucide-react-native` e mapear em `GLYPHS.squareCheck`. `src/components/feature/EmptyState.tsx`: `EmptyKind` += `'no-todos'` com cópia própria (ex.: título "Sem tarefas", body "Crie uma tarefa para organizar o dia."); **zero token novo**.
- **Arquivos:** Modify `src/components/ui/Icon.tsx`, `src/components/feature/EmptyState.tsx` (+ testes).
- **Testes de referência (RED — 2):** `Icon` `squareCheck` renderiza; `EmptyState` `no-todos` renderiza cópia e ícone.
- **Aceite:** zero hex novo; `theme/` intocado.

### D6 — `TodoRow` (componente row: checkbox + label + a11y) — RED→GREEN

- **Dependências:** — (usa `theme`);
- **Fazer:** novo `src/components/feature/TodoRow.tsx`:
  - Props: `{ todo: Todo; checked: boolean; onToggle: (id: string) => void; onPress?: (id: string) => void; overdue?: boolean }` (+ `accessibilityLabel`).
  - Render: `Pressable` com `accessibilityRole="checkbox"` + label `"Marcar {title} como concluída"` / `"{title}: concluída"`; estado **não-só-cor** (box ✓ + título riscado quando concluído); badge "atrasada" com token `danger` quando `overdue` (Q22).
  - `testID` por estabilidade: `todo-row-<id>`.
- **Arquivos:** Create `src/components/feature/TodoRow.tsx`, `src/components/feature/TodoRow.test.tsx`.
- **Testes de referência (RED — 4):** pendente label "Marcar ..."; concluído riscado + label "...: concluída"; toggle chama `onToggle(id)`; atrasado mostra marca (`danger`), concluído não.
- **Verificar:** `npx jest TodoRow`; `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** a11y explícita; estado não-só-cor.

### D7 — Tela da aba: `src/app/todos/index.tsx` — RED→GREEN

- **Dependências:** D1, D4, D5, D6.
- **Fazer:** nova rota `src/app/todos/index.tsx` com `AppScaffold title="Tarefas"` + action "Nova tarefa" (`router.push('/todos/create')`):
  - Ordena via `sortTodos`; seções `Hoje` (inclui atrasados), `Algum dia`, `Próximas` (renderiza "Próximas" só quando existe — Q11); completos no fim de cada seção (Q14/Q7).
  - Cada `TodoRow` com `onPress` → `/todos/<id>/edit`; toggle → `repos.todos.setCompleted/setUncompleted` + `triggerSuccess()` + `showToast` (Q20); **sem** achievement/celebração.
  - `todos.length === 0` → `EmptyState kind="no-todos"` c/ action de criação.
- **Arquivos:** Create `src/app/todos/index.tsx` (+ teste). Modify `src/components/layout/NavItems.tsx` (Calendário → Tarefas `/todos`, ícone `squareCheck`, 4ª posição — Q2/Q5).
- **Testes de referência (RED — 3):** renderiza seções na ordem certa c/ dados fixture; toggle dispara repos mock + toast path; empty state quando sem to-dos. NavItems: item `Tarefas` presente e `Calendário` ausente.
- **Verificar:** `npx jest todos`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`; `npx expo export --platform web`.
- **Aceite:** aba navegável; 5 abas; a11y não-só-cor; sem regressão.

### D8 — Form + telas create/edit (tela dedicada, Q12) — RED→GREEN

- **Dependências:** D1, D3, D7.
- **Fazer:**
  - `src/features/todo/todo-form.tsx` (padrão `routine-form.tsx`): campo título (Input) + `DatePicker` opcional (reuso `DatePicker`) + botão salvar; valida via `validateTodoTitle` (Q4 tidy); permite **sem data** ("Algum dia").
  - `src/app/todos/create.tsx`: `<TodoForm onSubmit>` → `repos.todos.create` + toast + `router.back()`.
  - `src/app/todos/[id]/edit.tsx`: carrega por id, `<TodoForm initial>`, salvar `repos.todos.update`, e **excluir com confirmação** (Q13) — `Alert.alert('Excluir tarefa?', ...)` com `remove`.
- **Arquivos:** Create `src/features/todo/todo-form.tsx`, `src/app/todos/create.tsx`, `src/app/todos/[id]/edit.tsx` (+ testes).
- **Testes de referência (RED — 4):** form valida título vazio (não envia); cria com data e sem data ("Algum dia"); edita e salva; excluir confirma e remove.
- **Verificar:** `npx jest` (regex `todo-form|todos`); `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** fluxo criar→editar→excluir completo; confirmação de exclusão.

**— Fim FASE F3 —**

---

# FASE F4 — Hoje: seção "Tarefas de hoje" (Q15/Q16)

**Gate da fase:** `npx jest` sem regressão; `tsc`+`lint` limpos.

### D9 — Tarefas de hoje na Home (`TodayTodos`) — RED→GREEN

- **Dependências:** D1, D4, D6.
- **Fazer:** novo `src/components/feature/TodayTodos.tsx`: recebe `todos`, `today`, `onToggle`; seleciona to-dos de hoje via `todosForDay` + **atrasados não concluídos** (`isOverdue`); renderiza `TodoRow`s (marcáveis com toast+haptics — Q20); oculto se vazio. Sem quick-add (Q16).
- **Arquivos:** Create `src/components/feature/TodayTodos.tsx` (+ teste). Modify `src/app/index.tsx` (renderizar `TodayTodos` após os grupos de hábitos, **antes** da linha de créditos — SPEC §3.4/§9).
- **Testes de referência (RED — 3):** renderiza só hoje+atrasados (não "Algum dia"); toggle dispara; atrasado com marca, concluído riscado.
- **Verificar:** `npx jest TodayTodos`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** Hoje marcável; stats/streak não tocados (L7).

**— Fim FASE F4 —**

---

# FASE F5 — Estatísticas: mês interativo + detalhe do dia + remover aba Calendário (C5-6/C5-7/C5-9)

**Gate da fase:** `npx jest` sem regressão; `tsc`+`lint` limpos; `calendar/index.tsx` removido sem referências órfãs.

### D10 — Mês interativo + detalhe inline (Q17/Q18/Q19) — RED→GREEN

- **Dependências:** D4, D6, D9.
- **Fazer:**
  - `src/components/feature/dashboard/MonthView.tsx`: dias viram `Pressable` chamando novo prop `onSelectDay(dateKey)`; **reuso** `CalendarDayCell`/`calendarDayInfo` (Q18) para o detalhe. *(Mudança de contrato: novo prop opcional com default para não quebrar `MonthView.test.tsx` existente — verificar e atualizar fixture.)*
  - Novo `src/components/feature/CalendarDetail.tsx`: painel do dia (padrão visual do `dayCard` de `calendar/index.tsx`): (a) status por hábito **read-only** (`statusForView` — ✓/—/✕/○) e (b) to-dos do dia via `TodoRow` **marcáveis** (Q19/L6), com toast+haptics (Q20).
  - `src/app/statistics/index.tsx`: estado `selectedDay` + `monthDayStatus`; renderizar `<CalendarDetail>` inline abaixo do mês quando `selectedDay` (Q17).
- **Arquivos:** Modify `src/components/feature/dashboard/MonthView.tsx` (+ teste), `src/app/statistics/index.tsx` (+ teste); Create `src/components/feature/CalendarDetail.tsx` (+ teste).
- **Testes de referência (RED — 5):** dia clicável dispara `onSelectDay(dateKey)`; detalhe mostra hábito read-only (não dispara toggle de habit); to-do do dia marcável via `TodoRow`; concluído riscado no detalhe; `MonthView` sem `onSelectDay` segue renderizando (retro-compat fixture).
- **Verificar:** `npx jest statistics`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`; `npx expo export --platform web`.
- **Aceite:** expansão inline; read-only habits; to-dos acionáveis; `repos.records` nunca chamado aqui.

### D11 — Remover aba/rota Calendário (C5-9) — RED→GREEN

- **Dependências:** D10 (funcionalidade migrada p/ stats).
- **Fazer:** remover `src/app/calendar/index.tsx`; garantir **zero referências órfãs** (`grep -r "/calendar" src` só no histórico); `NavItems` já aponta `/todos` (D7). `MonthGrid` local da tela antiga não é exportado (module-local).
- **Arquivos:** Delete `src/app/calendar/index.tsx`.
- **Testes de referência (RED — 1 negativa):** nenhum arquivo de `src/` importa de `app/calendar`; suite integral verde.
- **Verificar:** `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`; `grep -r "app/calendar\|/calendar" src`.
- **Aceite:** rota removida; navegação com 5 abas íntegra.

**— Fim FASE F5 —**

---

# FASE F6 — Export/import roundtrip (C5-8) + isolamento (L7)

**Gate da fase:** `npx jest exportImport` + integration verdes; `tsc`+`lint` limpos.

### D12 — Roundtrip `todos` + não-contaminação de stats (Q21/L7) — RED→GREEN

- **Dependências:** D2, D3, D4.
- **Fazer:** **nenhum código de produção** (export/import genérico já cobre `todos` — Q21); apenas testes:
  - `exportImport.test.ts`: cria to-dos → `buildExport` → `importPayload` em store novo → `todos` restaurados; backup **v1 legado** (sem `todos`) importa sem erro (migration c5.6).
  - Teste de **não-regressão L7**: com to-dos criados/concluídos, `daySummary`/`computeOverallsStreaks`/`monthDayStatus` retornam os mesmos valores de antes (prova que stats ignoram to-dos — Q23).
- **Arquivos:** Modify `src/data/exportImport.test.ts`, `src/domain/stats/aggregate.test.ts` (ou `integration.test.ts`).
- **Testes de referência (RED — 4):** roundtrip c/ to-dos; backup v1 migra; to-dos não alteram `daySummary`; to-dos não alteram streak/`monthDayStatus`.
- **Verificar:** `npx jest exportImport`; `npx jest` (regressão); `npx tsc --noEmit`; `npx expo lint`.
- **Aceite:** L7 provado por teste; backups legados seguros.

**— Fim FASE F6 —**

---

# FASE F7 — Verificação final + release (State 3 — FUTURO; NÃO executar nesta missão)

### D13 — Verificação final DoD + regressão (C5 completo)

- **Dependências:** D1..D12.
- **Fazer:** `npx jest` integral (**281 baseline + novos, ~+25–35**); `tsc`/`lint`/web; checklist SPEC-c5 §11; `docs/REVIEW-c5.md`; re-index Codebase Memory 1× + delta nodes/edges.
- **Arquivos:** `docs/REVIEW-c5.md`.
- **Aceite:** DoD global; zero regressão; `records`/`opens.ts`/charts intocados.

### D14 — Release (State 3 — predefinido; NÃO rodar nesta missão)

- **Fazer:** bump `versionCode 15` / `versionName 3.0.0` (`app.json` + `android/app/build.gradle`, regras touch **intocadas**); build arm64 (`assembleRelease`, APK < 50MB); GitHub release **v0.3.0-vc15** (`HabitFlow-arm64.apk`, anônimo HTTP 200, `MTitoS`); push main; `docs/PROGRESS-c5.md`.
- **Aceite:** release publicada; download anônimo 200; build regras intactas.

---

## 2. Dependências (resumo)

```
F1: D1
F2: D2 → D3 → D4
F3: D5(independente) · D1 → D6 → D7 ; D7 → D8
F4: D1,D4,D6 → D9
F5: D9 → D10 ; D10 → D11
F6: D2,D3,D4 → D12
F7: D1..D12 → D13 → D14
```

Corrente crítica: `D1 → D3 → D4 → D7 → D8` (persistência → aba). `D10` (Estatísticas) depende de `D9`. `D5` é independente e pode começar cedo.

## 3. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Remoção da aba Calendário deixa funcionalidade órfã | D10 migra `dayCard` para `CalendarDetail` ANTES de D11; grep de órfãos pós-exclusão |
| Mudar `MonthView` quebra teste existente | Prop novo `onSelectDay` opcional + default; fixture ajustada só se necessário (contrato documentado na task) |
| L7 (stats não leem to-dos) regredir | Teste de não-regressão explícito em D12 (baseline de valores antes/depois) |
| `DB_VERSION` 2 quebrar backup v1 | Migration aditiva + teste em D2/D12 |
| Glifo lucide inexistente no SDK 57 | `SquareCheckBig` existe em `lucide-react-native` ^1.x; fallback `ListChecks` se ausente (verificar no moment de D5) |
| DataProvider reload demorar em telas com `todos` | `Promise.all` já paraleliza; sem I/O extra bloqueante |

## 4. Matriz de rastreabilidade task → SPEC → artefato → teste

| Task | SPEC | Artefato principal | Teste |
|---|---|---|---|
| D1 | C5-1 | `domain/todo/model.ts` | `model.test.ts` (7) |
| D2 | C5-2 | `schema.ts`+`migrations/index.ts` | `exportImport.test.ts` (3) |
| D3 | C5-2 | `repositories/{types,impl}.ts` | `repositories.test.ts` (8) |
| D4 | C5-2 | `DataProvider.tsx` | `integration.test.ts` (1) |
| D5 | C5-3 | `Icon.tsx`+`EmptyState.tsx` | (2) |
| D6 | C5-4 | `feature/TodoRow.tsx` | `TodoRow.test.tsx` (4) |
| D7 | C5-3/C5-4 | `app/todos/index.tsx`+`NavItems.tsx` | (3) |
| D8 | C5-4 | `todo-form`+`create`+`[id]/edit` | (4) |
| D9 | C5-5 | `feature/TodayTodos.tsx`+`app/index.tsx` | (3) |
| D10 | C5-6/C5-7 | `MonthView`+`CalendarDetail`+`statistics/index.tsx` | (5) |
| D11 | C5-9 | delete `calendar/index.tsx` | (1) |
| D12 | C5-8/L7 | `exportImport.test.ts` | (4) |
| D13 | §11 | `REVIEW-c5.md` | suite |
| D14 | §11/16 | release v0.3.0 | HTTP 200 |

**Σ novos ≈ 45** (alvo ~+35; folga para meses com 31 dias/edge). *Ajustar para ≥25/mantendo cobertura — prioridade comportamento sobre número.*

## 5. Ordem de execução sugerida

`D5` (F3, cedo) · `D1 → D2 → D3 → D4` (F1+F2) · `D6 → D7 → D8` (F3) · `D9` (F4) · `D10 → D11` (F5) · `D12` (F6) · `D13 → D14` (F7).