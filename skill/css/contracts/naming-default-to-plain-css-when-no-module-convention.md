# Default to Plain CSS Unless the Project Explicitly Standardizes on CSS Modules

**Impact: MEDIUM-HIGH (클래스명이 전역에서 고유해야 범위_식별자로 소유자를 되짚을 수 있습니다)**

이 CSS 스킬 전체가 일반 `*.css`와 전역에서 고유한 클래스명을 전제로 합니다.
클래스 문법, 소유 경계, 선택자 규칙이 모두 이 전제 위에 서 있습니다.
`pg_*`·`wg_*`·`ui_*` 네임스페이스는 전역 클래스 공간에서 소유자를 되짚으려고 둡니다.

| 프로젝트 상태 | 스타일시트 방식 |
| --- | --- |
| 별도 합의가 없음 | 일반 CSS. `.module.css`를 새로 만들지 않고 클래스를 `styles.foo`처럼 객체 속성으로 참조하지 않습니다 |
| CSS Modules가 공식 표준이고 그에 맞는 이름 규칙과 실행 규칙이 따로 있음 | 그 프로젝트 규칙이 이 기본값보다 앞섭니다 |

> 예시·예외가 필요하면 [full rule](../rules/01-01-naming-default-to-plain-css-when-no-module-convention.md)을 읽습니다.
