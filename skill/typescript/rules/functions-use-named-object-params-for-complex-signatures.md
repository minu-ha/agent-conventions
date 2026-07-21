---
title: Use Named Object Params for Complex Signatures
impact: HIGH
impactDescription: keeps long function signatures readable and makes grouped inputs easier to extend without positional confusion
appliesWhen: 매개변수 3개 이상 또는 같은 계열 인자를 받는 함수를 추가·변경하거나 객체 매개변수를 시그니처에서 구조분해한다.
tags: functions, params, signatures
---

## Use Named Object Params for Complex Signatures

**Impact: HIGH (keeps long function signatures readable and makes grouped inputs easier to extend without positional confusion)**

매개변수가 3개 이상이거나 같은 계열 값이 묶여 전달되면 단일 객체 매개변수로 묶고, 함수 시그니처에서 바로 구조분해하지 않습니다. 객체 매개변수 타입은 파일 최상단에 선언하고, 함수 본문 첫 줄에서 구조분해해 사용합니다. 구조분해 줄이 길어 formatter 예외가 꼭 필요할 때도 함수 본문 안에서 처리합니다.

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
 * @summary grouped args로 API request URL 생성
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
