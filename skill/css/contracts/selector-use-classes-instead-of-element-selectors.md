# Use Classes Instead of Element Selectors

**Impact: MEDIUM (태그만 바꿔도 스타일이 사라지므로 우리가 렌더하는 마크업에는 클래스를 붙입니다)**

우리가 렌더하는 마크업에는 요소 선택자를 쓰지 않습니다. 클래스를 붙입니다.

`div`를 `section`으로, `span`을 `p`로 바꾸는 것만으로 스타일이 사라집니다.
그 변경은 TSX에서 일어나고 CSS 파일에는 흔적이 남지 않습니다.

요소 선택자를 쓸 수 있는 경우는 하나입니다.

> **우리가 그 마크업을 쓰지 않아서 클래스를 붙일 수 없을 때**

`dangerouslySetInnerHTML`, Markdown 렌더러, 리치 텍스트 에디터 출력이 여기 해당합니다.
TSX에서 그 지점이 보이므로 "이게 원본 HTML인가"를 따질 필요가 없습니다.

- 그때도 감싼 클래스 블록 안에서만 씁니다. 블록 바깥에 `h2 { }`를 두면 그 화면 모든 `h2`에 걸립니다.
- `:first-child` 같은 구조 선택자도 같습니다. 우리가 렌더하면 클래스를 붙입니다.

`selector-disallowed-list`가 중첩 안 요소 선택자를 막습니다.
그래서 이 예외를 쓸 때는 `stylelint-disable-next-line` 주석이 필요합니다.
드문 경우이므로 그 주석이 곧 "여기는 우리가 쓰지 않는 마크업"이라는 표시가 됩니다.

> 예시·예외가 필요하면 [full rule](../rules/04-02-selector-use-classes-instead-of-element-selectors.md)을 읽습니다.
