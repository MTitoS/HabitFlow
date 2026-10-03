# PLAN — HabitFlow · Plano de implementação TDD (RUG State 2)

> Gerado a partir de `docs/SPEC.md` (contrato técnico) e `docs/SPEC_DRIVER.md` §44 (ordem) + §45 (qualidade).
> Instagram de execução: **um executor futuro, sem ler o SPEC completo, consegue executar task a task.**
> Toda regra de negócio crítica está **resumida inline em cada task** (contrato), com a fonte `[SP:]` (SPEC) / `[DR:]` (driver).
> Stack DECIDIDA (não re-discutir): React Native + Expo SDK 54+, TypeScript strict, WatermelonDB, `expo-notifications`, `expo-haptics`, `lucide-react-native`, `expo-web`.

---

## 1. Como usar este plano

- Tiers = Fases do driver §44: **Foundation → Habit engine → Core UX → Routine → Progress → Rewards → Reminders → Settings → Polish**.
- Tasks TDD atômicas numeradas `D1..D66`. Executar em ordem de `id` respeitando `Dependências`.
- RED → GREEN → REFACTOR. Regra do plano: **escrever o teste que falha primeiro**, depois implementar, depois refatorar (domínio sempre puro).
- Módulos de domínio (`src/domain/`) NÃO importam RN/Expo/UI/banco. Funções puras recebem `habit/records/date(now)` como argumento — nada de `new Date()` interno (testabilidade).
- **Nunca** duplicar regra de negócio na UI: a UI chama as funções de domínio. OPEN decisions só tocam o arquivo indicado (custódia §15 SPEC).

### Comandos de verificação (vale para toda task)

| Verificação | Comando |
|---|---|
| Testes unitários/component | `npm test -- <regex-do-arg>` (ex.: `npm test -- streak`) |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| App dev | `npm start` |
| Web (resposta UI do RUG) | `npm run web` |
| Build estático web | `npx expo export --platform web` |

**Cada task, ao terminar, exige `npx tsc --noEmit` e `npm run lint` limpos + teste citado verde.**

---

## 2. DoD — Definition of Done GLOBAL (driver §45 / SPEC §14)

1. **Produto** — usuário entende "o que fazer hoje" em poucos segundos; completar hábito = 1 tap com feedback (haptic + visual + toast); Completed/Skipped/Missed/Pending distinguíveis **sem cor**; histórico consistente após edição de frequência/meta; streak respeita frequência, zera em missed, skip não zera; quantitativos (meta vs registrado, unidade pré/custom, média/total/evolução) funcionam; frequências variadas funcionam (daily/weekdays/x_per_week/x_per_month).
2. **UX** — criar hábito simples; config avançada escondida (progressive disclosure); dashboard mostra progresso **antes** da lista; rotina temporal compreensível; usuário descobre estatísticas.
3. **UI** — Light e Dark parecem o MESMO produto; linguagem Premium Playful; não infantil; cards sem aninhamento excessivo; hierarquia tipográfica clara; cor nunca é único indicador de estado.
4. **Técnica** — tokens centralizados (zero hex solto); componentes reutilizáveis; regras de negócio centralizadas em função única; histórico imutável (append-only); arquitetura sync-ready (repositórios por interface, IDs UUID); zero login/cloud/widgets/social no MVP.

### Critério de saída do RUG (State 2 → implementação)

- `npm test` **100% verde** em todos os módulos de domínio + primitivas da UI.
- `npx tsc --noEmit` e `npm run lint` **limpos**.
- `npm start` sobe o app na plataforma local (device/emulador) **e** `npm run web` renderiza versão web responsiva.
- Web é a **resposta de UI** do MVP (mobile + desktop sidebar funcional). **APK/IPA NÃO são exigidos** — gerar APK debug (arm64) somente se o Tito pedir explicitamente depois (via `npx expo run:android` / EAS build).

---

## 3. Central de decisões OPEN — PONTOS DE CONFIGURAÇÃO com default

Toda OPEN decision do SPEC §15 vira **constante/política em arquivo único** com default definido abaixo. Trocar depois = alterar SÓ esse arquivo (+ teste do caller único). Nenhum default abaixo contradiz o driver; são defaults documentados para destravar implementação.

| Ref | Questão | Arquivo único (custódia) | DEFAULT a implementar |
|---|---|---|---|
| OPEN 15.1 | Concessão skip semanal | `src/domain/skip-credit/grantWeeklyCredit.ts` | **Semana-calendário começando segunda** (`SKIP_GRANT_POLICY = 'calendar-week'`, `WEEK_STARTS = 1`). +1/semana, cap 3 |
| OPEN 15.2 | Fórmula completion rate com skip | `src/domain/stats/completionRate.ts` | **`completed / scheduledDates`**, skip é **neutro** (não vira completed, conta no denominador apenas como não-completed) |
| OPEN 15.3 | Posição do botão `+` | `src/components/feature/AddHabitButton.tsx` | **FAB no mobile / botão no header desktop** |
| OPEN 15.4 | Conjunto de gráficos Statistics | `src/components/feature/dashboard/` (módulos) | **Mínimo: bar semanal + ring mensal + calendário de consistência** (componentes independentes) |
| OPEN 15.5 | Regras avançadas de reminders | `src/services/notifications/policy.ts` | **1 notificação por reminder-time; hábito de frequência `weekdays`/`x_per_*` só agenda em dia agendado; atrasado (time já passou hoje) → agenda p/ amanhã ou não agenda (config `LATE_NOTIFICATION = false`)** |
| OPEN 15.6 | Posição/estilo do toast | `src/components/ui/Toast.tsx` + tokens | **Topo, ícone + cor + label (nunca só cor)** |
| OPEN 15.7 | Materialização de `missed` | `src/domain/stats/materializeMissed.ts` | **Derivado na leitura** (não grava record); gravar só se UX exigir retrocesso |
| (PLAN) OPEN-FR | Dia "agendado" de `x_per_week`/`x_per_month` | `src/domain/habit/frequencyPolicy.ts` | **Distribuição uniforme no período** (dias → índice `floor(i*7/count)` na semana / `floor(i*daysInMonth/count)` no mês), tolerante a mudança de regra por ser função única |

> Sequência de blocos obrigada: domínio puro (aprovado em Habit engine) **antes** de qualquer tela.

---

## 4. Convenções

- Testes co-localizados: `arquivo.ts` → `arquivo.test.ts` (domínio) / `arquivo.test.tsx` (componente). Rodar por regex: `npm test -- habit`.
- Domínio: `export function f(habit, records, now): number` — **sem I/O, sem `Date` global**. Quem injeta `now` é o caller (hook/service).
- Data-chave do record: `'YYYY-MM-DD'` **local** (`YYYY-MM-DD`), sem offset.
- WatermelonDB teste: adapter **LokiJS in-memory** (padrão de teste WatermelonDB/Zeus). Device: SQLite via `expo-sqlite`. Web: LokiJS file/localStorage.
- Repositórios do `src/data/repositories/` são interfaces; a UI depende da interface (sync-ready, SPEC §3.4).
- `i18n/`: strings de UI. Zero regra de negócio em texto. Idioma do app: pt-BR (exemplos do driver em PT).

---

# TIER 1 — FOUNDATION (driver §44 Fase 1)

**Gate do tier:** `npm run web` renderiza shell limpo; `npm test` verde no harness; tema + primitivas base existem; WDB abre com schema v1 em teste in-memory.

### D1 — Inicializar app Expo SDK 54+ (scaffold)

- **Dependências:** —
- **Fazer:**
  1. `npx create-expo-app@latest . --template default` na raiz (SDK 54+; template com expo-router).
  2. Commit como scaffold base antes de alterar.
- **Arquivos:** raiz (`package.json`, `tsconfig.json`, `app.json`, `app/`, `index.ts`).
- **Verificar:** `npm start` sobe; `npm run web` abre. `npm test` no lugar (jest ainda não configurado, aceito).
- **Aceite:** bundler Expo sobe em device e web sem crash.

### D2 — Layout `src/` + TypeScript strict + aliases

- **Dependências:** D1
- **Fazer:** mover entrada do expo-router para `src/app` (ajuste `package.json` main → `expo-router/entry` e `app.json`), criar pastas vazias `src/{app,components/{ui,feature},domain/{habit,record,streak,skip-credit,stats,routine},data/{schema,migrations,models,repositories,adapters},services,theme,i18n,utils}`.
  1. `tsconfig.json`: `"strict": true` + `baseUrl`/`paths` `"@/*": ["./src/*"]`.
  2. Screen de placeholder em `src/app/index.tsx`.
  3. App router aponta para `src/app`.
- **Arquivos:** `tsconfig.json`, `package.json`, `app.json`, `src/app/*`.
- **Verificar:** `npx tsc --noEmit` limpo; `npm run web` abre.
- **Aceite:** imports usam `@/domain/...`; `strict` ativo (erro surge se código non-strict).

### D3 — ESLint + Prettier

- **Dependências:** D2
- **Fazer:** `npx expo lint` (eslint-config-expo); instalar `prettier` + `eslint-config-prettier`; scripts npm `lint` (eslint) e `format` (prettier --write). `.prettierrc` com semicolons, single quotes, trailing comma.
- **Arquivos:** `eslint.config.js`, `.prettierrc`, `package.json`.
- **Verificar:** `npm run lint` limpo; `npm run format` não altera nada (idempotente).
- **Aceite:** scaffold passa lint sem warning.

### D4 — Harness de testes: jest-expo + testing-library

- **Dependências:** D2
- **Fazer:** instalar `jest-expo`, `jest`, `@testing-library/react-native`, `react-test-renderer`. `package.json`: `"test": "jest"`, `"test:watch"`. `jest` preset `jest-expo`; `transformIgnorePatterns` permitindo `expo|react-native|@react-native|watermelondb|lucide-react-native|@expo|@react-navigation`. Smoke test `src/utils/__tests__/smoke.test.ts`.
- **Arquivos:** `package.json`, `jest.config.js` (ou bloco `jest` no package.json), `src/utils/__tests__/smoke.test.ts`.
- **Verificar:** `npm test` verde (smoke); `npm test -- smoke` roda só o smoke.
- **Aceite:** jest-expo compila TS puro e componente RN mínimo.

### D5 — WatermelonDB: models + schema v1 + migrations (estrutura)

- **Dependências:** D2 (tipos de domínio chegam no Habit engine; aqui schema reflete os campos do SPEC §4)
- **Fazer:** models WDB `HabitModel`, `HabitRecordModel`, `RoutineModel`, `SkipCreditModel` (`src/data/models/`) espelhando §4.1/§4.3/§4.4/§4.5 (campos exatos do SPEC: `habitId`, `date`, `status`, `value?`, `completedAt?`, `balance`, `lastGrantRef`, etc.).
  1. Índice de composição `(habitId, date)` em record — **único**.
  2. `SkipCredit` como **singleton** (id fixo `skip_credit`).
  3. `schemas.ts` version 1 + `migrations/` vazio (schemas futuros seguem até 2 migrations, SPEC §8).
- **Arquivos:** `src/data/schema.ts`, `src/data/models/*.ts`, `src/data/migrations/index.ts`.
- **Verificar:** `npx tsc --noEmit`; teste de schema (`npm test -- schema`) garante índice único declarado.
- **Aceite:** schema v1 tem 4 tabelas, relação 1→N `Habit→HabitRecord`, índice único `(habitId, date)`.

### D6 — Factory de banco: adapters device / web / jest

- **Dependências:** D5
- **Fazer:** `src/data/database.ts` `createDatabase({ platform })`:
  - native ⇒ `SQLiteAdapter` + `expo-sqlite`;
  - web ⇒ **LokiJSAdapter** file/localStorage;
  - jest/test ⇒ **LokiJSAdapter in-memory** (padrão WatermelonDB).
  Exporta helper de teste `createTestDatabase()`.
- **Arquivos:** `src/data/database.ts`, `src/data/adapters/{native,web,test}.ts`, `package.json` (`expo-sqlite`, adapters).
- **Verificar:** `npm test -- database` abre banco in-memory, `npx tsc --noEmit`.
- **Aceite:** factory instancia banco WDB sem crash nos 3 alvos; app web não importa SQLite nativo (guard de platform).

### D7 — Repositórios por interface + impl in-memory (contrato de escrita)

- **Dependências:** D6
- **Fazer:** interfaces `HabitRepository`, `RecordRepository`, `RoutineRepository`, `SkipCreditRepository` (`src/data/repositories/`) — contrato de escrita do SPEC §4.3:
  - `create/updateStatus` **só para hoje** (ou repor `pending` futuro ao mudar schedule);
  - record **único por `(habitId, date)`**; **append-only** (nunca reescrever record persistido); transição permitida `pending→completed` do dia atual;
  - `skipped/completed/value` = únicos estados persistidos como fato; `missed` NUNCA gravado como overwrite (SP §4.3, derivado por domínio).
- Implementação in-memory reutilizável (web também pode usar enquanto real adapter não chega).
- **Arquivos:** `src/data/repositories/*.ts` + `implementations/inMemory/*.ts` + testes.
- **Verificar:** `npm test -- repositories` — casos: append-only (update em record passado lança/recusa), unique `(habitId,date)`, write fora de hoje recusado (exceto `pending` futuro agendado), singleton skip_credit.
- **Aceite:** contrato de escrita validado por teste; UI só fala com interface.

### D8 — Tokens semânticos de tema (light/dark) + spacing + radius + typography escala

- **Dependências:** D2
- **Fazer:** `src/theme/tokens.ts` (paletas §24 light e §25 dark — **paletas independentes, dark não é inversão**; superfícies `surface`/`surfaceElevated` no dark, §25), `src/theme/spacing.ts` (`4..64`, §26), `src/theme/radius.ts` (`sm..pill`, card 20 / modal 28 / button pill / input 14, §27), `src/theme/typography.ts` (escala §23: Display XL 36/42 ExtraBold … Caption 12/16 Medium), `src/theme/colors.ts` com `ColorToken` semântico (`background|surface|surfaceElevated|primary|secondary|accent|success|textPrimary|textSecondary|textMuted|border` — nunca hex solto fora daqui, §24).
- **Arquivos:** `src/theme/*`.
- **Verificar:** `npm test -- theme` — assert presença de toda chave exigida em BOTH themes; contraste `textPrimary`×`background` ≥ 4.5:1 (aprox.).
- **Aceite:** um único lugar de hex; dark e light compartilham MESMA estrutura de tokens (mesmo produto, §25).

### D9 — Fontes: Plus Jakarta Sans + Inter via expo-font

- **Dependências:** D8
- **Fazer:** `@expo-google-fonts/plus-jakarta-sans` + `@expo-google-fonts/inter`, service `src/services/fonts.ts` com `useFonts` e splash até carregar; fallback seguro em web.
- **Arquivos:** `src/services/fonts.ts`, `package.json`.
- **Verificar:** `npm run web` carrega sem FOUT crash; `npx tsc --noEmit`.
- **Aceite:** overrides de font-family aplicados aos estilos de heading (`PlusJakartaSans_700/800`) e body (`Inter_400`).

### D10 — Primitivas I: Text, Heading, Button, IconButton, Icon

- **Dependências:** D8, D9
- **Fazer:** `src/components/ui/Text.tsx`, `Heading.tsx` (escala §23), `Button.tsx` + `IconButton.tsx` com **estados §30**: `default|hover|pressed|disabled|loading`; `Icon.tsx` wraper de `lucide-react-native` com **fallback emoji** (nome não lucide ⇒ render emoji, §31). Sem hex direto — só tokens.
- **Arquivos:** `src/components/ui/{Text,Heading,Button,IconButton,Icon}.tsx` + `.test.tsx`.
- **Verificar:** `npm test -- ui` — estados press/disabled renderizam variantes; `accessibilityLabel` presente; símbolo/c prefix.
- **Aceite:** Estados de Button executáveis por teste; Icon resolve lucide e emoji.

### D11 — Primitivas II: Card, Divider, Badge, ProgressBar, ProgressRing

- **Dependências:** D10
- **Fazer:** `Card` (radius xl, estados default/interactive/selected/disabled §30), `Divider`, `Badge`, `ProgressBar`, `ProgressRing` (progress 0..1, semântica a11y `aria-valuenow`/`accessibilityValue`).
- **Arquivos:** `src/components/ui/*` + `.test.tsx`.
- **Verificar:** `npm test -- progress` — bar/ring refletem valor; Card selected estilo distinto.
- **Aceite:** componentes reutilizáveis e token-only.

### D12 — Formulários I: Input, Textarea, Select, Checkbox, Switch, Radio

- **Dependências:** D10
- **Fazer:** pró-forma (spec §29 Forms). Todos com estado focado/erro/desabilitado e label acessível.
- **Arquivos:** `src/components/ui/forms/*` + `.test.tsx`.
- **Verificar:** `npm test -- forms`.
- **Aceite:** cada controle renderiza e dispara `onChange` com valor correto.

### D13 — Formulários II: TimePicker, DatePicker, ColorPicker

- **Dependências:** D12
- **Fazer:** `TimePicker` ("HH:mm" — usado por scheduledTime/reminder), `DatePicker`, `ColorPicker` (escolhe entre `ColorToken`s válidos, NUNCA hex, §24).
- **Arquivos:** `src/components/ui/forms/{TimePicker,DatePicker,ColorPicker}.tsx` + `.test.tsx`.
- **Verificar:** `npm test -- timepicker && npm test -- colorpicker`.
- **Aceite:** TimePicker entrega string `HH:mm`; ColorPicker restringe token semântico.

### D14 — Layout: Stack, Grid, Section + breakpoints + Toast (OPEN 15.6)

- **Dependências:** D10, D8
- **Fazer:** `src/components/ui/layout/{Stack,Grid,Section}.tsx`; hook `src/utils/useBreakpoint.ts` (mobile < 760 / tablet / desktop ≥ 1024, com `useWindowDimensions`); `src/components/ui/Toast.tsx` **na custódia OPEN 15.6** — default: topo, ícone + cor + label nunca só cor.
- **Arquivos:** `src/components/ui/layout/*`, `src/utils/useBreakpoint.ts` + test, `src/components/ui/Toast.tsx` + test.
- **Verificar:** `npm test -- breakpoint` (mocket Dimensions) + `npm test -- toast`.
- **Aceite:** `useBreakpoint` responde a largura mockada; Toast expõe variantes (success/error/skip) com label texto.

**— Fim TIER 1 (Foundation) —**

---

# TIER 2 — HABIT ENGINE (driver §44 Fase 2)

> **Regra de ouro:** domínio 100% puro, sem import de app/RN. Toda métrica = função pura `(habit, records, now) => value`. Testado isoladamente ANTES de qualquer UI.

**Gate do tier:** `npm test` verde em TODOS os módulos de domínio; nenhum import fora de `src/` e de deps puras.

### D15 — Utils de data (domínio puro)

- **Dependências:** D2
- **Fazer:** `src/domain/date/dateUtils.ts`: `toDateKey(now): 'YYYY-MM-DD'` (local), `parseDateKey`, `addDays`, `startOfWeek(now, WEEK_STARTS)`, `isoWeekKey(now)` (base segunda), `daysInMonth`, `weekdayOf(dateKey)`. Importável só de puro.
- **Arquivos:** `src/domain/date/dateUtils.ts` + `.test.ts`.
- **Verificar:** `npm test -- dateutils`.
- **Aceite:** chaves de data locais consistentes (sem fuso); semana inicia segunda por default.

### D16 — Modelo de domínio: Habit, Frequency, Schedule + validateHabit

- **Dependências:** D15
- **Fazer:** tipos §4.1/§4.2: `HabitType = 'binary'|'quantitative'`, `PredefinedUnit` (10 unidades §4.2 driver), `FrequencyKind = 'daily'|'weekdays'|'x_per_week'|'x_per_month'`, `Schedule {days?, countPerPeriod?}`, `Habit` completo (id uuid string, icon, color: ColorToken, routineId?, scheduledTime?, reminder?, archivedAt?) e `validateHabit` (quant te exige `targetValue`+`unit` OU `customUnit`; nome obrigatório; cap do saldo de skip fora daqui).
- **Arquivos:** `src/domain/habit/model.ts`, `src/domain/habit/validateHabit.ts` + `.test.ts`.
- **Verificar:** `npm test -- validatehabit`.
- **Aceite:** validação rejeita quant sem meta/unidade; aceita binary; aceita `customUnit`.

### D17 — isScheduled + frequencyPolicy (switch único, OPEN-FR)

- **Dependências:** D16, D15
- **Fazer:** `src/domain/habit/isScheduled.ts` — **switch único por kind** (extensível, §5.4 driver):
  - `daily` → true;
  - `weekdays` → weekday pertence a `schedule.days`;
  - `x_per_week`/`x_per_month` → delegam a `frequencyPolicy.ts` (OPEN-FR): definir `scheduledDateKeysForPeriod(habit, periodStart)` = **distribuição uniforme** (semana: índices `floor(i*7/countPerPeriod)`; mês: `floor(i*daysInMonth/countPerPeriod)`), e `isScheduled(habit, dateKey)` = dateKey ∈ conjunto do período.
- **Arquivos:** `src/domain/habit/isScheduled.ts`, `src/domain/habit/frequencyPolicy.ts` + `.test.ts`.
- **Verificar:** `npm test -- isscheduled` — casos: daily sempre; weekdays `['mon','wed']` ≠ dom; x_per_week=3 gera 3 dias/ semana; x_per_month respeita dias do mês; fronteiras (primeiro/último dia do período).
- **Aceite:** qualquer novo kind futuro = adicionar case no switch, sem tocar streak/estatística.

### D18 — Record: status, transições, append-only (domínio puro)

- **Dependências:** D16, D15
- **Fazer:** `src/domain/record/model.ts` (`RecordStatus`, `HabitRecord` §4.3), `statusOf`, `canCompleteAt(record, now, dateKey)` (só `pending` do dia atual → `completed`; nunca edita passado), `createPendingFor(dateKey)`.
- **Arquivos:** `src/domain/record/model.ts`, `src/domain/record/transitions.ts` + `.test.ts`.
- **Verificar:** `npm test -- record` — transição ok hoje; recusa editar ontem; `skipped`/`completed` são fatos persistidos; `missed` NÃO é função de transição (derivado).
- **Aceite:** histórico imutável garantido em nível de regra pura (repositório também valida, D7).

### D19 — currentStreak (contrato crítico)

- **Dependências:** D17, D18, D15
- **Fazer:** `src/domain/streak/currentStreak.ts` — itera **de hoje para trás** sobre apenas **dias agendados** (isScheduled — NÃO assume diário, §7):
  - `completed` → conta ;
  - `skipped` → NÃO conta, NÃO zera (skip não é falha);
  - dia agendado sem record, ou `missed` → **zera e para**.
  - `now` injetado.
- **Arquivos:** `src/domain/streak/currentStreak.ts` + `.test.ts`.
- **Verificar:** `npm test -- currentstreak` — casos obrigatórios:
  - §7 driver: Seg✓ Ter✓ Qua✓ Qui(missed) Sex: current=1 (Best testado em D20);
  - skip no meio não zera: ✓ skip ✓ → current continua;
  - frequência `weekdays` (`mon..fri`): fim de semana NÃO zera (não agendado);
  - `x_per_week=3`: streak = nº de períodos consecutivos com 3 completions (policy D17);
  - dia agendado sem record ⇒ reset.
- **Aceite:** "Missed → streak reset" (§41) obedecido; skip nunca aumenta.

### D20 — bestStreak (varrer histórico, nunca reescrever)

- **Dependências:** D19
- **Fazer:** `src/domain/streak/bestStreak.ts` — mesma definição de "semana válida" (D19) aplicada a cada janela do histórico; retorna maior corrida. Não altera records (§7).
- **Arquivos:** `src/domain/streak/bestStreak.ts` + `.test.ts`.
- **Verificar:** `npm test -- beststreak` — caso §7: Best=3.
- **Aceite:** concordo com exemplo do driver exato.

### D21 — Skip credit: grant (OPEN 15.1) + useSkip + cap

- **Dependências:** D17, D16
- **Fazer:** `src/domain/skip-credit/grantWeeklyCredit.ts` — **OPEN 15.1**, default **semana-calendário segunda-fim** (`SKIP_GRANT_POLICY='calendar-week'`, `WEEK_STARTS=1`): se `weekKey(now) !== lastGrantRef` ⇒ `balance = min(balance+1, 3)`, `lastGrantRef = weekKey`. Chamado pelo caller do dia (ainda sem gravação de `missed` — só crédito).
- `useSkip(state): { ...balance-1, record: 'skipped' }` — valida `balance>0`, decrementa, registra `skipped` (SP §8.3): nunca `completed`, nunca `missed`, não aumenta streak (domínio de streak já ignora skipped), aparece em histórico/calendário. Invariante `balance = clamp(0..3)` (§8.4).
- **Arquivos:** `src/domain/skip-credit/*` + `.test.ts`, `src/domain/skip-credit/config.ts` (constantes OPEN).
- **Verificar:** `npm test -- skipcredit`:
  - grants: 2 semanas → +1 cada, cap 3 (não passa de 3), mesma semana → não concede 2ª vez;
  - use: saldo 3→2 cria record skipped; saldo 0 → recusa (sem consumir); saldo nunca < 0.
- **Aceite:** regra isolada em um único módulo (trocar p/ janela 7d = editar só `config.ts` + teste).

### D22 — completionRate (OPEN 15.2, função única)

- **Dependências:** D17, D18
- **Fazer:** `src/domain/stats/completionRate.ts` — default OPEN 15.2: `completed / scheduledDates.length` (scheduledDates = dias agendados via D17 no período). `skipped` **neutro**: não conta como completed nem corrige o denominador (§10).
- **Arquivos:** `src/domain/stats/completionRate.ts` + `.test.ts`.
- **Verificar:** `npm test -- completionrate` — completed conta, missed não, pending não; skip não é auto-completed (ex.: 2 completed + 2 skipped em 5 scheduled ⇒ 0.4, NÃO comentou).
- **Aceite:** chamada única pela UI (proibido recalcular fórmula em outro lugar); trocar fórmula = editar só este arquivo.

### D23 — materializeMissed (OPEN 15.7 — derivado na leitura)

- **Dependências:** D17, D18
- **Fazer:** `src/domain/stats/materializeMissed.ts` — **default: derivado** (SP §15.7). `statusForView(habit, records, dateKey)`: dia agendado sem record/missed ⇒ `missed` (só para calendário/dashboard); `pending` futuro fica pendente se dia não chegou. **Não grava nada.**
- **Arquivos:** `src/domain/stats/materializeMissed.ts` + `.test.ts`.
- **Verificar:** `npm test -- materializemissed` — dia agendado sem record de ontem ⇒ missed derivado; hoje antes do fim ⇒ pending; record skipped ⇒ skipped.
- **Aceite:** nunca persiste `missed` (guard: se decidir gravar, via repositório separado, nunca overwrite de fato).

### D24 — Achievements / milestones (puro, positivo)

- **Dependências:** D19, D20, D22
- **Fazer:** `src/domain/stats/achievements.ts` — `achievements(derivedStats)` retorna lista positiva (§11, §5.5): 7d streak, 30d streak, 100 completions, 365 completions, all-completed-today. SEM XP/moedas/levels (§11.3). Zero linguagem punitiva.
- **Arquivos:** `src/domain/stats/achievements.ts` + `.test.ts`.
- **Verificar:** `npm test -- achievements` — alcançado se stats cruzam threshold; all-completed só se todos agendados completos.
- **Aceite:** derivado puro de `derivedStats`.

### D25 — Routine: agrupamento + ordem temporal

- **Dependências:** D16, D15
- **Fazer:** `src/domain/routine/group.ts` (habit → grupo via `routineId`; sem grupo = grupo implícito "sem rotina"), `src/domain/routine/order.ts` (dentro do grupo: sem `scheduledTime` = atemporal no **fim** do grupo; depois por hora asc, §6.2; depois nome). `scheduledForDay(habits, dateKey)` (via D17) para visão de hoje.
- **Arquivos:** `src/domain/routine/*` + `.test.ts`.
- **Verificar:** `npm test -- routine`.
- **Aceite:** ordem determinística; atemporal no fim; hoje prioriza programados.

### D26 — Repositórios WDB concretos + integração in-memory

- **Dependências:** D7, D6, D21
- **Fazer:** implementações reais sobre WatermelonDB (`src/data/repositories/watermelon/*`) seguindo as interfaces D7: CRUD Habit (incl. `archivedAt`), Record append-only + único `(habitId,date)`, Routine, SkipCredit singleton (lock `skip_credit`). Teste de integração **LokiJS in-memory** exercita o fluxo completo: criar habit → completar hoje → append-only → grant saldo + useSkip → saldo persistido.
- **Arquivos:** `src/data/repositories/watermelon/*`, `src/data/migrations/*` (se precisar), teste de integração `src/data/__tests__/integration.test.ts`.
- **Verificar:** `npm test -- integration`.
- **Aceite:** persistência WDB respeita contrato D7 (uniqueness, append-only, singleton) via teste real de banco.

**— Fim TIER 2 (Habit engine) —**

---

# TIER 3 — CORE UX (driver §44 Fase 3)

**Gate:** ir de Home para criar/completar hábito de ponta a ponta (dados locais reais). Navegação mobile (bottom nav) + desktop (sidebar).

### D27 — Shell de navegação Expo Router (mobile bottom nav / desktop sidebar)

- **Dependências:** D14
- **Fazer:** root layout em `src/app/_layout.tsx`; rotas §38: `/today`, `/habits` (list/create/edit/detail), `/statistics`, `/calendar`, `/settings{/appearance,notifications,defaults,data,about}`. Navegação inferior mobile / sidebar desktop via `useBreakpoint` (§36). Desktop: layout dashboard em colunas. Placeholders funcionais.
- **Arquivos:** `src/app/**`, `src/components/layout/NavShell.tsx`.
- **Verificar:** `npm run web` navega entre tabs; `npm test -- navshell`.
- **Aceite:** 5 áreas alcançáveis; responsivo correto.

### D28 — AddHabitButton (OPEN 15.3)

- **Dependências:** D27
- **Fazer:** `src/components/feature/AddHabitButton.tsx` — **FAB mobile / header desktop** (default OPEN 15.3). Único componente na custódia; navega para `/habits/create`.
- **Arquivos:** `src/components/feature/AddHabitButton.tsx` + `.test.tsx`.
- **Verificar:** `npm test -- addhabitbutton`.
- **Aceite:** botão presente em Today e Habits; posição trocável em 1 lugar.

### D29 — Tela Create Habit (progressive disclosure)

- **Dependências:** D28, D16, D17, D21, D26
- **Fazer:** formulário §15 (driver): nome, ícone (lucide/emoji), cor (ColorPicker D13), tipo binary/quant (quant ⇒ target + unit predefinida **ou** customUnit, §4.2), frequência (daily/weekdays/x_per_week/x_per_month), schedule/days, reminder básico (off | 08:00 — expande em D52), salvar via HabitRepository. Sem formulário gigante: disclosure progressivo.
- **Arquivos:** `src/app/habits/create.tsx`, `src/features/habit/create-form/*`.
- **Verificar:** web: cria e volta para lista; `npx tsc --noEmit`.
- **Aceite:** ao salvar, habit surge na lista persistida (WDB) e em Today se agendado.

### D30 — Onboarding minimalista (1 tela → primeiro hábito)

- **Dependências:** D29
- **Fazer:** `src/app/onboarding.tsx` (§20 driver): logo, "Build better habits, one day at a time", `Get started` → rota para create. Sem perfil/ conta. Marcar `onboarding_done` em prefs locais (AsyncStorage, §11).
- **Arquivos:** `src/app/onboarding.tsx`, `src/services/prefs.ts`.
- **Verificar:** `npm test -- prefs`; restart web não repete onboarding.
- **Aceite:** primeiro acesso guia a criar 1 hábito em ≤ 2 taps.

### D31 — Today/Home: dashboard-primeiro + lista agrupada por rotina

- **Dependências:** D27, D26, D18, D25, D7
- **Fazer:** `src/app/index.tsx` → Today: **(1)** card de progresso do dia (X/Y completed + % + bar) ANTES da lista (§12), **(2)** seções por rotina (D25) com hábitos do dia, **(3)** empty state "Nothing scheduled for today" (§21) quando vazio, **(4)** tchau botão completável (checkbox D32 abaixo). Dashboard mínimo agora; completo em D41.
- **Arquivos:** `src/app/index.tsx`, `src/features/today/*`.
- **Verificar:** `npm run web` mostra progresso acima da lista; complete via toque atualiza contagem.
- **Aceite:** prioridade "dashboard → lista" (Driver §12) estrutural na tela.

### D32 — HabitIcon + HabitCheckbox (estados não-cor-only)

- **Dependências:** D31 (usa dentro), D18, D26
- **Fazer:** `HabitIcon` (lucide/emoji §31), `HabitCheckbox` com **estados §30** e **requisito de símbolo + cor + label** (§10, §37): Completed ✓, Skipped —, Missed ✕, Pending ○. `accessibilityLabel` sempre. Disabled state. Disparar haptics/função callback (sem lógica de negócio).
- **Arquivos:** `src/components/feature/{HabitIcon,HabitCheckbox}.tsx` + `.test.tsx`.
- **Verificar:** `npm test -- habitcheckbox` — renderiza símbolo textual + label por estado (assert que não depende só de cor).
- **Aceite:** completar chamado 1 tap → atualiza record (append-only) + progresso + streak (via callback puro D19).

### D33 — HabitCard / HabitRow / HabitStreak

- **Dependências:** D32, D19, D20, D22
- **Fazer:** `HabitCard` (§14 exemplo: ícone, nome, freq, streak, % bar), `HabitRow` (compacto Today), `HabitStreak` (🔥 n dias). Mostra frequência renderizada ("4x/week", "Mon/Wed/Fri", "Every day", "10x/month").
- **Arquivos:** `src/components/feature/{HabitCard,HabitRow,HabitStreak}.tsx` + `.test.tsx`.
- **Verificar:** `npm test -- habitcard`.
- **Aceite:** cards exibem streak/percent correct via domínio (não rederivados na UI).

### D34 — Edit Habit + arquivar/excluir

- **Dependências:** D29, D33, D7, D5
- **Fazer:** `src/app/habits/[id]/edit.tsx` (pré-preenchido), ações arquivar (`archivedAt`) e excluir (com confirmação). **Nota:** editar frequência/meta NÃO revisita records passados (§9, §5.4) — histórico imutável.
- **Arquivos:** `src/app/habits/[id]/edit.tsx`, `src/features/habit/edit-form/*`.
- **Verificar:** web edita sem alterar records; `npm test -- editform`.
- **Aceite:** archive move para aba "Arquivados"; edit de schedule repõe `pending` futuro (D7).

### D35 — Habit Detail

- **Dependências:** D33, D19, D20, D22, D23
- **Fazer:** `src/app/habits/[id]/detail.tsx` (§16): ícone+nome, streak atual 🔥, melhor streak 🏆, % mês (bar), calendário `M T W T F S S` (via D23 derivado), completion, total completions, longest streak. Quantitativo (média/total/evolução) chega em D47.
- **Arquivos:** `src/app/habits/[id]/detail.tsx`.
- **Verificar:** web detail coerente com records.
- **Aceite:** tela usa funções de domínio (single caller src).

### D36 — Splash/loading + empty/error states (versão 1)

- **Dependências:** D27, D31, D21
- **Fazer:** splash (aguarda fontes + banco), 4 empty states do §21 (sem hábitos; todos concluídos "You're all done! 🎉"; sem dados de stats; nada programado hoje), error state genérico. Versão refinada em D62.
- **Arquivos:** `src/components/feature/EmptyState.tsx`, `src/components/feature/ErrorState.tsx` + `.test.tsx`.
- **Verificar:** `npm test -- emptystate`.
- **Aceite:** cada estado de vazio presente e acionável.

**— Fim TIER 3 (Core UX) —**

---

# TIER 4 — ROUTINE (driver §44 Fase 4)

**Gate:** criar grupos, atribuir hábitos + horário, ver ordem temporal.

### D37 — CRUD de rotinas (tela)

- **Dependências:** D27, D26, D25
- **Fazer:** tela `src/app/routines/*`: listar/criar/editar/excluir grupos (nome, desc?, cor?, ordem §4.4). Excluir rotina ⇒ hábitos vão para "sem rotina" (nunca apaga habit).
- **Arquivos:** `src/app/routines/*`, `src/features/routine/*`.
- **Verificar:** web CRUD persistido; `npm test -- routineform` (render).
- **Aceite:** rotina salva/removida sem perda de habits.

### D38 — Vincular rotina + horário no habit (create/edit)

- **Dependências:** D37, D29, D34
- **Fazer:** em create/edit habit, selects "Routine" e "Horário" (`scheduledTime` HH:mm via TimePicker D13 + opção "sem horário" = atemporal no fim do grupo, §6.2). Persistir `routineId`/`scheduledTime`.
- **Arquivos:** `src/features/habit/create-form/*`, `src/features/habit/edit-form/*`.
- **Verificar:** web vincula e persiste; `npm test -- forms` continua verde.
- **Aceite:** habit vinculado aparece ordenado no grupo.

### D39 — Visão de hoje ordenada por rotina/horário (§6.2)

- **Dependências:** D38, D31, D25
- **Fazer:** Today renderiza grupos com header da rotina + ordem temporal (D25), horário visível ao lado do hábito quando houver. "Sem rotina" separado no fim.
- **Arquivos:** `src/features/today/*`.
- **Verificar:** web Today mostra rotina com horários em ordem.
- **Aceite:** grupo → horário → ordem legíveis em mobile e desktop.

**— Fim TIER 4 (Routine) —**

---

# TIER 5 — PROGRESS (driver §44 Fase 5)

**Gate:** dashboard diário + statistics completos + calendário de consistência, todos com dados do banco local.

### D40 — Selectors de stats derivados (hook puro sobre domínio)

- **Dependências:** D19, D20, D22, D23, D24, D26, D18
- **Fazer:** `src/domain/stats/aggregate.ts` — `daySummary(habits, records, now)` (X/Y, %, streaks), `weeklySeries`, `monthlySeries`, `totals` (completions). Funções puras; hook `useStats` na app só injeta dados do repositório e `now`.
- **Arquivos:** `src/domain/stats/aggregate.ts` + `.test.ts`, `src/hooks/useStats.ts`.
- **Verificar:** `npm test -- aggregate`.
- **Aceite:** toda métrica derivada de histórico (sem campo duplicado no banco, §35).

### D41 — TodayProgress + DailySummary (final)

- **Dependências:** D31, D40
- **Fazer:** `src/components/feature/TodayProgress.tsx` (progresso 6/8 · 75% · bar + anel) e `DailySummary`. Substitui o joguinho mínimo de D31.
- **Arquivos:** `src/components/feature/dashboard/*` + `.test.tsx`.
- **Verificar:** `npm test -- todayprogress`; web atualiza após check.
- **Aceite:** dashboard mostra progresso ANTES da lista.

### D42 — WeeklyChart (bar semanal, modular)

- **Dependências:** D40, D14
- **Fazer:** `src/components/feature/dashboard/WeeklyChart.tsx` — barras M..S com % do dia agendado; tooltip/label por dia (não-cor-only). Componente **modular** (OPEN 15.4: trocar/remover sem quebrar Statistics).
- **Arquivos:** `src/components/feature/dashboard/WeeklyChart.tsx` + `.test.tsx`.
- **Verificar:** `npm test -- weeklychart`.
- **Aceite:** separado e reutilizável.

### D43 — ProgressRing (mensal) + ConsistencyCalendar (mês, modular)

- **Dependências:** D40, D23, D11
- **Fazer:** `ProgressRing` (mensal, via D11 ring); `ConsistencyCalendar` — grade mês com **intensidade visual + símbolo** ✓/—/✕/○ por dia (§17), estados não-só-cor.
- **Arquivos:** `src/components/feature/dashboard/*` + `.test.tsx`.
- **Verificar:** `npm test -- consistencycalendar`.
- **Aceite:** calendário responde "como foi minha consistência?" (§17).

### D44 — StreakCard + CompletionChart

- **Dependências:** D40
- **Fazer:** `StreakCard` (current + best 🔥/🏆 §29 dashboard) e `CompletionChart` (linha/área mensal). Modulares.
- **Arquivos:** `src/components/feature/dashboard/*` + `.test.tsx`.
- **Verificar:** `npm test -- streakcard`.
- **Aceite:** números de streak vindos do domínio (não duplicados).

### D45 — Tela Statistics (Overview + por hábito, OPEN 15.4)

- **Dependências:** D41..D44, D40
- **Fazer:** `src/app/statistics/index.tsx` — composição: current/best streak, overall completion, WeeklyChart, ProgressRing mensal, ConsistencyCalendar, milestones (achievements D24). Padrão mobile → colunas no desktop. Composição de módulos D41..D44 (OPEN 15.4 satisfeito por modularidade).
- **Arquivos:** `src/app/statistics/*`.
- **Verificar:** web mostra todas as métricas; `npm test -- statistics` (smoke render).
- **Aceite:** composable, sem duplicação de métrica (tudo derivado).

### D46 — Tela Calendar (§17)

- **Dependências:** D40, D23
- **Fazer:** `src/app/calendar/index.tsx` — mês navegável, dia com estados ✓/—/✕/○ via materializeMissed (D23). Tap no dia → detalhe do dia (habits + status).
- **Arquivos:** `src/app/calendar/*`.
- **Verificar:** web navega meses; `npm test -- calendar` (render).
- **Aceite:** consistência filtrável por up hábito (seletor).

### D47 — Stats quantitativas por hábito (média/total/evolução)

- **Dependências:** D35, D40
- **Fazer:** no Habit Detail (D35), para `quantitative`: meta vs registered do dia, média (per scheduled day), total, evolução no tempo (mini sparkline modular). Unidade correta (predefinida/custom, §4.2/§16).
- **Arquivos:** `src/components/feature/habit-stats/*`, `src/domain/stats/quantitative.ts` + `.test.ts`.
- **Verificar:** `npm test -- quantitative`.
- **Aceite:** quantitativos completos por hábito.

**— Fim TIER 5 (Progress) —**

---

# TIER 6 — REWARDS (driver §44 Fase 6)

**Gate:** completar hábito produz feedback tátil+visual e alcançar milestone celebra (com respeito a reduced-motion).

### D48 — Sincronizar achievements com stats

- **Dependências:** D24, D40
- **Fazer:** `src/domain/stats/earnedAchievements.ts` — compara achievements (D24) com derivedStats atuais → lista "earned"; marca novos (persistência apenas de flag de "visto", nunca altera histórico). Serviço/hook `useAchievements`.
- **Arquivos:** `src/domain/stats/earnedAchievements.ts` + `.test.ts`, `src/hooks/useAchievements.ts`.
- **Verificar:** `npm test -- earnedachievements`.
- **Aceite:** milestone dispara uma vez (idempotente).

### D49 — Feedback de milestone/achievement

- **Dependências:** D48
- **Fazer:** overlay/celebration ao ganhar novo achievement (lista §11.1/§11.2: 🔥7d, ✨100, 🎉 all-done, 🏆30d/365d). Positivo, sem linguagem punitiva (§11.2).
- **Arquivos:** `src/components/feature/MilestoneCelebration.tsx` + `.test.tsx`.
- **Verificar:** `npm test -- milestone`.
- **Aceite:** celebração aparece 1x por novo milestone.

### D50 — Microinteração de completar + haptics

- **Dependências:** D32, D14, D8, D21
- **Fazer:** bounce curto + check animado + atualização de progresso + streak + toast (§33, §10). `expo-haptics` sutil (impact light) no check nativo. Motion rápido/discreto; `prefers-reduced-motion` desabilita bounce (prefix motion system — ver D61).
- **Arquivos:** `src/services/haptics.ts`, `src/components/feature/TodayCompleteButton.tsx` (wrapper).
- **Verificar:** `npm test -- haptics` (mock expo-haptics) — chamada só em ação de completar.
- **Aceite:** completar é satisfatório e 1 tap (core loop §2).

### D51 — 100% do dia: celebração alta (confete, reduced-motion-aware)

- **Dependências:** D31, D48
- **Fazer:** ao completar último hábito do dia → celebração 100% (§33: `100% → 🎉`). Confete/anim amigável; **desligado** com `prefers-reduced-motion` (§37).
- **Arquivos:** `src/components/feature/CelebrationOverlay.tsx`.
- **Verificar:** `npm test -- celebration`.
- **Aceite:** 100% dispara 1x; nada dispara a toque redundante.

**— Fim TIER 6 (Rewards) —**

---

# TIER 7 — REMINDERS (driver §44 Fase 7)

**Gate:** configurar reminder no habit gera notificação local agendada; permissão pedida em contexto.

### D52 — ReminderConfig na UI (progressive disclosure)

- **Dependências:** D29, D34
- **Fazer:** no create/edit habit: `ReminderConfig {enabled, times: string[]}` — default sem reminder; opção 08:00; expansão a múltiplos horários (§19, §9). Só aparece quando usuário interage (disclosure).
- **Arquivos:** `src/features/habit/reminder-config/*` + `.test.tsx`.
- **Verificar:** web salva times no habit; `npm test -- reminderconfig`.
- **Aceite:** mínimo "No reminder | 08:00" + multi.

### D53 — NotificationService (expo-notifications)

- **Dependências:** D52
- **Fazer:** `src/services/notifications/service.ts` — **permissão pedida em contexto** (1ª vez que configura reminder, NÃO no onboarding, §9); `scheduleForHabit(habit, dateKey)` agenda notificação local por `scheduledTime`/`hab.time`; cancelar ao editar/desativar.
- **Arquivos:** `src/services/notifications/service.ts`, `src/services/notifications/__mocks__`.
- **Verificar:** `npm test -- notifications_service` (mock expo-notifications) — agenda/cancela chamado.
- **Aceite:** permissão in-context; agendamento local correto.

### D54 — policy.ts (OPEN 15.5 — função única)

- **Dependências:** D53
- **Fazer:** `src/services/notifications/policy.ts` — **OPEN 15.5 default**: 1 notif por time; hábito `weekdays`/`x_per_*` só agenda em dia agendado (via D17); horário já passou hoje ⇒ `LATE_NOTIFICATION=false` não agenda hoje (config). Única função; SP §9: nunca espalhada.
- **Arquivos:** `src/services/notifications/policy.ts` + `.test.ts`, `src/services/notifications/config.ts`.
- **Verificar:** `npm test -- notifypolicy` — multi-time agenda N; dia não-agendado ⇒ skip; atrasado ⇒ comportamento config.
- **Aceite:** regra em único lugar, configurável.

### D55 — Settings > Notifications (superfície)

- **Dependências:** D54, D56
- **Fazer:** `src/app/settings/notifications.tsx` — ver/gerenciar reminders por habit, permissão status, policy config default.
- **Arquivos:** `src/app/settings/notifications.tsx`.
- **Verificar:** web lista reminders salvos; `npm test -- settings` smoke.
- **Aceite:** superfície coerente com serviço.

**— Fim TIER 7 (Reminders) —**

---

# TIER 8 — SETTINGS (driver §44 Fase 8)

**Gate:** settings funcionais: aparência (theme override), notificações, defaults, export de dados, about.

### D56 — Tela Settings raiz + navegação interna

- **Dependências:** D27
- **Fazer:** `src/app/settings/index.tsx` — itens: Appearance, Notifications, Habit defaults, Data, About (§38). Lista simples.
- **Arquivos:** `src/app/settings/index.tsx`.
- **Verificar:** web navega aos 5 sub-screens.
- **Aceite:** acessível de cada sub-tela via voltar.

### D57 — Appearance: theme override (system/light/dark)

- **Dependências:** D56, D8
- **Fazer:** `src/app/settings/appearance.tsx` — `useColorScheme` (system) + override persistido em prefs (AsyncStorage, §11/§38). `ThemeProvider` consome resolução (system > override). Dark/Light mesmos tokens (§8/§25).
- **Arquivos:** `src/app/settings/appearance.tsx`, `src/services/theme.ts`, `src/theme/Provider.tsx` + `.test.ts`.
- **Verificar:** `npm test -- appearance`; alternar no web muda paleta e persiste.
- **Aceite:** override sobrevive restart.

### D58 — Habit defaults (padrões de criação)

- **Dependências:** D56, D29
- **Fazer:** `src/app/settings/defaults.tsx` — defaults (cor/ícone/frequência/reminder) aplicados ao próximo create. prefs locais.
- **Arquivos:** `src/app/settings/defaults.tsx`, `src/services/defaults.ts`.
- **Verificar:** web: default aplicado no create.
- **Aceite:** defaults não sobrescrevem escolha explícita.

### D59 — Data: backup/export manual (sem cloud)

- **Dependências:** D56, D26
- **Fazer:** `src/app/settings/data.tsx` — export JSON (habits+records+routines+skip) via share/file; import restaurando (apenas se válido e contendo histórico, append-safe). Sem login/nuvem (§11).
- **Arquivos:** `src/app/settings/data.tsx`, `src/data/exportImport.ts` + `.test.ts`.
- **Verificar:** `npm test -- exportimport` roundtrip (export → import → equal).
- **Aceite:** formato auto-descritivo (version + dataKey) para futuro sync.

### D60 — About

- **Dependencies:** D56
- **Fazer:** `src/app/settings/about.tsx` — versão, stack, fonte de verdade (link docs), sem login.
- **Arquivos:** `src/app/settings/about.tsx`.
- **Verificar:** web renderiza.
- **Aceite:** informação útil, sem bloat.

**— Fim TIER 8 (Settings) —**

---

# TIER 9 — POLISH (driver §44 Fase 9)

**Gate:** possui o DoD global completo (§45 checklist final, D66).

### D61 — Motion system (reduced-motion prefixado)

- **Dependências:** D14, D50
- **Fazer:** `src/services/motion.ts` — contexto `prefers-reduced-motion`; helpers `animate()`; todas animações (bounce/confete/🔥) passam por aqui (§37). Sem motion se reduzido.
- **Arquivos:** `src/services/motion.ts` + `.test.ts`.
- **Verificar:** `npm test -- motion` (mock matchMedia/plugin).
- **Aceite:** reduced-motion desliga bounce/confete globalmente.

### D62 — Empty/error states finais (§21) + error handling

- **Dependencies:** D30, D31, D45, D46
- **Fazer:** versão final de estados: sem hábitos / todos concluídos / sem dados stats / nada programado; error state com retry; ilustrações estratégicas em vazio/celebração (§32). 
- **Arquivos:** `src/components/feature/EmptyState.tsx` (upgrade), `src/features/errors/*`.
- **Verificar:** `npm test -- emptystate` - todos os 4.
- **Aceite:** nenhuma tela pode ficar "branca"; sempre estado explícito.

### D63 — Auditoria de acessibilidade

- **Dependências:** D32, D36, D61
- **Fazer:** revisão §37 — labels a11y, `accessibilityRole/Badge/Pressable`, foco visível e teclado no desktop, contraste (vs D8), estados não-só-cor em TODOS os componentes interativos.
- **Arquivos:** `src/components/**` (ajustes), checklist em `docs/REVIEW.md` (collateral).
- **Verificar:** `npm run lint` + revisão manual keyboard no web + `npx tsc --noEmit`.
- **Aceite:** navegação por teclado funcional; todos os componentes de estado têm símbolo+label.

### D64 — Refinamento responsivo

- **Dependências:** D27, D45
- **Fazer:** desktop: grids e dashboard multi-coluna (§36); mobile: `switch` bottom nav ≤ 44px touch; evitar "esticar" mobile no desktop (SP §3.4).
- **Arquivos:** `src/components/layout/*`, telas principais.
- **Verificar:** `npm run web` em large width mostra sidebar + colunas.
- **Aceite:** nenhuma tela de mobile vira coluna esticada no desktop.

### D65 — Consistência visual (dark≈light, Premium Playful)

- **Dependências:** D8, D61, D62, D64
- **Fazer:** revisão §22/§24/§25/§28 — dark usa contraste de superfícies (não sombras pesadas), light shadows suaves, cards ≤ radius card, hierarquia tipográfica, soma a **80/20 limpo/personalidade**, zero hex solto.
- **Arquivos:** `src/**` (ajustes), tokens.
- **Verificar:** revisão em 2 themes no web; `npm run lint`/`npx tsc --noEmit`.
- **Aceite:** light e dark parecem o mesmo produto (§45 UI).

### D66 — Verificação final DoD §45 + regressão completa

- **Dependências:** D1..D65
- **Fazer:** rodar checklist completo §45/§14 (Produto, UX, UI, Técnica) contra o app; `npm test` integral, `npx tsc --noEmit`, `npm run lint`, `npm run web` smoke (mobile + desktop).
- **Arquivos:** `docs/REVIEW.md` (resultado), nada de código a menos que paciente.
- **Verificar:** retorna green em tudo; relata gaps.
- **Aceite:** DoD global §2 cumprido; APK somente se o Tito pedir depois.

**— Fim TIER 9 (Polish) —**

---

## 5. Dependências (resumo DAG)

`D1→D2→D3/D4→D5→D6→D7→…→D26` (tier Habit engine). Tiers seguintes puxam `D8..D14` (UI base) e `D15..D26` (domínio+data). Corrente crítica: `D1 D2 D4? D5 D6 D7 D26 → D29 → D31 → D33 → D40 → D41/D42/D43 → D45 → D66`. `D52` (reminder UI) precisa de formulário D29; `D56` (settings raiz) antes de `D55/D57..D60`.

## 6. Riscos e pré-condições

- **WatermelonDB × Expo SDK 54:** adapter SQLite vive via `expo-sqlite`; se a versão do WDB ainda não casar com SDK 54, decidir no ato (D6) trocando apenas `src/data/adapters/native.ts` — contrato de repo não muda.
- **Fontes Google + offline:** usar `@expo-google-fonts/*` com fallback web; splash segura até `useFonts`.
- **`expo-notifications` no web:** notificações locais não existem no web; serviço D53 deve no-op em web (guard platform) sem quebrar Settings.
- **x_per_* day-selection** (OPEN-FR, D17): default uniforme documentado; trocar = editar `frequencyPolicy.ts` apenas.
- **Missed derivado** (OPEN 15.7): escolha de gravar `missed` exige reavaliar append-only — manter derivado no MVP.
- **Testes de componente RN exigem ANA `test` timezone fixa** para datas locais (ex.: `TZ=UTC` no script jest) — evitar flakiness.

## 7. Ordem de execução sugerida (onda inicial)

D1→D2→D3→D4→D5→D6→D7 (fundação técnica) · D8→D14 (UI base) · D15→D26 (domínio, gate do tier) → D27→D36 → D37→D39 → D40→D47 → D48→D51 → D52→D55 → D56→D60 → D61→D66 (Polish + DoD).