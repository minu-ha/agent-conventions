---
title: Choose State Tools by Source of Truth
titleKo: 상태 도구는 진짜 출처를 기준으로 고릅니다
impact: MEDIUM-HIGH
impactDescription: 지역 UI 상태, 전역 상태, 서버 상태가 서로 섞이지 않습니다
appliesWhen:
  - 로컬 UI·전역 클라이언트·서버 데이터를 새 상태 도구로 옮길 때
  - 합성 컴포넌트나 컴포넌트 묶음에 공유 상태를 넣을 때
  - 서로 다른 진짜 출처 사이에 값을 복제하거나 동기화할 때
reviewWith: state-store-derived-authority, strategy-choose-single-composition-compound-and-variants
tags: state, react-query, zustand
---

## Choose State Tools by Source of Truth

**Impact: MEDIUM-HIGH (지역 UI 상태, 전역 상태, 서버 상태가 서로 섞이지 않습니다)**

상태 도구는 값의 수명과 소유자를 기준으로 고릅니다.

| 상태의 소유자 | 기본 도구 |
| --- | --- |
| 로컬 UI | `useState` 또는 `useReducer` |
| 한 컴포넌트 묶음 안에서 공유하는 UI | `useState` + `Context` |
| 전역 클라이언트 | `Zustand` |
| 서버 | `@tanstack/react-query` |

이 기준으로 고르면 화면 파일이 더 읽기 쉬워지고 중복 동기화가 줄어듭니다.

`Context`는 전역 상태 도구가 아니라 **한 컴포넌트 묶음 안에서 프롭 전달을 줄이는 수단**입니다.
합성 컴포넌트가 부품끼리 상태를 나눠 쓸 때, 작은 컴포넌트 묶음이 두세 단계 아래로 값을 내릴 때 씁니다.
`strategy-choose-single-composition-compound-and-variants`가 상태를 가진 합성으로 확장하라고 할 때
그 상태를 담는 자리가 여기입니다.

- 값의 출처는 여전히 `useState`입니다.
  `Context`는 그 값을 나르는 통로입니다.
- 묶음 밖에서도 필요해지면 `Context`를 위로 올리지 않고 전역 스토어로 옮깁니다.
  그 판정은 `state-store-derived-authority`가 합니다.

프로젝트가 이미 다른 전역 스토어나 서버 상태 도구를 표준으로 쓴다면 그것을 유지합니다.
`Zustand`나 `react-query`를 새로 들여오지 말고 진짜 출처 원칙만 지킵니다.

**Incorrect (서버 상태를 로컬 상태로 복제):**

```ts
const responseUserGetItemSuspense = useUserGetItemSuspense();
const [userName, setUserName] = useState(responseUserGetItemSuspense.data.name);
```

**Correct (도구를 진짜 출처에 맞춤):**

```ts
const [isOpen, setIsOpen] = useState(false);
const themeStore = useThemeStore();

/**
 * 사용자 상세 조회 API
 */
const responseUserGetItemSuspense = useUserGetItemSuspense();
```

**Correct (합성 컴포넌트 안에서 부품끼리 나눠 쓰는 상태는 `Context`로 나름):**

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

export const UiTabsRoot = (props: UiTabsRootProps) => {
	const [selectedId, setSelectedId] = useState(props.defaultId);

	return <UiTabsContext value={{ selectedId, onSelect: setSelectedId }}>{props.children}</UiTabsContext>;
};
```
