# Full-handbook applicability discovery

- Repository HEAD: `653a8dff1727c3e860daa5f6a28df8099531dd83`
- Arm: `full-handbook`
- Scenario: `css-repeated-values-and-optional-token`
- Trial: `1`
- Structural status: valid under `progressive-loading-behavioral-v2`

이 실행은 기존 generated CSS handbook의 rule body만 읽고 exact partition을 작성했습니다. 독립 manifest가 N/A로 승인한 `C20 organization-keep-style-files-owned-by-one-component-or-route`까지 Selected로 분류해 selection precision gate를 실패했습니다. 당시 full handbook에는 compact index가 사용하는 `appliesWhen`이 표시되지 않아, 파일과 owner를 유지하는 selector/value-only 변경에도 ownership rule의 일반 규범을 적용 범위로 오해할 수 있었습니다.

이 discovery failure를 삭제하거나 재분류하지 않고 원본 run JSON으로 보존합니다. 이후 `aed9a02`에서 progressive full handbook rule heading 아래에 escaped `Applies when`을 생성하도록 RED renderer test와 build를 수정했습니다. 같은 시점의 schema-invalid trial attempts는 행동 결과로 점수화하지 않았으며 이 폴더에도 포함하지 않습니다.
