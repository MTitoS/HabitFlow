# MISSION — HabitFlow c5fix1 · UI tweaks pós-ship (feedback Tito)

## MISSION
Dois ajustes visuais no módulo todo, reportados no uso real do v0.3.0.

## OBJECTIVE
1. **Botão de edição da tarefa (TodoRow):** a seta (chevron/pencil) que leva à edição está MUITO PEQUENA. Aumentar hit target + tamanho visual (recomendo min 44x44 dp tocável, ícone ~20-22dp). Manter tokens visuais (cor/space existentes).
2. **Campo de data no create/edit de todo:** hoje são boxes com dias; trocar por INPUT DE DATA que abre calendário (datetime-picker nativo), exibindo a data selecionada formatada (pt-BR). Opcional: campo limpa data (→ "Algum dia"). Replicar padrão já existente em outra feature, se houver picker no repo; senão instalar @react-native-community/datetimepicker.
   NOTA DE DEPENDÊNCIA (sessão Hermes verificou package.json): SEM picker instalado hoje. O repo tem `@expo/ui` ~57.0.21 — se ele expõe um date picker compatível RN0.86, PREFIRA-o (zero dep nova). Senão instale `@react-native-community/datetimepicker` (versão compatível RN0.86). Justifique no report qual escolheu. Mock do picker nos testes jest (sem native module no CI).

## CURRENT RUG STATE: 5 (pós-ship fix ciclo c5 — micro-fix)
## PHASE: F-tarefas-navegacao

## RELEVANT SPEC
- docs/SPEC-c5.md (contrato); docs/PLAN-c5.md (estrutura D1-D15).
- Arquivos afetados: src/features/todo/TodoRow.tsx, src/features/todo/todo-form.tsx, telas src/app/todos/*
  (confirmar nomes pelo codebase_memory MCP primeiro).

## CONSTRAINTS
- Zero mudança de modelo/dados/repos. Só UI.
- Zero token novo (usar danger/accent/papeis de tokens existentes).
- TDD: manter/atualizar testes de TodoRow e todo-form (estava 343/54 — NÃO regredir).
- Kill de processo órfão permitido (Stop-Process) se qualquer opencode antigo congelar.

## EXPECTED ARTIFACTS
- Código ajustado + testes verdes + bump versionCode 16 / versionName 3.0.1 (c5fix1) + APK arm64 assinado em HabitFlow-arm64.apk.

## ACCEPTANCE CRITERIA
- `npx jest` ≥ 343 verdes; APK produido e commitado; commit no padrão repo `fix(c5): ...` + `chore(release)`.

## AUTONOMY LEVEL
- autonomy=high. Sem gates internos.

## EXPECTED RETURN FORMAT
STATUS/RESULT/ARTIFACTS/VERIFICATION/CHANGES/DECISIONS/RISKS/BLOCKERS/RECOMMENDATION/NEXT_ACTION — compacto, caveman style.
