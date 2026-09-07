# Open ref Props Only for Real Imperative Contracts

**Impact: MEDIUM-HIGH (사용하지 않는 명령형 계약이 공용 컴포넌트에 늘어나는 것을 막습니다)**

`ref`는 사용처가 포커스·스크롤·측정 등을 직접 제어해야 할 때만 엽니다.
현재 사용처가 없으면 미리 공개하지 않습니다.

| 조건 | 처리 |
| --- | --- |
| 리액트 19 이상만 지원함 | `forwardRef`로 감싸지 않고 `ref`를 일반 프롭으로 받습니다 |
| 리액트 18 이하도 지원함 | `forwardRef` 계약을 유지합니다. 지원 버전을 바꾸지 않고 일괄 전환하지 않습니다 |
| `useImperativeHandle`로 명령 메서드를 공개함 | 계약 이름을 `<Owner>Handle`로 짓습니다 |
| DOM 요소를 직접 가리킴 | 별도 `Handle` 타입을 만들지 않습니다 |
| 외부 패키지 타입 제약으로 래퍼가 필요함 | `typescript/docs-justify-convention-exceptions-with-a-reason-comment`에 따라 이유를 남깁니다 |

> 예시·예외가 필요하면 [full rule](../rules/05-04-composition-open-ref-props-only-for-imperative-contracts.md)을 읽습니다.
