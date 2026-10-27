# 섹션

이 파일은 Blueprint 설계 문서 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Materials and Truth (material)
**TitleKo:** 재료와 정답
**Impact:** CRITICAL
**Description:** 설계 문서에 들어가는 재료는 Figma, 기획 데모, API spec, 코드, 캡처입니다.
무엇이 무엇의 정답인지 먼저 표로 정하고, 재료가 서로 어긋나는 항목은 종류별 정답으로 확정하거나 질문으로 남깁니다.
Figma는 UX 안으로 읽고, 응답 모양은 spec이 아니라 캡처로 확인합니다.

## 2. Decisions and Questions (question)
**TitleKo:** 결정과 질문
**Impact:** CRITICAL
**Description:** 결정과 질문은 번호를 붙여 한 문서에 모으고, 본문은 그 번호를 링크로 가리킵니다.
카드는 선택지와 추천 하나, 이유 한 줄로 짧게 쓰고, 남의 답이 필요한 것만 남깁니다.
BE 카드에는 그림을 붙이고, 닫을 때는 결과 한 줄만 남깁니다.

## 3. Document Structure (structure)
**TitleKo:** 문서 짜임
**Impact:** HIGH
**Description:** 문서는 overview, questions, 화면, 변경 네 종류입니다.
화면 문서는 한눈에, 화면, 구조 순서로 사람이 위를 읽고 에이전트가 접힌 상세까지 읽습니다.
본문은 늘 지금의 정답만 담고, 변경은 변경 문서로 받아 반영 뒤 본문을 고쳐 씁니다.

## 4. Writing (writing)
**TitleKo:** 글
**Impact:** HIGH
**Description:** 개조식으로 한 줄에 한 사실만 쓰고, 라벨은 영어, 설명은 한국어로 씁니다.
출처는 줄 끝에 두고 Figma 노드는 링크로만 적습니다.
흐름은 Mermaid, 구조는 treeView, 화면은 번호 붙인 캡처로 보여 줍니다.

## 5. Stages and Gates (stage)
**TitleKo:** 단계와 관문
**Impact:** HIGH
**Description:** 구현은 준비, 구역, 연동, 검증 단계로 나누고 막는 질문이 있는 단계만 Blocked로 둡니다.
완료는 확인 명령의 결과로 보고하고 단계 표를 갱신합니다.

## 6. Verification (verify)
**TitleKo:** 확인
**Impact:** HIGH
**Description:** 설계 문서를 넘기기 전에 사이트를 빌드해 링크, 번호, 추천, 문체를 검사합니다.
문체를 바꾸거나 절을 옮길 때는 옛 판과 사실을 대조합니다.
