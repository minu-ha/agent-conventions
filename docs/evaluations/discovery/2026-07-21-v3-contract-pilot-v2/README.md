# v2 exact-shape pilot superseded by disclosed-edge fix

이 directory는 source commit `01c2fbb0c91c168f52475e7a645c940afc79f6f0`와 criteria commitment `sha256:0447be22fdada6510f489ce38f10e2ea8ec8d7369cd3f14b3429e649fd48a683`로 실행한 두 fresh pilot의 원본 artifact입니다. 이후 source commit에서 mandatory trace와 progressive disclosure 계약의 모순을 수정했으므로 최종 66-run matrix에는 포함하지 않습니다.

- no-skill trial은 strict merge를 통과했지만 이전 source HEAD에 묶인 observational run이므로 discovery evidence로만 보존합니다.
- progressive trial은 Selected source edge만 기록했습니다. 당시 validator는 index와 N/A contract에 공개되지 않은 N/A source edge까지 요구해 merge를 차단했습니다.

payload나 run은 사후 수정하지 않았습니다. 최종 계약은 Selected/Unknown contract에서 실제로 공개된 mandatory edge만 pass마다 exact-cover하고, 읽지 않는 N/A source edge는 trace에서 생략합니다. extra Selected target은 별도의 exact partition scorer가 계속 차단합니다.
