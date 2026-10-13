import {buildSkill} from "../src/build.js";
import {parseCliArgs, resolveTargetSkillPaths} from "../src/config.js";
import {buildSite} from "../src/site.js";

/*
 * 생성물 전부. skill 마다 HANDBOOK, RULES_INDEX, contracts 를 쓰고 docs/convention/ 을 다시 씀
 * --skill-root 로 fixture 루트를 빌드할 때는 저장소의 사이트를 건드리지 않음
 */
const args = process.argv.slice(2);

for (const skillPaths of await resolveTargetSkillPaths(args)) {
	await buildSkill(skillPaths);
}

if (parseCliArgs(args).skillRootDir === undefined) {
	await buildSite();
}
