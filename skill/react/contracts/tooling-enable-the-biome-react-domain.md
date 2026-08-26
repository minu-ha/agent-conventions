# Enable the Biome React Domain

**Impact: MEDIUM (리액트 전용 검사를 기계가 맡아 리뷰는 판단이 필요한 규칙만 봅니다)**

`biome` 2.x에는 **도메인**이 있습니다.
`linter.domains`에 `react`를 켜면 `package.json`에 `react@>=16`이 있을 때만 리액트 검사가 붙습니다.
`typescript/tooling-configure-biome-to-enforce-these-rules`가 세우는 설정 위에 이 항목을 더합니다.

| `biome` 규칙 | 담당 컨벤션 |
| --- | --- |
| `correctness/noNestedComponentDefinitions` | `react/composition-do-not-define-components-inside-components` |
| `correctness/useExhaustiveDependencies` | `react/state-use-effectevent-for-non-reactive-effect-callbacks`의 의존성 |
| `correctness/useJsxKeyInIterable` | `react/composition-name-fragments-explicitly`의 `key` |
| `a11y/*` 묶음 | `react/a11y-give-interactive-elements-an-accessible-name`의 일부 |
| `style/noRestrictedImports`의 `../` 패턴 | `react/ownership-keep-component-imports-flowing-downward`의 `../` 범위 |

`noNestedComponentDefinitions`는 도메인의 `recommended`에 없어 따로 켭니다.
`react/composition-do-not-define-components-inside-components`와 판정 대상이 같아 이 규칙을 통째로 기계에 넘깁니다.

`a11y` 묶음은 도메인이 아니라 `preset: "recommended"`가 이미 켭니다.
`useButtonType`, `useAltText`, `useValidAnchor`, `useKeyWithClickEvents`, `useSemanticElements`가 그것입니다.
접근 가능한 이름을 실제로 붙였는지는 기계가 못 보고 리뷰가 봅니다.

`typescript/tooling-configure-biome-to-enforce-these-rules`가 세운 `noRestrictedImports`에 패턴 하나를 더합니다.
`../<파일>`과 `../../**`를 막아 `../`가 형제 소유자 폴더 한 겹만 넘게 하고,
`function`, `type`, `constant`, `hook` 폴더만 부정 패턴으로 되돌리는 항목입니다.
되돌리는 넷은 `ownership-keep-component-imports-flowing-downward`가 예외로 두는 역할 폴더입니다.
`@/page/**` 패턴과 같은 배열에 나란히 두면 절대경로와 상대경로 양쪽이 한 규칙으로 막힙니다.

기계가 끝까지 못 가는 자리가 있습니다.
아래 항목은 리뷰가 봅니다.

- 형제 가져오기는 어떤 설정으로도 못 잡습니다.
  `./pg-summary-band`는 소유자가 쓰는 정당한 경로와 문자열이 같습니다.
  `../summary-band/pg-summary-band`가 진입 파일인지, 가져오는 쪽이 진입 파일인지도 기계는 모릅니다.
  `ownership-keep-component-imports-flowing-downward`의 진입 파일 조건은 리뷰가 봅니다.
- `useExhaustiveDependencies`는 의존성 배열이 빠졌는지만 봅니다.
  그 콜백을 `useEffectEvent`로 감싸야 하는지는 리뷰가 봅니다.
- `useJsxKeyInIterable`은 `key`가 있는지만 봅니다.
  `<>` 대신 `Fragment`를 썼는지는 리뷰가 봅니다.

따로 켜지 않는 규칙이 둘 있습니다.

- `style/useFragmentSyntax`는 조각을 `<>`로 바꾸라고 합니다.
  `recommended`에 없어 따로 켜야 하는데, 켜지 않습니다.
  `react/composition-name-fragments-explicitly`가 `Fragment`를 쓰라고 정하기 때문입니다.
- `nursery/useReactFunctionComponents`는 도메인 `all`에만 있습니다.
  `nursery`는 규칙이 바뀔 수 있어 켜지 않습니다.

> 예시·예외가 필요하면 [full rule](../rules/13-01-tooling-enable-the-biome-react-domain.md)을 읽습니다.
