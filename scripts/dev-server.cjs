'use strict';

// Serve only the public application and browser ESM source files.
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { normalizeBasePath } = require('./build.cjs');

const projectRoot = path.resolve(__dirname, '..');
const host = '127.0.0.1';
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wasm': 'application/wasm',
};

function isInside(base, filename) {
  const relative = path.relative(base, filename);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

function respond(response, status, message, method) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-cache',
  });
  response.end(method === 'HEAD' ? undefined : message);
}

function readDeploymentBase(distRoot) {
  const metadata = path.join(distRoot, '.deployment.json');
  return fs.existsSync(metadata) ? normalizeBasePath(JSON.parse(fs.readFileSync(metadata, 'utf8')).basePath) : '/';
}

function createDevServer({ useDist = false, distRoot = path.join(projectRoot, 'dist') } = {}) {
  const publicRoot = useDist ? path.resolve(distRoot) : path.join(projectRoot, 'public');
  const sourceRoot = useDist ? path.join(publicRoot, 'src') : path.join(projectRoot, 'src');
  const basePath = useDist ? readDeploymentBase(publicRoot) : '/';
  return http.createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      respond(response, 405, 'Method not allowed', request.method);
      return;
    }
    try {
      const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
      if (!pathname.startsWith('/') || /[\\\0:]/.test(pathname) || pathname.split('/').some(part => part === '..' || part === '.')) {
        respond(response, 400, 'Invalid path', request.method);
        return;
      }
      const searchIndex = (request.url || '').indexOf('?');
      const search = searchIndex === -1 ? '' : request.url.slice(searchIndex);
      if (basePath !== '/' && pathname === basePath.slice(0, -1)) {
        response.writeHead(302, { Location: basePath + search, 'Cache-Control': 'no-cache' });
        response.end();
        return;
      }
      if (!pathname.startsWith(basePath)) {
        respond(response, 404, 'File not found', request.method);
        return;
      }
      const sitePath = '/' + pathname.slice(basePath.length);
      if ((!useDist && sitePath === '/') || sitePath === '/minibotc') {
        response.writeHead(302, { Location: `${basePath}minibotc/${search}`, 'Cache-Control': 'no-cache' });
        response.end();
        return;
      }
      let base;
      let relative;
      if (useDist && (sitePath === '/' || sitePath === '/index.html')) {
        base = publicRoot;
        relative = 'index.html';
      } else if (sitePath.startsWith('/minibotc/')) {
        base = path.join(publicRoot, 'minibotc');
        relative = sitePath.slice('/minibotc/'.length);
      } else if (sitePath.startsWith('/src/')) {
        base = sourceRoot;
        relative = sitePath.slice('/src/'.length);
      } else {
        respond(response, 404, 'File not found', request.method);
        return;
      }
      let filename = path.resolve(base, relative);
      if (!isInside(base, filename)) {
        respond(response, 403, 'Forbidden', request.method);
        return;
      }
      let stat = await fsp.stat(filename);
      if (stat.isDirectory()) {
        filename = path.join(filename, 'index.html');
        stat = await fsp.stat(filename);
      }
      const [realBase, realFile] = await Promise.all([fsp.realpath(base), fsp.realpath(filename)]);
      if (!isInside(realBase, realFile) || !stat.isFile()) {
        respond(response, 403, 'Forbidden', request.method);
        return;
      }
      response.writeHead(200, {
        'Content-Type': mime[path.extname(realFile).toLowerCase()] || 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      if (request.method === 'HEAD') {
        response.end();
        return;
      }
      const stream = fs.createReadStream(realFile);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    } catch (error) {
      if (error instanceof URIError) {
        respond(response, 400, 'Invalid URL encoding', request.method);
      } else {
        respond(response, error.code === 'EACCES' ? 403 : 404, 'File not found', request.method);
      }
    }
  });
}

function openBrowser(url) {
  const executable = process.platform === 'win32' ? 'rundll32.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['url.dll,FileProtocolHandler', url] : [url];
  const opener = spawn(executable, args, { detached: true, stdio: 'ignore', windowsHide: true });
  opener.on('error', () => console.log('未能自动打开浏览器，请手动打开上面的本地网址。'));
  opener.unref();
}

function main() {
  const portOption = process.argv.find(argument => argument.startsWith('--port='));
  const port = portOption ? Number(portOption.slice(7)) : 8770;
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error('端口必须是 0 到 65535 之间的整数。');
    process.exitCode = 1;
    return;
  }
  const useDist = process.argv.includes('--dist');
  const appEntry = path.join(projectRoot, useDist ? 'dist' : 'public', 'minibotc', 'index.html');
  if (!fs.existsSync(appEntry)) {
    console.error(useDist ? '未找到构建结果，请先运行 npm run build。' : '未找到 public/minibotc/index.html，请确认项目文件完整。');
    process.exitCode = 1;
    return;
  }
  let server;
  let basePath;
  try {
    basePath = useDist ? readDeploymentBase(path.join(projectRoot, 'dist')) : '/';
    server = createDevServer({ useDist });
  } catch (error) {
    console.error(`无法读取构建配置：${error.message}`);
    process.exitCode = 1;
    return;
  }
  server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
      console.error(`端口 ${port} 已被占用。请关闭之前的开发服务，或运行 npm run dev -- --port=8771。`);
      console.error('开发服务保持固定端口，避免因端口自动变化而读不到浏览器原有存档。');
    } else {
      console.error(`启动失败：${error.message}`);
    }
    process.exitCode = 1;
  });
  server.on('listening', () => {
    const url = `http://${host}:${server.address().port}${basePath}minibotc/`;
    console.log(`睡典钟楼${useDist ? '构建预览' : '开发版'}：${url}`);
    console.log('修改源码后刷新浏览器即可。此窗口需保持运行，按 Ctrl+C 结束。');
    if (!process.argv.includes('--no-open')) openBrowser(url);
  });
  server.listen(port, host);
}

if (require.main === module) main();
module.exports = { createDevServer, isInside };
