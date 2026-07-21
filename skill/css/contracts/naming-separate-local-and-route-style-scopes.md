# Separate Route, Local, and Shared Style Scopes

**Impact: HIGH (keeps route-owned page styles, shared component styles, and truly local helper styles from mixing into the same namespace or file)**

route/framework skill이 route-owned surface로 판단한 스타일은 `rt_*` scope를 유지합니다. 파일이 route-local helper folder로 내려갔다는 이유만으로 main screen surface를 `loc_*`로 바꾸지 않습니다.

scope 기준:

- `rt_*`: route-owned screen, route support surface, route/document owner
- `loc_*`: route surface와 독립된 leaf helper
- `wg_*`: 여러 route에서 재사용되는 block
- `ui_*`: primitive component

서로 다른 owner 범위는 한 파일에 섞지 않습니다. 어떤 markup이 route-owned인지 판단하는 책임은 활성화된 framework convention이 가집니다.

> 예시·예외가 필요할 때만 [full rule](../rules/naming-separate-local-and-route-style-scopes.md)을 추가로 읽고 fallback 사유를 기록합니다.
