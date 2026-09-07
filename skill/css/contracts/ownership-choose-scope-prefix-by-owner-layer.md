# Choose the Scope Prefix by Owner Layer

**Impact: MEDIUM-HIGH (클래스 접두사로 소유 레이어를 구분합니다)**

범위 접두사는 CSS 파일 소유자의 **레이어**를 나타냅니다. 폴더 깊이가 아니라 최상위 폴더로 정합니다.

| 접두사 | 최상위 폴더 | 소유 레이어 |
| --- | --- | --- |
| `pg_` | `src/page` | 화면을 아는 화면 뼈대와 컴포넌트 |
| `wg_` | `src/component/widget` | 도메인은 알고 화면은 모르는 컴포넌트 |
| `ui_` | `src/component/ui` | 도메인도 화면도 모르는 컴포넌트 |

화면 뼈대와 하위 컴포넌트는 모두 `pg_`를 씁니다.
뼈대는 라우트와 같은 식별자로 구분합니다.
위젯 내부 부품도 최상위 폴더가 `src/component/widget`이면 `wg_`입니다.

사용 횟수로 레이어를 바꾸지 않습니다.
재사용을 예상해 미리 `wg_`로 올리거나 한 화면만 쓴다고 `pg_`로 내리지 않습니다.
소유자의 레이어가 바뀌면 접두사도 함께 바꿉니다.
최상위 폴더의 선택과 파일 이름의 `_` 표식은 활성화된 프레임워크 규약이 정합니다.

> 예시·예외가 필요하면 [full rule](../rules/02-02-ownership-choose-scope-prefix-by-owner-layer.md)을 읽습니다.
