# 규칙 고치기

> `skill/` 아래 컨벤션 규칙을 수정·추가하는 사람용.
> 컨벤션을 **사용**만 한다면 [ONBOARDING.md](./ONBOARDING.md).

## 목차

- [정본과 생성물](#정본과-생성물) — 가장 흔한 실수
- [스킬 하나의 구조](#스킬-하나의-구조)
- [규칙 추가 절차](#규칙-추가-절차) — 6단계
- [Rule frontmatter](#rule-frontmatter) — 키 레퍼런스
- [어디에 둘 것인가](#어디에-둘-것인가) — skill 선택 기준
- [명령](#명령)
- [더 보기](#더-보기)

## 정본과 생성물

오른쪽은 build 결과물. 직접 고치면 다음 build 에서 덮어써지고 `check:generated` 실패.

| 사람이 고치는 정본 | build 생성물 · 편집 금지 |
| --- | --- |
| `rules/*.md` — 규칙 본문 | `HANDBOOK.md` — 전체 핸드북 |
| `rules/_sections.md` — 섹션 순서 · 영향도 | `RULES_INDEX.md` — 규칙 목록 (progressive 전용) |
| `rules/_template.md` — 새 규칙 템플릿 | `contracts/*.md` — 규범만 추린 계약 (progressive 전용) |
| `metadata.json` — 빌드 입력 · companion 계약 | |
| `SKILL.md` — 에이전트 라우터 | |
| `routing-evals.json` — 라우팅 테스트 (progressive 전용) | |

## 스킬 하나의 구조

```text
skill/react/
  SKILL.md            에이전트 라우터 — 변경 판정 후 규칙 선택
  metadata.json       버전 · 개요 · companion 활성화 계약
  rules/
    _sections.md      섹션 순서 · Impact · 설명. 괄호 안이 파일명 prefix
    _template.md      새 규칙 템플릿
    *.md              규칙 정본
  routing-evals.json  시나리오별로 걸려야 할 규칙의 테스트 오라클
  RULES_INDEX.md      ← 생성물
  contracts/*.md      ← 생성물
  HANDBOOK.md         ← 생성물. 사람이 읽는 전체 핸드북
```

- **progressive** — `react` · `typescript` · `css`. `RULES_INDEX.md` 와 `contracts/` 생성
- **전체 로드** — 나머지. `HANDBOOK.md` 만 생성하고 에이전트가 통째로 읽음

## 규칙 추가 절차

| 단계 | 할 일 |
| --- | --- |
| 1 | `rules/_sections.md` 에서 섹션 결정. 제목 괄호 안이 파일명 prefix |
| 2 | `rules/_template.md` 를 `rules/<prefix>-<설명>.md` 로 복사 |
| 3 | frontmatter 작성. 특히 `appliesWhen` 은 **관찰 가능한 변경**으로 |
| 4 | 본문 작성. **규범과 예외를 첫 `Incorrect` 앞에서 끝낼 것** |
| 5 | progressive 면 `routing-evals.json` 에 걸리는 시나리오 추가 |
| 6 | 재생성 · 검증 → [명령](#명령) |

세부 주의점.

- **1단계** — `## 1. Ownership and Boundaries (ownership)` 이면 파일명은 `ownership-*.md`
- **4단계** — 첫 `Incorrect` 뒤에는 `Incorrect`/`Correct` 라벨, 코드 펜스, 빈 줄만.
  생성되는 `contracts/*.md` 가 첫 `Incorrect` 앞부분만 가져가기 때문
- **5단계** — 모든 규칙은 최소 한 시나리오에서 걸려야 함
- 문단은 **문장 단위로 줄바꿈**. 고정 컬럼 하드랩 금지 ([.editorconfig](./.editorconfig) 참고)

## Rule frontmatter

```markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 규칙이 걸리는 변경을 한 문장으로
requiresSelected: 함께 반드시 걸리는 rule-id, companion-skill/cross-rule-id
requiredOnCompletion: true
reviewWith: 함께 다시 판단해 볼 rule-id, companion-skill/cross-rule-id
tags: tag1, tag2
---
```

| 키 | 필수 | 의미 |
| --- | --- | --- |
| `title` | 필수 | 핸드북과 목차에 표시 |
| `impact` | 필수 | `CRITICAL` · `HIGH` · `MEDIUM` · `LOW` |
| `appliesWhen` | 필수 | 비어 있지 않은 한 줄. **160자 이내** |
| `requiresSelected` | 선택 | 걸리면 target 도 **반드시** 함께 적용 |
| `reviewWith` | 선택 | 자동 선택이 아니라 다시 판정해 보라는 재평가 힌트 |
| `requiredOnCompletion` | 선택 | 마무리 시 항상 적용 |
| `tags` | 선택 | 검색용 |

### appliesWhen 쓰는 법

규칙의 결론을 반복하지 말고 diff 나 요청에서 **관찰 가능한 조건**을 기술.
애매하면 걸리는 쪽으로 보수적으로.

```yaml
# 나쁨 — 규칙의 결론 반복
appliesWhen: 핸들러를 명명해서 써야 한다.

# 좋음 — 언제 읽어야 하는지
appliesWhen: TSX event prop 의 인라인 callback 에 분기, 비동기 호출 또는 여러 동작을 추가·수정한다.
```

### requiresSelected 와 reviewWith 의 차이

| | `requiresSelected` | `reviewWith` |
| --- | --- | --- |
| 성격 | 논리적 필수 관계 | 재평가 힌트 |
| 자동 적용 | 예 | **아니오** |
| cross-skill | target 의 companion 까지 활성화 | — |
| 방향 | 단방향 | **단방향. 역방향 추론 금지** |

- 대상이 없으면 해당 optional key 를 아예 생략
- 같은 target 을 두 키에 중복 지정 금지
- `_` 로 시작하는 파일은 생성물에서 제외
- 섹션은 파일명 prefix 로 결정, 순서는 제목 순 자동 생성

## 어디에 둘 것인가

| 규칙의 성격 | 위치 |
| --- | --- |
| 여러 프레임워크 공통 | `typescript` 또는 `css`. generic TypeScript 는 `skill/typescript` 가 정본 |
| 특정 프레임워크 전용 | 해당 skill 의 local rule |
| 프로젝트 하나에만 | 이 레포가 아니라 그 프로젝트의 `AGENTS.md` overlay |

기존 프로젝트 경계를 공통 pack 으로 끌어올리지 않을 것.

## 명령

```bash
npm --prefix package install                  # 처음 한 번

npm --prefix package run dev:react            # 한 skill validate + build
npm --prefix package run validate -- --all
npm --prefix package run build -- --all
npm --prefix package run check:generated:all  # 생성물이 source 와 맞는지
npm --prefix package run check:handbooks:all
npm --prefix package run test
```

`skill/<name>` 안에서 작업할 때는 `--prefix ../../package` 로 대체.

## 더 보기

| 문서 | 내용 |
| --- | --- |
| [AGENTS.md](./AGENTS.md) | 이 레포에서 AI 에이전트로 작업할 때의 규칙 |
| [package/README.md](./package/README.md) | build · validate · test tooling 상세 |
| [overview.html](./overview.html) | 실행 흐름 · 스킬 관계 · 규칙 관계 흐름도 |

**pressure tests** — `react` · `typescript` · `css` · `figma-visual-parity` 의
`pressure-tests.md`. 규칙을 크게 바꿨을 때 회귀 확인용이며 정본은 아님.

**문서를 함께 고쳐야 하는 경우**

- skill 추가·제거 → [README.md](./README.md) 의 skill 표, [AGENTS.md](./AGENTS.md) 의 목록
- 로딩·companion 계약 변경 → [AGENTS.template.md](./AGENTS.template.md)
- 구조 자체 변경 → [overview.html](./overview.html) — 생성기는 `docs/overview-flowcharts.py`
