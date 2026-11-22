'use strict';

const fs = require('node:fs');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
const distRoot = path.resolve(projectRoot, 'dist');

function normalizeBasePath(value = '/') {
  if (value === '') return '/';
  if (typeof value !== 'string' || !value.startsWith('/')) {
    throw new Error('部署基础路径必须以 / 开头，例如 /Clocktower/。');
  }
  const basePath = value.endsWith('/') ? value : `${value}/`;
  if (basePath !== '/' && (!/^\/(?:[A-Za-z0-9._-]+\/)+$/.test(basePath) || basePath.split('/').some(part => part === '.' || part === '..'))) {
    throw new Error('部署基础路径只能包含仓库名路径，不能包含 ..、查询参数或 URL。');
  }
  return basePath;
}

function prepareOutput(outputRoot) {
  // Only the default generated directory may be recursively replaced.
  // Custom output directories, used by integration tests, must be new or empty.
  if (outputRoot !== distRoot) {
    if (fs.existsSync(outputRoot)) {
      const stat = fs.lstatSync(outputRoot);
      if (stat.isSymbolicLink() || !stat.isDirectory() || fs.readdirSync(outputRoot).length) {
        throw new Error('自定义构建目录必须是空目录，拒绝覆盖已有文件。');
      }
    }
    fs.mkdirSync(outputRoot, { recursive: true });
    return;
  }
  if (path.dirname(distRoot) !== projectRoot || path.basename(distRoot) !== 'dist') {
    throw new Error('拒绝写入项目以外的构建路径。');
  }
  if (fs.existsSync(distRoot)) {
    if (fs.lstatSync(distRoot).isSymbolicLink()) throw new Error('dist 是符号链接，拒绝替换。');
    const realProject = fs.realpathSync(projectRoot);
    const realDist = fs.realpathSync(distRoot);
    if (path.dirname(realDist) !== realProject || path.basename(realDist) !== 'dist') {
      throw new Error('构建目录解析后超出项目范围，拒绝替换。');
    }
    fs.rmSync(distRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(distRoot, { recursive: true });
}

function prefixAssetPaths(directory, basePath) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      prefixAssetPaths(filename, basePath);
    } else if (entry.isFile() && /\.(?:html|js|css)$/.test(entry.name)) {
      const source = fs.readFileSync(filename, 'utf8');
      // Match absolute references in JS/HTML strings and CSS url(...), keeping
      // relative ESM imports and uni-image's logical /static/... values intact.
      const result = source.replace(/(["'`(])\/(minibotc|src)\//g, (_, delimiter, directoryName) => `${delimiter}${basePath}${directoryName}/`);
      if (result !== source) fs.writeFileSync(filename, result);
    }
  }
}

const rootIndex = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0;url=./minibotc/">
    <title>睡典钟楼</title>
    <script>
      const target = new URL('./minibotc/', window.location.href);
      target.search = window.location.search;
      target.hash = window.location.hash;
      window.location.replace(target.href);
    </script>
  </head>
  <body><a href="./minibotc/">进入睡典钟楼</a></body>
</html>
`;

function build({ basePath = '/', outputRoot = distRoot } = {}) {
  basePath = normalizeBasePath(basePath);
  outputRoot = path.resolve(outputRoot);
  for (const filename of ['public/minibotc/index.html', 'src/app/GrimoireApp.js']) {
    if (!fs.existsSync(path.join(projectRoot, filename))) throw new Error(`缺少构建入口：${filename}`);
  }
  prepareOutput(outputRoot);
  fs.cpSync(path.join(projectRoot, 'public'), outputRoot, { recursive: true, dereference: false });
  fs.cpSync(path.join(projectRoot, 'src'), path.join(outputRoot, 'src'), { recursive: true, dereference: false });
  if (basePath !== '/') prefixAssetPaths(outputRoot, basePath);
  fs.writeFileSync(path.join(outputRoot, 'index.html'), rootIndex);
  fs.writeFileSync(path.join(outputRoot, '.nojekyll'), '');
  fs.writeFileSync(path.join(outputRoot, '.deployment.json'), `${JSON.stringify({ basePath })}\n`);
  return { basePath, outputRoot };
}

function countFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((sum, entry) => sum + (entry.isDirectory() ? countFiles(path.join(directory, entry.name)) : 1), 0);
}

function main() {
  const args = process.argv.slice(2);
  let basePath = '/';
  for (let index = 0; index < args.length; index++) {
    if (args[index].startsWith('--base=')) basePath = args[index].slice('--base='.length);
    else if (args[index] === '--base' && index + 1 < args.length) basePath = args[++index];
    else throw new Error(`未知构建参数：${args[index]}。用法：npm run build -- --base=/Clocktower/`);
  }
  const result = build({ basePath });
  console.log(`构建完成：${countFiles(result.outputRoot)} 个文件，输出到 ${result.outputRoot}`);
  console.log(`部署基础路径：${result.basePath}；运行 npm run serve 预览。`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { build, normalizeBasePath };
