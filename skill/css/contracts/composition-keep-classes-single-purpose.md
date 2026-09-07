# Keep Classes Single-purpose

**Impact: MEDIUM-HIGH (기본 스타일과 상태를 분리해 상태만 켜고 끌 수 있습니다)**

기본 스타일과 상태는 기본 클래스와 `--수정자`로 나눕니다.
`listButtonActive`처럼 상태를 기본 이름에 넣으면 기본 스타일만 재사용하거나 상태만 끌 수 없습니다.

수정자로 표현할 수 있는 상태인지는 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 판단합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-03-composition-keep-classes-single-purpose.md)을 읽습니다.
