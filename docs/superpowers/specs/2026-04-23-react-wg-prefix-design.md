# React Wg Prefix Naming Design

**Goal:** React structured skill에서 `widget` 레이어는 유지하면서, widget-owned 파일명과 심볼명을 `wg` 기준으로 통일한다.

## Scope

- `skill/react` structured skill만 수정한다.
- 폴더 레이어 이름은 계속 `widget/`을 사용한다.
- widget-owned 파일 prefix는 `widget-*`에서 `wg-*`로 바꾼다.
- widget-owned symbol prefix는 `Widget*`에서 `Wg*`로 바꾼다.
- source of truth 문서와 generated [AGENTS.md](../../../skill/react/AGENTS.md)를 함께 맞춘다.

## Out of Scope

- 실제 앱 코드 rename
- 다른 skill 문서 수정
- [deprecated/react.md](../../../skill/react/deprecated/react.md) 보정

## Approach

1. React ownership/composition/screen rule에서 widget naming 예시를 `wg` 기준으로 바꾼다.
2. ownership rule에는 `widget/` 폴더는 유지하지만 파일과 심볼은 `wg`/`Wg`를 쓴다는 문장을 명시한다.
3. pressure test의 owner naming 기대치도 새 기준에 맞춰 보강한다.
4. React skill validate/build를 다시 실행해 generated output을 갱신한다.

## Risks

- 일부 예시만 바꾸면 `widget/` 레이어와 `wg` naming rule이 섞여 보일 수 있다.
- generated guide를 재생성하지 않으면 source of truth와 배포 문서가 어긋난다.

## Success Criteria

- React source-of-truth 문서에서 widget-owned file/symbol 예시가 일관되게 `wg`/`Wg`를 사용한다.
- `widget`은 폴더/레이어 이름으로만 남는다.
- React skill validate/build가 통과한다.
