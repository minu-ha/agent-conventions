# Use Named Handlers Instead of Hiding Logic in JSX

**Impact: HIGH (부수효과, 분기, 비동기 흐름을 일반 코드 흐름에서 읽습니다)**

JSX에서는 명명된 핸들러 참조를 기본으로 하고, 아주 짧은 단순 위임만 인라인 함수로 허용합니다.
분기, 비동기 호출, 여러 부수효과가 들어가면 반드시 핸들러로 분리합니다.

**Requires selected:** `docs-require-jsdoc-on-key-declarations`, `events-name-and-curry-handlers` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/04-03-composition-named-handlers-over-inline.md)을 읽습니다.
