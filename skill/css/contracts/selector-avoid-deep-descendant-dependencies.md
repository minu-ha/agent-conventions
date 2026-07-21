# Avoid Deep Descendant Selector Dependencies

**Impact: HIGH (keeps layout changes from breaking styling through long descendant chains)**

깊은 후손 선택자 체인에 스타일을 걸지 않습니다. 이 규칙은 nested 문법 사용 여부와 무관하게, selector가 DOM 구조에 과도하게 묶이는 것을 금지합니다. project-owned 스타일은 클래스 자체가 계약이 되어야 하며, `.a .b .c .d` 같은 의존성은 DOM 구조가 조금만 바뀌어도 쉽게 깨집니다. owned root 아래의 third-party DOM path는 `selector-target-third-party-dom-from-owned-roots`가 다루는 예외이며, 그 경우에도 shortest viable chain만 허용합니다.

> 예시·예외가 필요할 때만 [full rule](../rules/selector-avoid-deep-descendant-dependencies.md)을 추가로 읽고 fallback 사유를 기록합니다.
