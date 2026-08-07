# Declare Meaningful Numbers Instead of Writing Them Inline

**Impact: MEDIUM (숫자가 무엇을 뜻하는지 이름이 말하고 바꿀 때 고칠 자리가 한 곳입니다)**

뜻이 있는 숫자는 쓰는 자리에 적지 않고 설정에 선언한 이름을 가리킵니다.
`attempts > 42`가 아니라 `attempts > config.retry.maxAttempts`입니다.

어디에 선언할지는 `naming-centralize-shared-config-namespaces`가 정합니다.
두 소유자 이상이 쓰면 `shared/config.ts`, 하나만 쓰면 그 소유자의 `config` 폴더입니다.

**같은 파일에 지역 `const`로 옮기는 것으로는 끝나지 않습니다.**
`functions-name-a-value-only-for-recompute-or-judgment`가 지역 변수를 만들 자리를 따로 정하고,
숫자를 옮기는 것은 그 둘 중 어디에도 없습니다.
갈 곳은 지역 변수가 아니라 설정입니다.

**뜻이 없는 숫자는 그대로 적습니다.**
아래는 이름을 붙여도 읽는 사람이 얻는 것이 없습니다.

| 그대로 적는 것 | 예 |
| --- | --- |
| 관용값 | `0`, `1`, `2`, `10`, `24`, `60` |
| 배열 인덱스 | `rows[0]`, `parts[1]` |
| 선언의 초기값 | `let count = 0` |
| 설정 객체 자신의 값 | `{maxAttempts: 42}` |

기본 매개변수와 `??`·`||` 오른쪽은 이 규칙이 아니라
`absence-expose-optional-values-instead-of-silent-fallbacks`가 봅니다.
없는 값을 다루는 자리라 판정이 다릅니다.

`tooling-configure-biome-to-enforce-these-rules` 규칙이 `style/noMagicNumbers`로 이 선을 강제합니다.
위 표가 그 규칙이 무시하는 목록과 같은 선입니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-values-declare-meaningful-numbers.md)을 읽습니다.
