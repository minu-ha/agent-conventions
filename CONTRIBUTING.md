# 규칙 고치기

`skill/` 아래 컨벤션 규칙을 수정하거나 추가하는 기여자를 위한 문서입니다.
컨벤션을 적용하기만 한다면 [README.md](./README.md) 로 이동하십시오.

가장 흔한 사고는 생성물을 직접 고치는 것입니다.
`rules/*.md` 만 정본이고, `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` 는
build 가 매번 다시 만듭니다.

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

| 파일 | 정본 여부 | 비고 |
| --- | --- | --- |
| `rules/*.md` | 정본 | 규칙 본문 |
| `rules/_sections.md` | 정본 | 섹션 순서와 영향도 |
| `rules/_template.md` | 정본 | 새 규칙 템플릿 |
| `metadata.json` | 정본 | 빌드 입력과 companion 계약 |
| `SKILL.md` | 정본 | 활성화 라우터 |
| `routing-evals.json` | 정본 | progressive skill 전용 테스트 오라클 |
| `HANDBOOK.md` | 생성물 | 직접 편집 시 다음 build 에서 소실 |
| `RULES_INDEX.md` | 생성물 | progressive skill 전용 |
| `contracts/*.md` | 생성물 | progressive skill 전용 |

`react` · `typescript` · `css` 는 progressive skill 로 세 종류를 모두 생성하고,
나머지 다섯 개는 `HANDBOOK.md` 만 생성해 에이전트가 통째로 읽습니다.

---

## 2. 규칙 추가 절차

| 단계 | 작업 |
| --- | --- |
| 1 | `rules/_sections.md` 에서 섹션 결정. 제목 괄호 안이 파일명 prefix |
| 2 | `rules/_template.md` 를 `rules/<prefix>-<설명>.md` 로 복사 |
| 3 | frontmatter 작성. `appliesWhen` 은 관찰 가능한 변경으로 기술 |
| 4 | 본문 작성. 규범과 예외를 첫 `Incorrect` 앞에서 마무리 |
| 5 | progressive skill 이면 `routing-evals.json` 에 해당 시나리오 추가 |
| 6 | [5절](#5-명령) 의 명령으로 재생성 후 검증 |

세부 주의 사항은 다음과 같습니다.

1. `## 1. Ownership and Boundaries (ownership)` 섹션이면 파일명은 `ownership-*.md` 입니다.
2. 첫 `Incorrect` 뒤에는 `Incorrect` / `Correct` 라벨, 코드 펜스, 빈 줄만 허용됩니다.
   생성되는 `contracts/*.md` 가 첫 `Incorrect` 앞부분만 추출하기 때문입니다.
3. 모든 규칙은 최소 한 시나리오에서 걸려야 합니다.
4. 문단은 문장 단위로 끊고 120칸을 넘기지 않습니다. `docs/semantic-wrap.py` 가 정리합니다.
5. `**Impact:` 로 시작하는 줄은 한 줄로 유지합니다. build 가 그 형태로 파싱합니다.

---

## 3. Rule frontmatter

```markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 규칙이 걸리는 변경을 한 문장으로
requiresSelected: 함께 반드시 걸리는 rule-id, companion-skill/cross-rule-id
requiredOnCompletion: true
reviewWith: 함께 다시 판단할 rule-id, companion-skill/cross-rule-id
tags: tag1, tag2
---
```

| 키 | 필수 | 의미 |
| --- | --- | --- |
| `title` | 필수 | 핸드북과 목차에 노출되는 제목 |
| `impact` | 필수 | `CRITICAL` · `HIGH` · `MEDIUM` · `LOW` |
| `appliesWhen` | 필수 | 비어 있지 않은 한 줄. 160자 이내 |
| `requiresSelected` | 선택 | 이 규칙이 걸리면 target 도 반드시 함께 적용 |
| `reviewWith` | 선택 | 자동 선택이 아니라 다시 판정하라는 재평가 힌트 |
| `requiredOnCompletion` | 선택 | 마무리 시 항상 적용 |
| `tags` | 선택 | 검색용 |

### 3.1 appliesWhen 작성 기준

규칙의 결론을 반복하지 말고, diff 나 요청에서 관찰 가능한 조건을 기술합니다.
판단이 애매하면 걸리는 쪽으로 보수적으로 씁니다.

```yaml
# 나쁨 — 규칙의 결론을 반복
appliesWhen: 핸들러를 명명해서 써야 한다.

# 좋음 — 언제 읽어야 하는지를 기술
appliesWhen: TSX event prop 의 인라인 callback 에 분기, 비동기 호출 또는 여러 동작을 추가·수정한다.
```

### 3.2 requiresSelected 와 reviewWith

| 비교 항목 | `requiresSelected` | `reviewWith` |
| --- | --- | --- |
| 성격 | 논리적 필수 관계 | 재평가 힌트 |
| 자동 적용 | 적용됨 | 적용되지 않음 |
| cross-skill | target 의 companion 까지 활성화 | 해당 없음 |
| 방향 | 단방향 | 단방향. 역방향 추론 금지 |

1. 대상이 없으면 해당 optional key 를 생략합니다.
2. 같은 target 을 두 키에 중복 지정하지 않습니다.
3. `_` 로 시작하는 파일은 생성물에서 제외됩니다.
4. 섹션은 파일명 prefix 로 결정되고 순서는 제목 순으로 자동 생성됩니다.

---

## 4. 배치 기준

| 규칙의 성격 | 위치 |
| --- | --- |
| 여러 프레임워크 공통 | `typescript` 또는 `css`. generic TypeScript 는 `skill/typescript` 가 정본 |
| 특정 프레임워크 전용 | 해당 skill 의 local rule |
| 프로젝트 하나에만 해당 | 이 저장소가 아니라 그 프로젝트의 `AGENTS.md` |

기존 프로젝트 경계를 공통 pack 으로 끌어올리지 않습니다.

---

## 5. 명령

```bash
npm --prefix package install                  # 최초 1회

npm --prefix package run dev:react            # 단일 skill validate + build
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
npm --prefix package run check:generated:all  # 생성물과 source 일치 확인
npm --prefix package run check:handbooks:all
npm --prefix package run test
```

`skill/<name>` 디렉터리 안에서 작업할 때는 `--prefix ../../package` 로 대체합니다.
자세한 script 설명은 [package/README.md](./package/README.md) 에 있습니다.

`react` · `typescript` · `css` · `figma-visual-parity` 에는 `pressure-tests.md` 가 있습니다.
규칙을 크게 바꿨을 때의 회귀 확인용이며 정본은 아닙니다.

---

## 6. 함께 갱신할 문서

| 변경 내용 | 갱신 대상 |
| --- | --- |
| skill 추가·제거 | [README.md](./README.md) 의 skill 표, [AGENTS.md](./AGENTS.md) 의 목록 |
| 로딩·companion 계약 변경 | [AGENTS.md](./AGENTS.md) |
| 구조 자체 변경 | [overview.html](./overview.html). 생성기는 `docs/overview-flowcharts.py` |

이 저장소에서 AI 에이전트로 작업하는 경우의 규칙은 [AGENTS.md](./AGENTS.md) 에 있습니다.
