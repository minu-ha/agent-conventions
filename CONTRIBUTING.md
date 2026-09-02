# 규칙 고치기

`skill/` 아래 컨벤션 규칙을 수정·추가하는 기여자용.
컨벤션을 쓰기만 한다면 [README.md](./README.md).

가장 흔한 사고는 생성물을 직접 고치는 것이다.
`rules/*.md`만 정본이고 `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md`는 build가 매번 다시 만든다.

---

## 목차

1. [스킬 구조](#1-스킬-구조) — 파일별 역할과 정본 여부
2. [규칙 추가 절차](#2-규칙-추가-절차) — 여섯 단계
3. [Rule frontmatter](#3-rule-frontmatter) — 키 레퍼런스
    - 3.1 [appliesWhen 작성 기준](#31-applieswhen-작성-기준)
    - 3.2 [requiresSelected와 reviewWith](#32-requiresselected와-reviewwith)
    - 3.3 [낱말 고르기](#33-낱말-고르기)
4. [배치 기준](#4-배치-기준) — 어느 skill에 둘 것인가
5. [명령](#5-명령) — 재생성과 검증
6. [함께 갱신할 문서](#6-함께-갱신할-문서)

---

## 1. 스킬 구조

```text
skill/react/
  SKILL.md            에이전트 라우터. 변경 판정 후 규칙 선택
  metadata.json       버전 · 개요 · companion 활성화 계약
  rules/
    _sections.md      섹션 순서 · Impact · 설명. 괄호 안이 파일명 prefix
    _template.md      새 규칙 템플릿
    NN-MM-*.md        규칙 정본. 번호는 사람용 탐색 표지고 규칙 ID 에는 안 들어간다
  routing-evals.json  시나리오별로 걸려야 할 규칙의 테스트 오라클
  RULES_INDEX.md      생성물
  contracts/*.md      생성물
  HANDBOOK.md         생성물. 사람이 읽는 전체 핸드북
```

정본은 `rules/*.md` · `rules/_sections.md` · `rules/_template.md` · `metadata.json` ·
`SKILL.md` · `routing-evals.json` 여섯.

생성물은 `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` 셋.
직접 고치면 다음 build에서 사라지고 `check:generated`가 실패한다.

`react` · `typescript` · `css` 셋이 전부이고 셋 다 progressive라 세 생성물을 모두 만든다.

---

## 2. 규칙 추가 절차

1. `rules/_sections.md`에서 섹션을 정한다. 제목 괄호 안이 파일명 prefix.
2. `rules/_template.md`를 `rules/<NN>-<MM>-<prefix>-<설명>.md`로 복사한다.
   `NN`은 섹션 번호, `MM`은 섹션 안 규칙 번호로 둘 다 0을 채운 두 자리다.
   규칙 ID는 번호를 뺀 `<prefix>-<설명>`이라 중간 삽입으로 번호가 밀려도 참조는 깨지지 않는다.
   react처럼 번호를 쓰는 skill은 섹션 안에서 1부터 연속해야 하고 `validate`가 검사한다.
3. frontmatter를 채운다. `appliesWhen`은 관찰 가능한 변경으로 쓴다.
4. 본문을 쓴다. 규범과 예외를 첫 `Incorrect` 앞에서 끝낸다.
5. progressive skill 이면 `routing-evals.json`에 걸리는 시나리오를 넣는다.
6. [5절](#5-명령) 명령으로 재생성하고 검증한다.

주의할 것.

- `## 1. Ownership and Boundaries (ownership)` 섹션이면 파일명은 `ownership-*.md`.
- 첫 `Incorrect` 뒤에는 `Incorrect` / `Correct` 라벨, 코드 펜스, 빈 줄만 온다.
  생성되는 `contracts/*.md`가 첫 `Incorrect` 앞부분만 뽑기 때문이다.
- 한 쌍은 한 변수만 바꾼다. `Incorrect`와 `Correct`는 그 규칙이 말하는 것 하나만 달라야 독자가 무엇이 규칙인지 짚는다.
  이름·구조·무관한 코드를 함께 바꾸지 않는다.
- `Correct`는 저장소 전체 규칙을 지킨다. 다른 스킬의 규칙도 포함한다.
  `rule-discipline.ts`가 잡는 교차 위반(`mutateAsync` 없는 `try`, `li onClick`, 리터럴 폴백, 손으로 쓴 `sort`·`reduce`, 한 줄 JSX 주석, 스택 밖 이름 등)은 `validate`가 막는다.
- 라벨 괄호 안 문장은 코드가 보여 주는 것만 말한다. 규칙 문장을 되풀이하지 않는다.
- 라벨 괄호 안 문장은 규범 산문과 같은 합쇼체로 쓴다.
  `conventions.html`에서 예시 제목으로 서는 자리라 명사 종결이 섞이면 목록이 끊겨 읽힌다.
  `viewer.test.ts`가 408개 전부 `~니다`로 끝나는지 검사한다.
- 모든 규칙은 최소 한 시나리오에서 걸려야 한다.
- 문단은 문장 단위로 끊고 120칸을 넘기지 않는다. `docs/semantic-wrap.py`가 정리한다.
  한글은 두 칸으로 센다. `.editorconfig`의 `max_line_length`도 같은 값이다.
- 코드 펜스 안 인덴트는 탭이다. `package/biome.json`의 `indentStyle`과 맞춘다.
- `**Impact:`로 시작하는 줄은 한 줄로 유지한다. build가 그 형태로 파싱한다.

---

## 3. Rule frontmatter

```markdown
---
title: Rule Title Here
titleKo: 사람이 화면에서 읽을 한국어 제목
impact: MEDIUM
impactDescription: 이 규칙을 지키면 무엇이 달라지는지 한 문장
appliesWhen:
  - 이 규칙이 걸리는 변경 조건 불렛. ~할 때 로 끝맺는다
  - 제외: 걸리지 않는 조건
requiresSelected: 함께 반드시 걸리는 rule-id, companion-skill/cross-rule-id
requiredOnCompletion: true
reviewWith: 함께 다시 판단할 rule-id, companion-skill/cross-rule-id
tags: tag1, tag2
---
```

| 키 | 필수 | 의미 |
| --- | --- | --- |
| `title` | 필수 | 영어. 핸드북 헤딩과 앵커 슬러그의 기반. 바꾸면 링크가 깨진다 |
| `titleKo` | 필수 | 한국어. `conventions.html`에 노출된다 |
| `impact` | 필수 | `CRITICAL` · `HIGH` · `MEDIUM-HIGH` · `MEDIUM` · `LOW`. 에이전트 동작을 바꾸는 것은 `CRITICAL` 뿐이고 나머지는 사람이 읽는 우선순위 표시다 |
| `impactDescription` | 필수 | 한국어 영향도 설명. 본문 `**Impact:**` 줄과 일치해야 하고 `contracts/*.md`와 `conventions.html`로 나간다 |
| `appliesWhen` | 필수 | `- ` 조건 불렛 리스트 또는 한 줄 스칼라. 불렛이면 라우팅 문장은 이어 붙여 자동 생성된다. 라우팅 문장은 한 줄 160자 |
| `requiresSelected` | 선택 | 걸리면 target도 반드시 함께 적용 |
| `reviewWith` | 선택 | 자동 선택이 아니라 다시 판정하라는 재평가 힌트 |
| `requiredOnCompletion` | 선택 | 마무리 시 항상 적용. 지금 쓰는 규칙이 없다. 새로 켤 때는 세 `SKILL.md` 3절에 `completionGate` 지시를 함께 넣는다 |
| `tags` | 선택 | 검색용 |

`titleKo`는 영어 제목의 직역이 아니라 같은 뜻의 자연스러운 한국어로 쓴다.
코드 식별자는 영어로 남긴다. 그 규칙이 무엇을 보고 판정하는지가 제목에 드러나야 한다 —
`z-index` 규칙이면 제목에 `z-index`가 있어야 사람이 목록에서 찾는다.

```markdown
title: Use Named Handlers Instead of Hiding Logic in JSX
titleKo: JSX 안 로직은 이름 붙인 핸들러로 뺍니다
```

한국어 문장은 `humanizer`, `grammar-checker`, `style-guide` 스킬로 다듬는다.
`.agents/skills/`에 복사해 두었고, 없으면 `npx skills add daleseo/korean-skills`로 설치한다.
어미나 문체를 이 문서에서 규정하지 않는다. 세 스킬의 판정을 따른다.
다만 자리는 갈라 둔다 — `rules/*.md`·`_sections.md`·`metadata.json`의 `abstract`는 규범 산문이라 합쇼체,
코드 펜스 안 주석과 `SKILL.md`·`AGENTS.md`·`AGENTS.template.md`·`README.md`·이 문서는 절차 지시라 한다체다.
지금 이 선을 어기는 파일이 하나도 없다.
`appliesWhen`의 `~할 때` · `~경우`만 예외다. 그건 문체가 아니라 라우팅 문장을 만드는 규칙이라
`validate`가 강제한다.

`appliesWhen` 불렛은 `conventions.html`의 "언제 적용할까요?" 목록에 그대로 노출된다.
걸리는 조건은 `~할 때`로 끝맺고, 걸리지 않는 조건은 `제외:`로 시작해 `~경우`로 끝맺는다.
조건이 둘이면 불렛도 둘로 나눈다. 한 불렛에 쉼표로 이어 붙이지 않는다.
이 셋은 문체가 아니라 라우팅 문장 생성 규칙이다.
라우팅용 한 줄 문장은 불렛을 마침표로 이어 붙여 자동 생성되므로 항목 순서가 곧 문장 순서다.

섹션도 한국어 제목이 필수다. `rules/_sections.md`의 각 헤더 아래,
**`**Impact:**` 위**에 넣는다. `**Description:**` 뒤에 놓으면 description 값으로 삼켜진다.

```markdown
## 1. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** …
```

### 3.1 appliesWhen 작성 기준

규칙의 결론을 반복하지 않는다. diff나 요청에서 관찰 가능한 조건을 쓴다.
애매하면 걸리는 쪽으로 보수적으로 쓴다.

```yaml
# 나쁨 — 규칙의 결론을 반복
appliesWhen: 핸들러를 명명해서 써야 한다.

# 좋음 — 언제 읽어야 하는지
appliesWhen: TSX event prop의 인라인 callback에 분기, 비동기 호출 또는 여러 동작을 추가·수정할 때
```

### 3.2 requiresSelected와 reviewWith

| 항목 | `requiresSelected` | `reviewWith` |
| --- | --- | --- |
| 성격 | 논리적 필수 관계 | 재평가 힌트 |
| 자동 적용 | 적용 | 적용 안 함 |
| cross-skill | target의 companion까지 활성화 | 해당 없음 |
| 방향 | 단방향 | 단방향. 역방향 추론 금지 |

- 대상이 없으면 그 optional key를 생략한다.
- 같은 target을 두 키에 중복해서 넣지 않는다.
- 본문에서 다른 규칙을 백틱으로 가리키면 화면에서 열 수 있는 칩이 된다.
  `validate`가 해석되는지 검사하므로 없는 ID를 쓰면 빌드가 막힌다.
  `tooling` 규칙은 예외다. stylelint · biome 규칙 이름이 우리 prefix와 겹쳐서 검사를 건너뛴다.
  그래서 `tooling` 본문에서 우리 규칙을 가리킬 때는 `css/…`처럼 소유 skill을 붙여 도구 이름과 구분한다.
- 아래 계층 skill은 위 계층 규칙 ID를 가리키지 않는다.
  `typescript`가 `react/...`를 가리키면 typescript만 쓰는 쪽에서 끊긴다.
  frontmatter와 본문 산문 둘 다 해당하고 `validate`가 막는다.
  계층은 `metadata.json.companions`가 정한다. 나를 companion으로 켜는 skill이 위 계층이다.
  아래 계층에서 위 계층을 가리켜야 할 것 같으면 규칙 ID 대신 "프레임워크 규칙이 정한다" 처럼 skill 이름 없이 쓴다.
- `_`로 시작하는 파일은 생성물에서 빠진다.
- 섹션은 파일명 prefix로 정해지고 순서는 제목 순으로 자동 생성된다.

### 3.3 낱말 고르기

기술 용어를 우리말로 옮길지는 취향이 아니라 검색성 문제다.
기준은 하나다 — **그 낱말로 찾을 사람이 있으면 밖에서도 통하는 말로 쓴다.**

1. MDN · React · TypeScript 한국어 문서에 역어가 있으면 그 역어 (`쌓임 맥락`, `단언`, `좁히기`)
2. 없으면 통용 외래어 (`스크린 리더`, `브레이크포인트`, `이징`, `헤더`)
3. 코드에 문자열로 있는 것은 그대로 (`z-index`, `@media`, `useMemo`)

저장소가 지어낸 말은 쓰지 않는다. 밖 어디에도 없어서 그 낱말로는 규칙을 못 찾는다.
`rule-discipline.ts`의 `bannedTerms`가 이미 걸러 낸 말을 막고, 새로 발견하면 거기 추가한다.

한 개념은 저장소 전체에서 한 이름으로 부른다.
같은 것을 `지역 변수`와 `지역 사용자 정의 속성`으로 나눠 부르면 규칙끼리 참조할 때 같은 것인지 확신할 수 없다.

백틱 친 식별자 뒤 조사는 발음의 받침을 따른다 — `-is-real`은 [리얼] 이라 `이`, `-select`는 [셀렉트] 라 `가`.
같은 식별자가 파일마다 다른 조사를 달면 `validate`가 막는다. 어느 쪽이 맞는지는 사람이 정한다.

---

## 4. 배치 기준

여러 프레임워크 공통이면 `typescript` 또는 `css`에 둔다.
generic TypeScript 규칙은 `skill/typescript`가 정본이다.

특정 프레임워크 전용이면 그 skill의 local rule로 둔다.

프로젝트 하나에만 해당하면 이 저장소가 아니라 그 프로젝트의 `AGENTS.md`로 보낸다.
기존 프로젝트 경계를 공통 pack으로 끌어올리지 않는다.

---

## 5. 명령

```bash
npm --prefix package install                  # 최초 1회

npm --prefix package run dev:react            # 단일 skill validate + build
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
npm --prefix package run viewer                # conventions.html 재생성
npm --prefix package run check:generated:all  # 생성물과 source 일치 확인
npm --prefix package run check:handbooks:all
npm --prefix package run check:viewer
npm --prefix package run test
```

`conventions.html`과 `conventions-data.js`는 한 쌍의 생성물이다. 직접 편집하지 않는다.
데이터는 `conventions-data.js`에 있고 문서가 script src로 로드하므로 두 파일을 같은 폴더에 둔다.
규칙을 고쳤으면 `npm --prefix package run viewer`로 다시 만든다.
낡은 채로 커밋하면 `check:viewer`가 막는다.

`skill/<name>` 안에서 작업하면 `--prefix ../../package`로 바꾼다.
자세한 script 설명은 [package/README.md](./package/README.md).

---

## 6. 함께 갱신할 문서

| 변경 | 갱신 대상 |
| --- | --- |
| skill 추가·제거 | [README.md](./README.md) 의 skill 표, [AGENTS.md](./AGENTS.md) 의 목록 |
| 로딩·companion 계약 변경 | [AGENTS.md](./AGENTS.md) |
| 문서 인벤토리·명령 변경 | [package/README.md](./package/README.md) |
| 구조 자체 변경 | [overview.html](./overview.html). 생성기는 `docs/overview-build.py`이고 플로차트 SVG는 `docs/overview-flowcharts.py` |

이 저장소에서 AI 에이전트로 작업할 때의 규칙은 [AGENTS.md](./AGENTS.md).
