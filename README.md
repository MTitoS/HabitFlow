# HabitFlow

Habit Tracker + Routine — React Native (Expo). MVP local-first (sem login/cloud).

**Fonte de verdade do produto:** [`docs/SPEC_DRIVER.md`](docs/SPEC_DRIVER.md)
**Contrato técnico:** [`docs/SPEC.md`](docs/SPEC.md) · **Plano TDD:** [`docs/PLAN.md`](docs/PLAN.md) · **Status por task:** [`docs/PROGRESS.md`](docs/PROGRESS.md)

## Stack

- Expo SDK 57 (React Native 0.86, Expo Router), TypeScript strict
- Persistência local: repositórios por interface sobre AsyncStorage (nativo/web) e in-memory (testes)
- `expo-notifications` (lembretes), `expo-haptics` (microinterações), `lucide-react-native` (ícones)
- Domínio 100% puro em `src/domain/` com testes unitários

## Como rodar

```bash
npm install          # instala dependências
npm start            # dev server (Android/iOS via Expo Go ou dev build)
npm run web          # versão web responsiva
npm test             # suíte de testes (jest)
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npx expo export --platform web   # build estático web
```

## Estrutura

```
src/
├── app/          # Expo Router (rotas/telas)
├── components/   # ui primitivas + feature components
├── domain/       # regras de negócio puras (streak, skip, stats, …)
├── data/         # repositórios por interface + store adapters
├── services/     # fonts, haptics, motion, notifications, prefs
├── theme/        # tokens semânticos light/dark
└── utils/
```

## Decisões OPEN

Default de cada ponto isolado em `src/config/opens.ts` e nos arquivos de custódia do PLAN (ex.: `domain/stats/completionRate.ts`, `services/notifications/policy.ts`). Trocar = editar apenas o arquivo indicado.