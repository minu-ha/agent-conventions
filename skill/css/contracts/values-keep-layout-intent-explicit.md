# Keep Layout Intent Explicit

**Impact: MEDIUM-HIGH (DOM을 거슬러 올라가지 않고 sticky, fixed, 박스 책임을 파악합니다)**

레이아웃 의도는 클래스명과 선언만 보고 바로 읽혀야 합니다.
`position`, `width`, `height`를 억지로 고정하지 않고 부모와 자식의 레이아웃 책임을 나눕니다.

- `z-index`에는 숫자를 직접 쓰지 않고 층 토큰을 씁니다. 토큰 이름이 곧 쌓임 순서 문서입니다.
- `sticky`나 `fixed`를 쓸 때는 기준 컨테이너를 주석 한 줄로 남깁니다. 어느 조상이 스크롤 컨테이너인지는 선언에 안 보입니다.

> 예시·예외가 필요하면 [full rule](../rules/05-01-values-keep-layout-intent-explicit.md)을 읽습니다.
