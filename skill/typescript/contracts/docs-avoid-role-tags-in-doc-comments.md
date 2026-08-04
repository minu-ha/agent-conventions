# Avoid Role Tags in Doc Comments

**Impact: MEDIUM (선언의 성격을 태그로 두 번 적지 않아 태그가 어긋날 일이 없습니다)**

선언이 무엇인지는 이름 규칙과 문법이 이미 드러냅니다.
그것을 태그로 다시 적지 않습니다.

- `@api`, `@helper`, `@summary`, `@field` 같은 역할 태그를 붙이지 않습니다.
- `@schema`처럼 새 태그를 만들지 않습니다.
- `@deprecated`, `@example`, `@param`, `@returns`처럼 TSDoc 규격에 있는 태그만 필요할 때 씁니다.

역할 태그는 선언이 바뀌어도 함께 바뀌지 않아 시간이 지나면 어긋납니다.

> 예시·예외가 필요하면 [full rule](../rules/05-05-docs-avoid-role-tags-in-doc-comments.md)을 읽습니다.
