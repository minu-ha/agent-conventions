---
title: Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed
titleKo: token 주입이 보장 안 되면 var() fallback 넣기
impact: HIGH
impactDescription: 변수가 없을 때 토큰 누락이 스타일을 예측 못 하게 망가뜨리는 것을 막음
appliesWhen: >-
  새·변경된 `var(--*)` 사용이나 token 주입 보장 경계를 바꾼다. 같은 stylesheet·주입 경계에서 기존 `var()` 선언을
  selector 사이 byte-equivalent 이동만 하면 제외한다.
tags: variables, fallbacks, tokens
---

## Provide CSS Variable Fallbacks When Token Presence Is Not Guaranteed

**Impact: HIGH (변수가 없을 때 토큰 누락이 스타일을 예측 못 하게 망가뜨리는 것을 막음)**

CSS 변수 `var(--*)`를 사용할 때는 토큰 존재가 보장되지 않는 경계에서 fallback 값을 함께 지정합니다.
theme provider, 서드파티 wrapper, 선택적 토큰,
임시 overlay처럼 변수가 빠질 수 있는 surface에서는 안전한 기본값을 둬야 합니다.
요청이나 기존 token contract에 없는 CSS variable을 이 규칙 때문에 새로 발명하지 않으며,
새 stylesheet나 class를 만든다는 사실만으로 이 규칙을 선택하지 않습니다.
다만 실제 diff에 새 CSS variable 사용이 들어오면, 요청 여부와 무관하게 이 규칙을 다시 선택하고
주입 보장·fallback을 검사합니다.
반대로 프로젝트 전역에서 반드시 주입되는 core design token이라면,
누락을 빨리 드러내기 위해 fallback을 생략할 수도 있습니다.

같은 stylesheet와 같은 token 주입 경계 안에서 기존 `var()` 선언을 base와 modifier 또는 rename 전후 selector 사이로
byte-equivalent 이동만 하는 경우는 N/A입니다.
변수 이름·fallback·주입 owner·사용 횟수·의미 중 하나라도 바뀌면 다시 Selected로 판정합니다.

**Incorrect (존재 보장이 없는 토큰을 fallback 없이 사용):**

```css
.loc_postFilterDialog__panel {
	border: 1px solid var(--mk-color-border-default);
	background: var(--mk-color-bg-surface);
}
```

**Correct (불안정한 경계에는 fallback을 두고, 보장된 core token은 의도적으로 fail-loud 할 수 있음):**

```css
.loc_postFilterDialog__panel {
	border: 1px solid var(--mk-color-border-default, #d9d9d9);
	border-radius: var(--mk-size-radius-card, 4px);
	background-color: var(--mk-color-bg-surface, #fff);
}

.loc_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
		background: var(--mk-color-bg-surface, #fff);
	}
}

.ui_theme__root {
	color: var(--mk-color-text-primary);
}
```
