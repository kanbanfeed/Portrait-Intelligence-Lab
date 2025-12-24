// public/js/main.js

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const navLinks = document.getElementById("nav-links");
    const navContainer = document.querySelector(".nav-container");

    if (!menuBtn || !navLinks) return;

    // --- FIX: Streamlined Mobile Menu Toggle Logic ---
    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navLinks.classList.toggle("active");
        menuBtn.classList.toggle("active"); 
    });

    // Close when clicking outside
    document.addEventListener("click", (event) => {
        const isClickInsideNav = navContainer && navContainer.contains(event.target);
        
        if (navLinks.classList.contains('active') && !isClickInsideNav) {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    });

    // Prevent menu clicks from bubbling
    navLinks.addEventListener("click", (e) => {
        e.stopPropagation();
    });
    
    // --- DESKTOP ACTIVE TAB HIGHLIGHT (Simplified) ---

    const navItems = navLinks.querySelectorAll("a");
    const currentPath = window.location.pathname;
    let homeLinkActive = false;

    navItems.forEach(link => {
        const linkPath = link.getAttribute("href");
        
        // 1. Match exact path
        if (currentPath === linkPath) {
            link.classList.add("active");
            homeLinkActive = true;
        }

        // 2. Handle specific deep links (e.g., /tier/* and /payment/* are usually considered under Home/Root context)
        if ((currentPath.startsWith('/tier/') || currentPath.startsWith('/payment/') || currentPath.startsWith('/circle/')) && linkPath === '/') {
             }
    });

 
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });
    });
});

// public/js/main.js

document.addEventListener("headerLoaded", () => {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");
  const navContainer = document.querySelector(".nav-container");

  if (!menuBtn || !navLinks) {
    console.warn("Navbar elements not found");
    return;
  }

  /* -----------------
     MOBILE MENU TOGGLE
  ------------------ */
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("active");
    menuBtn.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("active") && !navContainer.contains(e.target)) {
      navLinks.classList.remove("active");
      menuBtn.classList.remove("active");
    }
  });

  navLinks.addEventListener("click", (e) => e.stopPropagation());

  /* -----------------
     ACTIVE MENU STATE
  ------------------ */
  const currentPath = window.location.pathname;

  navLinks.querySelectorAll("a").forEach(link => {
    const href = link.getAttribute("href");

    if (
      href === currentPath ||
      (href === "/" && (currentPath === "/" || currentPath.startsWith("/tier") || currentPath.startsWith("/payment")))
    ) {
      link.classList.add("active");
    }
  });
});
