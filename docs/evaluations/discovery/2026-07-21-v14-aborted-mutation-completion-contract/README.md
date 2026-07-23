# v14 aborted: mutation completion contract omitted `reason`

This experiment is discovery evidence only. None of its runs may be admitted to the final behavioral or semantic result.

- Source HEAD: `30b7c36e560ba70af5e478e831473dd89d431faf`
- Protocol SHA-256: `sha256:b345e28b0c9318a34ca60306867e058bf0c37879ae0ae7ddabaa709ee98ef730`
- Finalized before operator stop: 49/66 runs (`candidate` 23, support 26)
- Invalid attempts before/operator stop: 5 directories
- Source and protocol mutation after dispatch: none

The mutation-only child contract declared exact completion accounting but omitted the validator-required non-empty `completion.reason`. Two independent fresh attempts followed that exact contract and were both rejected with `run.completion is missing required field "reason".` The third attempt and all other lanes were stopped once the coordinator source confirmed the systemic prompt defect. The interrupted progressive RTE02 t2 `initial-cli` directory records the operator stop and is not a model failure.

The next source revision adds `reason is required and must be a non-empty string` to every mutation completion contract surface and a regression test. Because that changes the coordinator prompt bytes and Git HEAD, all v14 artifacts are quarantined rather than reused.
