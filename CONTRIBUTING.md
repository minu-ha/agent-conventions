# 규칙 고치기

이 문서는 `skill/` 아래 컨벤션 규칙을 수정하거나 추가하는 사람을 위한 것입니다.
컨벤션을 **사용**하려는 것뿐이라면 [ONBOARDING.md](./ONBOARDING.md)를 보세요.

## 정본과 생성물

이걸 헷갈리는 게 가장 흔한 실수입니다. 오른쪽은 build 결과물이라 직접 고치면
다음 build에서 덮어써지고 `check:generated`에서 실패합니다.

| 사람이 고치는 정본 | build 생성물 · 편집 금지 |
| --- | --- |
| `rules/*.md` — 규칙 본문 | `AGENTS.md` — 전체 핸드북 |
| `rules/_sections.md` — 섹션 순서·영향도 | `RULES_INDEX.md` — 규칙 목록 (progressive 전용) |
| `rules/_template.md` — 새 규칙 템플릿 | `contracts/*.md` — 규범만 추린 계약 (progressive 전용) |
| `metadata.json` — 빌드 입력·companion 계약 | |
| `SKILL.md` — 에이전트 라우터 | |
| `routing-evals.json` — 라우팅 테스트 (progressive 전용) | |

## 스킬 하나의 구조

```text
skill/react/
  SKILL.md            에이전트가 읽는 라우터 — 무엇이 바뀌었는지 판정하고 규칙을 고름
  metadata.json       버전·개요·companion 활성화 계약
  rules/
    _sections.md      섹션 순서, Impact, 설명. 괄호 안이 파일명 prefix
    _template.md      새 규칙 템플릿
    *.md              규칙 정본
  routing-evals.json  시나리오별로 어떤 규칙이 걸려야 하는지의 테스트 오라클
  RULES_INDEX.md      ← 생성물
  contracts/*.md      ← 생성물
  AGENTS.md           ← 생성물. 사람이 읽는 전체 핸드북
```

`react` · `typescript` · `css`는 progressive skill이라 `RULES_INDEX.md`와 `contracts/`를
함께 생성합니다. 나머지는 `AGENTS.md`만 생성하고 에이전트가 그걸 통째로 읽습니다.

## 규칙 하나 추가하기

1. `rules/_sections.md`에서 어느 섹션에 속하는지 정합니다. 섹션 제목 괄호 안이 파일명 prefix입니다.
   예를 들어 `## 1. Ownership and Boundaries (ownership)`이면 파일명은 `ownership-*.md`입니다.
2. `rules/_template.md`를 `rules/<prefix>-<설명>.md`로 복사합니다.
3. frontmatter를 채웁니다. 특히 `appliesWhen`은 **관찰 가능한 변경**으로 씁니다
   (아래 [Rule frontmatter](#rule-frontmatter) 참고).
4. 본문을 씁니다. **규범과 예외는 첫 `Incorrect` 앞에서 끝내야 합니다.**
   첫 `Incorrect` 뒤에는 `Incorrect`/`Correct` 라벨, 코드 펜스, 빈 줄만 둡니다.
   생성되는 `contracts/*.md`가 첫 `Incorrect` 앞부분만 가져가기 때문입니다.
5. progressive skill이면 `routing-evals.json`에 이 규칙이 걸리는 시나리오를 추가합니다.
   모든 규칙은 최소 한 시나리오에서 걸려야 합니다.
6. [명령](#명령)으로 재생성하고 검증합니다.

## Rule frontmatter

```markdown
---
title: Rule Title Here
impact: MEDIUM
impactDescription: 선택적 영향도 설명
appliesWhen: 이 규칙이 걸리는 변경을 한 문장으로 설명
requiresSelected: 이 규칙이 걸리면 반드시 함께 걸리는 rule-id, companion-skill/cross-rule-id
requiredOnCompletion: true
reviewWith: 함께 다시 판단해 볼 rule-id, companion-skill/cross-rule-id
tags: tag1, tag2
---
```

| 키 | 의미 |
| --- | --- |
| `title` | 핸드북과 목차에 나오는 제목 |
| `impact` | `CRITICAL` · `HIGH` · `MEDIUM` · `LOW` |
| `appliesWhen` | **필수.** 비어 있지 않은 한 줄 문장이고 160자를 넘기지 않습니다 |
| `requiresSelected` | 선택. 이 규칙이 걸리면 target도 **반드시** 함께 적용 |
| `reviewWith` | 선택. 자동 선택이 아니라 다시 판정해 보라는 재평가 힌트 |
| `requiredOnCompletion` | 선택. 마무리 시 항상 적용하는 규칙에만 |
| `tags` | 선택. 검색용 |

**`appliesWhen` 쓰는 법.** 규칙의 결론을 반복하지 말고, diff나 요청에서 **관찰할 수 있는
조건**을 씁니다. 애매하면 규칙이 걸리는 쪽으로 보수적으로 씁니다.

```yaml
# 나쁨 — 규칙의 결론을 반복
appliesWhen: 핸들러를 명명해서 써야 한다.

# 좋음 — 언제 이 규칙을 읽어야 하는지
appliesWhen: TSX event prop의 인라인 callback에 분기, 비동기 호출 또는 여러 동작을 추가·수정한다.
```

**`requiresSelected`와 `reviewWith`의 차이.**
`requiresSelected`는 논리적으로 반드시 따라오는 관계에만 씁니다. target이 다른 skill에 있으면
그 companion까지 켜집니다. `reviewWith`는 자동 선택 명령이 **아니라** 지금 변경 범위에서
다시 판정해 보라는 힌트이고, 근거가 있으면 적용하지 않아도 됩니다.
**방향이 있습니다** — 역방향으로 추론하지 않습니다.

재평가하거나 함께 걸 대상이 없으면 해당 optional key를 아예 생략합니다.
같은 target을 `requiresSelected`와 `reviewWith`에 중복해서 넣지 않습니다.

`_`로 시작하는 파일은 생성물에서 제외됩니다.
섹션은 파일명 prefix로 결정되고 순서는 제목 순으로 자동 생성됩니다.

## 어디에 둘 것인가

새 규칙이 어느 skill에 속하는지는 이렇게 판단합니다.

- **여러 프레임워크에 공통** → `typescript` 또는 `css`에 둡니다.
  generic TypeScript 규칙이면 `skill/typescript`가 정본입니다.
- **특정 프레임워크에서만** → 해당 skill의 local rule로 둡니다.
- **프로젝트 하나에만** → 이 레포가 아니라 그 프로젝트의 `AGENTS.md` overlay로 보냅니다.

기존 프로젝트 경계를 공통 pack으로 끌어올리지 않습니다.

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

`skill/<name>` 안에서 작업할 때는 `--prefix ../../package`로 바꿔 쓰면 됩니다.
더 자세한 script 설명은 [package/README.md](./package/README.md)에 있습니다.

## Pressure tests

`react` · `typescript` · `css` · `figma-visual-parity`에는 `pressure-tests.md`가 있습니다.
규칙을 크게 바꿨을 때 실제 에이전트가 그 skill을 제대로 따르는지 확인하는 시나리오 모음이고,
source of truth는 아니지만 회귀 확인 자산으로 씁니다.

## 문서를 함께 고쳐야 하는 경우

- skill을 추가·제거하면 [README.md](./README.md)의 skill 표와 [AGENTS.md](./AGENTS.md)의 목록
- 로딩 방식이나 companion 계약이 바뀌면 [AGENTS.frontend-conventions.md](./AGENTS.frontend-conventions.md)
- 구조 자체가 바뀌면 [overview.html](./overview.html) — 생성기는 `docs/overview-flowcharts.py`
