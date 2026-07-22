---
name: convention-audit
description: Use when completing or reviewing React, CSS, or TypeScript changes that must prove agent-conventions compliance.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Convention Audit

현재 diff의 rule selection과 semantic verdict를 독립 재검증합니다.

## 로드 계약

- 먼저 local [AGENTS.md](./AGENTS.md)의 8개 audit gate rule을 전체 읽습니다.
- React, TypeScript, CSS companion은 실제 변경 surface에만 활성화합니다.
- 활성화와 rule selection은 현재 diff의 변경 semantic delta로만 판단합니다. 추가·삭제·이동·이름 변경·재선언된 surface는 포함하고, read-only 문맥과 owner 이동에 byte-equivalent로 따라온 내부 import·class contract는 별도 rule 근거에서 제외합니다.
- companion은 `SKILL.md`와 activated `RULES_INDEX.md`를 사용하며 companion full `AGENTS.md`는 기본 로드하지 않는다.

## 필수 Workflow

1. changed files, diff, owner boundary, runtime/visual evidence, 검증 결과로 audit packet의 auditor selection packet을 만듭니다. implementer receipt, selection, verdict는 포함하지 않고 sealed comparison artifact에 보관합니다.
2. 실제 변경 surface로 companion을 활성화합니다.
3. 각 activated `RULES_INDEX.md` 전체를 applicability 수준으로 scan합니다.
4. current index와 같은 routing digest의 auditor exact ordinal partition을 작성합니다. `Selected`, `N/A`, `Unknown`은 겹치지 않고 합집합이 `1..N` 전체여야 합니다. `completionGate` entry는 완료 receipt에서 `Selected`이며 N/A 불가입니다.
5. auditor `N/A` exclusion group을 검증합니다. N/A set과 exclusion group ordinal의 합집합이 정확히 같고 누락과 중복이 없어야 합니다. exclusion reason은 diff에 근거하며 비어 있으면 selection coverage `FAIL`입니다.
6. 모든 `reviewWith` target은 자동 선택 대상이 아니며 독립적으로 재평가합니다.
   - activated skill의 local/companion target은 `Selected`, `N/A`, `Unknown` 중 하나에 있어야 합니다.
   - inactive cross-skill target은 target ID와 non-empty inactive evidence를 companion activation decision에 기록합니다.
   - cross-skill condition 또는 target `appliesWhen`이 맞으면 companion을 활성화하고 index 전체 exact partition을 만듭니다.
7. auditor가 `Selected` 또는 `Unknown`으로 분류한 stable ID와 같은 이름의 contract만 읽습니다. `CRITICAL` contract는 full rule을 반드시 읽고, 나머지는 exact 판단에 필요할 때 `Expanded` 이유와 함께 확장합니다. Unknown을 Selected/N/A로 먼저 해소하고 N/A contract의 `requiresSelected`는 적용하지 않습니다. Selected로 확정한 contract의 `requiresSelected` target은 companion까지 활성화해 즉시 `Selected`로 두며 N/A 불가입니다. Selected contract의 필수 변경만 scope evidence에 합치고 예시·선택적 대안·아직 해소되지 않은 Unknown의 가상 변경은 제외합니다. 새 surface·companion·Selected가 생기면 activated index, `reviewWith` closure, 새 contract를 다시 읽어 고정점까지 반복 판정합니다. auditor는 구현자 receipt의 verdict와 selection을 입력으로 사용하지 않고 독립적으로 판단하며, 구현자 receipt를 보기 전에 독립 selection receipt를 완성합니다.
8. 고정점 auditor receipt를 완성한 뒤 sealed comparison artifact를 공개합니다.
9. 구현자와 auditor의 `Selected/N/A/Unknown` set을 모두 비교합니다. 같은 count라도 member나 분류가 하나라도 다르면 selection coverage `FAIL`입니다. 구현자와 auditor 각 receipt의 `N/A` exclusion group도 서로 독립적으로 검증합니다.
10. `completionGate` 또는 `requiresSelected` target의 누락·N/A와 빠진 applicable rule은 코드가 우연히 준수해도 selection coverage `FAIL`입니다. 근거가 지지하지 않는 `N/A`도 selection coverage `FAIL`입니다.
11. selected rule마다 evidence와 reasoning을 붙여 semantic verdict `PASS`, `FAIL`, `UNKNOWN`을 작성합니다. lint, typecheck, build, test, browser는 evidence일 뿐 semantic `PASS`를 대신하지 않는다.
12. scope drift, coverage `FAIL`, semantic `FAIL`/`UNKNOWN`이 있으면 packet부터 고정점 selection과 review를 다시 수행합니다. `FAIL = 0`, `UNKNOWN = 0`일 때만 완료합니다.

## Reviewer와 보고

- 가능하면 independent reviewer가 수행합니다. 없으면 main agent가 reviewer mode로 전환하고 한계를 보고합니다.
- 파일 읽기 telemetry가 없으면 document list를 `declared`로 표시하고 actual read/non-read를 observed로 주장하지 않습니다.
- 최종 보고에는 index digest와 rule/selected/N/A/unknown count, exclusion groups, `Expanded`와 이유, coverage/semantic verdict, reviewer mode, telemetry limitations, 검증을 포함합니다.
