# Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (DOM을 거슬러 올라가지 않고 sticky, fixed, 박스 책임을 파악합니다)**

레이아웃 의도는 클래스명과 선언만 보고 바로 읽혀야 합니다.
크기는 내용이 정하게 두고 필요한 최소만 고정합니다.
고정 `height` 대신 `min-height`를, `width: 100%` 대신 부모의 `flex`나 `grid` 배치를 씁니다.

- `z-index`에는 숫자를 직접 쓰지 않고 층 토큰을 씁니다.
  토큰 이름이 곧 쌓임 순서 문서입니다.
- 층 순서는 **같은 쌓임 맥락 안에서만** 성립합니다.
  조상에 `transform`·`filter`·`opacity`·`contain`이 있으면 새 맥락이 생겨 층이 뒤집힙니다.
  `z-index`를 넣을 때 그 조상들을 먼저 확인합니다.
- `sticky`나 `fixed`를 쓸 때는 기준 컨테이너를 주석 한 줄로 남깁니다.
  어느 조상이 스크롤 컨테이너인지는 선언에 안 보입니다.
  `fixed`는 `transform`이 걸린 조상 아래에서 뷰포트 기준을 잃고,
  `sticky`는 스크롤 조상이 `overflow: visible`이면 아무 일도 하지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/05-01-values-keep-layout-intent-explicit.md)을 읽습니다.
