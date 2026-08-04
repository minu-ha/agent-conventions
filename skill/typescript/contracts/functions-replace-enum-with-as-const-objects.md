# Replace `enum` With `as const` Objects

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 실행 값을 드러내며 타입 추출도 가볍게 둡니다)**

`enum` 대신 객체와 `as const`를 씁니다.
그러면 실행 값과 타입 추론을 함께 두면서 `enum` 고유 문법과 번들 부담을 피합니다.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/03-08-functions-replace-enum-with-as-const-objects.md)을 읽습니다.
