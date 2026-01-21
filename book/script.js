// ==============================================
// ملف JavaScript الرئيسي - Digital Book Platform
// شامل لجميع الوظائف والتأثيرات
// ==============================================

class AppState {
    constructor() {
        this.currentPage = 'index';
        this.userToken = null;
        this.theme = localStorage.getItem('theme') || 'light';
        this.notifications = [];
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.setupGlobalListeners();
        this.checkAuth();
        this.setupServiceWorker();
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.remove('light-mode', 'dark-mode');
            document.body.classList.add(savedTheme + '-mode');
            this.theme = savedTheme;
        }
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle') || 
                           document.getElementById('themeToggleNav');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    setupGlobalListeners() {
        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#themeToggle') || e.target.closest('#themeToggleNav')) {
                this.toggleTheme();
            }
        });
        
        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offset = 80;
                    const targetPosition = targetElement.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
        
        // Scroll to top button
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.id = 'scrollToTop';
        scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollToTopBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 50px;
            height: 50px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 4px 15px var(--shadow-color);
        `;
        document.body.appendChild(scrollToTopBtn);
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.transform = 'translateY(0)';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.transform = 'translateY(20px)';
            }
        });
        
        // Handle buy buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.buy-btn') && !e.target.closest('#buyModal')) {
                e.preventDefault();
                // In production, this would redirect to payment gateway
                this.showNotification('سيتم توجيهك إلى بوابة الدفع الآمنة', 'info');
            }
        });
        
        // Initialize tooltips
        this.initTooltips();
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(this.theme + '-mode');
        
        localStorage.setItem('theme', this.theme);
        
        // Update icon
        const themeToggle = document.getElementById('themeToggle') || 
                           document.getElementById('themeToggleNav');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        this.showNotification(`تم التبديل إلى الوضع ${this.theme === 'dark' ? 'الداكن' : 'الفاتح'}`, 'info');
    }
    
    checkAuth() {
        this.userToken = localStorage.getItem('bookAccessToken');
        return !!this.userToken;
    }
    
    async verifyToken() {
        if (!this.userToken) return false;
        
        try {
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: this.userToken })
            });
            
            const result = await response.json();
            return result.access === true;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }
    
    saveToken(token) {
        this.userToken = token;
        localStorage.setItem('bookAccessToken', token);
    }
    
    clearToken() {
        this.userToken = null;
        localStorage.removeItem('bookAccessToken');
        localStorage.removeItem('reading_state');
        localStorage.removeItem('book_bookmarks');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                type === 'warning' ? 'exclamation-triangle' : 
                                type === 'error' ? 'times-circle' : 'info-circle'} me-2"></i>
            ${message}
        `;
        
        // Apply styles
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 30px;
            background: var(--card-bg);
            color: var(--text-color);
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px var(--shadow-lg);
            border-right: 4px solid var(--${type}-color);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        this.notifications.push(notification);
    }
    
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = element.getAttribute('title');
                tooltip.style.cssText = `
                    position: absolute;
                    background: var(--card-bg);
                    color: var(--text-color);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    white-space: nowrap;
                    z-index: 10000;
                    box-shadow: 0 4px 15px var(--shadow-color);
                    border: 1px solid var(--border-color);
                    transform: translateY(-100%) translateX(-50%);
                    top: -10px;
                    left: 50%;
                `;
                
                document.body.appendChild(tooltip);
                
                const rect = element.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) + 'px';
                tooltip.style.top = rect.top - 10 + 'px';
                
                element._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', () => {
                if (element._tooltip) {
                    element._tooltip.remove();
                    delete element._tooltip;
                }
            });
        });
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        console.log('ServiceWorker registered:', registration);
                    },
                    (error) => {
                        console.log('ServiceWorker registration failed:', error);
                    }
                );
            });
        }
    }
    
    // Analytics
    trackEvent(category, action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] ${category} - ${action}: ${label}`);
        }
    }
    
    // Form validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    validatePassword(password) {
        return password.length >= 8;
    }
    
    // Local storage utilities
    setLocalData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    
    getLocalData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }
    
    // Network status
    isOnline() {
        return navigator.onLine;
    }
    
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('فقدت الاتصال بالإنترنت', 'warning');
        });
    }
    
    // Performance monitoring
    measurePageLoad() {
        window.addEventListener('load', () => {
            if (window.performance) {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                
                this.trackEvent('Performance', 'Page Load', `${loadTime}ms`);
                
                if (loadTime > 3000) {
                    console.warn(`Page load time is high: ${loadTime}ms`);
                }
            }
        });
    }
}

// Initialize the app
const appState = new AppState();

// Global helper functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for use in other modules
window.AppState = appState;
window.debounce = debounce;
window.throttle = throttle;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-fade-in-up {
            animation: fadeInUp 0.5s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Track page view
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            'page_title': document.title,
            'page_location': window.location.href,
            'page_path': window.location.pathname
        });
    }
    
    // Log page load
    console.log(`%c📚 الطريق إلى 1000$ شهريًا\n%cالإصدار 2.0 | منصة بيع الكتب الرقمية`, 
        'color: #2563eb; font-size: 16px; font-weight: bold;',
        'color: #64748b; font-size: 12px;'
    );
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    appState.trackEvent('Errors', 'JavaScript Error', event.message);
    
    // Don't show error notification for minor errors
    if (!event.message.includes('ResizeObserver') && 
        !event.message.includes('undefined')) {
        appState.showNotification('حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'error');
    }
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    appState.trackEvent('Errors', 'Promise Rejection', event.reason?.message || 'Unknown');
});

// Export for modules
export { appState, debounce, throttle };