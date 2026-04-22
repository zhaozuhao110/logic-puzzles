---
name: "logic-analysis-page"
description: "Generate logic puzzle analysis pages in this repo's existing visual style. Invoke when user wants to add, rewrite, or batch-create pages similar to files in problems/."
---

# Logic Analysis Page

为 `logic-site` 项目生成与现有站点风格一致的逻辑题解析页面。

当出现以下场景时调用本技能：

- 用户要求“新增一道逻辑题页面”
- 用户要求“仿照现有风格生成题解页”
- 用户提供题面，希望生成 `problems/*.html`
- 用户要求补齐题目详情页、首页卡片数据或题目索引

## 目标

输出的页面必须与当前仓库保持一致的审美和结构特征：

- 独立 HTML 文件，不依赖打包工具
- 内联 `style` 与 `script`
- 中文为主，标题可辅以英文副标题
- 深色金属/书卷质感配色，支持亮色主题
- 首页跳转回链与主题切换按钮风格统一
- 内容不是单纯答案堆砌，而是“题面 -> 思路 -> 步骤 -> 核心洞见”的叙事式讲解

## 先做什么

开始生成前，先读取并对齐以下文件风格：

- `index.html`
- `problems/` 下至少 1 个相近题型页面
- 如需接入首页，再检查 `data/problems.json`

如果用户没有指定题型风格，优先参考以下模式：

- 偏“分步推演/动态展示”：参考 `balance-scale.html`
- 偏“静态步骤讲解/图示说明”：参考 `gold-bar.html`
- 偏“故事感/沉浸式叙述”：根据现有页面自由组合，但不要偏离整体视觉语言

## 页面硬性约束

新页面通常放在 `problems/<slug>.html`，并遵守以下要求：

1. 文档基础
- 使用 `<!DOCTYPE html>` 与 `<html lang="zh-CN">`
- `title` 格式优先使用：`题目名 — 经典逻辑推理`
- 引入 Google Fonts，优先使用现有页面已经使用的字体组合

2. 样式风格
- 使用 CSS 变量管理主题色
- 默认深色主题，必要时提供 `[data-theme="light"]`
- 背景尽量带轻微径向渐变或细噪点纹理
- 卡片、题面框、步骤块边框要轻，强调色以金色/黄铜色为主
- 圆角较克制，避免现代 SaaS 风格的过度圆润

3. 页面结构
- 固定包含返回首页按钮 `.back-link`
- 固定包含主题切换按钮 `#themeToggle` / `.theme-toggle-sub`
- 首屏必须有 `hero` 区域，至少包含：
  - 标题
  - 副标题
  - 题面摘要或原题描述
- 主体部分至少包含：
  - 解析标签或章节标题
  - 逐步解法
  - 一段解释“为什么这样做”的洞见总结
- 末尾保留简洁页脚

4. 交互脚本
- 脚本使用原生 JavaScript，不引入框架
- 函数必须添加函数级注释
- 变量名简洁清晰，优先 `var`
- 适度增加交互即可，例如：
  - 步骤卡点击高亮
  - 滚动 reveal 动画
  - SVG/图形状态切换
  - 简单按钮推进推理过程
- 不要为了“炫技”加入复杂状态机

## 内容写作规范

页面文案必须符合当前站点气质：

- 题面简洁，避免口语化废话
- 步骤解释清楚“为什么排除、为什么缩小范围”
- 强调信息量、分类讨论、二进制、博弈、排除法等核心思维
- 适度使用 `strong` 突出关键条件
- 避免只有结论，没有推导过程

推荐叙事结构：

1. 用一句话重新描述题目核心矛盾
2. 给出总体策略
3. 拆成 3-6 个关键步骤
4. 在结尾解释方法背后的通用思维模型

## 生成流程

当用户要求新增页面时，按这个顺序执行：

1. 确认题目名称、题面、分类、难度、是否需要交互演示
2. 先选一个最接近的现有页面作为样式参考
3. 新建 `problems/<slug>.html`
4. 写入完整独立页面
5. 若该题需要出现在首页：
   - 更新 `data/problems.json`
   - 更新 `index.html` 里的预埋 `problems` 数组，保证本地 `file://` 预览可见
6. 如用户未提供 slug，可按英文语义命名；不确定时再询问

## 首页接入规则

如果新增题目需要在首页显示，新增条目至少包含：

```json
{
  "id": 7,
  "title": "示例题目",
  "file": "problems/example-problem.html",
  "description": "一句话描述题面和关键矛盾。",
  "category": "logic",
  "difficulty": 6
}
```

注意：

- `category` 复用现有分类值：`logic`、`game-theory`、`math`、`strategy`、`programming`
- `description` 要适合首页卡片摘要展示
- `difficulty` 维持 1-10 的现有体系
- 若首页有预埋数据与 JSON 双份数据，必须同步

## 建议模板

```html
<body>
  <div class="bg"></div>

  <a href="../index.html" class="back-link">...</a>
  <button class="theme-toggle-sub" id="themeToggle" title="切换明暗模式">...</button>

  <div class="container">
    <section class="hero">
      <div class="hero-icon">...</div>
      <h1>题目标题</h1>
      <p class="subtitle">英文或中文副标题</p>
      <div class="hero-question">题面描述</div>
    </section>

    <section id="solution">
      <span class="label">逻辑解析 / ANALYSIS</span>
      <h2 class="heading">核心思路标题</h2>

      <div class="solution-card">步骤内容</div>

      <div class="insight">
        <h3>方法为什么成立？</h3>
        <p>总结背后的抽象思维。</p>
      </div>
    </section>

    <footer>...</footer>
  </div>

  <script>
  /**
   * 初始化主题切换与页面交互。
   */
  (function () {
    // ...
  })();
  </script>
</body>
```

## 决策原则

生成时优先满足以下顺序：

1. 与仓库现有风格一致
2. 题解逻辑清楚
3. 页面结构完整
4. 交互适度且稳定
5. 再考虑视觉花样

## 不要这样做

- 不要引入 React、Vue、Tailwind 或构建依赖
- 不要写成通用博客文章风格
- 不要省略返回首页和主题切换
- 不要只更新 `data/problems.json` 而漏掉 `index.html` 预埋数组
- 不要让配色、字体、间距与现有页面明显割裂
- 不要输出没有分段和推演过程的“标准答案页”

## 输出要求

完成任务时，优先交付：

- 新增或修改的 HTML 页面
- 若需要首页展示，则同步更新索引数据
- 简短说明参考了哪个现有页面风格，以及是否加入了轻交互
