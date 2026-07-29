# Keep Style Files Owned by One Component or Route Surface

**Impact: MEDIUM (keeps stylesheets aligned to a single owner so comments, ordering, and scope remain understandable)**

스타일 파일은 하나의 컴포넌트, route surface, 또는 pages-local shell 책임 범위를 기본 단위로 유지합니다.
가장 중요한 기준은 한 파일 안의 클래스들이 하나의 owner를 설명하느냐입니다.
파일이 길어질 경우 가벼운 섹션 주석이나 선언 순서 규약을 보조적으로 둘 수 있지만,
이 규칙의 핵심은 주석 스타일이 아니라 ownership을 섞지 않는 것입니다.

> 예시·예외가 필요하면 [full rule](../rules/organization-keep-style-files-owned-by-one-component-or-route.md)을 읽습니다.
