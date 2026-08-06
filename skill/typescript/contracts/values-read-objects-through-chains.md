# Read Object Fields Through Chains, Not Destructuring

**Impact: MEDIUM-HIGH (값이 어느 객체에서 왔는지가 쓰는 자리마다 남아 이름만 보고 출처를 되짚지 않습니다)**

객체에서 값을 꺼낼 때 구조분해하지 않고 `product.title`처럼 체인으로 읽습니다.
같은 값에 새 이름만 붙이는 별칭 `const`도 만들지 않습니다.

구조분해와 별칭은 이름만 남기고 출처를 지웁니다.
파일이 길어지면 `title`이 매개변수인지 응답인지 지역 변수인지 읽는 쪽에서 구분할 수 없습니다.
`product.title`은 그 값이 어디서 왔는지를 쓰는 자리마다 다시 말해 줍니다.

**배열과 튜플은 대상이 아닙니다.**
`const [keyword, setKeyword] = useState("")`나
`for (const [key, value] of Object.entries(target))`처럼 자리로 값을 꺼내는 것은 지울 이름이 없습니다.
튜플에는 필드 이름이 없어서 출처가 지워지지 않습니다.

**예외를 두지 않습니다.**
`짧은 함수`나 `좁은 스코프`는 코드를 보고 판정할 수 없는 기준입니다.
줄이 몇 개 늘었다고 판정이 뒤집히는 규칙은 지킬 수 없습니다.

- 이름을 바꿔 꺼내는 것도 구조분해입니다.
  `const {status: projectStatus} = project`는 출처를 지우면서 이름까지 갈아 끼웁니다.
- 계산이 없으면 이름을 붙이지 않습니다.
  `functions-name-a-value-only-for-recompute-or-judgment`가 이름을 붙이라고 하는 것은 계산한 결과입니다.
  필드를 그대로 읽는 것은 계산이 아닙니다.
- 체인이 깊어 읽기 어려우면 꺼내는 자리가 아니라 **그 형태를 만드는 자리**를 봅니다.
  받는 쪽에서 끊는 것으로는 깊이가 줄지 않고 출처만 사라집니다.

> 예시·예외가 필요하면 [full rule](../rules/04-03-values-read-objects-through-chains.md)을 읽습니다.
