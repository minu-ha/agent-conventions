# agent-conventions

팀 코딩 컨벤션을 위한 Codex 공용 skill pack입니다.

## 포함된 Skill

- `convention-react`
- `convention-css`
- `convention-tanstack-route`
- `convention-playwright-test`
- `convention-typescript`
- `convention-nestjs`

각 skill 디렉터리에는 다음 파일이 있습니다.

- `SKILL.md`: discovery metadata와 간단한 사용 가이드
- `*.md`: 상세 컨벤션 원문

## 저장소 구조

```text
agent-conventions/
  react/
    SKILL.md
    react.md
  css/
    SKILL.md
    css.md
  tanstack-route/
    SKILL.md
    tanstack-route.md
  playwright-test/
    SKILL.md
    playwright-test.md
  typescript/
    SKILL.md
    typescript.md
  nestjs/
    SKILL.md
    nestjs.md
```

## Codex 설치

Codex는 시작할 때 `~/.agents/skills/`를 스캔하므로, 권장 설치 방식은 symlink입니다.

```bash
mkdir -p ~/.agents/skills
ln -s /absolute/path/to/agent-conventions ~/.agents/skills/conventions
```

이미 `~/.agents/skills/conventions`가 있으면 먼저 백업합니다.

```bash
mv ~/.agents/skills/conventions ~/.agents/skills/conventions.backup
ln -s /absolute/path/to/agent-conventions ~/.agents/skills/conventions
```

symlink를 추가하거나 바꾼 뒤에는 Codex를 재시작합니다.

## 업데이트 방식

정본은 git 저장소로 관리합니다.

```bash
cd /absolute/path/to/agent-conventions
git pull
```

변경을 pull한 뒤에는 Codex를 재시작해서 새 skill을 다시 발견하게 합니다.

## 팀 배포 방식

권장 흐름은 다음과 같습니다.

1. 각 팀원이 이 저장소를 로컬에 clone 합니다.
2. `~/.agents/skills/conventions` symlink를 만듭니다.
3. 각 프로젝트의 `AGENTS.md`에서 필요한 skill 이름을 참조합니다.
4. 규칙 변경은 일반 git 흐름대로 branch, commit, merge request, tag로 관리합니다.

## 버전 관리 가이드

- `SKILL.md`의 `name` 변경은 breaking change로 취급합니다.
- 새 skill 추가나 규칙 확장은 minor 버전으로 관리합니다.
- 문구 수정, 예시 보강, 비호환성 없는 규칙 보정은 patch 버전으로 관리합니다.

## 프로젝트 연동

각 프로젝트의 `AGENTS.md`는 이 공용 skill을 라우팅하고, 그 위에 프로젝트 고유 제약, 생성 파일 보호 규칙, 검증 명령을 덧붙이는 방식으로 사용하는 것을 권장합니다.
