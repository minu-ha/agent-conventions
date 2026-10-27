import {readFileSync, writeFileSync} from "node:fs";

/**
 * Figma 프레임 PNG. 토큰은 git 밖 파일에서 읽고 출력에 찍지 않음
 */
const token = readFileSync(".ignore/figma-token", "utf8").trim();
const fileKey = "Ab12Cd34Ef56Gh78Ij90Kl";
const nodeId = "12:340";
const headers = {"X-Figma-Token": token};

const images = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&scale=1&format=png`, {headers}).then((response) => response.json());
const png = await fetch(images.images[nodeId]).then((response) => response.arrayBuffer());

writeFileSync("content/public/img/orders/figma-list.png", Buffer.from(png));
