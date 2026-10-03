# Product & UI Specification — Habit Tracker + Routine

## 0. Instrução principal para a IA de código

Você está construindo um aplicativo de **Habit Tracker + Rotina**, com foco em ajudar o usuário a criar e manter hábitos pessoais, visualizar seu progresso e transformar consistência em uma experiência recompensadora.

Use este documento como **fonte de verdade do produto**. Não invente comportamentos, telas ou regras que contradigam estas especificações.

Quando uma decisão estiver explicitamente definida neste documento, implemente-a dessa forma.

Quando algo estiver marcado como **OPEN / A DEFINIR**, preserve a arquitetura para permitir a decisão posteriormente, mas não invente uma regra de negócio definitiva sem necessidade.

A interface deve ser responsiva, com prioridade para mobile, mas preparada para desktop/web.

A imagem de referência fornecida junto ao projeto deve ser usada como **referência estética**, não como layout para copiar literalmente.

---

# 1. Visão do produto

## 1.1 Conceito

O produto é um:

> **Habit Tracker + Rotina**, focado em consistência, progresso visual e recompensa.

A experiência deve permitir que o usuário:

1. veja o que precisa fazer hoje;
2. complete seus hábitos;
3. acompanhe o progresso do dia;
4. visualize sua consistência ao longo do tempo;
5. mantenha uma rotina organizada por grupos e horários;
6. receba feedback visual e conquistas por consistência.

## 1.2 Público-alvo

Pessoas que querem:

- criar hábitos pessoais;
- manter hábitos ao longo do tempo;
- organizar hábitos dentro de uma rotina;
- visualizar sua evolução;
- transformar consistência em uma experiência recompensadora.

O produto não é inicialmente voltado para:

- equipes;
- produtividade corporativa;
- competição social;
- recursos sociais.

---

# 2. Core loop

O loop central do aplicativo é:

```text
Abrir app
    ↓
Ver dashboard/progresso de hoje
    ↓
Ver hábitos da rotina do dia
    ↓
Completar hábitos
    ↓
Receber feedback/recompensa
    ↓
Ver progresso atualizado
    ↓
Voltar no dia seguinte
```

Toda decisão de UX deve favorecer esse loop.

A ação mais importante do aplicativo é **registrar um hábito como concluído com o mínimo possível de fricção**.

---

# 3. Escopo do MVP

## 3.1 Incluído

O MVP deve incluir:

### Hábitos

- criar hábito;
- editar hábito;
- excluir hábito;
- arquivar hábito;
- hábitos binários;
- hábitos quantitativos;
- metas;
- unidades;
- frequências variadas;
- histórico;
- streak;
- skip;
- calendário.

### Rotina

- agrupamento de hábitos;
- sequência temporal;
- horários;
- organização por rotina;
- visão dos hábitos programados para hoje.

### Progresso

- dashboard diário;
- progresso diário;
- completion rate;
- streak atual;
- melhor streak;
- estatísticas semanais/mensais;
- calendário de consistência;
- estatísticas por hábito;
- milestones;
- achievements/conquistas.

### Personalização

- tema claro;
- tema escuro;
- preferência de tema do sistema;
- cores de hábito;
- ícones;
- configurações de interface.

### Lembretes

- reminders;
- configuração de horário;
- suporte à configuração de múltiplos horários quando aplicável.

### UX

- onboarding minimalista;
- empty states;
- loading states;
- error states;
- microinterações;
- feedback visual de conclusão.

## 3.2 Fora do MVP

Não implementar neste momento:

- login;
- contas de usuário;
- cloud sync;
- sincronização entre dispositivos;
- widgets;
- recursos sociais;
- competição entre usuários.

A arquitetura pode ser preparada para futuras extensões, mas essas funcionalidades não devem aparecer no MVP.

---

# 4. Modelo de hábito

Um hábito deve suportar pelo menos dois grandes tipos:

## 4.1 Hábito binário

Exemplo:

> Meditar

Estados:

```text
○ Não concluído
✓ Concluído
— Skip
✕ Perdido
```

## 4.2 Hábito quantitativo

Exemplos:

```text
Beber água
Meta: 3 L

Ler
Meta: 30 min

Ler páginas
Meta: 20 páginas

Flexões
Meta: 50 repetições
```

O modelo deve ser baseado em:

```text
targetValue
unit
```

e permitir unidades pré-definidas e uma unidade customizada.

### Unidades pré-definidas sugeridas

- vezes;
- minutos;
- horas;
- páginas;
- litros;
- ml;
- passos;
- km;
- repetições;
- sessões.

### Unidade customizada

O usuário deve poder informar uma unidade própria.

Exemplos:

```text
10 copos
5 capítulos
3 sessões
2 tarefas
```

A interface deve deixar claro que a unidade customizada é livre.

---

# 5. Frequência

O sistema deve suportar frequências variadas.

## 5.1 Diária

```text
Every day
```

## 5.2 Dias específicos

Exemplo:

```text
Segunda
Terça
Quinta
Sexta
```

## 5.3 X vezes por semana

Exemplo:

```text
3x por semana
```

## 5.4 X vezes por mês

Exemplo:

```text
10x por mês
```

A arquitetura deve permitir adicionar outros tipos de frequência no futuro sem quebrar os dados existentes.

---

# 6. Rotina

A rotina combina:

1. **agrupamento**
2. **sequência temporal**

## 6.1 Agrupamento

Exemplos:

```text
Morning Routine

☀️ Beber água
🧘 Meditar
📖 Ler
```

```text
Workout

🏋️ Academia
🏃 Corrida
```

```text
Health

🥗 Refeição saudável
💧 Beber água
```

## 6.2 Sequência temporal

Um hábito pode ter horário dentro de uma rotina.

Exemplo:

```text
Morning Routine

07:00  💧 Beber água
07:15  🧘 Meditar
07:30  📖 Ler
```

A rotina deve permitir visualizar:

- grupo;
- hábito;
- horário;
- status;
- progresso.

A visão de hoje deve priorizar os hábitos programados para aquele dia.

---

# 7. Streak

## Regra principal

Se um hábito programado não for realizado no dia, ele é considerado **Missed** e a streak é zerada.

Exemplo:

```text
Segunda  ✓
Terça    ✓
Quarta   ✓
Quinta   ✕
Sexta    ✓
```

Resultado:

```text
Current streak = 1
Best streak = 3
```

O histórico nunca deve ser apagado ou reescrito por causa da streak.

## Importante

A streak deve ser calculada respeitando a frequência do hábito.

Não assumir que todo hábito é diário.

---

# 8. Sistema de Skip

O produto possui um mecanismo específico de tolerância:

## 8.1 Créditos

O usuário recebe:

> **1 skip por semana**

Os skips podem ser acumulados.

Limite máximo:

> **3 skips**

Exemplo:

```text
Semana 1 → +1
Semana 2 → +1
Semana 3 → +1

Saldo máximo = 3
```

## 8.2 Uso

Quando o usuário usa um skip:

```text
3 → 2
```

## 8.3 Comportamento

Um dia marcado como Skip:

- aparece no calendário;
- não conta como Completed;
- não conta como Missed;
- não aumenta a streak;
- não deve ser tratado como falha;
- preserva o histórico;
- consome um crédito de skip.

Estados visuais devem diferenciar claramente:

```text
✓ Completed
— Skipped
✕ Missed
○ Pending
```

## 8.4 Limite

O saldo nunca pode ultrapassar 3.

## 8.5 OPEN / A DEFINIR

A regra exata de quando o crédito semanal é concedido deve ser implementada de maneira isolada e facilmente alterável caso seja necessário definir posteriormente se a concessão acontece:

- por semana-calendário;
- por período móvel de 7 dias;
- ou por outro mecanismo.

Não inventar uma regra diferente das especificações acima.

---

# 9. Histórico

O histórico representa o que realmente aconteceu.

Alterações futuras não devem modificar retrospectivamente o histórico.

Exemplo:

```text
Janeiro:
Gym → 3x por semana
```

Depois:

```text
Gym → 5x por semana
```

O histórico de janeiro continua representando a configuração/comportamento daquela época.

Use registros de completion/skip/missed associados à data para manter a integridade histórica.

---

# 10. Completion rate

O sistema deve diferenciar:

```text
Completed
Skipped
Missed
Pending
```

A taxa de conclusão deve ser calculada de forma consistente com a frequência programada.

**OPEN / A DEFINIR:** a fórmula exata de completion rate em relação aos skips deve ser centralizada em uma função/regra única para que possa ser ajustada posteriormente.

Não tratar Skip automaticamente como Completed.

---

# 11. Recompensas

A direção escolhida é:

> **A + C: recompensa visual + conquistas.**

## 11.1 Recompensa visual

Utilizar:

- microinterações;
- animações sutis;
- streaks;
- progress bars;
- progress rings;
- milestones;
- celebrações quando apropriado.

Exemplos:

```text
🔥 7 day streak
✨ 100 completions
🎉 All habits completed
```

## 11.2 Achievements

O sistema pode ter conquistas como:

```text
🏆 7-day streak
🏆 30-day streak
🏆 100 completions
🏆 365 completions
```

As conquistas devem ser positivas e recompensadoras.

Não usar linguagem punitiva.

## 11.3 Não usar XP/moedas no MVP

Não implementar sistema de:

- moedas;
- loja;
- XP;
- níveis;

a menos que posteriormente seja explicitamente decidido.

---

# 12. Dashboard/Home

A prioridade da Home é:

> **1º Dashboard/progresso**
>
> **2º Lista de hábitos do dia**

Não começar a tela diretamente com uma lista gigante de hábitos.

## Estrutura conceitual

```text
Good morning 👋

[ Today's progress ]

6 / 8 completed
75%

██████████████░░░░

Today's habits

Morning routine
────────────────────
✓ Drink water
✓ Meditation
○ Reading

Workout
────────────────────
○ Gym

+ Add habit
```

O dashboard deve permitir compreender o estado do dia rapidamente.

---

# 13. Navegação

Estrutura inicial proposta:

```text
Home
Habits
Statistics
Calendar
Settings
```

O sistema deve manter navegação simples.

A criação de hábito deve ser extremamente acessível por um botão `+`.

**OPEN / A DEFINIR:** posição final do botão `+` — bottom navigation central, floating action button ou ação dentro da Home.

---

# 14. Tela de hábitos

Deve permitir:

- visualizar todos os hábitos;
- pesquisar/filtrar se necessário;
- separar ativos e arquivados;
- editar;
- arquivar;
- excluir;
- visualizar frequência;
- visualizar streak;
- visualizar progresso.

Componente principal:

```text
HabitCard
```

Exemplo:

```text
┌──────────────────────────────┐
│ 🏋️  Gym                     │
│ 4x/week                       │
│ 🔥 7 day streak              │
│ ███████████░░ 82%            │
└──────────────────────────────┘
```

---

# 15. Criar hábito

O fluxo deve ser simples.

Informações básicas:

```text
Create habit

Name
[________________]

Icon
○ 🏋️ ○ 📚 ○ 💧 ○ 🧘

Color
● ● ● ● ●

Type
○ Binary
○ Quantitative

Frequency
[ Every day ]

Schedule / Days

Reminder
[ 08:00 ]

Create habit
```

Para quantitativo:

```text
Target
[ 3 ]

Unit
[ Liters ▼ ]

Custom unit
[____________]
```

Não criar um formulário gigantesco na primeira etapa.

Usar progressive disclosure.

---

# 16. Habit Detail

A tela de detalhe deve mostrar:

```text
← Gym

🏋️

Go to the gym

Current streak
🔥 7 days

Best streak
🏆 21 days

This month
████████████░░░
80%

Calendar

M  T  W  T  F  S  S
✓  ✓  ✕  ✓  ✓  —  —

Statistics

Completion
82%

Total completions
87

Longest streak
21 days
```

Para hábitos quantitativos, mostrar também:

- progresso da meta;
- média;
- total;
- evolução ao longo do tempo.

---

# 17. Calendário

O calendário deve mostrar visualmente a consistência.

Estados:

```text
○ Pending / sem registro
✓ Completed
— Skipped
✕ Missed
```

Pode usar intensidade/indicadores visuais para mostrar progresso.

Exemplo conceitual:

```text
October 2026

Mon Tue Wed Thu Fri Sat Sun

         1   2   3   4
        ●   ●   —   ○

5   6   7   8   9  10  11
●   ●   ●   ✕   ●   ●   ○
```

O calendário deve ser útil para responder:

> "Como foi minha consistência?"

---

# 18. Statistics

A área de estatísticas deve ser visual, mas não excessivamente complexa.

Métricas principais:

- current streak;
- best streak;
- completion rate;
- total completions;
- consistência semanal;
- consistência mensal;
- progresso por hábito;
- calendário de consistência;
- milestones.

Exemplo:

```text
Statistics

This week

Overall completion
78%

      █
  █   █
  █   █     █
  █   █  █  █
────────────────
  M   T  W  T  F  S  S
```

**OPEN / A DEFINIR:** conjunto final de gráficos e métricas da tela de Statistics. Manter componentes modulares.

---

# 19. Reminders

Reminders fazem parte do MVP.

Deve existir uma configuração padrão e opções adicionais.

O sistema deve suportar pelo menos:

```text
No reminder

08:00
```

e permitir configurações mais avançadas, incluindo múltiplos horários quando fizer sentido.

A UI deve seguir progressive disclosure.

**OPEN / A DEFINIR:** comportamento exato de notificações quando múltiplos reminders e diferentes frequências se combinarem.

---

# 20. Onboarding

A escolha é:

> **Minimalista.**

Não fazer um onboarding longo ou tutorial de várias telas.

Direção:

```text
Welcome 👋

Build better habits,
one day at a time.

[ Get started ]
```

Depois levar rapidamente à criação do primeiro hábito.

O usuário deve conseguir entrar no app sem preencher perfil ou criar conta.

---

# 21. Empty states

Precisam ser projetados desde o início.

## Sem hábitos

```text
Your routine starts here.

Build better habits,
one day at a time.

[ + Add habit ]
```

## Todos concluídos

```text
You're all done! 🎉

All habits completed today.
```

## Sem dados estatísticos

```text
Complete a few habits
to unlock your insights.
```

## Nenhum hábito programado hoje

```text
Nothing scheduled for today.
```

---

# 22. Direção visual

## Conceito

A direção escolhida é:

> **Premium Playful**

A referência visual possui:

- UI limpa;
- cards arredondados;
- tipografia forte;
- elementos orgânicos;
- cores pastel/quentes;
- ilustrações;
- composição amigável.

O aplicativo deve usar essa linguagem visual sem copiar a interface da referência.

Princípio:

```text
80% clean UI
20% personality
```

O app deve parecer:

- moderno;
- amigável;
- premium;
- levemente divertido;
- visualmente marcante;
- não infantil;
- não corporativo.

---

# 23. Tipografia

Direção inicial:

### Display / headings

Preferência:

```text
Plus Jakarta Sans
```

com pesos Bold/ExtraBold.

### Interface / body

Preferência:

```text
Inter
```

Se a stack escolhida recomendar uma alternativa equivalente, manter o mesmo caráter visual.

Escala inicial:

```text
Display XL     36 / 42     ExtraBold
Display        30 / 36     ExtraBold
H1             26 / 32     Bold
H2             22 / 28     Bold
H3             18 / 24     Bold

Body           16 / 24     Regular
Body Small     14 / 20     Regular
Caption        12 / 16     Medium
```

---

# 24. Light Theme

Paleta inicial:

```text
Background        #FFF8F3
Surface           #FFFFFF
Primary           #FF7A45
Secondary         #B9A7FF
Accent            #FFD166
Success           #45B889

Text Primary      #171717
Text Secondary    #6F6A67
Text Muted        #A39B96
Border            #EEE5DF
```

Não tratar esses valores como cores espalhadas pelo código. Criar tokens semânticos.

---

# 25. Dark Theme

Paleta inicial:

```text
Background        #111111
Surface           #1A1A1A
Surface Elevated  #242424

Primary           #FF8150
Secondary         #A997FF
Accent            #FFD166
Success           #55C995

Text Primary      #F7F3EF
Text Secondary    #AAA39E
Text Muted        #706A66
Border            #302D2B
```

O Dark Theme não deve ser uma simples inversão do Light Theme.

Usar contraste entre superfícies em vez de sombras excessivas.

---

# 26. Spacing

Tokens iniciais:

```text
4
8
12
16
20
24
32
40
48
64
```

Usar consistentemente.

---

# 27. Border radius

```text
sm       8px
md       12px
lg       16px
xl       20px
2xl      28px
pill     999px
```

Cards principais devem usar radius grande.

Sugestão:

```text
Card       20px
Modal      28px
Button     999px
Input      14px
```

---

# 28. Shadows

Light theme:

- sombras suaves;
- baixa intensidade;
- nunca usar sombras pesadas.

Dark theme:

- priorizar contraste de superfícies;
- minimizar sombras.

---

# 29. Componentes

Criar uma biblioteca de componentes reutilizáveis.

## Primitives

```text
Button
IconButton
Text
Heading
Badge
Divider
Avatar
Icon
ProgressBar
ProgressRing
```

## Forms

```text
Input
Textarea
Select
Checkbox
Switch
Radio
TimePicker
DatePicker
ColorPicker
```

## Layout

```text
Card
Section
Stack
Grid
Modal
BottomSheet
Drawer
Tabs
```

## Habit

```text
HabitCard
HabitRow
HabitCheckbox
HabitIcon
HabitStreak
HabitProgress
HabitCalendar
HabitStatistics
```

## Dashboard

```text
TodayProgress
DailySummary
WeeklyChart
ConsistencyCard
StreakCard
CompletionChart
```

---

# 30. Estados dos componentes

Todos os componentes interativos devem considerar estados apropriados.

## Button

```text
Default
Hover
Pressed
Disabled
Loading
```

## Habit checkbox

```text
Unchecked
Pressed
Completed
Skipped
Missed
Disabled
```

## Card

```text
Default
Interactive
Selected
Disabled
```

---

# 31. Ícones

Preferência:

> **Lucide Icons**

Os ícones devem ser consistentes e minimalistas.

O usuário também pode escolher emoji como representação do hábito.

---

# 32. Ilustrações

Usar ilustrações em pontos estratégicos, não em todas as telas.

Principalmente:

- onboarding;
- empty states;
- conclusão de todos os hábitos;
- milestones/conquistas.

A estética deve seguir a referência: formas simples, amigáveis e expressivas.

---

# 33. Microinterações

Completar um hábito deve ser satisfatório.

Exemplo:

```text
○
 ↓
✓
```

Com:

- pequeno bounce;
- mudança de estado;
- atualização do progresso;
- atualização da streak;
- feedback visual sutil.

Ao completar todos os hábitos:

```text
100%
 ↓
🎉
```

Animações devem ser rápidas e discretas.

Evitar excesso de motion.

---

# 34. Modelo de dados inicial

Estruturar entidades aproximadamente assim:

```typescript
Habit {
  id
  name
  description?
  icon
  color

  type
  targetValue?
  unit?

  frequency
  schedule

  routineId?
  scheduledTime?

  reminder?

  createdAt
  updatedAt
  archivedAt?
}
```

Registro histórico:

```typescript
HabitRecord {
  id
  habitId
  date

  status
  value?

  completedAt?
}
```

Status:

```text
pending
completed
skipped
missed
```

Rotina:

```typescript
Routine {
  id
  name
  description?
  icon?
  color?
  order
}
```

A estrutura pode ser adaptada à stack escolhida, mas os conceitos devem ser preservados.

---

# 35. Estatísticas derivadas

Sempre que possível, derivar métricas a partir do histórico em vez de duplicar dados.

Exemplos:

```text
currentStreak
bestStreak
completionRate
totalCompletions
weeklyCompletion
monthlyCompletion
```

Isso reduz inconsistência.

---

# 36. Responsividade

## Mobile

Mobile-first.

Priorizar:

- uma mão;
- ações rápidas;
- bottom navigation;
- cards empilhados;
- touch targets confortáveis;
- leitura rápida.

## Desktop

Não simplesmente esticar a UI mobile.

Usar:

- sidebar;
- conteúdo centralizado;
- grids;
- dashboard com múltiplas colunas;
- mais espaço para gráficos.

Estrutura conceitual:

```text
┌──────────────┬──────────────────────────────┐
│              │                              │
│ Navigation   │         Main content         │
│              │                              │
│ Home         │                              │
│ Habits       │                              │
│ Statistics   │                              │
│ Calendar     │                              │
│ Settings     │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

---

# 37. Acessibilidade

Implementar desde o início:

- contraste adequado;
- touch targets apropriados;
- labels acessíveis;
- navegação por teclado no desktop;
- estados não dependentes somente de cor;
- suporte a reduced motion;
- semântica adequada;
- foco visível.

Completed, skipped e missed não podem ser diferenciados exclusivamente pela cor.

---

# 38. Arquitetura de navegação

Estrutura inicial:

```text
Home
├── Today
├── Dashboard
└── Add Habit

Habits
├── All habits
├── Active
├── Archived
├── Create
├── Edit
└── Habit detail

Statistics
├── Overview
└── Habit statistics

Calendar

Settings
├── Appearance
├── Notifications
├── Habit defaults
├── Data
└── About
```

Essa arquitetura pode ser refinada durante o wireframing, mas não deve criar complexidade desnecessária.

---

# 39. Princípios de UX

1. **Today first** — o usuário deve entender o dia rapidamente.
2. **Low friction** — completar um hábito deve ser extremamente rápido.
3. **Progress over punishment** — mostrar progresso e consistência.
4. **History is immutable** — o passado representa o que aconteceu.
5. **Skip is not failure** — Skip possui estado próprio.
6. **Progressive disclosure** — configurações avançadas aparecem quando necessárias.
7. **Visual reward** — ações concluídas devem gerar feedback.
8. **Clean first, personality second** — personalidade sem sacrificar legibilidade.
9. **No unnecessary complexity** — não transformar o app em um dashboard corporativo.
10. **Mobile first** — a experiência principal deve funcionar perfeitamente no celular.

---

# 40. Telas esperadas

A implementação deve prever pelo menos:

```text
01. Splash / initial loading
02. Minimal onboarding
03. Home / Today
04. Habits
05. Create Habit
06. Edit Habit
07. Habit Detail
08. Calendar
09. Statistics
10. Settings
11. Appearance
12. Notifications
13. Empty states
14. Error states
15. Achievement / milestone feedback
```

As telas podem ser combinadas quando isso melhorar a UX.

Não criar telas apenas para preencher uma lista.

---

# 41. Regras que não devem ser quebradas

### Streak

Se o hábito deveria ser feito e não foi feito:

```text
Missed
→ streak reset
```

### Skip

```text
Skip
→ não aumenta streak
→ não é Missed
→ aparece no histórico
→ aparece no calendário
→ consome 1 crédito
```

### Skip balance

```text
1 skip/semana
máximo 3 acumulados
```

### Histórico

Não alterar o passado quando configurações futuras forem modificadas.

### MVP

Não implementar:

```text
login
cloud sync
widgets
social
```

### Visual

Não copiar literalmente a imagem de referência.

Usar sua linguagem visual como inspiração.

---

# 42. Decisões ainda abertas

Estas questões devem permanecer isoladas e fáceis de alterar:

## 42.1 Regra exata de concessão do skip semanal

Definir posteriormente se é:

- semana-calendário;
- período móvel de 7 dias;
- outro modelo.

## 42.2 Fórmula exata de completion rate com Skip

A regra deve ficar centralizada.

## 42.3 Posição final do botão +

Escolher durante o wireframe:

- FAB;
- centro da bottom navigation;
- ação no header;
- outra solução.

## 42.4 Gráficos finais

Definir durante a etapa de UI/UX.

## 42.5 Regras avançadas de reminders

Principalmente:

- múltiplos reminders;
- recorrência;
- combinação com frequência;
- comportamento em hábitos atrasados.

Não espalhar essas regras pelo código.

---

# 43. Direção final resumida

O produto deve parecer:

> Um habit tracker moderno, premium e amigável, com estética playful, dashboard visual, rotina organizada por grupos e horários, estatísticas claras, streaks, skips e conquistas.

A experiência principal:

```text
Dashboard
    ↓
Progresso de hoje
    ↓
Hábitos da rotina
    ↓
Check rápido
    ↓
Feedback visual
    ↓
Progresso atualizado
```

A sensação desejada é:

> **"Eu consigo ver claramente que estou evoluindo e quero voltar amanhã."**

Não:

> "Estou sendo cobrado por uma lista de tarefas."

---

# 44. Ordem recomendada de implementação

Implementar nesta ordem:

## Fase 1 — Foundation

- design tokens;
- themes;
- typography;
- spacing;
- base components;
- responsive layout.

## Fase 2 — Habit engine

- Habit model;
- frequencies;
- binary habits;
- quantitative habits;
- records;
- streak;
- skip;
- history.

## Fase 3 — Core UX

- Home;
- Today;
- Habit list;
- Create habit;
- Edit habit;
- Habit detail.

## Fase 4 — Routine

- routines;
- grouping;
- temporal ordering;
- scheduled times.

## Fase 5 — Progress

- dashboard;
- statistics;
- calendar;
- streak visualization;
- completion rate.

## Fase 6 — Rewards

- milestones;
- achievements;
- microinteractions;
- celebration states.

## Fase 7 — Reminders

- reminder configuration;
- notification handling.

## Fase 8 — Settings

- appearance;
- notifications;
- defaults;
- data;
- about.

## Fase 9 — Polish

- animations;
- empty states;
- error states;
- accessibility;
- responsive refinement;
- visual consistency.

---

# 45. Critério de qualidade

Antes de considerar o produto pronto, verificar:

### Produto

- O usuário entende o que fazer hoje em poucos segundos?
- Completar um hábito é rápido?
- É possível entender a diferença entre Completed, Skipped e Missed?
- O histórico permanece consistente?
- Streaks são calculadas corretamente?
- Hábitos quantitativos funcionam corretamente?
- Frequências variadas funcionam?

### UX

- Criar hábito é simples?
- Configurações avançadas não poluem a experiência?
- O dashboard mostra progresso antes da lista?
- A rotina temporal é compreensível?
- O usuário consegue descobrir suas estatísticas?

### UI

- Light e Dark parecem parte do mesmo produto?
- O visual mantém a linguagem Premium Playful?
- A interface não ficou infantil?
- Os cards não estão excessivamente aninhados?
- A hierarquia tipográfica está clara?
- As cores não são usadas como única indicação de estado?

### Técnica

- Tokens centralizados?
- Componentes reutilizáveis?
- Regras de negócio centralizadas?
- Histórico imutável?
- Arquitetura preparada para futura sincronização?
- Sem dependência de login/cloud no MVP?

---

# 46. Resumo executivo para contexto da IA

```text
PRODUCT:
Habit Tracker + Routine

CORE VALUE:
Help users build and maintain personal habits while making
progress visible and rewarding.

CORE LOOP:
Open → see today's progress → complete habits → receive feedback
→ see updated progress → return tomorrow.

PRIMARY HOME PRIORITY:
1. Dashboard / progress
2. Today's habit list

ROUTINE:
Groups + chronological scheduling.

HABITS:
Binary + quantitative.

QUANTITATIVE:
Target value + predefined or custom unit.

FREQUENCIES:
Daily, selected weekdays, X/week, X/month.

STREAK:
Missed scheduled day resets streak.

SKIP:
1/week, maximum 3 accumulated.
Skip appears in history/calendar.
Skip does not increase streak and is not a failure.

HISTORY:
Immutable representation of what happened.

REWARDS:
Visual feedback + achievements.
No XP/coins system for now.

ONBOARDING:
Minimal.

VISUAL:
Premium Playful.
Approximately 80% clean UI / 20% personality.
Warm light theme + expressive dark theme.
Rounded cards, strong typography, organic shapes,
subtle illustrations and microinteractions.

MVP EXCLUDES:
Login, cloud sync, widgets, social.

MOBILE:
Primary platform.

DESKTOP:
Responsive adaptation with sidebar/dashboard layout.
```
