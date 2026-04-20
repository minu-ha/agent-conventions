---
title: Reuse Callback Signatures From Existing Contracts
impact: HIGH
impactDescription: prevents callback signatures from drifting when an existing interface or object contract already defines them
tags: callbacks, indexed-access, reuse
---

## Reuse Callback Signatures From Existing Contracts

**Impact: HIGH (prevents callback signatures from drifting when an existing interface or object contract already defines them)**

콜백 구현 시 매개변수를 다시 타이핑하기보다, 이미 존재하는 인터페이스나 계약의 시그니처를 Indexed Access로 재사용합니다. 이렇게 해야 구현과 계약 사이의 타입 정의가 한곳에서 유지됩니다.

**Incorrect (기존 계약이 있는데 콜백 시그니처를 다시 씀):**

```ts
interface ToastFormatters {
	formatMessage: (message: string) => string;
}

const formatMessage = (message: string): string => {
	return `[app] ${message}`;
};
```

**Correct (기존 계약의 시그니처를 직접 참조):**

```ts
/**
 * @summary toast formatter 계약
 */
interface ToastFormatters {
	/**
	 * @field toast 메시지 포맷 함수
	 */
	formatMessage: (message: string) => string;
}

const formatMessage: ToastFormatters["formatMessage"] = (message) => {
	return `[app] ${message}`;
};
```
