# Replace `enum` With `as const` Objects

**Impact: MEDIUM-HIGH (enum 특유의 동작을 들이지 않고 런타임 값을 명시적으로, 타입 추출을 가볍게 유지함)**

`enum` 대신 객체 리터럴과 `as const`를 사용합니다.
이렇게 하면 런타임 값과 타입 추론을 함께 유지하면서도 enum 고유 문법과 번들 영향을 피할 수 있습니다.

**Requires selected:** `naming-use-consistent-file-and-symbol-naming`, `types-document-custom-types-and-shapes` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/functions-replace-enum-with-as-const-objects.md)을 읽습니다.
