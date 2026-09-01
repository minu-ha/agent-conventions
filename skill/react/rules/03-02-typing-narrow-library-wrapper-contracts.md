---
title: Narrow the Contract a Library Wrapper Opens
titleKo: 라이브러리 래퍼는 여는 표면을 좁힙니다
impact: CRITICAL
impactDescription: 라이브러리의 스타일 우회로가 화면으로 새지 않고 교체할 때 래퍼 한 파일만 고칩니다
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

**Impact: CRITICAL (라이브러리의 스타일 우회로가 화면으로 새지 않고 교체할 때 래퍼 한 파일만 고칩니다)**

라이브러리 컴포넌트는 화면에서 직접 쓰지 않고 `Ui*` 래퍼를 거칩니다.
래퍼가 있어야 라이브러리를 올리거나 바꿀 때 한 파일만 고칩니다.

**`export type UiButtonProps = ButtonProps`로 두지 않습니다.**
라이브러리 표면이 통째로 열려서 그 라이브러리의 스타일 창구까지 화면이 쓸 수 있게 됩니다.
`css/composition-inject-classes-only-at-the-entry-point`가 정한 스타일 창구가 그 자리에서 뚫립니다.

DOM 프롭이 아닌 계약은 세 가지로 나눠 각각 다르게 씁니다.
DOM 표면 자체를 어떻게 열지는 `typing-open-dom-props-in-three-steps`가 정합니다.

| 프롭 | 어떻게 |
| --- | --- |
| 라이브러리에 **이미 있는** 표시 프롭 (`color`, `padding`, `size`) | `ButtonProps["color"]` 인덱스 접근으로 하나씩 |
| 우리가 **새로 만든** 자기 프롭 (`icon`, `label`, `helperText`) | 우리가 타입을 적습니다 |
| 라이브러리 스타일 창구 (테마 스타일 프롭, 클래스 맵, 렌더 태그 교체) | 선언하지 않습니다 |

**자기 프롭**은 안쪽 컴포넌트가 받지 않는 프롭입니다.
`UiIconButtonProps`의 `icon`은 안쪽 컴포넌트가 모르므로 자기 프롭이고,
`UiTableRowProps`의 `selected`는 안쪽 컴포넌트가 받으므로 자기 프롭이 아닙니다.
인덱스 접근은 자기 프롭이 아닌 것, 곧 **이미 있는 프롭을 그대로 여는 자리**에만 씁니다.

- 인덱스 접근은 상속 사슬을 따라갑니다.
  바깥 타입 이름 하나만 쓰면 됩니다.
- 값을 손으로 다시 적는 것은 일부러 좁힐 때만 합니다.
  좁힌 이유를 적는 형식과 근거 기준은
  `typescript/docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.
- `ref`를 여는 기준은 `composition-open-ref-props-only-for-imperative-contracts`가 정합니다.
- 프롭을 어떻게 넘기는지는 `typing-choose-wrapper-shape-and-forwarding`이 정합니다.

**Incorrect (라이브러리 타입을 그대로 내보냄):**

```tsx
export type UiTableCellProps = TableCellProps;

export const UiTableCell = (props: UiTableCellProps) => {
	return <TableCell {...props} />;
};
```

**Correct (이미 있는 프롭은 인덱스 접근으로 하나씩 엶):**

```tsx
import type {TableCellProps} from "@mui/material";

/**
 * 표 셀에서 정렬과 여백만 여는 계약
 *
 * 라이브러리 셀의 나머지 표시 프롭은 표 소유자가 정하므로 열지 않는다.
 */
export interface UiTableCellProps {
	/**
	 * 내용 가로 정렬
	 */
	align?: TableCellProps["align"];
	/**
	 * 셀 여백
	 */
	padding?: TableCellProps["padding"];
}
```
