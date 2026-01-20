// ==============================================
// نظام الكتاب الإلكتروني الموحد
// إصدار 2026 - أمجد الكلباني
// ==============================================

// الحالة العامة للتطبيق
const AppState = {
    isDarkMode: false,
    isEnglish: false,
    currentPage: 'home',
    userToken: null,
    bookAccess: false,
    
    // تهيئة التطبيق
    init() {
        console.log('🚀 تهيئة تطبيق الكتاب...');
        
        // تحميل الحالة المحفوظة
        this.loadSavedState();
        
        // إعداد المستمعين
        this.setupEventListeners();
        
        // التحقق من التوكن إن وجد
        this.checkTokenOnLoad();
        
        // إعداد تأثيرات التمرير
        this.setupScrollEffects();
        
        // إعداد الأنيميشن
        this.setupAnimations();
        
        console.log('✅ التطبيق جاهز');
    },
    
    // تحميل الحالة المحفوظة
    loadSavedState() {
        // تحميل الوضع الداكن
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // تحميل اللغة
        this.isEnglish = localStorage.getItem('language') === 'en';
        
        // تحميل التوكن إذا كان في localStorage
        this.userToken = localStorage.getItem('book_token') || 
                        this.getTokenFromURL();
    },
    
    // الحصول على التوكن من الرابط
    getTokenFromURL() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (token) {
            // حفظ التوكن في localStorage
            localStorage.setItem('book_token', token);
            
            // تنظيف الرابط من التوكن
            const cleanURL = window.location.pathname;
            window.history.replaceState({}, document.title, cleanURL);
            
            return token;
        }
        
        return null;
    },
    
    // التحقق من التوكن عند التحميل
    async checkTokenOnLoad() {
        if (this.userToken && window.location.pathname.includes('book.html')) {
            await this.validateToken(this.userToken);
        }
    },
    
    // التحقق من صلاحية التوكن
    async validateToken(token) {
        try {
            // إظهار حالة التحميل
            this.showLoading('جاري التحقق من صلاحية الوصول...');
            
            // في الإنتاج، استبدل هذا بالاتصال بخادمك
            const response = await fetch('https://your-server.com/validate-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });
            
            const data = await response.json();
            
            if (data.access) {
                this.bookAccess = true;
                this.showBookContent();
            } else {
                this.redirectToUnauthorized();
            }
            
        } catch (error) {
            console.error('خطأ في التحقق من التوكن:', error);
            this.showError('حدث خطأ في التحقق. يرجى المحاولة لاحقاً.');
        }
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // تبديل الوضع الداكن
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
        
        // تبديل اللغة
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }
        
        // زر شراء الكتاب
        const buyButtons = document.querySelectorAll('.buy-btn');
        buyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePurchase();
            });
        });
        
        // تأثيرات المرور على البطاقات
        const cards = document.querySelectorAll('.card, .feature-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
        
        // تأثيرات الإدخال
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });
    },
    
    // تبديل الوضع الداكن
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        localStorage.setItem('darkMode', this.isDarkMode);
        
        // تحديث زر الوضع
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            icon.className = this.isDarkMode ? 'bi bi-sun' : 'bi bi-moon';
            themeBtn.setAttribute('title', this.isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن');
        }
    },
    
    // تبديل اللغة
    toggleLanguage() {
        this.isEnglish = !this.isEnglish;
        localStorage.setItem('language', this.isEnglish ? 'en' : 'ar');
        
        // تحديث زر اللغة
        const langBtn = document.getElementById('langToggle');
        if (langBtn) {
            langBtn.textContent = this.isEnglish ? 'AR' : 'EN';
        }
        
        // إشعار (في الإصدار الكامل، هنا سيتم تحويل كل النصوص)
        this.showNotification(
            this.isEnglish ? 
            'Language will be changed in the full version' : 
            'سيتم تغيير اللغة في الإصدار الكامل',
            'info'
        );
    },
    
    // معالجة الشراء
    handlePurchase() {
        // في الإنتاج، هذا سيوجه إلى Payhip
        const payhipLink = 'https://payhip.com/b/YOUR_PRODUCT_ID';
        
        // فتح نافذة جديدة للدفع
        window.open(payhipLink, '_blank');
        
        // تتبع حدث الشراء (افتراضي)
        this.trackEvent('purchase_intent', {
            product_id: 'book-1000-monthly',
            price: 19,
            currency: 'USD'
        });
    },
    
    // إعداد تأثيرات التمرير
    setupScrollEffects() {
        let lastScroll = 0;
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // إخفاء/إظهار شريط التنقل
            if (currentScroll > lastScroll && currentScroll > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
            
            // تأثيرات الكشف عند التمرير
            this.handleScrollReveal();
        });
    },
    
    // كشف العناصر عند التمرير
    handleScrollReveal() {
        const elements = document.querySelectorAll('.reveal-text');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('visible');
            }
        });
    },
    
    // إعداد الأنيميشن
    setupAnimations() {
        // أنيميشن الدخول للعناصر
        const animatedElements = document.querySelectorAll('.card, .feature-card, .pricing-card');
        
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('fadeInUp');
        });
        
        // أنيميشن التأثيرات
        this.setupParticleEffect();
    },
    
    // تأثيرات الجسيمات (للصفحة الرئيسية)
    setupParticleEffect() {
        if (!document.querySelector('.particles-container')) return;
        
        const container = document.querySelector('.particles-container');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // إعداد عشوائي
            const size = Math.random() * 20 + 5;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background: var(--gradient-primary);
                border-radius: 50%;
                position: absolute;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.3 + 0.1};
                animation: float ${duration}s ease-in-out ${delay}s infinite;
            `;
            
            container.appendChild(particle);
        }
    },
    
    // عرض محتوى الكتاب
    showBookContent() {
        // إخفاء شاشة التحميل
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
        
        // عرض محتوى الكتاب
        const bookContent = document.getElementById('bookContent');
        if (bookContent) {
            bookContent.style.display = 'block';
            bookContent.classList.add('visible');
        }
    },
    
    // تحويل إلى صفحة غير مصرح
    redirectToUnauthorized() {
        if (!window.location.pathname.includes('unauthorized.html')) {
            window.location.href = 'unauthorized.html';
        }
    },
    
    // عرض حالة التحميل
    showLoading(message) {
        const loadingEl = document.getElementById('loadingState') || this.createLoadingElement();
        loadingEl.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        loadingEl.style.display = 'flex';
    },
    
    // إنشاء عنصر التحميل
    createLoadingElement() {
        const loadingEl = document.createElement('div');
        loadingEl.id = 'loadingState';
        loadingEl.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
        `;
        document.body.appendChild(loadingEl);
        return loadingEl;
    },
    
    // إخفاء التحميل
    hideLoading() {
        const loadingEl = document.getElementById('loadingState');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    },
    
    // عرض إشعار
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi ${type === 'success' ? 'bi-check-circle' : 
                               type === 'error' ? 'bi-exclamation-circle' : 
                               'bi-info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : 
                        type === 'error' ? '#ef4444' : 
                        '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // زر الإغلاق
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        });
        
        // إزالة تلقائية بعد 5 ثوان
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },
    
    // عرض خطأ
    showError(message) {
        this.showNotification(message, 'error');
    },
    
    // تتبع الأحداث
    trackEvent(eventName, data = {}) {
        // في الإنتاج، أضف كود Google Analytics أو أي خدمة تتبع هنا
        console.log(`📊 Event: ${eventName}`, data);
    },
    
    // توليد التوكن العشوائي (للاستخدام في Backend)
    generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        
        for (let i = 0; i < 64; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return token;
    }
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    AppState.init();
});

// دعم لـ Turbo/SR.js (للصفحات الديناميكية)
if (typeof Turbo !== 'undefined') {
    document.addEventListener('turbo:load', () => {
        AppState.init();
    });
}