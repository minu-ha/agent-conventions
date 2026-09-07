---
title: Give Interactive Elements an Accessible Name
titleKo: 클릭·입력 요소에는 접근 가능한 이름을 붙입니다
impact: HIGH
impactDescription: 스크린 리더와 테스트가 요소를 이름으로 찾을 수 있습니다
appliesWhen:
  - 클릭이나 입력을 받는 요소를 추가·변경할 때
  - 글자 없이 아이콘만 있는 버튼을 추가할 때
tags: composition, accessibility
---

## Give Interactive Elements an Accessible Name

**Impact: HIGH (스크린 리더와 테스트가 요소를 이름으로 찾을 수 있습니다)**

클릭·입력을 받는 요소에는 접근 가능한 이름을 붙이고, 동작에 맞는 HTML 요소를 씁니다.
이름은 화면에 보이는 글자와 맞춰 음성 조작 시에도 같은 말로 찾을 수 있게 합니다.

| 요소 | 이름과 동작 |
| --- | --- |
| 글자가 있는 버튼 | 글자를 이름으로 쓰고 별도 이름을 붙이지 않습니다 |
| 아이콘만 있는 버튼 | `aria-label`을 붙입니다 |
| 입력 | `<label htmlFor>`로 연결합니다. 보이는 라벨을 둘 수 없으면 숨긴 라벨이나 `aria-label`을 씁니다 |
| 누르면 동작을 실행함 | `button`을 쓰고, 폼을 제출하지 않으면 `type="button"`을 지정합니다 |
| 누르면 이동함 | `a`나 라우터 링크를 쓰고, `a`에는 실제 목적지 `href`를 지정합니다 |

`div`·`span`에 `onClick`만 달면 키보드 조작과 접근 가능한 이름이 생기지 않습니다.
같은 입력 컴포넌트를 여러 번 렌더하면 `useId`나 사용처의 고유 식별자로 `id` 중복을 막습니다.
`aria-*`를 스타일 훅으로 쓰는 문제는 `css/selector-use-pseudo-classes-for-dom-owned-states`를 따릅니다.

테스트에서는 `getByRole`의 `name` 조건이나 `getByLabelText`로 목적에 맞는 요소를 찾습니다.
역할만으로 찾는 테스트가 통과해도 접근 가능한 이름이 있다는 뜻은 아닙니다.
포커스 이동 위치는 이 규칙의 대상이 아닙니다.

**Incorrect (클릭 가능한 `div`와 이름 없는 아이콘 버튼을 씁니다):**

```tsx
<Fragment>
	<div className={clsx("pg_products__filterToggle")} onClick={handleFilterToggleClick}>
		<UiFilterIcon />
	</div>

	<input value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
```

**Correct (`button`으로 만들고 이름을 붙입니다):**

```tsx
<Fragment>
	<button
		type="button"
		className={clsx("pg_products__filterToggle")}
		aria-label="필터 열기"
		onClick={handleFilterToggleClick}
	>
		<UiFilterIcon />
	</button>

	<label className={clsx("pg_products__keywordLabel")} htmlFor="product-keyword">
		검색어
	</label>
	<input id="product-keyword" value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
```
