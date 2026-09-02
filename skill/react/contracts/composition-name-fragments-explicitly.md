# Write Fragments as `Fragment`, Not the Shorthand

**Impact: LOW (조각을 감싼 자리가 이름을 가져서 검색과 diff에 그대로 드러납니다)**

여러 요소를 감쌀 때는 `<Fragment>`를 `react`에서 직접 가져와 그대로 씁니다.
`<>`와 `</>`는 쓰지 않습니다.

- `<>`와 `</>`는 검색해도 어느 컴포넌트의 조각인지 가릴 수 없습니다.
  diff에도 이름 없는 줄로 남습니다.
- 목록에서 `key`가 필요해지면 어차피 `<Fragment key={…}>`로 바꿔야 합니다.
  한 형태로 끝냅니다.
- 가져오기는 `typescript/naming-use-direct-imports-and-public-entry-points`를 따라
  `import {Fragment} from "react";`로 적습니다.

`biome`의 `style/useFragmentSyntax`는 정반대를 강제하므로 켜지 않습니다.
설정은 `typescript/tooling-configure-biome-to-enforce-these-rules`에 적혀 있습니다.

> 예시·예외가 필요하면 [full rule](../rules/05-07-composition-name-fragments-explicitly.md)을 읽습니다.
