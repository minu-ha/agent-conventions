import {buildSkill} from "../src/build.js";
import {parseCliArgs, resolveTargetSkillPaths} from "../src/config.js";
import {buildSite} from "../src/site.js";

/*
 * skill별 RULES_INDEX, contracts와 content/public/convention/ 생성
 * --skill-root 지정 시 저장소 사이트 생성 제외
 */
const args = process.argv.slice(2);

for (const skillPaths of await resolveTargetSkillPaths(args)) {
	await buildSkill(skillPaths);
}

if (parseCliArgs(args).skillRootDir === undefined) {
	await buildSite();
}
