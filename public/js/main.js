// public/js/main.js

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const navLinks = document.getElementById("nav-links");
    const navContainer = document.querySelector(".nav-container"); // Added for context checking

    if (!menuBtn || !navLinks) return;

    // Toggle menu
    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navLinks.classList.toggle("active");
        menuBtn.classList.toggle("active"); // Use 'active' for consistency
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
    
    // DESKTOP ACTIVE TAB HIGHLIGHT

    const navItems = navLinks.querySelectorAll("a");
    const currentPath = window.location.pathname;

    navItems.forEach(link => {
        // Match exact path or base path (e.g., /tier/9.99 should highlight /tier/*)
        const linkPath = link.getAttribute("href");
        
        if (currentPath === linkPath) {
            link.classList.add("active");
        } else if (currentPath.startsWith('/tier/') && linkPath === '/') {
             // Home link is the catch-all for tiers page
        } else if (currentPath.startsWith('/payment/') && linkPath === '/') {
             // Home link is the catch-all for payment page
        }
        
        // Optional: update active on click (desktop UX)
        link.addEventListener("click", () => {
            navItems.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        });
    });
});