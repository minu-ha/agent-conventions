# Figma Visual Parity

Figma 링크, node URL, design screenshot을 기준으로 실제 브라우저 구현 화면과의 visual parity를 맞추는 structured skill입니다.
현재 가이드는 5개 local 섹션의 11개 rule 파일로 구성되어 있으며, 최종적으로 slim [AGENTS.md](./AGENTS.md)로 compile됩니다.
이 skill은 Figma evidence 확보, 현재 구현 화면 확인, visual diff 표 작성, static UI copy와 dynamic API data 분리, 기존 디자인 시스템 우선 사용, browser screenshot 검증을 기본 workflow로 둡니다.

## 구조

- [rules/_sections.md](./rules/_sections.md) - rule 섹션 구성 메타데이터
- [rules/_template.md](./rules/_template.md) - 새 rule 작성용 템플릿
- `area-description.md` - 실제 rule 파일 패턴
- [metadata.json](./metadata.json) - compiled guide 메타데이터와 companion skill 선언
- [SKILL.md](./SKILL.md) - activation guide
- [pressure-tests.md](./pressure-tests.md) - baseline failure와 pressure scenario 검증 세트
- [AGENTS.md](./AGENTS.md) - 에이전트가 읽는 compiled 결과물
- [package/README.md](../../package/README.md) - `skill/*` build, validation, typecheck, test를 담당하는 standalone TypeScript npm package

## 시작하기

1. Validate rule files:
   ```bash
   npm --prefix ../../package run validate:figma-visual-parity
   ```

2. Build [AGENTS.md](./AGENTS.md) from rules:
   ```bash
   npm --prefix ../../package run build:figma-visual-parity
   ```

3. Validate and build together:
   ```bash
   npm --prefix ../../package run dev:figma-visual-parity
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix ../../package run typecheck
   npm --prefix ../../package run test
   ```

## 새 Rule 추가하기

1. [rules/_template.md](./rules/_template.md)를 `rules/area-description.md`로 복사합니다.
2. 알맞은 area prefix를 고릅니다.
   - `trigger-` - skill 사용 조건과 제외 조건
   - `evidence-` - Figma evidence, 현재 구현 화면, visual diff 표
   - `data-` - static UI copy와 dynamic API data 경계
   - `implementation-` - 기존 디자인 시스템, scope, label 보존
   - `verification-` - browser screenshot 검증과 완료 보고
3. frontmatter와 본문을 작성합니다.
4. 설명이 포함된 incorrect/correct 예시를 넣습니다.
5. `npm --prefix ../../package run dev:figma-visual-parity`를 실행해 [AGENTS.md](./AGENTS.md)를 다시 생성합니다.

## Pressure Tests

- skill 품질을 회귀 테스트하려면 [pressure-tests.md](./pressure-tests.md)를 사용합니다.
- Figma 링크만 주는 요청, "스타일만" 요청, Figma 숫자와 API 값의 충돌, 큰 node fallback, build 성공 후 screenshot mismatch 시나리오를 포함합니다.
- trigger 문구나 검증 workflow를 바꾸면 pressure scenario도 함께 갱신합니다.

## Companion Skill

- React/TSX 구현은 `convention-react`를 함께 사용합니다.
- CSS/className/design token 변경은 `convention-css`를 함께 사용합니다.
- 브라우저 screenshot, locator, visual smoke 검증은 `convention-playwright-test`를 함께 사용합니다.

## 마이그레이션 메모

- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`가 source of truth입니다.
- [AGENTS.md](./AGENTS.md)는 생성물입니다.
- `metadata.json.extends`는 `react`, `css`, `playwright-test` companion skill 관계를 선언합니다.
- `SKILL.md`의 description은 trigger 조건만 담고 workflow를 요약하지 않습니다.
