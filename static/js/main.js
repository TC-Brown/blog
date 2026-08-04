document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('open');
            navToggle.classList.toggle('open');
        });

        // Close menu if clicking outside of the navbar
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
                navMenu.classList.remove('open');
                navToggle.classList.remove('open');
            }
        });
    }

    // --- Handle Nav Links Active States ---
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
            }
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Auto-close menu on link click (mobile)
            if (navMenu && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                navToggle.classList.remove('open');
            }
        });
    });


});

// ---- Other Functions for the pages ----
// page navigation functions

function nav(str) { 
    // Sanitize string to prevent directory traversal, open redirects, or javascript scheme execution
    const cleanStr = String(str).replace(/[^a-zA-Z0-9\-_/]/g, '');
    window.location.href = `templates/${cleanStr}.html`;
    return window.location.href;
}

function error() { 
    window.location.href = "./error/error.html"
    return window.location.href
}
