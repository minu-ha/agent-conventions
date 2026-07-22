# Review routing fixed-point discovery

HEAD `074278730c1b3fcd6896a1c47bd091e9df5e27d1`에서 full handbook에 `Review with`를 렌더하고 R06/T18 경계를 좁힌 뒤 실행한 RTE12 smoke 원본이다. 두 실행 모두 스키마와 격리는 통과했지만 oracle과 일치하지 않아 최종 matrix에서 제외한다.

- t1은 React exact partition에는 성공했지만 TypeScript T19/T21을 N/A로 두었다.
- t2는 TypeScript T19/T21을 N/A로 두고 React R20을 추가 선택했다.
- 두 응답 모두 "한국어 `@api` JSDoc을 유지하거나 추가한다"고 썼기 때문에 T19/T21 N/A 근거와 응답이 서로 모순된다. `reviewWith` 표시만으로는 rule-induced JSDoc 변경을 scope evidence에 다시 넣는 fixed-point 재평가가 충분히 강제되지 않았다.
- R20은 별도 function/support module 추출 규칙이지만 `통합·재배치` 문구가 기존 query `select` 안으로 shaping을 모으는 R33 작업까지 겹쳐 읽혔다.

다음 수정은 T18이 요구한 JSDoc 때문에 T19/T21이 실제 적용된다는 normative closure와 fixed-point rescan을 명시하고, R20에서 query `select` 내부 shaping-only 변경을 제외한다. Oracle 배열은 변경하지 않는다.
