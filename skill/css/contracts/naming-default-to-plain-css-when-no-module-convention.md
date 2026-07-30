# Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Impact: HIGH (소유를 local module 간접층에 숨기지 않고 전역 scope_slug 이름 체계가 의미를 유지하게 함)**

이 CSS skill은 기본적으로 plain `*.css`와 전역 고유 클래스명을 전제로 합니다.
`rt_*`, `ui_*`, `wg_*`, `loc_*` 네임스페이스는 global class space에서 owner를 추적하려고 존재하므로,
프로젝트에 별도 합의가 없다면 `.module.css`와 `styles.foo`를 기본 선택으로 삼지 않습니다.
프로젝트가 이미 CSS Modules를 공식 표준으로 채택했고 그에 맞는 naming/runtime 규칙이 따로 있다면,
그 프로젝트 로컬 규칙이 이 기본값보다 우선합니다.

이 규칙은 stylesheet 접근 형식을 새로 결정하거나 전환할 때 선택합니다.
이미 plain CSS를 직접 import하는 owner 안에서 기존 plain CSS class·selector 이름이나 base/modifier 구조만 바꾸는 작업은
접근 형식을 결정하지 않으므로 N/A입니다.

> 예시·예외가 필요하면 [full rule](../rules/naming-default-to-plain-css-when-no-module-convention.md)을 읽습니다.
