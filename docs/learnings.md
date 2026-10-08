# LEARNINGS — HabitFlow · Aprendizados técnicos (State 5)

> Captura de conhecimento do projeto após ship (State 4) + APK debug (State 5).
> Insights gerais, sem código copiado. Fonte de contrato: `docs/SPEC.md` e `docs/SPEC_DRIVER.md`.

---

## 1. Adapter custom em vez de WatermelonDB

**Decisão:** Nozbe WatermelonDB não pareia com Expo SDK 57 / RN 0.86 / React 19 (adapter SQLite incompatível). Desviamos para um store próprio com contrato idêntico por interface:

- **Nativo/web:** AsyncStorage (JSON snapshot por grupo de entidade).
- **Teste:** store em memória.
- O schema, índices e migrations vivem em `src/data/schema.ts` como fonte única de modelo — o adapter troca sem tocar a interface de repositórios.

**Insights:**
- A separação **interface ↔ implementação** é o que salvou a troca: a decisão de persistência virou um ponto único (`src/data/adapters/*`), não um desvio espalhado.
- AsyncStorage grava o snapshot completo: OK para MVP, mas histórico longo adiciona custo de gravação e lê tudo na abertura. Risco mapeado (volume/perf ≥ 1 ano).
- Sem transações atômicas reais por tabela (grava array completo por key). Apendix-only foi garantido em nível de **repositório** (validações de data/overwrite), não de banco.
- Se um dia for a SQLite: adaptar `DataStore` interface, não o domínio.

## 2. Pesos do SDK 57 / RN 0.86 / React 19

- **Pacotes do Expo são travados por SDK** — usar `npx expo install` para pegar versão compatível, nunca `npm i <pkg>` solto.
- **Reanimated 4 exige `react-native-worklets`** como dependência explícita (SDK 57). Sem ele, build/JIT quebra em runtime.
- `@testing-library/react-native` v14 + jest-expo: `render`/`fireEvent` são async. Teardown de workers com warning (leak de timer em algum teste de componente) — não falha suite, vale `--detectOpenHandles` em manutenção futura.
- `experiments.reactCompiler: true` no app.json — compilador React habilita por SDK; em SDK novo confirme se a flag ainda existe antes de `expo prebuild`.
- Versão do Jest (29.x) fica presa ao preset do Expo — não atualizar isolado.

## 3. Notificações: validação em device ainda pendente (risco alto)

- `expo-notifications` valida apenas via mock/módulo web no teste. **Atingível real:** agendamento local, canal Android, permissão de alarme exato — nada disso foi visto rodando.
- **Não existe "cron em background" no MVP:** sem abrir o app no dia, o reminder do dia não dispara (`rescheduleForHabits` roda quando o app abre). Aceito para MVP, mas o Tito precisa validar em celular antes de qualquer release.
- Permissão pedida em contexto (1ª vez que configura reminder), não no onboarding — decisão que evita friction na primeira execução.
- No Android, channel + (possível) `SCHEDULE_EXACT_ALARM` são requisitos de build real a conferir em `app.json`/manifest.

## 4. Fuso horário: local, nunca UTC

- `toDateKey` e `dateAtTime` usam hora **local** consistentemente; não há mistura UTC/local (não usar `toISOString` para datar record).
- Risco real: viagem com mudança de fuso/DST — dia do record e horário de notificação podem divergir do "momento do usuário". Validação em device recomendada.
- Jest: fixar timezone nos testes de data (`TZ=UTC`) para evitar flakiness.

## 5. Acessibilidade: estado nunca só por cor

- Todas as transições de estado usam **símbolo + cor + label** (✓/—/✕/○ + texto + accessibilityLabel). Presença dela é verificada em teste (assert que componente não depende só de cor).
- `prefers-reduced-motion` desliga bounce/confete globalmente via motion system central — animações nunca chamam NA própria tela.
- Touch targets ≥ 44px e foco visível no desktop — parte da auditoria D63.

## 6. RUG flow: 66 tasks em 9 tiers

- Planejamento TDD atômico (RED → GREEN → REFACTOR) funcionou com 134 testes verdes, `tsc` e lint limpos ao fechar cada tier.
- Gate por tier = testes + typecheck + lint antes de avançar; Review oficial (State 4) re-executou `npm test`/`tsc`/`lint`/web export.
- Regras de negócio §41 têm função única + teste próprio (streak/skip/completion/notifications). OPEN decisions isoladas em arquivo único de custódia.
- Web export estático foi a resposta de UI do MVP; **APK debug nasce agora (State 5), só após pedido explícito** do Tito.
- JIT de conhecimento: docs (`SPEC` contrato / `PLAN` ordem / `PROGRESS` status / `REVIEW` signoff) são a memória do fluxo; `learnings.md` é de manutenção independente.

## 7. Ids e merge futuro

- ID único local via `Math.random().toString(36)` + timestamp — **não** RFC4122. Suficiente para MVP local; enfraquece o critério §3.5 de merge futuro sem colisão. Aceito hoje; trocar requer switch em `generateId` + testes de unicidade.

## 8. Build APK (host Windows, sem Android Studio)

- **JDK:** Temurin 21 em `C:\android-jdk21` (JAVA_HOME). O `java` do PATH é 1.8 (JRE) — **não usar**; Exo/AGP 8 exige 17+.
- **Android SDK:** em `%LOCALAPPDATA%\Android\Sdk` (platforms 35/36, build-tools 34/36) — referenciado via `local.properties`.
- **Gradle 9.3.1** via wrapper (baixado sob demanda no primeiro build).
- **Causa clássica de falha de link nativo neste host:** o perfil do Windows tem **espaço** (`C:\Users\MATEUS TITO\...`). O CMake da RN converte o caminho para short-name 8.3, e `clang++.exe` vira `CLANG_~1.EXE` — o clang detecta C (não C++) pelo nome e **não injeta `libc++_shared.so`**, gerando `undefined symbol: operator new / std::__ndk1::*` ao linkar `worklets`/`reanimated`/`screens`/`expo-modules-core`.
  **Fix:** copiar o NDK para um caminho sem espaço (`C:\ndk\27.1.12297006`) e apontar `ndk.dir=C:\ndk\27.1.12297006` no `android/local.properties` (o `sdk.dir` continua o padrão). Não adianta só junction `mklink /J` — o CMake resolve o REALPATH e volta o espaço.
- Depois disso: limpar `.cxx`/`build` dos módulos nativos (`node_modules/*/android/.cxx`, `android/app/.cxx`, `android/app/build`) antes de rebuildar, senão o reconfigure falha com `build.ninja: rebuilding... subcommand failed`.
- **APK arm64-only:** `reactNativeArchitectures=arm64-v8a` em `android/gradle.properties` (evita 4 ABIs → APK ~2× maior).
- **Fluxo:** `npx expo prebuild -p android` → `cd android && ./gradlew assembleDebug` → APK em `android/app/build/outputs/apk/debug/app-debug.apk`.
- Tamanho debug ~85 MB (libs nativas + dex de debug) — normal; release com R8/hermes pro + split por ABI encolhe bastante. Commitar **nunca** o `.apk` (`.gitignore` tem `*.apk`), `android/.gradle/`, `node_modules/**/build/`, `**/.cxx`, `local.properties`.

## 9. Vigia (watchdog)

- Existe um cron/processo vigia no host que monitora a evolução de estado do projeto. **Nunca mexer** — só observar. Rodar builds aqui não o afeta. Em execuções paralelas ele pode committar/prebuildar sozinho; reconciliar `git status` antes de atribuir diffs a si mesmo.

---

## Decisões relevantes (resumo)

| Tema | Decisão | Por quê |
|---|---|---|
| Persistência | Store custom (AsyncStorage/memory) no lugar de WDB | WDB incompatível com SDK 57 |
| `missed` | Derivado na leitura, nunca gravado | Preserva append-only (histórico imutável) |
| Skip credit | Semana-calendário (segunda), cap 3 | OPEN 15.1, trocável em arquivo único |
| Completion rate | `completed/scheduled`, skip neutro | OPEN 15.2 |
| Notificações | Permit in-context; agenda por hora local | Sem onboarding push |
| Reminder atrasado | `LATE_NOTIFICATION=false` (não agenda hoje) | OPEN 15.5 |
| Estado visual | Símbolo + cor + label sempre | a11y não-só-cor (§10/§37) |
| Web | Adapter interface; persistência real nativa | `expo-web` sem SQLite |
| Build Android | arm64-only + NDK sem espaço + JDK21 | Debug APK nativo rápido e reproduzível |
## Post-ship refinements (v0.1.4 - v0.1.8) — closed cycle 03-04/10/2026
- lucide-react-native v1.51 exports icons como forwardRef objects: invocar via createElement, nunca glyph({...}) direto. Mocks de teste devem replicar o shape real (forwardRef) ou mascaram bugs de boot (v0.1.3: 3 releases crashadas ate logcat no device real revelar).
- Debug de device sem log = guessing. adb wireless pairing resolveu: `adb pair IP:PORT CODE` + `connect IP:DEBUGPORT` (porta de pareamento != porta de debug). Cabo pode estar bloqueado por Auto Blocker; wireless e alternativa.
- Release sem R8 (v0.1.2) e com legado packaging (v0.1.1) nao resolveram o crash — causa era JS (TypeError Icon). Trilha de isolamento: build sem minify separou R8 de JS-init; logcat do device real fechou.
- useLegacyPackaging=true (gradle.properties) -> APK 42.5MB -> 25.7-36MB, arm64-only. Telegram limita 50MB por arquivo.
- Retheming (v0.1.8): paleta 7 cores terra/creme do designer aplicada a AMBOS os temas, com cross-review de AA (success verde oliva derivado for light; dark warm escada L*16-36). Designer entregou tokens via 2 sessoes com script WCAG (hf_pass4.py).
- Domain: habit so entra na agenda de datas >= createdAt (T7 anti-retroativo). Skip undo recupera credito (T6). Ambos TDD red-green.

## Ciclo 2 (c2) — refinamentos streak/rotina/stats (04-05/10/2026, v0.2.0-c2)
- Streak geral = "dia vencido": todos os hábitos agendados completed OU skipped (skip neutro nos 2 níveis — individual e geral). Missed zera; dia sem agendados é neutro (pula). Implementado em domain/streak/overallStreak.ts (isConqueredDay).
- daySummary é consumido por achievements/celebração: campos novos SEMPRE aditivos (legado intacto) — evita regressão em features que leem o mesmo objeto.
- Frases motivacionais: seleção determinística por dia (hash da dateKey, nunca Math.random) — mesma frase no mesmo dia em qualquer abertura; teste garante count + shape {text, author}.
- Filtros/ordenação persistidos em prefs (ordem + filtro de rotina); default pré-1ª-troca = inclusão + Ativos.
- MonthView (heatmap vencido/parcial/neutro + headline streak geral + resumo) reusa monthlySeries do aggregate — visão nova sem duplicar domain.
- ConsistencyCalendar removido com imports (visão redundante com a aba Calendário) — decisão de produto: não manter arquivo órfão "para o futuro".
- Fluxo c2 rodou 100% via Telegram (grilling rounds, gates, entrega) — desktop só como console de orquestração.

## Ciclo 3 (c3) — edição retroativa + streak hoje-pendente (08/10/2026, v0.2.1-c3)
- Streak "hoje pendente não zera" era bug de DOMÍNIO (scanCurrent breakava com run=0 pois o scan inicia em hoje) — o fix correto foi alinhar com o padrão continue do overallStreak.ts, NÃO criar displayStreak paralelo (uma fonte só de verdade).
- Edição retroativa = exceção com guard em 2 camadas (config ligada + janela dia-calendário {ontem,anteontem} + isScheduled + createdAt<=dateKey); setCompletedToday segue intacto; completedAt registra o momento REAL da edição (histórico append-only preservado — a edição é um fato novo).
- Hábito quantitativo retro grava value=targetValue (meta do dia batida) — sem dialog de input, decisão de produto simples.
- UI: descoberta no calendário do HabitDetail (célula tocável) > long-press no HabitRow (risco de toque acidental na tela de maior tráfego); Home permanece intocada = exceção fica longe do caminho principal.
- Ciclo c3: 9 tasks, 243 testes, release v0.2.1-c3 validada IN-APP pelo usuário retroativo+streak OK.
