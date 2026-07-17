#!/usr/bin/env node
// Builds the static (GitHub Pages) export: temporarily moves src/app/api out
// of the way — Next's `output: "export"` can't contain Route Handlers that
// read the request body/query dynamically — runs `next build` with
// STATIC_EXPORT=1, then restores src/app/api regardless of outcome.

import { existsSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const apiDir = path.join(root, "src", "app", "api");
const backupDir = path.join(root, ".api-backup");

function moveApiOut() {
  if (existsSync(apiDir)) renameSync(apiDir, backupDir);
}

function restoreApi() {
  if (existsSync(backupDir)) renameSync(backupDir, apiDir);
}

if (existsSync(backupDir)) {
  console.error(
    "Found a leftover .api-backup directory from a previous interrupted build — restoring it before continuing."
  );
  restoreApi();
}

moveApiOut();

const result = spawnSync("npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, STATIC_EXPORT: "1" },
});

restoreApi();

process.exit(result.status ?? 1);
