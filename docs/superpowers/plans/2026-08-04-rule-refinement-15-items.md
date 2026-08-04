# 규칙 정밀 조정 15건 실행 계획

> **For agentic workers:** 이 계획은 `skill/react`, `skill/typescript`, `skill/css`, `package/src/viewer-template.ts` 를 고칩니다. 각 Task 끝에서 검증 명령을 돌리고 커밋합니다.

**Goal:** 사용자가 지목한 15개 항목을 반영해 규칙의 방향을 하나로 모으고, 판정할 수 없는 문구와 겹치는 규칙을 없앤다.

**Architecture:** 규칙 본문(`skill/*/rules/*.md`)이 source of truth. `contracts/`·`HANDBOOK.md`·`RULES_INDEX.md`·`conventions.html`·`conventions-data.js` 는 생성물이라 직접 고치지 않는다. ID 를 바꾸면 `routing-evals.json` 과 `package/test/routing-evals.test.ts` 오라클을 같이 고친다.

**Tech Stack:** TypeScript + tsx (빌드/검증), biome 2.2.4, node:test

---

## 확정된 결정

| # | 결정 | ID 변경 |
| --- | --- | --- |
| 1 | 프롭스 구조분해 전면 금지. `props.xxx` 로 읽는다. **예외 없음** | `composition-destructure-props-inside` → `composition-read-props-without-destructuring` |
| 2 | react `10-02` 삭제 → `04-06` 에 한 줄 흡수 | 삭제 |
| 3 | 어휘 치환 7종 + `오리진`→`출처` 통일 | 없음 |
| 4 | 뷰어 `--faint`/`--muted`/`.meta-s`/`.car` 대비 상향 | 해당 없음 |
| 5 | `<>` 금지, `<Fragment>` 명시. 새 규칙 + biome 예외 메모 | 신설 `composition-name-fragments-explicitly` |
| 6 | react `05-04` 예제를 출처가 보이는 코드로 교체 | 없음 |
| 7 | react `05-03` 제목·본문에서 "실행 경계" 제거 | **유지**(비용 대비 이득 없음) |
| 8 | 선언형 설정 객체의 키는 공용·소유자 전용 모두 `snake_case` | 없음 |
| 9 | 변수·함수는 `camelCase` 유지. `01-04` 에 구분 근거 한 문장 추가 | 없음 |
| 10 | `Pick`/`Omit` 폐기. **`interface` + 인덱스 접근 한 형태로 고정** | 없음 |
| 11 | 추출 조건을 대폭 강화(KISS·YAGNI). 같은 파일 안 반복은 추출 사유가 아님 | 없음 |
| 12 | `03-03`=뺄까 말까 / `03-04`=어디 두고 언제 올릴까 + 호출 사슬 | 없음 |
| 13 | `??` 오른쪽에 **리터럴 금지**. 선언된 이름만 허용. 예외 조항 없음 | 없음 |
| 14 | 본문 주석에 **긴 절차의 단계 구분** 허용 | `docs-keep-inline-comments-for-constraints-and-caveats` → `docs-keep-body-comments-for-intent-and-steps` |
| 15 | "짧게" 제약 삭제. 길이 대신 금지 형태로 통제 | 없음 |

### 13번과 프롭스 기본값의 충돌 해소

1번을 적용하면 `css/03-04` 의 `const { variant = "default" } = props` 가 `props.variant ?? "default"` 가 되어 13번을 위반한다.
**해결: 기본값이 필요 없게 쓴다.** `props.variant === "compact"` 는 `undefined` 를 자연히 처리한다.
이 예제를 13번 규칙 본문에도 넣어 "선택 값을 그대로 비교하면 기본값이 필요 없는 경우가 많다" 를 보인다.

### 10번의 파급

`skill/nestjs/rules/03-04` 가 `Omit<User, "password">` 를 쓴다. nestjs 는 `extends: ["typescript"]` 라 typescript 규칙을 상속한다.
그대로 두면 직접 모순이므로 이 예제 한 줄만 고친다. 다른 nestjs 규칙은 건드리지 않는다.

---

## 검증 게이트 (모든 Task 공통)

```bash
cd package
npm run validate -- --all       # 8/8
npm run build -- --all
npm run viewer
npm run test                    # 152/152
npm run typecheck
npm run check:artifacts
npm run biome:check:all
```

---

## Task 1: 뷰어 대비 상향 (항목 4)

**Files:** Modify `package/src/viewer-template.ts`

측정값(흰 배경 대비): `--faint` `#98a3a8` = **2.58:1**, `--muted` `#77848a` = **3.85:1**, `.meta-s`(`--edge`) = **1.63:1**. 모두 WCAG 4.5:1 미달.

- [ ] 라이트 토큰 교체: `--muted: #77848a` → `#5f6b71` (5.49:1), `--faint: #98a3a8` → `#6b767c` (4.66:1)
- [ ] 다크 토큰 교체(2곳: `@media` 와 `:root[data-theme="dark"]`): `--faint: #6f7b81` → `#87939a` (5.46:1)
- [ ] `.meta-s { color: var(--edge) }` → `var(--faint)`
- [ ] `.car { color: #a8b2b8 }` → `var(--muted)`
- [ ] `npm run viewer && npm run check:viewer`
- [ ] 커밋

---

## Task 2: 프롭스 구조분해 금지 (항목 1)

**Files:**
- Rename: `skill/react/rules/04-01-composition-destructure-props-inside.md` → `04-01-composition-read-props-without-destructuring.md`
- Modify: react 규칙 12개 + `skill/css/rules/03-04` 예제 총 38곳
- Modify: `skill/react/routing-evals.json`, `skill/css/routing-evals.json`, `package/test/routing-evals.test.ts`
- Modify: `skill/react/rules/04-06`(reviewWith), `skill/typescript/rules/03-02`

- [ ] 규칙 본문 전면 재작성 (아래 전문)
- [ ] `} = props` 38곳을 `props.xxx` 로 교체. 대상 파일:
  `react/01-01`(4) `01-04`(1) `01-06`(1) `03-01`(8) `03-03`(2) `03-04`(4) `04-02`(3) `04-04`(3) `04-06`(3) `05-02`(2) `05-03`(1) `08-02`(1) `10-02`(2, Task 3 에서 삭제) / `css/03-04`(2)
- [ ] ID 참조 교체: `routing-evals.json` 5곳, 테스트 오라클, `04-06` `reviewWith`, `ts/03-02` 본문
- [ ] 검증 게이트 + 커밋

**04-01 규칙 전문:**

```markdown
---
title: Read Props Through the Props Object Without Destructuring
titleKo: 프롭스는 구조분해하지 않고 `props` 로 읽습니다
impact: MEDIUM
impactDescription: 값이 프롭스에서 왔다는 사실이 쓰는 자리마다 그대로 남습니다
appliesWhen:
  - 프롭스를 받는 함수 컴포넌트의 시그니처나 프롭스를 읽는 방식을 추가·변경할 때
  - 프롭스를 받는 컴포넌트를 다른 파일로 옮기거나 이름을 바꿀 때
reviewWith: screen-keep-derived-values-close, data-preserve-origin-chaining
tags: composition, props, origin
---
```

규범 본문 요지:
- 시그니처는 `props` 전체를 받고 본문에서도 `props.id` 로 읽는다
- 구조분해는 이름만 남기고 출처를 지운다. 파일이 길어질수록 그 이름이 프롭스인지 지역 변수인지 훅 결과인지 구분되지 않는다
- 예외를 두지 않는다. "짧은 컴포넌트" 는 판정할 수 없는 기준이다
- 기본값이 필요하면 `typescript/absence-expose-optional-values-instead-of-silent-fallbacks` 를 따른다
- 같은 원칙: `data-preserve-origin-chaining`, `screen-keep-derived-values-close`, `typescript/naming-preserve-config-origin-with-chained-access`

---

## Task 3: react 10-02 삭제 → 04-06 흡수 (항목 2)

**Files:**
- Delete: `skill/react/rules/10-02-docs-document-compound-parts-above-props-interface.md`
- Modify: `skill/react/rules/04-06`, `skill/react/rules/10-01`, `skill/react/rules/_sections.md`
- Modify: `skill/react/routing-evals.json`, `package/test/routing-evals.test.ts`

근거: `10-02` 가 더하는 내용은 "문서 주석을 컴포넌트가 아니라 `interface` 위에 둔다" 하나뿐이고, `04-06` 의 Correct 예제가 이미 그 순서다.

- [ ] `04-06` 에 불릿 추가: 설명 · `interface` · 컴포넌트 순서로 붙여 둡니다. 합성 공개 부품도 같은 순서입니다.
- [ ] `10-01` 의 `docs-document-compound-parts-above-props-interface` 참조를 `composition-declare-props-interface-above-the-component` 로 교체
- [ ] `_sections.md` 10절 Description 에서 "합성 부품 설명을 어디 두는지" 삭제
- [ ] eval `RTE…` 시나리오의 기대 목록에서 ID 제거
- [ ] 검증 게이트 + 커밋

---

## Task 4: Fragment 명시 (항목 5)

**Files:**
- Create: `skill/react/rules/04-07-composition-name-fragments-explicitly.md`
- Modify: `react/03-04`, `react/04-05`, `react/05-06`, `tanstack-route/01-02` 예제
- Modify: `skill/typescript/rules/06-01`(biome 예외 메모), `skill/react/routing-evals.json`, 테스트 오라클

현재 코퍼스가 반반이다: `<>` 4곳(react 3, tanstack 1), `<Fragment>` 1곳(`react/05-01`).

- [ ] 새 규칙 작성 — 근거: `<>` 는 grep 이 안 된다 / `key` 가 필요해지면 어차피 `<Fragment>` 로 바꿔야 한다 / diff 에서 익명 줄이 된다
- [ ] `import { Fragment } from "react";` 를 예제에 포함
- [ ] `ts/06-01` 에 "`style/useFragmentSyntax` 는 정반대를 강제하므로 켜지 않는다" 추가
- [ ] 새 규칙이 최소 한 시나리오에서 걸리게 eval 추가
- [ ] 검증 게이트 + 커밋

---

## Task 5: react 05-03 제목 (항목 7)

**Files:** Modify `skill/react/rules/05-03-…-for-runtime-boundaries.md`

- [ ] `title`: `Extract Route-local Sections Only When They Own State or Async`
- [ ] `titleKo`: `섹션 컴포넌트는 자기 상태나 비동기를 가질 때만 뺍니다`
- [ ] `impactDescription`: "화면 흐름은 보이게 두고 자기 상태나 비동기를 가진 부분만 떼어 냅니다"
- [ ] 본문 `` `runtime boundary` `` → "그 섹션이 직접 소유하는 것", 목록 머리 "추출 가능한 경계" → "떼어 낼 수 있는 경우"
- [ ] `appliesWhen` 2번째 줄의 "…경계를 소유하는지" → "…를 직접 소유하는지"
- [ ] 파일명·ID 는 유지. `routing-evals.json`·테스트의 `appliesWhen` 오라클만 갱신
- [ ] 검증 게이트 + 커밋

---

## Task 6: react 05-04 예제 교체 (항목 6)

**Files:** Modify `skill/react/rules/05-04-screen-keep-derived-values-close.md`

문제: Correct 예제 셋이 전부 출처 없는 식별자(`selectedRows`, `selectedCategoryState`, `selectedNodeContext`)로 시작한다. 출처를 가르치는 규칙인데 예제에 출처가 없다.

- [ ] Correct 예제를 선언과 사용을 함께 보여 주는 하나의 블록으로 교체
- [ ] 본문의 `오리진` 2곳을 `출처` 로 통일
- [ ] `titleKo` 의 "파생 값" → "다른 값에서 계산한 값"
- [ ] 검증 게이트 + 커밋

---

## Task 7: 설정 키 표기 통일 + 구분 근거 (항목 8·9)

**Files:** Modify `skill/typescript/rules/01-02`, `01-04`

`01-01` 은 `default_page_size`(snake), `01-02` 는 `chartAxisTickCount`(camel). 같은 종류의 값이 쓰는 사람 수에 따라 표기가 달라지고, `01-02` 는 "두 번째 소유자가 쓰면 `01-01` 로 올린다" 고 적어 뒀다. 올릴 때마다 키를 전부 개명해야 한다.

- [ ] `01-04`: "공용 설정 객체의 키" → "선언형 설정 객체의 키(공용이든 소유자 전용이든)"
- [ ] `01-04`: 구분 근거 한 문장 추가 — "이름을 우리가 완전히 소유하는 값은 `snake_case`, 언어·라이브러리와 맞물리는 이름은 `camelCase`"
- [ ] `01-02` 예제: `chartAxisTickCount` → `chart_axis_tick_count`
- [ ] 검증 게이트 + 커밋

---

## Task 8: 타입 파생을 인덱스 접근 한 형태로 고정 (항목 10)

**Files:** Modify `skill/typescript/rules/02-01`, `02-03`, `skill/nestjs/rules/03-04`

- [ ] `02-01` Correct 를 `interface` + `Origin["field"]` 로 교체하고 `Pick`/`Omit` 을 규범에서 뺀다
- [ ] 근거를 본문에 적는다: 필드가 그대로 보이고, 필드별 문서 주석을 달 수 있고(`02-03` 이 요구), 출처가 필드마다 남는다
- [ ] `02-03` 의 "`Pick`, `Omit`, 인덱스 접근 별칭: 필드가 없으므로 헤더만 씁니다" 를 수정 — 필드를 가진 파생 `interface` 는 필드 주석 대상이고, 필드가 없는 별칭(`type EntryId = EntryRecord["id"]`)만 헤더만 쓴다
- [ ] `nestjs/03-04` 의 `Omit<User, "password">` 예제 교체
- [ ] 검증 게이트 + 커밋

---

## Task 9: 보조 함수 추출 조건 강화 + 경계 재정리 (항목 11·12)

**Files:** Modify `skill/typescript/rules/03-03`, `03-04`

겹침의 증거: `03-04` 의 규범("내보낸 함수가 또 다른 내보낸 함수를 타고 가는 사슬은 만들지 않는다")과 `03-03` 의 두 번째 Incorrect 가 같은 위반이다. `03-04` 도 같은 사슬을 자기 Incorrect 로 또 보여 준다.

- [ ] `03-03` = **뺄까 말까**. 조건을 강화한다:
  - 같은 파일 안에서만 쓰이면 **몇 번 반복되든 빼지 않는다**
  - 서로 다른 파일의 소유자 **둘 이상**이 지금 직접 호출할 때만 뺀다
  - 뺀 함수는 바깥 상태·훅·컴포넌트 상태를 쓰지 않아야 한다
  - 조건과 무관하게 빼지 않는 것: 본문 한 줄 계산 / 호출부가 한 곳 / `.map()` 콜백 하나에만 쓰이는 변환
- [ ] `03-03` 의 누적 사슬 Incorrect 를 `03-04` 로 이동. 코드 블록 7 → 4
- [ ] `03-04` = **어디 두고 언제 올릴까 + 호출 사슬 깊이**
- [ ] `appliesWhen` 의 "잔손질 단계" → "자잘한 정리 단계"
- [ ] 검증 게이트 + 커밋

---

## Task 10: `??` 정책을 한 방향으로 (항목 13)

**Files:** Modify `skill/typescript/rules/04-01`, `skill/css/rules/03-04`

현재 예외 조건이 "이유 주석이 있으면 통과" 다. 지난 세션 검토가 "주석 하나로 통과되는 예외" 를 결함으로 지목한 것과 같은 모양이다.

- [ ] 규범 교체: **`??`·`||` 오른쪽에 리터럴을 적지 않는다. 이미 선언된 이름만 가리킨다.**
  - 전역 기본값 → `config.*` (`01-01`)
  - 소유자 전용 기본값 → 소유자 `config` 폴더 (`01-02`)
- [ ] `docs-justify-convention-exceptions-with-a-reason-comment` 참조 삭제(`reviewWith` 포함)
- [ ] `items ?? []` 도 리터럴이라 위반임을 명시하고 `items?.map(…)` 을 보인다
- [ ] 선택 값을 그대로 비교하면 기본값이 필요 없다는 예제 추가 (`props.variant === "compact"`)
- [ ] `impactDescription`: "그 자리에서 지어낸 값으로 없음을 덮지 않아 빠진 데이터가 드러납니다"
- [ ] `css/03-04` 의 `variant = "default"` 기본값 제거
- [ ] 검증 게이트 + 커밋

---

## Task 11: 주석 규칙 경계 복원 (항목 14·15)

**Files:**
- Rename: `skill/typescript/rules/05-01-docs-keep-inline-comments-for-constraints-and-caveats.md` → `05-01-docs-keep-body-comments-for-intent-and-steps.md`
- Modify: `05-03`, `04-01`(참조), `skill/typescript/routing-evals.json`, `skill/react/routing-evals.json`, 테스트 오라클

`05-01` 은 "이 규칙은 어디에 두는지만 봅니다" 라고 적어 놓고 Incorrect 로 내용 위반(`// count를 1 증가시킨다`)을 든다.

- [ ] `05-01` = **본문 주석을 언제 다는가**. 허용 목록에 **긴 절차의 단계 구분** 추가
- [ ] `05-01` Incorrect 를 본문 블록 주석 + 코드 반복 서술로 교체
- [ ] `05-03` = **모든 주석을 어떤 말로 쓰는가**. "짧게" 삭제
- [ ] `05-03` `titleKo`: "주석은 목적과 제약을 한국어로 적습니다"
- [ ] 길이 대신 금지 형태로 통제: 코드를 옮겨 적은 문장, 영문 전용, `@param` 나열
- [ ] ID 참조 교체 (`ts/04-01`, evals 2개, 테스트)
- [ ] 검증 게이트 + 커밋

---

## Task 12: 어휘 치환 (항목 3)

**Files:** `skill/react/rules/*`, `skill/typescript/rules/*`, `skill/css/rules/*`

| 지금 | 바꿀 말 |
| --- | --- |
| 비자명한 | 읽어서 의도가 안 보이는 |
| 자명한 | 코드만 봐도 아는 |
| 정본이다 | 기준이다 |
| 결측 / 부재 | 값이 없는 상태 / 없는 값 |
| 잔손질 단계 | 자잘한 정리 단계 |
| 말단 파일/모듈 | 쓰는 파일마다 |
| 오리진 | 출처 |

`파생`(React 한국어 문서 용어)과 `계약`(규칙 모음의 기반 용어)은 유지한다.

- [ ] 치환 후 문장이 어색해진 곳을 손으로 다시 쓴다
- [ ] `grammar-checker` · `humanizer` · `style-guide` 를 바뀐 규칙 전체에 돌린다
- [ ] 검증 게이트 + 커밋

---

## Task 13: 오라클 재생성과 전체 검증

- [ ] `package/test/routing-evals.test.ts` 의 `{skill}RuleUniverse` · `{skill}RuleRouting` · `{skill}ScenarioStages` 를 `skill/*/rules` 와 `routing-evals.json` 에서 다시 만든다
- [ ] 전이 폐쇄: `requiresSelected` 를 따라 기대 목록을 닫고, 정본 순서로 정렬하고, 단조성을 맞춘다
- [ ] 예제 추출 + `tsc`: `Incorrect`/`Correct` 코드 펜스를 파일로 뽑아 `@types/react` 로 타입 체크 (`TS1xxx`·`TS2315`·`TS7006` 만 본다)
- [ ] 자기 위반 검사: 새로 생긴 것 2종 추가 — `} = props` 금지, `<>` 금지
- [ ] 검증 게이트 7종 전부

---

## Task 14: 서브에이전트 검토

- [ ] 검토 1 — 기술적 정확성: 예제가 컴파일되는가, 근거가 사실인가
- [ ] 검토 2 — 규칙 간 모순: 이번에 바뀐 규칙이 다른 규칙과 정반대를 지시하지 않는가
- [ ] 검토 3 — 판정 가능성: 새 문구가 코드를 보고 판정할 수 있는가
- [ ] 검토 4 — 한국어: `korean-skills` 판정
- [ ] 지적 사항 반영 후 검증 게이트 재실행
