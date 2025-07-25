// Common JavaScript functionality for all pages

// Menu toggle function
function menutoggle() {
    var MenuItems = document.getElementById("MenuItems");
    
    if (!MenuItems) return;
    
    if (MenuItems.style.maxHeight === "0px" || MenuItems.style.maxHeight === "") {
        MenuItems.style.maxHeight = "200px";
    } else {
        MenuItems.style.maxHeight = "0px";
    }
}

// Initialize menu on page load
document.addEventListener('DOMContentLoaded', function() {
    var MenuItems = document.getElementById("MenuItems");
    if (MenuItems) {
        MenuItems.style.maxHeight = "0px";
    }
    
    // Add fade-in animation functionality
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if (fadeElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, {
            threshold: 0.1
        });

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Add quantity validation to all number inputs
    const quantityInputs = document.querySelectorAll('input[type="number"]');
    quantityInputs.forEach(input => {
        // Prevent negative values on input
        input.addEventListener('input', function() {
            validateQuantityInput(this);
        });
        
        // Validate on blur (when user clicks away)
        input.addEventListener('blur', function() {
            validateQuantityInput(this);
        });
        
        // Prevent manual entry of negative values
        input.addEventListener('keydown', function(e) {
            // Prevent minus key, but allow backspace, delete, tab, escape, enter
            if ([69, 189, 109].includes(e.keyCode) || 
                (e.shiftKey && e.keyCode === 189)) {
                e.preventDefault();
            }
        });
        
        // For cart page, also update totals
        if (input.closest('.cart-page')) {
            input.addEventListener('change', function() {
                updateCartQuantity(this);
            });
        }
    });
});

// Form validation functions
function validateLogin() {
    const username = document.querySelector('#LoginForm input[type="text"]');
    const password = document.querySelector('#LoginForm input[type="password"]');
    
    if (!username || !password) return false;
    
    if (username.value.trim() === '') {
        alert('Please enter a username');
        return false;
    }
    
    if (password.value.length < 6) {
        alert('Password must be at least 6 characters long');
        return false;
    }
    
    return true;
}

function validateRegister() {
    const inputs = document.querySelectorAll('#RegForm input');
    
    for (let input of inputs) {
        if (input.value.trim() === '') {
            alert('Please fill in all fields');
            return false;
        }
    }
    
    const password = document.querySelector('#RegForm input[type="password"]');
    if (password && password.value.length < 6) {
        alert('Password must be at least 6 characters long');
        return false;
    }
    
    return true;
}

// Login/Register form switching
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginForm = document.getElementById('LoginForm');
    const regForm = document.getElementById('RegForm');
    const indicator = document.getElementById('Indicator');
    
    if (loginBtn && registerBtn && loginForm && regForm && indicator) {
        loginBtn.addEventListener('click', function() {
            regForm.style.transform = 'translateX(300px)';
            loginForm.style.transform = 'translateX(300px)';
            indicator.style.transform = 'translateX(0px)';
        });
        
        registerBtn.addEventListener('click', function() {
            regForm.style.transform = 'translateX(0px)';
            loginForm.style.transform = 'translateX(0px)';
            indicator.style.transform = 'translateX(100px)';
        });
    }
});

// Cart functionality
function updateCartQuantity(input) {
    // Ensure quantity is at least 1
    if (parseInt(input.value) < 1 || input.value === '' || isNaN(input.value)) {
        input.value = 1;
    }
    
    const row = input.closest('tr');
    const priceText = row.querySelector('.price').textContent;
    const price = parseFloat(priceText.replace('Price: ₹', '').replace(',', ''));
    const quantity = parseInt(input.value);
    const subtotal = row.querySelector('.subtotal');
    
    if (subtotal) {
        subtotal.textContent = '₹ ' + (price * quantity).toFixed(2);
    }
    
    updateCartTotal();
}

// Add quantity validation for all number inputs
function validateQuantityInput(input) {
    const value = parseInt(input.value);
    
    if (value < 1 || isNaN(value) || input.value === '') {
        input.value = 1;
        return false;
    }
    
    // Optional: Set maximum quantity limit
    const maxQuantity = 99;
    if (value > maxQuantity) {
        input.value = maxQuantity;
        alert(`Maximum quantity allowed is ${maxQuantity}`);
        return false;
    }
    
    return true;
}

function updateCartTotal() {
    const subtotals = document.querySelectorAll('.subtotal');
    let total = 0;
    
    subtotals.forEach(subtotal => {
        const value = parseFloat(subtotal.textContent.replace('₹', '').replace(',', ''));
        total += value;
    });
    
    const totalElement = document.querySelector('.total-amount');
    if (totalElement) {
        totalElement.textContent = '₹ ' + total.toFixed(2);
    }
}

// Product image switching for single product pages
function changeProductImage(thumbnail) {
    const mainImage = document.getElementById('ProductImg');
    if (mainImage) {
        mainImage.src = thumbnail.src;
    }
}
