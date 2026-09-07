# Write Modifiers as Conditions Instead of Assembling Class Names

**Impact: MEDIUM-HIGH (클래스 이름이 코드에 문자열로 남아 CSS와 사용처를 한 번의 검색으로 함께 고칩니다)**

수정자는 조건과 완성된 클래스 문자열로 적습니다.
값을 끼워 이름을 조립하면 CSS와 사용처를 같은 문자열로 검색할 수 없습니다.

| 상황 | 작성 방법 |
| --- | --- |
| 값 하나에 수정자를 붙임 | `tone === "positive" && "pg_salesPanel__metricValue--positive"`처럼 씁니다. 템플릿 리터럴로 이름을 조립하지 않습니다 |
| 값이 여럿임 | 값마다 한 줄씩 적습니다. 여러 요소에 같은 값을 적용해도 요소마다 나열합니다 |
| 일부 값에만 CSS 수정자가 있음 | 해당 값만 나열하고 나머지는 기본 모습으로 둡니다. 값이 다섯이고 수정자가 둘이면 둘만 적습니다 |
| `ButtonProps["variant"]`처럼 라이브러리 타입을 그대로 받음 | 수정자를 만들지 않고 라이브러리에 넘깁니다. 라이브러리가 추가한 값을 우리 목록이 놓칠 수 있습니다 |
| 라이브러리와 별개인 우리 모습이 필요함 | 우리 어휘로 정의한 프롭을 따로 받습니다 |

수정자를 붙일 수 있는지는 `composition-do-not-build-structural-variants-with-modifiers` 규칙이 판단합니다.
이 규칙은 허용한 수정자의 작성 형식을 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/03-07-composition-write-modifiers-as-conditions.md)을 읽습니다.
