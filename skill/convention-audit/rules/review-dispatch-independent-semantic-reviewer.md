---
title: Dispatch an Independent Semantic Reviewer When Available
impact: CRITICAL
impactDescription: 구현자가 자기 diff를 낙관적으로 판정해 high severity convention 위반을 놓치는 것을 줄임
tags: review, reviewer, subagent
---

## Dispatch an Independent Semantic Reviewer When Available

**Impact: CRITICAL (구현자가 자기 diff를 낙관적으로 판정해 high severity convention 위반을 놓치는 것을 줄임)**

subagent, 별도 리뷰 세션, reviewer tool을 사용할 수 있으면 구현자와 분리된 semantic reviewer를 실행합니다. reviewer에게는 구현 의도 요약, audit packet, diff, 적용 rule ids를 주고 "통과시켜 달라"가 아니라 "FAIL/UNKNOWN을 찾으라"고 요청합니다.

reviewer prompt에는 반드시 포함합니다:

- 적용할 skill: `convention-react`, `convention-css`, `convention-typescript`
- 변경 파일과 audit packet
- rule별 PASS/FAIL/UNKNOWN 판정 요구
- FAIL/UNKNOWN이 있으면 파일/라인/근거/수정 방향 요구
- lint/build/test 성공은 convention PASS 근거가 아니라는 조건

subagent를 쓸 수 없으면 main agent가 reviewer 역할로 context를 전환하고 같은 형식의 엄격한 review를 작성합니다. 이 경우 완료 보고에 "독립 reviewer 미사용"을 명시합니다.

**Incorrect (구현자가 자기 판단으로 통과):**

```md
제가 봤을 때 컨벤션에 맞습니다.
```

**Correct (reviewer에게 반례를 찾게 함):**

```md
Reviewer task:
이 diff가 react/css/typescript convention을 위반하는 지점을 찾아라.
각 rule은 PASS/FAIL/UNKNOWN 중 하나로 판정하고, UNKNOWN은 완료 차단 이슈로 보고하라.
```
