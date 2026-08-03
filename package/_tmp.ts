import {getSkillPaths} from "./src/config.js";
import {readSkillDocument} from "./src/parser.js";
import {getRuleId} from "./src/routing.js";
const doc = await readSkillDocument(getSkillPaths(process.argv[2]));
console.log("═══UNIVERSE");
for (const r of doc.rules) console.log(`\t"${getRuleId(r)}",`);
console.log("═══ROUTING");
for (const r of doc.rules) {
	console.log(`\t"${getRuleId(r)}": {`);
	console.log(`\t\tappliesWhen:`);
	console.log(`\t\t\t"${r.appliesWhen}",`);
	console.log(`\t\treviewWith: [${r.reviewWith.map((x: string) => `"${x}"`).join(", ")}],`);
	if (r.requiredOnCompletion) console.log(`\t\trequiredOnCompletion: true,`);
	console.log(`\t},`);
}
