// نظام المصادقة البسيط باستخدام localStorage
class AuthSystem {
    static register(name, email, password) {
        // التحقق من المدخلات
        if (!name || !email || !password) {
            throw new Error('جميع الحقول مطلوبة');
        }
        
        if (!this.validateEmail(email)) {
            throw new Error('البريد الإلكتروني غير صالح');
        }
        
        if (password.length < 6) {
            throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        }
        
        // التحقق من عدم وجود مستخدم بنفس البريد
        const users = JSON.parse(localStorage.getItem('book_users')) || [];
        const existingUser = users.find(user => user.email === email);
        
        if (existingUser) {
            throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
        }
        
        // إنشاء المستخدم الجديد
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password, // في تطبيق حقيقي، يجب تشفير كلمة المرور
            hasPaid: false,
            registeredAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('book_users', JSON.stringify(users));
        
        // تسجيل دخول تلقائي
        this.login(email, password);
        
        return newUser;
    }
    
    static login(email, password) {
        const users = JSON.parse(localStorage.getItem('book_users')) || [];
        const user = users.find(user => user.email === email && user.password === password);
        
        if (!user) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        
        // حفظ حالة تسجيل الدخول
        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            hasPaid: user.hasPaid
        };
        
        localStorage.setItem('book_user', JSON.stringify(sessionUser));
        
        return sessionUser;
    }
    
    static logout() {
        localStorage.removeItem('book_user');
    }
    
    static currentUser() {
        return JSON.parse(localStorage.getItem('book_user'));
    }
    
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static processPayment(userId) {
        const users = JSON.parse(localStorage.getItem('book_users')) || [];
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            throw new Error('المستخدم غير موجود');
        }
        
        // تحديث حالة الدفع
        users[userIndex].hasPaid = true;
        localStorage.setItem('book_users', JSON.stringify(users));
        
        // تحديث الجلسة الحالية
        const currentUser = this.currentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.hasPaid = true;
            localStorage.setItem('book_user', JSON.stringify(currentUser));
        }
        
        return true;
    }
}

// نظام عرض الكتاب
class BookApp {
    constructor() {
        this.currentChapter = 0;
        this.currentPage = 1;
        this.totalPages = 70;
        this.fontSize = 16;
        this.isDarkMode = false;
        this.isPreview = false;
    }
    
    init(bookData, isPreview = false) {
        this.bookData = bookData;
        this.isPreview = isPreview;
        
        this.setupEventListeners();
        this.renderTableOfContents();
        this.loadChapter(0);
        this.updateUI();
        
        // تطبيق الوضع الحالي
        const savedDarkMode = localStorage.getItem('book_dark_mode') === 'true';
        if (savedDarkMode) {
            this.toggleDarkMode();
        }
        
        // تطبيق حجم الخط المحفوظ
        const savedFontSize = localStorage.getItem('book_font_size');
        if (savedFontSize) {
            this.fontSize = parseInt(savedFontSize);
            this.applyFontSize();
        }
    }
    
    setupEventListeners() {
        // أزرار التنقل بين الفصول
        document.getElementById('prevChapter').addEventListener('click', () => {
            if (this.currentChapter > 0) {
                this.currentChapter--;
                this.loadChapter(this.currentChapter);
            }
        });
        
        document.getElementById('nextChapter').addEventListener('click', () => {
            if (this.currentChapter < this.bookData.length - 1) {
                this.currentChapter++;
                this.loadChapter(this.currentChapter);
            }
        });
        
        // تغيير حجم الخط
        document.getElementById('fontDecrease').addEventListener('click', () => {
            this.changeFontSize(-1);
        });
        
        document.getElementById('fontIncrease').addEventListener('click', () => {
            this.changeFontSize(1);
        });
        
        document.getElementById('fontReset').addEventListener('click', () => {
            this.resetFontSize();
        });
        
        // الوضع الداكن
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.toggleDarkMode(e.target.checked);
        });
        
        // النقر على عناوين الفهرس
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chapter-link')) {
                e.preventDefault();
                const chapterIndex = parseInt(e.target.dataset.chapter);
                this.currentChapter = chapterIndex;
                this.loadChapter(chapterIndex);
            }
        });
    }
    
    renderTableOfContents() {
        const tocContainer = document.getElementById('tableOfContents');
        if (!tocContainer) return;
        
        tocContainer.innerHTML = '';
        
        this.bookData.forEach((chapter, index) => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'chapter-link';
            link.dataset.chapter = index;
            link.textContent = `${index + 1}. ${chapter.title}`;
            
            if (index === this.currentChapter) {
                link.classList.add('active');
            }
            
            tocContainer.appendChild(link);
        });
    }
    
    loadChapter(chapterIndex) {
        this.currentChapter = chapterIndex;
        const chapter = this.bookData[chapterIndex];
        
        if (!chapter) return;
        
        // تحديث عنوان الفصل
        document.getElementById('currentChapterTitle').textContent = chapter.title;
        
        // عرض محتوى الفصل
        const contentContainer = document.getElementById('bookContent');
        contentContainer.innerHTML = this.renderChapterContent(chapter);
        
        // تحديث الفهرس
        this.updateTocActiveItem();
        
        // تحديث واجهة المستخدم
        this.updateUI();
    }
    
    renderChapterContent(chapter) {
        let html = `<h1>${chapter.title}</h1>`;
        
        chapter.content.forEach(section => {
            switch (section.type) {
                case 'paragraph':
                    html += `<p>${section.text}</p>`;
                    break;
                case 'subtitle':
                    html += `<h2>${section.text}</h2>`;
                    break;
                case 'list':
                    html += `<ul>`;
                    section.items.forEach(item => {
                        html += `<li>${item}</li>`;
                    });
                    html += `</ul>`;
                    break;
                case 'quote':
                    html += `<blockquote>${section.text}`;
                    if (section.author) {
                        html += `<footer>${section.author}</footer>`;
                    }
                    html += `</blockquote>`;
                    break;
            }
        });
        
        return html;
    }
    
    updateTocActiveItem() {
        const links = document.querySelectorAll('.chapter-link');
        links.forEach((link, index) => {
            link.classList.toggle('active', index === this.currentChapter);
        });
    }
    
    updateUI() {
        // تحديث معلومات الصفحة
        const pageInfo = `صفحة ${this.currentChapter + 1} من ${this.bookData.length}`;
        document.getElementById('pageInfo').textContent = pageInfo;
        
        // تحديث تقدم القراءة
        const progress = ((this.currentChapter + 1) / this.bookData.length) * 100;
        document.getElementById('readingProgress').style.width = `${progress}%`;
        document.getElementById('progressPercent').textContent = `${Math.round(progress)}%`;
        
        // تحديث حالة الأزرار
        document.getElementById('prevChapter').disabled = this.currentChapter === 0;
        document.getElementById('nextChapter').disabled = this.currentChapter === this.bookData.length - 1;
    }
    
    changeFontSize(delta) {
        this.fontSize = Math.max(12, Math.min(24, this.fontSize + delta));
        this.applyFontSize();
        localStorage.setItem('book_font_size', this.fontSize);
    }
    
    resetFontSize() {
        this.fontSize = 16;
        this.applyFontSize();
        localStorage.setItem('book_font_size', this.fontSize);
    }
    
    applyFontSize() {
        document.getElementById('bookContent').style.fontSize = `${this.fontSize}px`;
    }
    
    toggleDarkMode(force = null) {
        this.isDarkMode = force !== null ? force : !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        document.getElementById('darkModeToggle').checked = this.isDarkMode;
        localStorage.setItem('book_dark_mode', this.isDarkMode);
    }
}

// تهيئة تطبيق الكتاب العالمي
window.BookApp = new BookApp();

// دوال لتسجيل الدخول والدفع (يتم استدعاؤها من login.html)
window.login = function() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const user = AuthSystem.login(email, password);
        showMessage('success', 'تم تسجيل الدخول بنجاح!');
        
        // التحويل إلى صفحة الكتاب بعد 1.5 ثانية
        setTimeout(() => {
            window.location.href = 'book.html';
        }, 1500);
    } catch (error) {
        showMessage('error', error.message);
    }
};

window.register = function() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!agreeTerms) {
        showMessage('error', 'يجب الموافقة على الشروط والأحكام');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('error', 'كلمة المرور غير متطابقة');
        return;
    }
    
    try {
        const user = AuthSystem.register(name, email, password);
        showMessage('success', 'تم إنشاء الحساب بنجاح!');
        
        // الانتقال إلى نموذج الدفع
        setTimeout(() => {
            showPaymentForm();
        }, 1500);
    } catch (error) {
        showMessage('error', error.message);
    }
};

window.processPayment = function() {
    const user = AuthSystem.currentUser();
    
    if (!user) {
        showMessage('error', 'يجب تسجيل الدخول أولاً');
        return;
    }
    
    // محاكاة عملية الدفع
    showMessage('info', 'جاري معالجة الدفع...');
    
    setTimeout(() => {
        try {
            AuthSystem.processPayment(user.id);
            showMessage('success', 'تم الدفع بنجاح! يمكنك الآن قراءة الكتاب كاملاً.');
            
            // التحويل إلى صفحة الكتاب بعد 2 ثانية
            setTimeout(() => {
                window.location.href = 'book.html';
            }, 2000);
        } catch (error) {
            showMessage('error', error.message);
        }
    }, 2000);
};

// دالة لعرض الرسائل
function showMessage(type, text) {
    const messageArea = document.getElementById('messageArea');
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    messageArea.innerHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // إزالة الرسالة تلقائياً بعد 5 ثوان
    setTimeout(() => {
        const alert = messageArea.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => {
                messageArea.innerHTML = '';
            }, 300);
        }
    }, 5000);
}

// دوال لتبديل النماذج (معرفة في login.html)
window.showLoginForm = function() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('paymentForm').style.display = 'none';
};

window.showRegisterForm = function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('paymentForm').style.display = 'none';
};

window.showPaymentForm = function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('paymentForm').style.display = 'block';
};