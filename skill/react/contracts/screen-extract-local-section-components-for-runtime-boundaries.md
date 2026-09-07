# Extract Local Section Components Only for Runtime Boundaries

**Impact: MEDIUM-HIGH (화면 흐름을 유지하면서 자체 책임이 있는 섹션만 분리합니다)**

라우트 진입의 지역 컴포넌트는 아래 책임 중 하나를 **직접 소유할 때만** 추출합니다.
단순 래퍼·`className` 묶음·들여쓰기 감소는 추출 근거가 아닙니다.

| 책임 | 예 |
| --- | --- |
| 비동기 | `Suspense`·스켈레톤·로딩·오류·빈 상태 |
| 상태와 프로바이더 | 지역 상태·이펙트 동기화·폼 프로바이더·컨텍스트·범위를 좁힌 스토어 |
| 상호작용 | 팝오버·모달·선택·인라인 편집·드래그·펼치는 트리 |
| 라이브러리와 성능 | 외부 위젯 생명주기 어댑터·가상 스크롤·전환·지연 값 |

화면 흐름 제어는 `screen-keep-route-flow-visible`에 따라 라우트 진입에 남깁니다.
추출한 파일의 배치는 `ownership-place-owner-files-in-role-folders`를 따릅니다.
진입 파일의 JSX에 나타나지 않는 섹션을 다른 섹션 파일 안에서 렌더하면 과하게 나눈 것입니다.

> 예시·예외가 필요하면 [full rule](../rules/06-03-screen-extract-local-section-components-for-runtime-boundaries.md)을 읽습니다.
