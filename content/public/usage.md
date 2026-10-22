---
name: Usage
label: 스킬 연결과 프로젝트 적용 방법
group: Development
order: 5
---

스킬 연결과 프로젝트 적용, 로컬 문서 확인 방법을 정리한다.

## 스킬 연결

이 설치 예시는 `~/.agents/skills/`를 스캔하는 에이전트 환경을 기준으로 한다.
저장소를 받은 뒤 스킬 폴더를 연결한다.

```sh
git clone https://github.com/minu-ha/agent-conventions.git
cd agent-conventions

mkdir -p ~/.agents/skills
ln -s "$PWD/skill" ~/.agents/skills/conventions
```

이미 `conventions`가 있다면 기존 연결을 확인하고 백업한 뒤 교체한다.
연결을 마치면 에이전트를 재시작한다.

## 프로젝트에 적용

프로젝트의 `AGENTS.md`에 작업별 스킬을 적는다.
새 프로젝트는 [시작 템플릿](https://github.com/minu-ha/agent-conventions/blob/main/AGENTS.template.md)을 사용해도 된다.

```markdown
## 코딩 컨벤션

- React와 TSX 작업은 `convention-react`를 사용한다.
- TypeScript 작업은 `convention-typescript`를 사용한다.
- CSS 작업은 `convention-css`를 사용한다.
- Figma 디자인 구현은 `convention-figma`를 사용한다.
```

프로젝트에는 작업을 담당하는 스킬을 지정한다.
함께 필요한 스킬은 각 스킬의 companion 선언에 따라 활성화된다.

## 규칙 읽기

[문서 사이트](https://minu-ha.github.io/agent-conventions/)에서 스킬을 고르면 개요와 전체 규칙 표가 나온다.
섹션 페이지에서는 한 줄 요지, 판정 기준, 잘못된 예와 올바른 예, 관련 규칙을 함께 볼 수 있다.
규칙 번호는 원문 파일 번호와 같아 사이트와 소스를 맞춰 찾을 수 있다.

로컬에서 보려면 Node.js 22.12.0 이상에서 실행한다.

```sh
npm install
npm run dev
```

[localhost:4322/agent-conventions](http://localhost:4322/agent-conventions/)에서 확인한다.
사이트는 [for-humanity](https://github.com/minu-ha/for-humanity)로 만든다.

## 함께 읽는 스킬

- React 작업은 TypeScript를 항상 함께 읽고, 스타일을 바꾸면 CSS도 읽는다.
- Figma 작업은 바뀌는 범위에 따라 React와 CSS를 함께 활성화한다.
- 순수 CSS 작업에서는 TypeScript를 자동으로 켜지 않는다.

## 규칙을 읽는 순서

스킬은 변경 범위를 판정하고, 인덱스를 끝까지 훑은 뒤 해당하는 규칙을 읽는다.

| 순서 | 문서 | 읽는 범위 |
| --- | --- | --- |
| 1 | `SKILL.md` | 변경 범위와 활성화할 스킬 판정 |
| 2 | `RULES_INDEX.md` | 규칙마다 한 줄로 적힌 적용 조건 전체 |
| 3 | `contracts/<id>.md` | 해당하는 규칙의 계약 |
| 4 | `rules/NN-MM-<id>.md` | `CRITICAL`, `HIGH`는 원문 전체, `MEDIUM`은 판단이 모호할 때 |

작업 범위가 바뀌면 규칙을 다시 선택하고, 마무리할 때 변경 내용을 적용한 규칙과 대조한다.
전체 검토를 요청받으면 규칙 원문을 순서대로 읽는다.
설계 배경과 측정 결과, 검증의 한계는 [Progressive loading](research/progressive-loading.md)에 기록한다.

## 문제 해결

| 증상 | 확인할 것 |
| --- | --- |
| 에이전트가 스킬을 찾지 못함 | 스킬 폴더 연결과 에이전트 재시작 여부 |
| 불필요한 규칙까지 적용 | `appliesWhen`의 제외 조건, 실제 변경 범위, `reviewWith`의 자동 적용 여부 |
| 인덱스나 계약 수정이 되돌아옴 | 생성물 대신 `rules/*.md`를 수정했는지 확인 |
| 규칙이 선택된 이유가 불분명 | 해당 규칙 frontmatter의 `appliesWhen` 확인 |
