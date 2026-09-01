---
title: Read Props Through the Props Object Without Destructuring
titleKo: 프롭스는 구조분해하지 않고 `props`로 읽습니다
impact: MEDIUM
impactDescription: 값이 프롭스에서 왔다는 사실이 쓰는 자리마다 그대로 남습니다
appliesWhen:
  - 함수 컴포넌트의 시그니처나 본문에서 프롭스를 읽는 코드를 추가·변경할 때
  - 컴포넌트 안에서 `props`를 구조분해하는 줄을 넣거나 뺄 때
reviewWith: >-
  screen-keep-derived-values-close, data-preserve-origin-chaining,
  typescript/values-read-objects-through-chains
tags: composition, props, origin
---

## Read Props Through the Props Object Without Destructuring

**Impact: MEDIUM (값이 프롭스에서 왔다는 사실이 쓰는 자리마다 그대로 남습니다)**

컴포넌트는 `props` 전체를 받고 쓰는 자리마다 `props.id`로 읽습니다.
시그니처에서도, 본문 어느 줄에서도, 본문 안 중첩 함수에서도 구조분해하지 않습니다.

구조분해로 끊지 않는 규범은 `typescript/values-read-objects-through-chains`가 모든 객체에 정합니다.
프롭스는 컴포넌트 시그니처라 끊고 싶은 압력이 가장 센 자리여서 여기서 한 번 더 못 박습니다.

- `{...props}`로 그대로 펼치는 것은 구조분해가 아닙니다.
  `props`를 이름 그대로 읽어 넘기는 것이라 출처가 지워지지 않습니다.
  스프레드를 쓸 조건은 `typing-choose-wrapper-shape-and-forwarding`이 정합니다.
- 선택 프롭에 기본값이 필요하면
  `typescript/absence-expose-optional-values-instead-of-silent-fallbacks`를 따릅니다.
  프롭 값을 쓰는 자리에서 그대로 비교하면 기본값을 만들 필요가 없습니다.

**Incorrect (시그니처에서 구조분해합니다):**

```tsx
const WgUserCard = ({ label, onSave }: WgUserCardProps) => {
	return <button onClick={onSave}>{label}</button>;
};
```

**Incorrect (본문 첫 줄에서 구조분해합니다):**

```tsx
const WgUserCard = (props: WgUserCardProps) => {
	const { label, onSave } = props;
	return <button onClick={onSave}>{label}</button>;
};
```

**Correct (`props`로 읽어 출처를 남깁니다):**

```tsx
const WgUserCard = (props: WgUserCardProps) => {
	return <button onClick={props.onSave}>{props.label}</button>;
};
```
