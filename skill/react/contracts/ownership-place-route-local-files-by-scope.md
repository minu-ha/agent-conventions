# Place Route-local Files by Visual Scope

**Impact: HIGH (route 전용 component, style, logic를 예측 가능한 위치에 유지함)**

화면 전용 컴포넌트와 스타일은 `-local/`에 두고, 비컴포넌트 로직은 라우트와 같은 계층의 `.ts` 파일에 둡니다. 같은 계층 `.ts` 파일에는 JSX를 직접 넣지 않고, 필요하면 렌더링 콜백을 주입합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/ownership-place-route-local-files-by-scope.md)을 추가로 읽고 fallback 사유를 기록합니다.
