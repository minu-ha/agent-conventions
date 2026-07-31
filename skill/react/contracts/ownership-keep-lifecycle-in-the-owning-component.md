# Keep Library Lifecycle in the Owning Component

**Impact: HIGH (파일 길이를 줄이려고 lifecycle을 hook 뒤로 숨겨 실행 흐름이 사라지는 것을 막습니다)**

외부 library의 instance 생성, resize, 이벤트 구독, dispose는 그 subtree를 소유한 component가 직접 가집니다.
파일이 길어졌다는 이유만으로 custom hook을 만들어 lifecycle을 숨기지 않습니다.

- 한 owner만 쓰는 lifecycle은 그 component 안의 effect로 둡니다.
- LOC 감소는 추출 근거가 아닙니다. 읽는 사람이 파일을 왕복하게 만들 뿐입니다.
- 여러 owner가 같은 lifecycle 계약을 실제로 호출할 때만 hook으로 올립니다.
- 파일이 길면 lifecycle을 옮기기보다 도메인 계산을 `function`으로 분리합니다.

`ownership-prefer-plain-ts-for-local-react-helpers`는 순수 계산을 hook으로 포장하는 것을 막고,
이 규칙은 반대로 실제 lifecycle이 있어도 분량 때문에 hook으로 옮기는 것을 막습니다.

> 예시·예외가 필요하면 [full rule](../rules/01-08-ownership-keep-lifecycle-in-the-owning-component.md)을 읽습니다.
