---
name: "frontend-design"
description: "在本仓库（纯 HTML/CSS/JS）里落地统一的前端设计系统与页面美化改造流程，延续现有“科技感/金色强调 + 明暗主题”风格。"
---

# Frontend Design（Claude 同款风格的“设计系统能力”）

本技能用于在当前仓库（静态站点：`index.html` + `problems/*.html`）中建立**可复用的设计系统**，并用它去做页面一致性改造（视觉/布局/交互）。

适用场景：

- 用户说“安装 Claude 同款前端设计能力 / 设计系统 / UI 风格统一”
- 用户希望统一按钮、卡片、标签、间距、字体、主题切换等体验
- 用户希望在不引入框架、不上构建工具的情况下，把现有静态站整体“更高级、更统一”

---

## 目标（必须达成）

1. **统一设计 Token**
   - 颜色（背景/强调色/文本/边框/阴影）全部通过 CSS 变量管理
   - 明暗主题通过 `[data-theme="light"]` 切换
2. **统一可复用组件样式**
   - 导航（返回/主题切换）/ 按钮 / 卡片 / 标签 / 提示条（可选）等，提供可复用 class
3. **统一交互基础能力**
   - 全站主题切换由 `assets/theme.js` 维护
   - 页面自己的脚本不再重复写 theme 逻辑
4. **零构建依赖**
   - 不引入 React/Vue/Tailwind，不要求打包
   - 通过 `assets/*.css` + `assets/*.js` 直接引用即可

---

## 仓库约束与风格原则

- 技术栈：纯 HTML/CSS/JS
- 视觉基调：延续现有“科技感 / 金色强调 / 质感背景”，不要硬切到“现代 SaaS 圆角大白块”
- 代码风格：
  - JS 函数必须添加函数级注释（中文）
  - 不在注释中添加作者信息
  - 尽量避免重复逻辑，优先抽到 `assets/`

---

## 资源与目录（建议标准）

推荐（并优先使用）以下结构：

- `assets/base.css`
  - 基础 reset
  - 主题变量默认值（可被页面自定义 :root 覆盖）
  - 通用组件样式（导航/按钮/卡片/标签）
- `assets/theme.js`
  - 主题初始化与切换（唯一实现）
- `data/problems.json`
  - 首页题目数据单一来源
- `data/problems.js`
  - file:// 打开首页时的兜底数据（由构建脚本从 problems.json 派生）

---

## 设计 Token（落地规范）

### 必须存在的变量（建议）

在 `assets/base.css` 的 `:root` / `[data-theme="light"]` 中至少包含：

- `--bg` / `--surface` / `--card`
- `--accent` / `--accent-bright` / `--accent-dim`
- `--text` / `--text-dim`
- `--border` / `--border-hover`
- `--glass-bg`（可选，做 sticky/浮层质感）

页面如果有“题目专属配色”（比如火焰、海盗、实验室），可以在页面 `:root` 里追加，但不要覆盖上述“基础语义变量”的语义。

---

## 组件规范（以 class 为 API）

### 1) 通用导航（题目页）

页面必须包含：

- 返回首页：`.back-link`
- 主题切换：`#themeToggle.theme-toggle-sub`

样式由 `assets/base.css` 统一提供，页面不要重复定义 `.back-link/.theme-toggle-sub`。

### 2) 首页主题切换（index.html）

首页使用：

- `#themeToggle.theme-toggle`

### 3) 常用组件建议（可逐步补齐）

如果用户要求“像 Claude 一样统一”，建议逐步补齐：

- `.btn` / `.btn-primary` / `.btn-ghost`
- `.card` / `.card-hover`
- `.tag` / `.tag-active`
- `.divider`
- `.kbd`（快捷键提示）
- `.toast`（可选，轻量提示）

> 注意：所有组件尽量只依赖 Token 变量，不要写死颜色值。

---

## 交互规范（JS 能力）

### 主题切换（唯一实现）

- 全站只允许 `assets/theme.js` 读写 `localStorage.theme`
- 页面脚本不再出现 `localStorage.setItem('theme'...)` / `getItem('theme'...)`

### 页面交互建议（保持克制）

优先做：

- hover/active/focus 的微交互
- 滚动 reveal（IntersectionObserver）
- 轻量的步骤推进/卡片高亮

避免做：

- 大型状态机/复杂动画库
- 与内容无关的炫技

---

## 首页数据加载（file:// 兼容）

首页加载顺序建议：

1. `file://`：优先使用 `data/problems.js` 提供的 `window.__PROBLEMS__`
2. `http(s)://`：使用 `fetch('data/problems.json')`

并确保初始化逻辑在 `DOMContentLoaded` 后执行，避免 defer 脚本未加载完成导致兜底失效。

---

## 改造清单（交付自检）

完成“设计系统 + 页面改造”后，必须满足：

- [ ] `index.html` 与所有 `problems/*.html` 都引用了 `assets/base.css`
- [ ] `index.html` 与所有 `problems/*.html` 都引用了 `assets/theme.js`
- [ ] 仓库内不再出现重复的 theme 切换实现（避免各页面自行写 localStorage theme）
- [ ] 首页题目数据只维护 `data/problems.json`（`data/problems.js` 必须由它派生）
- [ ] `.editorconfig` 存在并生效（至少能约束缩进/换行/尾随空格）
- [ ] 页面视觉保持统一：字体体系、按钮、阴影、边框、间距风格一致

---

## 输出要求

交付时优先给出：

1. 新增/修改的 `assets/` 资源文件
2. 修改过的页面文件列表（哪些页面接入了设计系统）
3. 若涉及生成：同步更新构建脚本（例如 `scripts/build.py` 生成 `data/problems.js`）

