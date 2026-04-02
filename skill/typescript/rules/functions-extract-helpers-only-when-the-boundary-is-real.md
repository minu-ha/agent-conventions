---
title: Extract Helpers Only When the Boundary Is Real
impact: HIGH
impactDescription: stops helper extraction from fragmenting local flow when no reusable contract or testable boundary actually exists
tags: helpers, extraction, boundaries
---

## Extract Helpers Only When the Boundary Is Real

**Impact: HIGH (stops helper extraction from fragmenting local flow when no reusable contract or testable boundary actually exists)**

유틸이나 helper는 입력/출력 계약이 명확하고, 함수명이 도메인 의도를 설명하며, 런타임 문맥 없이도 독립 검증이 가능할 때만 분리합니다. 재사용 근거 없이 보기 좋게 만들기 위한 분리나, 한 번만 쓰는 짧은 계산 추출은 피하고 먼저 early return, 단계적 변수, 의미 있는 블록 구분으로 가독성을 확보합니다.

**Incorrect (단회성 계산까지 helper로 분리):**

```ts
const getNextIteration = (iteration: number) => iteration + 1;
const nextIteration = getNextIteration(iteration);
```

**Correct (정규화나 직렬화처럼 실제 경계가 있을 때만 helper로 분리):**

```ts
export const normalizeRuleRefs = (ruleRefs: string[]): string[] => {
	return Array.from(new Set(ruleRefs)).sort();
};
```
