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

**결합자**는 요소 사이 관계 기호 공백, `>`, `+`, `~`입니다. 그 개수가 기준입니다.

- 중첩을 펼친 selector로 셉니다. `.pg_panel__button:hover .pg_panel__box`는 결합자 1개입니다.
- 같은 요소에 붙는 `.a.b`, `:hover`, `:not()`, `::before`는 세지 않습니다.
- 상한은 selector 하나당입니다. selector 개수는 제한하지 않습니다.

기본은 결합자 0이고, 상태는 그 요소의 modifier로 받습니다.

| 경우 | 결합자 상한 |
| --- | --- |
| 같은 파일이 소유한 조상의 `:hover`·`:focus-visible`·`:checked`가 자손을 바꿈 | 1 |
| raw HTML wrapper 안 element selector | 1 |
| wrapper가 slot class를 열지 않은 부분 override | 1 |
| 소유 root 아래 third-party 내부 DOM | 제한 없음 |

third-party만 상한이 없습니다. 남의 DOM 깊이는 줄일 수 없어서 상한이 예외 주석만 늘립니다.
상한을 넘으면 자손 modifier로 펴고, 안 되면 리팩터 대상입니다.

각 경우의 판단은 `reviewWith` 규칙이 소유합니다. 기계 검증은 `selector-max-combinators`입니다.

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
