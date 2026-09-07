---
title: Avoid Boolean Prop Proliferation in Shared Components
titleKo: 공용 컴포넌트의 모드를 불리언 조합으로 늘리지 않습니다
impact: MEDIUM-HIGH
impactDescription: 모드별 분기와 조합을 컴포넌트 구조에서 확인할 수 있습니다
appliesWhen:
  - `ui`나 `widget` 컴포넌트에 불리언 모드·표시 프롭을 추가할 때
  - 기존 불리언 프롭 조합과 JSX 분기가 늘어날 때
  - 제외: 라우트 진입 파일 안에서만 쓰는 일회성 분기인 경우
  - 제외: `disabled`·`checked` 같은 독립 상태 프롭만 여는 경우
reviewWith: strategy-expose-only-assembled-compound-parts
tags: strategy, composition, props, variants, components
---

## Avoid Boolean Prop Proliferation in Shared Components

**Impact: MEDIUM-HIGH (모드별 분기와 조합을 컴포넌트 구조에서 확인할 수 있습니다)**

여러 파일·레이어에서 재사용하는 공용 `ui`·`widget`은 모드별 불리언 조합 대신 구조를 드러냅니다.
`isCompact`·`isEditing`·`showSearch`가 늘어나면 가능한 조합과 JSX·스타일 분기도 함께 늘어납니다.

| 조건 | 판단 |
| --- | --- |
| 모양이나 모드를 정하는 불리언이 둘 이상임 | 변형 또는 합성 컴포넌트로 구조를 다시 고릅니다 |
| 같은 불리언을 JSX 분기와 클래스 조건에 함께 사용함 | 변형 또는 합성 컴포넌트로 구조를 다시 고릅니다 |
| `disabled`, `checked`, `selected`, `open`처럼 독립 상태를 나타냄 | 유지합니다. 불리언이라는 이유만으로 없애지 않습니다 |

불리언 개수 자체보다 서로 배타적인 모드를 조합으로 표현하는지 확인합니다.
공개 부품을 `.Root`처럼 묶는 형태는 `strategy-choose-single-composition-compound-and-variants`를 따릅니다.

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

**Correct (모드를 변형 컴포넌트와 상태 없는 합성으로 분리합니다):**

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
