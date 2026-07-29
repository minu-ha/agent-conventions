# 시작하기

팀 코딩 컨벤션 저장소. 규칙 정본은 `skill/` 한 곳이고 각 프로젝트는 이름만 참조한다.
목적에 따라 두 갈래이고, **대부분 트랙 ① 만 하면 된다.**

| 트랙 | 대상 | 시간 | 도착지 |
| --- | --- | --- | --- |
| **①** | 컨벤션을 지키며 코딩 | 30분 | [2절](#2-트랙--컨벤션을-지키며-코딩) |
| ② | 컨벤션 규칙을 고침 | 1시간 | [CONTRIBUTING.md](./CONTRIBUTING.md) |

한 줄 요약 — **규칙은 220개쯤. 에이전트는 지금 변경에 걸리는 것만 골라 읽는다.**

| 절 | 내용 |
| --- | --- |
| [1. 트랙 고르기](#1-트랙-고르기) | 어느 쪽인지 확인 |
| [2. 트랙 ① 컨벤션을 지키며 코딩](#2-트랙--컨벤션을-지키며-코딩) | 3단계 30분 |
| [3. 자주 막히는 곳](#3-자주-막히는-곳) | 증상과 원인 |
| [4. 트랙 ② 규칙을 고침](#4-트랙--규칙을-고침) | 미리 알아둘 것 |
| [5. 더 보기](#5-더-보기) | 문서 목록 |

## 1. 트랙 고르기

1. 이 프로젝트들에서 **코드를 쓴다** → 트랙 ①. 아래 2절로.
2. 컨벤션 **규칙 자체를 바꾼다** → 트랙 ②. [CONTRIBUTING.md](./CONTRIBUTING.md) 로.
3. 이 레포에서 **AI 에이전트로 작업한다** → [AGENTS.md](./AGENTS.md).

## 2. 트랙 ① 컨벤션을 지키며 코딩

```text
┌─────────────────────────────────────────────────────────────────┐
│                   1. 구조 파악          15분                    │
│                                                                 │
│                   overview.html — 흐름도 3장                    │
│             "규칙은 220개. 걸리는 것만 골라 읽는다"             │
│                                │                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   2. 내 도메인 핸드북    20분                   │
│                                                                 │
│                   skill/<내 영역>/HANDBOOK.md                   │
│              CRITICAL 부터. 전체를 외울 필요 없음               │
│                                │                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   3. 에이전트 연결      10분                    │
│                                                                 │
│             skill/ 을 symlink  ·  AGENTS.md 에 정책             │
│                   재시작 후 TSX 하나 고쳐보기                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 구조 파악

[overview.html](./overview.html) 을 브라우저나 WebStorm HTML 프리뷰로 연다.
지금 건너뛰어도 되며, "왜 이렇게 되어 있지?" 싶을 때 돌아올 지점이다.

### 2.2 내 도메인 핸드북

전체를 외울 필요는 없다. 한 번 훑어두면 리뷰 지적이 줄어든다. 자기가 만지는 영역만 본다.

| 무엇을 만드나 | 읽을 것 |
| --- | --- |
| React 화면 · 컴포넌트 | [react](./skill/react/HANDBOOK.md) + [typescript](./skill/typescript/HANDBOOK.md) |
| 스타일시트 · `className` | 위 + [css](./skill/css/HANDBOOK.md) |
| Astro 페이지 | [astro](./skill/astro/HANDBOOK.md) |
| TanStack Router 라우트 | [tanstack-route](./skill/tanstack-route/HANDBOOK.md) |
| NestJS 백엔드 | [nestjs](./skill/nestjs/HANDBOOK.md) |
| Playwright 테스트 | [playwright-test](./skill/playwright-test/HANDBOOK.md) |
| Figma 기준 UI 구현 | [figma-visual-parity](./skill/figma-visual-parity/HANDBOOK.md) |

1. 각 `HANDBOOK.md` 는 목차가 있는 전체 핸드북이다. 섹션마다 Impact 가 붙어 있으니 `CRITICAL` 부터 본다.
2. 규칙마다 Incorrect / Correct 예시가 있다.
3. 특정 규칙만 다시 찾을 때는 `RULES_INDEX.md` 가 빠르다. 규칙당 한 줄이다.

### 2.3 에이전트 연결

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

기존 링크가 있으면 백업 후 교체하고 에이전트를 재시작한다.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

프로젝트에 `AGENTS.md` 가 없으면 [AGENTS.template.md](./AGENTS.template.md) 로 시작한다.
이미 있으면 컨벤션 항목에 쓸 skill 이름만 적으면 된다.

### 2.4 돌려보기

TSX 파일 하나를 고쳐달라고 시켜본다. 에이전트 동작 순서는 이렇다.

```text
변경 판정 → convention-react + convention-typescript 활성화
         → RULES_INDEX 훑어 걸리는 규칙 추리기
         → 해당 contracts 읽고 구현
         → 마무리로 diff 를 다시 훑어 위반 보고
```

`className` 이나 stylesheet 를 함께 건드리면 `convention-css` 가 추가된다.
순수 CSS 만 고치면 TypeScript 는 켜지지 않는다.

## 3. 자주 막히는 곳

| 증상 | 원인 |
| --- | --- |
| 에이전트가 컨벤션을 아예 모름 | symlink 미설치, 또는 에이전트 재시작 안 함 |
| 규칙을 너무 많이 적용 | 알려진 약점. 필요 규칙을 놓치는 것보다는 나은 실패 |
| `HANDBOOK.md` 를 고쳤는데 되돌아옴 | 생성물. `rules/*.md` 를 고쳐야 함 |
| 어떤 규칙이 왜 걸렸는지 모름 | 그 규칙 frontmatter 의 `appliesWhen` 확인 |

여기까지가 트랙 ①. 규칙을 고칠 일이 없으면 끝이다.

## 4. 트랙 ② 규칙을 고침

절차 전체는 [CONTRIBUTING.md](./CONTRIBUTING.md). 미리 알아둘 것 네 가지.

| 항목 | 내용 |
| --- | --- |
| 정본 | `rules/*.md`. `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` 는 **생성물** |
| 본문 구조 | 규범을 **첫 `Incorrect` 앞에서** 끝낸다. 생성기가 그 앞부분만 계약으로 가져간다 |
| `appliesWhen` | 라우팅을 결정하는 한 줄. 규칙의 결론이 아니라 **관찰 가능한 변경 조건** |
| 재생성 | `npm --prefix package run dev:<skill>` → `check:generated` |

## 5. 더 보기

| 문서 | 내용 |
| --- | --- |
| [README.md](./README.md) | 목적별 라우팅 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 규칙 추가·수정 절차 |
| [AGENTS.template.md](./AGENTS.template.md) | 새 프로젝트용 AGENTS.md 시작 템플릿 |
| [overview.html](./overview.html) | 실행 흐름 · 스킬 관계 · 규칙 관계 흐름도 |
| [docs/progressive-loading.html](./docs/progressive-loading.html) | 설계 배경 · 토큰 측정 · 검증 · 한계 |

원본 설계 기록은 `docs/superpowers/` 와 `docs/evaluations/` 에 있다.
