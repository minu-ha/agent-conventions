---
title: Reuse Project Components Before Writing New Markup
titleKo: 새 마크업보다 저장소 컴포넌트를 먼저 씁니다
impact: CRITICAL
impactDescription: 디자인 파일의 컴포넌트 정리 상태와 무관하게 화면이 저장소의 동작, 상태, 접근성을 물려받습니다
appliesWhen:
  - Figma 화면의 표, 탭, 페이지네이션, 입력, 버튼, 배지를 마크업으로 새로 만들 때
  - `get_design_context`가 준 JSX를 화면 파일에 옮길 때
reviewWith: css/ownership-change-other-owners-through-their-api, react/strategy-avoid-boolean-prop-proliferation
tags: transcription, components, reuse
---

## Reuse Project Components Before Writing New Markup

**Impact: CRITICAL (디자인 파일의 컴포넌트 정리 상태와 무관하게 화면이 저장소의 동작, 상태, 접근성을 물려받습니다)**

Figma 레이어가 컴포넌트로 정리돼 있든 아니든, 화면에 보이는 표, 탭, 버튼은 대부분 저장소에 이미 있습니다.
새 마크업으로 다시 만들면 키보드 조작, 상태, 접근성을 다시 구현해야 하고 같은 컴포넌트가 두 벌이 됩니다.
그래서 요소마다 아래 차례로 대응물을 찾고, 대응된 요소는 스크린샷의 모양에 맞춰 설정만 합니다.

1. 저장소의 `ui`, `widget` 컴포넌트
2. 프로젝트가 쓰는 UI 라이브러리 컴포넌트. `@mui/material`의 `Tabs`, `Pagination`, `TextField`
3. 둘 다 없을 때만 새 마크업

### 모양이 조금 다를 때

| 차이 | 처리 |
| --- | --- |
| 간격, 색처럼 컴포넌트가 여는 값 | 프롭이나 클래스 주입 지점으로 맞춥니다 |
| 컴포넌트가 열지 않는 내부 모양 | 컴포넌트를 복제하지 않고 차이를 보고하거나 컴포넌트 쪽 변경을 제안합니다 |
| 같은 차이가 여러 화면에서 반복됨 | 컴포넌트에 변형을 추가하자고 제안합니다 |

`get_code_connect_map`을 화면 프레임에 한 번 부르면 이미 매핑된 컴포넌트를 싸게 알 수 있습니다.
매핑이 없거나 응답이 비어 있어도 이 차례는 같습니다.
대응된 요소에는 `get_design_context`를 부르지 않습니다.
새 마크업을 만들었으면 그 요소와 이유를 보고의 대응표에 적습니다.

**Incorrect 1 (`get_design_context`가 준 `div` 격자를 표로 씁니다):**

```tsx
<div className="flex flex-col">
	<div className="flex">
		<div className="w-[60px]">번호</div>
		<div className="w-[270px]">상품명</div>
	</div>
	{products.map((product) => (
		<div className="flex" key={product.id}>
			<div className="w-[60px]">{product.id}</div>
			<div className="w-[270px]">{product.name}</div>
		</div>
	))}
</div>
```

**Correct 1 (저장소 표 컴포넌트에 컬럼과 행을 넘깁니다):**

```tsx
<UiTable columns={productColumns} rows={responseProductListSuspense.data.products} />
```
