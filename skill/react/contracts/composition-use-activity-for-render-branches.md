# Use Visibility Primitives Deliberately for Show and Hide Branches

**Impact: MEDIUM (표시 여부를 정하는 방식이 화면 전반에서 일관되게 남습니다)**

리액트 19의 `<Activity />` 또는 프로젝트가 이미 채택한 동등한 표시 방식은
이미 마운트된 하위 트리를 보여주거나 숨기는 의도일 때만 씁니다.

삼항 렌더링과 표시 방식은 같은 의미가 아닙니다.
삼항은 분기를 아예 해제하지만, 표시 방식은 숨겨진 하위 트리의 상태와 이펙트를 유지합니다.

- 마운트와 해제 자체가 의미를 가지면 기존 조건부 렌더링을 유지합니다.
- 코드베이스에 `Activity`가 아직 없으면 이 규칙 때문에 새 추상화를 들이지 말고 기존 패턴을 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/04-06-composition-use-activity-for-render-branches.md)을 읽습니다.
