#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const run = (fileName) => {
  const result = spawnSync(process.execPath, [path.join(currentDir, fileName)], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run("validate-rules.mjs");
run("build-agents.mjs");
