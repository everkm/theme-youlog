function initLeftDrawer() {
  // ===== 左侧导航开合逻辑（保持原行为） =====
  const menuToggle = document.getElementById("menuToggle");
  const bookNav = document.getElementById("bookNav");
  const navOverlay = document.getElementById("navOverlay");

  if (menuToggle && bookNav && navOverlay) {
    const toggleNav = (open: boolean) => {
      bookNav.classList.toggle("open", open);
      navOverlay.classList.toggle("open", open);
    };

    menuToggle.addEventListener("click", () => {
      toggleNav(!bookNav.classList.contains("open"));
    });

    navOverlay.addEventListener("click", () => toggleNav(false));
  }

  // 如果存在 book-nav，则显示 menu-toggle
  if (document.getElementById("bookNav")) {
    document.body.style.setProperty("--show-menu-toggle", "block");
  }
}

export { initLeftDrawer };
