import path from "node:path";

import {checkGeneratedSkill} from "../src/check-generated.js";
import {resolveTargetSkillPaths} from "../src/config.js";

/*
 * 생성물 신선도. RULES_INDEX, contracts 가 현재 원본에서 다시 그린 것과 바이트 단위로 같은지
 */
for (const skillPaths of await resolveTargetSkillPaths(process.argv.slice(2))) {
	await checkGeneratedSkill(skillPaths);
	console.log(`Checked ${path.join(skillPaths.skillName, "RULES_INDEX.md")}`);
}
