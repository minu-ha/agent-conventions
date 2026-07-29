# Use Visibility Primitives Deliberately for Show and Hide Branches

**Impact: MEDIUM (표시 여부 결정을 route 화면 전반에서 명시적이고 일관되게 유지함)**

React 19의 `<Activity />` 또는 프로젝트가 이미 채택한 동등한 visibility primitive가 있다면,
이미 마운트된 subtree를 보여주거나 숨기는 의도일 때만 사용합니다.
삼항 렌더링과 visibility primitive는 같은 의미가 아닙니다.
전자는 branch를 아예 unmount할 수 있지만, 후자는 숨겨진 subtree의 state와 effect를 유지할 수 있습니다.
mount/unmount 의미가 중요하면 기존 조건부 렌더링을 유지하고,
코드베이스에 `Activity`가 아직 없다면 이 규칙 때문에 새 추상화를 도입하지 말고 기존 패턴을 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/composition-use-activity-for-render-branches.md)을 읽습니다.
