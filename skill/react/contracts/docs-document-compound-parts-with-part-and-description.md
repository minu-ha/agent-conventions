# Document Compound Parts with @part and @description

**Impact: MEDIUM (keeps compound public parts scannable as one named boundary instead of disconnected props and component declarations)**

compound component가 public part를 노출하면 part 단위로 문서화합니다.

작성 방식:

- props `interface` 바로 위에 `@part`와 `@description`을 둡니다.
- component 선언은 그 `interface` 바로 아래에 둡니다.
- part field는 `@field`, part 내부 handler는 `@event`로 설명합니다.
- 단순 내부 wrapper에는 public part 문서를 만들지 않습니다.

**Requires selected:** `docs-require-jsdoc-on-key-declarations` · N/A 불가

> 예시·예외가 필요할 때만 [full rule](../rules/docs-document-compound-parts-with-part-and-description.md)을 추가로 읽고 fallback 사유를 기록합니다.
