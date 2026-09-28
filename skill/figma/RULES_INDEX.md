# Figma 구현 컨벤션 Rule Index

- Skill: `figma`
- Routing digest: `sha256:f4ffdc55b6538a0d9500cb2b9baf189129ac634617b722b108d1e798942125c8`

## Direct Companions

- `css` (`conditional`) · Applies when: stylesheet, className, 토큰 값을 추가하거나 수정한다. · [SKILL.md](../css/SKILL.md) · [RULES_INDEX.md](../css/RULES_INDEX.md)
- `react` (`conditional`) · Applies when: TSX 화면이나 컴포넌트를 추가하거나 수정한다. · [SKILL.md](../react/SKILL.md) · [RULES_INDEX.md](../react/RULES_INDEX.md)

## Local Rules

- F01-01 | read-start-with-screenshot-and-metadata | 요청에 Figma URL이나 노드 id가 있어 MCP로 디자인을 읽을 때. 같은 Figma 화면을 다시 읽거나 읽을 노드를 늘릴 때.
- F01-02 | read-choose-the-node-each-tool-reads | Figma URL의 노드가 화면 프레임인지 메모를 감싼 래퍼인지 가려야 할 때. URL에 \`node-id\`가 없거나 \`/branch/\` 경로가 들어 있을 때.
- F01-03 | read-call-design-context-only-on-small-unmatched-nodes | \`get\_design\_context\`를 부르거나 그 대상 노드를 고를 때. \`get\_design\_context\` 응답이 코드 대신 메타데이터로 오거나 성기다고 알릴 때.
- F01-04 | read-take-copy-from-the-render-not-layer-names | Figma 메타데이터의 레이어 \`name\`으로 문구, 컬럼명, 컴포넌트 종류를 정할 때. 스크린샷과 레이어 이름이 서로 다른 글자를 보여 줄 때.
- F01-05 | read-collect-hidden-layers-and-annotations | Figma 메타데이터에 \`hidden="true"\` 노드가 있을 때. 화면 프레임 밖에 메모, 변경 이력, 상태 설명 프레임이 있을 때.
- F02-01 | intent-ask-when-ux-notes-and-gui-disagree | Figma 메모, 변경 이력, 와이어프레임이 GUI 화면과 다른 조건, 순서, 문구를 말할 때. 같은 화면이 UX 파일과 GUI 파일에 다르게 그려져 있을 때.
- F02-02 | intent-fill-undrawn-states-with-project-parts | 서버 데이터 목록, 입력, 비동기 동작이 있는 Figma 화면을 구현할 때. Figma에 로딩, 빈 목록, 오류, 비활성 상태가 그려져 있지 않을 때.
- F02-03 | intent-treat-frame-sizes-and-sample-text-as-samples | Figma 노드의 \`width\`, \`height\`, 좌표를 CSS 값으로 옮길 때. 샘플 문구 길이에 맞춰 칸 폭이나 줄 수를 정할 때. | reviewWith: css/layout-keep-layout-intent-explicit, css/layout-reach-for-intrinsic-sizing-before-breakpoints
- F02-04 | intent-implement-interactions-the-design-implies | Figma에 정렬 아이콘, 펼침 화살표, 정보 아이콘, 링크 색 문구가 있을 때. 행, 카드, 탭처럼 누를 수 있어 보이는 요소를 구현할 때.
- F03-01 | source-map-figma-values-to-project-tokens | Figma에서 읽은 간격, 모서리 반경, 색, 글꼴 값을 스타일에 넣을 때. \`get\_variable\_defs\`나 \`get\_design\_context\`가 준 변수 이름을 코드에 옮길 때. | reviewWith: css/values-fall-back-only-outside-core-tokens, css/values-tokenize-repeated-visual-values
- F03-02 | source-separate-static-copy-from-server-data | Figma 텍스트 노드의 글자를 JSX나 문구 리소스에 넣을 때. 화면의 숫자, 이름, 날짜가 샘플인지 고정 문구인지 가려야 할 때.
- F04-01 | transcription-reuse-project-components-before-new-markup | Figma 화면의 표, 탭, 페이지네이션, 입력, 버튼, 배지를 마크업으로 새로 만들 때. \`get\_design\_context\`가 준 JSX를 화면 파일에 옮길 때. | reviewWith: css/ownership-change-other-owners-through-their-api, react/strategy-avoid-boolean-prop-proliferation
- F04-02 | transcription-do-not-copy-layer-structure | \`get\_design\_context\` 출력의 JSX, \`className\`, 인라인 SVG를 파일에 옮길 때. Figma 좌표로 \`position: absolute\`, \`rotate\`, 고정 \`width\`를 쓰려 할 때. | reviewWith: css/composition-do-not-add-wrapper-elements-for-styling, css/composition-do-not-style-through-the-style-attribute
- F04-03 | transcription-use-existing-icons-or-downloaded-assets | Figma의 아이콘, 로고, 이미지를 코드에 넣을 때. 코드에 \`figma.com/api/mcp/asset\` URL이나 손으로 쓴 SVG \`path\`가 들어갈 때.
- F05-01 | verify-measure-rendered-values-before-claiming-parity | Figma 기준 구현이나 수정을 마무리하거나 완료로 보고할 때. | completionGate
- F05-02 | verify-report-reads-decisions-and-gaps | Figma 기준 작업의 결과를 보고하거나 넘겨줄 때. | completionGate