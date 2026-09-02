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
표를 위에서부터 읽어 지금 필요한 것까지 내려갑니다.
마지막 줄은 앞 줄을 대체하지 않고 그 조립을 한 이름으로 감쌉니다.

| 상황 | 선택 |
| --- | --- |
| 고정 UI | 단일 컴포넌트. 화면 지역 JSX로 둘지는 `screen-extract-local-section-components-for-runtime-boundaries`가 정합니다 |
| 부품 조립만 필요함 | 상태 없는 합성 |
| 여러 부품이 같은 상태·동작·컨텍스트를 읽음 | 상태 있는 합성 |
| 같은 합성 조합이 반복됨 | 드러난 변형 |

아래 네 예시는 같은 대화상자 하나를 네 단계로 끌고 갑니다.
필요가 늘 때 앞 단계에서 다음 단계로만 넘어갑니다.
합성으로 연 뒤에는 상태를 더해도 사용처가 쓰는 이름이 그대로입니다.

렌더 프롭을 쓸 자리인지는 `strategy-prefer-children-over-render-props`가 따로 판정합니다.
무엇을 공개 부품으로 열지는 `strategy-expose-only-assembled-compound-parts`가 정합니다.

**Incorrect (단일, 합성, 드러난 변형의 경계를 구분하지 않고 한 컴포넌트에 몰아넣습니다):**

```tsx
export interface WgProfileDialogProps {
	isCompact?: boolean;
	showActivity?: boolean;
	showFocus?: boolean;
	dialogTitle?: string;
	renderFooter?: () => ReactNode;
}

export const WgProfileDialog = (props: WgProfileDialogProps) => {
	return (
		<section className={props.isCompact ? "dialog dialog--compact" : "dialog"}>
			<header>
				<h3>{props.dialogTitle}</h3>
			</header>
			<WgProfileSummary />
			{props.showActivity && <WgProfileActivityPanel />}
			{props.showFocus && <WgProfileFocusPanel />}
			<footer>{props.renderFooter?.()}</footer>
		</section>
	);
};
```

**Correct (1단계 — 열 자리가 없으면 단일 컴포넌트로 둡니다):**

```tsx
/**
 * 프로필 요약만 보여 주는 고정 구조 대화상자
 *
 * 사용처가 끼워 넣을 자리가 없어 부품으로 쪼개지 않는다.
 */
export interface WgProfileDialogProps {
	/**
	 * 헤더에 그릴 제목
	 */
	title: string;
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const WgProfileDialog = (props: WgProfileDialogProps) => {
	return (
		<section className={clsx("wg_profileDialog__root")}>
			<header className={clsx("wg_profileDialog__header")}>
				<h3>{props.title}</h3>
			</header>
			<WgProfileSummary profile={props.profile} />
		</section>
	);
};
```

**Correct (2단계 — 끼워 넣을 자리가 생기면 상태 없는 합성으로 엽니다):**

```txt
component/widget/profile-dialog/
├── wg-profile-dialog.tsx              진입. 부품을 모아 내보냅니다
├── _wg-profile-dialog-root.tsx
├── _wg-profile-dialog-header.tsx
├── _wg-profile-dialog-body.tsx
└── _type/
    └── profile-dialog-part.ts         세 부품이 나눠 쓰는 계약
```

```tsx
// component/widget/profile-dialog/_type/profile-dialog-part.ts
/**
 * 대화상자 부품 셋이 나눠 쓰는 계약
 *
 * 세 부품 모두 받는 것이 `children` 하나뿐이라 형태를 하나로 둔다.
 */
export interface WgProfileDialogPartProps {
	/**
	 * 그 부품 자리에 사용처가 넣을 내용
	 */
	children: ReactNode;
}
```

```tsx
// component/widget/profile-dialog/_wg-profile-dialog-root.tsx
import {clsx} from "clsx";

import type {WgProfileDialogPartProps} from "@/component/widget/profile-dialog/_type/profile-dialog-part";

/**
 * 대화상자 틀. 나머지 부품은 이 안에서만 그린다
 */
export const WgProfileDialogRoot = (props: WgProfileDialogPartProps) => {
	return <section className={clsx("wg_profileDialog__root")}>{props.children}</section>;
};
```

```tsx
// component/widget/profile-dialog/wg-profile-dialog.tsx
import {WgProfileDialogBody} from "@/component/widget/profile-dialog/_wg-profile-dialog-body";
import {WgProfileDialogHeader} from "@/component/widget/profile-dialog/_wg-profile-dialog-header";
import {WgProfileDialogRoot} from "@/component/widget/profile-dialog/_wg-profile-dialog-root";

export const WgProfileDialog = {
	Root: WgProfileDialogRoot,
	Header: WgProfileDialogHeader,
	Body: WgProfileDialogBody,
} as const;
```

**Correct (3단계 — 부품이 같은 상태를 읽으면 공개 이름을 그대로 두고 컨텍스트만 더합니다):**

```ts
// component/widget/profile-dialog/_hook/use-profile-dialog.ts
/**
 * 대화상자 부품이 나눠 읽는 접힘 상태
 */
interface WgProfileDialogContextValue {
	/**
	 * 본문이 펼쳐져 있는지
	 */
	isBodyOpen: boolean;
	/**
	 * 헤더가 부르는 접기 토글
	 */
	toggleBody: () => void;
}

export const WgProfileDialogContext = createContext<WgProfileDialogContextValue | null>(null);
```

```tsx
// component/widget/profile-dialog/_wg-profile-dialog-root.tsx
/**
 * 대화상자 틀. 접힘 상태를 소유해 부품에 컨텍스트로 내린다
 */
export const WgProfileDialogRoot = (props: WgProfileDialogPartProps) => {
	const [isBodyOpen, setIsBodyOpen] = useState(true);

	/**
	 * 헤더가 부를 접기 토글. 이전 값에 기대므로 함수형으로 갱신한다
	 */
	const toggleBody = () => {
		setIsBodyOpen((previous) => !previous);
	};

	// Header 는 useContext(WgProfileDialogContext) 로 읽어 toggleBody 를 부른다. 공개 이름은 2단계와 같다
	return (
		<WgProfileDialogContext value={{isBodyOpen, toggleBody}}>
			<section className={clsx("wg_profileDialog__root")}>{props.children}</section>
		</WgProfileDialogContext>
	);
};
```

**Correct (4단계 — 같은 조합이 반복되면 드러난 변형으로 감쌉니다):**

```tsx
/**
 * 읽기 전용 프로필 대화상자
 *
 * 세 화면이 같은 조합을 쓰고 있어 조립을 한 이름 뒤로 고정한다.
 */
export interface WgReadOnlyProfileDialogProps {
	/**
	 * 요약 영역에 그릴 프로필
	 */
	profile: Profile;
}

export const WgReadOnlyProfileDialog = (props: WgReadOnlyProfileDialogProps) => {
	return (
		<WgProfileDialog.Root>
			<WgProfileDialog.Header>프로필 보기</WgProfileDialog.Header>
			<WgProfileDialog.Body>
				<WgProfileSummary profile={props.profile} />
			</WgProfileDialog.Body>
		</WgProfileDialog.Root>
	);
};
```
