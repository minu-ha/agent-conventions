# Implement the Interactions the Design Implies

**Impact: MEDIUM (동작 표시를 그림으로만 옮겨 눌러도 반응 없는 화면을 만들지 않습니다)**

Figma 화면은 정지 화면이라 동작은 표시로만 남습니다.
아이콘을 그림으로만 옮기면 눌러도 아무 일이 없는 화면이 됩니다.
표시가 암시하는 동작은 컴포넌트가 이미 가진 프롭으로 켜고, 목적지나 조건을 모르면 질문합니다.

| 표시 | 구현 |
| --- | --- |
| 컬럼 머리의 정렬 아이콘 | 그 컬럼만 정렬합니다. 아이콘이 `hidden`인 컬럼은 정렬하지 않습니다 |
| 펼침 화살표 | 접기, 펼치기 상태입니다 |
| 정보 아이콘 | 툴팁입니다. 본문은 메모나 숨긴 툴팁 레이어에서 찾습니다 |
| 링크 색 문구, 밑줄 | 이동입니다. 목적지를 모르면 질문합니다 |
| 호버, 선택 모양이 그려진 행 | 누르면 상세로 이동하거나 선택합니다 |

누르는 요소의 이름은 `react/a11y-give-interactive-elements-an-accessible-name`을 따릅니다.

**Incorrect 1 (정렬 아이콘을 컬럼명 옆 그림으로만 옮깁니다):**

```tsx
/**
 * 상품 표의 컬럼 정의
 */
const productColumns = [
	{key: "name", label: "상품명"},
	{key: "price", label: <span>판매가 <img src={sortIcon} /></span>},
];
```

**Correct 1 (정렬 아이콘이 있는 컬럼에 표의 정렬 프롭을 켭니다):**

```tsx
/**
 * 상품 표의 컬럼 정의
 */
const productColumns = [
	{key: "name", label: "상품명"},
	{key: "price", label: "판매가", sortable: true},
];
```

> 나머지 예시와 예외는 [full rule](../rules/02-04-intent-implement-interactions-the-design-implies.md)에 있습니다.
