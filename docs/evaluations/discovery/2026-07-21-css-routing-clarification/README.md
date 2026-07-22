# CSS routing clarification discovery

- Repository HEAD: `aed9a021b70d2e7356b0549a6c1673f58b90d465`
- Arm: `full-handbook`
- Scenario: `css-domain-state-class-contract`
- Trials: `1`, `2`
- Structural status: both valid under `progressive-loading-behavioral-v2`

두 독립 실행은 React와 TypeScript partition을 manifest와 정확히 맞췄고, CSS에서는 기존 oracle에 더해 C01과 C08을 동일하게 Selected로 분류했습니다.

- C08 `composition-do-not-build-structural-variants-with-modifiers`: 요청이 `--active`를 반복 가능한 domain-state modifier로 분리하는 판단 자체이므로 `appliesWhen`과 rule body 모두에 직접 해당합니다. 기존 manifest가 N/A로 둔 것이 잘못이어서 Selected로 이동했습니다.
- C01 `naming-default-to-plain-css-when-no-module-convention`: 기존 plain stylesheet 안의 class contract만 수정하고 파일 형식을 선택하지 않는데도 이전 `appliesWhen`의 넓은 "class contract를 만든다" 문구가 선택을 유도했습니다. format decision 또는 CSS Modules 도입·전환을 실제로 검토할 때만 활성화하도록 조건을 좁혔습니다.

두 run JSON은 행동 불일치를 재실행으로 지우지 않은 원본 증거입니다. 이 발견 뒤 source rule, independent test oracle, routing manifest, token context를 함께 수정하고 새 committed HEAD에서 최종 matrix를 다시 시작합니다.
