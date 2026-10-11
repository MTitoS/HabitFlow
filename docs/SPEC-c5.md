# SPEC-c5 — HabitFlow · Aba Tarefas (to-dos) + calendário detalhado expansível em Estatísticas

> Ciclo **c5**. Derivado de `docs/SPEC_DRIVER.md`, `docs/SPEC-e1.md` (semântica day-cell),
> `docs/SPEC-c4.md` (charts) e do estado real do repo em **v0.2.3-c4fix**.
>
> Foco: **introduzir um módulo isolado de Tarefas (to-dos)** com uma **nova aba que substitui a aba
> Calendário**, e **migrar o calendário detalhado por dia para dentro de Estatísticas** (expansão ao
> tocar o mês existente), com to-dos visíveis e marcáveis em Hoje e no detalhe do dia.
>
> **Este documento é um seed de discovery.** Ele fixa as definições já fechadas pelo Tito, audita o
> estado atual e lista as **decisões abertas numeradas (Q1..Qn)** com recomendação (`->`) para os
> grilling rounds do Hermes. **Nenhuma pergunta foi aberta ao usuário neste discovery; nenhum código
> foi alterado.**
>
> Baseline verificado: **281 testes / 42 suites** (`npx jest`, 2026-10-11). *(O briefing citava 243 —
> o número real é 281; ver Q23.)*

---

## 0. Correção factual do briefing (ler antes de tudo)

1. **Não existe WatermelonDB neste repositório.** O briefing diz "Nova tabela WatermelonDB;
   migration = tabela nova", mas a persistência real é um **`DataStore` próprio e minimalista**
   (`src/data/adapters/{memory,asyncStorage}.ts`) sobre **AsyncStorage**, com uma abstração de
   tabelas. A decisão D5 (`docs/PROGRESS.md`) registra explicitamente que o WatermelonDB/Nozbe foi
   **substituído** porque não pareava com SDK 57/RN 0.86, mantendo o contrato de schema/índices/
   migrations em `src/data/schema.ts`.
   → **"Nova tabela + migration" é implementado no schema próprio** (TABLES + TABLE_DEFINITIONS +
   MIGRATIONS + DB_VERSION), **não** em WatermelonDB. Vira a decisão **Q6**.
2. A **navegação não usa tabs do Expo Router.** É um `AppScaffold` próprio (`bottom nav` mobile /
   `sidebar` desktop) dirigido por `NAV_ITEMS` em `src/components/layout/NavItems.tsx`. Trocar/adição
   de aba = editar esse array + criar a rota.
3. As 5 abas atuais são **Hoje, Hábitos, Estatísticas, Calendário, Ajustes**. O briefing cita
   "Home/Habitos/Estatisticas/Calendario/Ajustes" — bate.

---

## 1. Escopo

### 1.1 Incluído

| # | Item | Tipo |
|---|---|---|
| C5-1 | Modelo de domínio `Todo` + validação (puro, testável) | Domínio |
| C5-2 | Persistência: nova tabela `todos` + `TodoRepository` no `DataStore` próprio | Data |
| C5-3 | Nova aba **Tarefas** substituindo **Calendário** (5 abas preservadas) | Navegação |
| C5-4 | Tela Tarefas: listar/criar/editar/concluir/excluir to-dos | Feature |
| C5-5 | To-dos de hoje aparecem em **Hoje** (seção própria) | Feature |
| C5-6 | **Calendário detalhado expansível dentro de Estatísticas**: tocar o mês existente (`MonthView`) expande o detalhe do dia (habits + to-dos) | Feature |
| C5-7 | To-dos **marcáveis** a partir do detalhe do dia em Estatísticas | Feature |
| C5-8 | Export/import incluindo `todos` (roundtrip) | Data |
| C5-9 | Remover a rota `src/app/calendar/index.tsx` | Navegação |

### 1.2 Fora do escopo (YAGNI / não quebrar)

- **Recorrência de to-dos** — não existe (fechado pelo Tito).
- **To-dos em stats/streak/completion rate/achievements** — módulo **isolado** (fechado pelo Tito).
- **Notificações/reminders de to-dos** — fora.
- **To-dos quantitativos/valor/meta** — binário apenas (feito/não feito).
- **Alteração do modelo `Habit`/`HabitRecord`, transições, charts c4fix, `opens.ts`** — intactos.
- **Reescrita da UI de habit records** — intacta.
- **Subtarefas, tags, prioridade, anexos, projetos** — fora.

---

## 2. Definições já fechadas pelo Tito (locked — não reabrir)

| # | Decisão |
|---|---|
| L1 | `Todo` = `{ id, titulo, data opcional, concluido, completedAt, timestamps }`. |
| L2 | Sem recorrência. |
| L3 | To-do **sem data** = pertence a **"Algum dia"** (someday list). |
| L4 | A **nova aba Tarefas substitui a aba Calendário**; mantêm-se **5 abas**. |
| L5 | O **calendário detalhado migra para DENTRO de Estatísticas**, expansível ao tocar o calendário existente. |
| L6 | To-dos aparecem em **Hoje** (seção própria) e no **calendário detalhado por dia**, **marcáveis dali também**. |
| L7 | To-dos **NÃO** entram em stats/streak/completion rate (módulo isolado). |
| L8 | **Nova tabela**; migration = **tabela nova**. |

---

## 3. Estado atual auditado (v0.2.3-c4fix)

### 3.1 Navegação

- `NAV_ITEMS` (`NavItems.tsx:8`): `Hoje` `/`, `Hábitos` `/habits`, `Estatísticas` `/statistics`,
  `Calendário` `/calendar`, `Ajustes` `/settings`.
- `AppScaffold` renderiza sidebar (desktop) e bottom nav (mobile) a partir de `NAV_ITEMS`; a
  `match` define o item ativo (`AppScaffold.tsx:24`).
- Ícones disponíveis em `Icon.tsx` (`GLYPHS`): `calendar`, `check`, `list` (=`ListTodo`, já usado por
  Hábitos), `target`, `tag`, `book`, `star`, etc. Não há um glifo "check square" dedicado.

### 3.2 Camada de dados

- `src/data/schema.ts`: `DB_VERSION = 1`; `TABLES = ['habits','records','routines','skipcredit']`;
  `TABLE_DEFINITIONS` (campos por tabela). **Não há WatermelonDB.**
- `src/data/adapters/{memory,asyncStorage}.ts`: `readTable`/`writeTable`/`snapshotTables`/
  `restoreTables`. **Tabela ausente lê como `[]`** (memory: `rows ? ... : []`).
- `src/data/migrations/index.ts`: `MIGRATIONS: Migration[] = []` (vazio); `applyMigrations` chamado só
  no `validatePayload` do export/import.
- `src/data/exportImport.ts`: `validatePayload` rejeita `version > DB_VERSION`.
- `src/data/repositories/{types,impl}.ts`: interfaces `HabitRepository`, `RecordRepository`,
  `RoutineRepository`, `SkipCreditRepository`; factories por closure sobre `DataStore`;
  `generateId(prefix)`. **Registro de escrita de `records` exige `toDateKey(now) === dateKey`**
  (`impl.ts:125` — "só hoje").
- `DataProvider.tsx`: `reload()` faz `Promise.all` de habits/records/routines/skipCredit; `store.
  subscribe` → `reload`; contexto tipado `DataContextValue`.

### 3.3 Padrão de features (A–E)

- Domínio puro em `src/domain/<área>/*.ts` + `.test.ts` ao lado.
- Formulários por feature em `src/features/<área>/*-form.tsx` (ex.: `routine-form.tsx`).
- Telas em `src/app/<rota>/index.tsx` (+ `[id]/edit.tsx`, `create.tsx`), usando `AppScaffold`.
- Listas navegáveis: `routines/index.tsx` (Pressable → `/routines/[id]/edit`).
- Primitivas de UI em `src/components/ui/**` (`Button`, `Input`, `Select`, `DatePicker`, `Card`,
  `Checkbox`/`HabitCheckbox`, `Icon`, `EmptyState`, `Toast`).

### 3.4 Hoje (`src/app/index.tsx`)

- Ordem: `HomeStreakHeader` → `TodayProgress` → grupos de hábitos por rotina → linha de créditos de
  pulo → overlays de celebração.
- `toggleHabit` usa `repos.records.setCompleted/setPending` + `triggerSuccess()` + `showToast`.
- `maybeCelebrate` dispara `computeAchievements` (milestone / all-done).

### 3.5 Estatísticas (`src/app/statistics/index.tsx`)

- Composição: `ProgressRing`/resumo → `StreakCard` → stats totais → `WeeklyChart` →
  `CompletionChart` → **`MonthView`** (calendário do mês, **sem detalhe**, `MonthView.tsx`).
- `MonthView` renderiza grid próprio (`stateMeta` conqu/partial/neutral) e **não** usa
  `CalendarDayCell`. Sem interação (não é `Pressable`).

### 3.6 Aba Calendário (`src/app/calendar/index.tsx`) — a ser removida

- `MonthGrid` + `CalendarDayCell` + `dayStatus(selectedDay)` — detalhe por hábito (✓/—/✕/○) ao tocar
  o dia, num card abaixo do grid. **É esta a funcionalidade de "calendário detalhado" que migra.**
- Depende de `calendarDayInfo` / `statusForView` (e1/c3).
- **Única referência à rota:** `NAV_ITEMS` + o próprio arquivo (grep confirma; nenhum teste).

### 3.7 HabitDetail (`src/app/habits/[id]/index.tsx`)

- Já tem "detalhe por hábito" em janela de 7 dias (`WeekStatusRow`) — **não** é um calendário de mês.
  Não é afetado por c5 (apenas referência de padrão de detalhe).

---

## 4. Modelo de domínio proposto (seed — sujeito a Q4/Q5)

`src/domain/todo/model.ts` (novo), no padrão de `domain/habit/model.ts`:

```ts
export interface Todo {
  id: string;
  title: string;          // PT label na UI: "Tarefa"
  date?: string;          // dateKey 'YYYY-MM-DD' (mesmo formato de records.date); ausente = "Algum dia"
  completed: boolean;
  completedAt?: number;   // epoch ms; presente só quando completed
  createdAt: number;      // epoch ms
  updatedAt: number;      // epoch ms
}
```

Invariantes propostas (puros, testáveis):
- `completed === true ⇔ completedAt` definido.
- `date` ausente/vazio ⇒ to-do de "Algum dia".
- Sem `archivedAt` (YAGNI): exclusão é hard delete.
- `title` não vazio (trim).

Funções auxiliares candidatas: `groupedByDay(todos, todayKey)` / `todosForDay(todos, dateKey)` /
`undatedTodos(todos)` / `isOverdue(todo, todayKey)`.

---

## 5. Persistência proposta (seed — sujeito a Q6).

- `TABLES` += `'todos'`; `TABLE_DEFINITIONS` += `{ name: 'todos', fields: [...] }`.
- `DB_VERSION` 1 → 2 e `MIGRATIONS` += `{ from: 1, to: 2, up: (t) => ({ ...t, todos: t.todos ?? [] }) }`
  (garante que backups v1 antigos ganhem a tabela vazia no `applyMigrations`).
- `TodoRepository` em `repositories/types.ts` + factory em `impl.ts` (`T_TODOS = 'todos'`).
- `DataProvider`: adicionar `todos` ao `Promise.all` do `reload()` e ao `DataContextValue`.

---

## 6. Navegação proposta (seed)

- `NAV_ITEMS`: trocar o item Calendário por `{ href: '/todos', label: 'Tarefas', icon: '?', match: '/todos' }`.
  Manter as 5 posições atuais (Tarefas na 4ª). (Sujeito a Q1/Q2/Q3.)
- Remover `src/app/calendar/index.tsx`.
- Nova rota `src/app/todos/index.tsx` (+ eventual `create`/`[id]/edit` conforme Q12).

---

## 7. Detalhe do dia em Estatísticas (seed)

- Tornar o `MonthView` (ou um wrapper) interativo: tocar um dia seleciona `dateKey` e **expande** um
  painel de detalhe (padrão visual do `dayCard` que existe hoje em `calendar/index.tsx`).
- O painel mostra: (a) status por hábito (✓/—/✕/○, **read-only**, derivado de `statusForView`), e
  (b) **to-dos do dia com toggle** (marcáveis — L6).
- Reuso preferencial de `CalendarDayCell` e `calendarDayInfo` (e1). (Sujeito a Q17/Q18/Q19.)

---

## 8. Isolamento do módulo (L7) — contratos que não mudam

- `daySummary`, `weeklySeries`, `monthlySeries`, `totals`, `completionRate`, `computeStreaks`,
  `computeOverallStreaks`, `computeAchievements`, `monthDayStatus` — **não leem to-dos**.
- `CalendarDayInfo`/`MonthDayState` continuam derivados **só** de habits/records.
- Nenhum to-do entra em `TodayProgress`, `StreakCard`, `WeeklyChart`, `CompletionChart`, `MonthView`.

---

## 9. Gaps por arquivo (seed — nomes finais dependem de Q1)

| Arquivo | Mudança |
|---|---|
| `src/domain/todo/model.ts` | **Novo** — `Todo` + helpers puros |
| `src/domain/todo/model.test.ts` | **Novo** — invariantes/agrupamento |
| `src/data/schema.ts` | `todos` em `TABLES`/`TABLE_DEFINITIONS`; `DB_VERSION` 1→2 |
| `src/data/migrations/index.ts` | migration `1→2` (tabela vazia) |
| `src/data/repositories/types.ts` | `TodoRepository` + `Repositories.todos` |
| `src/data/repositories/impl.ts` | factory `createTodoRepository` |
| `src/data/DataProvider.tsx` | `todos` no reload/contexto |
| `src/data/__tests__/repositories.test.ts` | + casos do repo |
| `src/data/exportImport.test.ts` | + roundtrip com `todos`; migração v1→v2 |
| `src/components/layout/NavItems.tsx` | Calendário → Tarefas |
| `src/app/todos/index.tsx` | **Nova** tela Tarefas |
| `src/app/todos/**` | **Novos** create/edit (conforme Q12) |
| `src/features/todo/todo-form.tsx` | **Novo** (se tela dedicada) |
| `src/components/feature/TodoRow.tsx` | **Novo** — checkbox + label a11y |
| `src/components/feature/TodayTodos.tsx` | **Novo** — seção de Hoje |
| `src/app/index.tsx` | seção de to-dos de hoje |
| `src/components/feature/dashboard/MonthView.tsx` | dia `Pressable` + expansão (ou wrapper) |
| `src/components/feature/dashboard/CalendarDetail.tsx` | **Novo** — detalhe do dia (habits + todos) |
| `src/app/statistics/index.tsx` | integrar detalhe expansível |
| `src/app/calendar/index.tsx` | **Remover** |
| `src/data/adapters/*` | inalterado (genérico) |
| `src/theme/*` | possivelmente +1 token de ícone/estado (Q3/Q22) |

---

## 10. Acessibilidade (padrão A–E)

- Tab Tarefas: `accessibilityRole="tab"` (bottom) e `"button"` (sidebar), como as demais.
- Toggle de to-do: role/label explícitos (`"Marcar <título> como concluída"` /
  `"<título>: concluída"`), estado não-só-cor (✓ + riscado/texto).
- Dia do mês: reaproveitar os `accessibilityLabel` de `CalendarDayCell` (e1).
- Detalhe do dia: labels por linha (habits read-only + to-dos acionáveis).

---

## 11. Critérios de aceite (DoD c5)

- [ ] Aba **Tarefas** existe, **Calendário** não; **5 abas** preservadas.
- [ ] Criar/editar/concluir/reabrir/excluir to-do funcionam e persistem (AsyncStorage).
- [ ] To-do **sem data** aparece em "Algum dia"; to-do com data aparece no dia.
- [ ] To-dos de hoje aparecem em **Hoje** numa seção própria e são marcáveis.
- [ ] Em **Estatísticas**, tocar o mês expande o detalhe do dia; to-dos do dia são **marcáveis dali**.
- [ ] Detalhe do dia mostra status por hábito (read-only) + to-dos.
- [ ] To-dos **não** alteram nenhum número de stats/streak/completion.
- [ ] Export/import roundtrip inclui `todos`; backup v1 antigo migra sem erro.
- [ ] `src/app/calendar/index.tsx` removido e sem referências órfãs.
- [ ] Baseline **281 testes** sem regressão + novos verdes; `tsc`, `lint`, web export limpos.
- [ ] Habit records, charts c4fix e `opens.ts` intocados.

---

## 12. DECISÕES ABERTAS (grilling) — Q1..Q23

> Formato: **Q\* — <título>**: contexto; recomendação `->`. O Hermes resolve em rounds (ver §13),
> usando as dependências indicadas. Nada aqui foi perguntado ao usuário neste discovery.

### Bloco A — Nomenclatura & navegação

**Q1 — Nome canônico: `todo`/`todos` vs `task`/`tasks`.**
Todo o código é em inglês (`Habit`, `Routine`, `Record`); a UI é PT ("Tarefas"). A rota pode ser
`/todos` (coerente com o domínio) ou `/tasks`.
-> **`todo` no código/domínio/tabela (`todos`) e na rota (`/todos`); label PT "Tarefa(s)".** Evita
duplicar vocabulário.

**Q2 — Posição da aba Tarefas.**
Opções: (a) ocupar a posição da Calendário (4ª, mínimo churn); (b) ficar antes de Estatísticas
(3ª); (c) depois de Estatísticas.
-> **(a) 4ª posição** (substitui Calendário no mesmo slot) — menor blast radius e mantém o polegar
na mesma zona.

**Q3 — Ícone da aba Tarefas.**
`list` já é de Hábitos; `check` é genérico. Não há glifo "check-square".
-> **Adicionar glifo novo `checkbox`/`squareCheck` (lucide `SquareCheckBig`/`ListChecks`) em
`Icon.tsx`** e usá-lo. Alternativa de emergência: reusar `check`.

### Bloco B — Modelo & persistência

**Q4 — Nomes/campos exatos do `Todo`.**
PT do Tito: `{id, titulo, data, concluido, completedAt, timestamps}`. Código em inglês.
-> **`{ id, title, date?, completed, completedAt?, createdAt, updatedAt }`** (§4). Campo `title` (não
`titulo`), `completed: boolean` (não enum/status). Mantém simetria com `Habit.updatedAt`.

**Q5 — Formato de `date` e semântica de "Algum dia".**
`records.date` é `dateKey` `'YYYY-MM-DD'`.
-> **`date?: string` dateKey**; ausente ⇒ "Algum dia". Sem hora, sem fuso (reusa `dateUtils`).
Não usar `Date`/ISO completo.

**Q6 — Migration: bump `DB_VERSION` mesmo?**
Tabela ausente já lê `[]`; logo, funcionalmente aditivo.
-> **Sim: `DB_VERSION` 1→2 + `MIGRATIONS` `{from:1,to:2}` adicionando `todos: []`**, para que
`validatePayload`/`applyMigrations` de backups antigos fiquem explícitos e o `version` do snapshot
reflita a tabela nova. Sem tocar dados existentes.

**Q7 — Ordenação canônica na lista.**
-> **Completos por último; dentro do grupo, por `date` asc, depois `createdAt` asc;** to-dos sem data
em seção "Algum dia" própria. Função pura `sortTodos` (padrão `sortHabits`).

### Bloco C — Repositório/API

**Q8 — Interface `TodoRepository`.**
-> `all()`, `byDate(dateKey)`, `undated()`, `create(input: Omit<Todo,'id'|'createdAt'|'updatedAt'|'completed'|'completedAt'>)`,
`update(todo)`, `setCompleted(id, now)`, `setUncompleted(id)`, `remove(id)`. Guarda `updatedAt`.

**Q9 — Regra de escrita (sem "só hoje").**
`records` proíbe escrita fora de hoje; to-dos são itens do usuário, completáveis a qualquer tempo.
-> **Sem guarda temporal**: criar/concluir/reabrir em qualquer data. Toggle é idempotente.

**Q10 — Concluir/reabrir e `completedAt`.**
-> `setCompleted` grava `completed:true, completedAt:now`; `setUncompleted` grava `completed:false` e
**remove `completedAt`** (invariante §4). Não há histórico de reabertura (YAGNI).

### Bloco D — Tela Tarefas

**Q11 — Layout da aba.**
Opções: (a) seções `Hoje` / `Algum dia` (+ `Próximas` se houver futuros); (b) lista plana com filtros.
-> **(a) seções**: `Hoje` (date === hoje, inclui atrasados conforme Q15), `Algum dia` (sem data),
`Próximas` (date > hoje) só quando existirem. Mais simples e sem estado de filtro.

**Q12 — Criar/editar: tela dedicada vs inline.**
Padrão do repo = telas dedicadas (`/routines/create`, `/habits/create`). To-dos são leves.
-> **Tela dedicada `src/app/todos/create.tsx` + `src/app/todos/[id]/edit.tsx`** com
`features/todo/todo-form.tsx` (campo título + `DatePicker` opcional), coerente com o resto do app.
(Alternativa inline fica registrada como rejeitada por inconsistência.)

**Q13 — Excluir.**
-> **Ação explícita de excluir com confirmação** (padrão dos hábitos), não swipe (sem dependência de
gesture nesta área hoje).

**Q14 — Mostrar concluídos.**
-> **Sim**: concluídos do dia ficam visíveis (riscados, no fim da seção) e não somem; a aba é o
arquivo do usuário. Se houver volume, colapsar concluídos antigos (não no v1).

### Bloco E — Hoje

**Q15 — Quais to-dos aparecem em Hoje e onde.**
-> **Seção "Tarefas de hoje" logo após os grupos de hábitos** (antes da linha de créditos),
mostrando **date === hoje e atrasados não concluídos** (marca discreta de atraso). To-dos "Algum dia"
**não** aparecem em Hoje.

**Q16 — Quick-add de to-do em Hoje.**
-> **Não no v1** (YAGNI); adiciona-se pela aba Tarefas. Reavaliar depois.

### Bloco F — Estatísticas: detalhe expansível

**Q17 — Mecânica de expansão: inline (accordion) vs rota nova.**
L5 diz "expandível ao tocar o calendário existente".
-> **Inline**: tocar um dia do `MonthView` abre um painel de detalhe sob o card do mês (mesmo
componente/tela). Sem rota nova.

**Q18 — Interatividade do `MonthView` vs wrapper + remoção da aba Calendário.**
-> **Tornar os dias do `MonthView` `Pressable`** (ou envolver com `CalendarDetail`) e reusar
`CalendarDayCell`/`calendarDayInfo`; **remover `src/app/calendar/index.tsx`**. Mantém `dateKey`
selecionado no estado da tela Estatísticas.

**Q19 — Conteúdo e poderes do detalhe.**
-> Detalhe mostra: (a) status por hábito **read-only** (`statusForView`, sem escrita retroativa) e
(b) **to-dos do dia com toggle** (L6). Nada de editar habit records ali.

### Bloco G — Transversal

**Q20 — Feedback ao concluir to-do (toast/haptics/celebração).**
-> **Toast + `triggerSuccess()`** (como hábito); **sem** `MilestoneCelebration`/`CelebrationOverlay`
e **sem** achievements (L7).

**Q21 — Export/import e backups antigos.**
-> `todos` entra automaticamente via `snapshotTables`; migration v1→v2 cobre backups legados; manter
`validatePayload` sem rebaixar `DB_VERSION` (Q6). Documentar no `settings/data.tsx` se útil.

**Q22 — Empty states e tokens novos.**
-> Reusar `EmptyState` (provável novo `kind: 'no-todos'` com cópia própria) e preferir **zero token
novo**; se o estado "atrasado" exigir cor, usar token existente (`danger`/`accent`) antes de criar.

**Q23 — Baseline de testes e escopo de cobertura.**
Briefing citou 243; real é **281/42**. Confirmar baseline e alvo.
-> **Baseline 281; alvo +~25–35 testes**: modelo/helpers de todo, repo (CRUD+toggle), migração/
export roundtrip, `TodoRow`, `TodayTodos`, tela Tarefas, `CalendarDetail`, e um teste de não-regressão
garantindo que stats/streak ignoram to-dos.

---

## 13. Ordem sugerida de grilling (dependências do design tree)

- **Round 1 (fundação):** Q1, Q2, Q3, Q4, Q5, Q6, Q7 — desbloqueiam todo o resto.
- **Round 2 (data/API + tela):** Q8, Q9, Q10, Q11, Q12, Q13, Q14.
- **Round 3 (integração UX):** Q15, Q16, Q17, Q18, Q19, Q20.
- **Round 4 (fechamento):** Q21, Q22, Q23.

Regra: uma pergunta cuja resposta dependa de outra ainda aberta pertence ao round seguinte.

---

## 14. Riscos

| Risco | Mitigação |
|---|---|
| Briefing assume WatermelonDB (inexistente) | §0 + Q6: implementar no `DataStore` próprio; validar com o Tito |
| Quebra de backups antigos ao mudar `DB_VERSION` | migration `1→2` aditiva + teste de roundtrip (Q6/Q21) |
| Contaminação de stats (L7) | testes negativos dedicados; módulo isolado por diretório |
| Remoção da aba Calendário deixar referências órfãs | grep confirma que só `NAV_ITEMS` referencia `/calendar`; remover ambos |
| Divergência `MonthView` (visual próprio) vs `CalendarDayCell` (e1) | decidir reuso em Q18; se não reusar, documentar por quê |
| Escopo crescer (recorrência, prioridade, notificação) | YAGNI explícito em §1.2 |

---

## 15. Registro de decisões (custódia) — apenas o que já está fechado

| # | Decisão | Custódia |
|---|---|---|
| c5.1 | Modelo `Todo` sem recorrência; sem data = "Algum dia" | `domain/todo/model.ts` |
| c5.2 | Tarefas substitui Calendário (5 abas) | `NavItems.tsx` |
| c5.3 | Detalhe do dia migra para Estatísticas (expansível) | `statistics/index.tsx` + `CalendarDetail` |
| c5.4 | To-dos em Hoje + no detalhe do dia; marcáveis | `TodayTodos` + `CalendarDetail` |
| c5.5 | Módulo isolado (sem stats/streak) | `domain/todo` + repositório dedicado |
| c5.6 | Persistência = tabela nova no `DataStore` próprio (+migration) | `schema.ts` + `migrations` |

---

## 16. Verificação (ao fim da implementação)

```bash
npx jest                 # baseline 281 + novos verdes
npx tsc --noEmit
npx expo lint
npx expo export --platform web   # coerente com reviews anteriores
```

---

*Anexos de contexto (padrões e formatos): `docs/SPEC-e1.md` (estrutura de SPEC + semântica day-cell),
`docs/SPEC-c4.md` (charts), `docs/SPEC_DRIVER.md` (fonte de produto), `docs/PROGRESS.md` (D5:
substituição do WatermelonDB).*
