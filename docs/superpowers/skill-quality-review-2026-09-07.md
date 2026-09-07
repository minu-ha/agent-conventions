# 컨벤션 스킬 품질 개선 결과

2026-09-07, `main`의 `fee3d5e`를 기준으로 CSS·React·TypeScript 정본 128개를 검토했다.
64개 규칙의 설명·예제·적용 조건을 수정했다. 규칙 ID와 섹션 구성은 유지했다.

| 스킬 | 전체 규칙 | 수정한 규칙 | 섹션 | 라우팅 시나리오 전 → 후 |
| --- | ---: | ---: | ---: | ---: |
| CSS | 34 | 18 | 8 | 19 → 27 |
| React | 52 | 25 | 13 | 18 → 24 |
| TypeScript | 42 | 21 | 7 | 15 → 23 |
| 합계 | 128 | 64 | 28 | 52 → 74 |

## 수정한 판단과 예제

| 영역 | 기존 문제 | 수정 |
| --- | --- | --- |
| CSS 래퍼 | 필수 `children`을 전달하지 않고 `items`는 사용하지 않음 | 전후 예제의 children과 스타일 전달 계약 일치 |
| CSS 상태 | DOM 상태를 앱이 알 수 없다고 설명, `:not()` 제거 후 hover 동작 변경 | 상태의 표현 수단으로 구분하고 상태별 결과 보존 |
| CSS 변수·쌓임 | `var()` 대체값을 미선언 때만 사용한다고 단정, 조상 맥락의 상대 순서 누락 | `initial`·순환 참조·등록 속성과 포털·최상위 레이어의 경계 보완 |
| CSS 반응형 | 좁은 슬롯에서 Grid 넘침, 미디어 조건 중첩 설명 오류 | 슬롯 이하로 줄어드는 최소 크기, 실제 조건의 포함 관계, 컨테이너 쿼리 판단 추가 |
| CSS 접근성 | 강제 색상 모드의 그림자 소실, 모션 감소의 지연 시간 누락 | 투명한 outline과 delay 초기화, WCAG 면적·두께 구분 |
| React 쿼리 | `refetch`가 해당 훅만 갱신한다고 설명 | 같은 키의 캐시 공유와 다른 관련 키의 무효화 구분 |
| React Suspense | 순차 쿼리에 `enabled` 권고, 재조회 오류가 항상 경계에 전달된다고 설명 | 순차 `useSuspenseQuery`, 캐시 유무에 따른 오류 처리와 재시도 연결 |
| React 생명주기 | Activity를 계속 마운트된 상태로 설명 | 상태·DOM 보존과 Effect 정리·재설치 구분 |
| React 성능 | memo를 정확성 보장 수단으로 설명, 초기화는 반드시 한 번이라고 단정 | 캐시 폐기를 견디는 구조, Effect 내부 계산, StrictMode·SSR 전제 명시 |
| React 타입 | 호환되는 문자열 축소에도 Omit을 요구, 실제 TableCell 충돌은 놓침 | Button color 정상 상속과 TableCell align의 Omit을 실제 타입으로 구분 |
| TypeScript 부분집합 | 선택 속성의 읽기 타입을 복사해 undefined 쓰기 허용 범위가 넓어짐 | `Required<원본>["필드"]`로 선택 필드의 쓰기 계약 보존 |
| TypeScript 입력 | `satisfies`·`as const`·JSON 파싱의 검증 범위가 불명확 | 정적 검사·런타임 형태 검증·객체 동결 구분, 확인 불가 MUI 예시 삭제 |
| TypeScript 조회·정렬 | Map의 복잡도 과장과 중복 키 처리 차이 누락, 동률 정렬 불완전 | 첫 항목 보존 조건과 고유 식별자 보조 정렬 키 명시 |
| TypeScript 값·날짜 | 숫자 상수화 예제가 값까지 변경, 날짜 전후 예제의 기간·형식 불일치 | 값 보존, 경과 시간·달력 날짜·표시 시간대 구분 |
| TypeScript 없음 | 키 생략과 undefined를 항상 같다고 설명, number만으로 유한성을 보장한다고 해석 가능 | 소비 계약 유지, 경계가 이미 검증한 조건만 중복 검사 금지 |

예제 정확성은 [React의 memo 계약](https://react.dev/reference/react/useMemo),
[TanStack Query의 캐시 공유](https://tanstack.com/query/latest/docs/framework/react/guides/caching),
[Suspense 제한](https://tanstack.com/query/latest/docs/framework/react/guides/suspense),
[TypeScript 선택 속성](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)을 대조했다.
CSS의 새 설명은 [MDN 강제 색상](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors),
[컨테이너 쿼리](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries),
[WCAG 포커스 면적](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)을 확인했다.
날짜는 [Day.js 유효성 검사](https://day.js.org/docs/en/parse/is-valid)와
[시간대 계약](https://day.js.org/docs/en/plugin/timezone)을 확인했다.

## 구조와 작성 체계

기존 섹션은 소유 경계·자료 흐름·타입·상태·성능처럼 서로 다른 판단을 이미 나누고 있었다.
이번 결함은 독립된 새 규칙 묶음보다 기존 설명의 잘못된 전제와 예제에서 나왔다.
강제 색상은 포커스 규칙에, 컨테이너 쿼리는 반응형 판단 규칙에 포함했다.
규칙을 분할하거나 합쳐 기존 ID와 참조를 바꾸는 작업은 필요하지 않았다.

세 템플릿에 전후 예제의 같은 입력·결과 계약과 흐름도 판단의 contract 보존을 명시했다.
기여 문서에는 분리·병합·섹션 추가의 판단 기준과 동작 검토 항목을 넣었다.
README의 순수 CSS 활성화 표, 핸드북 독자 설명, 뷰어 데이터 파일 안내를 실제 구조에 맞췄다.
React 라우터의 현재 구성에 없는 non-progressive companion 분기도 제거했다.

라우팅은 새 양성·비적용 사례 22개를 추가하고, 기존 시나리오의 과선택도 교정했다.
이름 붙인 일반 콜백에 커링 규칙을 무조건 적용하던 `requiresSelected`는 `reviewWith`로 바꿨다.
그대로 이동한 props, 단순 스타일 값 변경, 내부 `satisfies`, 사용자 새로 고침 등을 구분한다.

## 확인한 동작

| 재현 | 수정 전 | 수정 후 |
| --- | --- | --- |
| 180px 컨테이너의 Grid | scrollWidth 240px | 180px |
| 강제 색상 포커스 | outline·shadow 모두 없음 | solid outline 표시 |
| 모션 감소 설정 | delay 4초 | delay 0초 |
| 선택 속성 파생, strict·exactOptionalPropertyTypes | 원본 재대입에서 TS2375 | 컴파일 성공 |
| 중복 키의 find → Map | 첫 항목에서 마지막 항목으로 변경 | uniqBy 이후 첫 항목 보존 |
| 같은 updatedAt의 정렬 | 입력 순서에 따라 결과 변동 | id 보조 키로 같은 결과 |
| 날짜 파서 | 고정 형식의 유효·무효 입력 확인 필요 | 실제 문서 파서로 6개 입력 확인 |
| 48시간 경과 계산 | DST에서 달력 날짜 덧셈으로 바꾸면 계약이 달라질 수 있음 | UTC·New York·Seoul에서 경과 시간 보존 |
| 동일 키 쿼리 관찰자 2개 | 원문은 한 훅만 갱신된다고 설명 | 실제 refetch 결과를 둘 다 수신, 다른 summary 키는 유지 |
| React DOM 래퍼 | 설명과 실제 상속 가능 여부 불일치 | 원문 Correct 3개를 실제 React/MUI 타입으로 strict 컴파일 |

TypeScript 검증은 7.0.2를 사용했다.
React 쿼리 검증은 로컬에 설치된 React 19.2.3·React Query 5.96.1을 읽어 실행했고 그 프로젝트 파일은 수정하지 않았다.
브라우저 재현은 별도 임시 페이지에서 수정한 정본의 CSS를 사용했다.

## 최종 검증과 한계

다음 검사를 모두 통과했다.

- `validate -- --all` → `build -- --all` → `check:generated:all`
- `viewer` → `check:handbooks:all` → `check:viewer`
- `typecheck`, `biome:check:all`(30파일), `git diff --check`
- 기존 회귀 테스트 152개 통과, 실패 0개
- 규칙별 적용 시나리오 포함: CSS 34/34, React 52/52, TypeScript 42/42

독립 검토자가 새 문서만 읽고 TypeScript 4개·React 4개 요청을 적용해 핵심 구현 판단을 확인했다.
이 8개 확인은 전체 규칙의 정확한 선택 목록을 인증한 결과가 아니다.
74개 라우팅 시나리오는 검토한 예상 결과이며, 모든 시나리오를 실제 에이전트로 반복 실행한 행동 인증은 수행하지 않았다.
예제 전체의 실행 환경을 구성한 것도 아니므로 위의 실제 재현 범위와 정적 검증을 구분한다.

변경은 `main` 작업 트리에 반영했고 커밋·푸시는 하지 않았다.
