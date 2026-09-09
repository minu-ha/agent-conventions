---
title: Do Not Create Screen-local Custom Hooks for Pure Logic
titleKo: 순수 계산을 감싸는 화면 전용 훅을 만들지 않습니다
impact: HIGH
impactDescription: 실제 상태 · 생명주기 · 컨텍스트가 필요한 경우에만 리액트 훅을 사용합니다
appliesWhen:
  - 화면 전용 계산 · 정규화 · 전송 값 조립을 커스텀 훅으로 추출하려 할 때
  - 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때
  - 화면 지역 함수에 `use` 접두사를 붙이거나 커스텀 훅 이름을 바꿀 때
  - 제외: 상태 · 컨텍스트 · 다른 훅 호출 순서를 실제로 캡슐화하는 경우
reviewWith: >-
  typescript/functions-extract-helpers-only-when-the-boundary-is-real, ownership-place-owner-files-in-role-folders,
  ownership-keep-lifecycle-in-the-owning-component, typescript/naming-use-direct-imports-and-public-entry-points
tags: ownership, hooks, widget
---

## Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (실제 상태 · 생명주기 · 컨텍스트가 필요한 경우에만 리액트 훅을 사용합니다)**

화면 전용 계산 · 정규화 · 전송 값 조립처럼 순수한 로직은 커스텀 훅으로 감싸지 않습니다.
화면 지역 훅은 상태 · 컨텍스트 · 훅 호출 순서를 실제로 캡슐화할 때만 허용합니다.

| 대상 | 처리 |
| --- | --- |
| 순수 계산 | `use` 접두사를 붙이지 않습니다 |
| 여러 쿼리를 합친 결과 | 값을 렌더하는 섹션이 `combine`을 소유합니다. 여러 소유자가 같은 조합을 호출할 때만 `_hook`으로 옮깁니다 |
| 실제 커스텀 훅 | 기능을 나타내는 `use<Capability>`로 이름 짓습니다. `useData`, `useLogic`처럼 구현 범주만 적지 않습니다 |
| 생명주기가 있는 로직 | 분량을 줄이기 위한 추출은 허용하지 않습니다. `ownership-keep-lifecycle-in-the-owning-component`를 따릅니다 |

함수 추출 여부는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`을 따릅니다.
추출한 파일의 배치는 `ownership-place-owner-files-in-role-folders`를,
내보내기와 가져오기 형태는 `typescript/naming-use-direct-imports-and-public-entry-points`를 따릅니다.

**Incorrect 1 (순수 지역 계산을 커스텀 훅으로 감쌉니다):**

```tsx
// page/products/_hook/use-media-upload-payload.ts
export const useMediaUploadPayload = (files: File[]) => {
	return files.map((file) => ({name: file.name, size: file.size}));
};

// page/products/_pg-media-upload-panel.tsx
export const PgMediaUploadPanel = (props: PgMediaUploadPanelProps) => {
	const mediaUploadPayload = useMediaUploadPayload(props.files);

	/**
	 * 업로드를 확정할 때 이미 만들어 둔 값을 보냄
	 */
	const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		mutationMediaSave.mutate({data: mediaUploadPayload});
	};

	return <UiButton onClick={handleSaveButtonClick}>저장</UiButton>;
};
```

**Correct 1 (순수 계산은 소유자의 `_function` 폴더에 두고 핸들러가 직접 부릅니다):**

```tsx
// page/products/_function/to-media-upload-payload.ts
/**
 * 업로드 파일 목록으로 저장 요청 본문을 조립
 */
export const toMediaUploadPayload = (files: File[]) => {
	return files.map((file) => ({name: file.name, size: file.size}));
};

// page/products/_pg-media-upload-panel.tsx
import {toMediaUploadPayload} from "@/page/products/_function/to-media-upload-payload";

export const PgMediaUploadPanel = (props: PgMediaUploadPanelProps) => {
	/**
	 * 업로드를 확정할 때만 정규화해서 보냄. 렌더 중에는 계산하지 않는다
	 */
	const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		mutationMediaSave.mutate({data: toMediaUploadPayload(props.files)});
	};

	return <UiButton onClick={handleSaveButtonClick}>저장</UiButton>;
};
```
