# Keep Layout Intent Explicit

**Impact: MEDIUM (DOM을 거슬러 올라가지 않고 sticky, fixed, 박스 책임을 파악합니다)**

레이아웃 의도는 클래스명과 선언만 보고 바로 읽혀야 합니다.
크기를 어디까지 고정할지는 `layout-reach-for-intrinsic-sizing-before-breakpoints` 규칙이 정합니다.

- `z-index`에는 숫자를 직접 쓰지 않고 층 토큰을 씁니다.
  토큰 이름이 곧 쌓임 순서 문서입니다.
  층 목록과 쌓임 맥락 조건은 `values-declare-stacking-layers-as-tokens` 규칙이 정합니다.
- `sticky`나 `fixed`를 쓸 때는 기준 컨테이너를 주석 한 줄로 남깁니다.
  어느 조상이 스크롤 컨테이너인지는 선언에 안 보입니다.
  `fixed`는 `transform`이 걸린 조상 아래에서 뷰포트 기준을 잃고,
  `sticky`는 스크롤 조상이 `overflow: visible`이면 아무 일도 하지 않습니다.
- 로딩 대체 화면은 실제 내용과 같은 컨테이너 클래스 안에 넣습니다.
  높이를 대체 화면에만 따로 적으면 실제 내용이 들어올 때 그 값이 남아 레이아웃이 튑니다.

> 예시·예외가 필요하면 [full rule](../rules/06-02-layout-keep-layout-intent-explicit.md)을 읽습니다.
