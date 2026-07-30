---
title: Review Banned CSS Patterns Before Finishing
titleKo: 마무리 전에 금지된 CSS 패턴 점검
impact: MEDIUM
impactDescription: >-
  catches unsafe selector, modifier, and library-targeting shortcuts before they become part of the shared style system
appliesWhen: CSS 또는 TSX class contract 변경이 완료 단계에 들어간다.
requiredOnCompletion: true
tags: review, banned-patterns, guardrails
---

## Review Banned CSS Patterns Before Finishing

**Impact: MEDIUM (catches unsafe selector, modifier, and library-targeting shortcuts before they become part of the
shared style system)**

작업을 마치기 전에 금지 패턴을 다시 확인합니다.

금지:

- 요소 선택자 중심 스타일링
- 깊은 project-owned descendant chain
- 재사용 근거 없는 structural modifier
- root 없는 library class targeting
- top-level pseudo selector 재오픈
- project-owned parent state descendant coupling
- `!important` 남용

허용 가능한 예외:

- 반복되는 명시적 variant modifier
- owner block 안 rich text wrapper의 nested raw element selector
- owned root 아래의 최소 third-party selector chain

예외는 관련 rule에서 허용한 범위 안에서만 사용합니다.

**Incorrect (금지 패턴을 그대로 남김):**

```css
div {
	padding: 8px !important;
}

.wg_siteHeader__brandLink:hover .wg_siteHeader__brandMark {
	transform: rotate(-2deg);
}

.wg_entryDetail__prose h2 {
	margin: 24px 0 12px;
}

.ant-tree-node-content-wrapper {
	border-radius: 4px;
}
```

**Correct (소유 클래스와 허용된 구조/상태 표현으로 정리):**

```css
.wg_siteHeader__brandLink {
	--wg-site-header-brand-mark-transform: none;

	&:hover {
		--wg-site-header-brand-mark-transform: rotate(-2deg);
	}
}

.wg_siteHeader__brandMark {
	transform: var(--wg-site-header-brand-mark-transform);
}

.wg_entryDetail__prose {
	& h2 {
		margin: 24px 0 12px;
	}
}

.rt_treePanel__root {
	& .ant-tree-node-content-wrapper {
		border-radius: var(--app-radius-control, 4px);
	}
}
```
