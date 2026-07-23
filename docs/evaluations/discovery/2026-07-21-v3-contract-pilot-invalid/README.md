# Invalid v3 child-contract pilot

이 directory는 source commit `ced36401bb67a22021748c8e739f71fa3f781bbf`와 semantic criteria commitment `sha256:756711f53ec318d8a9c246620b37a8cc244efb9fc0a5de42fd697132ad989444`로 dispatch한 최초 두 pilot의 원본 artifact를 보존합니다. 둘 다 run merge 전에 strict validator가 차단했으며 valid 66-run matrix에는 포함하지 않습니다.

- `no-skill--derive-existing-contract-with-docs--t1`: `semanticVerdicts` exact shape가 child request에 없어서 child가 `status`와 `evidence`를 사용했고, unknown field gate가 차단했습니다.
- `progressive--derive-existing-contract-with-docs--t1`: routing trace record shape가 축약돼 child가 `generatedIndexDigests`를 object가 아닌 array로 작성했고, strict shape gate가 차단했습니다.

payload는 사후 수정하지 않았습니다. request, dispatch envelope, child payload raw bytes를 그대로 유지하며 source contract 개선 후에는 새 commit, 새 protocol binding, 새 criteria commitment, fresh child로만 다시 실행합니다.
