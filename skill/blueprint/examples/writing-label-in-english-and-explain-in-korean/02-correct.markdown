### Q1

**환불 주문을 목록에 포함하나요?** Waiting on plan. Blocks stage 2

- Ask: 운영에서 환불 건을 같은 목록에서 보나요?
- Now: 포함으로 구현 중
- Also: 상태 칩 색

```ts
export default {
    status: [
        {phrase: "Done", kind: "verified", date: true},
        {phrase: "Waiting on plan", kind: "unverified"},
        {phrase: "Blocked", kind: "blocked"},
        {phrase: "As recommended", kind: "neutral", date: true},
    ],
    refs: [{prefix: "Q", color: "violet"}, {prefix: "B", color: "amber"}, {prefix: "D"}, {prefix: "R", color: "violet"}],
};
```
