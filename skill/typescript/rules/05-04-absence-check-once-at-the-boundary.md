---
title: Check Absence Once at the Boundary
titleKo: 없을 수 있는 값은 경계에서 한 번만 검사합니다
impact: HIGH
impactDescription: 값이 들어오는 경계에서 검사해 중간 함수의 중복 검사를 줄입니다
appliesWhen:
  - `isNil`, `Number.isFinite` 같은 검사를 함수에 넣을 때
  - `null`, `undefined`, `unknown`을 매개변수 · 반환 타입에 넣거나 뺄 때
  - 응답 매핑 · 쿼리 · search 스키마에서 없음 · 유한 수 검사로 타입을 좁힐 때
reviewWith: >-
  absence-resolve-defaults-at-the-boundary, absence-do-not-guard-what-types-guarantee,
  values-decide-once-and-carry-the-result
tags: absence, boundaries
---

## Check Absence Once at the Boundary

**Impact: HIGH (값이 들어오는 경계에서 검사해 중간 함수의 중복 검사를 줄입니다)**

값의 없음 여부는 소유자 안으로 들어오는 경계에서 한 번 검사하고, 결과를 타입으로 전달합니다.
화면의 응답 매핑 · `select` · `combine` · search 스키마나 컴포넌트가 프롭을 받는 자리가 경계입니다.

| 경계가 정한 답 | 전달 타입 | 소비처 |
| --- | --- | --- |
| 기본값이 있음 | `number` | `absence-resolve-defaults-at-the-boundary`에 따라 채운 값을 사용합니다 |
| 없음을 화면에 표시 | `number \| undefined` | 중간 함수는 그대로 전달하고 렌더링 위치에서 한 번 분기합니다 |

없을 때 다른 화면을 렌더하는 분기는 필요한 표시 상태이므로 유지합니다.
그 밖의 소비처가 없음 여부를 반복 판정한다면 경계에서 결과를 전달했는지 확인합니다.
판정 결과를 전달하는 방법은 `values-decide-once-and-carry-the-result`가 정합니다.

| 다시 검사가 필요한가 | 기준 |
| --- | --- |
| 경계에서 이미 확인한 없음 · 유한 수 조건 | 반복하지 않습니다 |
| 타입이 `number`라는 사실만 확인됨 | `NaN`, `Infinity` · 허용 범위까지 보장하지는 않습니다 |
| 새 계산 · 외부 호출로 만든 값, 검증 후 변경 · 외부 값 혼합 | 기존 보장이 적용되지 않는 조건을 해당 경계에서 확인합니다 |
| 여러 입력 경로가 각각 외부 값을 받음 | 각 경계에서 검증합니다 |

경계 아래 여러 함수가 `number | null | undefined`나 `unknown`을 받으면 경계의 처리 책임을 확인합니다.
`unknown`은 검증 책임이 있는 경계에서 받고, 공개 입력 계약을 내부 호출 하나에 맞춰 좁히지 않습니다.
타입 좁히기는 `types-narrow-unknown-instead-of-asserting`을 따릅니다.

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

**Correct (경계에서 타입을 좁히고 없음 여부는 화면을 그릴 때 분기합니다):**

```tsx
// page/detail/pg-detail.tsx: 서버는 계산 전이면 null을 준다. 여기서 한 번 좁힌다
const responseSummarySuspense = useSuspenseQuery({
	...detailSummaryQueryOptions(productId),
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
