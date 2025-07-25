// Advanced Account Page JavaScript
class PremiumAccountManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentTab = 'signin';
        this.isLoading = false;
        this.validators = {};
        this.toastQueue = [];
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.setupValidation();
        this.startAnimations();
        this.setupAccessibility();
    }
    
    // Theme Management
    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.setupTheme();
        
        // Add smooth transition effect
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
        
        this.showToast('success', 'Theme Updated', `Switched to ${this.currentTheme} mode`);
    }
    
    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Tab switching
        const signinTab = document.getElementById('signinTab');
        const signupTab = document.getElementById('signupTab');
        
        if (signinTab) {
            signinTab.addEventListener('click', () => this.switchTab('signin'));
        }
        if (signupTab) {
            signupTab.addEventListener('click', () => this.switchTab('signup'));
        }
        
        // Form submissions
        const signinForm = document.getElementById('signinForm');
        const signupForm = document.getElementById('signupForm');
        
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => this.handleSignIn(e));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignUp(e));
        }
        
        // Password toggles
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePassword(e));
        });
        
        // Social auth buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialAuth(e));
        });
        
        // Input field enhancements
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', (e) => this.handleInputFocus(e));
            input.addEventListener('blur', (e) => this.handleInputBlur(e));
            input.addEventListener('input', (e) => this.handleInputChange(e));
        });
        
        // Mobile menu
        const hamburger = document.getElementById('hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    // Tab Switching
    switchTab(tab) {
        if (this.isLoading || tab === this.currentTab) return;
        
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(tab + 'Tab').classList.add('active');
        
        // Update tab slider
        const slider = document.querySelector('.tab-slider');
        if (slider) {
            slider.className = `tab-slider ${tab === 'signup' ? 'signup' : ''}`;
        }
        
        // Switch forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(tab + 'Form').classList.add('active');
        
        // Update progress indicator
        this.updateProgressIndicator(tab === 'signin' ? 1 : 2);
        
        // Clear forms
        this.clearForm(tab === 'signin' ? 'signupForm' : 'signinForm');
        
        // Analytics
        this.trackEvent('tab_switch', { tab });
    }
    
    // Progress Indicator
    updateProgressIndicator(step) {
        document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
            if (index + 1 <= step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
    }
    
    // Form Validation
    setupValidation() {
        this.validators = {
            email: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) return { valid: false, message: 'Email is required' };
                if (!emailRegex.test(value)) return { valid: false, message: 'Invalid email format' };
                return { valid: true };
            },
            
            password: (value) => {
                if (!value) return { valid: false, message: 'Password is required' };
                if (value.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
                if (!/(?=.*[a-z])/.test(value)) return { valid: false, message: 'Password must contain lowercase letter' };
                if (!/(?=.*[A-Z])/.test(value)) return { valid: false, message: 'Password must contain uppercase letter' };
                if (!/(?=.*\d)/.test(value)) return { valid: false, message: 'Password must contain a number' };
                return { valid: true };
            },
            
            name: (value) => {
                if (!value) return { valid: false, message: 'Name is required' };
                if (value.length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
                if (!/^[a-zA-Z\s]+$/.test(value)) return { valid: false, message: 'Name can only contain letters and spaces' };
                return { valid: true };
            },
            
            phone: (value) => {
                if (!value) return { valid: false, message: 'Phone number is required' };
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    return { valid: false, message: 'Invalid phone number format' };
                }
                return { valid: true };
            }
        };
    }
    
    validateField(input) {
        const value = input.value.trim();
        const fieldType = this.getFieldType(input);
        const validator = this.validators[fieldType];
        
        if (!validator) return { valid: true };
        
        const result = validator(value);
        
        // Special case for confirm password
        if (input.id.includes('confirm-password')) {
            const passwordInput = document.getElementById(input.id.replace('confirm-', ''));
            if (passwordInput && value !== passwordInput.value) {
                result.valid = false;
                result.message = 'Passwords do not match';
            }
        }
        
        this.showFieldValidation(input, result);
        return result;
    }
    
    getFieldType(input) {
        if (input.type === 'email') return 'email';
        if (input.type === 'password') return 'password';
        if (input.type === 'tel') return 'phone';
        if (input.id.includes('name')) return 'name';
        return 'text';
    }
    
    showFieldValidation(input, result) {
        const validationEl = input.closest('.form-group').querySelector('.field-validation');
        if (!validationEl) return;
        
        validationEl.textContent = result.message || '';
        validationEl.className = `field-validation ${result.valid ? 'success' : 'error'}`;
        
        // Update input styling
        const container = input.closest('.input-container');
        if (container) {
            container.classList.toggle('error', !result.valid);
            container.classList.toggle('success', result.valid && input.value);
        }
    }
    
    // Password Strength
    updatePasswordStrength(input) {
        const password = input.value;
        const strengthBar = input.closest('.form-group').querySelector('.strength-bar');
        const strengthText = input.closest('.form-group').querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let strengthLabel = 'Very Weak';
        
        if (password.length >= 8) strength++;
        if (/(?=.*[a-z])/.test(password)) strength++;
        if (/(?=.*[A-Z])/.test(password)) strength++;
        if (/(?=.*\d)/.test(password)) strength++;
        if (/(?=.*[@$!%*?&])/.test(password)) strength++;
        
        switch (strength) {
            case 0:
            case 1:
                strengthLabel = 'Very Weak';
                strengthBar.className = 'strength-bar weak';
                break;
            case 2:
                strengthLabel = 'Weak';
                strengthBar.className = 'strength-bar fair';
                break;
            case 3:
                strengthLabel = 'Fair';
                strengthBar.className = 'strength-bar good';
                break;
            case 4:
                strengthLabel = 'Good';
                strengthBar.className = 'strength-bar strong';
                break;
            case 5:
                strengthLabel = 'Very Strong';
                strengthBar.className = 'strength-bar strong';
                break;
        }
        
        strengthText.textContent = `Password strength: ${strengthLabel}`;
    }
    
    // Input Handlers
    handleInputFocus(e) {
        const container = e.target.closest('.input-container');
        if (container) {
            container.classList.add('focused');
        }
    }
    
    handleInputBlur(e) {
        const container = e.target.closest('.input-container');
        if (container && !e.target.value) {
            container.classList.remove('focused');
        }
        
        // Validate on blur
        setTimeout(() => this.validateField(e.target), 100);
    }
    
    handleInputChange(e) {
        const input = e.target;
        
        // Real-time validation for certain fields
        if (input.type === 'email' || input.type === 'password') {
            clearTimeout(this.validationTimeout);
            this.validationTimeout = setTimeout(() => {
                this.validateField(input);
            }, 500);
        }
        
        // Password strength
        if (input.type === 'password' && input.id.includes('signup-password') && !input.id.includes('confirm')) {
            this.updatePasswordStrength(input);
        }
        
        // Auto-format phone number
        if (input.type === 'tel') {
            input.value = this.formatPhoneNumber(input.value);
        }
    }
    
    formatPhoneNumber(value) {
        const number = value.replace(/\D/g, '');
        if (number.length >= 10) {
            return number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return value;
    }
    
    // Password Toggle
    togglePassword(e) {
        const button = e.target.closest('.password-toggle');
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
        
        // Add animation
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    // Form Submission
    async handleSignIn(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const form = e.target;
        const email = form.querySelector('#signin-email').value;
        const password = form.querySelector('#signin-password').value;
        const remember = form.querySelector('#remember-me').checked;
        
        // Validate all fields
        let isValid = true;
        form.querySelectorAll('input[required]').forEach(input => {
            const result = this.validateField(input);
            if (!result.valid) isValid = false;
        });
        
        if (!isValid) {
            this.showToast('error', 'Validation Error', 'Please fix the errors and try again');
            return;
        }
        
        // Show loading
        this.setLoading(true, form.querySelector('.submit-btn'));
        
        try {
            // Simulate API call
            await this.delay(2000);
            
            // Mock authentication
            const success = await this.authenticateUser(email, password, remember);
            
            if (success) {
                this.showToast('success', 'Welcome Back!', 'You have been signed in successfully');
                this.updateProgressIndicator(3);
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showToast('error', 'Sign In Failed', 'Invalid email or password');
            }
        } catch (error) {
            this.showToast('error', 'Error', 'Something went wrong. Please try again.');
            console.error('Sign in error:', error);
        } finally {
            this.setLoading(false, form.querySelector('.submit-btn'));
        }
    }
    
    async handleSignUp(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Get form values
        const firstName = form.querySelector('#signup-firstname').value;
        const lastName = form.querySelector('#signup-lastname').value;
        const email = form.querySelector('#signup-email').value;
        const phone = form.querySelector('#signup-phone').value;
        const password = form.querySelector('#signup-password').value;
        const confirmPassword = form.querySelector('#signup-confirm-password').value;
        const termsAccepted = form.querySelector('#terms-agreement').checked;
        const newsletter = form.querySelector('#newsletter-signup').checked;
        
        // Validate all fields
        let isValid = true;
        form.querySelectorAll('input[required]').forEach(input => {
            const result = this.validateField(input);
            if (!result.valid) isValid = false;
        });
        
        // Check password match
        if (password !== confirmPassword) {
            this.showFieldValidation(form.querySelector('#signup-confirm-password'), {
                valid: false,
                message: 'Passwords do not match'
            });
            isValid = false;
        }
        
        // Check terms acceptance
        if (!termsAccepted) {
            this.showToast('error', 'Terms Required', 'Please accept the terms and conditions');
            isValid = false;
        }
        
        if (!isValid) {
            this.showToast('error', 'Validation Error', 'Please fix the errors and try again');
            return;
        }
        
        // Show loading
        this.setLoading(true, form.querySelector('.submit-btn'));
        
        try {
            // Simulate API call
            await this.delay(3000);
            
            // Mock registration
            const success = await this.registerUser({
                firstName,
                lastName,
                email,
                phone,
                password,
                newsletter
            });
            
            if (success) {
                this.showSuccessModal();
                this.updateProgressIndicator(3);
                this.trackEvent('user_registered', { email, newsletter });
            } else {
                this.showToast('error', 'Registration Failed', 'Email already exists or server error');
            }
        } catch (error) {
            this.showToast('error', 'Error', 'Something went wrong. Please try again.');
            console.error('Sign up error:', error);
        } finally {
            this.setLoading(false, form.querySelector('.submit-btn'));
        }
    }
    
    // Social Authentication
    async handleSocialAuth(e) {
        const button = e.target.closest('.social-btn');
        const provider = button.getAttribute('data-provider');
        
        // Show loading on button
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        button.disabled = true;
        
        try {
            // Simulate social auth
            await this.delay(2000);
            
            // Mock success
            this.showToast('info', 'Social Authentication', `${provider} authentication would be implemented here`);
            
        } catch (error) {
            this.showToast('error', 'Error', `Failed to connect with ${provider}`);
        } finally {
            button.innerHTML = originalContent;
            button.disabled = false;
        }
        
        this.trackEvent('social_auth_attempt', { provider });
    }
    
    // Mock API Functions
    async authenticateUser(email, password, remember) {
        // Mock authentication logic
        const validUsers = [
            { email: 'demo@example.com', password: 'password123' },
            { email: 'user@test.com', password: 'testpass123' }
        ];
        
        return validUsers.some(user => user.email === email && user.password === password);
    }
    
    async registerUser(userData) {
        // Mock registration logic
        // In real app, this would call your API
        console.log('Registering user:', userData);
        return true; // Simulate successful registration
    }
    
    // Loading States
    setLoading(loading, button) {
        this.isLoading = loading;
        
        if (button) {
            button.classList.toggle('loading', loading);
            button.disabled = loading;
        }
        
        // Show/hide global loading overlay if needed
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.toggle('active', loading);
        }
    }
    
    // Utility Functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.querySelectorAll('input').forEach(input => {
            if (input.type !== 'checkbox') {
                input.value = '';
                const container = input.closest('.input-container');
                if (container) {
                    container.classList.remove('focused', 'error', 'success');
                }
            } else {
                input.checked = false;
            }
        });
        
        // Clear validation messages
        form.querySelectorAll('.field-validation').forEach(el => {
            el.textContent = '';
            el.className = 'field-validation';
        });
        
        // Reset password strength
        const strengthBar = form.querySelector('.strength-bar');
        if (strengthBar) {
            strengthBar.className = 'strength-bar';
        }
    }
    
    // Success Modal
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('active');
            
            // Auto close after 5 seconds
            setTimeout(() => {
                this.closeModal();
            }, 5000);
        }
    }
    
    closeModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('active');
            // Switch to sign in tab
            setTimeout(() => {
                this.switchTab('signin');
            }, 300);
        }
    }
    
    // Toast Notifications
    showToast(type, title, message) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconMap[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    // Animations
    startAnimations() {
        // Counter animation for stats
        this.animateCounters();
        
        // Intersection observer for scroll animations
        this.setupScrollAnimations();
        
        // Particle effects
        this.setupParticleEffects();
    }
    
    animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            
            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }
    
    setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.feature-item, .auth-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(el => observer.observe(el));
    }
    
    setupParticleEffects() {
        // Add subtle particle animation to background
        const particlesContainer = document.querySelector('.bg-particles');
        if (!particlesContainer) return;
        
        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(99, 102, 241, 0.3);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${5 + Math.random() * 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }
        
        // Add particle animation CSS
        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes particleFloat {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Accessibility
    setupAccessibility() {
        // Skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // ARIA labels and roles
        this.enhanceAccessibility();
    }
    
    enhanceAccessibility() {
        // Add ARIA labels to form fields
        document.querySelectorAll('input').forEach(input => {
            const label = input.closest('.input-container')?.querySelector('label');
            if (label && !input.getAttribute('aria-label')) {
                input.setAttribute('aria-label', label.textContent);
            }
        });
        
        // Add role and aria-expanded to buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-expanded', button.classList.contains('active'));
        });
        
        // Add live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }
    
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    // Keyboard Navigation
    handleKeyboardNavigation(e) {
        // Tab navigation enhancements
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
        
        // ESC to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                this.closeModal();
            }
        }
        
        // Enter to submit forms
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const form = e.target.closest('form');
            const submitBtn = form?.querySelector('.submit-btn');
            if (submitBtn && !this.isLoading) {
                submitBtn.click();
            }
        }
    }
    
    // Mobile Menu
    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.getElementById('hamburger');
        
        if (navLinks && hamburger) {
            const isOpen = navLinks.classList.contains('mobile-open');
            navLinks.classList.toggle('mobile-open', !isOpen);
            hamburger.classList.toggle('active', !isOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? '' : 'hidden';
            
            // Add mobile menu styles if not present
            if (!document.getElementById('mobile-menu-styles')) {
                const style = document.createElement('style');
                style.id = 'mobile-menu-styles';
                style.textContent = `
                    @media (max-width: 768px) {
                        .nav-links.mobile-open {
                            display: flex;
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.95);
                            backdrop-filter: blur(20px);
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            z-index: 999;
                        }
                        
                        .nav-links.mobile-open .nav-link {
                            font-size: 1.5rem;
                            color: white;
                            margin: 1rem 0;
                        }
                        
                        .hamburger.active span:nth-child(1) {
                            transform: rotate(45deg) translate(5px, 5px);
                        }
                        
                        .hamburger.active span:nth-child(2) {
                            opacity: 0;
                        }
                        
                        .hamburger.active span:nth-child(3) {
                            transform: rotate(-45deg) translate(7px, -6px);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    // Window Events
    handleResize() {
        // Close mobile menu on resize
        if (window.innerWidth > 768) {
            const navLinks = document.querySelector('.nav-links');
            const hamburger = document.getElementById('hamburger');
            
            if (navLinks) navLinks.classList.remove('mobile-open');
            if (hamburger) hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    handleScroll() {
        // Add scroll effects to header
        const header = document.querySelector('.premium-header');
        if (header) {
            const scrolled = window.scrollY > 50;
            header.style.background = scrolled 
                ? 'rgba(255, 255, 255, 0.98)' 
                : 'rgba(255, 255, 255, 0.95)';
            
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                header.style.background = scrolled 
                    ? 'rgba(15, 15, 35, 0.98)' 
                    : 'rgba(15, 15, 35, 0.95)';
            }
        }
    }
    
    // Analytics
    trackEvent(eventName, data = {}) {
        // Mock analytics tracking
        console.log('Event tracked:', eventName, data);
        
        // In a real app, you would send this to your analytics service
        // gtag('event', eventName, data);
        // or
        // analytics.track(eventName, data);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accountManager = new PremiumAccountManager();
    
    // Global functions for HTML onclick handlers
    window.closeModal = () => window.accountManager.closeModal();
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
