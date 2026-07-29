# 시작하기

팀 코딩 컨벤션 저장소입니다. **사람이 직접 코딩할 때 보는 핸드북**이면서,
**AI 에이전트가 따르는 가이드라인**이기도 합니다. 규칙 정본은 여기 한 곳에만 두고
각 프로젝트는 skill 이름만 참조합니다.

목적에 따라 두 갈래입니다. 대부분은 ①만 하면 됩니다.

```text
                      ┌─ ① 컨벤션을 지키며 코딩한다   ─ 30분  ─ 대부분 여기
무엇을 하러 왔는가?  ─┤
                      └─ ② 컨벤션 규칙을 고친다       ─ 1시간 ─ CONTRIBUTING.md
```

---

# ① 컨벤션을 지키며 코딩한다

## 1단계 — 이 저장소가 뭘 하는지 15분

[overview.html](./overview.html)을 브라우저나 WebStorm HTML 프리뷰로 엽니다.
흐름도 3장으로 전체 구조가 잡힙니다. 지금 안 읽어도 되지만, 나중에 "왜 이렇게 되어 있지?"
싶을 때 여기로 돌아오면 됩니다.

한 문장으로 줄이면 이렇습니다.
**규칙은 220개쯤 있고, 에이전트는 그중 지금 변경에 걸리는 것만 골라 읽습니다.**

## 2단계 — 내 도메인 핸드북 훑기 20분

**규칙 전체를 외울 필요는 없습니다.** 다만 한 번은 훑어두면 리뷰에서 지적받는 일이 줄어듭니다.
자기가 만지는 영역만 보면 됩니다.

| 무엇을 만드나 | 읽을 것 |
| --- | --- |
| React 화면·컴포넌트 | [react](./skill/react/AGENTS.md) + [typescript](./skill/typescript/AGENTS.md) |
| 스타일시트·className | 위에 [css](./skill/css/AGENTS.md) 추가 |
| Astro 페이지 | [astro](./skill/astro/AGENTS.md) |
| TanStack Router 라우트 | [tanstack-route](./skill/tanstack-route/AGENTS.md) |
| NestJS 백엔드 | [nestjs](./skill/nestjs/AGENTS.md) |
| Playwright 테스트 | [playwright-test](./skill/playwright-test/AGENTS.md) |
| Figma 기준 UI 구현 | [figma-visual-parity](./skill/figma-visual-parity/AGENTS.md) |

각 `AGENTS.md`는 목차가 있는 전체 핸드북입니다. 섹션마다 Impact가 붙어 있으니
`CRITICAL`부터 보면 됩니다. 규칙마다 Incorrect / Correct 예시가 있습니다.

> 나중에 특정 규칙만 다시 찾을 때는 `RULES_INDEX.md`가 빠릅니다
> (react · typescript · css). 규칙당 한 줄이라 훑는 데 1분이면 됩니다.

## 3단계 — 에이전트가 이 규칙을 따르게 하기 10분

**설치** — 에이전트가 시작 시 `~/.agents/skills/`를 스캔한다면 symlink 하나면 됩니다.

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

이미 있으면 백업 후 교체하고 에이전트를 재시작합니다.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

**프로젝트에 정책 붙이기** — [AGENTS.frontend-conventions.md](./AGENTS.frontend-conventions.md)를
프로젝트의 `AGENTS.md`에 복사합니다. 규칙 본문은 복사하지 않습니다. 활성화·로딩 정책만 들어갑니다.

그 아래 `프로젝트 로컬 overlay` 자리에 이 프로젝트에만 해당하는 것을 적습니다.

- 디렉터리·owner 경계
- 생성 파일 보호
- build · lint · test 명령
- 프로젝트 고유 API·네이밍·예외

워크플로 pack까지 쓴다면 [AGENTS.superpowers.conventions.md](./AGENTS.superpowers.conventions.md)를
대신 씁니다.

## 4단계 — 실제로 돌려보기

TSX 파일 하나를 고쳐달라고 시켜보면, 에이전트가 이런 순서로 움직입니다.

```text
변경 판정 → convention-react + convention-typescript 활성화
         → RULES_INDEX 훑어 걸리는 규칙 추리기
         → 해당 contracts 읽고 구현
         → 마무리로 diff 를 다시 훑어 위반 보고
```

`className`이나 stylesheet를 함께 건드리면 `convention-css`가 추가로 켜집니다.
순수 CSS만 고치면 TypeScript는 켜지지 않습니다.

## 자주 막히는 곳

| 증상 | 원인 |
| --- | --- |
| 에이전트가 컨벤션을 아예 모른다 | symlink 미설치, 또는 에이전트 재시작 안 함 |
| 규칙을 너무 많이 적용한다 | 알려진 약점입니다. 필요 규칙을 놓치는 것보다는 낫습니다 |
| `AGENTS.md`를 고쳤는데 되돌아온다 | 생성물입니다. `rules/*.md`를 고쳐야 합니다 |
| 어떤 규칙이 왜 걸렸는지 모르겠다 | 그 규칙 frontmatter의 `appliesWhen`을 보면 됩니다 |

여기까지가 ①입니다. 규칙을 고칠 일이 없다면 끝입니다.

---

# ② 컨벤션 규칙을 고친다

규칙을 추가·수정하려면 [CONTRIBUTING.md](./CONTRIBUTING.md)로 갑니다. 요점만 미리 말하면,

- `rules/*.md`가 정본이고 `AGENTS.md` · `RULES_INDEX.md` · `contracts/*.md`는 **생성물**입니다.
- 규칙 본문은 **규범을 첫 `Incorrect` 앞에서 끝내야** 합니다. 생성기가 그 앞부분만 계약으로 가져갑니다.
- `appliesWhen` 한 줄이 라우팅을 결정합니다. 규칙의 결론이 아니라 **관찰 가능한 변경 조건**을 씁니다.
- 고친 뒤 `npm --prefix package run dev:<skill>`로 재생성하고 `check:generated`로 확인합니다.

이 레포에서 AI 에이전트로 작업한다면 [AGENTS.md](./AGENTS.md)가 그 작업 규칙입니다.

## 왜 이런 구조인지 궁금하면

[docs/progressive-loading.html](./docs/progressive-loading.html)에 설계 배경, 토큰 측정,
정확도 검증, 그리고 증명되지 않은 한계까지 정리돼 있습니다.
원본 기록은 `docs/superpowers/`와 `docs/evaluations/`에 있습니다.
