---
title: Prefer Owned Wrappers for `Ui*` Component Styling
titleKo: Ui* 스타일링은 소유한 wrapper를 통해
impact: HIGH
impactDescription: 공용 UI wrapper가 즉석 className 주입으로 통제 안 되는 스타일 훅을 노출하는 것을 막음
appliesWhen: >-
  실제 `Ui*` React wrapper 사용처·API에서 내부 DOM styling 경계를 정하거나 root `className`·slot prop hook을
  주입·노출·사용한다. 기존 CSS owner root 아래 third-party selector만 수정하면 제외한다.
reviewWith: selector-target-third-party-dom-from-owned-roots
tags: ui-components, wrappers, third-party
---

## Prefer Owned Wrappers for `Ui*` Component Styling

**Impact: HIGH (공용 UI wrapper가 즉석 className 주입으로 통제 안 되는 스타일 훅을 노출하는 것을 막음)**

이 규칙은 실제 `Ui*` React wrapper 컴포넌트/API 경계에만 적용합니다.
`.ui_*` 같은 기존 CSS owner root 아래에서 third-party selector만 스코프하는 CSS-only 변경은
`selector-target-third-party-dom-from-owned-roots`가 담당합니다.

`Ui*` 컴포넌트(`UiCollapse`, `UiAvatar`,
`UiButton` 등)의 내부 DOM을 꾸미기 위한 ad-hoc `className` 주입은 기본적으로 피합니다.
스타일링이 필요하면 화면이나 local 래퍼 클래스를 두고,
그 래퍼 아래에서만 서드파티 라이브러리 내부 DOM을 제한적으로 타겟팅합니다.
다만 wrapper가 root `className`이나 slot prop을 공식 styling contract로 노출했다면,
레이아웃 참여나 spacing 같은 root-level 스타일에는 그 contract를 그대로 사용할 수 있습니다.

**Incorrect (내부 DOM을 만지기 위해 `Ui*`에 ad-hoc className을 주입):**

```tsx
<UiCollapse className={clsx("loc_postFilterDialog__collapse")} />
```

**Correct (내부 DOM 스타일링은 소유 래퍼 아래로 제한하고, 공식 root contract는 예외적으로 허용):**

```tsx
<div className={clsx("loc_postFilterDialog__collapse")}>
	<UiCollapse />
</div>
```

```css
.loc_postFilterDialog__collapse {
	& .ant-collapse-item {
		border-radius: var(--mk-size-radius-card, 10px);
	}
}
```

```tsx
// UiButton이 root className contract를 공식적으로 노출하는 경우에만 허용
<UiButton className={clsx("loc_postFilterDialog__submitButton")} />
```
