# Compose Classes With `clsx()`

**Impact: LOW (기본 클래스와 상태 수정자를 섞어도 TSX 조립이 한눈에 읽힙니다)**

TSX에서 `className`은 `clsx()`로 조립합니다.
`+`나 `join()`으로 클래스 목록을 이어 붙이지 않습니다.
삼항 연산자로 클래스를 고르지도 않습니다.

클래스가 하나일 때도 `clsx()`를 씁니다.
수정자가 하나 붙을 때 문자열 연결로 되돌아가지 않습니다.
`className` 형태가 파일마다 갈리지 않으므로 검색하고 리뷰할 때 한 패턴만 찾습니다.

`clsx()`에 넘기는 클래스 이름 안에 값을 끼워 넣을지는
`composition-derive-modifiers-from-values-only-on-a-closed-map` 규칙이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-01-composition-compose-classes-with-clsx.md)을 읽습니다.
