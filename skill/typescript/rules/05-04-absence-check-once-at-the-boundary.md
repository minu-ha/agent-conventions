---
title: Check Absence Once at the Boundary
titleKo: 없을 수 있는 값은 경계에서 한 번만 검사합니다
impact: HIGH
impactDescription: 검사가 값이 들어오는 자리 하나에만 남아 중간 함수가 값을 검사하느라 늘어나지 않습니다
appliesWhen:
  - "`isNil`, `Number.isFinite` 같은 값 검사를 함수 본문에 넣을 때"
  - "매개변수나 반환 타입에 `| null`, `| undefined`, `unknown`을 넣거나 뺄 때"
  - "응답 매핑, `select`·`combine`, search 스키마에서 타입을 좁힐 때"
reviewWith: >-
  absence-resolve-defaults-at-the-boundary, absence-do-not-guard-what-types-guarantee,
  values-decide-once-and-carry-the-result
tags: absence, boundaries
---

## Check Absence Once at the Boundary

**Impact: HIGH (검사가 값이 들어오는 자리 하나에만 남아 중간 함수가 값을 검사하느라 늘어나지 않습니다)**

값이 없을 수 있는지는 값이 소유자 안으로 들어오는 경계에서 한 번만 검사합니다.
화면이면 응답 매핑, `select`, `combine`, search 스키마이고 컴포넌트면 프롭을 받는 자리입니다.
경계가 답을 정하면 아래 함수는 그 답을 타입으로 받습니다.

| 경계가 정한 답 | 아래로 내려가는 타입 | 아래에서 하는 일 |
| --- | --- | --- |
| 기본값이 있다 | `number` | 없습니다. `absence-resolve-defaults-at-the-boundary`대로 경계에서 채웠습니다 |
| 없음을 화면이 보여 준다 | `number \| undefined` | 함수는 그대로 넘기고 그리는 자리의 분기 하나만 읽습니다 |

그리는 자리의 분기는 검사가 아니라 화면의 두 번째 상태입니다.
값이 있을 때와 없을 때 그리는 것이 다르므로 그 분기는 어디로도 옮길 수 없습니다.
그 분기 말고 `undefined`를 읽는 코드가 경계 아래에 있으면 경계가 일을 안 한 것입니다.

중간 함수는 검사하지 않습니다.
받은 타입이 `number`면 `absence-do-not-guard-what-types-guarantee`대로 검사가 위반입니다.
받은 타입이 `number | undefined`면 그대로 넘깁니다.
그 값으로 판정을 해야 하면 경계에서 한 번 판정해 결과를 싣습니다.
그 방법은 `values-decide-once-and-carry-the-result`가 정합니다.

**시그니처가 경계를 말합니다.**
`number | null | undefined`나 `unknown`을 받는 함수가 경계 아래에 여럿 있으면 경계가 일을 안 한 것입니다.
`unknown`은 앱 밖에서 값이 들어오는 자리 하나만 받습니다.
그 좁힘은 `types-narrow-unknown-instead-of-asserting`이 정합니다.

**Incorrect (경계가 타입을 좁히지 않아 아래 함수마다 같은 값을 다시 검사합니다):**

```ts
// page/detail/_function/to-badge/_to-signed-tone.ts
export const toSignedTone = (value: number | null | undefined): Tone => {
	if (isNil(value) || !Number.isFinite(value) || value === 0) {
		return "neutral";
	}
	return value > 0 ? "positive" : "negative";
};

// page/detail/_function/format-signed-percent.ts
export const formatSignedPercent = (value: number | null | undefined) => {
	if (isNil(value) || !Number.isFinite(value)) {
		return copy_empty_value_text;
	}
	return `${value > 0 ? "+" : ""}${value}%`;
};
```

**Correct (경계에서 한 번 좁히고 아래 함수는 `number`만 받으며 없음은 그리는 분기 하나만 읽습니다):**

```tsx
// page/detail/pg-detail.tsx: 서버는 계산 전이면 null을 준다. 여기서 한 번 좁힌다
const responseSummarySuspense = useSuspenseQuery({
	...detailSummaryQueryOptions(patternId),
	select: (response) => ({
		...response,
		changeRate:
			isNotNil(response.changeRate) && Number.isFinite(response.changeRate) ? response.changeRate : undefined,
	}),
});
```

```ts
// page/detail/_function/to-badge/_to-signed-tone.ts
/**
 * 부호 있는 변화율의 강조 tone. 0은 어느 쪽도 아니라 중립이다
 */
export const toSignedTone = (value: number): Tone => {
	if (value === 0) {
		return "neutral";
	}
	return value > 0 ? "positive" : "negative";
};
```

```tsx
// page/detail/_pg-detail-summary.tsx: 없음을 읽는 곳은 그리는 분기 하나다
{isNotNil(summary.changeRate) && (
	<UiBadge tone={toSignedTone(summary.changeRate)}>{formatSignedPercent(summary.changeRate)}</UiBadge>
)}
```
