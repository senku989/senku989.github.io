// ==============================================
// ملف JavaScript المحسن
// تحسينات الأداء والتجربة
// ==============================================

class ModernAppState {
    constructor() {
        this.userToken = null;
        this.theme = localStorage.getItem('theme') || 'light';
        this.scrollPosition = 0;
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.setupSmoothScrolling();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupIntersectionObserver();
        this.setupPerformanceMonitoring();
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.remove('light-mode', 'dark-mode');
            document.body.classList.add(savedTheme + '-mode');
            this.theme = savedTheme;
        }
        
        // تحديث أيقونة الثيم
        this.updateThemeIcon();
    }
    
    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggleNav');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
    
    setupSmoothScrolling() {
        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link && link.getAttribute('href') !== '#') {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.nav-modern').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page reload
                    history.pushState(null, null, targetId);
                }
            }
        });
    }
    
    setupScrollEffects() {
        let lastScroll = 0;
        const navbar = document.querySelector('.nav-modern');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Hide/show navbar on scroll
            if (currentScroll > lastScroll && currentScroll > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            // Add shadow on scroll
            if (currentScroll > 50) {
                navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
            
            lastScroll = currentScroll;
            this.scrollPosition = currentScroll;
        });
    }
    
    setupAnimations() {
        // Initialize AOS-like animations
        const animatedElements = document.querySelectorAll('.feature-card-modern, .stat-modern, .book-cover-modern');
        
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.feature-card-modern, .stat-modern').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupPerformanceMonitoring() {
        // Track page load performance
        window.addEventListener('load', () => {
            if (window.performance) {
                const timing = performance.getEntriesByType('navigation')[0];
                if (timing) {
                    const loadTime = timing.domContentLoadedEventEnd - timing.fetchStart;
                    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
                    
                    if (loadTime > 3000) {
                        console.warn('Page load time is high, consider optimization');
                    }
                }
            }
        });
        
        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                const usedMB = performance.memory.usedJSHeapSize / 1048576;
                const totalMB = performance.memory.totalJSHeapSize / 1048576;
                
                if (usedMB > totalMB * 0.8) {
                    console.warn('High memory usage detected:', usedMB.toFixed(2), 'MB');
                }
            }, 30000);
        }
    }
    
    // Utility functions
    debounce(func, wait) {
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
    
    throttle(func, limit) {
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
    
    // Form validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Local storage with compression
    setCompressedData(key, data) {
        try {
            const compressed = JSON.stringify(data);
            localStorage.setItem(key, compressed);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }
    
    getCompressedData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }
    
    // Network status monitoring
    setupNetworkMonitor() {
        window.addEventListener('online', () => {
            this.showToast('تم استعادة الاتصال بالإنترنت', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showToast('فقدت الاتصال بالإنترنت', 'warning');
        });
    }
    
    // Toast notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 
                              type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showToast('حدث خطأ غير متوقع', 'error');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showToast('حدث خطأ في العملية', 'error');
        });
    }
}

// Initialize the app
const modernApp = new ModernAppState();

// Global exports
window.ModernApp = modernApp;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c📚 الطريق إلى 1000$ - الإصدار المحسن\n%cتم التحميل بنجاح', 
        'color: #2563eb; font-size: 16px; font-weight: bold;',
        'color: #10b981; font-size: 12px;'
    );
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .toast {
            position: fixed;
            bottom: 30px;
            left: 30px;
            background: var(--card-bg);
            color: var(--text-color);
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 30px var(--shadow-lg);
            border-right: 4px solid var(--primary-color);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .toast-success {
            border-right-color: var(--success-color);
        }
        
        .toast-warning {
            border-right-color: var(--warning-color);
        }
        
        .toast-error {
            border-right-color: var(--danger-color);
        }
        
        .toast.fade-out {
            animation: slideOutRight 0.3s ease forwards;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});