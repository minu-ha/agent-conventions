---
title: Choose State Tools by Source of Truth
titleKo: 상태 도구는 값의 소유자와 수명으로 고릅니다
impact: HIGH
impactDescription: 로컬·공유·서버·URL 상태의 소유자를 구분합니다
appliesWhen:
  - 로컬 UI·전역 클라이언트·서버 데이터를 새 상태 도구로 옮길 때
  - 합성 컴포넌트나 컴포넌트 묶음에 공유 상태를 넣을 때
  - 서로 다른 진짜 출처 사이에 값을 복제하거나 동기화할 때
reviewWith: state-store-derived-authority, strategy-choose-single-composition-compound-and-variants
tags: state, react-query, zustand
---

## Choose State Tools by Source of Truth

**Impact: HIGH (로컬·공유·서버·URL 상태의 소유자를 구분합니다)**

상태 도구는 값의 수명과 소유자로 고릅니다.
표를 아래에서부터 읽어 처음 해당하는 행을 적용합니다.

| 상태의 소유자 | 기본 도구 |
| --- | --- |
| 로컬 UI | `useState` 또는 `useReducer` |
| 한 컴포넌트 묶음에서 공유하는 UI | `useState` + `Context` |
| 전역 클라이언트 | `Zustand` |
| 서버 | `@tanstack/react-query` |
| 링크를 공유해도 같은 화면이 열려야 하는 값 | 라우트 search 파라미터(`nuqs`의 `useQueryStates`) |

| 혼동하기 쉬운 상태 | 소유 기준 |
| --- | --- |
| 새로고침·뒤로 가기·링크 공유로 유지할 필터·정렬·페이지·선택 행 | search 파라미터에 두고 `useState`로 복제하지 않습니다 |
| 열림·닫힘·마우스 올림·입력 중인 임시 값 | 주소에 올리지 않습니다 |
| 합성 부품이나 작은 묶음의 두세 단계 아래에서 공유하는 UI | `useState`가 소유하고 `Context`로 전달합니다 |
| 묶음 밖의 화면·레이아웃에서도 읽거나 바꾸는 UI | `Context`를 위로 올리지 않고 전역 스토어로 옮깁니다. 파생값이 아닌 탭 `selectedId`도 같습니다 |

서버 상태와 search 파라미터는 사용하는 컴포넌트가 같은 `key`로 직접 읽고 부모 프롭으로 전달하지 않습니다.
소유 위치는 `screen-keep-route-flow-visible`을 따릅니다.
`Context`는 전역 상태 도구가 아니라 묶음 안의 전달 수단입니다.
`strategy-choose-single-composition-compound-and-variants`의 상태 있는 합성도 이 방식으로 상태를 공유합니다.

**Incorrect (전역 값과 서버 값까지 `useState`가 소유합니다):**

```ts
const [isOpen, setIsOpen] = useState(false);
const [theme, setTheme] = useState<Theme>("light");

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (값의 소유자에 맞는 도구를 씁니다):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
```

**Incorrect (링크 공유로 유지할 목록 필터를 `useState`에 둡니다):**

```ts
const [keyword, setKeyword] = useState("");
const [page, setPage] = useState(1);
```

**Correct (주소가 소유한 값은 search 파라미터로 읽고 씁니다):**

```ts
const [urlParams, setUrlParams] = useQueryStates(productUrlParsers);
```

**Incorrect (묶음 밖의 화면이 읽는 값을 `Context`로 앱 루트까지 올려 전역 스토어처럼 씁니다):**

```tsx
// 테마는 레이아웃과 모든 화면이 읽는데 Context 를 루트에 두고 화면마다 Provider 를 찾아 올라간다
const ThemeContext = createContext<Theme>("light");
```

**Correct (묶음 밖에서도 읽는 값은 전역 스토어가 소유합니다):**

```ts
const themeStore = useThemeStore();
```

**Correct (합성 컴포넌트 안에서 부품끼리 나눠 쓰는 상태는 `Context`로 내려보냅니다):**

```tsx
/**
 * 탭 부품끼리 나눠 쓰는 값
 */
interface UiTabsContextValue {
	/**
	 * 지금 열린 탭 식별자
	 */
	selectedId: string;
	/**
	 * 탭을 고를 때
	 */
	onSelect: (id: string) => void;
}

const UiTabsContext = createContext<UiTabsContextValue | null>(null);

/**
 * 탭 묶음 루트 입력 계약
 */
interface UiTabsRootProps {
	/**
	 * 처음 열어 둘 탭 식별자
	 */
	defaultId: string;
	/**
	 * 탭 목록과 패널 부품
	 */
	children: ReactNode;
}

export const UiTabsRoot = (props: UiTabsRootProps) => {
	const [selectedId, setSelectedId] = useState(props.defaultId);

	return <UiTabsContext value={{ selectedId, onSelect: setSelectedId }}>{props.children}</UiTabsContext>;
};
```
