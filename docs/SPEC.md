# SPEC — HabitFlow · Especificação Técnica do MVP

> Contrato técnico derivado de [`docs/SPEC_DRIVER.md`](docs/SPEC_DRIVER.md) (fonte de verdade do produto).
> Este documento NÃO inventa regra de negócio. Toda decisão OPEN/A DEFINIR do produto é registrada na seção
> [15. Registro de decisões OPEN](#15-registro-de-decisões-open), isolada em ponto único de código.

---

## 1. Resumo executivo

- **Produto:** Habit Tracker + Routine (local-first, sem login/cloud no MVP).
- **Stack decidida:** React Native + Expo SDK 54+, TypeScript strict, persistência local escolhida (WatermelonDB, ver §3.2), `expo-notifications` (reminders), `expo-haptics` (microinterações), `lucide-react-native` (ícones), `expo-web` (desktop/web secundário e responsivo).
- **Plataforma principal:** Android/iOS (mobile-first). Desktop/web responsivo secundário.
- **Estado do dado:** histórico imutável e só-append via `HabitRecord` por data.
- **Fonte de verdade de produto:** implementar apenas o que §1–§46 de `SPEC_DRIVER.md` define. Nada além.

## 2. Objetivos (Goals)

1. `Today first` — o usuário entende o estado do dia em poucos segundos (dashboard antes da lista).
2. `Low friction` — completar um hábito é a ação de menor custo do app.
3. `Progress over punishment` — streaks, completion rate, milestones, achievements. Zero linguagem punitiva.
4. `History is immutable` — passado representa o que aconteceu (append-only).
5. `Skip is not failure` — estado visual e semântico próprio, consome crédito, não zera streak.
6. `Clean first, personality second` — Premium Playful (~80% UI limpa / 20% personalidade), sem copiar a referência.
7. Arquitetura preparada para futura sincronização/cloud sem quebrar dados locais (§3.5).

## 3. Stack e arquitetura

### 3.1 Stack escolhida

| Camada | Decisão | Justificativa |
|---|---|---|
| Framework | React Native + **Expo SDK 54+** | Build native Android/iOS + web responsivo (`expo-web`) com um único codebase |
| Linguagem | **TypeScript strict** | Contratos de domínio explícitos, migração segura |
| Persistência | **WatermelonDB** (adapter SQLite) | Ver §3.2 |
| Notificações | **`expo-notifications`** | Lembretes com horários reais no dispositivo |
| Haptics | **`expo-haptics`** | Feedback tátil sutil no check (microinteração) |
| Ícones | **`lucide-react-native`** + suporte a emoji | §31 do driver: ícones minimalistas + emoji livre |
| Web | `expo-web` via **repositório interface com adapter web** | Ver §3.4 |

### 3.2 Decisão de persistência — WatermelonDB

Escolhido **WatermelonDB** sobre `react-native-quick-sqlite`.

Justificativa:

- **Reatividade nativa ao dado:** coleções observáveis sincronizam UI sem camada de store manual; combina com o dashboard/lista que atualizam a cada check (microinteração + progresso em tempo real).
- **Modelo entidade-relação explícito:** `Habit → HabitRecord`, `Routine → Habit` — espelha o modelo §34 do driver.
- **Arquitetura sync-ready:** WatermelonDB foi desenhado para sincronização de coleções — alinhado ao requisito de arquitetura preparada para cloud futura (§3.5), sem adicioná-la no MVP.
- **Append-only natural:** records imutáveis por data com índice `(habitId, date)`.

Trade-offs aceitos:

- **Schema versionado + migrations:** toda evolução exige migração — comportamento desejado p/ integridade histórica.
- **Web não suporta o adapter SQLite:** mitigado pelo repositório por interface (§3.4) — web usa adapter em memória/localStorage; persistência real é nativa.

### 3.3 Camadas da arquitetura

```
src/
├── app/            # Expo Router: rotas e telas (navegação §13/§38)
├── components/     # primitives + feature components (§29)
│   ├── ui/         # primitives (Button, Card, ProgressBar, ...)
│   └── feature/    # HabitCard, TodayProgress, HabitCheckbox, ...
├── domain/         # regras de negócio PURAS (sem imports de app)
│   ├── habit/      # modelo, frequência, isScheduled
│   ├── record/     # status, append-only, transitions
│   ├── streak/     # current/best streak (§41)
│   ├── stats/      # completion rate (§10 — função única)
│   ├── skip-credit/# cron dom crédito + saldo (§8 — regra isolada)
│   └── routine/    # agrupamento + ordem temporal
├── data/           # WatermelonDB: schema, migrations, models, repository (interface)
├── services/       # notifications (§19), haptics, theme (Appearance)
├── theme/          # tokens semânticos dark/light (§24/§25/§26/§27)
├── i18n/           # strings UI (sem regra de negócio em texto)
└── utils/
```

**Grande regra de arquitetura:** `domain/` é 100% puro e testável (funções que recebem records/habit e retornam métricas). Regras OPEN vivem lá, isoladas em um único módulo cada.

### 3.4 Adapter web (bloco secundário)

- Persistência por repositório interface (`HabitRepository`, `RecordRepository`, ...).
- Native → WatermelonDB; Web → adapter `localStorage`/memória com o MESMO contrato.
- UI responsiva via breakpoints: mobile (bottom nav) / desktop (sidebar + dashboard em colunas, §36). Não esticar UI mobile.
- Touch targets, teclado e focus-visibility no desktop (§37).

### 3.5 Preparação p/ futuro (sem implementar no MVP)

- Repositórios por interface + coleções WatermelonDB → prontos p/ sync em sequência/full.
- IDs UUID (`nanoid`) → merge futuro sem colisão.
- **Fora do MVP e NÃO aparecem na UI:** login, contas, cloud sync, widgets, social, competição (§3.2 driver).

## 4. Modelo de dados

Conceitos preservados do driver §34. TypeScript representativo (WatermelonDB reifica 1:1):

### 4.1 `Habit`

```typescript
type HabitType = 'binary' | 'quantitative';
// unit: lista pré-definida OU customizada (§4.2 driver)
type PredefinedUnit =
  | 'vezes' | 'minutos' | 'horas' | 'paginas' | 'litros' | 'ml'
  | 'passos' | 'km' | 'repeticoes' | 'sessoes';

interface Habit {
  id: string;                 // uuid
  name: string;
  description?: string;
  icon: string;               // nome lucide | emoji (§31)
  color: ColorToken;          // token semântico, NUNCA hex solto (§24/§25)
  type: HabitType;
  targetValue?: number;       // quantitativo
  unit?: PredefinedUnit;      // quantitativo
  customUnit?: string;        // unidade customizada livre (pari a predefined)
  frequency: Frequency;       // §5
  schedule: Schedule;         // §5
  routineId?: string;         // associação com Routine (§6)
  scheduledTime?: string;     // "HH:mm" dentro da rotina (§6.2)
  reminder?: ReminderConfig;  // §19
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;        // arquivado (não excluído)
}
```

### 4.2 `Frequency` e `Schedule` (§5)

```typescript
type FrequencyKind = 'daily' | 'weekdays' | 'x_per_week' | 'x_per_month';

interface Frequency {
  kind: FrequencyKind;
  schedule: Schedule;
}

interface Schedule {
  days?: Weekday[];           // weekdays: ['mon','tue','thu','fri']
  countPerPeriod?: number;    // x_per_week (3) / x_per_month (10)
}
```

- O tipo é **descrito e extensível**: novos kinds de frequência no futuro não quebram dados existentes (§5.4 driver) — o resolver de agendamento vive em `domain/habit/isScheduled.ts` em switch único.

### 4.3 `HabitRecord` — histórico imutável (§9/§41)

```typescript
type RecordStatus = 'pending' | 'completed' | 'skipped' | 'missed';

interface HabitRecord {
  id: string;
  habitId: string;
  date: string;               // 'YYYY-MM-DD' (local)
  status: RecordStatus;
  value?: number;             // quantitativo: valor registrado
  completedAt?: number;
}

// Índice único (habitId, date) — 1 record por hábito por dia.
// SÓ-APPEND: nunca modificar/reescrever record já persistido.
// Transição permitida: 'pending' → 'completed' do DIA atual (registro do fato, não reescrita de história).
```

Regras de escrita no repositório:

- `create`/`updateStatus` somente para o dia de hoje (ou repor `pending` futuro ao agendar).
- Status **`missed`** é **derivado por função de domínio** ao calcular stats — materializado apenas onde a UI precisa (calendário/dashboard), nunca como overwrite de história, OU gravado como record definitivo na passagem do dia conforme decisão §15.7 (nunca ambos).
- `skipped`, `completed`, `value` são os únicos estados persistidos como fato pelo usuário.

### 4.4 `Routine` (§6)

```typescript
interface Routine {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: ColorToken;
  order: number;              // sequência entre grupos
}
```

- **Agrupamento:** `habit.routineId` → `Routine`.
- **Sequência temporal no grupo:** order por `habit.scheduledTime` (mem = atemporal no fim do grupo), depois por hora.
- Visão de hoje prioriza hábitos programados para o dia (§6.2), agrupados por rotina.

### 4.5 `SkipCredit` — saldo de créditos (§8)

```typescript
interface SkipCredit {
  id: string;                 // singleton por usuário local
  balance: number;            // 0..3 (cap rígido)
  lastGrantRef: string;       // ref de período já creditado (semana-chave)
  updatedAt: number;
}
```

- Concessão semanal (1/semana, máx 3 acumulados) em **função isolada** — regra exata é OPEN, ver §15.1.
- Consumo de 1 crédito a cada `skip` (§8.3). Nunca abaixo de 0, nunca acima de 3 (§8.4).

## 5. Regras de negócio centrais (módulos de domínio puros)

Cada regra é **uma função única** por questão — requisito explícito do driver (§8.5, §10, §19, §42). Todas em `domain/`, sem I/O, teste unitário direto.

### 5.1 Streak (§7, §41)

`domain/streak/currentStreak(habit, records): number`

- Respeita a frequência programada do hábito (não assume diário, §7 driver).
- Regra: para cada dia agendado **do dia atual para trás**, se houver `completed` → conta; se `skipped` → não conta e NÃO zera (skip não é falha); se o dia **era agendado e não há record** (ou `missed`) → **zera** e para a contagem.
- `missed` = dia agendado sem `completed` → zera. (§41: "Missed → streak reset".)

`domain/streak/bestStreak(habit, records): number`

- Mesma definição de "semana válida", varre todo o histórico. Histórico nunca apagado/reescrito por causa de streak (§7).

### 5.2 Skip (§8)

`domain/skip-credit/grantWeeklyCredit(state, now): newState` — **função da regra OPEN** (§15.1): isolar semana-calendário vs período móvel 7d vs outro.

`domain/skip-credit/useSkip(state): newState` — valida saldo > 0, decrementa, registra record `'skipped'` (+ `skippedAt`). Skip nunca vira `completed`, nunca vira `missed`, não aumenta streak, aparece em histórico e calendário.

Cap por invariante: `balance = clamp(0..3)`.

### 5.3 Completion rate (§10, §41)

`domain/stats/completionRate(records, scheduledDates): number` — **função única**, OPEN a fórmula exata e relação com skips (§15.2). Regra mínima segura: `completed` conta, `missed` não conta, `pending` não conta, `skipped` NÃO é tratado automaticamente como `completed`. Derivado do histórico, nunca duplicado (§35 driver).

### 5.4 Histórico imutável (§9)

- `HabitRecord` só-append (§4.3).
- Mudanças futuras (frequência, meta, rotina) NUNCA revisitam records passados.
- Comparação com período passado usa `habit.frequency` configurada NAQUELE dia apenas quando a UI exige (histórico factual é o record).

### 5.5 Milestones / achievements (§11)

`domain/stats/achievements(derivedStats): Achievement[]` — derivado puro (7d streak, 30d streak, 100/365 completions, all-completed-daily, etc.). Sem XP/moedas/no levels (§11.3). Positivos, zero linguagem punitiva.

## 6. Tema e design tokens (§22–§27)

- **Tokens semânticos**, nunca hex espalhado (§24): `colors.background`, `colors.surface`, `colors.primary`, `colors.success`, `colors.textPrimary`, `colors.border`, etc.
- `ColorToken` para hábitos referencia token semântico (ex.: `success`, `primary`, `secondary`, `accent`) — não um valor solto.
- **Dark não é inversão do Light** (§25): usa contraste entre superfícies (`surface`, `surfaceElevated`) em vez de sombras pesadas.
- Light shadows suaves e discretas; dark minimizado (§28).
- Typography: Plus Jakarta Sans (display/headings Bold/ExtraBold) + Inter (body), escala fixa do driver §23 — via `expo-font` + sobrescritas do tema.
- Spacing tokens §26 (`4…64`), radius §27 (`sm…1`, card 20 / modal 28 / button pill / input 14).
- `prefers-reduced-motion` respeitado (§37): animações prefixadas no sistema de motion.

Comportamento:

- Tema **system / light / dark** (§38 Appearance). Detecção via `useColorScheme`, override persistido local.

## 7. Navegação e telas (§13, §38, §40)

**Expo Router** (file-based), estrutura §38:

```
Home        → /today  (/dashboard como variante desktop)
Habits      → list ativos+arquivados, busca, create, edit, /habit/[id]
Statistics  → /statistics (overview + por hábito)
Calendar    → /calendar
Settings    → /appearance | /notifications | /defaults | /data | /about
```

- Bottom navigation mobile (Home / Habits / Statistics / Calendar / Settings); sidebar no desktop (§36).
- **Botão `+`:** posição final OPEN (§15.3) — implementado como componente único `AddHabitButton` (FAB mobile / header desktop), fácil de reposicionar.
- Splash/loading, onboarding minimalista (1 tela → create primeiro hábito, sem conta), empty/error states (§21, §40) presentes desde o início.

Lista de telas esperadas (§40): splash; onboarding; home/today; habits; create; edit; habit detail; calendar; statistics; settings; appearance; notifications; empty states; error states; achievement/milestone feedback.

## 8. Persistência e integridade histórica

- **WatermelonDB**, schema versionado com até 2 migrations; repositórios por interface (§3.3/§3.4).
- Records: único por `(habitId, date)`; append-only; `missed` derivado quando possível (§4.3, §15.7).
- Lock de escrita: ID único `skip_credit` singleton.
- Backup manual dos dados em `Settings > Data` (export sem cloud).
- IDs UUID: merge futuro sem colisão (§3.5).

## 9. Reminders / notificações (§19)

`expo-notifications`:

- `ReminderConfig { enabled: boolean; times: string[] }` → 1..N horários (progressive disclosure; default no card = sem reminder, opção 08:00, expande p/ múltiplos).
- Política de notificação (multi-reminder × frequência × atrasados) — **OPEN** (§15.5), isolada em `services/notifications/policy.ts` função única. Never espalhada.
- Permissões pedidas em contexto (primeira vez que usuário configura reminder), não no onboarding.
- Notificação local agendada por horário local do hábito (`scheduledTime` ou hora do reminder).
- Config surface: `Settings > Notifications` (§38).

## 10. Feedback, microinterações, acessibilidade (§30, §32, §33, §37)

- Compleção = bounce + check animado + progresso atualizado + **haptics** (sutil) + toast/semáforo não-cor-only.
- **Estado nunca só por cor:** Completed ✓, Skipped —, Missed ✕, Pending ○ — símbolos + cor + label acessível (accessibilityLabel/Semantics).
- Estados de componente listados no §30 do driver exigidos por componente interativo.
- Motion rápido e discreto; `reduced-motion` desabilita bounce/confete.
- Touch targets ≥44px, focus visível e navegação por teclado no desktop.
- Confete/celebração 100% do dia e milestones (§11, §33).

## 11. Persistência de configuração de UI

- Appearance (theme override), defaults de hábito, unit custom, onboarding concluído → store local simples (`AsyncStorage`/WatermelonDB record pit) fora do histórico.
- Sem conta, sem perfil, sem cloud (§41 MVP).

## 12. Mapa de cobertura do driver (SPEC_DRIVER → SPEC)

| Driver | Cobertura na SPEC |
|---|---|
| §1–§2 visão + core loop | §1, §2 |
| §3 escopo MVP in/ex | §1, §3.5 |
| §4–§5 modelo + frequência | §4.1–§4.2 |
| §6 rotina | §4.4 |
| §7–§8 streak + skip | §5.1–§5.2, §4.5 |
| §9 histórico imutável | §4.3, §5.4 |
| §10 completion rate | §5.3 |
| §11 recompensas | §5.5 |
| §12–§13 nav + home priority | §2, §7 |
| §14–§16 habit screens | §7 |
| §17–§18 calendar + statistics | §7, §15.4 |
| §19 reminders | §9 |
| §20–§21 onboarding + empty states | §7, §10 |
| §22–§28 visual/typography/tokens | §6 |
| §29–§33 componentes/estados/icons/motion | §3.3, §10 |
| §34–§35 modelo dados + derived | §4, §5 |
| §36 responsividade | §3.4 |
| §37 acessibilidade | §10 |
| §38 navegação | §7 |
| §39 UX principles | §2 |
| §40 telas | §7 |
| §41 regras inquebráveis | §5.1–§5.4 |
| §42 decisões OPEN | §15 (registro) |
| §44 fases | §13 |
| §45 critérios | §14 |

## 13. Fases de implementação (driver §44)

1. **Foundation** — tokens/temas/typography/spacing/base components/responsivo.
2. **Habit engine** — modelo + frequências + binary + quantitativo + records + streak + skip + history (domains puros, testes).
3. **Core UX** — Home/Today, listas, create/edit/detail.
4. **Routine** — grupos, ordenação temporal, horários.
5. **Progress** — dashboard, statistics, calendar, streaks, completion rate.
6. **Rewards** — milestones, achievements, microinterações, celebrações.
7. **Reminders** — config + notificações.
8. **Settings** — appearance, notifications, defaults, data, about.
9. **Polish** — animações, empty/error states, acessibilidade, refinamento responsivo, consistência visual.

Cada fase termina com testes do domínio afetado + revisão de contraste/estado (não-cor-only).

## 14. Critérios de aceite (driver §45)

- O usuário entende o que fazer hoje em poucos segundos.
- Completar hábito é rápido (1 tap), com feedback (haptic + visual + toast).
- Completed / Skipped / Missed / Pending distinguíveis sem cor.
- Histórico permanece consistente após edição de frequência/meta (append-only).
- Streak respeita frequência e zera em `missed`; skip não zera.
- Quantitativos: meta vs registrado, unidade pré-definida + custom, média/total/evolução (§16).
- Tokens centralizados; regras centrais em função única (streak/skip/completion/notifications).
- Dark e Light parecem o mesmo produto.
- Sem login/cloud/widgets/social no MVP; arquitetura apeita sync futuro.
- Charts de Statistics modulares (componentes independentes) — OPEN §15.4.

## 15. Registro de decisões OPEN

Questões do driver **isoladas em ponto único de código**. Nenhuma regra de negócio definitiva inventada aqui.

| # | Questão (driver) | Local de isolamento | Estado |
|---|---|---|---|
| 15.1 | Regra exata de concessão do skip semanal (§8.5, §42.1) | `domain/skip-credit/grantWeeklyCredit.ts` | OPEN — implementar primeiro com Semana-Calendário começando segunda, fácil trocar p/ janela móvel 7d (função única + teste de caller único) |
| 15.2 | Fórmula exata de completion rate com skip (§10, §42.2) | `domain/stats/completionRate.ts` | OPEN — chamada única pela UI; fórmula inicial 'completed/scheduled' com skip como neutro |
| 15.3 | Posição final do botão `+` (§13, §42.3) | `components/feature/AddHabitButton.tsx` + layout navegação | OPEN — FAB mobile / header desktop por padrão |
| 15.4 | Conjunto final de gráficos Statistics (§18, §42.4) | `components/feature/dashboard/` módulos | OPEN — componentes modulares; mínimo inicial: bar semanal + ring mensal + calendário consistência |
| 15.5 | Regras avançadas de reminders (§19, §42.5) | `services/notifications/policy.ts` | OPEN — única função |
| 15.6 | Posição/estilo do toast de feedback | `components/ui/Toast.tsx` + tokens | OPEN — default: topo com ícone+cor+label |
| 15.7 | Materialização de `missed` (derivado vs gravado) | `domain/stats/materializeMissed.ts` | OPEN — preferência: derivado na leitura; gravar apenas se UX exigir retrocesso (`pending` atrasado fica visível como pendente; celular provoca refresh) |

**Regra de custódia:** qualquer decisão OPEN só muda dentro do arquivo indicado. Nenhum outro módulo lê a regra.