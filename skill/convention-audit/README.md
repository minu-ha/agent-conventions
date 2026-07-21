# Convention Audit

React/CSS/TypeScript 변경의 progressive rule selection과 semantic compliance를 독립적으로 재검증하는 structured skill입니다. local 5개 섹션의 8개 audit gate rule은 [AGENTS.md](./AGENTS.md) 전체로 읽고, 실제 변경 surface에 해당하는 progressive companion만 `SKILL.md`와 `RULES_INDEX.md`로 활성화합니다. companion full `AGENTS.md`를 기본 로드하지 않습니다.

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
3. `Selected`, `N/A`, `Unknown`이 모든 ordinal을 중복·누락 없이 덮는 exact partition을 만듭니다.
4. 구현자 receipt를 보기 전에 auditor receipt를 완성하고, 같은 digest의 모든 partition set을 비교합니다.
5. 양쪽 receipt의 N/A exclusion group이 각 N/A set을 정확히 한 번 덮는지와 reason evidence를 독립 검증합니다.
6. `reviewWith` target의 applicability와 cross-skill activation을 재평가합니다.
7. auditor-selected/unknown body만 읽고 semantic `PASS`/`FAIL`/`UNKNOWN`을 판정합니다.
8. coverage `FAIL`, semantic `FAIL`, `UNKNOWN` 또는 scope drift가 있으면 rescan하고 둘 다 0일 때만 완료합니다.

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

cross-skill `reviewWith` target은 자동 activation 명령이 아닙니다. inactive evidence를 기록하거나, 실제 condition이 맞으면 companion 전체 index를 활성화해 exact partition을 작성합니다.

package의 정적 문서 테스트는 이 계약과 mutation fixture가 빠지지 않았는지 검증합니다. 실제 agent가 압력 아래 같은 절차를 수행하는 behavioral proof는 Task 9 evaluation에서 별도로 기록합니다.
