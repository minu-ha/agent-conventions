---
title: Use Named Object Params for Complex Signatures
titleKo: 복잡한 시그니처의 named 객체 매개변수 적용
impact: HIGH
impactDescription: 긴 함수 시그니처를 읽을 수 있게 유지하고 위치 혼동 없이 묶인 입력을 확장하게 합니다
appliesWhen:
  - 매개변수 3개 이상 또는 같은 계열 인자를 받는 일반 함수를 추가·변경할 때
  - 객체 매개변수의 구조분해 위치를 바꿀 때
  - 제외: React 함수 컴포넌트의 props 수신·구조분해만 바꾸는 경우
tags: functions, params, signatures
---

## Use Named Object Params for Complex Signatures

**Impact: HIGH (긴 함수 시그니처를 읽을 수 있게 유지하고 위치 혼동 없이 묶인 입력을 확장하게 합니다)**

매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶고,
함수 시그니처에서 바로 구조분해하지 않습니다.
객체 매개변수 타입은 파일 최상단의 named contract를 사용하고, 함수 본문 첫 줄에서 구조분해해 사용합니다.
구조분해 줄이 길어 formatter 예외가 꼭 필요할 때도 함수 본문 안에서 처리합니다.

React 함수 컴포넌트의 props 전체 수신과 본문 구조분해만 바뀌는 경우는 `react/composition-destructure-props-inside`가
담당하므로 이 규칙을 중복 선택하지 않습니다.
객체 인자와 field type·optionality·의미가 같은 기존 named contract가 있으면 그대로 재사용하고,
이 규칙을 지키기 위해 별도 `*Params`나 `*Args`를 새로 만들지 않습니다.

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
