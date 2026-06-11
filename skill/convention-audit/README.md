# Convention Audit

React/CSS/TypeScript convention skill을 실제 diff에 끝까지 적용했는지 검증하는 semantic audit structured skill입니다.
현재 가이드는 5개 local 섹션의 8개 rule 파일로 구성되어 있으며, 최종적으로 slim [AGENTS.md](./AGENTS.md)로 compile됩니다.
이 skill은 자동 lint로 잡기 어려운 모듈화, 캡슐화, route-local 경계, helper 추출, query shaping, shared 승격, CSS selector ownership을 rule-by-rule로 검토하게 만드는 완료 gate입니다.

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
   npm --prefix ../../package run validate:convention-audit
   ```

2. Build [AGENTS.md](./AGENTS.md) from rules:
   ```bash
   npm --prefix ../../package run build:convention-audit
   ```

3. Validate and build together:
   ```bash
   npm --prefix ../../package run dev:convention-audit
   ```

4. Verify the build package itself:
   ```bash
   npm --prefix ../../package run typecheck
   npm --prefix ../../package run test
   ```

## 새 Rule 추가하기

1. [rules/_template.md](./rules/_template.md)를 `rules/area-description.md`로 복사합니다.
2. 알맞은 area prefix를 고릅니다.
   - `trigger-` - audit 사용 조건과 변경 scope 확정
   - `evidence-` - audit packet과 구조 증거
   - `coverage-` - 파일별 rule coverage matrix와 companion skill 누락 방지
   - `review-` - semantic reviewer와 verdict 근거
   - `completion-` - FAIL/UNKNOWN repair loop와 최종 보고
3. frontmatter와 본문을 작성합니다.
4. incorrect/correct 예시를 넣습니다.
5. `npm --prefix ../../package run dev:convention-audit`를 실행해 [AGENTS.md](./AGENTS.md)를 다시 생성합니다.

## Pressure Tests

- skill 품질을 회귀 테스트하려면 [pressure-tests.md](./pressure-tests.md)를 사용합니다.
- lint/build 성공 후 convention 누락, reviewer 없는 자기 판정, shared 조기 승격, query select 이후 재변환, CSS owner selector 누락, UNKNOWN을 통과 처리하는 시나리오를 포함합니다.

## Companion Skill

- `convention-react` - React 컴포넌트, route-local 경계, screen/state/data flow 검토
- `convention-css` - CSS owner, selector, className, token/fallback 검토
- `convention-typescript` - helper/type/import/fallback/JSDoc 경계 검토

## 마이그레이션 메모

- [rules/_sections.md](./rules/_sections.md), [rules/_template.md](./rules/_template.md), `rules/*.md`가 source of truth입니다.
- [AGENTS.md](./AGENTS.md)는 생성물입니다.
- `metadata.json.extends`는 `react`, `css`, `typescript` companion skill 관계를 선언합니다.
- `SKILL.md`의 description은 trigger 조건만 담고 workflow를 요약하지 않습니다.
