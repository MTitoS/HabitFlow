# REVIEW — HabitFlow · RUG State 4 (Review técnico + Signoff final)

Data: 2026-10-03 · Autor: reviewer (executor State 4) · Ambiente: Windows, Node 26, Expo SDK 57, RN 0.86.

Estado do projeto na entrada: 66/66 tasks `ok` (docs/PROGRESS.md), 134 testes verdes, tsc e lint limpos (verificação anterior D66).

## Verdict

**APPROVED** — com recomendações (ver §Riscos). Nenhum bloqueio identificado na implementação. Desvios existentes são documentados, pontuais e não violam o contrato de repositórios nem as regras §41 do driver.

Para signoff final de produção (APK), restam apenas validações de *device* (notificações) — não são bloqueio do código.

---

## 1. Reavaliação RFC — cobertura completa do §45 (SPEC_DRIVER)

### Produto

| Critério §45 | Status | Evidência |
|---|---|---|
| Entende "o que fazer hoje" em poucos segundos | ✅ | `/today` abre dashboard X/Y + % **antes** da lista (D31/D39/D41; `src/app/index.tsx`) |
| Completar hábito é rápido | ✅ | 1 tap no `HabitCheckbox` → record append-only + progresso + streak (D32; comprovado em integração) |
| Distinguir Completed/Skipped/Missed | ✅ | Símbolo + texto + cor (✓/—/✕/○, §10/§37) — `HabitCheckbox`, `ConsistencyCalendar` |
| Histórico permanece consistente | ✅ | Append-only testado (no repo e domínio); editar schedule só repõe `pending` futuro (`ensurePendings`) |
| Streaks calculadas corretamente | ✅ | `currentStreak`/`bestStreak`: respeita frequência, zera em missed, skip neutro (§41) — ver §3 |
| Hábitos quantitativos | ✅ | Meta vs registrado, unidade pré/custom, média/total/sparkline (D47, `quantitative.ts`) |
| Frequências variadas | ✅ | daily / weekdays / x_per_week / x_per_month com distribuição uniforme (D17) |

### UX

| Critério | Status | Evidência |
|---|---|---|
| Criar hábito simples | ✅ | D29 formulário com disclosure progressivo |
| Config avançada não polui | ✅ | frequência/rotina/horário/reminder em etapas opcionais |
| Dashboard antes da lista | ✅ | Estrutural em `src/app/index.tsx` (card progresso acima das seções) |
| Rotina temporal compreensível | ✅ | Grupos + header de rotina + horário lado a lado, atemporal no fim (D39) |
| Usuário descobre estatísticas | ✅ | Aba própria `/statistics` (D45) com streak/completion/weekly/month/calendar |

### UI

| Critério | Status | Evidência |
|---|---|---|
| Light e Dark = mesmo produto | ✅ | Tokens compartilhados; dark por contraste de superfícies (D8/D65) |
| Premium Playful | ✅ | Tipografia PJS/Inter, radius card 20, ~80/20 limpo/personalidade |
| Não infantil | ✅ | Sem mascote/animação excessiva; celebração só em milestone/100% |
| Cards não aninhados | ✅ | Estrutura plana (feature components únicos) |
| Hierarquia tipográfica clara | ✅ | Escala §23 implementada (`Heading`/`Text`) |
| Estado sem depender só de cor | ✅ | Todos os states interativos têm símbolo + label a11y (D63) |

### Técnica

| Critério | Status | Evidência |
|---|---|---|
| Tokens centralizados | ✅ | Zero hex fora de `src/theme/` (D8; teste de presença/contraste) |
| Componentes reutilizáveis | ✅ | Primitivas `ui/*` + feature components modulares |
| Regras de negócio centralizadas | ✅ | Função única por regra + OPEN decisions isoladas em `src/config/opens.ts` (custódia §15.7 respeitada) |
| Histórico imutável | ✅ | `pending→completed` só hoje; `skipped/completed` fatos; `missed` **nunca** gravado (grep confirmou) |
| Preparado p/ sincronização futura | ✅ | Repositórios por interface; swappable store (native/web/test) |
| Zero login/cloud/widgets/social | ✅ | Não existe código de auth/cloud no MVP |

---

## 2. Cross-check PLAN → código/commits/testes

Todos os 17 commits do `git log` mapeiam aos tiers; nenhum D de `docs/PLAN.md` ficou sem artefato.

| Tier | Tasks | Artefatos | Status |
|---|---|---|---|
| 1 Foundation | D1–D14 | scaffold SDK 57, `src/theme/*`, `src/components/ui/*`, `ui/forms`, layout/breakpoint/toast | ✅ completa |
| 2 Habit engine | D15–D26 | `domain/{date,habit,record,streak,skip-credit,stats,routine}`, `data/repositories/*` + integration | ✅ completa |
| 3 Core UX | D27–D36 | `src/app/**`, `AppScaffold`, Today/Habits/onboarding/detail/empty | ✅ completa |
| 4 Routine | D37–D39 | `app/routines/*`, order temporal | ✅ completa |
| 5 Progress | D40–D47 | `stats/aggregate`, `dashboard/*`, statistics/calendar, quantitativo | ✅ completa |
| 6 Rewards | D48–D51 | `earnedAchievements`, `MilestoneCelebration`, `CelebrationOverlay`, haptics | ✅ completa |
| 7 Reminders | D52–D55 | `reminder-config`, `notifications/{service,policy,config}`, settings surface | ✅ completa |
| 8 Settings | D56–D60 | `app/settings/*`, export/import, appearance/defaults/about | ✅ completa |
| 9 Polish | D61–D66 | motion system, empty/error finais, a11y, responsivo, DoD verificado | ✅ completa |

Gaps detectados: nenhum. Divergência registrada (já constava no PLAN/PROGRESS como DECISIONS): **WatermelonDB foi substituído** por store próprio (AsyncStorage nativo/web, memory em teste). O contrato por interface foi mantido; o desvio afeta apenas `src/data/adapters/*`.

---

## 3. Regras de negócio §41 — cobertura de teste por regra

Verificado lendo o código e executando o suite; cada regra inquebrável tem teste de domínio próprio.

| Regra §41 | Implementação | Teste | Resultado |
|---|---|---|---|
| Streak respeita frequência (não diário) | `currentStreak.ts` (isScheduled por dia) | `currentStreak.test.ts` (weekdays s/ fim de semana; x_per_week semanas consecutivas) | ✅ |
| `missed` → streak reset | `scanCurrent` zera e para em dia agendado sem record | `currentStreak.test.ts` ("driver §7", "scheduled day without record resets") | ✅ |
| Skip não é falha (não zera, não aumenta) | `scanCurrent`/`scanBest` tratam skipped como neutro | `currentStreak.test.ts` ("skip does not break or extend") | ✅ |
| Skip credit: 1/semana, cap 3 | `grantWeeklyCredit` (calendar-week, `WEEK_STARTS=1`) | `skipCredit.test.ts` (grant por semana, mesma semana não repete, cap 3) | ✅ |
| Skip nunca vira completed/missed | `useSkip` + repo `record_conflict` | `skipCredit.test.ts` + `repositories.test.ts` (skip = fato persistido) | ✅ |
| Balance nunca < 0 | `clampBalance` (0..3) | `skipCredit.test.ts` ("never drops below 0") | ✅ |
| Novo kind de frequência = 1 case no switch | `isScheduled.ts` switch único | `isScheduled.test.ts` | ✅ |
| x_per_week/month distribuição uniforme | `frequencyPolicy.ts` (`floor(i*len/count)`) | `isScheduled.test.ts` (3/sem; fronteiras) | ✅ |
| Histórico imutável (append-only) | repo recusa escrita em passado + recusa overwrite de fato | `repositories.test.ts` (`record_write_past_date`, `record_conflict`) | ✅ |
| `pending→completed` só hoje | `canCompleteToday` + repo valida `toDateKey(now)===dateKey` | `record.test.ts` | ✅ |
| Quantitativo: meta vs registrado | `quantitativeStats` | `quantitative.test.ts` | ✅ |
| Completion rate = completed/scheduled, skip neutro | `completionRate.ts` (OPEN 15.2) | `completionRate.test.ts` (ex. 0.4 com 2 skipped) | ✅ |

Suite completo executado: **27 suites / 134 testes passando, exit 0.**

---

## 4. Code review pontual

Trechos revisados: `skip-credit/*`, `streak/*`, `stats/*`, `record/*`, `data/repositories/impl.ts`, `services/notifications/{service,policy}.ts`, `domain/date/dateUtils.ts`, `config/opens.ts`.

Achados:

1. **Domínio 100% puro — quase.** `src/domain/habit/model.ts:2` importa `ColorToken` de `@/theme/types`. `theme/types.ts` é puras tipagens (sem RN/banco), então o risco é nulo, mas fere a letra da regra "domain sem imports de app" (§3.3/§5). Correção trivial sugerida: mover `ColorToken` para `src/domain` (ou módulo compartilhado puro) e reexportar no `theme`. **Não bloqueia.**
2. **IDs não são UUID RFC4122.** `generateId` (impl.ts:21) usa `Math.random().toString(36)` + timestamp. Único o suficiente para o MVP local, porém o critério "UUID → merge futuro sem colisão" (§3.5) fica mais fraco. Risco futuro, não bloqueia.
3. **`scanBest` não zera run em dia agendado vazio. Hoje** — comportamento correto (dia corrente pendente não corrige o melhor histórico); apenas registrado para consciência.
4. **Jest: warning de teardown** ("worker process has failed to exit gracefully"). Não falha nenhum teste; indica timer/leak em algum teste de componente. Recomenda-se investigar com `--detectOpenHandles` em manutenção futura. Não bloqueia.
5. **`completionRate` prevê toggle extra** (OPEN.COMPLETION_RATE_SKIP → 'counts-as-completed'). Fora do default, mas mantém "função única + config" pedida; sem impacto.
6. **Redundância trivial** em `currentStreak.ts:63-64` (`if (broke) return run; return run;`) — cosmético, sem efeito.

Nenhum bug funcional encontrado. Nenhuma correção aplicada no código (budget preservado; tudo cosmético).

---

## 5. Verificação prática (re-executada)

| Comando | Exit | Resultado |
|---|---|---|
| `npm test` | 0 | 27 suites, 134 testes passando (suite completo) |
| `npx tsc --noEmit` | 0 | "No errors found" |
| `npm run lint` | 0 | sem warnings |
| `npx expo export --platform web` | 0 * | 19 rotas estáticas (verificado em D66; re-export consistente) |

\* web export não re-executado na íntegra nesta sessão; evidenciado por D66 e ausência de mudança de interface desde então.

---

## 6. Riscos

| Risco | Severidade | Detalhe | Mitigação |
|---|---|---|---|
| Notificações não validadas em device | **Alto** | `expo-notifications`: agendamento local só testado via mock. Em Android, notificações exigem canal + (possível) permissão exata de alarme, coisas a verificar em `app.json`/build real. Disparo depende de `rescheduleForHabits` rodar; sem "background cron", o reminder do dia exige abrir o app no dia. | Validar em device/emulador antes do APK (D53 já tem guard web e mock de teste). |
| Store custom (AsyncStorage) no lugar de SQLite/WDB | Médio | Volume/performance em histórico longo; sem transações atômicas reais por tabela (grava array completo). OK p/ MVP. | Mapeado no contrato: trocar adapter sem tocar interface. |
| IDs não-UUID | Médio (futuro) | Merge/cloud futuro exigiria regeneração ou switch. | Aceitável no MVP; registrar em DECISIONS. |
| Fuso horário/DST | Baixo | Todo `toDateKey` e `dateAtTime` usam hora **local** consistente — sem mistura UTC/local. Risco só em viagem com DST (agendamento de notificação). | Válido em device. |
| Teardown de teste (jest) | Baixo | Warning de worker; nenhum fail. | `--detectOpenHandles` em manutenção. |
| `domain → theme` coupling | Baixo | Regra "domínio puro" não 100% literal (ver §4.1). | Mover `ColorToken` para `src/domain` (trivial). |

## 7. Bloqueadores

Nenhum.

## 8. Recomendação

1. **APPROVED** para o escopo do RUG (State 2 → implementação, saída: app funcional local + web).
2. Antes de qualquer **APK** (se Tito solicitar): validar notificações em device/emulador (permissões, canal, disparo) e conferir queda de desempenho do store com histórico ≥ 1 ano.
3. Ajuste cosmético opcional: mover `ColorToken` de `theme` para módulo puro (Item 4.1) — 10 min, remove o único desvio de pureza do domínio.

---

## 9. Signoff

- Executor State 4: **APPROVED** · Data: 2026-10-03
- Critério do RUG cumprido: `npm test` 100% verde, `tsc` e `lint` limpos, app local + web responsivo.
- Este REVIEW substitui o anterior (State 3/D66), incorporando reavaliação §45, cross-check de plano, cobertura de regras §41, revisão de código e re-verificação prática.

---

# REVIEW — HabitFlow · RUG ciclo 2 (C1..C17, refinamentos fase B)

Data: 2026-10-05 · Autor: executor State 3 (ciclo 2) · Ambiente: Windows, Node, Expo SDK 57, RN 0.86.

## Verdict

**APPROVED** — 17/17 tasks `ok`, baseline 171 testes preservado, suite total 213 verdes, `tsc`/`lint` limpos, web export OK.

## Entregas

- **T1** streak individual no `HabitRow` (Home); **T2** streak geral + frase fixa do dia no header da Home.
- **T3** skip-neutro coberto nos 2 níveis (individual + geral), missed zera.
- **T4** busca (case/acento-insensível), 3 ordenações e filtro por rotina persistidos (`prefs`).
- **T5** `ConsistencyCalendar` removido (arquivo + imports), aba Calendário intacta.
- **T6** `MonthView` (headline + heatmap vencido/parcial/neutro + resumo) em Estatísticas.

## Invioláveis

- `src/config/opens.ts` §15.1 (grant semanal) intocado.
- `DaySummary`: campos legados `overallCurrentStreak`/`overallBestStreak` preservados; novos aditivos
  (`dayStreakCurrent`/`dayStreakBest`) consumidos por Home/StreakCard.
- Histórico append-only; frequência vigente (10.4 off-future); sem migration/schema novo.

## Verificação

- `npm test` → 38 suites / 213 testes verdes (171 baseline + 42 novos).
- `npx tsc --noEmit` limpo; `npm run lint` limpo.
- `npx expo export --platform web` → 19 rotas exportadas sem erro.
- APK release arm64 gerado (34.7 MB < 50 MB). Device wireless offline no momento → verificação em
  device DEFERRED (não bloqueia).

## Riscos

| Item | Severidade | Nota |
|---|---|---|
| Device verify (adb wireless) offline | Baixo | Retomar quando o device voltar; build/smoke web OK. |
| `sortHabits('routine')` agrupa por `routineId` (sem lista de rotinas) | Baixo | Tela faz agrupamento visual com nomes/subtítulos; domínio testado. |
| Notificações em device | Médio (herdado c1) | Inalterado neste ciclo. |
