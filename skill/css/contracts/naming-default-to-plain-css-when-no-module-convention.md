# Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Impact: HIGH (클래스명이 전역에서 고유해야 scope_slug로 소유자를 되짚을 수 있습니다)**

이 CSS skill은 plain `*.css`와 전역에서 고유한 클래스명을 전제로 씁니다.
`pg_*`, `wg_*`, `ui_*` 네임스페이스가 있는 이유는 전역 클래스 공간에서 소유자를 되짚기 위해서입니다.
그래서 프로젝트에 별도 합의가 없으면 `.module.css`나 `styles.foo`로 시작하지 않습니다.
프로젝트가 이미 CSS Modules를 공식 표준으로 채택했고 그에 맞는 naming/runtime 규칙이 따로 있다면,
그 프로젝트 로컬 규칙이 이 기본값보다 우선합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-01-naming-default-to-plain-css-when-no-module-convention.md)을 읽습니다.
