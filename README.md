# 睡典钟楼重构开发版

此版本将原站公开前端按数据、规则、存档和界面组件拆分为浏览器原生 ES 模块，便于继续修改。原站为 [睡典钟楼](https://avalon2.top/minibotc/)。角色数据、图片、规则文本及原作者归属保留。

之前的 `_archive/outputs/minibotc-local` 目录和 `_archive/outputs/minibotc-local.zip` 保持原样，仍可独立运行。本目录是另建的开发版。

## 运行和开发

本机已有 Node.js，无需下载依赖，也不需要执行 `npm install`。

双击 `启动开发版.bat`，或在此目录运行：

```powershell
npm run dev
```

默认打开 `http://127.0.0.1:8770/minibotc/`。修改源文件后刷新浏览器即可看到变化。服务只监听本机，结束时按 `Ctrl+C`。端口被占用时会提示，而不会自动更换端口；确需更换时运行 `npm run dev -- --port=8771`。

浏览器存档按网址和端口隔离。原镜像与开发版默认使用不同端口，存档不会自动共享。清除网站数据、换浏览器或换端口也会影响已有记录的读取。

## 编辑入口

- `src/data/`：内置角色、剧本及静态配置。
- `src/domain/`：对局、角色、投票等规则和纯函数。
- `src/domain/session.js`：新建对局的默认值，以及旧存档迁移。
- `src/composables/useLongPress.js`：长按交互与组件生命周期。
- `src/services/`：图片读取、音频等浏览器服务。
- `src/storage/`：存档格式及本地读写。
- `src/state/`：根组件的对局状态、计算和事件处理。
- `src/components/`：按名称拆分的界面组件。
- `src/views/`：圆桌主界面的渲染。
- `src/styles/grimoire.css`：界面样式。
- `src/app/GrimoireApp.js`：根组件，连接状态和主界面。
- `src/vendor/uni-runtime.js`：保留的 Vue/uni-app 运行库和启动层，通常无需修改。
- `public/minibotc/static/` 与 `public/minibotc/assets/`：图片及公共资源。

组件以 JavaScript 渲染函数实现，保留原页面作用域样式标识。此工程未恢复原作者的 `.vue` 模板、注释或原始构建配置；框架运行库仍作为冻结的发布代码保留。业务部分已按用途拆开，可在对应模块中逐步迭代。

## 检查与静态构建

```powershell
npm run check
npm test
npm run build
npm run serve
```

`check` 检查源码语法，`test` 运行本项目回归测试，`build` 将 `public` 和 `src` 复制成可直接部署的 `dist`。重新构建只会替换本项目生成的 `dist`，不会改动保留的镜像。`serve` 用本地服务预览构建结果。

默认构建适用于域名根目录。部署时将 `dist` 的内容放到网站根目录，保留 `minibotc/` 和 `src/` 的相对位置。构建会生成根目录首页，自动跳转到 `./minibotc/` 并保留查询参数和 hash；页面内部继续使用 hash 路由。没有编译或压缩步骤，部署后仍能直接查看和修改模块。

自带页面资源保存在本地；“线上版”等外部入口仍访问原网站。自定义剧本如包含外部图标，加载这些图标仍可能需要联网。

## 部署到 GitHub Pages

1. 将项目提交并推送到 GitHub 仓库。`_archive/` 和 `dist/` 已列入 `.gitignore`，归档可继续保留在本地，无需移动或提交；网站由工作流重新构建。
2. 在仓库的 `Settings → Pages → Build and deployment → Source` 中选择 `GitHub Actions`。
3. 在 `Actions` 中选择 `Deploy to GitHub Pages`，点击 `Run workflow` 并选择仓库默认分支。之后每次向默认分支推送都会自动检查、测试、构建并发布 `dist`；其他分支不会发布。
4. 工作流成功后，从 `Settings → Pages` 打开网站。普通项目站点的地址类似 `https://用户名.github.io/Clocktower/`，首页会跳转到 `Clocktower/minibotc/`。

工作流使用 Node.js 24，无需安装依赖，也无需提交构建产物。它读取 GitHub Pages 实际配置的部署前缀，因此仓库改名、用户根站点和自定义域名均可使用同一份工作流；更改 Pages 地址或域名配置后重新运行工作流即可。配置方式参见 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

本地可按仓库子路径构建并预览：

```powershell
npm run build -- --base=/Clocktower/
npm run serve
```

预览服务会自动读取本次构建的部署前缀，访问地址以终端输出为准。部署到域名根目录时直接运行 `npm run build`，或显式传入 `--base=/`。部署前缀只应用于构建结果，不改变开发源码和原有 `/static/` 角色数据路径。

本地开发地址与线上地址使用不同的浏览器存储，已有本地存档不会自动转移到线上。

## 本轮完成的整理与验证

本轮拆分了原来的 22 个组件（含根组件），并将主页面的状态与渲染分离，给 80 个主要状态和处理函数添加了有含义的名称。新建对局、旧档迁移、创建与提交提名、历史票型修改与删除、身份卡领取均已独立为可测试函数。6 项根组件监听和生命周期副作用保留原顺序，159 个主视图捕获保持原有响应式对象。

21 项领域回归测试通过，覆盖原有角色与剧本数据校验、对局阶段、投票和平票、鬼票、身份领取、笔记边界和旧档迁移。浏览器实测通过随机配板、角色保存、进入首夜、刷新恢复角色，以及笔记编辑与刷新恢复；该测试页面没有加载失败的图片，也没有浏览器警告或错误日志。未逐项实测移动端触控、所有角色能力、图片上传和计时器声音。

旧镜像目录的 322 个文件逐一校验未改变。后续修改位置和当前工程限制见 `docs/开发说明.md`，导出符号与文件对应关系见 `docs/module-map.json`。

## 迁移后的目录

开发工程现在位于本目录根部，可直接运行 npm 命令。旧版、原压缩包、截图保存在 `_archive/outputs/`，抓取和重构过程资料保存在 `_archive/work/`。这些归档不是工程运行依赖。迁移清单和校验记录见 `_archive/migration.json`。
