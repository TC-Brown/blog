/**
 * The Brown Family Blog - Layout Components
 * This file defines custom Web Components (<blog-nav> and <blog-footer>)
 * to centralize navigation and footer structures across the static site.
 */

class BlogNav extends HTMLElement {
    connectedCallback() {
        const activePage = this.getAttribute('active') || '';
        const depth = parseInt(this.getAttribute('depth') || '0', 10);
        
        // Generate prefix: e.g. depth 2 -> "../../"
        const prefix = depth > 0 ? '../'.repeat(depth) : './';

        // Render Navbar HTML
        this.innerHTML = `
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-brand">
                    <img class="profile-img" src="${prefix}static/img/index-img/seal.jpg" alt="The Brown Family Seal" />
                </div>
                
                <!-- Toggle Menu for Mobile -->
                <button class="mobile-nav-toggle" aria-label="Toggle navigation" id="navToggle">
                    <span class="hamburger"></span>
                </button>

                <ul class="nav-menu" id="navMenu">
                    <li><a href="${prefix}index.html" class="nav-link ${activePage === 'Home' ? 'active' : ''}">Home</a></li>
                    <li><a href="${prefix}templates/about/about.html" class="nav-link ${activePage === 'About' ? 'active' : ''}">About</a></li>
                    <li><a href="${prefix}templates/contact.html" class="nav-link ${activePage === 'Contact' ? 'active' : ''}">Contact</a></li>
                    <li><a href="${prefix}templates/blog/index.html" class="nav-link ${activePage === 'Blog' ? 'active' : ''}">Blog</a></li>
                    <li><a href="${prefix}templates/our-things/index.html" class="nav-link ${activePage === 'Our Things' ? 'active' : ''}">Our Things</a></li>
                    <li><a href="${prefix}templates/about/index.html" class="nav-link ${activePage === 'Mini Games' ? 'active' : ''}">Mini Games</a></li>
                    <li><a href="${prefix}chat/index.html" class="nav-link ${activePage === 'Chat Room' ? 'active' : ''}">Chat Room</a></li>
                </ul>
            </div>
        </nav>
        `;

        // Bind interactive mobile nav behavior locally to prevent execution order issues
        const navToggle = this.querySelector('#navToggle');
        const navMenu = this.querySelector('#navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('open');
                navToggle.classList.toggle('open');
            });

            // Close menu if clicking outside of the navbar
            document.addEventListener('click', (e) => {
                if (navMenu.classList.contains('open') && 
                    !navMenu.contains(e.target) && 
                    e.target !== navToggle && 
                    !navToggle.contains(e.target)) {
                    navMenu.classList.remove('open');
                    navToggle.classList.remove('open');
                }
            });

            // Auto-close menu on link click (mobile)
            const navLinks = this.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (link.getAttribute('href') === '#') {
                        e.preventDefault();
                    }
                    if (navMenu.classList.contains('open')) {
                        navMenu.classList.remove('open');
                        navToggle.classList.remove('open');
                    }
                });
            });
        }
    }
}

class BlogFooter extends HTMLElement {
    connectedCallback() {
        const currentYear = new Date().getFullYear();
        this.innerHTML = `
        <footer>
            <div class="footer-container">
                <div class="footer-info">
                    <h4>More Info</h4>
                    <p>Information about sources and the site</p>
                    <p>&copy; Copyright ${currentYear} The Brown Family | T.C. Brown</p>
                </div>
            </div>
        </footer>
        `;
    }
}

// Register Custom Elements
customElements.define('blog-nav', BlogNav);
customElements.define('blog-footer', BlogFooter);
