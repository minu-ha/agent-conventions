---
title: Choose Single Components, Compound Components, and Variants Deliberately
titleKo: 단일, 합성, 변형 중 가장 단순한 조립을 고릅니다
impact: MEDIUM-HIGH
impactDescription: 필요한 확장점은 열면서 가장 단순한 구조를 고르게 돕습니다
appliesWhen:
  - 내보낸 공용 컴포넌트에 슬롯, 공개 부품, 공용 컨텍스트나 동작을 추가할 때
  - 반복되는 기본 설정이나 모드 API를 추가할 때
  - 공용 컴포넌트의 조립 구조를 재설계할 때
reviewWith: >-
  strategy-expose-only-assembled-compound-parts, strategy-avoid-boolean-prop-proliferation,
  strategy-prefer-children-over-render-props, screen-avoid-premature-abstraction
tags: strategy, composition, variants, components
---

## Choose Single Components, Compound Components, and Variants Deliberately

**Impact: MEDIUM-HIGH (필요한 확장점은 열면서 가장 단순한 구조를 고르게 돕습니다)**

공용 컴포넌트는 프롭스보다 구조를 먼저 고릅니다.
무엇이 필요한지 표를 위에서부터 순서대로 봅니다.

| 상황 | 선택 |
| --- | --- |
| 고정 UI | `single component` 또는 화면 지역 JSX |
| 부품 조립만 필요함 | `stateless compound component` |
| 여러 부품이 같은 상태/동작/컨텍스트를 읽음 | `stateful compound component` |
| 같은 합성 조합이 반복됨 | `explicit variant component` |

아래 네 예시는 같은 대화상자 하나를 네 단계로 끌고 갑니다.
필요가 늘 때 앞 단계에서 다음 단계로만 넘어가고, 공개 이름은 그대로 둡니다.

렌더 프롭을 쓸 자리인지는 `strategy-prefer-children-over-render-props`가 따로 판정합니다.
무엇을 공개 부품으로 열지는 `strategy-expose-only-assembled-compound-parts`가 정합니다.

**Incorrect (단일, 합성, 드러난 변형의 경계를 구분하지 않고 한 컴포넌트에 몰아넣음):**

```tsx
export interface UiProfileDialogProps {
	isCompact?: boolean;
	showActivity?: boolean;
	showFocus?: boolean;
	dialogTitle?: string;
	renderFooter?: () => ReactNode;
}

export const UiProfileDialog = (props: UiProfileDialogProps) => {
	return (
		<section className={props.isCompact ? "dialog dialog--compact" : "dialog"}>
			<header>
				<h3>{props.dialogTitle}</h3>
			</header>
			<UiProfileSummary />
			{props.showActivity && <UiProfileActivityPanel />}
			{props.showFocus && <UiProfileFocusPanel />}
			<footer>{props.renderFooter?.()}</footer>
		</section>
	);
};
```

**Correct (1단계 — 열 자리가 없으면 단일 컴포넌트로 유지):**

```tsx
/**
 * 프로필 요약만 보여 주는 고정 구조 대화상자
 *
 * 사용처가 끼워 넣을 자리가 없어 부품으로 쪼개지 않는다.
 */
export interface UiProfileDialogProps {
	/**
	 * 헤더에 그릴 제목
	 */
	title: string;
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const UiProfileDialog = (props: UiProfileDialogProps) => {
	return (
		<section className={clsx("ui_profileDialog__root")}>
			<header className={clsx("ui_profileDialog__header")}>
				<h3>{props.title}</h3>
			</header>
			<UiProfileSummary profile={props.profile} />
		</section>
	);
};
```

**Correct (2단계 — 끼워 넣을 자리가 생기면 상태 없는 합성으로 엶):**

```tsx
/**
 * 대화상자 부품 셋이 나눠 쓰는 계약
 *
 * 세 부품 모두 받는 것이 `children` 하나뿐이라 형태를 하나로 둔다.
 */
export interface UiProfileDialogPartProps {
	/**
	 * 그 부품 자리에 사용처가 넣을 내용
	 */
	children: ReactNode;
}

const UiProfileDialogRoot = (props: UiProfileDialogPartProps) => {
	return <section className={clsx("ui_profileDialog__root")}>{props.children}</section>;
};

const UiProfileDialogHeader = (props: UiProfileDialogPartProps) => {
	return <header className={clsx("ui_profileDialog__header")}>{props.children}</header>;
};

const UiProfileDialogBody = (props: UiProfileDialogPartProps) => {
	return <section className={clsx("ui_profileDialog__body")}>{props.children}</section>;
};

export const UiProfileDialog = {
	Root: UiProfileDialogRoot,
	Header: UiProfileDialogHeader,
	Body: UiProfileDialogBody,
} as const;
```

**Correct (3단계 — 부품이 같은 상태를 읽으면 공개 이름을 그대로 두고 컨텍스트만 더함):**

```tsx
const UiProfileDialogContext = createContext<UiProfileDialogContextValue | null>(null);

const UiProfileDialogRoot = (props: UiProfileDialogPartProps) => {
	const [isBodyOpen, setIsBodyOpen] = useState(true);

	/**
	 * 헤더가 부를 접기 토글. 이전 값에 기대므로 함수형으로 갱신한다
	 */
	const toggleBody = () => {
		setIsBodyOpen((previous) => !previous);
	};

	return (
		<UiProfileDialogContext value={{ isBodyOpen, toggleBody }}>
			<section className={clsx("ui_profileDialog__root")}>{props.children}</section>
		</UiProfileDialogContext>
	);
};

const UiProfileDialogHeader = (props: UiProfileDialogPartProps) => {
	const dialog = useUiProfileDialog();

	/**
	 * 헤더를 누르면 본문을 접거나 펼친다
	 */
	const handleHeaderClick: MouseEventHandler<HTMLButtonElement> = () => {
		dialog.toggleBody();
	};

	return (
		<header className={clsx("ui_profileDialog__header")}>
			<button type="button" onClick={handleHeaderClick}>
				{props.children}
			</button>
		</header>
	);
};

const UiProfileDialogBody = (props: UiProfileDialogPartProps) => {
	const dialog = useUiProfileDialog();

	if (!dialog.isBodyOpen) {
		return null;
	}

	return <section className={clsx("ui_profileDialog__body")}>{props.children}</section>;
};

// 상태가 늘었지만 사용처가 쓰는 이름은 2단계와 같다
export const UiProfileDialog = {
	Root: UiProfileDialogRoot,
	Header: UiProfileDialogHeader,
	Body: UiProfileDialogBody,
} as const;
```

**Correct (4단계 — 같은 조합이 반복되면 드러난 변형으로 감쌈):**

```tsx
/**
 * 읽기 전용 프로필 대화상자
 *
 * 세 화면이 같은 조합을 쓰고 있어 조립을 한 이름 뒤로 고정한다.
 */
export interface UiReadOnlyProfileDialogProps {
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const UiReadOnlyProfileDialog = (props: UiReadOnlyProfileDialogProps) => {
	return (
		<UiProfileDialog.Root>
			<UiProfileDialog.Header>프로필 보기</UiProfileDialog.Header>
			<UiProfileDialog.Body>
				<UiProfileSummary profile={props.profile} />
			</UiProfileDialog.Body>
		</UiProfileDialog.Root>
	);
};
```
