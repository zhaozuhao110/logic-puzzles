/**
 * 初始化并维护全站主题（明/暗）状态。
 * - 读取 localStorage 中的 theme 值（light/dark）
 * - 若未设置，则跟随系统 prefers-color-scheme
 * - 绑定 #themeToggle 点击事件，实现主题切换
 */
(function () {
  /**
   * 读取用户偏好的主题。
   * @returns {"light"|"dark"}
   */
  function getPreferredTheme() {
    var saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  /**
   * 设置当前主题，并持久化到 localStorage。
   * @param {"light"|"dark"} theme
   */
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  /**
   * 绑定主题切换按钮。
   */
  function bindToggle() {
    var themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      setTheme(current === "light" ? "dark" : "light");
    });
  }

  /**
   * 为题目页设置“背景氛围”变量，减少页面背景雷同。
   * - 仅影响使用了 assets/problem-gold.css 的题目页（通过 CSS 变量 --page-glow-1/2）
   * - 采用路径 hash，保证同一页面每次打开都稳定一致
   */
  function applyProblemBackgroundVariant() {
    var path = String(window.location.pathname || window.location.href || "");
    if (path.indexOf("/problems/") === -1 && path.indexOf("problems/") === -1) return;

    // 仅当题目页背景容器存在时才设置（避免影响首页）
    if (!document.querySelector(".back-link") || !document.querySelector(".bg")) return;

    // 简单 hash：累计字符码（稳定、够用）
    var hash = 0;
    for (var i = 0; i < path.length; i++) {
      hash = (hash * 31 + path.charCodeAt(i)) >>> 0;
    }
    var h1 = 30 + (hash % 320);            // 30..349
    var h2 = 30 + ((hash >>> 8) % 320);    // 30..349

    // 用更“书卷/金属”但有差异的两束辉光
    document.documentElement.style.setProperty("--page-glow-1", "hsla(" + h1 + ", 70%, 55%, 0.10)");
    document.documentElement.style.setProperty("--page-glow-2", "hsla(" + h2 + ", 60%, 55%, 0.07)");

    /**
     * 根据题目标题选择更贴题的背景纹理。
     * @param {string} title 题目标题
     * @param {number} seed 稳定随机种子
     * @returns {{pattern:string,size?:string,opacity?:string,pos?:string}} 背景参数
     */
    function pickPatternByTitle(title, seed) {
      // 默认：旧的金色交叉纹（在 CSS fallback 里）
      var base = { pattern: "", size: "", opacity: "", pos: "" };
      if (!title) return base;

      var t = title;
      var pick = function(arr) { return arr[seed % arr.length]; };

      // 1) 帽子类：点阵（像人群/信息节点）
      if (t.indexOf("帽") !== -1) {
        return {
          pattern: "radial-gradient(circle, rgba(212,165,55,0.24) 1px, transparent 1.6px)",
          size: "22px 22px",
          opacity: "0.12",
          pos: "center"
        };
      }

      // 1.1) 袜子/布料：织物纹（经纬感）
      if (t.indexOf("袜") !== -1) {
        return {
          pattern: [
            "repeating-linear-gradient(90deg, rgba(212,165,55,0.10) 0 1px, transparent 1px 14px)",
            "repeating-linear-gradient(0deg, rgba(212,165,55,0.06) 0 1px, transparent 1px 10px)"
          ].join(","),
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 2) 匣子/肖像/判词类：斜纹（像刻字/契约）
      if (t.indexOf("匣") !== -1 || t.indexOf("肖像") !== -1) {
        return {
          pattern: "repeating-linear-gradient(135deg, rgba(212,165,55,0.18) 0 1px, transparent 1px 18px)",
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 2.1) 国王/法庭/学费：柱廊纹（像法庭立柱）
      if (t.indexOf("国王") !== -1 || t.indexOf("学费") !== -1 || t.indexOf("法庭") !== -1) {
        return {
          pattern: "repeating-linear-gradient(90deg, rgba(212,165,55,0.14) 0 2px, transparent 2px 22px)",
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 3) 天平/称量类：刻度网（像度量标尺）
      if (t.indexOf("称") !== -1 || t.indexOf("天平") !== -1 || t.indexOf("称量") !== -1) {
        return {
          pattern: [
            "repeating-linear-gradient(90deg, rgba(212,165,55,0.16) 0 1px, transparent 1px 24px)",
            "repeating-linear-gradient(0deg, rgba(212,165,55,0.10) 0 1px, transparent 1px 24px)",
            "radial-gradient(circle at 20% 20%, rgba(212,165,55,0.10), transparent 55%)"
          ].join(","),
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 4) 时间/钟表类：同心环（像重合轨迹）
      if (t.indexOf("表") !== -1 || t.indexOf("针") !== -1 || t.indexOf("时钟") !== -1) {
        return {
          pattern: "repeating-radial-gradient(circle at 50% 50%, rgba(212,165,55,0.18) 0 1px, transparent 1px 20px)",
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 4.1) 生日/日期类：彩纸点点（像日历标记/庆祝）
      if (t.indexOf("生日") !== -1 || t.indexOf("推断生日") !== -1) {
        return {
          pattern: [
            "radial-gradient(circle at 20% 30%, rgba(240,201,77,0.18) 1px, transparent 2px)",
            "radial-gradient(circle at 70% 20%, rgba(74,122,223,0.12) 1px, transparent 2px)",
            "radial-gradient(circle at 55% 70%, rgba(212,165,55,0.14) 1px, transparent 2px)"
          ].join(","),
          size: "34px 34px",
          opacity: "0.12",
          pos: "center"
        };
      }

      // 5) 交通/飞行类：速度线（像轨迹）
      if (t.indexOf("火车") !== -1 || t.indexOf("飞") !== -1 || t.indexOf("距离") !== -1) {
        return {
          pattern: "repeating-linear-gradient(20deg, rgba(74,122,223,0.10) 0 1px, transparent 1px 16px)",
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 5.3) 门/开关/灯泡：电路线（连接感）
      if (t.indexOf("门") !== -1 || t.indexOf("灯") !== -1 || t.indexOf("开关") !== -1) {
        return {
          pattern: [
            "repeating-linear-gradient(90deg, rgba(74,122,223,0.10) 0 1px, transparent 1px 26px)",
            "repeating-linear-gradient(0deg, rgba(212,165,55,0.08) 0 1px, transparent 1px 20px)"
          ].join(","),
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 5.1) 小岛/桥：波纹（像水面）
      if (t.indexOf("小岛") !== -1 || t.indexOf("桥") !== -1) {
        return {
          pattern: "repeating-radial-gradient(circle at 30% 70%, rgba(74,122,223,0.12) 0 1px, transparent 1px 18px)",
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 5.2) 牛/分配：草场微纹（更柔和的横向纹）
      if (t.indexOf("牛") !== -1) {
        return {
          pattern: "repeating-linear-gradient(0deg, rgba(74,154,94,0.10) 0 1px, transparent 1px 18px)",
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 6.1) 水果/篮子：散点（像果实）
      if (t.indexOf("水果") !== -1) {
        return {
          pattern: [
            "radial-gradient(circle at 25% 35%, rgba(74,154,94,0.16) 1px, transparent 2px)",
            "radial-gradient(circle at 60% 20%, rgba(240,201,77,0.14) 1px, transparent 2px)",
            "radial-gradient(circle at 70% 70%, rgba(212,165,55,0.12) 1px, transparent 2px)"
          ].join(","),
          size: "30px 30px",
          opacity: "0.12",
          pos: "center"
        };
      }

      // 6.2) 圆环：同心双环（旋转感）
      if (t.indexOf("圆环") !== -1) {
        return {
          pattern: "repeating-radial-gradient(circle at 50% 50%, rgba(212,165,55,0.14) 0 1px, transparent 1px 14px)",
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 6) 镜像/影像类：更强的环纹 + 反射斜纹
      if (t.indexOf("镜") !== -1 || t.indexOf("影") !== -1) {
        return {
          pattern: [
            "repeating-radial-gradient(circle at 50% 50%, rgba(212,165,55,0.16) 0 1px, transparent 1px 18px)",
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px)"
          ].join(","),
          size: "auto",
          opacity: "0.10",
          pos: "center"
        };
      }

      // 7) 默认：从几套纹理里稳定抽一套，避免“全站同款”
      var pool = [
        { pattern: "radial-gradient(circle, rgba(212,165,55,0.22) 1px, transparent 1.6px)", size: "26px 26px", opacity: "0.10", pos: "center" },
        { pattern: "repeating-linear-gradient(135deg, rgba(212,165,55,0.16) 0 1px, transparent 1px 20px)", size: "auto", opacity: "0.10", pos: "center" },
        { pattern: "repeating-linear-gradient(45deg, rgba(74,122,223,0.08) 0 1px, transparent 1px 18px)", size: "auto", opacity: "0.10", pos: "center" }
      ];
      return pick(pool);
    }

    var titleEl = document.querySelector(".hero h1");
    var title = titleEl ? String(titleEl.textContent || "").trim() : "";
    var p = pickPatternByTitle(title, hash);
    if (p && p.pattern) document.documentElement.style.setProperty("--page-pattern", p.pattern);
    if (p && p.size) document.documentElement.style.setProperty("--page-pattern-size", p.size);
    if (p && p.opacity) document.documentElement.style.setProperty("--page-pattern-opacity", p.opacity);
    if (p && p.pos) document.documentElement.style.setProperty("--page-pattern-pos", p.pos);
  }

  /**
   * 将 SVG 字符串编码为可用于 CSS url() 的 data URI。
   * @param {string} svg SVG 文本
   * @returns {string} 形如 url("data:image/svg+xml,...")
   */
  function svgToCssUrl(svg) {
    var encoded = encodeURIComponent(svg)
      .replace(/%0A/g, "")
      .replace(/%20/g, " ")
      .replace(/%3D/g, "=")
      .replace(/%3A/g, ":")
      .replace(/%2F/g, "/");
    return 'url("data:image/svg+xml,' + encoded + '")';
  }

  /**
   * 为题目页设置“主题贴图”（右上角水印式图形），让背景更贴题。
   * - 不依赖逐页改 HTML：根据题目标题关键词自动选择
   * - 优先用 DOM 注入，确保即使页面没引入 problem-gold.css 也能生效
   */
  function applyProblemHeroMark() {
    var path = String(window.location.pathname || window.location.href || "");
    if (path.indexOf("/problems/") === -1 && path.indexOf("problems/") === -1) return;

    var titleEl = document.querySelector(".hero h1");
    var hero = document.querySelector(".hero");
    if (!titleEl || !hero) return;

    var title = String(titleEl.textContent || "").trim();

    // 基础配色：尽量用 currentColor/金色描边，适配明暗主题
    var stroke = "rgba(240,201,77,0.55)";
    var fill = "rgba(212,165,55,0.10)";

    /**
     * 创建并注入 hero 水印贴图（SVG）。
     * @param {string} svg SVG 文本
     * @param {{size?:number, opacity?:number, rotateDeg?:number}} opt 贴图参数
     */
    function injectHeroMark(svg, opt) {
      // 防止重复注入
      if (hero.querySelector(".hero-mark")) return;
      if (!svg) return;

      var size = opt && opt.size ? opt.size : 520;
      var opacity = opt && typeof opt.opacity === "number" ? opt.opacity : 0.10;
      var rotateDeg = opt && typeof opt.rotateDeg === "number" ? opt.rotateDeg : -6;

      // hero 设为定位容器
      if (!hero.style.position) hero.style.position = "relative";

      // 让 hero 内既有内容压到贴图之上
      var children = Array.prototype.slice.call(hero.children || []);
      children.forEach(function (el) {
        if (el && el.style) {
          if (!el.style.position) el.style.position = "relative";
          if (!el.style.zIndex) el.style.zIndex = "1";
        }
      });

      var mark = document.createElement("div");
      mark.className = "hero-mark";
      mark.style.position = "absolute";
      mark.style.right = "clamp(-120px, -10vw, -40px)";
      mark.style.top = "clamp(40px, 10vh, 120px)";
      mark.style.width = "clamp(240px, 48vw, " + size + "px)";
      mark.style.height = "clamp(240px, 48vw, " + size + "px)";
      mark.style.opacity = String(opacity);
      mark.style.pointerEvents = "none";
      mark.style.zIndex = "0";
      mark.style.transform = "rotate(" + rotateDeg + "deg)";
      mark.style.filter = "blur(0.2px) saturate(1.1)";

      // 使用 innerHTML 插入 svg（水印用途、受控字符串）
      mark.innerHTML = svg;
      hero.appendChild(mark);
    }

    // 1) 推断生日：日历 + 蛋糕
    var birthdaySvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="52" y="48" width="136" height="120" rx="14"/>' +
          '<path d="M52 82h136"/>' +
          '<path d="M82 36v24M158 36v24"/>' +
          '<path d="M84 110h24M132 110h24M84 140h24"/>' +
          '<path d="M104 188h72"/>' +
          '<path d="M112 188v-10c0-8 6-14 14-14h24c8 0 14 6 14 14v10"/>' +
          '<path d="M122 152c-3-5 1-10 4-14 3 4 7 9 4 14"/>' +
          '<path d="M148 152c-3-5 1-10 4-14 3 4 7 9 4 14"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<circle cx="96" cy="112" r="10"/>' +
          '<circle cx="148" cy="112" r="10"/>' +
        '</g>' +
      '</svg>';

    // 2) 被困小岛：小岛 + 水波 + 桥影
    var islandSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M42 150c22 10 44 10 66 0s44-10 90 0"/>' +
          '<path d="M46 172c20 8 40 8 60 0s40-8 84 0"/>' +
          '<path d="M64 132c22-28 44-34 68-18 8 6 14 14 18 24"/>' +
          '<path d="M112 94c8-20 22-26 40-18"/>' +
          '<path d="M146 84c-2 10-2 18 0 26"/>' +
          '<path d="M86 120c18 8 40 8 66 0"/>' +
          '<path d="M40 120c34-18 64-18 90 0"/>' +
          '<path d="M130 120c34-18 64-18 90 0"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<path d="M70 138c10-18 24-26 40-24 18 2 30 12 38 30-28 12-54 12-78-6z"/>' +
        '</g>' +
      '</svg>';

    // 3) 遗嘱分牛：牛头轮廓 + 分割线
    var cowSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M74 112c-12-10-18-22-18-36 0-18 12-30 30-30 10 0 18 4 26 12"/>' +
          '<path d="M166 112c12-10 18-22 18-36 0-18-12-30-30-30-10 0-18 4-26 12"/>' +
          '<path d="M86 90c10-10 22-16 34-16s24 6 34 16"/>' +
          '<path d="M78 112c8 44 24 66 48 66s40-22 48-66"/>' +
          '<path d="M100 140c8 6 16 8 24 8s16-2 24-8"/>' +
          '<path d="M98 118c0 6-4 10-10 10s-10-4-10-10 4-10 10-10 10 4 10 10z"/>' +
          '<path d="M162 118c0 6-4 10-10 10s-10-4-10-10 4-10 10-10 10 4 10 10z"/>' +
          '<path d="M60 194h120"/>' +
          '<path d="M60 194l18-18M96 194l18-18M132 194l18-18M168 194l12-12"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<path d="M100 160c6 8 14 12 24 12s18-4 24-12c-10 4-18 6-24 6s-14-2-24-6z"/>' +
        '</g>' +
      '</svg>';

    // 0) 通用：卷轴/纸（逻辑题默认）
    var scrollSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M72 62h96"/>' +
          '<path d="M72 62c-14 0-24 10-24 24v92c0 14 10 24 24 24"/>' +
          '<path d="M168 62c14 0 24 10 24 24v92c0 14-10 24-24 24"/>' +
          '<path d="M72 202h96"/>' +
          '<path d="M78 92h84M78 116h84M78 140h64M78 164h72"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="66" y="74" width="108" height="140" rx="16"/>' +
        '</g>' +
      '</svg>';

    // 14) 三扇门（蒙特门）
    var doorsSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="44" y="70" width="46" height="128" rx="10"/>' +
          '<rect x="98" y="58" width="46" height="140" rx="10"/>' +
          '<rect x="152" y="70" width="46" height="128" rx="10"/>' +
          '<path d="M80 134h0"/><path d="M134 134h0"/><path d="M188 134h0"/>' +
          '<circle cx="80" cy="134" r="3"/><circle cx="134" cy="134" r="3"/><circle cx="188" cy="134" r="3"/>' +
          '<path d="M98 58l23-18 23 18"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="100" y="60" width="42" height="136" rx="10"/>' +
        '</g>' +
      '</svg>';

    // 15) 酒店账单：账单 + 硬币
    var billSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="60" y="54" width="120" height="156" rx="14"/>' +
          '<path d="M78 92h84M78 120h84M78 148h56"/>' +
          '<circle cx="168" cy="176" r="22"/>' +
          '<path d="M160 176h16"/>' +
          '<path d="M168 168v16"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="70" y="64" width="100" height="136" rx="12"/>' +
          '<circle cx="168" cy="176" r="16"/>' +
        '</g>' +
      '</svg>';

    // 16) 村庄/星期：双村牌 + 日历
    var villageSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M54 132l26-20 26 20v60H54z"/>' +
          '<path d="M134 132l26-20 26 20v60H134z"/>' +
          '<path d="M66 158h28M146 158h28"/>' +
          '<rect x="86" y="52" width="68" height="46" rx="10"/>' +
          '<path d="M86 68h68"/>' +
          '<path d="M102 52v10M138 52v10"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="92" y="56" width="56" height="38" rx="8"/>' +
        '</g>' +
      '</svg>';

    // 17) 水果篮：苹果/橘子简笔
    var fruitSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M70 108c0-18 16-34 50-34s50 16 50 34c0 34-22 70-50 70s-50-36-50-70z"/>' +
          '<path d="M120 74c-2-14 4-26 18-32"/>' +
          '<path d="M152 118c0 22-14 40-32 40"/>' +
          '<circle cx="86" cy="120" r="10"/>' +
          '<circle cx="154" cy="120" r="10"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<path d="M80 110c8-14 22-22 40-22s32 8 40 22c-2 28-18 54-40 54s-38-26-40-54z"/>' +
        '</g>' +
      '</svg>';

    // 18) 圆环：双环
    var ringsSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="102" cy="128" r="46"/>' +
          '<circle cx="146" cy="112" r="60"/>' +
          '<path d="M62 128h80"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<circle cx="102" cy="128" r="40"/>' +
        '</g>' +
      '</svg>';

    // 19) 学费/法庭：法槌
    var gavelSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M96 84l38 38"/>' +
          '<path d="M126 54l50 50-20 20-50-50z"/>' +
          '<path d="M64 116l20-20 50 50-20 20z"/>' +
          '<path d="M52 188h88"/>' +
          '<path d="M70 188l36-36"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<path d="M126 56l46 46-16 16-46-46z"/>' +
        '</g>' +
      '</svg>';

    // 20) 纸币：三张钞票
    var moneySvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="54" y="84" width="132" height="84" rx="12"/>' +
          '<rect x="66" y="72" width="132" height="84" rx="12"/>' +
          '<circle cx="120" cy="114" r="18"/>' +
          '<path d="M86 114h18M136 114h18"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="72" y="78" width="120" height="72" rx="10"/>' +
        '</g>' +
      '</svg>';

    // 21) 约瑟夫环：圆圈与“3”节拍
    var josephusSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="120" cy="130" r="72"/>' +
          '<path d="M120 58v-18"/>' +
          '<path d="M120 50c10 0 18 8 18 18s-8 18-18 18-18-8-18-18"/>' +
          '<path d="M86 130h68"/>' +
          '<path d="M90 206h60"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<circle cx="120" cy="130" r="60"/>' +
        '</g>' +
      '</svg>';

    // 22) 细菌：分裂节点
    var bacteriaSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="96" cy="128" r="26"/>' +
          '<circle cx="148" cy="100" r="22"/>' +
          '<circle cx="154" cy="160" r="22"/>' +
          '<path d="M118 116l16-10"/>' +
          '<path d="M120 140l18 12"/>' +
          '<path d="M70 128h-18M96 102V84M96 154v18"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<circle cx="96" cy="128" r="20"/>' +
        '</g>' +
      '</svg>';

    // 23) 镜屋芭蕾：简化舞者 + 对称线
    var dancerSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M120 56v150"/>' +
          '<circle cx="120" cy="66" r="10"/>' +
          '<path d="M120 86c-22 18-36 30-44 38"/>' +
          '<path d="M120 86c22 18 36 30 44 38"/>' +
          '<path d="M120 108c-10 22-18 40-24 54"/>' +
          '<path d="M120 108c10 22 18 40 24 54"/>' +
          '<path d="M96 166l-26 26"/>' +
          '<path d="M144 166l26 26"/>' +
          '<path d="M40 204h60M140 204h60"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<circle cx="120" cy="66" r="7"/>' +
        '</g>' +
      '</svg>';

    // 4) 海盗分金：金币 + 简化骷髅
    var pirateSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="120" cy="132" r="54"/>' +
          '<path d="M86 132c10 12 22 18 34 18s24-6 34-18"/>' +
          '<path d="M96 116c0 6-4 10-10 10s-10-4-10-10 4-10 10-10 10 4 10 10z"/>' +
          '<path d="M164 116c0 6-4 10-10 10s-10-4-10-10 4-10 10-10 10 4 10 10z"/>' +
          '<path d="M92 84l-16-18M148 84l16-18"/>' +
          '<path d="M104 176l-14 22M136 176l14 22"/>' +
          '<path d="M82 196h76"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<circle cx="120" cy="132" r="46"/>' +
        '</g>' +
      '</svg>';

    // 5) 天平/称量：天平轮廓 + 刻度
    var scaleSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M120 46v18"/>' +
          '<path d="M66 80h108"/>' +
          '<path d="M120 64l-54 16M120 64l54 16"/>' +
          '<path d="M76 96l-18 32h36l-18-32z"/>' +
          '<path d="M164 96l-18 32h36l-18-32z"/>' +
          '<path d="M120 80v90"/>' +
          '<path d="M92 170h56"/>' +
          '<path d="M96 190h48"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="108" y="170" width="24" height="18" rx="4"/>' +
        '</g>' +
      '</svg>';

    // 6) 燃绳：两段绳子 + 火花
    var ropeSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M54 160c18-40 42-64 72-72 34-10 56 6 76 40"/>' +
          '<path d="M60 92c18 10 30 24 36 42"/>' +
          '<path d="M180 160c-10-18-22-30-36-36"/>' +
          '<path d="M120 64l10 14-14-4 4-10z"/>' +
          '<path d="M132 50l6 10-10-2 4-8z"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<circle cx="120" cy="64" r="14"/>' +
        '</g>' +
      '</svg>';

    // 7) 舀酒/量酒：勺子 + 液面
    var ladleSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M74 78c20 0 36 16 36 36s-16 36-36 36-36-16-36-36 16-36 36-36z"/>' +
          '<path d="M102 138l64 64"/>' +
          '<path d="M176 220c10-10 6-24-6-36"/>' +
          '<path d="M52 114c16 8 32 8 48 0"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<path d="M50 114c16 10 34 10 50 0-2 18-14 32-25 32s-23-14-25-32z"/>' +
        '</g>' +
      '</svg>';

    // 8) 汽水瓶：瓶子 + 循环箭头
    var bottleSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M108 34h24"/>' +
          '<path d="M104 58c0-14 8-24 16-24s16 10 16 24"/>' +
          '<path d="M96 86c0-14 10-26 24-26s24 12 24 26v86c0 20-16 36-36 36s-36-16-36-36V86z"/>' +
          '<path d="M72 148c6-18 20-28 40-28"/>' +
          '<path d="M168 148c-6 18-20 28-40 28"/>' +
          '<path d="M74 148l-10-6 2 12z"/>' +
          '<path d="M166 148l10-6-2 12z"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<path d="M94 152c6-12 16-18 26-18s20 6 26 18c-8 10-16 16-26 16s-18-6-26-16z"/>' +
        '</g>' +
      '</svg>';

    // 9) 爱因斯坦谜题：五栋房子
    var housesSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M38 128l22-18 22 18v70H38z"/>' +
          '<path d="M82 128l22-18 22 18v70H82z"/>' +
          '<path d="M126 128l22-18 22 18v70H126z"/>' +
          '<path d="M170 128l22-18 22 18v70H170z"/>' +
          '<path d="M16 128l22-18 22 18v70H16z"/>' +
          '<path d="M28 156h20M72 156h20M116 156h20M160 156h20M204 156h20"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="18" y="140" width="40" height="52" rx="8"/>' +
          '<rect x="62" y="140" width="40" height="52" rx="8"/>' +
          '<rect x="106" y="140" width="40" height="52" rx="8"/>' +
          '<rect x="150" y="140" width="40" height="52" rx="8"/>' +
          '<rect x="194" y="140" width="40" height="52" rx="8"/>' +
        '</g>' +
      '</svg>';

    // 10) 五个囚犯/博弈：牢门栅栏
    var barsSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="54" y="58" width="132" height="140" rx="16"/>' +
          '<path d="M82 58v140M106 58v140M130 58v140M154 58v140"/>' +
          '<path d="M54 98h132"/>' +
          '<path d="M54 158h132"/>' +
          '<path d="M120 98v60"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="66" y="72" width="108" height="112" rx="12"/>' +
        '</g>' +
      '</svg>';

    // 11) 金条：三段 1/2/4 的金块
    var goldSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M60 150l18-60h102l-18 60z"/>' +
          '<path d="M72 150v22h96v-22"/>' +
          '<path d="M90 90v60M120 90v60"/>' +
          '<path d="M92 122h26M122 122h46"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<path d="M78 92h42l-8 54H70z"/>' +
          '<path d="M120 92h28l-8 54h-20z"/>' +
          '<path d="M148 92h32l-8 54h-24z"/>' +
        '</g>' +
      '</svg>';

    // 12) 猜牌：扑克牌轮廓
    var cardsSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="62" y="70" width="110" height="140" rx="14"/>' +
          '<rect x="86" y="50" width="110" height="140" rx="14"/>' +
          '<path d="M116 92h50"/>' +
          '<path d="M116 120h50"/>' +
          '<path d="M116 148h34"/>' +
          '<path d="M104 92c6 8 6 16 0 24-6-8-6-16 0-24z"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<rect x="92" y="56" width="98" height="128" rx="12"/>' +
        '</g>' +
      '</svg>';

    // 13) 三个灯泡：灯泡轮廓
    var bulbSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">' +
        '<g fill="none" stroke="' + stroke + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M80 120a40 40 0 1 1 80 0c0 16-8 24-14 30-4 4-6 8-6 14H100c0-6-2-10-6-14-6-6-14-14-14-30z"/>' +
          '<path d="M100 174h40"/>' +
          '<path d="M104 194h32"/>' +
          '<path d="M96 110h48"/>' +
          '<path d="M120 80v18"/>' +
        '</g>' +
        '<g fill="' + fill + '">' +
          '<circle cx="120" cy="120" r="34"/>' +
        '</g>' +
      '</svg>';

    if (title.indexOf("推断生日") !== -1 || title.indexOf("生日") !== -1) {
      injectHeroMark(birthdaySvg, { size: 480, opacity: 0.10, rotateDeg: -4 });
    } else if (title.indexOf("小岛") !== -1 || title.indexOf("桥") !== -1) {
      injectHeroMark(islandSvg, { size: 520, opacity: 0.10, rotateDeg: -8 });
    } else if (title.indexOf("牛") !== -1) {
      injectHeroMark(cowSvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("袜") !== -1) {
      injectHeroMark(scrollSvg, { size: 520, opacity: 0.08, rotateDeg: -6 });
    } else if (title.indexOf("海盗") !== -1 || title.indexOf("分金") !== -1) {
      injectHeroMark(pirateSvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("燃绳") !== -1 || title.indexOf("绳") !== -1) {
      injectHeroMark(ropeSvg, { size: 540, opacity: 0.10, rotateDeg: -10 });
    } else if (title.indexOf("称") !== -1 || title.indexOf("天平") !== -1 || title.indexOf("药丸") !== -1) {
      injectHeroMark(scaleSvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("舀酒") !== -1 || title.indexOf("酒") !== -1) {
      injectHeroMark(ladleSvg, { size: 520, opacity: 0.10, rotateDeg: -8 });
    } else if (title.indexOf("汽水") !== -1 || title.indexOf("瓶") !== -1) {
      injectHeroMark(bottleSvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("爱因斯坦") !== -1) {
      injectHeroMark(housesSvg, { size: 540, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("囚犯") !== -1) {
      injectHeroMark(barsSvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("金条") !== -1 || title.indexOf("分割金条") !== -1) {
      injectHeroMark(goldSvg, { size: 540, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("猜牌") !== -1) {
      injectHeroMark(cardsSvg, { size: 520, opacity: 0.10, rotateDeg: -8 });
    } else if (title.indexOf("蒙特") !== -1 || title.indexOf("门") !== -1) {
      injectHeroMark(doorsSvg, { size: 540, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("住店") !== -1 || title.indexOf("旅馆") !== -1) {
      injectHeroMark(billSvg, { size: 540, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("村庄") !== -1 || title.indexOf("星期") !== -1) {
      injectHeroMark(villageSvg, { size: 540, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("学费") !== -1) {
      injectHeroMark(gavelSvg, { size: 520, opacity: 0.10, rotateDeg: -8 });
    } else if (title.indexOf("水果") !== -1) {
      injectHeroMark(fruitSvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("圆环") !== -1) {
      injectHeroMark(ringsSvg, { size: 540, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("纸币") !== -1) {
      injectHeroMark(moneySvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("教徒") !== -1) {
      injectHeroMark(josephusSvg, { size: 540, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("细菌") !== -1) {
      injectHeroMark(bacteriaSvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("芭蕾") !== -1) {
      injectHeroMark(dancerSvg, { size: 520, opacity: 0.10, rotateDeg: -6 });
    } else if (title.indexOf("灯泡") !== -1 || title.indexOf("开关") !== -1) {
      injectHeroMark(bulbSvg, { size: 520, opacity: 0.10, rotateDeg: -8 });
    } else {
      // 其他题目：用“卷轴”作为通用逻辑题背景，保持风格一致又不至于空白
      injectHeroMark(scrollSvg, { size: 520, opacity: 0.07, rotateDeg: -6 });
    }
  }

  /**
   * 为题目页注入一段“题目背景/氛围引子”，减少文案雷同。
   * - 仅在 problems/ 下、且页面含 .hero-question 时生效
   * - 通过标题关键词选择更贴题的引子；若无匹配则用多模板随机（基于路径 hash 稳定）
   */
  function applyProblemStoryHook() {
    var path = String(window.location.pathname || window.location.href || "");
    if (path.indexOf("/problems/") === -1 && path.indexOf("problems/") === -1) return;

    var hero = document.querySelector(".hero-question");
    var titleEl = document.querySelector(".hero h1");
    if (!hero || !titleEl) return;
    if (hero.querySelector(".story-hook")) return;

    var title = String(titleEl.textContent || "").trim();

    // 与背景变体保持同一个 hash，保证稳定
    var hash = 0;
    for (var i = 0; i < path.length; i++) hash = (hash * 31 + path.charCodeAt(i)) >>> 0;

    /**
     * 从候选数组里挑一个（稳定）。
     * @param {string[]} arr 候选文案
     * @returns {string} 选中的文案
     */
    function pick(arr) {
      return arr[hash % arr.length];
    }

    var hook = "";
    if (title.indexOf("帽子") !== -1) {
      hook = pick([
        "灯光一灭，所有人的推理同时开始：你看到的不是颜色，而是别人“为什么没说话”。",
        "这类帽子题的关键不在“看见什么”，而在“看见后仍沉默”的公共知识。",
        "把人群当作一台同步运行的推理机器：沉默本身就是信息。"
      ]);
    } else if (title.indexOf("匣") !== -1 || title.indexOf("肖像") !== -1) {
      hook = pick([
        "匣子上的刻字像证词：你要做的不是猜，而是让“真假结构”自己暴露矛盾。",
        "每一句话都可能是陷阱；关键是把它们当作条件系统，而不是当作描述。",
        "当规则规定了真假比例时，最强的武器是分类讨论。"
      ]);
    } else if (title.indexOf("国王") !== -1 || title.indexOf("预言") !== -1) {
      hook = pick([
        "当规则把“真假”与“处置”绑死，一句自指就能让命令体系自我崩解。",
        "这不是占卜，而是对规则的反制：让执行者无法自洽。",
        "最锋利的预言，往往不是关于未来，而是关于制度。"
      ]);
    } else if (title.indexOf("生日") !== -1) {
      hook = pick([
        "把信息切成两半并不意味着更安全：公开对话会让候选集一层层坍缩。",
        "每一句“我不知道/我知道了”都是一次公告，公告会同步改变所有人的可选世界。",
        "这道题的精髓：用他人的知识状态，反推自己手里那半张信息。"
      ]);
    } else if (title.indexOf("牛") !== -1 || title.indexOf("遗嘱") !== -1) {
      hook = pick([
        "分数写进遗嘱并不等于能分：有时需要一个“外部变量”让系统变为整数。",
        "看似算术题，本质是约束满足：既满足宗教禁令，又满足份额比例。",
        "聪明的分配往往不是硬算出来的，而是先把结构改成可分的。"
      ]);
    } else if (title.indexOf("火车") !== -1 || title.indexOf("飞行") !== -1) {
      hook = pick([
        "别盯着来回折返的细节：抓住“相遇前的总时间”，一切就只剩乘法。",
        "动态迷惑人，但答案常常静态：把运动过程压缩成一个时间窗口。",
        "当路径很乱时，先找不变量：时间、速率、相遇条件。"
      ]);
    } else if (title.indexOf("猴子") !== -1 || title.indexOf("香蕉") !== -1) {
      hook = pick([
        "在这条路上，每一步都要付出代价：搬运策略的本质是减少无效往返。",
        "不是搬得多就赢，而是让消耗最少：这是“带损耗运输”的最优策略。",
        "别急着冲刺，把香蕉当作燃料，先在路上建立补给点。"
      ]);
    } else if (title.indexOf("细菌") !== -1) {
      hook = pick([
        "指数增长的世界里，最后一段时间最值钱：关键在“差一个翻倍”意味着什么。",
        "装满瓶子的那一刻，往往不是终点，而是倒数的开始。",
        "把 1 小时想成 60 次翻倍的链条，问题会瞬间变简单。"
      ]);
    } else if (title.indexOf("镜") !== -1 || title.indexOf("影") !== -1) {
      hook = pick([
        "镜子不会复制你，它复制的是视线：当空间被镜面包裹，方向感会失效。",
        "无限反射不是魔法，而是几何：你看到的是一张张平行世界的切片。",
        "想象你站在对称群里：每一面镜子都在做一次空间变换。"
      ]);
    } else if (title.indexOf("小岛") !== -1 || title.indexOf("桥") !== -1) {
      hook = pick([
        "困境里最可靠的不是力气，而是时机：桥会变，但条件也会变。",
        "看似绝望的十天，其实是在等待一个“物理约束”消失。",
        "很多逃脱题的答案都藏在题目没说的那句：环境不是恒定的。"
      ]);
    } else {
      hook = pick([
        "把题面当作一份合同：你只需要找到其中“能被利用的约束”。",
        "当信息不完整时，别补脑洞，先做分类讨论：每一步都要能被验证。",
        "逻辑题最怕直觉，最爱不变量：把条件当作边界，答案自然会长出来。"
      ]);
    }

    var hookEl = document.createElement("div");
    hookEl.className = "story-hook";
    hookEl.textContent = hook;
    hero.insertBefore(hookEl, hero.firstChild);
  }

  setTheme(getPreferredTheme());
  bindToggle();
  applyProblemBackgroundVariant();
  applyProblemStoryHook();
  applyProblemHeroMark();
})();
