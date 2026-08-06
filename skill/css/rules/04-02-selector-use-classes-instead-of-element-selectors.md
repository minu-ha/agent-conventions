---
title: Use Classes Instead of Element Selectors
titleKo: 요소 선택자 대신 클래스를 붙입니다
impact: MEDIUM-HIGH
impactDescription: 태그만 바꿔도 스타일이 사라지므로 우리가 렌더하는 마크업에는 클래스를 붙입니다
appliesWhen:
  - `p`, `h2`, `span`, `button` 같은 요소 선택자를 쓰려 할 때
  - `dangerouslySetInnerHTML`이나 Markdown 렌더러 출력을 스타일링할 때
reviewWith: naming-name-elements-and-modifiers-by-role
tags: selector, element-selectors, markup
---

## Use Classes Instead of Element Selectors

**Impact: MEDIUM-HIGH (태그만 바꿔도 스타일이 사라지므로 우리가 렌더하는 마크업에는 클래스를 붙입니다)**

우리가 렌더하는 마크업에는 요소 선택자를 쓰지 않습니다.
클래스를 붙입니다.

`div`를 `section`으로, `span`을 `p`로 바꾸는 것만으로 스타일이 사라집니다.
그 변경은 TSX에서 일어나고 CSS 파일에는 흔적이 남지 않습니다.

요소 선택자를 쓸 수 있는 경우는 하나입니다.

> **우리가 그 마크업을 렌더하지 않아서 클래스를 붙일 수 없을 때**

`dangerouslySetInnerHTML`, Markdown 렌더러, 리치 텍스트 에디터 출력이 여기 해당합니다.
TSX에서 그 지점이 보이므로 "이 마크업을 우리가 쓰는가"를 따질 필요가 없습니다.

- 그때도 감싼 클래스 블록 안에서만 씁니다.
  블록 바깥에 `h2 { }`를 두면 그 화면 모든 `h2`에 걸립니다.
- `:first-child` 같은 구조 선택자도 같습니다.
  우리가 렌더하면 클래스를 붙입니다.

`selector-disallowed-list` 규칙이 중첩 안 요소 선택자를 막습니다.
그래서 이 예외를 쓸 때는 `stylelint-disable-next-line` 주석이 필요합니다.
예외가 한 선택자를 넘으면 그 블록을 `stylelint-disable`과 `stylelint-enable` 주석 쌍으로 감쌉니다.
예외 블록에는 요소 선택자가 여럿이라 한 줄짜리 주석으로는 덮지 못합니다.
드문 경우이므로 그 주석이 곧 "여기는 우리가 쓰지 않는 마크업"이라는 표시가 됩니다.

**Incorrect (우리가 렌더하는 마크업을 요소 선택자로 겨냥함):**

```css
.pg_catalogIndex__toolbar {
	& button {
		height: 32px;
	}

	& > div {
		flex: 1;
	}

	& > :first-child {
		margin-inline-start: 0;
	}
}
```

**Incorrect (요소 선택자를 최상위에 둠):**

```css
.wg_productDetail__prose h2 {
	margin: 24px 0 12px;
}
```

**Correct (우리가 렌더하면 클래스를 붙임):**

```tsx
<div className={clsx("pg_catalogIndex__toolbar")}>
	<div className={clsx("pg_catalogIndex__toolbarField")}>
		<UiSearchInput />
	</div>
	<button type="button" className={clsx("pg_catalogIndex__toolbarButton")}>
		초기화
	</button>
</div>
```

```css
.pg_catalogIndex__toolbarField {
	flex: 1;
}

.pg_catalogIndex__toolbarButton {
	height: 32px;
}
```

**Correct (마크업을 우리가 쓰지 않으면 래퍼 블록 안에서 요소 선택자를 씀):**

```tsx
<div
	className={clsx("wg_productDetail__prose")}
	dangerouslySetInnerHTML={{__html: product.bodyHtml}}
/>
```

```css
/* stylelint-disable selector-disallowed-list -- dangerouslySetInnerHTML로 들어온 마크업 */
.wg_productDetail__prose {
	& h2 {
		margin: 24px 0 12px;
		font-size: 18px;
	}

	& p {
		margin: 0 0 12px;
		line-height: 1.7;
	}

	& > :first-child {
		margin-top: 0;
	}
}
/* stylelint-enable selector-disallowed-list */
```
