# 섹션

이 파일은 Figma 구현 컨벤션 규칙의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Reading Figma through MCP (read)
**TitleKo:** MCP로 Figma 읽기
**Impact:** CRITICAL
**Description:** 어떤 도구를 어느 노드에 어떤 순서로 부를지 정합니다.
스크린샷과 메타데이터는 비용을 미리 가늠할 수 있고, `get_design_context`는 레이어가 정리되지 않을수록 노드가 늘어 비싸집니다.
그래서 화면은 싼 도구로 먼저 읽고, 비싼 도구는 저장소에 대응물이 없는 가장 작은 노드에만 부릅니다.
레이어 이름과 숨긴 레이어처럼 파일 정리 상태에 따라 뜻이 달라지는 정보는 렌더 결과와 대조해서 읽습니다.

## 2. Design Intent and Gaps (intent)
**TitleKo:** 디자인 의도와 빈자리
**Impact:** HIGH
**Description:** Figma 화면은 한 시점의 표본입니다.
UX 메모와 GUI 화면이 어긋나는 곳은 구현 전에 묻고, 그려지지 않은 상태는 프로젝트 기본 컴포넌트로 채웁니다.
프레임 폭과 샘플 문구는 실제 데이터와 화면 폭이 달라질 수 있는 표본으로 읽고, 아이콘과 표시가 암시하는 동작을 구현합니다.

## 3. Source of Truth (source)
**TitleKo:** 값과 문구의 출처
**Impact:** HIGH
**Description:** 생김새는 Figma에서 읽고 값은 저장소에서 가져옵니다.
간격, 색, 모서리 반경, 글꼴은 프로젝트 토큰으로 옮기고, 문구는 고정 문구와 서버 데이터로 나눠 출처를 정합니다.

## 4. Transcription (transcription)
**TitleKo:** 코드로 옮기기
**Impact:** CRITICAL
**Description:** 읽은 화면을 코드로 옮길 때 저장소 컴포넌트를 먼저 씁니다.
`get_design_context`가 돌려준 레이어 구조, 절대 좌표, 임시 에셋 URL은 옮기지 않고 의도만 CSS와 컴포넌트로 다시 씁니다.

## 5. Verification and Report (verify)
**TitleKo:** 검증과 보고
**Impact:** HIGH
**Description:** 일치를 주장하기 전에 실제 화면에서 렌더 값을 재고 판정 어휘로 보고합니다.
보고에는 읽은 노드, 부른 도구, 대응시킨 컴포넌트, 남은 질문과 차이를 남겨 다음 사람이 같은 호출을 되풀이하지 않게 합니다.
