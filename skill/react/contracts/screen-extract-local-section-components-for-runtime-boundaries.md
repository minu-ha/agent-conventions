# Extract Local Section Components Only for Runtime Boundaries

**Impact: MEDIUM-HIGH (화면 흐름은 보이게 두고 자기 것을 직접 가진 부분만 떼어 냅니다)**

라우트 진입의 지역 컴포넌트는 그 조각이 **직접 소유하는 것이 있을 때만** 추출합니다.
감싸기만 하는 래퍼, `className` 묶기, 들여쓰기 감소만으로는 추출하지 않습니다.

떼어 낼 수 있는 경우는 그 섹션이 다음 중 하나를 직접 가질 때입니다.

- 비동기: `Suspense`, 스켈레톤, 로딩, 오류, 빈 상태
- 상태, 프로바이더: 지역 상태, 이펙트 동기화, 폼 프로바이더, 컨텍스트, 범위를 좁힌 스토어
- 상호작용: 팝오버, 모달, 선택, 인라인 편집, 드래그, 펼치는 트리
- 라이브러리, 성능: 외부 위젯의 생명주기를 소유하는 어댑터, 가상 스크롤, 전환, 지연 값

흐름 제어는 섹션이 아니라 라우트 진입에 둡니다.
그 목록은 `screen-keep-route-flow-visible`이 정합니다.

지역 섹션 파일을 어느 폴더에 두는지는 `ownership-place-owner-files-in-role-folders`가 정합니다.
진입 파일의 JSX에 나타나지 않는 섹션이 다른 섹션 파일 안에서 렌더되면 과하게 쪼갠 것입니다.

> 예시·예외가 필요하면 [full rule](../rules/06-03-screen-extract-local-section-components-for-runtime-boundaries.md)을 읽습니다.
