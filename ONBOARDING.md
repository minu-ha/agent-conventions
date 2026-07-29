# 시작하기

> 팀 코딩 컨벤션 저장소. 규칙 정본은 `skill/` 한 곳이고 각 프로젝트는 이름만 참조.
> **대부분 [트랙 ①](#트랙--컨벤션을-지키며-코딩) 만 하면 됨.**

## 목차

- [두 갈래](#두-갈래) — 어느 쪽인지 먼저 확인
- [트랙 ① 컨벤션을 지키며 코딩](#트랙--컨벤션을-지키며-코딩) — 30분
- [자주 막히는 곳](#자주-막히는-곳)
- [트랙 ② 규칙을 고침](#트랙--규칙을-고침) — CONTRIBUTING.md 로 연결
- [더 보기](#더-보기)

## 두 갈래

```text
                      ┌─ ① 컨벤션을 지키며 코딩   ─ 30분  ─ 대부분 여기
무엇을 하러 왔는가?  ─┤
                      └─ ② 컨벤션 규칙을 고침     ─ 1시간 ─ CONTRIBUTING.md
```

한 줄 요약: **규칙은 220개쯤. 에이전트는 지금 변경에 걸리는 것만 골라 읽음.**

## 트랙 ① 컨벤션을 지키며 코딩

### 1단계 · 구조 파악 — 15분

[overview.html](./overview.html) 을 브라우저나 WebStorm HTML 프리뷰로 열 것.
흐름도 3장으로 전체가 잡힘. 지금 건너뛰어도 되며, "왜 이렇게 되어 있지?" 싶을 때 복귀 지점.

### 2단계 · 내 도메인 핸드북 — 20분

**전체를 외울 필요 없음.** 한 번 훑어두면 리뷰 지적이 줄어듦. 자기가 만지는 영역만.

| 무엇을 만드나 | 읽을 것 |
| --- | --- |
| React 화면 · 컴포넌트 | [react](./skill/react/HANDBOOK.md) + [typescript](./skill/typescript/HANDBOOK.md) |
| 스타일시트 · `className` | 위 + [css](./skill/css/HANDBOOK.md) |
| Astro 페이지 | [astro](./skill/astro/HANDBOOK.md) |
| TanStack Router 라우트 | [tanstack-route](./skill/tanstack-route/HANDBOOK.md) |
| NestJS 백엔드 | [nestjs](./skill/nestjs/HANDBOOK.md) |
| Playwright 테스트 | [playwright-test](./skill/playwright-test/HANDBOOK.md) |
| Figma 기준 UI 구현 | [figma-visual-parity](./skill/figma-visual-parity/HANDBOOK.md) |

- 각 `HANDBOOK.md` 는 목차 있는 전체 핸드북. 섹션마다 Impact 표시 — `CRITICAL` 부터
- 규칙마다 Incorrect / Correct 예시 포함
- 특정 규칙만 다시 찾을 때는 `RULES_INDEX.md` 가 빠름 (react · typescript · css, 규칙당 한 줄)

### 3단계 · 에이전트 연결 — 10분

**설치** — 에이전트가 `~/.agents/skills/` 를 스캔한다면 symlink 하나로 끝.

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

기존 링크가 있으면 백업 후 교체하고 에이전트 재시작.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

**정책 붙이기** — [AGENTS.template.md](./AGENTS.template.md) 의 본문을 프로젝트
`AGENTS.md` 로 복사. 규칙 본문은 복사하지 않음. 맨 끝 `프로젝트 로컬 규칙` 만 채울 것.

- owner 와 디렉터리 경계
- 허용 파일과 변경 금지 영역
- generated file 보호
- build · lint · test 명령
- 프로젝트 고유 API · naming · 예외

### 4단계 · 돌려보기

TSX 파일 하나를 고쳐달라고 시켜볼 것. 에이전트 동작 순서.

```text
변경 판정 → convention-react + convention-typescript 활성화
         → RULES_INDEX 훑어 걸리는 규칙 추리기
         → 해당 contracts 읽고 구현
         → 마무리로 diff 를 다시 훑어 위반 보고
```

`className` 이나 stylesheet 를 함께 건드리면 `convention-css` 추가.
순수 CSS 만 고치면 TypeScript 는 켜지지 않음.

## 자주 막히는 곳

| 증상 | 원인 |
| --- | --- |
| 에이전트가 컨벤션을 아예 모름 | symlink 미설치, 또는 에이전트 재시작 안 함 |
| 규칙을 너무 많이 적용 | 알려진 약점. 필요 규칙을 놓치는 것보다는 나은 실패 |
| `HANDBOOK.md` 를 고쳤는데 되돌아옴 | 생성물. `rules/*.md` 를 고쳐야 함 |
| 어떤 규칙이 왜 걸렸는지 모름 | 그 규칙 frontmatter 의 `appliesWhen` 확인 |

여기까지가 트랙 ①. 규칙을 고칠 일이 없으면 끝.

## 트랙 ② 규칙을 고침

절차 전체는 [CONTRIBUTING.md](./CONTRIBUTING.md). 미리 알아둘 것 네 가지.

| 항목 | 내용 |
| --- | --- |
| 정본 | `rules/*.md`. `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` 는 **생성물** |
| 본문 구조 | 규범을 **첫 `Incorrect` 앞에서** 끝낼 것. 생성기가 그 앞부분만 계약으로 가져감 |
| `appliesWhen` | 라우팅을 결정하는 한 줄. 규칙의 결론이 아니라 **관찰 가능한 변경 조건** |
| 재생성 | `npm --prefix package run dev:<skill>` → `check:generated` |

이 레포에서 AI 에이전트로 작업한다면 [AGENTS.md](./AGENTS.md) 가 그 작업 규칙.

## 더 보기

| 문서 | 내용 |
| --- | --- |
| [README.md](./README.md) | 목적별 라우팅 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 규칙 추가·수정 절차 |
| [overview.html](./overview.html) | 실행 흐름 · 스킬 관계 · 규칙 관계 흐름도 |
| [docs/progressive-loading.html](./docs/progressive-loading.html) | 설계 배경 · 토큰 측정 · 검증 · 한계 |

원본 설계 기록은 `docs/superpowers/` 와 `docs/evaluations/`.
