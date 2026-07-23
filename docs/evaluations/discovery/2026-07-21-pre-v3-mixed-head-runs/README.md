# Pre-v3 Mixed-HEAD Behavioral Runs

이 폴더의 37개 JSON은 protocol v2에서 생성된 discovery evidence이며 최종 점수에 포함하지 않습니다.

- repository HEAD가 `567377d` 31개, `653a8df` 2개, `0742787` 2개, `74e0849` 2개로 섞여 있습니다.
- arm은 `no-skill` 23개와 `full-handbook` 14개뿐이며 `progressive`와 `mutation` evidence가 없습니다.
- `exactPrompt`는 실제 child dispatch 전체가 아니라 scenario 문장만 보존했습니다.
- renderer version 3 시점의 결과라 현재 `requiresSelected`, `completionGate`, renderer version 4 계약을 검증하지 않습니다.
- 일부 full-handbook run은 이후 routing 결함을 발견한 실패 기록입니다.

현재 결과는 committed source HEAD에 묶인 protocol v3 66-run matrix만 `progressive-loading-runs/`에 새로 생성합니다.
