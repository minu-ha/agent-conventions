# Open ref Props Only for Real Imperative Contracts

**Impact: MEDIUM-HIGH (쓰지도 않는 명령형 창구가 공용 컴포넌트마다 하나씩 늘어나는 것을 막습니다)**

`ref`는 밖에서 실제로 제어해야 하는 공개 명령형 계약입니다.
포커스, 스크롤, 측정처럼 호출부가 직접 다뤄야 하는 일이 있을 때만 엽니다.

- 지금 쓰는 호출부가 없으면 열지 않습니다.
  나중에 필요해지면 그때 엽니다.
- 열 때는 `ref`를 일반 프롭처럼 직접 받습니다.
  감싸는 래퍼를 새로 만들지 않습니다.
- 외부 패키지 타입 제약 때문에 래퍼가 필요하면 그 이유를 바로 위에 한국어 주석으로 남깁니다.

> 예시·예외가 필요하면 [full rule](../rules/04-04-composition-open-ref-props-only-for-imperative-contracts.md)을 읽습니다.
