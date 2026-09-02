# Keep Library Lifecycle in the Owning Component

**Impact: MEDIUM (생명주기를 훅 뒤로 숨기지 않아 실행 흐름이 컴포넌트 안에 남습니다)**

외부 라이브러리의 인스턴스 생성, 크기 변경, 이벤트 구독, 정리는 그 하위 트리를 소유한 컴포넌트가 직접 가집니다.
파일이 길어졌다는 이유만으로 커스텀 훅을 만들어 생명주기를 숨기지 않습니다.

- 한 소유자만 쓰는 생명주기는 그 컴포넌트 안의 이펙트로 둡니다.
- 줄 수 감소는 추출 근거가 아닙니다.
  읽는 사람이 파일을 왕복하게 만들 뿐입니다.
- 여러 소유자가 같은 생명주기 계약을 실제로 호출할 때만 훅으로 올립니다.
- 파일이 길면 생명주기를 옮기기보다 도메인 계산을 `_function`으로 분리합니다.

`ownership-prefer-plain-ts-for-local-react-helpers`는 순수 계산을 훅으로 포장하는 것을 막고,
이 규칙은 반대로 실제 생명주기가 있어도 분량 때문에 훅으로 옮기는 것을 막습니다.

> 예시·예외가 필요하면 [full rule](../rules/01-06-ownership-keep-lifecycle-in-the-owning-component.md)을 읽습니다.
