# 인수인계 — agent-conventions 규칙 정비

이 세션에서 한 일과 남은 일. 커밋 37개, `3d89652`(가장 오래됨) ~ `fd19ad9`(HEAD).
브랜치 `main`, 미커밋 0건, **원격에 푸시하지 않았다.**

## 현재 상태

| 스킬 | 규칙 수 | 비고 |
| --- | --- | --- |
| react | 41개 / 10절 | progressive, 핸드북 노출 |
| typescript | 26개 / 6절 | progressive, react·css 의 `required` 동반 |
| css | 26개 / 6절 | progressive |
| astro · tanstack-route · playwright-test · nestjs · figma-visual-parity | 127개 | **이번 세션에서 손대지 않음** |

검증 명령 다섯 개가 모두 통과한다. 규칙을 고치면 반드시 다섯 개를 다 돌린다.

```bash
npm --prefix package run validate -- --all     # 8/8
npm --prefix package run build -- --all
npm --prefix package run viewer                # conventions.html + conventions-data.js
npm --prefix package run test                  # 152/152
npm --prefix package run typecheck
npm --prefix package run check:artifacts
npm --prefix package run biome:check:all
```

## 한 일 — 큰 줄기 여섯

### 1. css 규칙을 소유 기준으로 재편했다

`slug` 가 다르면 금지 같은 판정 불가 기준을 걷어내고, "내 파일이 소유하지 않은
클래스는 내 최상위 클래스 블록 안에서만 쓴다" 하나로 모았다. 범위 접두사는
`pg_`·`wg_`·`ui_` 셋. 결합자 상한은 우리 체이닝과 라이브러리 경로를 개수로 구분할 수
없어서 없앴고, 대신 `max-nesting-depth: 1` 로 중첩을 막는다.

6절 `Tooling` 에 stylelint 설정을 넣었다. 설정을 실제로 돌려 검증했다 —
`Correct` 예제 33개 오탐 0건, `Incorrect` 26개 중 13개 적발.

### 2. 핸드북 한국어를 다시 썼다

문체 규정을 문서에서 없애고 `korean-skills`(`humanizer`·`grammar-checker`·
`style-guide`)의 판정을 따르기로 했다. `.agents/skills/` 에 vendoring, `.claude/skills/`
에 symlink.

- `titleKo` 를 명사형에서 `~합니다` 문장형으로 바꿨다
- 영어 낱말 200여 곳을 한국어로 옮겼다. 코드에 그대로 나타나는 것은 백틱을 씌운다
- `질의`·`변경 요청` → `쿼리`·`뮤테이션`. 라이브러리가 부르는 이름은 번역하지 않는다
- 뷰어에서 문장 단위 줄바꿈(`word-break: keep-all` + 조건부 `<br>`)

### 3. 뷰어를 고쳤다 (`package/src/viewer-template.ts`)

- 본문 백틱이 규칙 ID 면 코드가 아니라 **열 수 있는 칩**으로 그린다 (46곳)
- `함께 적용`·`함께 검토` 를 칩에서 **행 목록**으로 바꿨다. skill · 번호 · 제목 ·
  이동 방향(`→` 같은 skill, `↗` 다른 skill). 라벨 옆에 개수와 한 줄 설명
- 제목의 `<code>` 에 본문 코드와 같은 배경
- **산문 이중 escape 버그**: `inline()` 이 전체를 escape 한 뒤 백틱을 찾아서
  `` `<Activity>` `` 가 `&amp;lt;` 가 됐다. 원문을 백틱으로 잘라 조각마다 한 번만
  escape 하고 코드 조각은 자리표시자로 빼 둔다
- 핸드북은 `progressiveDisclosure: true` 인 스킬만 노출한다

### 4. 중복 규칙을 지웠다

typescript 가 `required` 동반이라 항상 켜지는데 react 에 같은 말이 적혀 있었다.

지운 것: react `ownership-import-react-types-directly`(lint 가 하는 일),
`ownership-shared-config-entry-points`, `ownership-use-consistent-file-and-symbol-naming`,
`docs-limit-inline-comments-to-non-obvious-logic`, `composition-use-activity-for-render-branches`,
`composition-prefer-arrow-functions-and-object-params`, `screen-extract-utilities-selectively`,
`typing-reuse-existing-contracts` / typescript `types-reuse-callback-signatures-from-existing-contracts`,
`guardrails-review-banned-typescript-shortcuts-before-finishing`

`04-06`(Activity)을 지웠더니 예제 3곳이 규범 없이 남는 회귀가 났다. 나중에
`04-05` 로 되살렸다. **규칙을 지울 때 그 규칙이 세운 것을 다른 규칙 예제가 쓰고
있는지 반드시 훑어야 한다.**

### 5. 규칙을 결정 단위로 쪼갰다

byte·글자 수 상한 셋(1600B 계약, RULES_INDEX, `titleKo` 40자)을 없앴다. 상한이 하는
일은 규범을 짧게 쓰도록 압박하는 것뿐이었다. `appliesWhen` 160자는 남겼다 — 라우팅
문장을 한 줄로 유지하는 형식 제약이다.

쪼갠 여덟: react 이름↔커링, 레이어 판정↔접두사, 구조 선택↔공개 부품, 문서 대상↔부품
배치 / ts 문서 대상↔형식↔태그, 배럴↔별칭, 공용 설정↔소유자 설정, 추출 판정↔배치·승격

새로 만든 것: react `04-05` Activity, `04-06` 프롭스 interface, `05-05` Suspense 경계
/ ts `03-01` 화살표 선언, `05-06` 예외 이유 주석, `06-01` biome 도구 설정

판정할 수 없던 문구 13곳을 관찰 조건으로 바꿨다. 가장 큰 것은 react 1.1 의
"맥락 독립성" — 이 CRITICAL 규칙이 "props 만 받는가" 를 근거로 삼아 규칙 모음이 스스로
`Correct` 로 제시한 컴포넌트까지 위반으로 몰았다.

### 6. typescript 에 biome 도구 섹션을 만들었다

eslint 는 쓰지 않으므로 biome 만. `biome` 2.5.6 으로 예제 59개를 실제로 돌려 검증했다
(`Correct` 오탐 0건). 검증하며 알게 된 것:

- `noNamespaceImport` 는 style 이 아니라 **performance** 그룹
- `noRestrictedImports` 는 2.5 에서 nursery 를 벗어나 style 로 옮겼다
- `useNamingConvention` 은 "enum 성격 상수 객체" 를 구분할 수 없다.
  모듈 최상위 `const` 에 세 표기를 허용하고 어느 쪽이 맞는지는 리뷰가 본다
- `useConst` 는 `let` 을 `const` 로 바꿔 주기만 하고 `push` 누적은 남긴다
- `kind: "function"` 선택자는 화살표 선언 규칙 때문에 잡을 대상이 없다
- 함수 이름의 `camelCase` 도 결국 리뷰 몫이다

## 검토 방식과 결과

서브에이전트로 두 라운드를 돌렸다.

**1라운드(5개)** — react 판정 가능성 / typescript 판정 가능성 / 스킬 경계 / 기술적
정확성 / 세분화·구조. 약 100건.

**2라운드(2개)** — 이 세션에서 새로 쓴 30개 규칙(1라운드 대상이 아니었다) /
쪼갠 뒤 경계. 61건.

에이전트가 실제로 잡은 것 중 심각했던 것:

- **예제 코드에 NUL 바이트 8개** (내 치환 스크립트가 남겼다)
- **컴파일되지 않는 `Correct` 예제 5건** — `<Activity>` children 필수,
  `EntryCursor.buffer` 미선언, `ts` 펜스에 JSX, `MouseEvent<T>` import 누락
- **무한 루프 이펙트** — `useAccessStore()` 를 선택자 없이 부르고 deps 에 넣은 채
  안의 setter 를 호출. HIGH 규칙의 유일한 긍정 예제가 앱을 멈췄다
- **사실이 틀린 근거 2건** — `select` 가 fetch 시점에 한 번 돈다(아니다, 렌더마다
  돈다), 커링 팩토리 안쪽 함수가 문맥 타입을 받는다(아니다, TS7006)
- **주석 하나로 통과되는 예외 5개** — 9.1 의 `Incorrect` 와 `Correct` 가 바이트
  단위로 같고 주석만 달랐다
- **같은 코드에 정반대를 지시하는 쌍 9개**

**중요**: 에이전트는 **표본만** 본다. bare `className` 을 4곳 지목했는데 실제로는
13곳, 접두사 없는 컴포넌트를 2곳 지목했는데 실제로는 14곳이었다. 기계 검사를 짜서
훑어야 다 잡힌다.

## 앞으로 할 일

### 우선 — 자기 위반 검사를 저장소에 넣기

세션용으로 짠 검사를 `validate` 에 붙이지 않았다. 넣으면 다음에 예제를 고칠 때
자동으로 막힌다. 지금 확인하는 것 9종:

bare/삼항 `className`(css 3.1) · 계층 접두사(react 1.2) · 인라인 프롭스 타입(4.6) ·
JSX 인라인 화살표(4.3) · 바인딩 접두사(7.1) · `function` 선언문(ts 3.1) ·
한 줄 문서 주석(ts 5.4) · 역할 태그(ts 5.5) · 프롭스 타입 이름 일치(4.6)

예외로 둘 것: `Incorrect` 블록, `tooling` 규칙(외부 도구 규칙 이름을 대량 인용),
합성 부품이 나눠 쓰는 프롭스 타입(`UiSectionProps` 등).

### 안 한 것

1. **다른 스킬 5개 검토** — astro 42 · tanstack-route 24 · playwright-test 25 ·
   nestjs 21 · figma-visual-parity 15 = 127개. astro 는 react 와 겹칠 가능성이 크다
2. **css 26개 자체 검토** — 이번 경계 검토는 react 와의 겹침만 봤다.
   판정 가능성·예제 정확성은 안 봤다
3. **biome 설정을 실제 프로젝트에 넣기** — 규칙에 적어 뒀지만 어디에도 적용 안 했다
4. **원격 푸시** — `refactor/owner-based-structure-rules` 브랜치가 오래된 지점에 있다

## 작업 도구 (scratchpad, 세션이 끝나면 사라진다)

규칙을 고치면 테스트 오라클을 다시 만들어야 한다. `package/test/routing-evals.test.ts`
가 규칙 ID·`appliesWhen`·`reviewWith`·시나리오를 통째로 하드코딩하고 있어서 손으로
고치면 끝이 없다. 다음 세션에서 다시 짜야 한다.

- **오라클 재생성** — `{skill}RuleUniverse`, `{skill}RuleRouting`,
  `{skill}ScenarioStages` 를 `skill/*/rules` 와 `routing-evals.json` 에서 다시 만든다.
  `package/` 에서 돌린다
- **전이 폐쇄** — `requiresSelected` 를 따라가 시나리오 기대 목록을 닫고, 정본 순서
  (섹션 번호 → 섹션 내 번호)로 정렬하고, 단조성(이후 단계가 초기 선택을 포함)을 맞춘다
- **예제 추출 + tsc** — `Incorrect`/`Correct` 코드 펜스를 파일로 뽑아
  `@types/react` 로 타입 체크한다. 조각이라 `TS2304`·`TS2307` 은 무시하고
  `TS1xxx`·`TS2315`·`TS7006` 만 본다
- **자기 위반 검사** — 위 9종

## 알아 둘 것

- **규칙 ID = 파일명 − `NN-MM-` prefix − `.md`.** 번호 재배치는 공짜, ID 변경은
  `routing-evals.json` 2곳 + 참조하는 규칙 본문 + 테스트를 다 고쳐야 한다
- **아래 계층이 위 계층을 가리키면 안 된다.** typescript 가 `react/...` 를 가리키면
  typescript 만 쓰는 쪽에서 끊긴다. `validate` 가 막는다
- **`**Impact:` 줄은 frontmatter 를 정확히 반영해야 한다.** `impactDescription` 을
  고치면 본문 줄도 같이 고친다
- 규범 영역(첫 `**Incorrect` 앞)에 **코드 펜스를 둘 수 없다.** 표를 쓴다
- 새 규칙은 **최소 한 시나리오에서 걸려야 한다**
- 생성물(`HANDBOOK.md`·`RULES_INDEX.md`·`contracts/*.md`·`conventions.html`·
  `conventions-data.js`)을 직접 고치지 않는다

## 사용자가 정한 것

- 테스트 코드는 명시적으로 요청하지 않으면 제품 프로젝트에 만들지 않는다
- `gas-pp` 는 마이그레이션 대상이 **아니다**. 규칙은 다음 프로젝트에 적용한다
- 행동 eval 은 다시 돌리지 않는다
- `pressure-tests.md` 는 필요 없다 (4개 전부 삭제)
- byte·글자 수 상한은 신경 쓰지 않는다
- 규칙 수는 늘려도 된다. 압축보다 세분화
- eslint 는 쓰지 않는다. biome 만
