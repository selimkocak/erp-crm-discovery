import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function run(cmd) {
  console.log(`> ${cmd}`);
  try {
    const out = execSync(cmd, { cwd: process.cwd(), encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    if (out.trim()) console.log(out.trim());
    return out;
  } catch (err) {
    console.error(`Error running ${cmd}:`, err.stderr || err.message);
    throw err;
  }
}

console.log('=== Git Initialization & Local Commit Preparation ===\n');

// 1. Git init
run('git init -b main');

// 2. Set local repo user info
run('git config user.name "ERP CRM Discovery Team"');
run('git config user.email "team@erpcrm.discovery"');

// 3. Check status before add
console.log('\n--- Git Status (Before Add) ---');
run('git status --short');

// 4. Add files
console.log('\n--- Adding Tracked Files ---');
run('git add .');

// 5. Check staged status
console.log('\n--- Git Status (Staged) ---');
run('git status --short');

// 6. Commit
console.log('\n--- Creating Local First Commit ---');
run('git commit -m "Initial open-source ERP CRM Discovery application"');

// 7. Verify
console.log('\n--- Verification ---');
run('git status');
run('git log --oneline -5');
run('git branch --show-current');
run('git remote -v');
