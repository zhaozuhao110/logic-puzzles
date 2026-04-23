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
- 内容不是单纯答案堆砌，而是“**视觉演示 -> 交互推演 -> 关键步骤 -> 核心洞见**”的沉浸式流程
- **视觉优先**：尽量减少长篇大论，优先使用动画、SVG 图形、动态卡片来展示逻辑流向
- **交互解题**：提供交互式模拟（如：可点击的开关、可拖动的进度、可切换的状态），让用户在操作中理解逻辑原理，而非死记硬背公式

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

2. 样式风格与代入感
- 使用 CSS 变量管理主题色
- 默认深色主题，必要时提供 `[data-theme="light"]`
- **背景代入感**：背景不仅是渐变，应根据题目主题增加特有的纹理或动态元素：
  - 偏“工业/称重”：增加刻度线、金属拉丝感或坐标纸纹理
  - 偏“古代/书卷”：增加竹简线条、宣纸纤维感或水墨晕染感
  - 偏“物理/流体”：增加动态气泡、波动效果或光影折射感
  - 偏“触觉/黑暗”：增加盲文噪点、织物纹理或磨砂感
- 背景纹理实现建议：
  - 使用 `::before` 和 `::after` 伪元素配合 `background-image` (radial-gradient/linear-gradient/svg-data-uri)
  - 保持低透明度 (0.03 - 0.1) 和混合模式 (overlay/multiply/color-dodge)，确保不干扰内容阅读
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

## 内容与交互设计规范

页面内容必须符合“直观、动感、精炼”的原则：

- **视觉化逻辑**：能用动画展示的绝不只用文字；能用 SVG 画出来的绝不只用公式
- **交互式推演**：设计“模拟器”或“推演步进器”，让用户点击或滑动来观察状态变化（如：天平的倾斜、水量的增减、金条的切割组合）
- **精炼文案**：文字应作为视觉的辅助，重点在于解释“当前发生了什么”和“这一步的意义”
- **去公式化**：将复杂的数学公式转化为几何图形、颜色块或动态进度条，降低理解门槛
- **反馈及时**：每一次交互都应有视觉反馈（高亮、震动、颜色切换），确保用户感知到逻辑的推进

推荐结构：

1. **英雄场模拟**：首屏即提供最核心的视觉模拟或动画展示
2. **交互步进器**：将推导过程拆解为可手动点击切换的“场景”
3. **实时统计/状态**：在侧边或底部显示当前的逻辑状态（如：剩余次数、当前重量、逻辑冲突点）
4. **最后洞见**：简短文字总结视觉背后蕴含的深刻思维模型

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
2. **具备题目强相关的“代入感”背景设计**
3. **优先使用图形与交互演示（Show, Don't Tell）**
4. 尽量精简纯文字段落，剔除枯燥公式
5. 页面结构完整且逻辑推导闭环
6. 交互稳定，不影响核心内容的加载与阅读

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
