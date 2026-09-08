#!/usr/bin/env bash
# 작업 트리의 변경을 컨벤션 스킬 기준으로 검토하는 헤드리스 세션을 돌리고 위반 수를 낸다.
# 사용: review-diff.sh <저장소 경로> [기준 ref=HEAD] [출력 jsonl]
# 코드는 고치지 않는다(plan 모드). 마지막 줄 `VIOLATIONS confirmed=<n> ambiguous=<m>` 을 파싱해 준수율 측정에 쓴다.
set -u
repo="${1:?repo dir}"
base="${2:-HEAD}"
out="${3:-/tmp/review-$(date +%s).jsonl}"
cd "$repo" || exit 1
files=$( { git diff --name-only "$base" -- . ; git ls-files --others --exclude-standard; } | grep -E '\.(ts|tsx|css)$' | sort -u)
if [ -z "$files" ]; then
	echo "변경 파일 없음"; exit 0
fi
prompt="다음 파일들의 변경(\`git diff $base\` 와 새 파일)을 convention-typescript·convention-react·convention-css 스킬을 따라 검토하라. 규칙 원문을 읽고 판단하고 코드는 수정하지 마라.
변경된 줄과 그 줄이 속한 선언만 본다. 위반마다 한 줄씩 다음 형식으로 적는다.
[확정|해석여지] <skill/NN-MM> <파일:줄> <무엇이 어긋나는지 한 문장>
확정은 규칙 문면과 예제가 그 경우를 직접 다루는 것, 해석여지는 규칙이 직접 다루지 않아 사용자 판단이 필요한 것이다. 통과한 규칙은 적지 않는다.
마지막 줄은 정확히 이 형식이어야 한다: VIOLATIONS confirmed=<n> ambiguous=<m>
검토할 파일:
$files"
claude -p "$prompt" --model "${REVIEW_MODEL:-opus}" --permission-mode plan --output-format stream-json --verbose --max-turns 60 \
	--add-dir "$HOME/.claude/skills" --add-dir "$HOME/workspace/agent-conventions" > "$out" 2>/dev/null
python3 - "$out" <<'PY'
import json, re, sys
result = ""
for line in open(sys.argv[1], encoding="utf-8"):
	try:
		event = json.loads(line)
	except ValueError:
		continue
	if event.get("type") == "result":
		result = event.get("result") or ""
		usage = event.get("usage") or {}
		print(f"turns={event.get('num_turns')} cost=${event.get('total_cost_usd', 0):.2f} out_tokens={usage.get('output_tokens')}")
print(result)
found = re.search(r"VIOLATIONS confirmed=(\d+) ambiguous=(\d+)", result)
print("SUMMARY", found.group(0) if found else "VIOLATIONS confirmed=? ambiguous=?")
PY
