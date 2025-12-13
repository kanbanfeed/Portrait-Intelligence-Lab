document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (!menuBtn || !navLinks) return;

  // Toggle menu
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("active");
    menuBtn.classList.toggle("open");
  });

  // Close when clicking outside
  document.addEventListener("click", () => {
    navLinks.classList.remove("active");
    menuBtn.classList.remove("open");
  });

  // Prevent menu clicks from bubbling
  navLinks.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  // ===============================
  // DESKTOP ACTIVE TAB HIGHLIGHT
  // ===============================
  const navItems = navLinks.querySelectorAll("a");
  const currentPath = window.location.pathname;

  navItems.forEach(link => {
    // Match exact path
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }

    // Optional: update active on click (desktop UX)
    link.addEventListener("click", () => {
      navItems.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });


});
