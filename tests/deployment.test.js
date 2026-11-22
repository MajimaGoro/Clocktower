import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { once } from "node:events";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { build } = require("../scripts/build.cjs");
const { createDevServer } = require("../scripts/dev-server.cjs");
const projectRoot = fileURLToPath(new URL("../", import.meta.url));

async function makeOutput(t) {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "clocktower-pages-"));
  t.after(async () => {
    // Remove only the unique temporary directory created by this test.
    assert.equal(path.dirname(temporaryRoot), path.resolve(tmpdir()));
    assert.ok(path.basename(temporaryRoot).startsWith("clocktower-pages-"));
    await rm(temporaryRoot, { recursive: true, force: true });
  });
  return path.join(temporaryRoot, "site");
}

async function listFiles(root, relative = "") {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const filename = path.join(relative, entry.name);
    return entry.isDirectory() ? listFiles(root, filename) : [filename];
  }));
  return nested.flat();
}

function runEntryRedirect(html, href) {
  let destination;
  const location = Object.assign(new URL(href), {
    replace(value) { destination = new URL(value, href); },
  });
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length > 0, "Root entry needs a redirect that preserves query and hash");
  for (const [, script] of scripts) {
    vm.runInNewContext(script, { location, window: { location }, URL });
  }
  assert.ok(destination, "Root entry must navigate to the application");
  return destination;
}

for (const basePath of ["/", "/Clocktower/"]) {
  test(`static build and preview work at ${basePath}`, async t => {
    const outputRoot = await makeOutput(t);
    const unchangedFiles = ["public/minibotc/index.html", "src/vendor/uni-runtime.js", "src/data/roles.js"];
    const originals = await Promise.all(unchangedFiles.map(filename => readFile(path.join(projectRoot, filename))));
    build({ basePath, outputRoot });

    const server = createDevServer({ useDist: true, distRoot: outputRoot });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    t.after(() => new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    }));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const appUrl = new URL(`${basePath}minibotc/`, origin);

    const rootResponse = await fetch(new URL(basePath, origin));
    assert.equal(rootResponse.status, 200);
    const rootHtml = await rootResponse.text();
    const redirect = runEntryRedirect(rootHtml, `${origin}${basePath}?example=1#/pages/grimoire/index`);
    assert.equal(redirect.pathname, `${basePath}minibotc/`);
    assert.equal(redirect.search, "?example=1");
    assert.equal(redirect.hash, "#/pages/grimoire/index");
    assert.match(rootHtml, /href=["']\.\/minibotc\/["']/);

    const appResponse = await fetch(appUrl);
    assert.equal(appResponse.status, 200);
    const appHtml = await appResponse.text();
    const entryUrls = [...appHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
      .map(([, value]) => new URL(value, appUrl));
    assert.ok(entryUrls.some(url => url.pathname === `${basePath}src/vendor/uni-runtime.js`));
    assert.ok(entryUrls.some(url => url.pathname.endsWith("/assets/index-DxEIEyKa.css")));

    // Check both HTML entry URLs and generated module, CSS and native-image references.
    const referencedUrls = new Map(entryUrls.map(url => [url.href, url]));
    const files = await listFiles(outputRoot);
    assert.ok(files.includes("index.html"));
    assert.ok(files.includes(".nojekyll"));
    assert.ok(files.every(filename => !filename.split(path.sep).includes("_archive")));
    assert.ok(!files.includes("package.json"));
    for (const filename of files.filter(filename => /\.(js|css)$/.test(filename))) {
      const source = await readFile(path.join(outputRoot, filename), "utf8");
      const fileUrl = new URL(basePath + filename.split(path.sep).join("/"), origin);
      const imports = [
        ...source.matchAll(/\b(?:import|export)\s+(?:[^;]*?\s+from\s+)?["']([^"']+)["']/g),
        ...source.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g),
      ];
      const assets = [...source.matchAll(/["'(]((?:\/[^\s"'`()]+)\.(?:js|css|webp|png|jpe?g|svg))/g)];
      for (const [, value] of [...imports, ...assets]) {
        // /static is a uni-image logical path, resolved by the runtime's router base.
        if (value.startsWith("/static/")) continue;
        const url = new URL(value, fileUrl);
        if (url.origin === origin) referencedUrls.set(url.href, url);
      }
    }
    // Resolve the runtime's actual preload table against its configured asset base.
    const runtime = await readFile(path.join(outputRoot, "src/vendor/uni-runtime.js"), "utf8");
    const router = runtime.match(/router:\{mode:"hash",base:("[^"]+"),assets:"assets",routerBase:("[^"]+")/);
    assert.ok(router, "The runtime must retain hash routing and its asset base");
    const runtimeBase = new URL(JSON.parse(router[1]), origin);
    assert.equal(runtimeBase.href, appUrl.href);
    assert.equal(JSON.parse(router[2]), appUrl.pathname);
    const preloadTable = runtime.match(/__vite__mapDeps\.viteFileDeps\s*=\s*(\[[^\]]+\])/);
    assert.ok(preloadTable, "The runtime preload table must be available");
    for (const filename of JSON.parse(preloadTable[1])) {
      const url = new URL(filename, runtimeBase);
      referencedUrls.set(url.href, url);
    }
    const logicalImageUrl = new URL("static/roles/washerwoman.webp", runtimeBase);
    referencedUrls.set(logicalImageUrl.href, logicalImageUrl);
    assert.ok(referencedUrls.size > 60, "Verify the module graph, not only the HTML entry");
    await Promise.all([...referencedUrls.values()].map(async url => {
      assert.ok(url.pathname.startsWith(basePath), `Escaped deployment base: ${url.pathname}`);
      const response = await fetch(url, { method: "HEAD" });
      assert.equal(response.status, 200, `Missing generated resource ${url.pathname}`);
      if (url.pathname.endsWith(".js")) assert.match(response.headers.get("content-type"), /javascript/);
    }));

    const roles = await readFile(path.join(outputRoot, "src/data/roles.js"), "utf8");
    assert.match(roles, /\/static\/roles\/washerwoman\.webp/);
    assert.deepEqual(await Promise.all(unchangedFiles.map(filename => readFile(path.join(projectRoot, filename)))), originals);

    if (basePath !== "/") {
      const response = await fetch(new URL(basePath.slice(0, -1), origin), { redirect: "manual" });
      assert.ok([301, 302, 307, 308].includes(response.status));
      assert.equal(new URL(response.headers.get("location"), origin).pathname, basePath);
      await response.arrayBuffer();
      for (const pathname of ["/minibotc/", "/src/vendor/uni-runtime.js", "/Clocktower-other/minibotc/"]) {
        const outside = await fetch(new URL(pathname, origin));
        assert.equal(outside.status, 404, `Preview must not hide missing deployment prefixes at ${pathname}`);
        await outside.arrayBuffer();
      }
    }
  });
}

test("invalid deployment bases fail before creating build output", async t => {
  const outputRoot = await makeOutput(t);
  for (const basePath of ["https://example.test/", "//example.test/", "/../", "/Clocktower/../", "/Clocktower?x=1", "/Clocktower#hash", "/Clocktower\\nested/"]) {
    assert.throws(() => build({ basePath, outputRoot }), undefined, basePath);
  }
  await assert.rejects(readdir(outputRoot), { code: "ENOENT" });
});

test("custom build output cannot replace an existing nonempty directory", async t => {
  const outputRoot = await makeOutput(t);
  await mkdir(outputRoot);
  const marker = path.join(outputRoot, "keep.txt");
  await writeFile(marker, "keep this file");
  assert.throws(() => build({ basePath: "/Clocktower/", outputRoot }));
  assert.equal(await readFile(marker, "utf8"), "keep this file");
});
