---
title: Avoid Deep Descendant Selector Dependencies
impact: HIGH
impactDescription: keeps layout changes from breaking styling through long descendant chains
appliesWhen: descendant 또는 child selector chain을 추가·수정하거나 DOM 계층에 의존하는 project-owned·third-party selector를 검토한다.
tags: descendants, selector-depth, guardrails
---

## Avoid Deep Descendant Selector Dependencies

**Impact: HIGH (keeps layout changes from breaking styling through long descendant chains)**

깊은 후손 선택자 체인에 스타일을 걸지 않습니다.
이 규칙은 nested 문법 사용 여부와 무관하게, selector가 DOM 구조에 과도하게 묶이는 것을 금지합니다.
project-owned 스타일은 클래스 자체가 계약이 되어야 하며, `.a .b .c .d` 같은 의존성은 DOM 구조가 조금만 바뀌어도 쉽게 깨집니다.
owned root 아래의 third-party DOM path는 `selector-target-third-party-dom-from-owned-roots`가 다루는 예외이며, 그 경우에도 shortest viable chain만 허용합니다.

깊이는 nested source block 수가 아니라 nesting을 펼친 effective selector의 combinator·ancestor chain으로 계산합니다. `& .ant-tree .ant-tree-node-content-wrapper`는 한 nested block 안에 있어도 owned root 뒤에 third-party ancestor가 2단계이므로 one-level selector가 아닙니다.

**Incorrect (깊은 후손 선택자 체인에 의존):**

```css
.rt_catalogIndex__layout .rt_catalogIndex__panel .rt_catalogIndex__detail .rt_catalogIndex__item {
	padding: 8px;
}
```

**Correct (대상 element 클래스나 직접 owner root 계약에 스타일을 둠):**

```css
.rt_catalogIndex__item {
	padding: 8px;
}

.rt_catalogIndex__detailHeader {
	gap: var(--app-space-2, 8px);
}
```
