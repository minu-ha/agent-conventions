---
title: Do Not Create Screen-local Custom Hooks for Pure Logic
titleKo: 순수 계산을 감싸는 화면 전용 훅을 만들지 않습니다
impact: MEDIUM-HIGH
impactDescription: 리액트 전용 추상을 실제 생명주기나 문맥이 얽힌 자리로만 한정합니다
appliesWhen:
  - 화면 전용 계산·정규화·전송 값 조립을 커스텀 훅으로 추출하려 할 때
  - 화면 전용 순수 로직을 별도 보조 모듈로 옮기려 할 때
  - 화면 지역 함수에 `use` 접두사를 붙이거나 커스텀 훅 이름을 바꿀 때
  - 제외: 상태·컨텍스트·다른 훅 호출 순서를 실제로 캡슐화하는 경우
reviewWith: >-
  typescript/functions-extract-helpers-only-when-the-boundary-is-real, ownership-place-owner-files-in-role-folders,
  ownership-keep-lifecycle-in-the-owning-component, typescript/naming-use-direct-imports-and-public-entry-points
tags: ownership, hooks, widget
---

## Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: MEDIUM-HIGH (리액트 전용 추상을 실제 생명주기나 문맥이 얽힌 자리로만 한정합니다)**

순수 계산은 훅으로 감싸지 않고 일반 `.ts` 파일의 함수로 둡니다.
화면 하나에 종속된 계산, 정규화, 전송 값 조립이 모두 여기 해당합니다.

- 이 규칙은 훅으로 감쌀지 여부만 판정합니다.
  그 함수를 아예 밖으로 뺄지는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이,
  뺀 결과를 어디 둘지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
- 화면 지역 커스텀 훅은 상태, 컨텍스트, 다른 훅 호출 순서를 실제로 캡슐화할 때만 허용합니다.
  실제로 훅인 함수만 `use<Capability>`로 이름 짓습니다.
  `useData`, `useLogic`처럼 구현 범주를 되풀이하지 말고 훅이 제공하는 기능을 적습니다.
- 보조 모듈의 내보내기와 가져오기 형태는 `typescript/naming-use-direct-imports-and-public-entry-points`가 정합니다.
- 생명주기가 실제로 있어도 파일 분량을 줄이려는 추출은 허용하지 않습니다.
  그 판단은 `ownership-keep-lifecycle-in-the-owning-component`가 담당합니다.
- 단순 계산을 훅처럼 보이게 만드는 추상화는 피합니다.
  순수 함수에 `use`를 붙여 훅처럼 보이게 하는 것도 허용하지 않습니다.

**Incorrect (로컬 계산을 습관적으로 훅으로 포장):**

```ts
export const useMediaUploadPayload = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (순수 계산은 소유자의 `function` 폴더에 일반 함수로 둠):**

```ts
// page/products/function/to-media-upload-request.ts
/**
 * 업로드 파일 목록으로 저장 요청을 조립
 */
export const toMediaUploadRequest = (files: UploadFile[]) => {
	return files.map((file) => ({ uid: file.uid }));
};
```

**Correct (훅 없이 컴포넌트 핸들러가 그 함수를 직접 부름):**

```tsx
// page/products/component/pg-media-upload-panel.tsx
import { toMediaUploadRequest } from "../function/to-media-upload-request";

const PgMediaUploadPanel = (props: PgMediaUploadPanelProps) => {
	/**
	 * 업로드를 확정할 때만 정규화해서 보냄. 렌더 중에는 계산하지 않는다
	 */
	const handleSaveButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
		void saveMedia(toMediaUploadRequest(props.files));
	};

	return <UiButton onClick={handleSaveButtonClick}>저장</UiButton>;
};
```
