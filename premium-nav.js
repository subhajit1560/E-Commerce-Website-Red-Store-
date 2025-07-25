// Premium Navigation JavaScript
class PremiumNavigation {
    constructor() {
        this.init();
    }

    init() {
        // Initialize theme first before other functionality
        this.initializeTheme();
        this.setupThemeToggle();
        this.setupMobileMenu();
        this.setupActiveNavLink();
        this.setupScrollEffect();
        this.createBackgroundElements(); // Add background elements
        this.enhanceFooter(); // Add footer enhancements
        
        // Add premium-nav-body class to body
        document.body.classList.add('premium-nav-body');
    }

    initializeTheme() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        // Apply theme immediately to prevent flash
        document.documentElement.setAttribute('data-theme', defaultTheme);
        
        // Store the theme if it wasn't already saved
        if (!savedTheme) {
            localStorage.setItem('theme', defaultTheme);
        }
        
        // Update theme toggle icon
        this.updateThemeIcon(defaultTheme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('themePreference')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                this.updateThemeIcon(newTheme);
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            localStorage.setItem('themePreference', 'user-set'); // Mark as user preference
            this.updateThemeIcon(newTheme);
            
            // Add smooth transition effect
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        });
    }

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle?.querySelector('i');
        
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    setupMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileNav = document.getElementById('mobileNav');
        
        if (!hamburger) return;

        // Create mobile nav if it doesn't exist
        if (!mobileNav) {
            this.createMobileNav();
        }

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            const mobile = document.getElementById('mobileNav');
            if (mobile) {
                mobile.classList.toggle('active');
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !document.getElementById('mobileNav')?.contains(e.target)) {
                hamburger.classList.remove('active');
                const mobile = document.getElementById('mobileNav');
                if (mobile) {
                    mobile.classList.remove('active');
                }
            }
        });
    }

    createMobileNav() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        mobileNav.id = 'mobileNav';

        const mobileNavLinks = document.createElement('ul');
        mobileNavLinks.className = 'mobile-nav-links';

        // Clone navigation links
        const links = navLinks.querySelectorAll('.nav-link');
        links.forEach(link => {
            const li = document.createElement('li');
            const clonedLink = link.cloneNode(true);
            li.appendChild(clonedLink);
            mobileNavLinks.appendChild(li);
        });

        mobileNav.appendChild(mobileNavLinks);
        document.body.appendChild(mobileNav);
    }

    setupActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    setupScrollEffect() {
        const header = document.querySelector('.premium-header');
        if (!header) return;

        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }

            lastScrollY = currentScrollY;
        });
    }

    // Create live background elements
    createBackgroundElements() {
        // Only add if not already present
        if (document.querySelector('.bg-particles')) return;

        // Create background particles
        const bgParticles = document.createElement('div');
        bgParticles.className = 'bg-particles';

        // Create gradient overlay
        const bgGradientOverlay = document.createElement('div');
        bgGradientOverlay.className = 'bg-gradient-overlay';

        // Create animated dots
        const bgAnimatedDots = document.createElement('div');
        bgAnimatedDots.className = 'bg-animated-dots';

        // Insert background elements at the beginning of body
        document.body.insertBefore(bgParticles, document.body.firstChild);
        document.body.insertBefore(bgGradientOverlay, document.body.firstChild);
        document.body.insertBefore(bgAnimatedDots, document.body.firstChild);

        // Add smooth fade-in animation
        setTimeout(() => {
            bgParticles.style.opacity = '1';
            bgGradientOverlay.style.opacity = '1';
            bgAnimatedDots.style.opacity = '1';
        }, 100);
    }

    // Enhanced Footer functionality
    enhanceFooter() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        // Add newsletter section if not exists
        this.addNewsletterSection();
        
        // Add interactive animations
        this.addFooterAnimations();
        
        // Add social media functionality
        this.addSocialMediaLinks();
        
        // Add current year to copyright
        this.updateCopyright();
    }

    addNewsletterSection() {
        const footer = document.querySelector('.footer .container');
        const row = footer?.querySelector('.row');
        if (!footer || !row) return;

        // Check if newsletter already exists
        if (footer.querySelector('.footer-newsletter')) return;

        const newsletterHtml = `
            <div class="footer-newsletter">
                <h3><i class="fas fa-envelope"></i> Stay Updated</h3>
                <p>Subscribe to our newsletter for exclusive deals and latest updates!</p>
                <form class="newsletter-form" onsubmit="return handleNewsletterSubmit(event)">
                    <input type="email" placeholder="Enter your email address" required>
                    <button type="submit">
                        <i class="fas fa-paper-plane"></i> Subscribe
                    </button>
                </form>
            </div>
        `;

        row.insertAdjacentHTML('afterend', newsletterHtml);
    }

    addFooterAnimations() {
        const footerCols = document.querySelectorAll('.footer-col-1, .footer-col-2, .footer-col-3, .footer-col-4');
        
        footerCols.forEach((col, index) => {
            // Add staggered animation delay
            col.style.animationDelay = `${index * 0.1}s`;
            col.classList.add('animate-on-scroll');
        });

        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, { threshold: 0.1 });

        footerCols.forEach(col => observer.observe(col));
    }

    addSocialMediaLinks() {
        const socialLinks = {
            'Facebook': 'https://facebook.com',
            'Twitter': 'https://twitter.com',
            'Instagram': 'https://instagram.com',
            'YouTube': 'https://youtube.com'
        };

        const socialList = document.querySelector('.footer-col-4 ul');
        if (!socialList) return;

        const socialItems = socialList.querySelectorAll('li');
        socialItems.forEach(item => {
            const linkText = item.textContent.trim();
            if (socialLinks[linkText]) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    window.open(socialLinks[linkText], '_blank');
                });
            }
        });
    }

    updateCopyright() {
        const copyright = document.querySelector('.Copyright');
        if (copyright) {
            const currentYear = new Date().getFullYear();
            copyright.innerHTML = `
                <i class="fas fa-heart" style="color: var(--primary-color); animation: heartbeat 1.5s infinite;"></i>
                Copyright ${currentYear} My Shopping. All rights reserved.
                <br>
                <small style="opacity: 0.7; margin-top: 5px; display: inline-block;">
                    Made with passion for amazing shopping experience
                </small>
            `;
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PremiumNavigation();
});

// Global Newsletter Form Handler
window.handleNewsletterSubmit = function(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    const button = event.target.querySelector('button');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    button.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
        button.style.background = '#10b981';
        
        // Reset form
        event.target.querySelector('input[type="email"]').value = '';
        
        // Show thank you message
        const form = event.target;
        const thankYouMsg = document.createElement('div');
        thankYouMsg.style.cssText = `
            margin-top: 10px;
            color: #10b981;
            font-weight: 600;
            animation: fadeInUp 0.5s ease-out;
        `;
        thankYouMsg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for subscribing!';
        form.appendChild(thankYouMsg);
        
        // Reset button after 3 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.background = '';
            if (thankYouMsg.parentNode) {
                thankYouMsg.remove();
            }
        }, 3000);
    }, 1500);
    
    return false;
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumNavigation;
}
