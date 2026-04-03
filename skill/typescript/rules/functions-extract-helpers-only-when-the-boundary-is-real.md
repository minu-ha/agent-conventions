---
title: Extract Support Functions Only When the Boundary Is Real
impact: HIGH
impactDescription: stops helper extraction from fragmenting local flow when no reusable contract or testable boundary actually exists
tags: helpers, extraction, boundaries
---

## Extract Support Functions Only When the Boundary Is Real

**Impact: HIGH (stops helper extraction from fragmenting local flow when no reusable contract or testable boundary actually exists)**

support function은 입력/출력 계약이 명확하고, 런타임 문맥 없이도 독립 검증이 가능할 때만 분리합니다. 재사용 근거 없이 보기 좋게 만들기 위한 분리나, 한 번만 쓰는 짧은 계산 추출은 피하고 먼저 early return, 단계적 변수, 의미 있는 블록 구분으로 가독성을 확보합니다.   
feature 안에서는 `helper.ts`, `helpers.ts`, `utils.ts`, `common.ts` 같은 generic 파일명을 만들지 않고, React route라면 sibling `page.ts`, 그 외에는 owner가 보이는 module을 첫 추출 대상으로 삼습니다. feature-local support function은 named export를 기본으로 사용하고, 여러 owner가 실제로 공유하는 범용 순수 함수만 `shared/util.ts`의 `util.*`로 승격합니다.

**Incorrect (단회성 계산을 generic util 파일로 분리):**

```ts
// utils.ts
export const util = {
	getNextIteration(iteration: number) {
		return iteration + 1;
	},
};
```

**Correct (작은 계산은 local flow에 두고, 진짜 shared pure function만 `shared/util.ts`로 올림):**

```ts
const nextIteration = iteration + 1;
```

```ts
// shared/util.ts
export const util = {
	date: {
		normalize(value: Date | string): string {
			return new Date(value).toISOString();
		},
	},
};
```
