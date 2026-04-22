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

  setTheme(getPreferredTheme());
  bindToggle();
})();

