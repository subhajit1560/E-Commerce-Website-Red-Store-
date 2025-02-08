// Debounce function
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Throttle function
function throttle(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        if (!timeout) {
            timeout = setTimeout(() => {
                timeout = null;
                func.apply(context, args);
            }, wait);
        }
    };
}

// Scroll-triggered animations
const fadeInElements = document.querySelectorAll('.fade-in');
const slideInLeftElements = document.querySelectorAll('.slide-in-left');
const slideInRightElements = document.querySelectorAll('.slide-in-right');
const zoomInElements = document.querySelectorAll('.zoom-in');

const checkVisibility = () => {
    fadeInElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('active');
        }
    });

    slideInLeftElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('active');
        }
    });

    slideInRightElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('active');
        }
    });

    zoomInElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('active');
        }
    });
};

// Debounce the checkVisibility function
const debouncedCheckVisibility = debounce(checkVisibility, 100);

// Throttle the debouncedCheckVisibility function
const throttledCheckVisibility = throttle(debouncedCheckVisibility, 500);

window.addEventListener('scroll', throttledCheckVisibility);
window.addEventListener('load', throttledCheckVisibility);