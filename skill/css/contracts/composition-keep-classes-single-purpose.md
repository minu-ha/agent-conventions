# Keep Classes Single-purpose

**Impact: HIGH (클래스 하나가 base 스타일과 여러 상태·구조 의미를 동시에 지는 것을 막습니다)**

하나의 클래스는 하나의 시각적 책임만 가져야 합니다.
base 스타일과 state를 클래스 이름 하나에 융합하지 않고, 한 클래스를 독립된 여러 시각 책임에 재사용하지 않습니다.

`listButtonActive`처럼 상태를 이름에 녹이면 base만 필요한 곳에서 재사용할 수 없고 상태를 끄는 방법도 없습니다.
base 클래스와 `--modifier`를 따로 두면 둘 다 해결됩니다.

modifier가 상태를 표현할 자격이 있는지는 `composition-do-not-build-structural-variants-with-modifiers`가 판정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-03-composition-keep-classes-single-purpose.md)을 읽습니다.
