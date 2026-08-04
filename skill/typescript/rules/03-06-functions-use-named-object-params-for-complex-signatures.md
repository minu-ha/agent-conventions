---
title: Use Named Object Params for Complex Signatures
titleKo: 시그니처가 복잡해지면 이름 붙인 객체 매개변수로 묶습니다
impact: HIGH
impactDescription: 긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다
appliesWhen:
  - 매개변수가 3개를 넘거나 같은 계열 인자를 받는 함수를 추가·변경할 때
  - 객체 매개변수를 어디서 구조분해할지 바꿀 때
  - 제외: 리액트 함수 컴포넌트가 프롭스를 받고 구조분해하는 방식만 바꾸는 경우
tags: functions, params, signatures
---

## Use Named Object Params for Complex Signatures

**Impact: HIGH (긴 시그니처를 읽을 수 있게 두고 위치를 헷갈리지 않으면서 입력을 늘립니다)**

매개변수가 3개를 넘거나 같은 계열 값이 함께 넘어오면 객체 하나로 묶습니다.
시그니처 자리에서 바로 구조분해하지 않습니다.
객체 매개변수 타입은 파일 위쪽에 이름을 붙여 선언하고, 함수 본문 첫 줄에서 구조분해합니다.
구조분해 줄이 길어 포매터 예외가 필요해도 함수 본문 안에서 처리합니다.

리액트 함수 컴포넌트가 프롭스를 통째로 받아 본문에서 구조분해하는 것만 바뀌면
`react/composition-destructure-props-inside`가 담당하므로 이 규칙을 겹쳐 적용하지 않습니다.
객체 인자와 필드 타입, 선택 여부, 뜻이 같은 계약이 이미 있으면 그대로 씁니다.
이 규칙을 지키려고 `*Params`나 `*Args`를 새로 만들지 않습니다.

**Incorrect (시그니처에서 바로 구조분해):**

```ts
const buildRequestUrl = ({baseUrl, resourcePath, searchParams}: BuildRequestUrlArgs): URL => {
	const requestUrl = new URL(resourcePath, baseUrl);

	for (const [key, value] of Object.entries(searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```

**Correct (객체 전체를 받고 본문에서 구조분해):**

```ts
/**
 * grouped args로 API request URL 생성
 */
const buildRequestUrl = (args: BuildRequestUrlArgs): URL => {
	const {baseUrl, resourcePath, searchParams} = args;
	const requestUrl = new URL(resourcePath, baseUrl);

	for (const [key, value] of Object.entries(searchParams)) {
		requestUrl.searchParams.set(key, value);
	}

	return requestUrl;
};
```
