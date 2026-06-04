---
name: figma-visual-parity
description: Use when the user provides a Figma link, Figma node, or design screenshot and asks to implement, sync, match, polish, compare, or align an existing or new UI against that design.
metadata:
  author: agent-conventions
  version: "1.0.0"
---

# Figma Visual Parity

Figma를 대략 참고하는 skill이 아니라, Figma evidence와 실제 브라우저 구현 화면의 차이를 확인하고 줄이는 visual parity workflow입니다.

## 사용할 때

- 사용자가 Figma 링크, Figma node URL, Figma screenshot, design screenshot을 제공한 경우
- "피그마처럼", "디자인 맞춰", "Figma sync", "visual parity", "스타일 맞춰", "보고 구현", "구현해줘", "맞춰줘" 같은 표현을 쓴 경우
- 기존 UI를 Figma 기준으로 수정하는 경우
- 새 UI 구현이어도 Figma가 기준 소스인 경우

## 사용하지 않을 때

- Figma 댓글 CSV 추출만 원하는 경우
- API, 데이터 로직, 권한, 저장 로직만 고치는 경우
- 디자인 기준 없이 기능 구현만 원하는 경우
- 사용자가 "대략만", "구조만", "디자인 말고 동작만"이라고 명시한 경우

## 활성화 체크리스트

- Figma tool을 쓸 수 있으면 먼저 Figma node/design context/screenshot을 확보합니다. Figma MCP의 `use_figma`를 호출해야 한다면 먼저 `figma:figma-use` skill을 로드합니다.
- node가 너무 크면 더 작은 node, parent section, screenshot, metadata fallback 중 가능한 evidence를 확보하고 포기하지 않습니다.
- 구현 전 현재 브라우저 화면도 확인합니다. local app이면 dev server와 실제 route를 열어 screenshot을 봅니다.
- 구현 전 아래 visual diff 표를 작성합니다.
- React/TSX 구현이면 `convention-react`, style/className/CSS 변경이면 `convention-css`, 브라우저 테스트나 screenshot 검증이면 `convention-playwright-test`를 함께 사용합니다.
- scope 밖 shared component/style 변경이 필요하면 먼저 사용자에게 보고합니다.

## Visual Diff 표

구현 전에 최소 한 번 작성합니다. 모르는 항목은 비워두지 말고 "확인 필요", "Figma evidence 없음", "현재 구현 미확인"처럼 상태를 적습니다.

| 항목 | Figma | 현재 구현 | 수정 방침 |
| --- | --- | --- | --- |
| layout |  |  |  |
| spacing |  |  |  |
| typography |  |  |  |
| color |  |  |  |
| border/radius |  |  |  |
| surface/background |  |  |  |
| shadow |  |  |  |
| icon/assets |  |  |  |
| static copy |  |  |  |
| states |  |  |  |
| responsive behavior |  |  |  |

## 정적 값과 동적 값

- 서버/API에서 오는 row data, metric value, user-specific data는 하드코딩하지 않습니다.
- 버튼명, 탭명, 컬럼명, 라벨, placeholder, empty state, default option, 고정 안내문구는 Figma 기준으로 맞춥니다.
- Figma에 보이는 값이 서버 데이터인지 static UI copy인지 애매하면 먼저 분류합니다.
- API mock 값을 UI 고정값처럼 박지 않습니다.

## 구현 규칙

- 기존 컴포넌트, 디자인 토큰, owner별 CSS 규칙을 우선 사용합니다.
- Figma와 명확히 다른 부분은 CSS/layout을 조정합니다.
- visual parity 작업 중 불필요한 구조 리팩터링을 하지 않습니다.
- visible label, section title, heading은 Figma 또는 사용자가 명확히 제거하라고 하지 않는 한 삭제하지 않습니다.

## 검증 규칙

- build/test 통과만으로 완료 처리하지 않습니다.
- 실제 브라우저에서 구현 화면 screenshot을 확인합니다.
- Figma screenshot과 브라우저 screenshot을 비교합니다.
- mismatch가 남으면 수정 반복합니다.
- 남은 mismatch가 있다면 완료 보고에 숨기지 않고 적습니다.

## 완료 보고 형식

완료 보고에는 반드시 아래 항목을 포함합니다.

- 사용한 Figma 링크/node
- 수정 scope
- 구현한 visual parity 항목
- 동적 데이터라서 하드코딩하지 않은 항목
- 정적 UI copy로 맞춘 항목
- 브라우저 screenshot 검증 여부
- 남은 mismatch
- 실행한 검증 명령

## Common Mistakes

- Figma 링크만 보고 대략 구현하고 끝내는 것
- build/test 성공만으로 완료 선언하는 것
- 실제 브라우저 화면을 보지 않는 것
- Figma static label을 서버 데이터라고 착각해서 안 맞추는 것
- 서버/API 데이터를 하드코딩하는 것
- UI polish 중 visible heading/label을 임의 삭제하는 것
- node가 너무 크다고 Figma 분석을 포기하는 것
- 기존 디자인 시스템을 무시하고 raw CSS만 늘리는 것

## 상세 규칙

- [AGENTS.md](./AGENTS.md) - compiled local guide
- [pressure-tests.md](./pressure-tests.md) - baseline failure와 pressure scenario 검증 세트
- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md` - source of truth
