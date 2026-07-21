# Prefer Owned Wrappers for `Ui*` Component Styling

**Impact: HIGH (prevents shared UI wrappers from exposing uncontrolled styling hooks through ad-hoc className injection)**

`Ui*` 컴포넌트(`UiCollapse`, `UiAvatar`, `UiButton` 등)의 내부 DOM을 꾸미기 위한 ad-hoc `className` 주입은 기본적으로 피합니다. 스타일링이 필요하면 화면이나 local 래퍼 클래스를 두고, 그 래퍼 아래에서만 서드파티 라이브러리 내부 DOM을 제한적으로 타겟팅합니다.\
다만 wrapper가 root `className`이나 slot prop을 공식 styling contract로 노출했다면, 레이아웃 참여나 spacing 같은 root-level 스타일에는 그 contract를 그대로 사용할 수 있습니다.

> 예시·예외가 필요할 때만 [full rule](../rules/composition-style-ui-components-through-owned-wrappers.md)을 추가로 읽고 fallback 사유를 기록합니다.
