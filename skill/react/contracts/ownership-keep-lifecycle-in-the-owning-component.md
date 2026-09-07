# Keep Library Lifecycle in the Owning Component

**Impact: MEDIUM (외부 라이브러리의 생명주기와 실행 흐름을 소유 컴포넌트에서 확인할 수 있습니다)**

외부 라이브러리의 인스턴스 생성·크기 변경·이벤트 구독·정리는 하위 트리를 소유한 컴포넌트에 둡니다.
파일 분량을 줄이려고 생명주기를 커스텀 훅으로 옮기지 않습니다.

| 상황 | 처리 |
| --- | --- |
| 한 소유자만 쓰는 생명주기 | 해당 컴포넌트의 이펙트에 둡니다 |
| 여러 소유자가 같은 생명주기 계약을 실제로 호출함 | 훅으로 추출합니다 |
| 파일이 길어짐 | 생명주기 대신 도메인 계산을 `_function`으로 분리합니다 |
| 이펙트 정리·재설치 | 정리할 때 인스턴스 참조를 비우고 다시 설치할 때 새로 만듭니다. 상태에 남은 폐기된 인스턴스를 재사용하지 않습니다 |

순수 계산을 훅으로 감싸는 문제는 `ownership-prefer-plain-ts-for-local-react-helpers`를 따릅니다.

> 예시·예외가 필요하면 [full rule](../rules/01-06-ownership-keep-lifecycle-in-the-owning-component.md)을 읽습니다.
