#!/usr/bin/env python3
"""
逻辑题静态网站生成脚本

功能：
1. 扫描源目录下所有 HTML 文件
2. 从 <title> 标签提取标题
3. 生成语义化英文文件名（拼音+序号）
4. 复制到目标目录 problems/
5. 生成 problems.json 供首页读取

用法：
  python3 build.py [--src SOURCE_DIR] [--dest DEST_DIR]

示例：
  python3 build.py
  python3 build.py --src /path/to/html --dest /path/to/logic-site
"""

import os
import sys
import re
import json
import shutil
import html
from pathlib import Path
from html.parser import HTMLParser

# ── 配置 ──────────────────────────────────────────

DEFAULT_SRC = os.path.expanduser("~/servyou/showcase")
DEFAULT_DEST = os.path.expanduser("~/servyou/logic-site")

# 中文标题 → 英文文件名映射（手动维护，优先匹配）
TITLE_MAP = {
    "海盗分金": "pirate-gold",
    "猜牌问题": "guess-card",
    "燃绳问题": "burning-rope",
    "称球问题": "balance-scale",
    "喝汽水问题": "soda-bottle",
    "五个囚犯": "five-prisoners",
    "爱因斯坦的谜题": "einstein-puzzle",
    "分割金条": "gold-bar",
    "鬼谷考徒": "guigu-apprentices",
    "舀酒难题": "wine-ladle",
    "囚徒困境": "prisoner-dilemma",
    "过河问题": "river-crossing",
    "帽子问题": "hat-puzzle",
    "开关问题": "switch-puzzle",
    "密码问题": "password-puzzle",
}

# 难度星级（1-10，默认5）
DIFFICULTY_MAP = {
    "海盗分金": 7,
    "猜牌问题": 8,
    "燃绳问题": 5,
    "称球问题": 9,
    "喝汽水问题": 3,
    "五个囚犯": 8,
    "爱因斯坦的谜题": 7,
    "分割金条": 4,
    "鬼谷考徒": 10,
    "舀酒难题": 6,
    "囚徒困境": 4,
    "过河问题": 6,
    "帽子问题": 7,
    "开关问题": 8,
    "密码问题": 6,
}

# 分类关键词识别
CATEGORY_KEYWORDS = {
    "博弈": "game-theory",
    "分配": "game-theory",
    "推理": "logic",
    "逻辑": "logic",
    "猜": "logic",
    "称": "logic",
    "计时": "logic",
    "数学": "math",
    "计算": "math",
    "概率": "math",
    "策略": "strategy",
    "过河": "strategy",
    "编程": "programming",
}


class TitleExtractor(HTMLParser):
    """从 HTML 提取 <title> 内容"""

    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title_text = ""

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True

    def handle_data(self, data):
        if self.in_title:
            self.title_text += data

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False


def extract_title(filepath):
    """从 HTML 文件提取 <title> 内容"""
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        return None

    parser = TitleExtractor()
    try:
        parser.feed(content)
    except Exception:
        pass

    title = parser.title_text.strip()
    # 清理标题中的多余文字（如 "— 经典逻辑推理" 后缀）
    title = re.split(r"[—\-\|]", title)[0].strip()
    return title if title else None


def extract_description(filepath, max_len=120):
    """从 HTML 提取第一段有意义的文本作为描述"""
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception:
        return ""

    # 尝试提取 hero-question 或 hero-rule 区域
    m = re.search(
        r'class="hero-question[^"]*"[^>]*>(.*?)</div>', content, re.DOTALL
    )
    if m:
        text = re.sub(r"<[^>]+>", "", m.group(1))
        text = html.unescape(text).strip()
        text = re.sub(r"\s+", " ", text)
        return text[:max_len] + ("..." if len(text) > max_len else "")

    # 降级：提取 <p> 标签
    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", content, re.DOTALL)
    for p in paragraphs:
        text = re.sub(r"<[^>]+>", "", p)
        text = html.unescape(text).strip()
        text = re.sub(r"\s+", " ", text)
        if len(text) > 15:
            return text[:max_len] + ("..." if len(text) > max_len else "")

    return ""


def slugify(title):
    """将中文标题转为英文文件名"""
    if not title:
        return None

    # 优先使用手动映射
    for cn, en in TITLE_MAP.items():
        if cn in title:
            return en

    # 提取中文部分生成拼音式命名（简化：用序号）
    return None


def guess_category(title, description=""):
    """根据标题和描述猜测分类"""
    text = (title or "") + " " + description
    for keyword, category in CATEGORY_KEYWORDS.items():
        if keyword in text:
            return category
    return "logic"


def get_difficulty(title):
    """根据标题匹配难度等级"""
    if not title:
        return 5
    for cn, diff in DIFFICULTY_MAP.items():
        if cn in title:
            return diff
    return 5


def inject_common_features(content):
    """向 HTML 内容注入公共能力（返回首页 + 主题切换 + 公共资源引用）"""
    # 1) 注入公共资源引用：base.css + theme.js
    # 注意：题目页输出在 problems/ 下，所以资源相对路径使用 ../assets/
    common_head = (
        '<link rel="stylesheet" href="../assets/base.css">\n'
        '<script src="../assets/theme.js" defer></script>\n'
    )
    if "</head>" in content and "../assets/base.css" not in content:
        content = content.replace("</head>", f"{common_head}</head>")

    # 2. 注入 HTML
    common_html = """
    <a href="../index.html" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      <span>返回首页</span>
    </a>
    <button class="theme-toggle-sub" id="themeToggle" title="切换明暗模式">
      <svg class="moon-icon" viewBox="0 0 24 24"><path d="M12.1,22c-4.9,0-9-3.8-9.1-8.7c0-3.1,1.5-6.1,4.1-8c0.2-0.1,0.5-0.1,0.7,0.1c0.2,0.2,0.2,0.5,0.1,0.7c-0.5,0.9-0.7,1.8-0.7,2.8c0,3.5,2.8,6.3,6.3,6.3c1,0,1.9-0.2,2.8-0.7c0.2-0.1,0.5-0.1,0.7,0.1c0.2,0.2,0.2,0.5,0.1,0.7C15.1,20.5,13.6,22,12.1,22z"/></svg>
      <svg class="sun-icon" viewBox="0 0 24 24"><path d="M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.3,18,12,18z M12,8c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S14.2,8,12,8z M11,1h2v3h-2V1z M11,20h2v3h-2V20z M3.5,4.9l2.1-2.1l1.4,1.4L4.9,6.3L3.5,4.9z M17,18.4l2.1-2.1l1.4,1.4l-2.1,2.1L17,18.4z M1,11h3v2H1V11z M20,11h3v2h-3V11z M4.9,17.7l2.1,2.1l-1.4,1.4l-2.1-2.1L4.9,17.7z M18.4,5.6l2.1-2.1l1.4,1.4l-2.1,2.1L18.4,5.6z"/></svg>
    </button>
    """
    if "<body>" in content:
        content = content.replace("<body>", f"<body>\n{common_html}")

    return content


def write_problems_js(data_dir: Path, problems: list):
    """生成 data/problems.js（用于 file:// 直接打开首页时的兜底数据）。"""
    js_path = data_dir / "problems.js"
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(
            "/**\n"
            " * 题目数据（由 scripts/build.py 生成）。\n"
            " * 说明：用于 file:// 方式直接打开 index.html 时，避免 fetch 本地 JSON 被浏览器拦截。\n"
            " */\n"
        )
        f.write("window.__PROBLEMS__ = ")
        json.dump(problems, f, ensure_ascii=False, indent=2)
        f.write(";\n")


def process_files(src_dir, dest_dir):
    """主处理流程"""
    src_path = Path(src_dir)
    dest_path = Path(dest_dir)
    problems_dir = dest_path / "problems"
    data_dir = dest_path / "data"

    # 确保目标目录存在
    problems_dir.mkdir(parents=True, exist_ok=True)
    data_dir.mkdir(parents=True, exist_ok=True)

    # 扫描源目录
    html_files = sorted(src_path.glob("*.html"))
    if not html_files:
        print(f"[WARN] 未找到 HTML 文件: {src_dir}")
        return

    print(f"[INFO] 找到 {len(html_files)} 个 HTML 文件\n")

    problems = []
    used_slugs = set()

    for idx, filepath in enumerate(html_files, 1):
        filename = filepath.name
        print(f"  [{idx}/{len(html_files)}] {filename}")

        # 读取源文件内容
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"    [ERROR] 无法读取文件: {e}")
            continue

        # 提取标题
        title = extract_title(filepath)
        if not title:
            title = f"逻辑题 {idx}"
            print(f"    ⚠ 未提取到 <title>，使用默认标题")

        # 生成英文文件名
        slug = slugify(title)
        if slug and slug not in used_slugs:
            target_name = f"{slug}.html"
        else:
            # 降级：用序号
            target_name = f"problem-{idx:03d}.html"
            # 如果 slug 冲突，也用序号
            if slug and slug in used_slugs:
                target_name = f"{slug}-{idx:03d}.html"

        used_slugs.add(slug or f"problem-{idx:03d}")

        # 注入公共功能（返回按钮和明暗模式）
        content = inject_common_features(content)

        # 提取描述
        description = extract_description(filepath)

        # 猜测分类
        category = guess_category(title, description)

        # 获取难度等级
        difficulty = get_difficulty(title)

        # 写入目标文件
        target_path = problems_dir / target_name
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"    ✓ {filename} → problems/{target_name}")
        print(f"      标题: {title}")
        print(f"      分类: {category}")
        print(f"      难度: {difficulty}/10")
        if description:
            print(f"      描述: {description[:60]}...")

        problems.append(
            {
                "id": idx,
                "title": title,
                "file": f"problems/{target_name}",
                "description": description,
                "category": category,
                "difficulty": difficulty,
            }
        )

    # 写入 problems.json
    json_path = data_dir / "problems.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(problems, f, ensure_ascii=False, indent=2)

    # 同步生成 problems.js（从同一份 problems 列表派生）
    write_problems_js(data_dir, problems)

    print(f"\n[OK] 已生成 {json_path}")
    print(f"[OK] 共处理 {len(problems)} 道题目")
    print(f"\n使用方法：在浏览器中打开 {dest_path}/index.html")


def main():
    import argparse

    parser = argparse.ArgumentParser(description="逻辑题静态网站生成脚本")
    parser.add_argument(
        "--src", default=DEFAULT_SRC, help=f"HTML 源目录 (默认: {DEFAULT_SRC})"
    )
    parser.add_argument(
        "--dest",
        default=DEFAULT_DEST,
        help=f"输出目录 (默认: {DEFAULT_DEST})",
    )
    args = parser.parse_args()

    print("=" * 50)
    print("  逻辑题静态网站生成器")
    print("=" * 50)
    print(f"  源目录: {args.src}")
    print(f"  输出目录: {args.dest}")
    print()

    if not os.path.isdir(args.src):
        print(f"[ERROR] 源目录不存在: {args.src}")
        sys.exit(1)

    process_files(args.src, args.dest)


if __name__ == "__main__":
    main()
