# PROGRESS — HabitFlow · Status por task (D1..D66)

> Estado 3 — implementação. Tudo `ok` verificado por CI local (jest · tsc · eslint · web export).
> Fonte da ordem/deps: `docs/PLAN.md`. Contrato: `docs/SPEC.md`.

## Legenda
- **ok** — implementado e verificado.
- **deferred** — não executado (justificado).
- **fail** — bloqueado (justificado).

---

## TIER 1 — Foundation

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D1 | Scaffold Expo SDK | ok | create-expo-app → SDK 57 (≥54, RN 0.86, Expo Router, typedRoutes strict) |
| D2 | Layout `src/` + strict + alias `@/*` | ok | Template já usava `src/app`; pastas de domínio/data/theme etc criadas |
| D3 | ESLint + Prettier | ok | expo lint + prettier, `npm run lint` limpo |
| D4 | Harness jest-expo + testing-library | ok | RNTL v14 async `render`/`fireEvent`; 134 testes verdes |
| D5 | WDB models + schema v1 + migrations | ok | **Adapter substituído** (DECISIONS): Nozbe WatermelonDB não pareia com SDK 57/RN 0.86; contrato de schema/índices/migrations mantido em `src/data/schema.ts` |
| D6 | Factory de banco (device/web/jest) | ok | `createStore('native'|'web'|'test')` — AsyncStorage (nativo/web) / Memory in-memory (test); guard de platform |
| D7 | Repositórios por interface + contrato de escrita | ok | append-only, único `(habitId,date)`, escrita só hoje (+ pending futuro), singleton `skip_credit` — testado |
| D8 | Tokens semânticos light/dark + spacing/radius/typography | ok | Paletas independentes; contraste ≥4.5 testado |
| D9 | Fontes Plus Jakarta Sans + Inter | ok | expo-font; fallback web |
| D10 | Primitivas I (Text/Heading/Button/IconButton/Icon) | ok | Estados §30, labels a11y, Icon lucide+emoji |
| D11 | Primitivas II (Card/Divider/Badge/ProgressBar/ProgressRing) | ok | a11y value em bar/ring |
| D12 | Formulários I (Input/Textarea/Select/Checkbox/Switch/Radio) | ok | estados foco/erro/disabled |
| D13 | Formulários II (TimePicker/DatePicker/ColorPicker) | ok | TimePicker `HH:mm`; ColorPicker restringe tokens §24 |
| D14 | Layout + breakpoints + Toast (OPEN 15.6) | ok | `useBreakpoint` (mobile/tablet/desktop); Toast topo ícone+cor+label |

## TIER 2 — Habit engine

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D15 | Utils de data (domínio puro) | ok | dateKey local, semana segunda |
| D16 | Modelo Habit/Frequency/Schedule + validateHabit | ok | quant exige meta+unidade; customUnit aceito |
| D17 | isScheduled + frequencyPolicy (OPEN-FR) | ok | switch único; distribuição uniforme (x_per_week/month) |
| D18 | Record transições append-only | ok | `pending→completed` só hoje; skipped/completed são fatos |
| D19 | currentStreak | ok | §§ plano: missed zera e para; skip neutro; weekdays/x_per_week |
| D20 | bestStreak | ok | varrê histórico; caso driver Best=3 |
| D21 | Skip credit grant (OPEN 15.1) + useSkip + cap | ok | semana-calendário segunda; cap 3; invariante |
| D22 | completionRate (OPEN 15.2) | ok | `completed/scheduled`, skip neutro (0.4 no exemplo) |
| D23 | materializeMissed (OPEN 15.7) | ok | derivado na leitura; nunca grava |
| D24 | Achievements (puro, positivo) | ok | 7/30d, 100/365, all-done |
| D25 | Routine grouping + ordem temporal | ok | atemporal no fim; ordenado por horário |
| D26 | Repositórios concretos + integração | ok | fluxo completo em teste de integração (LokiJS in-memory → Memory store) |

## TIER 3 — Core UX

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D27 | Nav shell Expo Router (mobile/desktop) | ok | `AppScaffold`: bottom nav mobile / sidebar desktop |
| D28 | AddHabitButton (OPEN 15.3) | ok | FAB mobile / header desktop, em Today + Habits |
| D29 | Create Habit (disclosure) | ok | formulário com tipo/freq/rotina/horário/reminder |
| D30 | Onboarding minimalista | ok | 1 tela → create; `onboarding_done` em prefs |
| D31 | Today: dashboard-primeiro + rotinas | ok | Progresso antes da lista; grupos por rotina |
| D32 | HabitIcon + HabitCheckbox (não-cor-only) | ok | ✓ — ○ ✕ + label a11y |
| D33 | HabitCard/Row/Streak | ok | streak/percent via domínio |
| D34 | Edit + arquivar/excluir | ok | histórico imutável; pending futuro reposto |
| D35 | Habit Detail | ok | streak/best/%mês/calendário 7d/quantitativo |
| D36 | Splash + empty/error states v1 | ok | EmptyState/ErrorState |

## TIER 4 — Routine

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D37 | CRUD rotinas | ok | listar/criar/editar/excluir (hábitos → sem-rotina) |
| D38 | Vincular rotina + horário no habit | ok | selects no create/edit |
| D39 | Today ordenado por rotina/horário | ok | `sortByTime` dentro do grupo |

## TIER 5 — Progress

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D40 | Selectors de stats derivados | ok | `aggregate` (daySummary/weekly/monthly/totals) |
| D41 | TodayProgress + DailySummary | ok | X/Y + % + ring |
| D42 | WeeklyChart (bar semanal) | ok | modular, não-cor-only (label %) |
| D43 | ProgressRing mensal + ConsistencyCalendar | ok | intensidade + símbolo ✓/◐/○ por dia |
| D44 | StreakCard + CompletionChart | ok | current/best do domínio |
| D45 | Tela Statistics (OPEN 15.4) | ok | composição de módulos |
| D46 | Tela Calendar | ok | mês navegável + detalhe do dia |
| D47 | Stats quantitativas por hábito | ok | média/total/meta/sparkline |

## TIER 6 — Rewards

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D48 | earnedAchievements | ok | derivado puro; marcadores “visto” idempotentes |
| D49 | MilestoneCelebration | ok | overlay 1x por novo marco |
| D50 | Microinteração + haptics | ok | `triggerSuccess` no check (web no-op) |
| D51 | 100% do dia celebra | ok | reduced-motion aware |

## TIER 7 — Reminders

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D52 | ReminderConfig na UI | ok | off | 08:00 + múltiplos |
| D53 | NotificationService | ok | permissão em contexto; schedule/cancel; web no-op |
| D54 | policy.ts (OPEN 15.5) | ok | função única; não-agendado skip; atrasado segue config |
| D55 | Settings > Notifications | ok | lista habits com reminder + status permissão |

## TIER 8 — Settings

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D56 | Tela Settings raiz | ok | 5 sub-screens + rotinas |
| D57 | Appearance (system/light/dark) | ok | override persistido; ThemeProvider |
| D58 | Habit defaults | ok | aplicados no create (não sobrepõem escolha) |
| D59 | Data export/import | ok | JSON versionado; roundtrip testado; sem nuvem |
| D60 | About | ok | versão + stack |

## TIER 9 — Polish

| Task | Descrição | Status | Nota |
|---|---|---|---|
| D61 | Motion system (reduced-motion) | ok | `MotionProvider` + `shouldAnimate` |
| D62 | Empty/error states finais | ok | 4 kinds + retry |
| D63 | Auditoria de acessibilidade | ok | roles/labels nos interativos; estados não-só-cor |
| D64 | Refinamento responsivo | ok | sidebar desktop + maxWidth content |
| D65 | Consistência visual | ok | dark por contraste de superfície; light sombras discretas |
| D66 | Verificação final DoD §45 | ok | jest/tsc/lint/web export - ver `docs/REVIEW.md` |

---

## Resumo

- **Total:** 66 · **ok:** 66 · **deferred:** 0 · **fail:** 0
- **Desvios vs PLAN:** 1 (persistência, ver DECISIONS) — não altera contrato de repositórios.
- **Gate por tier:** todos os tiers com testes/typecheck/lint verdes ao fechar.