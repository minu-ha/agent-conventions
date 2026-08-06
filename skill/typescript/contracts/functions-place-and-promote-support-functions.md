# Place and Promote Support Functions Deliberately

**Impact: MEDIUM-HIGH (잡동사니 파일이 생기지 않고 공용 승격이 실제 사용처를 근거로 일어납니다)**

떼어 낼지는 `functions-extract-helpers-only-when-the-boundary-is-real`이 먼저 판정합니다.
이 규칙은 그 결과를 어디 두고 언제 올릴지만 봅니다.

- 소유자 아래에 `helper.ts`, `helpers.ts`, `utils.ts` 같은 잡동사니 파일을 만들지 않습니다.
  어느 폴더에 둘지는 프레임워크 skill의 역할 폴더 규칙이 정합니다.
- 소유자 아래에서는 내보낸 대표 함수 하나당 파일 하나입니다.
  전역 `shared/util.ts`는 여러 소유자가 함께 쓰는 순수 함수를 모으는 자리라 예외입니다.
- 호출 깊이는 소유자에서 내보낸 함수, 그 파일 안 비공개 함수까지 두 단계로 끝냅니다.
  내보낸 함수가 또 다른 내보낸 함수를 타고 가는 사슬은 만들지 않습니다.
  단계를 나누고 싶으면 내보내지 말고 한 함수 본문 안에 지역 변수로 둡니다.
- 공용 승격은 **두 소유자 이상이 이미 직접 호출할 때만** 합니다.
  그때 `shared/util.ts`의 `util.*`로 올립니다.
  나중에 쓸 것 같아서 올리지 않습니다.

**Requires selected:** `functions-extract-helpers-only-when-the-boundary-is-real` · 함께 적용

> 예시·예외가 필요하면 [full rule](../rules/03-04-functions-place-and-promote-support-functions.md)을 읽습니다.
