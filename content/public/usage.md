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
- 테스트 설계, 작성, 검토는 `convention-testing`을 사용한다.
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
- Testing은 TypeScript를 함께 읽고, React 렌더나 실제 스타일을 바꿀 때만 해당 companion을 켠다.
- 테스트에서 CSS를 단언하거나 locator를 쓰는 것만으로 React, CSS를 활성화하지 않는다.

테스트 규칙은 [Testing](convention/testing.md)에서 읽는다.
테스트 추가 여부와 IA 번호, 케이스 ID, 제목 언어, 결과서 형식은 프로젝트 계약을 따른다.

## 테스트를 작성하는 흐름

1. [범위와 배치](convention/testing/01-scope.md)에서 unit, integration, 앱 E2E의 실행 경계를 정한다.
   smoke는 배포한 산출물의 대표 진입, sanity는 변경점과 인접 흐름의 선별이며 테스트 층과 구분한다.
2. [시나리오와 기대값](convention/testing/02-case.md)에서 GIVEN, WHEN, THEN의 조건, 행동, 결과를 먼저 적는다.
   실행되는 예제도 같은 블록 주석을 사용하며 설정, handler, story 선언에 빈 구간을 만들지 않는다.
3. [데이터와 격리](convention/testing/03-data.md)에서 화면이 읽는 값, 참조 관계, 날짜를 명시한다.
   Kubb faker를 써도 관찰되는 값은 직접 덮고 seed를 기본 작성 절차로 요구하지 않는다.
4. [네트워크 경계](convention/testing/06-network.md)의 생성 DTO와 faker → 소유 builder → endpoint handler 순서로 조립한다.
   공유 registry를 브라우저 worker와 Node bridge에 연결하고 spec에는 사례의 차이만 둔다.
5. [Story와 harness](convention/testing/09-story.md)에서 실제 화면, provider와 라우트를 조립한다.
   소비 spec이 story를 mount하고 상태와 행동을 단언해야 자동화 integration 검증이 된다.
6. 구역의 상태 조합은 integration에, 실제 앱 진입과 화면 연결은 E2E에 둔다.
   수집 목록과 실제 실행을 구분하고 [검증과 결과 보고](convention/testing/08-verification.md)에 실행 범위를 남긴다.

생성 파일의 이름, gallery 구현, 결과서 파서는 프로젝트 계약을 사용한다.
네트워크 예제의 소유 builder, registry와 fixture는 같은 주문 계약으로 연결되며 실제 앱 경계는 소비 프로젝트가 제공한다.

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
