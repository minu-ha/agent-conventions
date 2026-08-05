# Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (리액트 전용 추상을 실제 생명주기나 문맥이 얽힌 자리로만 한정합니다)**

순수 계산은 훅으로 감싸지 않고 일반 `.ts` 파일의 함수로 둡니다.
화면 하나에 종속된 계산, 정규화, 전송 값 조립이 모두 여기 해당합니다.

- 이 규칙은 훅으로 감쌀지만 판정합니다.
  그 함수를 아예 밖으로 뺄지는 `typescript/functions-extract-helpers-only-when-the-boundary-is-real`이,
  뺀 결과를 어디 둘지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
- 화면 지역 커스텀 훅은 상태, 컨텍스트, 다른 훅 호출 순서를 실제로 캡슐화할 때만 허용합니다.
- 보조 모듈의 내보내기와 가져오기 형태는 `typescript/naming-use-direct-imports-and-public-entry-points`가 정합니다.
- 생명주기가 실제로 있어도 파일 분량을 줄이려는 추출은 허용하지 않습니다.
  그 판단은 `ownership-keep-lifecycle-in-the-owning-component`가 담당합니다.
- 단순 계산을 훅처럼 보이게 만드는 추상화는 피합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-05-ownership-prefer-plain-ts-for-local-react-helpers.md)을 읽습니다.
