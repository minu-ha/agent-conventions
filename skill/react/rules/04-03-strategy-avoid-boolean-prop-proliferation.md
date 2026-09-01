---
title: Avoid Boolean Prop Proliferation in Shared Components
titleKo: 공용 컴포넌트에 불리언 프롭을 늘리지 않습니다
impact: MEDIUM-HIGH
impactDescription: 공용 컴포넌트가 숨은 조합을 쌓지 않고 구조를 드러냅니다
appliesWhen:
  - `ui`나 `widget` 컴포넌트에 불리언 모드·표시 프롭을 추가할 때
  - 기존 불리언 프롭 조합과 JSX 분기가 늘어날 때
  - 제외: 라우트 진입 파일 안에서만 쓰는 일회성 분기인 경우
reviewWith: strategy-expose-only-assembled-compound-parts
tags: strategy, composition, props, variants, components
---

## Avoid Boolean Prop Proliferation in Shared Components

**Impact: MEDIUM-HIGH (공용 컴포넌트가 숨은 조합을 쌓지 않고 구조를 드러냅니다)**

여러 파일과 레이어에서 재사용되는 공용 컴포넌트에 불리언 프롭을 늘리지 않습니다.
모양이나 모드를 정하는 `isCompact`, `isEditing`, `showSearch` 같은 프롭을 말합니다.
불리언이 늘어날수록 가능한 조합이 급증하고, JSX 분기와 스타일 조건도 함께 불어납니다.

두 신호 중 하나라도 보이면 구조를 다시 고릅니다.

- 모양이나 모드를 정하는 불리언 프롭이 둘 이상입니다.
- 같은 불리언이 JSX 분기와 클래스 조건에 동시에 쓰입니다.

| 자리 | 판정 |
| --- | --- |
| 공용 `ui`·`widget` | 변형 컴포넌트나 합성 컴포넌트로 구조를 드러냅니다 |

공개 부품을 `.Root`처럼 네임스페이스로 묶는 형태는
`strategy-choose-single-composition-compound-and-variants`가 정합니다.
본질은 불리언을 없애고 구조를 명시적으로 드러내는 데 있습니다.

**Incorrect (불리언 프롭 조합으로 공용 컴포넌트가 비대해집니다):**

```tsx
export interface WgProductToolbarProps {
	isCompact?: boolean;
	isEditing?: boolean;
	showSearch?: boolean;
}

export const WgProductToolbar = (props: WgProductToolbarProps) => {
	return (
		<header>
			{props.showSearch && <WgProductSearchField />}
			{props.isEditing ? (
				<WgProductEditActions compact={props.isCompact} />
			) : (
				<WgProductBrowseActions compact={props.isCompact} />
			)}
		</header>
	);
};
```

**Correct (변형을 드러난 컴포넌트와 상태 없는 합성 컴포넌트로 분리합니다):**

```tsx
/**
 * 툴바 바깥 틀 부품
 */
export interface WgProductToolbarRootProps {
	/**
	 * 툴바 줄에 늘어놓을 검색과 동작 부품
	 */
	children: ReactNode;
}

const WgProductToolbarRoot = (props: WgProductToolbarRootProps) => {
	return <header className={clsx("wg_productToolbar__root")}>{props.children}</header>;
};

// 조합은 아래 두 변형이 이미 제공하므로 사용처가 직접 조립할 `Root`만 공개한다
export const WgProductToolbar = {
	Root: WgProductToolbarRoot,
} as const;

export const WgProductBrowseToolbar = () => {
	return (
		<WgProductToolbar.Root>
			<WgProductSearchField />
			<WgProductBrowseActions />
		</WgProductToolbar.Root>
	);
};

export const WgProductEditToolbar = () => {
	return (
		<WgProductToolbar.Root>
			<WgProductEditActions />
		</WgProductToolbar.Root>
	);
};
```
