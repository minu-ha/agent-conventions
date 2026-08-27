# Write Modifiers as Conditions Instead of Assembling Class Names

**Impact: MEDIUM-HIGH (클래스 이름이 코드에 문자열로 남아 CSS와 사용처를 한 번의 검색으로 함께 고칩니다)**

수정자는 조건으로 적습니다.
클래스 이름을 값으로 조립하지 않습니다.

| 이렇게 적습니다 | 이렇게 적지 않습니다 |
| --- | --- |
| `tone === "positive" && "pg_salesPanel__metricValue--positive"` | `` `pg_salesPanel__metricValue--${tone}` `` |

조립하면 그 클래스 이름이 코드에 남지 않습니다.
CSS에서 수정자를 지울 때 그 클래스를 쓰는 자리가 검색에 걸리지 않습니다.

값이 여럿이면 값마다 한 줄씩 나열합니다.
줄 몇 개를 더 쓰는 것이 클래스 이름을 잃는 것보다 낫습니다.
같은 값으로 요소 여러 개에 수정자를 붙일 때도 요소마다 나열합니다.

나열에는 CSS에 있는 수정자만 적습니다.
값이 다섯인데 CSS에 수정자가 둘뿐이면 그 둘만 적습니다.
나머지 값은 기본 모습으로 남습니다.

`ButtonProps["variant"]`처럼 라이브러리 타입을 그대로 받는 값으로는 수정자를 만들지 않습니다.
라이브러리가 값을 더하면 우리 나열에는 그 값이 없어서 클래스가 붙지 않습니다.
그 값이 만드는 모습은 라이브러리에 맡기고, 우리 모습이 필요하면 우리 어휘로 만든 프롭을 따로 받습니다.

수정자를 붙일 자격은 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 정합니다.
여기서는 붙이기로 정한 수정자를 어떤 형태로 적을지만 봅니다.

> 예시·예외가 필요하면 [full rule](../rules/03-07-composition-write-modifiers-as-conditions.md)을 읽습니다.
