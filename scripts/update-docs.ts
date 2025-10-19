/**
 * update-docs.ts
 *
 * This script checks the last commit and updates documentation files in the /docs folder accordingly.
 *
 * INSTRUCTIONS FOR AI/MAINTAINER:
 * - Run this script after each commit to keep documentation in sync.
 * - The script will:
 *   1. Get the last commit hash and message.
 *   2. List changed files in the last commit.
 *   3. If any API, schema, or config files changed, update the relevant docs.
 *   4. Add a summary of changes to docs/CHANGELOG.md.
 * - Extend this script to auto-extract API routes, schema changes, or config updates as needed.
 * - You can use Node.js APIs and child_process for git commands.
 */

import { execSync } from 'child_process';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

function run(cmd: string) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

const lastCommit = run('git log -1 --pretty=format:"%H %s"');
const [commitHash, ...commitMsgArr] = lastCommit.split(' ');
const commitMsg = commitMsgArr.join(' ');
const changedFiles = run(`git show --name-only --pretty=format:"" ${commitHash}`)
  .split('\n')
  .filter(Boolean);

// Only update docs for important commits
const important = /feat|fix|schema|api|docs/i.test(commitMsg);
if (!important) {
  console.log('No important changes detected, skipping doc update.');
  process.exit(0);
}

// Example: If any API or schema files changed, update docs
const apiChanged = changedFiles.some(f => f.startsWith('src/app/api/'));
const schemaChanged = changedFiles.some(f => f.startsWith('src/db/schema'));
const configChanged = changedFiles.some(f => f.endsWith('config.ts'));

let docUpdateMsg = `## ${commitHash}\n${commitMsg}\n`;
if (apiChanged) docUpdateMsg += '- API files changed\n';
if (schemaChanged) docUpdateMsg += '- Schema files changed\n';
if (configChanged) docUpdateMsg += '- Config files changed\n';
if (!apiChanged && !schemaChanged && !configChanged) docUpdateMsg += '- No API/Schema/Config changes detected\n';

docUpdateMsg += '\n';

// Append to docs/CHANGELOG.md
const changelogPath = join(process.cwd(), 'docs', 'CHANGELOG.md');
appendFileSync(changelogPath, docUpdateMsg);

console.log('Docs updated. See docs/CHANGELOG.md for summary.');
