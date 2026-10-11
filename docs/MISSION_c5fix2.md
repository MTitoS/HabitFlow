# MISSION — HabitFlow c5fix2 · fix divergência de data no DateTimePicker

## MISSION
Bug reportado por Tito in-app (v0.3.1): selecionar dia 13 no calendário do picker grava dia 12 no input — TODAS as datas desviam −1.

## OBJECTIVE
1. DIAGNÓSTICO ROOT-CAUSE (systematic-debugging): suspeita primária = conversão Date → dateKey via `toISOString().slice(0,10)` ou `new Date(dateKey)` (UTC-based), deslocando em fusos negativos (UTC-3). Confirmar no código (todo-form, helpers de data) com o MCP/graph antes de editar. Não "chutar fix" por cima de sintoma.
2. FIX DE DOMÍNIO: conversão Date→dateKey SEMPRE local (y/m/d componentes locais, alinhado com dateUtils existentes), tanto no caminho picker→form quanto form→todo. NÃO criar helper paralelo — reusar/dateUtils de `src/domain/date`.
3. Regressão: teste unitário que simula Date de meia-noite UTC-3 (e tambémUTC+0) e garante dateKey do MESMO dia selecionado (idempotente nas duas direções).

## CURRENT RUG STATE: pós-ship fix ciclo c5 (micro-fix 2)
## PHASE: F-tarefas-navegacao

## CONSTRAINTS
- Zero mudança de modelo/repos/migration. Só camada de conversão local.
- Baseline 351 testes / 55 suites; alvo +2-4 (teste de regressão); NÃO regredir.
- v0.3.2 vc16→vc17 bump + APK arm64 assinado HabitFlow-arm64.apk.

## ACCEPTANCE CRITERIA
- `npx jest` ≥ 353 verdes; teste de regressão de fuso presente; commit `fix(c5): ...` + `chore(release)`.

## AUTONOMY LEVEL: autonomy=high; sem gates internos.

## EXPECTED RETURN FORMAT
STATUS/ROOT_CAUSE/FIX/ARTIFACTS/VERIFICATION/TESTS/RISKS/NEXT_ACTION — compacto, caveman style.
