---
name: Rule audit 2026-10-14
label: 2026-10-14 규칙 산문과 예제 전수 점검. 덜어낸 설명, 고친 예제, 규칙 사이 충돌과 남긴 결정
group: Research
order: 40
---

:::note[기록 시점]
2026-10-14 기준 146개 규칙을 한 번에 훑은 기록입니다. 규칙 수, 예제 파일 이름, 커밋 해시는 그날의 것이고 이후 바뀔 수 있습니다.
사이트가 있어 생성 핸드북은 없애고 `RULES_INDEX.md`와 `contracts/*.md`만 생성합니다.
:::

## 왜 했나

규칙 대부분은 Incorrect와 Correct 예제만 보면 뜻이 전해진다.
그런데 산문이 예제가 이미 보여 주는 것을 다시 말하거나, 근거와 주의 사항을 백과사전처럼 늘어놓아 읽는 비용이 컸다.
예제 쪽은 반대로 너무 작거나 세계관에서 벗어나 실제 구현에 그대로 쓰기 어려운 것이 있었다.
그래서 세 가지를 한 번에 봤다.

1. 산문을 예제가 보여 주지 못하는 것만 남기고 덜어낸다.
2. 예제가 실제 구현에 쓸 만한지, 틀린 곳은 없는지, 세계관과 맞는지 본다.
3. 규칙끼리 겹치거나 부딪히는 곳을 찾아 정리하거나 결정 대기로 남긴다.

## 산문 덜어내기

### 남기는 것과 지우는 것

| 남긴다 | 지운다 |
| --- | --- |
| 규칙 문장 한두 개와 판정 표, 흐름도 | 흐름도를 다시 말로 풀어 쓴 "차례로 보고 고릅니다" 문장 |
| 예제로는 알 수 없는 조건과 예외 | 왜 그런지 설명하는 근거 문장, 표준과 라이브러리 동작을 길게 옮긴 주의 사항 |
| 다른 규칙으로 넘기는 교차 참조 한 줄 | "다른 규칙이 정하는 것" 표처럼 참조만 모은 표 |
| 두 주제 이상일 때의 `###` 제목 | 주제 하나만 남은 뒤의 제목 |

문장 자체는 yoonmoon의 교정과 윤문 기준을 같이 적용했다.
합쇼체는 유지하고, 번역투와 피동, 상투어, 기계적인 나열은 고치되 뜻은 바꾸지 않았다.
Figma 스킬은 MCP 호출 순서처럼 코드 예제로 보여 줄 수 없는 절차가 많아 가장 적게 덜어냈다.

### 결과

| 스킬 | 규칙 | 지운 줄 | 더한 줄 | 커밋 |
| --- | --- | --- | --- | --- |
| typescript | 42 | 283 | 45 | `2f7302fc` |
| react | 54 | 410 | 89 | `fd99492a` |
| css | 34 | 212 | 76 | `afbb4ab9` |
| figma | 16 | 58 | 33 | `ee3e198c` |

줄 수에는 생성물인 `RULES_INDEX.md`와 `contracts/*.md`도 들어 있다.
`validate`가 120칸 폭, 한 문장 문단, 라벨 어미를 그대로 막아 주어 덜어낸 뒤에도 형식은 유지됐다.

## 예제 점검

예제는 `skill/examples.d.ts`의 세계관(관리자 콘솔, `Product`, `Order`, 상태 `draft`, `active`, `hidden`)과
Correct 예제의 타입 검사, Incorrect 예제의 구문 검사를 기준으로 봤다.

### 고친 것

| 스킬 | 예제 | 무엇이 문제였나 | 어떻게 고쳤나 |
| --- | --- | --- | --- |
| typescript | `01-03` | `JSON.stringify`로 만든 장난감 예제 | `toRoleLabel`처럼 세계관의 값을 쓰는 예제로 교체 |
| typescript | `04-03`, `05-03`, `06-02` | 짝이 되는 Incorrect와 Correct가 서로 다른 필드와 상태를 씀 | `ownerId`, `cancelled`, `row.id`로 맞춤 |
| react | `01-01` Incorrect 2, 3과 Correct 2, 3 | `props.children`만 그려 레이어 판정의 근거인 "무엇을 아는가"가 코드에 없음 | 배지는 `ProductStatus`를 받아 수정자를 정하고, 그래프는 `ChartPoint[]`와 접근 가능한 이름만 받음 |
| react | `03-02` | Correct가 `03-03`의 `TableCell` 예제와 같은 내용 | 버튼 래퍼로 바꿔 표시 프롭은 인덱스 접근, 자기 프롭은 직접 선언, 스타일 주입 지점은 닫는 모습을 보임 |
| react | `06-02` Correct 2 | 선언만 하고 쓰지 않는 `useState` 둘 | 두 상태를 섹션 프롭으로 내려보냄 |
| react | `08-03` Incorrect 1 | 화면이 판정하는 문제와 스토어 전체 의존 문제가 섞여 Incorrect 2와 겹침 | 선택자로 `set`만 꺼내고 화면의 판정만 남김 |
| react | `10-03` | 세계관에 없는 태그 목록 | 카테고리 목록으로 바꾸고 `[!code error]` 표시 추가 |
| css | 19개 Incorrect | 잘못된 줄에 `[!code error]` 표시가 없어 사이트에서 무엇이 문제인지 보이지 않음 | 표시 추가. `03-04`와 `04-06`은 엉뚱한 줄에 있던 표시를 옮김 |
| css | `04-03` | 세계관에 없는 `archived`, `deleted` 상태 | `draft`, `active`, `hidden`으로 교체 |
| figma | 5개 Incorrect | `[!code error]` 표시 없음 | 표시 추가. JSX 속성 식 안에서는 `{/* */}`가 구문 오류라 `//`를 씀 |

### 남긴 것

| 스킬 | 예제 | 이유 |
| --- | --- | --- |
| typescript | `03-09` Correct | 본문이 `{ /* … */ }`인 함수 목록. 이름 규칙이라 본문이 없어도 뜻이 전해진다 |
| react | `07-02` Correct 3, `08-03` Incorrect 1, `10-03` Incorrect 1 | `examples.d.ts`에 없는 이름을 쓴다. Incorrect와 검사 제외 조각이라 검사는 통과하지만 세계관 밖이다 |
| 전체 | 검사 제외 조각 15개 | 문장 한 개짜리 조각이라 타입 검사와 lint를 통과하지 못한다. 감싸서 검사에 넣을지는 결정 대기 |
| css | 대부분의 색 값 | `#1677ff` 같은 원시 색을 그대로 쓴다. 테마를 켠 프로젝트면 `values-switch-themes-by-changing-token-values`에 따라 토큰이어야 한다 |
| figma | `.txt` 예제 | 호출 기록과 보고 형식이라 도구로 검사하지 못한다 |

## 규칙 사이 충돌과 중복

| 규칙 | 내용 | 처리 |
| --- | --- | --- |
| react `composition-split-owner-parts-only-for-runtime-boundaries`, `screen-extract-local-section-components-for-runtime-boundaries` | 분리 근거 표가 거의 같다. 대상 레이어만 다르다 | 서로 참조하는 문장만 남김. 표를 하나로 합칠지는 결정 대기 |
| react `data-shape-query-data-with-select`, `data-combine-multiple-queries-with-combine` | 메모이제이션 주의 문장이 두 규칙에 반복됨 | `select` 규칙에만 남김 |
| react `screen-keep-derived-values-close`, typescript `functions-name-a-value-only-for-recompute-or-judgment` | 계산 위치와 이름 붙이기가 한 규칙에 섞여 있었다 | React 규칙은 소유 파일 안의 계산 위치만 정하고 이름은 TypeScript 규칙으로 넘김 |
| react `typing-open-dom-props-in-three-steps`, typescript `types-derive-subsets-with-indexed-access` | 2단계의 `Omit`이 TypeScript 규칙과 맞는지 | 원본을 따라가야 하는 열린 집합에 `Omit`을 쓴다는 점이 같다. 일치 확인 |
| react `docs-require-jsdoc-on-key-declarations`, typescript `docs-require-header-jsdoc-on-key-declarations` | 필수 대상이 두 곳에 있다 | React 규칙은 추가 대상만 선언하는 형태로 정리됨 |
| react `runtime-avoid-ad-hoc-loading-branches`, `runtime-place-error-boundaries-by-blast-radius` | 캐시가 있는 재조회 실패를 두 규칙이 다룸 | 로딩 규칙은 오류 규칙으로 넘기는 한 줄만 남김 |
| css `selector-do-not-group-classes-with-commas`, `a11y-namespace-keyframes-and-respect-reduced-motion` | 움직임 감소 Correct가 `*, *::before, *::after`를 쉼표로 묶는데 쉼표 규칙에 예외가 없었다 | 쉼표 규칙 표에 전역 스타일시트의 전체 선택자 묶음은 대상이 아니라는 행을 더함 |
| css `values-tokenize-repeated-visual-values`, `values-switch-themes-by-changing-token-values` | 한 파일 값은 그대로 두라는 규칙과 테마 프로젝트의 색은 항상 토큰이라는 규칙 | 산문은 서로 참조한다. 예제 세계관이 테마를 켠 프로젝트인지 정하지 않아 예제가 갈린다. 결정 대기 |
| css `composition-do-not-style-through-the-style-attribute`, react `typing-open-dom-props-in-three-steps` | `HTMLAttributes` 상속이 `style`을 연다 | 양쪽이 한 줄씩 참조. 유지 |
| figma `intent-treat-frame-sizes-and-sample-text-as-samples`, css `layout-reach-for-intrinsic-sizing-before-breakpoints` | 같은 판단을 서로 모른 채 적음 | Figma 규칙이 CSS 규칙을 참조하도록 더함 |

## 남긴 결정

| 결정 | 선택지 |
| --- | --- |
| 분리 근거 표를 하나로 합칠지 | `widget`, `ui`용과 라우트 진입용을 한 규칙으로 합치거나, 지금처럼 둘 다 두고 참조만 유지 |
| 예제 세계관에 테마가 있는지 | 있다면 CSS 예제의 원시 색을 모두 토큰으로 바꾼다. 없다면 `values-switch-themes-by-changing-token-values` 예제만 토큰 파일을 가진 별도 세계로 둔다 |
| 검사 제외 조각 15개 | 컴포넌트로 감싸 검사에 넣을지, 조각으로 두고 제외 목록을 유지할지 |
| `examples.d.ts` 밖의 이름 | Incorrect 예제도 선언을 요구할지. 요구하면 Incorrect가 보여 주려는 잘못을 선언이 가려 줄 수 있다 |

## 커밋

| 커밋 | 내용 |
| --- | --- |
| `2f7302fc`, `6aac5b96` | TypeScript 산문과 예제 |
| `fd99492a`, `eefa3c9e` | React 산문과 예제 |
| `afbb4ab9`, `dfc6e8ea` | CSS 산문과 예제 표시 |
| `ee3e198c`, `0c9740fd` | Figma 산문과 예제 표시 |
| `16bf6f55` | 문장 교정, 쉼표 규칙 예외 행, Figma와 CSS 교차 참조 |
