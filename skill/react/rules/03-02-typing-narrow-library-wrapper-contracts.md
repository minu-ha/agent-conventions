---
title: Narrow the Contract a Library Wrapper Opens
titleKo: 라이브러리 래퍼는 필요한 프롭만 공개합니다
impact: CRITICAL
impactDescription: 화면의 라이브러리 의존성을 제한하고 교체 시 수정 범위를 줄입니다
appliesWhen:
  - 라이브러리 컴포넌트를 감싸는 `Ui*` 래퍼의 프롭스 타입을 만들거나 바꿀 때
  - 래퍼에 프롭을 추가하거나 여는 범위를 넓힐 때
reviewWith: >-
  typing-open-dom-props-in-three-steps, typing-take-handler-types-from-existing-contracts,
  typing-choose-wrapper-shape-and-forwarding,
  typescript/docs-justify-convention-exceptions-with-a-reason-comment
tags: typing, wrapper, contracts
---

## Narrow the Contract a Library Wrapper Opens

**Impact: CRITICAL (화면의 라이브러리 의존성을 제한하고 교체 시 수정 범위를 줄입니다)**

라이브러리 컴포넌트는 화면에서 직접 쓰지 않고 `Ui*` 래퍼를 거칩니다.
업그레이드 · 교체 시 수정 범위를 래퍼에 모으고, 화면에 필요한 계약만 엽니다.

| 프롭 종류 | 선언 방법 |
| --- | --- |
| 라이브러리에 이미 있는 표시 프롭 (`color`, `padding`, `size`) | `ButtonProps["color"]`처럼 인덱스 접근으로 하나씩 엽니다 |
| 안쪽 컴포넌트가 받지 않는 자기 프롭 (`icon`, `label`, `helperText`) | 타입을 직접 적습니다 |
| 라이브러리 스타일 주입 프롭 (테마 스타일 · 클래스 맵 · 렌더 태그 교체) | 선언하지 않습니다 |
| DOM 속성 | `typing-open-dom-props-in-three-steps`를 따릅니다 |

`export type UiButtonProps = ButtonProps`처럼 원본 프롭스 전체를 공개하지 않습니다.
스타일 주입 지점까지 열면 `css/composition-inject-classes-only-at-the-entry-point`의 경계를 지킬 수 없습니다.

자기 프롭은 이름이 아니라 **안쪽 컴포넌트가 받는지**로 구분합니다.
`UiIconButtonProps`의 `icon`은 자기 프롭이지만, 안쪽 컴포넌트도 받는 `UiTableRowProps`의 `selected`는 아닙니다.
인덱스 접근은 이미 있는 프롭을 그대로 열 때만 쓰며, 상속된 프롭도 바깥 타입 이름으로 접근합니다.

| 함께 판단할 내용 | 기준 |
| --- | --- |
| 값을 직접 적어 계약을 좁힘 | 의도적으로 좁힐 때만 허용하며 `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다 |
| `ref` 공개 | `composition-open-ref-props-only-for-imperative-contracts` |
| 프롭 전달 방식 | `typing-choose-wrapper-shape-and-forwarding` |

**Incorrect 1 (라이브러리 타입을 그대로 내보냅니다):**

```tsx
export type UiTableCellProps = TableCellProps;

export const UiTableCell = (props: UiTableCellProps) => {
	return <TableCell {...props} />;
};
```

**Correct 1 (표시 프롭은 인덱스 접근으로 열고 DOM 속성은 세 단계 기준을 따릅니다):**

```tsx
import type {TdHTMLAttributes} from "react";
import type {TableCellProps} from "@mui/material";

/**
 * 표 셀에서 정렬과 여백만 여는 계약
 *
 * 라이브러리 셀의 나머지 표시 프롭은 표 소유자가 정하므로 열지 않는다.
 * align의 inherit은 DOM td 타입에 없어 그 이름만 빼고 다시 연다.
 */
export interface UiTableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
	/**
	 * 내용 가로 정렬
	 */
	align?: TableCellProps["align"];
	/**
	 * 셀 여백
	 */
	padding?: TableCellProps["padding"];
}

export const UiTableCell = (props: UiTableCellProps) => {
	return <TableCell {...props} />;
};
```
