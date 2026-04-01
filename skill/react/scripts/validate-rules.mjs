#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(currentDir, "..");
const rulesDir = path.join(skillDir, "rules");
const metadataPath = path.join(skillDir, "metadata.json");
const sectionsPath = path.join(rulesDir, "_sections.md");

const parseFrontmatter = (source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing frontmatter block.");
  }

  const [, frontmatterSource, body] = match;
  const frontmatter = {};

  for (const line of frontmatterSource.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    frontmatter[key] = rawValue;
  }

  return {
    frontmatter,
    body,
  };
};

const parseSections = (source) => {
  return [...source.matchAll(/^## (\d+)\. (.+) \(([^)]+)\)\n\*\*Impact:\*\* (.+)\n\*\*Description:\*\* ([^\n]+)$/gm)].map((match) => {
    const [, order, title, prefix, impact, description] = match;
    return {
      order: Number(order),
      title,
      prefix,
      impact,
      description,
    };
  });
};

const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
const sections = parseSections(await readFile(sectionsPath, "utf8"));

if (!metadata.version || !metadata.organization || !metadata.abstract) {
  throw new Error("metadata.json must include version, organization, and abstract.");
}

if (sections.length === 0) {
  throw new Error("rules/_sections.md must define at least one section.");
}

const validPrefixes = new Set(sections.map((section) => section.prefix));
const ruleFileNames = (await readdir(rulesDir))
  .filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("_"))
  .sort();

for (const ruleFileName of ruleFileNames) {
  const source = await readFile(path.join(rulesDir, ruleFileName), "utf8");
  const { frontmatter, body } = parseFrontmatter(source);
  const prefix = ruleFileName.split("-")[0];

  if (!validPrefixes.has(prefix)) {
    throw new Error(`Unknown prefix "${prefix}" in ${ruleFileName}.`);
  }

  for (const requiredKey of ["title", "impact", "impactDescription", "tags"]) {
    if (!frontmatter[requiredKey]) {
      throw new Error(`${ruleFileName} is missing frontmatter key "${requiredKey}".`);
    }
  }

  if (!body.includes("**Incorrect") || !body.includes("**Correct")) {
    throw new Error(`${ruleFileName} must contain Incorrect and Correct sections.`);
  }
}

console.log(`Validated ${ruleFileNames.length} rule files across ${sections.length} sections.`);
