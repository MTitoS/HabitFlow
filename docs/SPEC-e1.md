# SPEC-e1 — HabitFlow · Semântica unificada do day-cell no Calendário global

> Ciclo e1. Derivado de `docs/SPEC-c4.md` (charts) e `docs/SPEC-c3.md` (retroativo + streak) +
> `docs/SPEC_DRIVER.md` §8 (skip neutro), §9 (histórico imutável), §35 (derivado), §37 (a11y).
> Autoridade da semântica day-level: `src/domain/streak/overallStreak.ts` (`isConqueredDay`,
> `monthDayStatus`) — ciclo c3.
>
> Foco: **unificar a semântica do dia entre o `MonthView` (Stats "Mês") e a aba Calendário global**,
> destacando **dia vencido/sucesso** (conquered) e **dias com tasks skipadas**, mantendo o detalhe
> por-task ao tocar.
>
> Este documento é *spec only* — nenhum código foi alterado no discovery. Baseline: **266 testes /
> 41 suites** (`npx jest`, v0.2.3-c4fix).

---

## 1. Escopo

### 1.1 Incluído

| # | Refinamento | Tipo |
|---|---|---|
| E1 | Gramática day-level da aba Calendário = c3: `conquered` / `partial` / `pending` / `skip` | Domínio (derivado) |
| E2 | Destaque visual de **dia vencido** (`conquered` = todos completed **ou** skipped) e **flag de skip** num day-cell pequeno | UI |
| E3 | Detalhe por-task ao tocar preservado (quais concluídas, quais skipadas) | UI (intocado) |
| E4 | Tokens **compartilhados** quando semântica igual: `calendarDoneFill/Fg`, `calendarSkipFill/Fg`, `accent` — **zero token novo** | Tokens |
| E5 | Pending de hoje (dia corrente aberto) = **neutro**, não falha | UI |

### 1.2 Fora do escopo

- Charts `WeeklyChart`/`CompletionChart` (composição c4fix) — **intocados**.
- Grant semanal (`src/config/opens.ts` §15.1) — **intocado**.
- `MonthView` e `monthDayStatus` (superfície c3) — **comportamento inalterado**.
- Detalhe do dia (`dayStatus`, `statusForView`) — segue idêntico.
- Schema/migration, reminders, EAS/build cloud.

---

## 2. Estado atual auditado (v0.2.3-c4fix)

`src/app/calendar/index.tsx` cria o grid a partir de `monthlySeries` (DayPoint) e pinta cada cell com:

- `completed === scheduled` → ✓ + `calendarDoneFill` (usa **`completed` legado** = `completedOn`,
  que conta records de hábito arquivado e **ignora skip**);
- `completed > 0` → ◐ + `calendarSkipFill`;
- `completed === 0` → ○ + borda `calendarPendingBorder` **mesmo em dia só-skipado** (semântica errada).

**Bugs semânticos confirmados:**
1. Dia com todos os hábitos **completed ou skipped** (conquered c3) aparece como "partial" ◐ —
   `completed` não enxerga skip. **O "dia vencido" do HabitDetail não aparece no calendário global.**
2. Dia só-skipado recebe borda "pending" (parece falha) — viola §8 (skip neutro).
3. `completed` legado pode inflar com record de arquivado (já documentado em SPEC-c4 §2.1) — o
   calendário é o único consumidor restante dessa leitura.

`MonthView` (c3) resolve a mesma classificação com `monthDayStatus` → `isConqueredDay` e
`countConquered`. O calendário global **duplica a regra por outro caminho** (completed vs scheduled).

---

## 3. Semântica fechada (produto)

1. **`conquered` (vencido)** = hábitos agendados do dia: todos `completed` **ou** `skipped`
   (`isConqueredDay`, mesma regra do streak/`MonthView`). Destaque principal: fill + ✓.
2. **`partial` (parcial)** = ao menos um `completed`, mas não conquered.
3. **`skip` (flag)** = **≥1 skipped** e não conquered. Não é falha (cor da família skip/accent).
   Aparece em dia parcial **e** em dia sem nenhum completado.
4. **`pending`** = agendado sem record (hoje aberto ou passado não preenchido) — neutro, sem destaque
   de falha; miss continua neutro (c3). Dia sem agendado = neutro/vazio.
5. Invariantes por dia agendado: `done + skipped + undone === scheduled`; `mark === conquered ⇔
   isConqueredDay(...)`.
6. Tudo **derivado** de records (zero schema novo); hábito arquivado nunca conta.

---

## 4. Modelo derivado (domínio)

Aditivo em `src/domain/streak/overallStreak.ts` (junto de `isConqueredDay`/`monthDayStatus`):

```ts
export type CalendarDayMark = 'conquered' | 'partial' | 'skip' | 'pending';

export interface CalendarDayInfo {
  dateKey: string;
  mark: CalendarDayMark;
  scheduled: number;
  done: number;
  skipped: number;
}

export function calendarDayInfo(habits, records, dateKey): CalendarDayInfo;
```

- Reusa `activeHabits`/`scheduledOn`/`indexRecords` e **chama `isConqueredDay`** (fonte única da regra
  de conquered — nenhuma duplicação de domínio).
- `done`/`skipped` contados por record `completed`/`skipped` entre os **agendados ativos**.
- `scheduled === 0` → `{ mark: 'pending', scheduled: 0, done: 0, skipped: 0 }` (neutro).

## 5. Proposta visual (day-cell)

Cells de `width: 100/7%`, `aspectRatio: 1`, `Pressable`:

| mark | base | símbolo | token |
|---|---|---|---|
| `conquered` | fill `calendarDoneFill` | **✓** | `calendarDoneFg` |
| `partial` | fill `calendarSkipFill` | **◐** | `calendarSkipFg` |
| `skip` (só-skip) | transparente, num do dia | número + **skip bar** 2px `accent` | `accent` |
| `partial` c/ skip | fill parcial | ◐ + **skip bar** `accent` | `calendarSkipFg` |
| `pending` | transparente, num do dia | número | `textSecondary` |
| sem agendado | transparente | número | `textMuted` |

- **Skip bar** = pequeno marcador horizontal no rodapé do dia (2px, `accent`); "skip não é falha" visual.
- Hoje: ring `calendarTodayRing`. Pending: borda `calendarPendingBorder` **só quando mark = pending**
  (corrige bug de dia só-skipado com borda de pending).
- Detalhe ao tocar: mantém `dayStatus` (✓/—/✕/○ por hábito) — quais concluídas, quais skipadas.
- **Sem token novo** (E4): mesmas cores do `MonthView`/`WeekStatusRow` — coerência c3.

## 6. Acessibilidade (§37)

- `accessibilityLabel` por cell: `"{dateKey}: {label}"` — semântica textual:
  - conquered: `Vencido (done+skipped/scheduled)`; partial: `Parcial (done/scheduled)`;
    skip: `Com pulados (n pulado|s)`; pending: `Pendente`; vazio: `Sem hábitos`.
- Estados nunca só por cor: símbolo + label + detalhe ao tocar (+ skip bar posicional).

## 7. Gaps por arquivo

| Arquivo | Mudança | Task |
|---|---|---|
| `src/domain/streak/overallStreak.ts` | `CalendarDayMark` + `CalendarDayInfo` + `calendarDayInfo` (usa `isConqueredDay`) | E1 |
| `src/domain/streak/overallStreak.test.ts` | +7 casos (conquered/partial/skip/pending/vazio/arquivado/equivalência isConqueredDay) | E1 |
| `src/components/feature/CalendarDayCell.tsx` | **Novo** componente (mark → visual + a11y + skip bar) | E2 |
| `src/components/feature/CalendarDayCell.test.tsx` | **Novo** — 8 casos (visuais, skip bar, a11y, press) | E2 |
| `src/app/calendar/index.tsx` | `MonthGrid` consome `CalendarDayCell` + `dayInfos` via `calendarDayInfo` (substitui `monthlySeries`/`completed`) | E3 |

## 8. Critérios de aceite

- [ ] Dia conquered aparece destacado (✓ + fill) na aba Calendário global, igual ao MonthView.
- [ ] Dia com ≥1 skip e não conquered mostra **flag de skip** (bar `accent`) — inclusive em dia parcial.
- [ ] Dia só-skipado **não** ganha borda de pending (skip ≠ falha).
- [ ] Pending hoje neutro (sem falha).
- [ ] Detalhe por-task ao tocar funciona (quais concluídas, quais skipadas).
- [ ] Tokens compartilhados: zero token novo em `theme/`.
- [ ] Baseline **266 testes** sem regressão + novos verdes; `tsc`/lint/web limpos.
- [ ] Charts c4fix e `opens.ts` §15.1 intocados.

## 9. Registro de decisões (custódia)

| # | Decisão | Custódia |
|---|---|---|
| e1.1 | Conquered = `isConqueredDay` (completed **ou** skipped); `calendarDayInfo` delega à regra do streak | `overallStreak.ts` |
| e1.2 | Flag de skip sempre que `skipped > 0` e não conquered (inclui partial); skip bar `accent` | `CalendarDayCell.tsx` |
| e1.3 | Tokens compartilhados (semântica igual) — zero token novo | `theme/colors.ts` (inalterado) |
| e1.4 | Pending hoje neutro; miss também neutro (c3) | `CalendarDayCell.tsx` |
| e1.5 | Grid do calendário passa a derivar de `calendarDayInfo` (todos os meses), não mais de `completed`/`monthlySeries` | `calendar/index.tsx` |
| e1.6 | a11y textual por cell; não-só-cor via skip bar + símbolo + detalhe | `CalendarDayCell.tsx` |