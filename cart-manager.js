// Global Cart Management System
class CartManager {
    constructor() {
        this.cartItems = this.loadCartFromStorage();
        this.init();
    }

    // Initialize cart system
    init() {
        this.updateCartUI();
        this.updateCartCounter();
        this.bindEvents();
    }

    // Load cart from localStorage
    loadCartFromStorage() {
        try {
            const cartData = localStorage.getItem('shopping_cart');
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    }

    // Save cart to localStorage
    saveCartToStorage() {
        try {
            localStorage.setItem('shopping_cart', JSON.stringify(this.cartItems));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // Add item to cart
    addToCart(product) {
        const existingItem = this.cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            this.showNotification(`Updated quantity for ${product.name}`, 'success');
        } else {
            this.cartItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                quantity: 1,
                image: product.image,
                color: product.color || 'N/A',
                size: product.size || 'N/A',
                rating: product.rating || 4.5,
                reviews: product.reviews || 100
            });
            this.showNotification(`${product.name} added to cart!`, 'success');
        }
        
        this.saveCartToStorage();
        this.updateCartUI();
        this.updateCartCounter();
    }

    // Remove item from cart
    removeFromCart(itemId) {
        const itemIndex = this.cartItems.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            const removedItem = this.cartItems[itemIndex];
            this.cartItems.splice(itemIndex, 1);
            this.saveCartToStorage();
            this.updateCartUI();
            this.updateCartCounter();
            this.showNotification(`${removedItem.name} removed from cart`, 'info');
            return true;
        }
        return false;
    }

    // Update item quantity
    updateQuantity(itemId, newQuantity) {
        const item = this.cartItems.find(item => item.id === itemId);
        if (item && newQuantity > 0 && newQuantity <= 10) {
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.updateCartUI();
            this.updateCartCounter();
            return true;
        }
        return false;
    }

    // Clear entire cart
    clearCart() {
        this.cartItems = [];
        this.saveCartToStorage();
        this.updateCartUI();
        this.updateCartCounter();
        this.showNotification('Cart cleared', 'info');
    }

    // Get cart summary
    getCartSummary() {
        const subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 50;
        const tax = subtotal * 0.1;
        const discount = subtotal > 1000 ? 100 : 0;
        const total = subtotal + shipping + tax - discount;

        return {
            itemCount: this.cartItems.length,
            totalQuantity: this.cartItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal,
            shipping,
            tax,
            discount,
            total
        };
    }

    // Update cart counter in navigation
    updateCartCounter() {
        const summary = this.getCartSummary();
        const cartCounters = document.querySelectorAll('.cart-count, #cartItemCount, #cartCounter, .cart-counter');
        
        cartCounters.forEach(counter => {
            if (counter) {
                counter.textContent = summary.totalQuantity;
                counter.style.display = summary.totalQuantity > 0 ? 'inline-block' : 'none';
            }
        });

        // Update cart button visibility
        const cartButtons = document.querySelectorAll('.cart-btn, .cart-nav-btn');
        cartButtons.forEach(btn => {
            if (summary.totalQuantity > 0) {
                btn.classList.add('has-items');
            } else {
                btn.classList.remove('has-items');
            }
        });
    }

    // Update cart UI (for cart page)
    updateCartUI() {
        // Only update if we're on the cart page
        if (!document.querySelector('.premium-cart-page')) return;

        const cartContainer = document.getElementById('cartItemsContainer');
        const emptyCartState = document.getElementById('emptyCartState');
        const cartSummarySection = document.querySelector('.cart-summary-section');

        if (!cartContainer) return;

        if (this.cartItems.length === 0) {
            // Show empty cart state
            cartContainer.innerHTML = '';
            if (emptyCartState) emptyCartState.style.display = 'block';
            if (cartSummarySection) cartSummarySection.style.display = 'none';
        } else {
            // Show cart items
            if (emptyCartState) emptyCartState.style.display = 'none';
            if (cartSummarySection) cartSummarySection.style.display = 'block';
            
            cartContainer.innerHTML = this.cartItems.map(item => this.generateCartItemHTML(item)).join('');
            this.updateCartSummaryDisplay();
        }
    }

    // Generate HTML for cart item
    generateCartItemHTML(item) {
        const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
        const stars = Math.floor(item.rating);
        const hasHalfStar = item.rating % 1 !== 0;

        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-content">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-badge">${discount > 0 ? `${discount}% OFF` : 'New'}</div>
                    </div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <div class="cart-item-meta">
                            <span class="item-color">Color: ${item.color}</span>
                            <span class="item-size">Size: ${item.size}</span>
                        </div>
                        <div class="item-rating">
                            <div class="stars">
                                ${'<i class="fas fa-star"></i>'.repeat(stars)}
                                ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
                                ${'<i class="far fa-star"></i>'.repeat(5 - stars - (hasHalfStar ? 1 : 0))}
                            </div>
                            <span class="rating-text">${item.rating} (${item.reviews} reviews)</span>
                        </div>
                        <div class="cart-item-price">
                            <span class="current-price">₹${item.price}</span>
                            ${item.originalPrice !== item.price ? `<span class="original-price">₹${item.originalPrice}</span>` : ''}
                            ${discount > 0 ? `<span class="discount">${discount}% OFF</span>` : ''}
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="1" max="10" 
                                   onchange="cartManager.updateQuantity(${item.id}, parseInt(this.value))">
                            <button class="qty-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="item-total">₹${(item.price * item.quantity).toLocaleString()}</div>
                        <button class="remove-btn" onclick="cartManager.removeFromCart(${item.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Update cart summary display
    updateCartSummaryDisplay() {
        const summary = this.getCartSummary();
        
        // Update summary elements
        const elements = {
            'totalItems': summary.itemCount,
            'subtotalAmount': `₹${summary.subtotal.toLocaleString()}.00`,
            'shippingAmount': summary.shipping === 0 ? 'FREE' : `₹${summary.shipping}.00`,
            'taxAmount': `₹${summary.tax.toFixed(2)}`,
            'discountAmount': summary.discount > 0 ? `-₹${summary.discount}.00` : '₹0.00',
            'totalAmount': `₹${summary.total.toFixed(2)}`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    // Apply promo code
    applyPromoCode(code) {
        const promoCodes = {
            'SAVE10': { discount: 10, type: 'percentage', description: '10% off' },
            'FLAT50': { discount: 50, type: 'fixed', description: '₹50 off' },
            'WELCOME': { discount: 15, type: 'percentage', description: '15% off' },
            'NEWUSER': { discount: 20, type: 'percentage', description: '20% off for new users' }
        };

        const upperCode = code.toUpperCase();
        if (promoCodes[upperCode]) {
            this.showNotification(`Promo code "${upperCode}" applied! ${promoCodes[upperCode].description}`, 'success');
            // Here you would implement the actual discount logic
            this.updateCartSummaryDisplay();
            return true;
        } else {
            this.showNotification('Invalid promo code', 'error');
            return false;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.cart-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `cart-notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Bind events
    bindEvents() {
        // Add to cart buttons (support multiple class names)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn') || 
                e.target.closest('.add-to-cart-btn') ||
                e.target.classList.contains('add-to-cart') || 
                e.target.closest('.add-to-cart')) {
                e.preventDefault();
                
                const button = e.target.classList.contains('add-to-cart-btn') || e.target.classList.contains('add-to-cart') 
                    ? e.target 
                    : e.target.closest('.add-to-cart-btn, .add-to-cart');
                
                // Extract product data from the button or its parent
                const productData = this.extractProductData(button);
                if (productData) {
                    this.addToCart(productData);
                } else {
                    console.error('Could not extract product data from:', button);
                }
            }
        });

        // Clear cart button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('clear-cart-btn') || e.target.closest('.clear-cart-btn')) {
                e.preventDefault();
                if (confirm('Are you sure you want to clear all items from your cart?')) {
                    this.clearCart();
                }
            }
        });

        // Promo code form
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('promo-form')) {
                e.preventDefault();
                const input = e.target.querySelector('#promoInput, .promo-input');
                if (input && input.value.trim()) {
                    this.applyPromoCode(input.value.trim());
                    input.value = '';
                }
            }
        });
    }

    // Extract product data from DOM element
    extractProductData(button) {
        const productCard = button.closest('.col-4, .product-card, .single-product');
        if (!productCard) {
            console.error('Product card not found for button:', button);
            return null;
        }

        const nameElement = productCard.querySelector('h4, .product-name, h1');
        const imageElement = productCard.querySelector('img');
        
        if (!nameElement || !imageElement) {
            console.error('Missing product elements:', { nameElement, imageElement });
            return null;
        }

        // Extract price more robustly
        let price = 0;
        
        // Try to find price with .price class first
        let priceElement = productCard.querySelector('.price');
        
        // If not found, try other selectors
        if (!priceElement) {
            priceElement = productCard.querySelector('.product-price, h4:contains("₹"), p:contains("₹")');
        }
        
        // If still not found, search for any element containing ₹
        if (!priceElement) {
            const allElements = productCard.querySelectorAll('*');
            for (let el of allElements) {
                if (el.textContent && el.textContent.includes('₹')) {
                    priceElement = el;
                    break;
                }
            }
        }

        if (priceElement) {
            const priceText = priceElement.textContent.replace(/[₹,\s]/g, '');
            price = parseFloat(priceText) || 0;
        }

        if (price === 0) {
            console.error('Price not found for product:', nameElement.textContent);
            return null;
        }

        // Generate unique ID based on product name and price
        const productName = nameElement.textContent.trim();
        const productId = this.generateProductId(productName, price);

        console.log('Extracted product data:', {
            id: productId,
            name: productName,
            price: price,
            image: imageElement.src
        });

        return {
            id: productId,
            name: productName,
            price: price,
            originalPrice: Math.round(price * 1.25), // Simulate 20% discount
            image: imageElement.src,
            color: 'Default',
            size: 'M',
            rating: this.extractRating(productCard) || 4.5,
            reviews: Math.floor(Math.random() * 200) + 50
        };
    }

    // Generate consistent product ID
    generateProductId(name, price) {
        return btoa(name + price).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    }

    // Extract rating from product card
    extractRating(productCard) {
        const ratingContainer = productCard.querySelector('.rating');
        if (!ratingContainer) return 4.5;

        const filledStars = ratingContainer.querySelectorAll('.fa-star').length;
        const halfStars = ratingContainer.querySelectorAll('.fa-star-half-o, .fa-star-half-alt').length;
        
        return filledStars + (halfStars * 0.5);
    }

    // Get cart items count
    getItemCount() {
        return this.cartItems.length;
    }

    // Get total quantity
    getTotalQuantity() {
        return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// Initialize global cart manager
const cartManager = new CartManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}
