// حالة التطبيق الرئيسية
const BookApp = {
    currentPage: 1,
    totalPages: 1,
    currentChapter: 0,
    fontSize: 16,
    isEnglish: false,
    isDarkMode: false,
    
    init: function() {
        this.setupEventListeners();
        this.loadBookContent();
        this.updateUI();
        this.setInitialTheme();
        this.calculateTotalPages();
    },
    
    setupEventListeners: function() {
        // تبديل الوضع
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // تبديل اللغة
        document.getElementById('langToggle').addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // الفهرس
        document.getElementById('tocToggle').addEventListener('click', () => {
            document.getElementById('tocSidebar').classList.add('active');
        });
        
        document.getElementById('tocClose').addEventListener('click', () => {
            document.getElementById('tocSidebar').classList.remove('active');
        });
        
        // التنقل بين الصفحات
        document.getElementById('nextPage').addEventListener('click', () => {
            this.nextPage();
        });
        
        document.getElementById('prevPage').addEventListener('click', () => {
            this.prevPage();
        });
        
        document.getElementById('nextChapter').addEventListener('click', () => {
            this.nextChapter();
        });
        
        document.getElementById('prevChapter').addEventListener('click', () => {
            this.prevChapter();
        });
        
        // تغيير حجم الخط
        document.getElementById('fontIncrease').addEventListener('click', () => {
            this.changeFontSize(1);
        });
        
        document.getElementById('fontDecrease').addEventListener('click', () => {
            this.changeFontSize(-1);
        });
        
        // بدء القراءة
        document.getElementById('startReadingBtn').addEventListener('click', () => {
            this.scrollToContent();
        });
        
        // شراء الكتاب
        document.getElementById('buyBookBtn').addEventListener('click', () => {
            this.handlePurchase();
        });
        
        // إغلاق الفهرس بالنقر خارجيه
        document.addEventListener('click', (e) => {
            const toc = document.getElementById('tocSidebar');
            const tocToggle = document.getElementById('tocToggle');
            if (toc.classList.contains('active') && 
                !toc.contains(e.target) && 
                !tocToggle.contains(e.target)) {
                toc.classList.remove('active');
            }
        });
    },
    
    toggleTheme: function() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        document.body.classList.toggle('light-mode', !this.isDarkMode);
        localStorage.setItem('book-theme', this.isDarkMode ? 'dark' : 'light');
    },
    
    toggleLanguage: function() {
        this.isEnglish = !this.isEnglish;
        this.updateLanguage();
        localStorage.setItem('book-language', this.isEnglish ? 'en' : 'ar');
    },
    
    setInitialTheme: function() {
        const savedTheme = localStorage.getItem('book-theme') || 'light';
        const savedLang = localStorage.getItem('book-language') || 'ar';
        
        this.isDarkMode = savedTheme === 'dark';
        this.isEnglish = savedLang === 'en';
        
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        document.body.classList.toggle('light-mode', !this.isDarkMode);
        
        this.updateLanguage();
    },
    
    updateLanguage: function() {
        const langBtn = document.getElementById('langToggle');
        const bookTitle = document.getElementById('bookTitle');
        const bookSubtitle = document.getElementById('bookSubtitle');
        const startReadingBtn = document.getElementById('startReadingBtn');
        
        if (this.isEnglish) {
            // تغيير اتجاه النص
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';
            
            // تحديث النصوص
            langBtn.querySelector('.lang-text').textContent = 'AR';
            bookTitle.textContent = 'The Practical Path to $1000 Monthly';
            bookSubtitle.textContent = 'A Master Guide to Sustainable Digital Income';
            startReadingBtn.innerHTML = '<i class="bi bi-book me-2"></i> Start Reading Now';
            
            // تحديث عناصر التحكم
            document.getElementById('prevPage').innerHTML = 'Previous <i class="bi bi-chevron-left"></i>';
            document.getElementById('nextPage').innerHTML = '<i class="bi bi-chevron-right"></i> Next';
            document.getElementById('prevChapter').innerHTML = 'Previous Chapter <i class="bi bi-arrow-left-short"></i>';
            document.getElementById('nextChapter').innerHTML = '<i class="bi bi-arrow-right-short"></i> Next Chapter';
        } else {
            // العودة للعربية
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
            
            // تحديث النصوص
            langBtn.querySelector('.lang-text').textContent = 'EN';
            bookTitle.textContent = 'الطريق العملي إلى 1000$ شهريًا';
            bookSubtitle.textContent = 'دليل المتقنين للدخل الرقمي المستدام';
            startReadingBtn.innerHTML = '<i class="bi bi-book me-2"></i> ابدأ القراءة الآن';
            
            // تحديث عناصر التحكم
            document.getElementById('prevPage').innerHTML = '<i class="bi bi-chevron-right"></i> السابقة';
            document.getElementById('nextPage').innerHTML = 'التالية <i class="bi bi-chevron-left"></i>';
            document.getElementById('prevChapter').innerHTML = '<i class="bi bi-arrow-right-short"></i> الفصل السابق';
            document.getElementById('nextChapter').innerHTML = 'الفصل التالي <i class="bi bi-arrow-left-short"></i>';
        }
        
        this.loadBookContent();
    },
    
    loadBookContent: function() {
        const contentDiv = document.getElementById('bookContent');
        const tocDiv = document.getElementById('tocContent');
        
        // مسح المحتوى الحالي
        contentDiv.innerHTML = '';
        tocDiv.innerHTML = '';
        
        // الحصول على المحتوى المناسب للغة
        const bookData = this.isEnglish ? englishBookContent : arabicBookContent;
        
        // بناء الفهرس
        bookData.forEach((chapter, index) => {
            const tocItem = document.createElement('div');
            tocItem.className = 'toc-item';
            tocItem.textContent = `${index + 1}. ${chapter.title}`;
            tocItem.dataset.chapter = index;
            tocItem.addEventListener('click', () => {
                this.goToChapter(index);
                document.getElementById('tocSidebar').classList.remove('active');
            });
            tocDiv.appendChild(tocItem);
        });
        
        // بناء محتوى الكتاب
        bookData.forEach((chapter, chapterIndex) => {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'chapter';
            chapterDiv.id = `chapter-${chapterIndex}`;
            
            const title = document.createElement('h2');
            title.className = 'chapter-title';
            title.textContent = `الفصل ${chapterIndex + 1}: ${chapter.title}`;
            chapterDiv.appendChild(title);
            
            chapter.content.forEach(section => {
                if (section.type === 'paragraph') {
                    const p = document.createElement('p');
                    p.textContent = section.text;
                    chapterDiv.appendChild(p);
                } else if (section.type === 'subtitle') {
                    const h3 = document.createElement('h3');
                    h3.className = 'section-title';
                    h3.textContent = section.text;
                    chapterDiv.appendChild(h3);
                } else if (section.type === 'list') {
                    const ul = document.createElement('ul');
                    ul.className = 'mb-4';
                    section.items.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        ul.appendChild(li);
                    });
                    chapterDiv.appendChild(ul);
                } else if (section.type === 'quote') {
                    const blockquote = document.createElement('blockquote');
                    blockquote.className = 'blockquote p-3 border-start border-3 border-primary';
                    blockquote.innerHTML = `<p>${section.text}</p>`;
                    if (section.author) {
                        blockquote.innerHTML += `<footer class="blockquote-footer mt-2">${section.author}</footer>`;
                    }
                    chapterDiv.appendChild(blockquote);
                }
            });
            
            contentDiv.appendChild(chapterDiv);
        });
        
        this.calculateTotalPages();
        this.updatePageNavigation();
    },
    
    calculateTotalPages: function() {
        const content = document.querySelector('.book-content');
        const pageHeight = 700; // ارتفاع الصفحة التقريبي بالبكسل
        this.totalPages = Math.ceil(content.scrollHeight / pageHeight);
        document.getElementById('totalPages').textContent = this.totalPages;
    },
    
    nextPage: function() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePageNavigation();
            this.scrollToCurrentPage();
        }
    },
    
    prevPage: function() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePageNavigation();
            this.scrollToCurrentPage();
        }
    },
    
    nextChapter: function() {
        const chapters = document.querySelectorAll('.chapter');
        if (this.currentChapter < chapters.length - 1) {
            this.currentChapter++;
            this.goToChapter(this.currentChapter);
        }
    },
    
    prevChapter: function() {
        if (this.currentChapter > 0) {
            this.currentChapter--;
            this.goToChapter(this.currentChapter);
        }
    },
    
    goToChapter: function(chapterIndex) {
        this.currentChapter = chapterIndex;
        const chapter = document.getElementById(`chapter-${chapterIndex}`);
        if (chapter) {
            chapter.scrollIntoView({ behavior: 'smooth' });
            this.updateActiveTocItem();
            this.updatePageNavigation();
        }
    },
    
    updatePageNavigation: function() {
        document.getElementById('currentPage').textContent = this.currentPage;
        
        const progress = (this.currentPage / this.totalPages) * 100;
        document.getElementById('readingProgress').style.width = `${progress}%`;
        
        // تحديث العنصر النشط في الفهرس
        this.updateActiveTocItem();
    },
    
    updateActiveTocItem: function() {
        document.querySelectorAll('.toc-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.toc-item[data-chapter="${this.currentChapter}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    },
    
    scrollToCurrentPage: function() {
        const pageHeight = window.innerHeight;
        const scrollPosition = (this.currentPage - 1) * pageHeight;
        window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    },
    
    scrollToContent: function() {
        document.getElementById('bookReader').scrollIntoView({ 
            behavior: 'smooth' 
        });
    },
    
    changeFontSize: function(delta) {
        this.fontSize = Math.min(Math.max(12, this.fontSize + delta), 24);
        document.querySelector('.book-content').style.fontSize = `${this.fontSize}px`;
        this.calculateTotalPages();
    },
    
    handlePurchase: function() {
        alert(this.isEnglish ? 
            'Redirecting to secure checkout for $19...' : 
            'جاري التوجيه إلى الدفع الآمن مقابل 19$...');
        // هنا يمكن إضافة منطق الدفع الفعلي
    },
    
    updateUI: function() {
        // تحديث أي عناصر واجهة إضافية
    }
};

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    BookApp.init();
});