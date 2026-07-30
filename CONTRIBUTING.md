# 규칙 고치기

`skill/` 아래 컨벤션 규칙을 수정·추가하는 기여자용.
컨벤션을 쓰기만 한다면 [README.md](./README.md).

가장 흔한 사고는 생성물을 직접 고치는 것이다.
`rules/*.md` 만 정본이고 `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` 는 build 가 매번 다시 만든다.

---

## 목차

1. [스킬 구조](#1-스킬-구조) — 파일별 역할과 정본 여부
2. [규칙 추가 절차](#2-규칙-추가-절차) — 여섯 단계
3. [Rule frontmatter](#3-rule-frontmatter) — 키 레퍼런스
    - 3.1 [appliesWhen 작성 기준](#31-applieswhen-작성-기준)
    - 3.2 [requiresSelected 와 reviewWith](#32-requiresselected-와-reviewwith)
4. [배치 기준](#4-배치-기준) — 어느 skill 에 둘 것인가
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
    *.md              규칙 정본
  routing-evals.json  시나리오별로 걸려야 할 규칙의 테스트 오라클
  RULES_INDEX.md      생성물
  contracts/*.md      생성물
  HANDBOOK.md         생성물. 사람이 읽는 전체 핸드북
```

정본은 `rules/*.md` · `rules/_sections.md` · `rules/_template.md` · `metadata.json` ·
`SKILL.md` · `routing-evals.json` 여섯.

생성물은 `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` 셋.
직접 고치면 다음 build 에서 사라지고 `check:generated` 가 실패한다.

`react` · `typescript` · `css` 는 progressive 라 셋 다 생성한다.
나머지 다섯은 `HANDBOOK.md` 만 생성하고 에이전트가 통째로 읽는다.

---

## 2. 규칙 추가 절차

1. `rules/_sections.md` 에서 섹션을 정한다. 제목 괄호 안이 파일명 prefix.
2. `rules/_template.md` 를 `rules/<prefix>-<설명>.md` 로 복사한다.
3. frontmatter 를 채운다. `appliesWhen` 은 관찰 가능한 변경으로 쓴다.
4. 본문을 쓴다. 규범과 예외를 첫 `Incorrect` 앞에서 끝낸다.
5. progressive skill 이면 `routing-evals.json` 에 걸리는 시나리오를 넣는다.
6. [5절](#5-명령) 명령으로 재생성하고 검증한다.

주의할 것.

- `## 1. Ownership and Boundaries (ownership)` 섹션이면 파일명은 `ownership-*.md`.
- 첫 `Incorrect` 뒤에는 `Incorrect` / `Correct` 라벨, 코드 펜스, 빈 줄만 온다.
  생성되는 `contracts/*.md` 가 첫 `Incorrect` 앞부분만 뽑기 때문이다.
- 모든 규칙은 최소 한 시나리오에서 걸려야 한다.
- 문단은 문장 단위로 끊고 120칸을 넘기지 않는다. `docs/semantic-wrap.py` 가 정리한다.
- `**Impact:` 로 시작하는 줄은 한 줄로 유지한다. build 가 그 형태로 파싱한다.

---

## 3. Rule frontmatter

```markdown
---
title: Rule Title Here
titleKo: 사람이 화면에서 읽을 한국어 제목
impact: MEDIUM
impactDescription: 영향도 설명. contracts 로 나가는 에이전트용 원문
impactDescriptionKo: 사람이 화면에서 읽을 한국어 영향도 설명
appliesWhen: 이 규칙이 걸리는 변경을 한 문장으로
requiresSelected: 함께 반드시 걸리는 rule-id, companion-skill/cross-rule-id
requiredOnCompletion: true
reviewWith: 함께 다시 판단할 rule-id, companion-skill/cross-rule-id
tags: tag1, tag2
---
```

| 키 | 필수 | 의미 |
| --- | --- | --- |
| `title` | 필수 | 영어. 핸드북 헤딩과 앵커 슬러그의 기반. 바꾸면 링크가 깨진다 |
| `titleKo` | 필수 | 한국어. `conventions.html` 에 노출된다. 40자 이내 |
| `impact` | 필수 | `CRITICAL` · `HIGH` · `MEDIUM` · `LOW` |
| `impactDescription` | 필수 | 영향도 설명. 본문 `**Impact:**` 줄과 일치해야 하고 `contracts/*.md` 로 나간다 |
| `impactDescriptionKo` | 필수 | 한국어. `conventions.html` 에 노출된다 |
| `appliesWhen` | 필수 | 비어 있지 않은 한 줄. 160자 이내 |
| `requiresSelected` | 선택 | 걸리면 target 도 반드시 함께 적용 |
| `reviewWith` | 선택 | 자동 선택이 아니라 다시 판정하라는 재평가 힌트 |
| `requiredOnCompletion` | 선택 | 마무리 시 항상 적용 |
| `tags` | 선택 | 검색용 |

`titleKo` 는 영어 제목의 직역이 아니라 같은 뜻의 자연스러운 한국어로 쓴다.
코드 식별자는 영어로 남긴다. 보고서 목차처럼 명사형으로 끝맺고
`~하기` · `~않기` 같은 동작 지시형 어미는 쓰지 않는다.

```markdown
title: Use Named Handlers Instead of Hiding Logic in JSX
titleKo: JSX 인라인 로직의 명명된 핸들러 분리
```

`impactDescription` 계열은 `~합니다` 로 끝나는 한 문장으로 쓰고, 본문 산문도 `~합니다` 문체로 통일한다.
`appliesWhen` 은 라우팅용 텍스트라 예외로 `~한다` 서술을 유지한다.

섹션도 한국어 제목이 필수다. `rules/_sections.md` 의 각 헤더 아래,
**`**Impact:**` 위**에 넣는다. `**Description:**` 뒤에 놓으면 description 값으로 삼켜진다.

```markdown
## 1. Ownership and Boundaries (ownership)
**TitleKo:** 소유와 경계
**Impact:** CRITICAL
**Description:** …
```

### 3.1 appliesWhen 작성 기준

규칙의 결론을 반복하지 않는다. diff 나 요청에서 관찰 가능한 조건을 쓴다.
애매하면 걸리는 쪽으로 보수적으로 쓴다.

```yaml
# 나쁨 — 규칙의 결론을 반복
appliesWhen: 핸들러를 명명해서 써야 한다.

# 좋음 — 언제 읽어야 하는지
appliesWhen: TSX event prop 의 인라인 callback 에 분기, 비동기 호출 또는 여러 동작을 추가·수정한다.
```

### 3.2 requiresSelected 와 reviewWith

| 항목 | `requiresSelected` | `reviewWith` |
| --- | --- | --- |
| 성격 | 논리적 필수 관계 | 재평가 힌트 |
| 자동 적용 | 적용 | 적용 안 함 |
| cross-skill | target 의 companion 까지 활성화 | 해당 없음 |
| 방향 | 단방향 | 단방향. 역방향 추론 금지 |

- 대상이 없으면 그 optional key 를 생략한다.
- 같은 target 을 두 키에 중복해서 넣지 않는다.
- `_` 로 시작하는 파일은 생성물에서 빠진다.
- 섹션은 파일명 prefix 로 정해지고 순서는 제목 순으로 자동 생성된다.

---

## 4. 배치 기준

여러 프레임워크 공통이면 `typescript` 또는 `css` 에 둔다.
generic TypeScript 규칙은 `skill/typescript` 가 정본이다.

특정 프레임워크 전용이면 그 skill 의 local rule 로 둔다.

프로젝트 하나에만 해당하면 이 저장소가 아니라 그 프로젝트의 `AGENTS.md` 로 보낸다.
기존 프로젝트 경계를 공통 pack 으로 끌어올리지 않는다.

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

`conventions.html` 은 생성물이다. 직접 편집하지 않는다.
규칙을 고쳤으면 `npm --prefix package run viewer` 로 다시 만든다.
낡은 채로 커밋하면 `check:viewer` 가 막는다.

`skill/<name>` 안에서 작업하면 `--prefix ../../package` 로 바꾼다.
자세한 script 설명은 [package/README.md](./package/README.md).

`react` · `typescript` · `css` · `figma-visual-parity` 에는 `pressure-tests.md` 가 있다.
규칙을 크게 바꿨을 때 회귀 확인용이고 정본은 아니다.

---

## 6. 함께 갱신할 문서

| 변경 | 갱신 대상 |
| --- | --- |
| skill 추가·제거 | [README.md](./README.md) 의 skill 표, [AGENTS.md](./AGENTS.md) 의 목록 |
| 로딩·companion 계약 변경 | [AGENTS.md](./AGENTS.md) |
| 구조 자체 변경 | [overview.html](./overview.html). 생성기는 `docs/overview-flowcharts.py` |

이 저장소에서 AI 에이전트로 작업할 때의 규칙은 [AGENTS.md](./AGENTS.md).
