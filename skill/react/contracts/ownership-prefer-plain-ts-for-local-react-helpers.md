# Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우로 한정합니다)**

화면 하나에 종속된 계산, 정규화, payload 조립은 custom hook으로 포장하지 않습니다.
먼저 일반 `.ts` support module에 둡니다.

- 추출 위치는 owner 아래 `function` 폴더이고, 대표 exported 함수 하나당 파일 하나를 둡니다.
- screen-local custom hook은 state, context, 다른 hook 호출 순서를 실제로 캡슐화할 때만 허용합니다.
- lifecycle이 실제로 있어도 파일 분량을 줄이려는 추출은 허용하지 않습니다.
  그 판단은 `ownership-keep-lifecycle-in-the-owning-component`가 담당합니다.
- 단순 계산을 hook처럼 보이게 만드는 추상화는 피합니다.

> 예시·예외가 필요하면 [full rule](../rules/01-02-ownership-prefer-plain-ts-for-local-react-helpers.md)을 읽습니다.
