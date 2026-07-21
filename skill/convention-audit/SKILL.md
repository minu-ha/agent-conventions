---
name: convention-audit
description: Use when completing or reviewing React, CSS, or TypeScript changes that must prove agent-conventions compliance.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Convention Audit

구현자가 convention skill을 읽었다는 주장과 자동 검사 성공을 신뢰하지 않고, 현재 diff에 적용할 rule selection과 semantic verdict를 독립적으로 재검증하는 완료 gate입니다.

## 로드 계약

- 이 skill은 local progressive router가 아닙니다. 먼저 local [AGENTS.md](./AGENTS.md)의 8개 audit gate rule을 전체 읽습니다.
- React, TypeScript, CSS companion은 실제 변경 surface에 해당할 때만 조건부 활성화합니다.
- companion은 각 `SKILL.md`를 router로 사용하고 activated `RULES_INDEX.md`를 scan합니다. companion full `AGENTS.md`는 기본 로드하지 않는다.

## 필수 Workflow

아래 순서를 바꾸지 않습니다.

1. changed files, diff, owner boundary, runtime/visual evidence와 검증 결과로 audit packet의 auditor selection packet을 만듭니다. implementer receipt, selection, verdict는 포함하지 않고 sealed comparison artifact에 보관합니다.
2. 실제 변경 surface로 companion을 활성화합니다.
3. 각 activated `RULES_INDEX.md` 전체를 applicability 수준으로 scan합니다.
4. current index와 같은 routing digest에 묶인 auditor exact ordinal partition을 작성합니다. `Selected`, `N/A`, `Unknown`은 서로 겹치지 않고 합집합이 `1..N` 전체여야 합니다.
5. auditor `N/A` exclusion group을 검증합니다. N/A set과 exclusion group ordinal의 합집합이 정확히 같고 누락과 중복이 없어야 합니다. 각 exclusion reason은 변경 파일과 diff에 근거해야 하며 비어 있으면 selection coverage `FAIL`입니다.
6. 모든 `reviewWith` target은 자동 선택 대상이 아니며 독립적으로 재평가합니다.
   - activated skill의 local/companion target은 `Selected`, `N/A`, `Unknown` 중 하나에 있어야 합니다.
   - inactive cross-skill target은 target ID와 non-empty inactive evidence를 companion activation decision에 기록합니다.
   - cross-skill condition 또는 target `appliesWhen`이 맞으면 companion을 활성화하고 index 전체 exact partition을 만듭니다.
7. auditor가 `Selected` 또는 `Unknown`으로 분류한 stable ID와 같은 이름의 contract만 읽습니다. `CRITICAL` contract는 full rule을 반드시 읽고, 나머지도 exact 판단에 필요하면 `Expanded` 이유와 함께 확장합니다. Unknown은 증거로 Selected/N/A 중 하나로 해소합니다. Selected contract가 요구한 구체적 필수 변경과 Unknown을 Selected로 해소하며 확정한 실제로 필수인 변경만 scope evidence에 합칩니다. 예시·선택적 대안·아직 해소되지 않은 Unknown의 가상 변경은 제외합니다. 새 surface·companion·Selected/Unknown이 생기면 activated index, `reviewWith` closure, 새 contract를 다시 읽어 activation·partition·scope evidence의 고정점까지 반복 판정합니다. auditor는 구현자 receipt의 verdict와 selection을 입력으로 사용하지 않고 독립적으로 판단하며, 구현자 receipt를 보기 전에 독립 selection receipt를 완성합니다.
8. 고정점 auditor receipt를 완성한 뒤 sealed comparison artifact를 공개합니다.
9. 구현자와 auditor의 `Selected/N/A/Unknown` set을 모두 비교합니다. 같은 count라도 member나 분류가 하나라도 다르면 selection coverage `FAIL`입니다. 구현자와 auditor 각 receipt의 `N/A` exclusion group도 서로 독립적으로 검증합니다.
10. 빠진 applicable rule은 코드가 우연히 준수해도 selection coverage `FAIL`입니다. 근거가 지지하지 않는 `N/A`도 selection coverage `FAIL`입니다.
11. 확정된 selected rule마다 evidence와 reasoning을 붙여 semantic verdict `PASS`, `FAIL`, `UNKNOWN`을 작성합니다. lint, typecheck, build, test, browser 결과는 verification evidence일 뿐 semantic `PASS`를 대신하지 않는다.
12. scope drift, coverage `FAIL`, semantic `FAIL`/`UNKNOWN`이 있으면 packet부터 고정점 selection과 review를 다시 수행합니다. `FAIL = 0`, `UNKNOWN = 0`일 때만 완료합니다.

## Reviewer와 보고

- subagent/reviewer를 사용할 수 있으면 independent reviewer가 위 순서를 수행합니다. 없으면 main agent가 별도 reviewer mode로 전환하고 그 한계를 보고합니다.
- 파일 읽기 telemetry가 없으면 document list를 `declared`로만 표시하고 actual read/non-read를 observed로 주장하지 않습니다.
- 최종 보고에는 activated index별 digest와 rule count, selected/N/A/unknown count, exclusion groups, `Expanded` full rule과 이유, coverage/semantic verdict, reviewer mode, telemetry limitations, 실행한 검증을 포함합니다.
