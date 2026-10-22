---
name: Tooling
label: validate, build, check 도구와 생성물 계약
group: Development
order: 10
---

`skill/*` 아래 structured convention skill을 build, validate, test하는 저장소 루트 `package.json`의 TypeScript 도구입니다. 라이브러리는 `src/`, 명령 진입점은 `script/`, 테스트는 `test/`입니다.

## Artifact Model

| Artifact | Role |
| --- | --- |
| `rules/_sections.md`, `rules/_template.md`, `rules/*.md`, `examples/<rule-id>/*` | Editable rule source of truth. Rules load example files through `<<<` lines. |
| `metadata.json` | Editable build and companion activation contract. |
| `SKILL.md` | Editable activation/load router. |
| `RULES_INDEX.md` | Generated compact index. |
| `contracts/*.md` | Generated selected-rule contract; never edit directly. |
| `routing-evals.json` | Editable test oracle; never runtime context. |

모든 skill이 `RULES_INDEX.md`와 `contracts/*.md`를 생성합니다. 사람이 읽는 전체 보기는 이 사이트입니다.

rule frontmatter의 `reviewWith`는 조건부 재평가, `requiresSelected`는 source가 final Selected일 때 target도 반드시 Selected인 전이, `requiredOnCompletion: true`는 활성 skill의 완료 gate입니다. compact index에는 `completionGate` marker와 `reviewWith`만 렌더하고, 필수 target 목록은 selected/unknown contract에서만 로드해 초기 token 비용을 제한합니다. Unknown을 먼저 해소하며 N/A contract의 필수 target은 전이하지 않습니다.

`metadata.json.companions`는 companion 관계를 선언합니다. `required`는 owner와 항상 활성화하고 `conditional`은 non-empty `appliesWhen`이 실제 변경 surface와 맞을 때만 활성화합니다.

공통 rule은 companion skill이 소유하고 framework/project 전용 규칙은 local overlay에 남깁니다. build 결과를 직접 편집해 overlay를 우회하지 않습니다.

## Document site

Node.js 22.12.0 이상에서 for-humanity `0.16.0`을 사용합니다. 버전은 `package.json`과 `package-lock.json`에 고정합니다. `for-humanity.config.ts`는 패키지의 `SiteConfig` 타입을 사용하며 저장소의 타입 검사·린트에 포함합니다.

`npm run dev`는 Vite 개발 서버와 Hono 문서 앱을 포트 4322에서 실행합니다. `npm run content:build`는 정적 결과를 `content/dist`에 생성하고, `npm run content:preview`는 그 결과를 확인하는 로컬 미리보기입니다. 설정 변경은 개발 서버 재시작이 필요합니다.

명령은 프로젝트 루트에서 실행합니다. 설정 파일은 루트 `for-humanity.config.ts`, 홈은 `content/README.md`, 공개 문서는 `content/public/`에 둡니다.
규칙 페이지와 예제 복사본은 `content/public/convention/`에 생성합니다. 연구 문서와 도구 설명도 기존 공개 범위를 유지해 `content/public/`에 둡니다.
로컬 전용 문서가 필요하면 `content/private/`에 추가합니다. `dev`에서는 함께 읽고 `build`와 `preview`에서는 제외합니다.

문서 페이지의 검색 설명은 각 frontmatter의 `label`입니다. 사이트 언어는 설정의 `lang: "ko"`로 지정합니다.

CLI 사용법은 `npx for-humanity --help`, 설치 버전은 `npx for-humanity --version`으로 확인합니다. 빌드 결과·문서 경고는 Consola로 표시하고, Mermaid는 필요한 페이지에서 자체 호스팅 모듈을 불러옵니다.

사이트의 SVG 렌더링은 Mermaid 12가 담당합니다. `check:diagrams`는 beautiful-mermaid의 문자 격자로 규칙 도식의 작성 폭과 라벨을 검사합니다.

## Scripts

| Script | Does |
| --- | --- |
| `npm run validate` | source, metadata, companion closure, index 입력, routing eval manifest, 규칙 문체를 검사합니다. `-- --skill=<name>`으로 하나만 봅니다. |
| `npm run build` | 모든 buildable skill의 `RULES_INDEX.md`, `contracts/*.md`를 다시 쓰고 `content/public/convention/`에 [for-humanity](https://github.com/minu-ha/for-humanity) Markdown을 생성합니다. 이 폴더는 커밋하지 않습니다. |
| `npm run check` | `validate`, `check:generated`, `check:diagrams`, `typecheck`, `lint`, `lint:examples`, `typecheck:examples`, `test`를 차례로 실행합니다. 커밋 전 한 번에 돌리는 명령입니다. |
| `npm run check:generated` | 파일을 수정하지 않고 `RULES_INDEX.md`, `contracts/*.md`가 renderer 결과와 byte 단위로 같은지, missing, stale, orphan, symlink와 companion closure를 확인합니다. |
| `npm run check:diagrams` | 규칙의 `mermaid` 흐름도가 격자 폭 125칸 안에 그려지는지 봅니다. |
| `npm run dev` | `build` 후 for-humanity 개발 서버를 띄웁니다. 포트는 `for-humanity.config.ts`의 `port`입니다. |
| `npm run content:build` | `build` 후 `content/dist`에 배포용 정적 사이트를 만듭니다. |
| `npm run content:preview` | `content/dist`의 공개 사이트를 포트 4322에서 미리 봅니다. 빌드 결과가 필요합니다. |
| `npm run test` | 라우터와 생성물 계약, 매니페스트 검증기, build, validate fixture, 규칙 문체, 사이트 생성 테스트를 실행합니다. 규칙 산문은 핀하지 않습니다. |
| `npm run lint`, `npm run lint:fix` | 도구 소스의 Biome 검사와 자동 수정입니다. |
| `npm run lint:examples` | `Correct` 예제 파일을 규칙이 보여 주는 설정 그대로 검사합니다. `skill/examples.biome.json`은 typescript 07-01 의 예제 파일을 `extends`와 `plugins`로 읽고 미사용 변수 예외만 더한 것이고, `skill/stylelint.config.mjs`는 css 08-01 의 예제 파일을 `extends`로 읽고 레이어별 override 를 세 접두사 한 패턴으로 접은 것입니다. `Incorrect` 예제는 일부러 어기므로 `skill/incorrect.biome.json`, `skill/incorrect.stylelint.config.mjs`로 규칙 없이 문법만 검사합니다. |
| `npm run typecheck` | `tsc --noEmit`입니다. |
| `npm run typecheck:examples` | `Correct` 예제 파일을 `skill/examples.tsconfig.json`으로 타입 검사합니다. 예제가 import 없이 쓰는 이름은 `skill/examples.d.ts`가 선언합니다. React, es-toolkit, nuqs, react-router, TanStack Query, MUI, dayjs, clsx 는 설치된 패키지의 타입을 그대로 가리키므로 실제 스택에 없는 API 를 쓰면 실패합니다. 예제 세계관(작은 상점 관리자 콘솔)의 도메인, 컴포넌트와 프롭, 생성된 쿼리 훅, `@/` 모듈도 같은 파일이 실제 타입으로 선언하므로 이 파일이 예제의 스키마입니다. 규칙마다 같은 컴포넌트가 다른 프롭을 받거나 응답 모양이 어긋나면 여기서 잡힙니다. 새 이름을 쓰면 tsc 가 `Cannot find name` 이나 `Cannot find module` 로 알려 주니 그 이름을 알맞은 절에 더합니다. |

`npm install`이 `prepare`로 `.githooks`를 git 훅 경로로 등록하므로 커밋 전에 `check:generated`가 돌고, 생성물이 정본과 어긋나면 커밋이 막힙니다. `build` 뒤의 `check:generated`는 generated file을 다시 쓰는 단계가 아니라 stale 여부를 검증하는 단계입니다. CI에서는 build로 dirty output을 숨기지 말고 `check`를 gate로 둡니다.

## Buildable Loading Topology

| Skill | Companion contract |
| --- | --- |
| `react` | required `typescript`; conditional `css` |
| `css` | conditional `typescript` |
| `typescript` | none |
| `figma` | conditional `react`, `css` |

skill은 `SKILL.md` → activated `RULES_INDEX.md` 전체 scan과 completion gate → Selected/Unknown `contracts/*.md` → CRITICAL 또는 판정 근거가 필요한 `rules/*.md` full expansion → Unknown 해소 → final Selected의 `requiresSelected` closure 순서로 소비합니다. 형태를 정하는 규칙은 원문의 `Correct` 예제도 읽습니다. 새 selection이나 companion이 생기면 고정점까지 반복합니다. 현재 제공하는 skill은 위 표의 네 가지입니다.

`routing-evals.json`과 회귀 테스트는 예상 선택 목록, 필수 규칙 관계, 전체 규칙의 적용 사례 유무를 검사합니다.
이 검사를 통과해도 실제 에이전트의 선택 정확도가 인증되는 것은 아닙니다.
적용 조건을 바꿀 때는 비적용 사례도 검토하고, 행동 평가를 했다면 사용한 모델, 입력, 결과를 별도로 기록합니다.

## GitHub Pages

공개 주소는 [minu-ha.github.io/agent-conventions](https://minu-ha.github.io/agent-conventions/).
`for-humanity.config.ts`의 `url`은 도메인, `basePath`는 `/agent-conventions/`으로 지정합니다.
개발과 미리보기 주소는 `http://localhost:4322/agent-conventions/`입니다.

GitHub 저장소의 Pages 소스는 `GitHub Actions`로 설정합니다.
`main`에 push하거나 `Documentation` 워크플로를 직접 실행하면 `.github/workflows/docs.yml`이 의존성을 설치하고 `npm run content:build`로 생성한 `content/dist` 전체를 배포합니다.
정적 출력은 Git에 커밋하지 않습니다.
