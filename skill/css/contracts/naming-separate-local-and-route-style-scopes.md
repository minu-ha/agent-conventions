# Separate Route, Local, and Shared Style Scopes

**Impact: HIGH (route 소유 페이지 스타일·공용 컴포넌트 스타일·순수 local 헬퍼 스타일이 같은 namespace나 파일에 섞이는 것을 막습니다)**

route/framework skill이 route-owned surface로 판단한 스타일은 `rt_*` scope를 유지합니다.
route screen의 흐름을 구성하거나 지원하는 route support surface는 파일이 `_local/` 같은 helper folder로 내려가도
`rt_*`입니다.
route 맥락을 몰라도 되는 독립 leaf helper만 `loc_*`를 사용합니다.
파일 위치만으로 main screen 또는 route support surface를 `loc_*`로 바꾸지 않습니다.

scope 기준:

- `rt_*`: route-owned screen, route support surface, route/document owner
- `loc_*`: route 맥락과 독립된 leaf helper
- `wg_*`: 여러 route에서 재사용되는 block
- `ui_*`: primitive component

서로 다른 owner 범위는 한 파일에 섞지 않습니다.
어떤 markup이 route-owned인지 판단하는 책임은 활성화된 framework convention이 가집니다.

> 예시·예외가 필요하면 [full rule](../rules/01-05-naming-separate-local-and-route-style-scopes.md)을 읽습니다.
