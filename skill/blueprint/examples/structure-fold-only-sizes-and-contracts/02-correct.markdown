:::details[구현 상세]
- 패널 폭 300 급, 표 왼쪽. 안쪽 치수는 `UiPanel` 기본값
- URL: `status` 문자열, `from`과 `to` 날짜, 없으면 전체
- 적용 값과 draft 분리. `react-hook-form`
- 규칙 근거: 상태는 URL, 입력 중 값은 폼
:::

테스트는 `test/2-orders/`, mock은 `src/service/mock/orders/`.
