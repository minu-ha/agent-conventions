---
title: Use Classes Instead of Element Selectors
titleKo: element selector 대신 class 사용
impact: MEDIUM
impactDescription: 태그를 바꾸는 것만으로 스타일이 사라지지 않게 우리가 렌더하는 마크업에는 class를 붙입니다
appliesWhen:
  - `p`, `h2`, `span`, `button` 같은 element selector를 쓰려 할 때
  - `dangerouslySetInnerHTML`이나 Markdown 렌더러 출력을 스타일링할 때
reviewWith: naming-name-elements-and-modifiers-by-role
tags: selectors, element-selectors, markup
---

## Use Classes Instead of Element Selectors

**Impact: MEDIUM (태그를 바꾸는 것만으로 스타일이 사라지지 않게 우리가 렌더하는 마크업에는 class를 붙입니다)**

우리가 렌더하는 마크업에는 element selector를 쓰지 않습니다. class를 붙입니다.

`div`를 `section`으로, `span`을 `p`로 바꾸는 것만으로 스타일이 사라집니다.
그 변경은 TSX에서 일어나고 CSS 파일에는 흔적이 남지 않습니다.

element selector를 쓸 수 있는 경우는 하나입니다.

> **우리가 그 마크업을 쓰지 않아서 class를 붙일 수 없을 때**

`dangerouslySetInnerHTML`, Markdown 렌더러, 리치 텍스트 에디터 출력이 여기 해당합니다.
TSX에서 그 지점이 보이므로 "이게 raw HTML인가"를 판단할 필요가 없습니다.

- 그때도 wrapper class block 안에서만 씁니다. top-level `h2 { }`는 그 페이지 모든 `h2`에 걸립니다.
- `:first-child` 같은 구조 selector도 같습니다. 우리가 렌더하면 class를 붙입니다.

기계 검증은 top-level `selector-max-type: 0`입니다.

**Incorrect (우리가 렌더하는 마크업을 element selector로 겨냥함):**

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

**Incorrect (element selector를 top-level에 둠):**

```css
.wg_entryDetail__prose h2 {
	margin: 24px 0 12px;
}
```

**Correct (우리가 렌더하면 class를 붙임):**

```tsx
<div className="pg_catalogIndex__toolbar">
	<div className="pg_catalogIndex__toolbarField">
		<UiSearchInput />
	</div>
	<button type="button" className="pg_catalogIndex__toolbarButton">
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

**Correct (마크업을 우리가 쓰지 않으면 wrapper block 안에서 element selector를 씀):**

```tsx
<div
	className="wg_entryDetail__prose"
	dangerouslySetInnerHTML={{__html: entry.bodyHtml}}
/>
```

```css
.wg_entryDetail__prose {
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
```
