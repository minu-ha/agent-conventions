# Compose Classes With `clsx()`

**Impact: LOW (기본 클래스와 상태 수정자의 조합을 TSX에서 한눈에 읽을 수 있습니다)**

TSX의 `className`은 클래스가 하나여도 `clsx()`로 조합합니다.
인자는 **기본 클래스 → 수정자 → 받은 `className`** 순서로 적습니다.

`+`, `join()`, 삼항 연산자로 클래스를 조합하거나 고르지 않습니다.
형식을 통일하면 검색과 리뷰에서 한 패턴만 확인하면 됩니다.
클래스 이름에 값을 끼워 넣지 않는 규칙은 `composition-write-modifiers-as-conditions`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-01-composition-compose-classes-with-clsx.md)을 읽습니다.
