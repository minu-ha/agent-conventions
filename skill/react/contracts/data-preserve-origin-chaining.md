# Preserve Response and Store Origin in Wide Scopes

**Impact: MEDIUM (파일 전체에서 별칭을 따라가지 않고 값의 출처를 바로 압니다)**

페이지, 레이아웃, 화면 스코프에서는 `response...`, `mutation...`, `*Store` 원본을 유지합니다.
넓은 스코프의 구조분해와 별칭 상수는 값의 출처를 흐립니다.

- 실제로 필요하면 핸들러나 이펙트 내부의 좁은 스코프에서만 제한적으로 구조분해합니다.
- 프롭스에는 이 예외도 없습니다.
  `composition-read-props-without-destructuring`이
  `props`를 구조분해하지 않고 그대로 읽으라고 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-04-data-preserve-origin-chaining.md)을 읽습니다.
