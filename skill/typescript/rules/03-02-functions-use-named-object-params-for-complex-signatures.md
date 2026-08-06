---
title: Use Named Object Params for Complex Signatures
titleKo: 시그니처가 복잡해지면 이름 붙인 객체 매개변수로 묶습니다
impact: MEDIUM-HIGH
impactDescription: 긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다
appliesWhen:
  - 매개변수가 셋을 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때
  - 객체 매개변수의 필드를 읽는 방식을 바꿀 때
  - 제외: 리액트 함수 컴포넌트가 프롭스를 받는 방식만 바꾸는 경우
reviewWith: types-reuse-existing-contracts-before-new-types, values-read-objects-through-chains
tags: functions
---

## Use Named Object Params for Complex Signatures

**Impact: MEDIUM-HIGH (긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 셋을 넘거나 같은 계열 값이 함께 넘어오면 위치 인자를 객체 하나로 묶습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언합니다.

받은 객체는 시그니처에서도 본문에서도 구조분해하지 않고 `target.baseUrl`처럼 체인으로 읽습니다.
그 규범과 예외는 `values-read-objects-through-chains` 규칙이 모든 객체에 정합니다.
여기서는 매개변수를 언제 객체로 묶고 그 타입을 어디에 선언할지만 봅니다.

리액트 컴포넌트의 프롭스는 이 규칙 대상이 아닙니다.
프롭스를 읽는 방식과 타입 선언 위치는 프레임워크 컨벤션이 담당합니다.

뜻이 같은 계약이 이미 있으면 그대로 씁니다.
그 판정은 `types-reuse-existing-contracts-before-new-types`가 합니다.
이 규칙을 지키려고 `*Params`나 `*Args`를 새로 만들지 않습니다.

**Incorrect (시그니처에서 바로 구조분해):**

```ts
const toRequestUrl = ({baseUrl, resourcePath, searchParams}: ApiRequestTarget): URL => {
	const requestUrl = new URL(resourcePath, baseUrl);

	for (const [key, value] of Object.entries(searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```

**Incorrect (본문 첫 줄로 옮겼을 뿐 출처는 똑같이 지워짐):**

```ts
const toRequestUrl = (target: ApiRequestTarget): URL => {
	const {baseUrl, resourcePath, searchParams} = target;
	const requestUrl = new URL(resourcePath, baseUrl);

	for (const [key, value] of Object.entries(searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```

**Correct (객체 전체를 받고 체인으로 읽음):**

```ts
/**
 * 요청 URL 조립. searchParams는 set으로 넣어 baseUrl에 있던 같은 키를 덮는다.
 *
 * 입력 계약은 shared/api/type.ts의 ApiRequestTarget을 그대로 쓴다
 */
const toRequestUrl = (target: ApiRequestTarget): URL => {
	const requestUrl = new URL(target.resourcePath, target.baseUrl);

	for (const [key, value] of Object.entries(target.searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```
