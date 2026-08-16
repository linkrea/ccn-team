# 云计算及算力网络 - 团队展示网站

> 算力网络，连通梦想

团队风采展示网站，包含首页、关于我们、新闻动态、研发项目、专家介绍五个页面，并配备后台管理系统（基于 GitHub API，支持内容增删改查）。纯静态网站，无需构建工具，上传到 GitHub 仓库后即可通过 GitHub Pages 直接访问。

## 项目结构

```
cloud-computing-network/
├── index.html          # 首页
├── about.html          # 关于我们
├── news.html           # 新闻动态
├── projects.html       # 研发项目
├── experts.html        # 专家介绍
├── admin.html          # 后台管理页面
├── css/
│   ├── style.css       # 全局样式表
│   └── admin.css       # 后台管理样式
├── js/
│   ├── data.js         # GitHub API 数据管理层
│   ├── render.js       # 前台页面动态渲染（异步加载 content.json）
│   ├── main.js         # 前台交互脚本
│   └── admin.js        # 后台管理逻辑
├── data/
│   └── content.json    # 网站内容数据（新闻/项目/专家）
├── assets/             # 静态资源目录
└── README.md           # 项目说明
```

## 技术特点

- **纯静态**：HTML + CSS + JavaScript，无需后端，无需构建
- **响应式**：自适应桌面、平板、手机等各种屏幕
- **零依赖**：不依赖任何外部 CDN 或框架，所有资源本地加载
- **内联图标**：使用 SVG 内联图标，无需加载图标字体库
- **动画效果**：滚动渐入动画、数字统计动画、卡片悬浮效果
- **GitHub 云端管理**：后台通过 GitHub Contents API 直接读写仓库中的 `data/content.json`，每次修改自动创建 Git commit，GitHub Pages 自动部署更新
- **数据备份**：支持 JSON 格式导出，方便数据备份
- **GitHub Pages 兼容**：所有路径使用相对路径，支持子路径部署

## 后台管理系统

网站内置后台管理页面，通过 GitHub API 直接管理仓库中的内容数据。

### 访问方式

在浏览器中打开 `admin.html`，或点击网站页脚的"后台管理"链接。

### 登录配置

登录时需要填写以下信息：

| 字段 | 说明 |
|------|------|
| **GitHub Token** | Personal Access Token，需勾选 `repo` 权限 |
| **仓库所有者** | GitHub 用户名或组织名 |
| **仓库名称** | 仓库名（如 `cloud-computing-network`） |
| **分支名称** | 默认 `main`，可改为其他分支 |

**创建 Token 的步骤：**

1. 登录 GitHub → 点击右上角头像 → `Settings`
2. 左侧菜单最底部 → `Developer settings`
3. `Personal access tokens` → `Tokens (classic)`
4. 点击 `Generate new token (classic)`
5. 填写 Note（如"网站管理"），勾选 **repo** 权限
6. 点击 `Generate token`，复制生成的 Token

> **安全提示**：Token 仅存储在浏览器的 `sessionStorage` 中，关闭浏览器后自动清除。不会上传到任何第三方服务器。

### 功能说明

| 模块 | 功能 |
|------|------|
| 控制台 | 显示各模块数据统计 |
| 新闻动态 | 添加、编辑、删除新闻（支持分类、日期、标题、摘要） |
| 研发项目 | 添加、编辑、删除项目（支持分类、状态、标签、简介） |
| 专家介绍 | 添加、编辑、删除专家（支持姓名、职称、简介、研究方向） |
| 数据管理 | 查看 GitHub 连接信息、导出 JSON 备份 |

### 数据同步机制

- 所有内容数据存储在仓库的 `data/content.json` 文件中
- 前台页面直接通过 `fetch` 加载该静态 JSON 文件
- 后台每次增删改操作自动通过 GitHub API 提交一次 commit
- GitHub Pages 检测到仓库更新后自动重新部署（通常 1-2 分钟）
- 所有设备访问的是同一份数据，实现真正的云端同步

## 部署到 GitHub Pages

### 方法一：通过 GitHub 网页操作

1. **创建仓库**：登录 GitHub，点击 "New repository" 创建新仓库（如 `cloud-computing-network`）

2. **上传文件**：将本目录下的所有文件和文件夹上传到仓库根目录
   - 可以使用 `git clone` 后复制文件，或直接在 GitHub 网页上拖拽上传

3. **启用 Pages**：进入仓库 `Settings` → 左侧菜单 `Pages` → `Source` 选择 `Deploy from a branch` → 选择 `main` 分支和 `/ (root)` 文件夹 → 点击 `Save`

4. **访问网站**：等待 1-2 分钟后，在 Pages 设置页面顶部会显示访问地址，格式为：
   ```
   https://<你的用户名>.github.io/cloud-computing-network/
   ```

### 方法二：通过 Git 命令行

```bash
# 1. 克隆仓库（替换为你的仓库地址）
git clone https://github.com/<你的用户名>/cloud-computing-network.git

# 2. 将网站文件复制到仓库根目录
cp -r cloud-computing-network/* cloud-computing-network/.github 2>/dev/null; true

# 3. 进入仓库目录
cd cloud-computing-network

# 4. 添加文件
git add .

# 5. 提交
git commit -m "初始化团队展示网站"

# 6. 推送
git push origin main

# 7. 在 GitHub 仓库 Settings → Pages 中启用 Pages 服务
```

### 部署后使用后台管理

1. 部署完成后，访问 `https://<你的用户名>.github.io/cloud-computing-network/admin.html`
2. 输入 GitHub Token、仓库所有者、仓库名称、分支名称
3. 连接成功后即可在浏览器中管理新闻、项目、专家内容
4. 每次保存自动同步到 GitHub，1-2 分钟后前台页面更新

### 注意事项

- 如果仓库名为 `<用户名>.github.io`，则网站直接通过 `https://<用户名>.github.io/` 访问
- 如果仓库名为其他名称，则网站通过 `https://<用户名>.github.io/<仓库名>/` 访问
- 本网站所有链接使用相对路径（`./xxx.html`），在两种情况下均可正常工作
- 首次部署后需等待 1-2 分钟 GitHub 完成构建

## 本地预览

无需服务器，直接用浏览器打开 `index.html` 即可预览前台页面。

如需通过本地服务器预览：

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

然后访问 `http://localhost:8080`

> **注意**：后台管理页面（admin.html）需要仓库已推送到 GitHub 后才能使用，因为它通过 GitHub API 读写数据。

## 自定义内容

### 修改文本内容

直接编辑对应的 HTML 文件，搜索关键词即可替换文本。

### 修改配色方案

编辑 `css/style.css` 文件顶部的 CSS 变量：

```css
:root {
  --primary: #0A4D8C;       /* 主色调 */
  --accent: #00B4D8;        /* 强调色 */
  --gradient: linear-gradient(135deg, #0A4D8C 0%, #00B4D8 100%);
  /* ... 其他变量 */
}
```

### 直接编辑数据文件

也可以直接编辑 `data/content.json` 来修改新闻、项目、专家内容，提交到 GitHub 后前台自动更新。

## 浏览器兼容

- Chrome / Edge 88+
- Firefox 84+
- Safari 14+
- 移动端主流浏览器

## License

MIT
