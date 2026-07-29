# Do Not Create Screen-local Custom Hooks for Pure Logic

**Impact: HIGH (React 전용 추상화를 실제 lifecycle/context 결합이 있는 경우에만 사용하게 함)**

화면 하나에 종속된 계산, 정규화, payload 조립은 custom hook으로 포장하지 말고 먼저 일반 `.ts` support module에 둡니다.
route entry 화면이라면 기본 추출 위치는 같은 계층의 `page.ts`이고, screen-owned pure function은 named export를 직접 import해 사용합니다.
screen-local custom hook은 lifecycle, context, 다른 hook 호출 순서 같은 React orchestration을 실제로 캡슐화할 때만 허용합니다.
단순 계산을 hook처럼 보이게 만드는 추상화는 피합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/ownership-prefer-plain-ts-for-local-react-helpers.md)을 추가로 읽고 fallback 사유를 기록합니다.
