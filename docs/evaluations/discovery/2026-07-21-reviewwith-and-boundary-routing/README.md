# Full-handbook review routing discovery

HEAD `567377da933d65b030af88ab16b4693e109e5563`에 고정한 behavioral matrix에서 발견한 원본 실행을 보존한다. 이 폴더의 JSON은 실패를 정상화하거나 재채점하지 않은 discovery evidence이며 최종 matrix run 수에는 포함하지 않는다.

- `css-repeated-values-and-optional-token` t1은 oracle과 일치했지만 t2는 CSS-only owned-root 변경에서 C10 `composition-style-ui-components-through-owned-wrappers`를 추가 선택했다. C10의 실제 `Ui*` React wrapper/API 경계와 일반 `.ui_*` CSS owner root 경계가 본문에서 겹쳐 읽힌 것이 원인이다.
- `RTE12-query-shaping` t1은 React R06을 추가 선택하고 TypeScript T18, T19, T21을 누락했다. React R06 본문이 local binding까지 넓어져 적용 조건과 어긋났고, TypeScript T18은 named query/mutation binding을 명시하지 않았으며 generated full handbook은 `reviewWith`를 렌더링하지 않아 R42 -> T18/T19 -> T21 재평가 경로를 잃었다.

Oracle 배열은 유지한다. 규칙 경계와 generated handbook metadata를 RED 테스트부터 수정하고 새 committed HEAD에서 전체 fixed matrix를 fresh child로 다시 실행한다.
