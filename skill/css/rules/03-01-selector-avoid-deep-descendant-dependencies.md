---
title: Avoid Deep Descendant Selector Dependencies
titleKo: 깊은 descendant 셀렉터 의존 금지
impact: HIGH
impactDescription: 한 규칙이 훑는 요소 수를 줄여 마크업이 조금 바뀌어도 스타일이 깨지지 않게 합니다
appliesWhen:
  - 공백·`>`·`+`·`~`로 요소 사이 관계를 표현하는 selector를 추가·수정할 때
  - DOM 계층에 의존하는 project-owned·third-party selector를 검토할 때
reviewWith: >-
  selector-limit-nesting-block-depth, selector-use-pseudo-classes-for-dom-owned-states,
  selector-target-third-party-dom-from-owned-roots, composition-style-ui-components-through-owned-wrappers
tags: descendants, selector-depth, guardrails
---

## Avoid Deep Descendant Selector Dependencies

**Impact: HIGH (한 규칙이 훑는 요소 수를 줄여 마크업이 조금 바뀌어도 스타일이 깨지지 않게 합니다)**

세는 방법:

- 요소 사이 관계 기호인 공백, `>`, `+`, `~`의 개수를 셉니다. 이것을 결합자라고 부릅니다.
- 중첩은 펼친 뒤에 셉니다. `.pg_panel__button:hover .pg_panel__box`는 결합자 1개, 요소 2개입니다.
- 같은 요소에 붙는 `.a.b`, `:hover`, `:not()`, `::before`는 DOM 관계가 아니라 세지 않습니다.
- 상한은 selector 하나당입니다. selector 개수는 제한하지 않습니다.

기본값은 결합자 0입니다. 상태는 그 요소의 modifier class로 받습니다.

결합자를 쓸 수 있는 경우와 상한:

| 경우 | 상한 |
| --- | --- |
| 같은 파일이 소유한 조상의 `:hover`·`:focus-visible`·`:checked`가 자손을 바꿈 | 1 |
| 소유 root 아래 third-party 내부 DOM | 2 |
| raw HTML wrapper 안 element selector | 1 |
| wrapper가 slot class를 열지 않은 부분 override | 1 |

첫 항목만 결합자가 유일한 수단입니다. 자손의 `:hover`는 포인터가 자손 위에 있을 때만 걸립니다.
앱이 이미 아는 상태(variant, selected)는 결합자 대신 각 노드에 modifier를 붙입니다.

상한을 넘으면 자손 modifier로 펴기, 예외 근거 주석, 리팩터 순으로 시도합니다.

**Incorrect (요소 네 개를 훑음):**

```css
.pg_catalogIndex__layout .pg_catalogIndex__panel .pg_catalogIndex__detail .pg_catalogIndex__item {
	padding: 8px;
}
```

**Incorrect (다른 owner의 내부를 밖에서 잡음. wrapper·third-party 규칙이 정한 경로로만 접근한다):**

```css
.pg_catalogIndex__panel .ui_card__title {
	font-size: 13px;
}
```

**Incorrect (도메인 상태를 부모 조건으로 얹어 상한을 낭비):**

```css
.pg_spikePanel__spreadButton:not(.pg_spikePanel__spreadButton--checked):hover .pg_spikePanel__spreadBox {
	border-color: #9fadc7;
}
```

**Correct (대상 요소 클래스에 직접 스타일을 둠):**

```css
.pg_catalogIndex__item {
	padding: 8px;
}

.pg_catalogIndex__detailHeader {
	gap: 8px;
}
```

**Correct (조상 hover는 결합자 1개로 쓰고, 도메인 상태는 자손 modifier가 처리):**

```css
.pg_spikePanel__spreadButton {
	&:hover .pg_spikePanel__spreadBox {
		border-color: #9fadc7;
	}
}

.pg_spikePanel__spreadBox--checked {
	box-shadow: none;
}
```

**Correct (결합자를 쓸 필요가 없으면 각 요소에 직접 둠):**

```css
.pg_spikePanel__spreadBox {
	border: 2px solid #ced4da;
}

.pg_spikePanel__spreadBox--checked {
	border-color: #9fadc7;
}
```
