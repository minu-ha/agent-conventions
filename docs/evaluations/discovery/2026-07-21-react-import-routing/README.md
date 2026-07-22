# React import routing discovery

- Repository HEAD: `aa94b7a31d466b578698af424e4d283980ea6c88`
- Arm: `full-handbook`
- Scenario: `css-domain-state-class-contract`
- Trial: `1`
- Structural status: valid under `progressive-loading-behavioral-v2`

이 실행은 direct `clsx` value import를 추가하는 요청에서 React R01 `ownership-avoid-barrel-and-react-namespace-imports`까지 Selected로 분류했습니다. 같은 pair의 trial 2는 R01을 N/A로 분류했으므로 누락이 아니라 한 번의 over-selection입니다.

R01의 실제 범위는 barrel/index 재노출, React namespace type, type/value 혼합 import, 소유 출처를 숨기는 경로입니다. 일반 direct value import까지 활성화하면 TypeScript의 direct-import 규칙과 중복되고 React rule precision이 떨어집니다. 따라서 `appliesWhen`에 일반 direct value import 제외를 명시하고, RED metadata assertion과 generated index/handbook을 함께 갱신했습니다. 원본 run JSON은 행동 불일치를 재실행으로 지우지 않은 discovery evidence로 보존합니다.
