# Keep Classes Single-purpose

**Impact: MEDIUM-HIGH (클래스 하나가 기본 스타일과 상태 의미를 함께 담으면 상태를 끌 방법이 없습니다)**

기본 스타일과 상태를 한 클래스에 섞지 않습니다.
상태를 이름에 녹이지 않고 기본 클래스와 `--수정자`로 나눕니다.

`listButtonActive`처럼 상태를 이름에 녹이면 기본만 필요한 곳에서 재사용할 수 없고 상태를 끄는 방법도 없습니다.
기본 클래스와 `--수정자`를 따로 두면 둘 다 해결됩니다.

수정자가 상태를 표현할 자격이 있는지는
`composition-do-not-build-structural-variants-with-modifiers` 규칙이 판정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-03-composition-keep-classes-single-purpose.md)을 읽습니다.
