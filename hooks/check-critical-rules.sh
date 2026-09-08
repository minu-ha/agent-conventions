#!/usr/bin/env bash
# CRITICAL 규칙 마무리 재대조. Claude Code 의 Stop 훅으로 건다.
# 작업 트리에서 HEAD 대비 추가된 줄과 추적하지 않는 새 파일만 보고, 위반이 있으면 stderr 에 목록을 쓰고 2 로 끝난다.
# Claude 는 그 목록을 받아 고친 뒤 다시 마무리한다. 같은 이유로 이어 가는 중(stop_hook_active)이면 한 번만 막고 0 으로 끝난다.
#
# grep 으로 잡히는 CRITICAL 만 다룬다.
#   typescript/05-01  ??·|| 오른쪽의 리터럴 폴백
#   typescript/02-05  ../ 상대경로와 같은 폴더 심볼 가져오기(./ 는 심볼 없는 css 같은 파일만 허용)
#   react/01-04       레이어 역방향 가져오기(ui→widget·page, widget→page, 루트 레이어→component·page)
#   css/07-02         소유자 접두 없는 @keyframes 이름
# 응답 필드 이름 바꿔치기(react/02-04)나 래퍼 프롭 공개 범위(react/03-02)는 grep 으로 못 잡아 문장으로만 남는다.
# 이름 규칙의 바닥도 함께 본다.
#   react/01-02       새로 만들거나 옮긴 부품 파일이 접두사 뒤 역할 낱말 하나(_wg-header.tsx)인 것
#   css/02-01         한 식별자(pg_·wg_·ui_)를 두 파일 이상이 쓰는 것. 트리 전체를 본다
set -u

input=$(cat 2>/dev/null || true)
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
	exit 0
fi
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# "파일<TAB>줄<TAB>내용" 으로 추가된 줄을 모은다
added_lines() {
	git diff -U0 HEAD -- . 2>/dev/null | awk '
		/^\+\+\+ b\// { file = substr($0, 7); next }
		/^@@/ { split($3, hunk, ","); line = substr(hunk[1], 2) + 0; next }
		/^\+/ && !/^\+\+\+/ { print file "\t" line "\t" substr($0, 2); line++ }'
	git ls-files --others --exclude-standard 2>/dev/null | grep -E '\.(ts|tsx|css)$' | while IFS= read -r file; do
		awk -v file="$file" '{ print file "\t" NR "\t" $0 }' "$file"
	done
}

lines=$(added_lines | grep -Ev $'\t[[:space:]]*(//|/?\\*)')

# $1 규칙 라벨, $2 파일 경로 정규식, $3 내용 정규식
report() {
	printf '%s\n' "$lines" | awk -F'\t' -v path_re="$2" '$1 ~ path_re' | grep -E "$3" | awk -F'\t' -v label="$1" '{ printf "[%s] %s:%s  %s\n", label, $1, $2, $3 }'
}

literal='(["'"'"'`]|[0-9]|\[\]|\{\}|true|false)'
out=$(
	report "typescript/05-01 리터럴 폴백" '\.(ts|tsx)$' "(\?\?|\|\|)[[:space:]]*$literal"
	report "typescript/02-05 상대경로" '\.(ts|tsx)$' "from[[:space:]]+['\"]\.\./"
	report "typescript/02-05 같은 폴더 심볼 가져오기" '\.(ts|tsx)$' "import[[:space:]]+[{*A-Za-z].*from[[:space:]]+['\"]\./"
	report "react/01-04 ui 가 위 레이어를 가져옴" '^src/component/ui/' "from[[:space:]]+['\"]@/(component/widget|page)/"
	report "react/01-04 widget 이 page 를 가져옴" '^src/component/widget/' "from[[:space:]]+['\"]@/page/"
	report "react/01-04 루트 레이어가 컴포넌트를 가져옴" '^src/(util|constant|type|hook|store|service|config|asset)/' "from[[:space:]]+['\"]@/(component|page)/"
	# 새로 만들거나 옮긴 부품 파일의 이름이 접두사 뒤 낱말 하나면 무엇의 부품인지 말하지 않는다
	{ git diff --name-status HEAD -- . 2>/dev/null | awk '$1 ~ /^(A|R)/ { print $NF }'; git ls-files --others --exclude-standard 2>/dev/null; } |
		grep -E '(^|/)_(pg|wg|ui)-[a-z0-9]+\.(tsx|css)$' | awk '{ printf "[react/01-02 역할 낱말 하나] %s  부품 이름은 무엇의 것인지 말하는 낱말을 앞에 둔다\n", $0 }'
	# 같은 식별자를 두 파일이 쓰면 css/02-01 위반이다
	git ls-files -z -- '*.css' 2>/dev/null | xargs -0 grep -HoE '^\.(pg|wg|ui)_[A-Za-z0-9]+' 2>/dev/null | sed -E 's#^([^:]+):\.#\1 #' | sort -u |
		awk '{ count[$2]++; files[$2] = files[$2] " " $1 } END { for (slug in count) if (count[slug] > 1) printf "[css/02-01 식별자 중복] %s  %s\n", slug, files[slug] }'
	printf '%s\n' "$lines" | awk -F'\t' '$1 ~ /\.css$/ && match($3, /@keyframes[[:space:]]+[A-Za-z0-9_-]+/) {
		name = substr($3, RSTART, RLENGTH); sub(/@keyframes[[:space:]]+/, "", name)
		if (name !~ /^[a-z]+_[A-Za-z0-9]+__[A-Za-z0-9]+$/) printf "[css/07-02 keyframes 소유자 접두] %s:%s  %s\n", $1, $2, $3
	}'
)

if [ -z "$out" ]; then
	exit 0
fi

count=$(printf '%s\n' "$out" | grep -c .)
{
	echo "CRITICAL 규칙 마무리 재대조에서 위반 ${count}건. 고친 뒤 다시 마무리한다."
	printf '%s\n' "$out"
	echo "원문은 ~/.claude/skills/convention-<skill>/rules/ 의 해당 번호 파일이다. 예외가 맞다면 이유 주석을 남기고 사용자에게 알린다."
} >&2
exit 2
