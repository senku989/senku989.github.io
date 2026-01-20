// ==============================================
// تطبيق الكتاب الإلكتروني الرئيسي
// ==============================================

class BookApp {
    constructor() {
        this.currentChapter = 0;
        this.currentPage = 1;
        this.fontSize = 16;
        this.isDarkMode = false;
        this.isFullscreen = false;
        this.bookmarks = [];
        this.userId = null;
        this.hasPaid = false;
        this.isPreview = false;
        
        // محتوى الكتاب
        this.bookData = arabicBookContent; // من book-content.js
    }
    
    async init(config) {
        this.userId = config.userId;
        this.hasPaid = config.hasPaid;
        this.isPreview = config.isPreview;
        
        // إذا كان عرض تجريبي ولم يدفع، نعرض فصول محدودة
        if (this.isPreview && !this.hasPaid) {
            this.bookData = this.getPreviewContent();
        }
        
        // إعداد واجهة المستخدم
        this.setupUI();
        this.setupEventListeners();
        this.loadChapter(0);
        this.renderTableOfContents();
        
        // تحميل التفضيلات المحفوظة
        this.loadPreferences();
        
        console.log('📚 تطبيق الكتاب جاهز:', {
            chapters: this.bookData.length,
            isPreview: this.isPreview,
            hasPaid: this.hasPaid
        });
    }
    
    // الحصول على محتوى العرض التجريبي
    getPreviewContent() {
        // عرض الفصل الأول فقط مع جزء من المحتوى
        const previewData = [this.bookData[0]];
        
        // تقليل محتوى الفصل الأول للعرض التجريبي
        previewData[0].content = previewData[0].content.slice(0, 3); // أول 3 أقسام فقط
        
        return previewData;
    }
    
    setupUI() {
        // تحديث معلومات الصفحات
        document.getElementById('totalPages').textContent = this.bookData.length;
        
        // تحديث حجم الخط
        this.updateFontSizeDisplay();
        
        // تطبيق الوضع الحالي
        this.applyDarkMode();
    }
    
    setupEventListeners() {
        // التنقل بين الفصول
        document.getElementById('prevChapterBtn').addEventListener('click', () => {
            this.prevChapter();
        });
        
        document.getElementById('nextChapterBtn').addEventListener('click', () => {
            this.nextChapter();
        });
        
        // التنقل بين الصفحات
        document.getElementById('prevPageBtn').addEventListener('click', () => {
            this.prevPage();
        });
        
        document.getElementById('nextPageBtn').addEventListener('click', () => {
            this.nextPage();
        });
        
        // تغيير حجم الخط
        document.getElementById('fontDecrease').addEventListener('click', () => {
            this.changeFontSize(-1);
        });
        
        document.getElementById('fontIncrease').addEventListener('click', () => {
            this.changeFontSize(1);
        });
        
        // الوضع الداكن
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });
        
        // ملء الشاشة
        document.getElementById('fullscreenToggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // البحث
        document.getElementById('searchToggle').addEventListener('click', () => {
            this.showSearchModal();
        });
        
        document.getElementById('searchButton').addEventListener('click', () => {
            this.searchBook();
        });
        
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchBook();
            }
        });
        
        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // حفظ مكان القراءة عند التمرير
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.saveReadingPosition();
            }, 1000);
        });
    }
    
    loadChapter(chapterIndex) {
        if (chapterIndex < 0 || chapterIndex >= this.bookData.length) return;
        
        this.currentChapter = chapterIndex;
        const chapter = this.bookData[chapterIndex];
        
        // تحديث العنوان
        document.getElementById('currentChapterTitle').textContent = chapter.title;
        document.getElementById('chapterNumber').textContent = chapterIndex + 1;
        
        // عرض المحتوى
        this.renderChapterContent(chapter);
        
        // تحديث الفهرس النشط
        this.updateActiveTocItem();
        
        // تحديث شريط التقدم
        this.updateProgressBar();
        
        // حفظ مكان القراءة
        this.saveReadingPosition();
        
        // إضافة أنيميشن
        const contentDiv = document.getElementById('bookContent');
        contentDiv.style.opacity = '0';
        contentDiv.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            contentDiv.style.transition = 'all 0.5s ease';
            contentDiv.style.opacity = '1';
            contentDiv.style.transform = 'translateY(0)';
        }, 50);
    }
    
    renderChapterContent(chapter) {
        const contentDiv = document.getElementById('bookContent');
        let html = `<h1 class="chapter-main-title">${chapter.title}</h1>`;
        
        chapter.content.forEach((section, index) => {
            const sectionId = `section-${this.currentChapter}-${index}`;
            
            switch(section.type) {
                case 'subtitle':
                    html += `<h2 id="${sectionId}" class="section-subtitle">${section.text}</h2>`;
                    break;
                    
                case 'paragraph':
                    html += `<p id="${sectionId}" class="section-paragraph">${section.text}</p>`;
                    break;
                    
                case 'list':
                    html += `<div id="${sectionId}" class="section-list">
                        <ul>${section.items.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>`;
                    break;
                    
                case 'quote':
                    html += `<blockquote id="${sectionId}" class="section-quote">
                        <p>${section.text}</p>
                        ${section.author ? `<footer>${section.author}</footer>` : ''}
                    </blockquote>`;
                    break;
            }
        });
        
        contentDiv.innerHTML = html;
        
        // تطبيق حجم الخط الحالي
        contentDiv.style.fontSize = `${this.fontSize}px`;
    }
    
    renderTableOfContents() {
        const tocDiv = document.getElementById('tableOfContents');
        let html = '';
        
        this.bookData.forEach((chapter, index) => {
            html += `
                <div class="toc-item ${index === this.currentChapter ? 'active' : ''}" 
                     data-chapter="${index}" 
                     onclick="bookApp.loadChapter(${index})">
                    <div class="toc-item-number">${index + 1}</div>
                    <div class="toc-item-title">${chapter.title}</div>
                    ${this.isPreview && !this.hasPaid && index > 0 ? 
                      '<span class="toc-lock"><i class="bi bi-lock"></i></span>' : ''}
                </div>
            `;
        });
        
        tocDiv.innerHTML = html;
    }
    
    updateActiveTocItem() {
        const items = document.querySelectorAll('.toc-item');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentChapter);
        });
    }
    
    updateProgressBar() {
        const progress = ((this.currentChapter + 1) / this.bookData.length) * 100;
        document.getElementById('readingProgressBar').style.width = `${progress}%`;
    }
    
    prevChapter() {
        if (this.currentChapter > 0) {
            this.loadChapter(this.currentChapter - 1);
        } else {
            this.showNotification('هذا هو الفصل الأول', 'info');
        }
    }
    
    nextChapter() {
        if (this.currentChapter < this.bookData.length - 1) {
            // التحقق إذا كان الفصل التالي متاحاً للعرض التجريبي
            if (this.isPreview && !this.hasPaid && this.currentChapter >= 0) {
                this.showPurchasePrompt();
                return;
            }
            this.loadChapter(this.currentChapter + 1);
        } else {
            this.showNotification('هذا هو الفصل الأخير', 'info');
        }
    }
    
    prevPage() {
        // محاكاة صفحات داخل الفصل
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePageInfo();
            this.scrollToTop();
        }
    }
    
    nextPage() {
        // محاكاة صفحات داخل الفصل
        const pagesPerChapter = Math.ceil(this.bookData[this.currentChapter].content.length / 3);
        if (this.currentPage < pagesPerChapter) {
            this.currentPage++;
            this.updatePageInfo();
            this.scrollToTop();
        } else {
            this.nextChapter();
        }
    }
    
    updatePageInfo() {
        const pagesPerChapter = Math.ceil(this.bookData[this.currentChapter].content.length / 3);
        document.getElementById('currentPage').textContent = this.currentPage;
        
        // حساب وقت القراءة
        const wordsPerPage = 250;
        const readingSpeed = 200; // كلمة في الدقيقة
        const estimatedMinutes = Math.ceil((pagesPerChapter * wordsPerPage) / readingSpeed);
        document.getElementById('readingTime').textContent = `قراءة ${estimatedMinutes} دقائق`;
    }
    
    changeFontSize(delta) {
        this.fontSize = Math.max(12, Math.min(24, this.fontSize + delta));
        document.getElementById('bookContent').style.fontSize = `${this.fontSize}px`;
        this.updateFontSizeDisplay();
        this.savePreferences();
    }
    
    updateFontSizeDisplay() {
        document.getElementById('fontSizeDisplay').textContent = `${this.fontSize}px`;
    }
    
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        this.applyDarkMode();
        this.savePreferences();
    }
    
    applyDarkMode() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.querySelector('#themeToggle i').className = 'bi bi-sun';
        } else {
            document.body.classList.remove('dark-mode');
            document.querySelector('#themeToggle i').className = 'bi bi-moon';
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            this.isFullscreen = true;
            document.querySelector('#fullscreenToggle i').className = 'bi bi-fullscreen-exit';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.isFullscreen = false;
                document.querySelector('#fullscreenToggle i').className = 'bi bi-arrows-fullscreen';
            }
        }
    }
    
    showSearchModal() {
        const modal = new bootstrap.Modal(document.getElementById('searchModal'));
        modal.show();
    }
    
    searchBook() {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;
        
        const results = [];
        
        this.bookData.forEach((chapter, chapterIndex) => {
            chapter.content.forEach((section, sectionIndex) => {
                let text = '';
                if (section.type === 'paragraph') {
                    text = section.text;
                } else if (section.type === 'list') {
                    text = section.items.join(' ');
                } else if (section.type === 'subtitle') {
                    text = section.text;
                }
                
                if (text.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        chapterIndex,
                        chapterTitle: chapter.title,
                        sectionIndex,
                        preview: this.highlightText(text, query),
                        type: section.type
                    });
                }
            });
        });
        
        this.displaySearchResults(results);
    }
    
    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    displaySearchResults(results) {
        const resultsDiv = document.getElementById('searchResults');
        
        if (results.length === 0) {
            resultsDiv.innerHTML = '<p class="text-muted text-center">لم يتم العثور على نتائج</p>';
            return;
        }
        
        let html = '<div class="search-results-list">';
        results.slice(0, 10).forEach(result => {
            html += `
                <div class="search-result-item" onclick="bookApp.goToSection(${result.chapterIndex}, ${result.sectionIndex})">
                    <h6>${result.chapterTitle}</h6>
                    <p class="result-preview">${result.preview.substring(0, 150)}...</p>
                </div>
            `;
        });
        html += '</div>';
        
        resultsDiv.innerHTML = html;
    }
    
    goToSection(chapterIndex, sectionIndex) {
        this.loadChapter(chapterIndex);
        
        // التمرير إلى القسم المحدد
        setTimeout(() => {
            const sectionId = `section-${chapterIndex}-${sectionIndex}`;
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight-section');
                setTimeout(() => {
                    element.classList.remove('highlight-section');
                }, 2000);
            }
            
            // إغلاق modal البحث
            bootstrap.Modal.getInstance(document.getElementById('searchModal')).hide();
        }, 500);
    }
    
    handleKeyboardShortcuts(e) {
        // تجاهل الاختصارات إذا كان المستخدم يكتب في حقل نصي
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                this.nextPage();
                break;
                
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.prevPage();
                break;
                
            case 'd':
            case 'D':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.toggleDarkMode();
                }
                break;
                
            case 'f':
            case 'F':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.toggleFullscreen();
                }
                break;
                
            case ' ':
                e.preventDefault();
                this.nextPage();
                break;
        }
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    saveReadingPosition() {
        if (!this.userId) return;
        
        const readingPosition = {
            chapter: this.currentChapter,
            page: this.currentPage,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`book_progress_${this.userId}`, JSON.stringify(readingPosition));
    }
    
    loadReadingPosition() {
        if (!this.userId) return;
        
        const saved = localStorage.getItem(`book_progress_${this.userId}`);
        if (saved) {
            const position = JSON.parse(saved);
            this.currentChapter = position.chapter || 0;
            this.currentPage = position.page || 1;
        }
    }
    
    savePreferences() {
        const preferences = {
            fontSize: this.fontSize,
            darkMode: this.isDarkMode
        };
        
        localStorage.setItem('book_preferences', JSON.stringify(preferences));
    }
    
    loadPreferences() {
        const saved = localStorage.getItem('book_preferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            this.fontSize = preferences.fontSize || 16;
            this.isDarkMode = preferences.darkMode || false;
            
            // تطبيق التفضيلات
            document.getElementById('bookContent').style.fontSize = `${this.fontSize}px`;
            this.updateFontSizeDisplay();
            this.applyDarkMode();
        }
    }
    
    showPurchasePrompt() {
        const modalHTML = `
            <div class="modal fade" id="purchaseModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">ترقية إلى النسخة الكاملة</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <i class="bi bi-lock" style="font-size: 3rem; color: #ffc107;"></i>
                            <h4 class="my-3">الوصول مقيد</h4>
                            <p>أنت تشاهد النسخة التجريبية المجانية. لقراءة الفصول المتبقية (أكثر من 70 صفحة متقدمة)، يرجى ترقية حسابك.</p>
                            <div class="price-display my-4">
                                <span class="original-price">39$</span>
                                <span class="current-price">19$</span>
                                <span class="discount-badge">خصم 50%</span>
                            </div>
                            <button class="btn btn-primary btn-lg w-100" onclick="window.location.href='purchase.html'">
                                <i class="bi bi-bag-check"></i> ترقية الآن بـ 19$
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الـ modal إلى الصفحة
        if (!document.getElementById('purchaseModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // عرض الـ modal
        const modal = new bootstrap.Modal(document.getElementById('purchaseModal'));
        modal.show();
    }
    
    showNotification(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // إضافة الأنماط
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        // إضافة للإشعار
        document.body.appendChild(notification);
        
        // إزالة الإشعار تلقائياً بعد 3 ثوان
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.parentNode.removeChild(notification);
                }, 300);
            }
        }, 3000);
    }
}

// إنشاء نسخة عالمية من التطبيق
const bookApp = new BookApp();
window.bookApp = bookApp;