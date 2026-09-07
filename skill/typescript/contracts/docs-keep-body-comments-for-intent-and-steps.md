# Keep Body Comments for Intent and Steps

**Impact: MEDIUM (코드를 옮겨 적은 주석은 막고 읽는 데 필요한 설명은 남깁니다)**

함수 본문에서 코드의 의도나 절차 단계를 설명할 때는 블록 주석 대신 `//`를 씁니다.
도메인 규칙, 예외 방지, 외부 API 제약, 부수효과 순서, 긴 절차의 단계 구분에 사용합니다.

| 위치 | 주석 형태 |
| --- | --- |
| 코드 한 줄·절차 단계 | `//`. 긴 흐름을 한 함수에 유지할 때도 단계 구분을 남깁니다 |
| `docs-require-header-jsdoc-on-key-declarations`가 정한 선언 | `docs-write-doc-comments-as-multiline-blocks`에 따른 문서 블록 |
| 그 밖의 지역 선언 | 별도 주석을 달지 않습니다. 필요한 줄의 의도만 `//`로 적습니다 |
| JSX 자식 | `//`를 쓸 수 없으므로 프레임워크 규칙을 따릅니다 |

내용은 `docs-write-concise-korean-comments-about-purpose-and-constraints`,
허용된 예외의 이유는 `docs-justify-convention-exceptions-with-a-reason-comment`가 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/06-01-docs-keep-body-comments-for-intent-and-steps.md)을 읽습니다.
