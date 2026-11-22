'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const projectRoot = path.resolve(__dirname, '..');

function listJavaScript(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? listJavaScript(filename) : /\.(?:js|cjs|mjs)$/.test(entry.name) ? [filename] : [];
  });
}

const files = ['src', 'scripts', 'tests'].flatMap(directory => listJavaScript(path.join(projectRoot, directory)));
let failed = false;
for (const filename of files) {
  const result = spawnSync(process.execPath, ['--check', filename], { encoding: 'utf8', windowsHide: true });
  if (result.status !== 0 || result.error) {
    failed = true;
    console.error(path.relative(projectRoot, filename));
    console.error(result.error?.message || result.stderr || result.stdout);
  }
}
if (failed) process.exitCode = 1;
else console.log(`语法检查通过：${files.length} 个 JavaScript 文件。`);
