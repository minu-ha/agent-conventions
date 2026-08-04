# Restrict Absolute Aliases to Layer Roots

**Impact: HIGH (소유자 내부 모듈이 밖에서 직접 열리지 않아 경계가 남습니다)**

절대경로 별칭의 첫 마디는 전역 레이어 루트여야 합니다.

| 경로 | 판정 |
| --- | --- |
| `@/ui`, `@/widget` | 허용 |
| `@/shared`, `@/service`, `@/store`, `@/asset` | 허용 |
| `@/page/...` 등 화면 내부 | 금지 |

- 첫 마디가 레이어 루트면 그 아래 깊이는 제한하지 않습니다.
  `@/widget/chart-card/wg-chart-card`는 허용입니다.
- 화면이나 소유자 내부 모듈은 절대경로로 열지 않고 `./`로만 접근합니다.
- 소유자 밖에서 필요해지면 경로를 뚫는 대신 전역 레이어로 올립니다.

> 예시·예외가 필요하면 [full rule](../rules/01-06-naming-restrict-absolute-aliases-to-layer-roots.md)을 읽습니다.
