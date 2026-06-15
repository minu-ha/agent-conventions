# 섹션

이 파일은 Figma Visual Parity rule의 섹션 순서, 영향도, 설명을 정의합니다.

## 1. Trigger and Scope (trigger)
**Impact:** CRITICAL
**Description:** Figma 링크, node, screenshot이 UI 구현 기준으로 제공된 경우에는 visual parity 작업으로 분류하고, 반대로 디자인 기준이 아닌 요청은 이 skill로 과잉 적용하지 않아야 합니다.

## 2. Evidence and Visual Diff (evidence)
**Impact:** CRITICAL
**Description:** 구현 전에 Figma evidence와 현재 브라우저 구현 화면을 모두 확보하고, visual diff 표로 차이를 분류해야 작업 범위와 검증 기준이 분명해집니다.

## 3. Integration Layers and API Evidence (integration)
**Impact:** CRITICAL
**Description:** Figma MCP, Code Connect, REST API, variables/components/styles metadata, browser screenshot diff 중 사용 가능한 계층은 모두 조합하고, 없는 계층은 명시적으로 fallback해야 구현 품질을 최대로 끌어올릴 수 있습니다.

## 4. Static Copy and Dynamic Data (data)
**Impact:** CRITICAL
**Description:** Figma에 보이는 값이 static UI copy인지 dynamic API data인지 먼저 분류해야 UI copy는 맞추고 서버 데이터는 하드코딩하지 않는 균형을 지킬 수 있습니다.

## 5. Implementation Discipline (implementation)
**Impact:** HIGH
**Description:** Visual parity 구현은 기존 컴포넌트와 디자인 토큰을 우선 사용하고, scope 밖 구조 변경이나 label 삭제를 피해야 실제 제품 코드의 일관성을 유지합니다.

## 6. Verification and Reporting (verification)
**Impact:** CRITICAL
**Description:** 완료 기준은 build/test 성공이 아니라 Figma screenshot과 browser screenshot 비교이며, 남은 mismatch와 검증 명령을 완료 보고에 남겨야 합니다.
