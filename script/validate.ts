import {resolveTargetSkillPaths} from "../src/config.js";
import {validateSkill} from "../src/validate.js";

/*
 * 정본 검사. 인자 없이 모든 skill, --skill=<name> 으로 하나
 */
for (const skillPaths of await resolveTargetSkillPaths(process.argv.slice(2))) {
	await validateSkill(skillPaths);
}
