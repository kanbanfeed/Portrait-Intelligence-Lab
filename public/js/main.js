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
            // Check if any other link is already active. If not, the current page belongs to the 'Home' family.
            // Since we want to highlight the specific link if possible, we handle the active state outside this block.
        }
    });

    // Optional: Keep active state simple by ensuring the correct link is highlighted.
    // If no specific link matches (e.g., on a Tier or Payment detail page), we don't force 'Home' to be active unless explicitly desired.

    // If the mobile menu is open, and a link is clicked, close the menu (better mobile UX)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });
    });
});