# Compose Classes With `clsx()`

**Impact: HIGH (기본 클래스와 상태 수정자를 섞어도 TSX 조립이 한눈에 읽힙니다)**

TSX에서 `className`은 `clsx()`로 조립합니다.
문자열을 이어 붙이거나 삼항 연산자를 겹쳐 쓰지 않습니다.

클래스가 하나일 때도 `clsx()`를 씁니다.
수정자가 붙는 순간 문자열 연결로 되돌아가는 diff를 막습니다.
그리고 `className` 형태가 파일마다 갈리지 않아서 grep과 리뷰가 한 패턴만 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/03-01-composition-compose-classes-with-clsx.md)을 읽습니다.
