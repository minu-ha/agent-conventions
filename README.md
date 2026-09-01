# agent-conventions

팀 코딩 컨벤션을 AI agent skill로 관리하는 저장소.

- 규칙 정본은 `skill/` 한 곳
- 프로젝트는 복사 없이 skill 이름만 참조
- 사람은 생성된 핸드북으로 읽음
- 에이전트는 라우터 → 인덱스 → 걸린 규칙만

---

## 목차

1. [빠른 시작](#1-빠른-시작) — 설치부터 첫 작업까지
    - 1.1 [설치](#11-설치)
    - 1.2 [프로젝트 연결](#12-프로젝트-연결)
    - 1.3 [담당 영역 핸드북](#13-담당-영역-핸드북)
    - 1.4 [동작 확인](#14-동작-확인)
2. [문서 구성](#2-문서-구성) — 문서별 역할과 독자
3. [포함된 Skill](#3-포함된-skill) — react · typescript · css
4. [동작 원리](#4-동작-원리) — 규칙이 선택되는 경로
5. [문제 해결](#5-문제-해결) — 증상별 원인
6. [규칙 수정](#6-규칙-수정) — 기여자 문서로

---

## 1. 빠른 시작

컨벤션을 쓰기만 한다면 이 절로 충분하다.
규칙 자체를 고치려면 [CONTRIBUTING.md](./CONTRIBUTING.md).

### 1.1 설치

에이전트가 `~/.agents/skills/`를 스캔하면 symlink 하나로 끝.

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

기존 링크가 있으면 백업하고 교체한다. 그다음 에이전트를 재시작한다.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions/skill ~/.agents/skills/conventions
```

### 1.2 프로젝트 연결

프로젝트 `AGENTS.md`에 쓸 skill 이름만 적는다. 규칙 본문은 복사하지 않는다.

새 프로젝트면 [AGENTS.template.md](./AGENTS.template.md) 를 복사해서 시작.
이미 `AGENTS.md`가 있으면 컨벤션 항목에 skill 이름만 추가.

프로젝트에는 owner skill만 적는다.
`convention-react` 하나면 `convention-typescript`와 `convention-css`는 `metadata.json` 선언대로 따라 켜진다.

### 1.3 담당 영역 핸드북

사람이 규칙을 찾을 때는 [conventions.html](./conventions.html) 을 먼저 연다.
세 skill의 규칙이 한 장에 들어 있고, 왼쪽 Skill 목록에서 담당 skill 하나를 고른다.
브라우저로 파일을 그냥 열면 된다. 서버가 필요 없다.

규칙을 펼치면 Incorrect / Correct 코드가 먼저 나오고, 적용 조건과 근거가 그 아래 온다.
`CRITICAL`부터 훑으려면 왼쪽 Impact 필터에서 `CRITICAL`만 켠다.
다른 skill 규칙을 가리키는 점선 칩을 누르면 그 skill로 옮겨가 해당 규칙을 펼친다.
규칙 번호(`1.1`, `7.2`)는 `HANDBOOK.md` 헤딩 번호와 같아서 두 문서를 번호로 맞춰 볼 수 있다.

`HANDBOOK.md`는 에이전트가 전체 검토를 요청받았을 때 읽는 생성물이다.
사람이 통독할 문서로 만들어진 것이 아니다.

전체를 외울 필요 없다. 담당 영역만 한 번 훑으면 리뷰에서 덜 돌아온다.

| 작업 영역 | 핸드북 |
| --- | --- |
| React 화면 · 컴포넌트 | [react](./skill/react/HANDBOOK.md) + [typescript](./skill/typescript/HANDBOOK.md) |
| 스타일시트 · `className` | 위 둘 + [css](./skill/css/HANDBOOK.md) |

핸드북마다 번호 목차와 Impact 등급이 있다. `CRITICAL`부터 본다.
규칙마다 Incorrect / Correct 예시가 붙어 있다.

특정 규칙만 다시 찾을 때는 `conventions.html`의 검색이 빠르다.

### 1.4 동작 확인

TSX 파일 하나를 고쳐 달라고 시켜본다. 에이전트는 이 순서로 움직인다.

1. 변경 판정
2. `convention-react` + `convention-typescript` 활성화
3. `RULES_INDEX`를 끝까지 훑어 걸리는 규칙 선별
4. 걸린 `contracts`를 읽고 구현
5. 마무리로 diff를 다시 훑어 위반 보고

`className`이나 stylesheet를 건드리면 `convention-css` 추가.
순수 CSS만 고치면 TypeScript는 안 켜진다.

---

## 2. 문서 구성

사람이 읽는 것.

| 문서 | 내용 |
| --- | --- |
| README.md | 이 문서. 설치와 적용 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 규칙 추가·수정 절차 |
| [conventions.html](./conventions.html) | **규칙 조회.** 세 skill의 규칙을 검색·필터로 찾는다. 데이터인 `conventions-data.js`와 같은 폴더에 두고 연다 |
| `skill/<name>/HANDBOOK.md` | 규칙 전문. 에이전트 전체 검토용 생성물 |
| [overview.html](./overview.html) | 실행 흐름 · 스킬 관계 · 규칙 관계 |
| [docs/progressive-loading.html](./docs/progressive-loading.html) | 설계 배경 · 측정 · 검증 · 한계 |
| [package/README.md](./package/README.md) | build · validate · test tooling |

에이전트가 읽는 것.

| 문서 | 내용 |
| --- | --- |
| [AGENTS.md](./AGENTS.md) | 이 저장소 작업 규칙 |
| [AGENTS.template.md](./AGENTS.template.md) | 다른 프로젝트용 시작 템플릿 |
| `skill/<name>/SKILL.md` | 활성화 라우터 |
| `skill/<name>/RULES_INDEX.md` | 규칙 목록. progressive 전용 |
| `skill/<name>/contracts/*.md` | 걸린 규칙의 계약. progressive 전용 |

`.html` 둘은 브라우저나 WebStorm HTML 프리뷰로 연다. 외부 의존성 없는 단일 파일.

---

## 3. 포함된 Skill

| Skill | Loading | 담당 범위 |
| --- | --- | --- |
| [react](./skill/react/HANDBOOK.md) | progressive | 컴포넌트 경계 · route-local · handler · state |
| [typescript](./skill/typescript/HANDBOOK.md) | progressive | import · type · helper · JSDoc |
| [css](./skill/css/HANDBOOK.md) | progressive | plain CSS · owner namespace · 토큰 |

skill 이름은 `convention-<skill>`.

companion은 `metadata.json`이 선언하고 자동으로 켜진다.
프로젝트에는 owner skill만 적으면 된다.
`react`는 `typescript`를 항상, `css`를 styling surface 변경 시에만 켠다.

---

## 4. 동작 원리

progressive skill 셋은 규칙 전체를 안 읽는다. 단계마다 좁힌다.

| 순서 | 파일 | 읽는 범위 | 빈도 |
| --- | --- | --- | --- |
| 1 | `SKILL.md` | 라우터. 무엇이 바뀌었는지 판정 | 항상 |
| 2 | `RULES_INDEX.md` | 규칙당 한 줄. 끝까지 훑음 | 항상 |
| 3 | `contracts/<id>.md` | 걸린 규칙의 규범만. 예시 제외 | 걸린 규칙만 |
| 4 | `rules/<id>.md` | 원문 | `CRITICAL` 이거나 판단이 모호할 때 |

`HANDBOOK.md`는 이 경로 밖이다. 사람이 통독할 때 쓰고,
에이전트는 명시적 요청이 있을 때만 읽는다.
세 skill이 모두 progressive라 자동으로 통째로 읽는 단계는 없다.

측정 결과와 근거는 [docs/progressive-loading.html](./docs/progressive-loading.html).

---

## 5. 문제 해결

| 증상 | 원인 |
| --- | --- |
| 에이전트가 컨벤션을 모름 | symlink 미설치, 또는 재시작 안 함 |
| 불필요한 규칙까지 적용 | 알려진 약점. 누락보다는 안전한 실패 |
| `HANDBOOK.md` 수정이 되돌아옴 | 생성물. `rules/*.md`를 고쳐야 함 |
| 규칙이 걸린 이유가 불분명 | 그 규칙 frontmatter의 `appliesWhen` 확인 |

---

## 6. 규칙 수정

절차는 [CONTRIBUTING.md](./CONTRIBUTING.md). 착수 전 알 것 넷.

1. 정본은 `rules/*.md`. `HANDBOOK.md` · `RULES_INDEX.md` · `contracts/*.md` ·
   `conventions.html` · `conventions-data.js`는 생성물.
2. 규범은 첫 `Incorrect` 앞에서 끝낸다. 생성기가 그 앞부분만 계약으로 뽑는다.
3. `appliesWhen` 한 줄이 라우팅을 결정한다. 규칙의 결론이 아니라 관찰 가능한 변경 조건.
4. 고친 뒤 `npm --prefix package run dev:<skill>` → `viewer` → `check:generated:all` → `check:viewer`.

이 저장소에서 AI 에이전트로 작업하면 [AGENTS.md](./AGENTS.md) 가 작업 규칙.

버전은 `SKILL.md`의 `name` 변경이 breaking, skill 추가와 호환 확장이 minor,
문구 수정이 patch.
