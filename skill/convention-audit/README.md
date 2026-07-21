# Convention Audit

React/CSS/TypeScript 변경의 progressive rule selection과 semantic compliance를 독립적으로 재검증하는 structured skill입니다. local 5개 섹션의 8개 audit gate rule은 [AGENTS.md](./AGENTS.md) 전체로 읽고, 실제 변경 surface에 해당하는 progressive companion만 `SKILL.md`와 `RULES_INDEX.md`로 활성화합니다. Selected/Unknown은 generated contract를 읽고 CRITICAL 또는 근거가 더 필요한 rule만 full rule로 확장하며, companion full `AGENTS.md`는 기본 로드하지 않습니다.

## 구조

- [rules/_sections.md](./rules/_sections.md) - audit gate 섹션 순서와 설명
- [rules/_template.md](./rules/_template.md) - 새 local rule 템플릿
- `rules/*.md` - local audit workflow source of truth
- [metadata.json](./metadata.json) - React/TypeScript/CSS conditional companion 선언
- [SKILL.md](./SKILL.md) - activation과 exact receipt router
- [pressure-tests.md](./pressure-tests.md) - mutation/pressure regression set
- [AGENTS.md](./AGENTS.md) - 생성된 local 8-rule audit guide

## Audit 계약

1. diff와 audit packet의 actual changed surface로 companion을 활성화합니다.
2. 각 activated index 전체를 current routing digest 기준으로 독립 scan합니다.
3. `Selected`, `N/A`, `Unknown`이 모든 ordinal을 중복·누락 없이 덮는 exact partition을 만들고 `completionGate`는 Selected로 둡니다.
4. N/A exclusion group을 검증하고 `reviewWith` target은 자동 선택 없이 applicability/cross-skill activation을 독립 재평가합니다.
5. Selected/Unknown contract를 읽고 CRITICAL 또는 exact 판단에 필요한 full rule만 `Expanded` 이유와 함께 로드한 뒤 Unknown을 Selected/N/A로 먼저 해소합니다.
6. final Selected contract의 `requiresSelected` target을 companion까지 즉시 Selected로 닫고 N/A를 금지합니다. N/A contract의 target은 전이하지 않습니다.
7. final Selected contract가 요구한 필수 변경만 scope evidence에 합치고, 예시·선택적 대안·미해소 Unknown은 제외한 채 activation·partition·evidence의 고정점까지 1~6을 반복합니다.
8. 구현자 receipt를 보기 전에 고정점 auditor receipt를 완성하고, 그 뒤 같은 digest의 모든 partition set과 양쪽 N/A exclusion group을 비교합니다.
9. contract와 필요한 full rule을 실제 증거에 대조해 semantic `PASS`/`FAIL`/`UNKNOWN`을 판정합니다.
10. completion gate나 required target의 누락/N/A, coverage `FAIL`, semantic `FAIL`, `UNKNOWN`, scope drift가 있으면 고정점까지 rescan하고 모두 0일 때만 완료합니다.

lint, typecheck, build, test, browser는 evidence이지 semantic PASS가 아닙니다. reviewer mode와 파일 읽기 telemetry limitation도 최종 보고에 남깁니다.

## 명령

```bash
npm --prefix ../../package run validate:convention-audit
npm --prefix ../../package run build:convention-audit
npm --prefix ../../package run typecheck
./../../package/node_modules/.bin/tsx --test ../../package/test/convention-audit.test.ts
```

rule source를 바꾼 뒤 generated [AGENTS.md](./AGENTS.md)를 직접 수정하지 말고 validate/build를 다시 실행합니다.

## Companion Activation

- `convention-react`: component, TSX render, screen/route-local, hook, handler, state/query, rendered behavior
- `convention-typescript`: type, schema, config, API, helper, import/export, fallback, JSDoc
- `convention-css`: stylesheet, selector, token/CSS variable, className contract, visual styling

cross-skill `reviewWith` target은 자동 activation 명령이 아닙니다. inactive evidence를 기록하거나 실제 condition이 맞으면 companion 전체 index를 활성화합니다. final Selected contract의 cross-skill `requiresSelected` target은 companion을 즉시 활성화합니다.

package의 정적 문서 테스트는 이 계약과 mutation fixture가 빠지지 않았는지 검증합니다. 실제 agent가 압력 아래 같은 절차를 수행하는 behavioral proof는 Task 9 evaluation에서 별도로 기록합니다.
