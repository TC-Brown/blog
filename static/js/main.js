document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('open');
        });

        // Close menu if clicking outside of the navbar
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && e.target !== navToggle) {
                navMenu.classList.remove('open');
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
            }
        });
    });

    // --- Premium Light/Dark Theme Switcher ---
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme choice, default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            
            // Persist theme choice in localStorage
            if (document.body.classList.contains('light-theme')) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});

// ---- Other Functions for the pages ----

function nav(str) { 
    window.location.href = `templates/about-tag/${str}.html`
    return window.location.href
}

function error() { 
    window.location.href = "./error/error.html"
    return window.location.href
}

function goToWall() { 
    window.location.href = "templates/picture-wall/picture-wall.html"
    return window.location.href
}