---
title: Give Interactive Elements an Accessible Name
titleKo: 누르고 입력하는 요소에는 접근 가능한 이름을 붙입니다
impact: HIGH
impactDescription: 스크린 리더와 테스트가 요소를 이름으로 찾을 수 있습니다
appliesWhen:
  - 클릭이나 입력을 받는 요소를 새로 만들 때
  - 글자 없이 아이콘만 있는 버튼을 추가할 때
tags: composition, accessibility
---

## Give Interactive Elements an Accessible Name

**Impact: HIGH (스크린 리더와 테스트가 요소를 이름으로 찾을 수 있습니다)**

클릭이나 입력을 받는 요소는 접근 가능한 이름을 갖습니다.

| 요소 | 이름을 주는 방법 |
| --- | --- |
| 글자가 들어 있는 버튼 | 그 글자가 이름입니다. 따로 붙이지 않습니다 |
| 아이콘만 있는 버튼 | `aria-label`로 붙입니다 |
| 입력 | `<label htmlFor>`로 잇습니다. 라벨을 안 보이게 할 때만 `aria-label`을 씁니다 |

누르는 것은 `button`으로 만듭니다.
`div`나 `span`에 `onClick`을 달면 키보드로 못 누르고 이름도 안 생깁니다.
누르면 이동하는 것은 `a`나 라우터 링크입니다.

이름은 화면에 보이는 글자와 같게 씁니다.
보이는 글자와 `aria-label`이 다르면 음성으로 조작하는 사용자가 부르는 이름과 화면이 어긋납니다.

`aria-*`를 스타일 훅으로 쓰지 않습니다.
`css/selector-use-pseudo-classes-for-dom-owned-states`가 그 자리를 정합니다.

이 이름은 테스트가 요소를 찾는 근거이기도 합니다.
`getByRole`이나 `getByLabel`로 요소를 찾으려면 이름이 있어야 합니다.
이름이 없으면 테스트가 클래스나 DOM 순서를 붙잡게 되고, 그건 마크업을 고칠 때마다 깨집니다.

포커스를 어디로 옮길지는 이 규칙이 정하지 않습니다.

**Incorrect (누르는 `div`와 이름 없는 아이콘 버튼):**

```tsx
<Fragment>
	<div className={clsx("pg_products__filterToggle")} onClick={handleFilterToggleClick}>
		<UiFilterIcon />
	</div>

	<input value={props.keyword} onChange={props.onKeywordChange} />
</Fragment>
```

**Correct (`button`으로 만들고 이름을 붙임):**

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
