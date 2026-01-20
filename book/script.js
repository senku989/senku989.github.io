// ==============================================
// JavaScript الرئيسي - مشروع الكتاب الرقمي
// ==============================================

// 1. تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 بدء تحميل مشروع الكتاب الرقمي...');
    
    // تهيئة المكونات بالترتيب
    initLoadingScreen();
    initParticles();
    initNavigation();
    initTabs();
    initFAQ();
    initTestimonials();
    initTimer();
    initAnimations();
    initPurchaseButtons();
    initNotifications();
    
    console.log('✅ التطبيق جاهز للاستخدام');
});

// 2. شاشة التحميل
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // محاكاة تحميل المحتوى
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        
        // إزالة شاشة التحميل بعد الأنيميشن
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            showNotification('مرحباً بك في رحلتك نحو 1000$ شهرياً! 🚀', 'success');
        }, 500);
    }, 2000);
}

// 3. نظام الجسيمات المتحركة
function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // حجم عشوائي
        const size = Math.random() * 100 + 50;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // موضع عشوائي
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        
        // لون عشوائي
        const colors = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        
        // أنيميشن عشوائية
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 5;
        particle.style.animation = `float ${duration}s infinite linear ${delay}s`;
        
        container.appendChild(particle);
        
        // إعادة إنشاء الجسيم بعد اختفائه
        setTimeout(() => {
            particle.remove();
            createParticle(container);
        }, duration * 1000);
    }
}

// 4. نظام التنقل
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar-glass');
    
    // تبديل القائمة
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // إغلاق القائمة عند النقر على رابط
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // تأثير التمرير
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // تحديث الروابط النشطة
        updateActiveNavLink();
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// 5. نظام التبويبات
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // إزالة النشاط من جميع الأزرار
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // إخفاء جميع المحتويات
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // عرض المحتوى المطلوب
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // زر عرض المزيد من الفصول
    const showMoreBtn = document.getElementById('showMoreChapters');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            showNotification('جاري تحميل جميع الفصول السبعة...', 'info');
            
            // محاكاة تحميل إضافي
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> جميع الفصول معروضة';
                this.disabled = true;
                showNotification('تم تحميل جميع الفصول بنجاح! 📚', 'success');
            }, 1500);
        });
    }
}

// 6. نظام الأسئلة الشائعة (FAQ)
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // إغلاق العناصر الأخرى
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // تبديل العنصر الحالي
            item.classList.toggle('active');
        });
    });
}

// 7. نظام آراء العملاء
function initTestimonials() {
    // في الإصدار الكامل، هنا سيتم جلب البيانات من API
    const testimonials = [
        {
            name: "محمد ر.",
            role: "مطور ويب",
            content: "استراتيجيات التسويق بالعمولة غيرت مساري تماماً. من 0 إلى 1200$ شهرياً في 4 أشهر!",
            rating: 5,
            date: "قبل 3 أشهر",
            income: "+1,200$ شهرياً"
        },
        {
            name: "فاطمة ع.",
            role: "مدونة",
            content: "القوالب الجاهزة وحدها كانت تساوي ثمن الكتاب. وفرت علي 3 أشهر من العمل!",
            rating: 5,
            date: "قبل شهرين",
            income: "+750$ شهرياً"
        }
    ];
    
    // تحديث آراء العملاء ديناميكياً
    updateTestimonials(testimonials);
}

function updateTestimonials(testimonials) {
    const container = document.querySelector('.testimonials-slider');
    
    testimonials.forEach(testimonial => {
        const stars = '⭐'.repeat(testimonial.rating);
        
        const testimonialHTML = `
            <div class="testimonial-card" data-aos="fade-up">
                <div class="testimonial-header">
                    <div class="reviewer-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}" alt="${testimonial.name}">
                    </div>
                    <div class="reviewer-info">
                        <h4>${testimonial.name}</h4>
                        <div class="review-stars">${stars}</div>
                    </div>
                </div>
                <div class="testimonial-body">
                    <p>"${testimonial.content}"</p>
                </div>
                <div class="testimonial-footer">
                    <span class="review-date">${testimonial.date}</span>
                    <span class="review-income">${testimonial.income}</span>
                </div>
            </div>
        `;
        
        if (container) {
            container.innerHTML += testimonialHTML;
        }
    });
}

// 8. المؤقت التنازلي
function initTimer() {
    const timerElement = document.querySelector('.timer-display');
    if (!timerElement) return;
    
    // تعيين وقت انتهاء العرض (2 ساعة من الآن)
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2);
    
    function updateTimer() {
        const now = new Date();
        const diff = endTime - now;
        
        if (diff <= 0) {
            // إعادة تعيين المؤقت
            endTime.setHours(endTime.getHours() + 2);
            showNotification('تم تجديد العرض! 🎉', 'success');
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // تحديث العرض
        const hourElement = timerElement.querySelector('.timer-unit:nth-child(1) .timer-number');
        const minuteElement = timerElement.querySelector('.timer-unit:nth-child(3) .timer-number');
        const secondElement = timerElement.querySelector('.timer-unit:nth-child(5) .timer-number');
        
        if (hourElement) hourElement.textContent = hours.toString().padStart(2, '0');
        if (minuteElement) minuteElement.textContent = minutes.toString().padStart(2, '0');
        if (secondElement) secondElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    // تحديث كل ثانية
    updateTimer();
    setInterval(updateTimer, 1000);
}

// 9. نظام الأنيميشنات
function initAnimations() {
    // تهيئة AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
    
    // أنيميشنات عند التمرير
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(el => observer.observe(el));
    
    // أنيميشنات خاصة للكتب
    const books = document.querySelectorAll('.book-3d-inner');
    books.forEach(book => {
        book.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        book.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    });
}

// 10. أزرار الشراء
function initPurchaseButtons() {
    const purchaseButtons = document.querySelectorAll('.btn-purchase, .floating-purchase-btn, .btn-final');
    
    purchaseButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // منع الإجراء الافتراضي للروابط
            if (this.tagName === 'A' && this.href.includes('#purchase')) {
                e.preventDefault();
                document.getElementById('purchase').scrollIntoView({ behavior: 'smooth' });
            }
            
            // تتبع حدث الشراء
            trackPurchaseIntent();
        });
    });
    
    // زر الشراء الرئيسي عبر Payhip
    const payhipBtn = document.getElementById('payhipPurchaseBtn');
    if (payhipBtn) {
        payhipBtn.addEventListener('click', function(e) {
            // هنا يمكن إضافة منطق تتبع Google Analytics أو Facebook Pixel
            console.log('👤 المستخدم ينقر على زر الشراء عبر Payhip');
            
            // إظهار رسالة تأكيد
            showNotification('جاري التوجيه إلى صفحة الدفع الآمن... 🔒', 'info');
            
            // في الإصدار الحقيقي، سيتم التوجيه إلى Payhip مباشرة
            // window.location.href = 'https://payhip.com/b/your-product-id';
        });
    }
}

function trackPurchaseIntent() {
    // تتبع نية الشراء
    console.log('🎯 المستخدم يظهر اهتماماً بالشراء');
    
    // يمكن إرسال بيانات إلى Google Analytics هنا
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase_intent', {
            'event_category': 'conversion',
            'event_label': 'book_purchase'
        });
    }
    
    // عرض رسالة تشجيعية
    setTimeout(() => {
        showNotification('اختيار ممتاز! هذا الكتاب سيغير مسارك المالي 🚀', 'success');
    }, 1000);
}

// 11. نظام الإشعارات
function initNotifications() {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastClose = document.querySelector('.toast-close');
    
    // إغلاق الإشعار
    if (toastClose) {
        toastClose.addEventListener('click', function() {
            hideNotification();
        });
    }
    
    // إغلاق تلقائي بعد 5 ثوان
    window.addEventListener('notification', function(e) {
        setTimeout(hideNotification, 5000);
    });
}

function showNotification(message, type = 'info') {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    // تعيين الرسالة والنوع
    toastMessage.textContent = message;
    toast.className = `notification-toast show ${type}`;
    
    // تشغيل الحدث
    window.dispatchEvent(new Event('notification'));
    
    // تسجيل في الكونسول
    console.log(`📢 إشعار: ${message}`);
}

function hideNotification() {
    const toast = document.getElementById('notificationToast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// 12. نظام الوصول للكتاب (Token Verification)
function initBookAccess() {
    // التحقق من التوكن في localStorage أو URL
    const token = getAccessToken();
    
    if (token) {
        verifyToken(token);
    } else {
        // إذا لم يكن هناك توكن، تحويل إلى الصفحة الرئيسية
        if (window.location.pathname.includes('book.html')) {
            window.location.href = 'index.html';
        }
    }
}

function getAccessToken() {
    // التحقق من URL أولاً
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
        // حفظ التوكن في localStorage
        localStorage.setItem('book_access_token', urlToken);
        
        // إزالة التوكن من URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return urlToken;
    }
    
    // التحقق من localStorage
    return localStorage.getItem('book_access_token');
}

async function verifyToken(token) {
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (data.access) {
            // السماح بالوصول للكتاب
            document.body.classList.remove('access-denied');
            document.body.classList.add('access-granted');
            
            // تحميل محتوى الكتاب
            loadBookContent();
        } else {
            // رفض الوصول
            handleAccessDenied();
        }
    } catch (error) {
        console.error('خطأ في التحقق من التوكن:', error);
        handleAccessDenied();
    }
}

function handleAccessDenied() {
    document.body.innerHTML = `
        <div class="access-denied">
            <div class="denied-content">
                <i class="fas fa-lock"></i>
                <h2>الوصول مرفوع</h2>
                <p>يجب شراء الكتاب للوصول إلى المحتوى</p>
                <a href="index.html#purchase" class="btn-primary">شراء الكتاب الآن</a>
            </div>
        </div>
    `;
}

// 13. وظائف مساعدة
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

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

// 14. إعدادات Payhip Webhook
const PAYHIP_CONFIG = {
    productId: 'your-product-id',
    webhookSecret: process.env.PAYHIP_WEBHOOK_SECRET,
    successUrl: 'https://your-domain.com/book.html',
    cancelUrl: 'https://your-domain.com/index.html#purchase'
};

// 15. Firebase Configuration
const FIREBASE_CONFIG = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// 16. تهيئة Firebase (للإدارة فقط)
function initializeFirebase() {
    if (typeof firebase === 'undefined') return;
    
    // تهيئة Firebase
    firebase.initializeApp(FIREBASE_CONFIG);
    
    // الحصول على مرجع قاعدة البيانات
    const database = firebase.database();
    
    return database;
}

// 17. توليد التوكن
function generateAccessToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return token;
}

// 18. معالجة Webhook من Payhip
async function handlePayhipWebhook(payload, signature) {
    // التحقق من التوقيع
    if (!verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature');
    }
    
    // التحقق من حالة الطلب
    if (payload.status !== 'success') {
        throw new Error('Payment not successful');
    }
    
    // توليد توكن وصول
    const accessToken = generateAccessToken();
    
    // حفظ التوكن في Firebase
    await saveTokenToFirebase(accessToken, payload);
    
    // إرسال بريد إلكتروني بالمعلومات
    await sendAccessEmail(payload.email, accessToken);
    
    return accessToken;
}

// 19. التحقق من توقيع Webhook
function verifyWebhookSignature(payload, signature) {
    // يجب تنفيذ التحقق حسب وثائق Payhip
    // هذا مثال مبسط
    const computedSignature = crypto
        .createHmac('sha256', PAYHIP_CONFIG.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return computedSignature === signature;
}

// 20. حفظ التوكن في Firebase
async function saveTokenToFirebase(token, orderData) {
    try {
        const database = initializeFirebase();
        
        await database.ref(`access_tokens/${token}`).set({
            email: orderData.email,
            product_id: orderData.product_id,
            order_id: orderData.order_id,
            created_at: firebase.database.ServerValue.TIMESTAMP,
            active: true,
            expires_at: Date.now() + (365 * 24 * 60 * 60 * 1000) // سنة واحدة
        });
        
        console.log('✅ تم حفظ التوكن في Firebase');
    } catch (error) {
        console.error('❌ خطأ في حفظ التوكن:', error);
        throw error;
    }
}

// 21. إرسال بريد الوصول
async function sendAccessEmail(email, token) {
    const accessUrl = `${PAYHIP_CONFIG.successUrl}?token=${token}`;
    
    // هنا يمكن استخدام خدمة مثل SendGrid أو EmailJS
    console.log(`📧 إرسال بريد إلى: ${email}`);
    console.log(`🔗 رابط الوصول: ${accessUrl}`);
    
    // في الإصدار الحقيقي، هنا يتم إرسال البريد فعلياً
    return true;
}

// 22. تصدير الدوال للاستخدام في وحدات أخرى
window.BookApp = {
    showNotification,
    hideNotification,
    formatCurrency,
    generateAccessToken,
    handlePayhipWebhook,
    verifyToken,
    initBookAccess
};

// 23. تهيئة التحقق من الوصول (لصفحة الكتاب فقط)
if (window.location.pathname.includes('book.html')) {
    initBookAccess();
}