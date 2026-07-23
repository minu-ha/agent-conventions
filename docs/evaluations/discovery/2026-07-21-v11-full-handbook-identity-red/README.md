# v11 full-handbook identity RED

v11은 source HEAD `f372cc8d4512f3f818efa0ccdcb77c30d554f275`에 봉인한 실제 Codex CLI 평가였지만, 66-run gate를 완료하기 전에 평가 입력의 재현 가능한 결함을 발견해 중단했다.

- 봉인 protocol SHA-256: `f16e3a7bed0370582b8062039cc41a01a6d1effc73fa7d27bb5bd641e80dc48d`
- 봉인 semantic criteria SHA-256: `a75bc9c06de68c49fd35890cf40d52dc59e501538cd16421f8dc94b76467cd66`
- 봉인 semantic commitment SHA-256: `4be48d56b6cc485056bafe9357818d46ee3bbc9b5b17ec5a1d46dbddfa633ce9`
- 중단 시점 finalized run: 15/66
- 이 디렉터리의 `runs/`는 finalize된 run과 staged provenance를 원형 보존한다.
- 실행 실패와 중단 경계는 sibling `../2026-07-21-v11-invalid-attempts/`에 보존한다.

## 중단 사유

full-handbook child request에는 exact identity dictionary가 있었지만, 복사 규칙이 명시적이지 않았고 generated `AGENTS.md` 본문에도 stable rule ID가 없었다. 독립된 두 RTE02 initial child가 모두 정답 `state-use-effectevent-for-non-reactive-effect-callbacks`를 `state-use-effectevent-for-non-reactive-callbacks`로 재구성했다. validator는 React 42-rule partition 불일치로 두 payload를 모두 거부했다. RTE03 full-handbook에서도 같은 complete-universe gate가 실패했다.

이는 candidate oracle을 완화하거나 payload를 고쳐서 통과시킬 문제가 아니다. v12에서는 generated full handbook에 canonical ordinal/stable ID를 직접 노출하고, identity dictionary 값을 verbatim 복사한 뒤 partition union을 검증하도록 child contract를 강화한 새 source HEAD를 사용한다.
