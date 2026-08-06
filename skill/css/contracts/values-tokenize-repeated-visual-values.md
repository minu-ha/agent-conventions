# Use Global Tokens and Do Not Create Local Ones

**Impact: MEDIUM-HIGH (여러 파일이 쓰는 값은 전역 토큰으로 모으고 나머지는 선언 자리에 그대로 둡니다)**

판정 기준은 **파일 경계**입니다.

| 반복 범위 | 처리 |
| --- | --- |
| 여러 파일 | 전역 공통 토큰을 씁니다. 이름이 없으면 토큰 파일에 만들고 그 이름을 씁니다 |
| 한 파일 안 | 값을 그대로 둡니다 |

`z-index` 층과 움직임 지속 시간, 이징은 예외입니다. 한 파일에서 한 번만 써도 토큰입니다.
쌓임 순서와 움직임 리듬이 앱 전체에서 하나여야 하기 때문입니다.
층 목록은 `values-declare-stacking-layers-as-tokens` 규칙이 정합니다.
시간과 곡선 토큰은 `a11y-namespace-keyframes-and-respect-reduced-motion` 규칙이 정합니다.

**지역 변수는 만들지 않습니다.**
공통 토큰 목록에 없는 변수는 대체값이 필요해서 값이 결국 사용처에 남습니다.
읽는 사람은 선언을 한 번 더 찾아가야 하는데 바꿀 지점은 여전히 여러 곳이라 얻는 것이 없습니다.

예외는 실행 중에 계산해야만 아는 수치 하나입니다.
그때만 지역 변수를 하나 만들어 TSX에서 넘깁니다.
그 자리는 `composition-do-not-style-through-the-style-attribute` 규칙이 정합니다.

조상 상태를 자손에 전달할 때도 변수를 쓰지 않고 결합자 하나로 자손을 겨냥합니다.
결합자를 쓸 범위는 `ownership-use-foreign-classes-only-under-your-own-root` 규칙이 정합니다.

선택자 쪽에서 같은 판단을 하는 규칙이 `selector-do-not-group-classes-with-commas`입니다.
여러 클래스를 `,`로 묶어 공통 선언을 빼지 않고 각 클래스에 중복으로 씁니다.

> 예시·예외가 필요하면 [full rule](../rules/05-02-values-tokenize-repeated-visual-values.md)을 읽습니다.
