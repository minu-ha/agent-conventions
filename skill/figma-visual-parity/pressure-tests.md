# Figma Visual Parity Pressure Tests

이 문서는 skill wording을 바꿀 때 검증할 pressure scenario입니다. 각 scenario는 baseline failure를 먼저 확인한 뒤, skill 적용 후 기대 행동으로 통과 여부를 봅니다.

## 검증 흐름

1. Baseline failure: 이 skill 없이 같은 요청을 처리한다고 가정하고 흔한 실패를 적습니다.
2. Skill pass: `figma-visual-parity`를 로드한 에이전트가 어떤 행동을 해야 하는지 확인합니다.
3. Pass criteria: evidence, visual diff, 구현, browser screenshot 검증, 완료 보고가 모두 남았는지 점검합니다.

## Scenario 1. Figma 링크만 주고 "이거 구현해줘"

Prompt:

```md
이거 구현해줘.

https://www.figma.com/design/example/file?node-id=1-2
```

Baseline failure: Figma 링크를 한 번 훑고 바로 TSX/CSS를 작성하거나, Figma screenshot 없이 대략적인 레이아웃만 구현한다.

Skill pass: Figma node/design context/screenshot을 먼저 확보하고, 현재 구현 또는 대상 route 부재를 확인한 뒤 visual diff 표를 작성한다. 신규 화면이면 "현재 구현 없음"을 명시한다.

Pass criteria: 사용한 Figma node, 구현 scope, static copy, dynamic data placeholder, browser screenshot 검증 여부가 완료 보고에 포함된다.

## Scenario 2. 사용자가 "스타일만 맞춰줘"라고 하는 경우

Prompt:

```md
이 Figma 기준으로 스타일만 맞춰줘.

scope:
src/pages/detail
```

Baseline failure: 기능 코드를 같이 리팩터링하거나, build 통과 뒤 browser screenshot을 보지 않고 완료한다.

Skill pass: scope를 style/layout parity로 제한하고, layout, spacing, typography, color, radius, shadow 중심의 visual diff 표를 작성한다.

Pass criteria: 불필요한 데이터/API 변경이 없고, Figma screenshot과 browser screenshot 비교 결과가 보고된다.

## Scenario 3. Figma에 숫자 값이 보이지만 실제로는 API 값이어야 하는 경우

Prompt:

```md
피그마에 보이는 카드 수치까지 맞춰줘. API 값은 하드코딩하지 마.
```

Baseline failure: Figma의 `42`, `98.7%`, `1,024` 같은 값을 JSX 상수로 박거나, 반대로 static label까지 서버 데이터라고 보고 그대로 둔다.

Skill pass: metric value, row data, user-specific data를 dynamic API data로 분류하고, 버튼명/라벨/컬럼명/empty state는 static UI copy로 분류한다.

Pass criteria: 완료 보고에 "동적 데이터라서 하드코딩하지 않은 항목"과 "정적 UI copy로 맞춘 항목"이 분리되어 있다.

## Scenario 4. node가 너무 커서 Figma context fetch가 실패하는 경우

Prompt:

```md
이 Figma node 기준으로 페이지 맞춰줘. node가 좀 클 수 있어.
```

Baseline failure: node fetch 실패를 이유로 Figma 분석을 포기하고 기존 화면만 다듬는다.

Skill pass: 더 작은 node, parent section, screenshot, metadata fallback을 순서대로 시도하고, 확보한 evidence와 한계를 visual diff 표에 적는다.

Pass criteria: fallback 경로와 남은 uncertainty가 완료 보고에 남는다.

## Scenario 5. 구현 후 build는 성공했지만 browser screenshot이 Figma와 다른 경우

Prompt:

```md
빌드는 되는데 Figma랑 좀 달라 보여. visual parity 다시 맞춰줘.
```

Baseline failure: build/test 성공을 근거로 완료 선언하거나, mismatch를 "추후 개선"으로 숨긴다.

Skill pass: browser screenshot을 다시 찍고 Figma screenshot과 비교해 mismatch를 layout/spacing/typography/color 등으로 분류한 뒤 수정 반복한다.

Pass criteria: 반복 후 남은 mismatch와 실행한 검증 명령이 완료 보고에 포함된다.

## Scenario 6. REST API token이 있는데 MCP screenshot만 보고 끝내는 경우

Prompt:

```md
이 Figma 기준으로 visual parity 맞춰줘.

https://www.figma.com/design/example/file?node-id=12-34

환경에는 REST API token도 있어.
```

Baseline failure: REST API token이 있는데도 `fileKey`, `nodeId`를 파싱하지 않고 MCP screenshot만 보고 구현한다. reference image export 없이 "비슷해 보임"으로 완료한다.

Skill pass: Figma URL에서 `fileKey`와 `nodeId`를 파싱하고, `node-id=12-34`를 `12:34`로 변환한다. 가능하면 `GET /v1/files/:key/nodes`로 node JSON, `GET /v1/images/:key`로 reference image를 확보한다. token, signed image URL, 원본 응답 전체는 출력하거나 커밋하지 않는다.

Pass criteria: 완료 보고에 REST API artifacts 사용 여부, node JSON/reference image 확보 여부, token을 노출하지 않았다는 점, browser screenshot diff 결과가 포함된다.

## Scenario 7. Code Connect mapping이 있는데 새 컴포넌트를 만드는 경우

Prompt:

```md
Figma Button과 Table은 Code Connect가 연결돼 있어.
이 화면을 구현해줘.
```

Baseline failure: Code Connect snippet을 무시하고 새 `button`, 새 table markup, raw CSS class를 만든다.

Skill pass: Code Connect import, snippet, prop mapping, custom instruction을 먼저 확인한다. Code Connect가 부족하면 repo component inventory를 검색해 component mapping table을 작성한 뒤 구현한다.

Pass criteria: 구현 보고에 사용한 Code Connect component 또는 repo component mapping이 포함되고, 새 raw component를 만든 경우에는 기존 컴포넌트로 표현할 수 없었던 이유가 설명된다.

## Scenario 8. Variables API 권한이 일부만 있는 경우

Prompt:

```md
Figma variables 기준으로 색상과 spacing도 맞춰줘.
```

Baseline failure: `file_variables:read` 권한 실패를 무시하거나, 반대로 권한이 없다는 이유로 raw hex/px를 코드에 박는다.

Skill pass: variables endpoint 사용 가능 여부와 scope/plan 실패 이유를 확인한다. 가능하면 mode별 variables를 project token에 매핑하고, 실패하면 repo CSS variables/design token inventory를 fallback으로 사용한다.

Pass criteria: token mapping, fallback 이유, raw value를 새로 추가한 경우의 근거가 완료 보고에 포함된다.
