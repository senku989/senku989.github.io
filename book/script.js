// ==============================================
// التطبيق الرئيسي للكتاب الإلكتروني
// إصدار 2026 - أمجد الكلباني
// ==============================================

// حالة التطبيق الرئيسية
const BookApp = {
    // الحالة الحالية
    currentPage: 1,
    totalPages: 70,
    currentChapter: 0,
    fontSize: 16,
    isEnglish: false,
    isDarkMode: false,
    bookmarks: [],
    searchQuery: '',
    
    // تهيئة التطبيق
    init: function() {
        console.log('📚 تهيئة تطبيق الكتاب الإلكتروني...');
        
        // تحميل الحالة المحفوظة
        this.loadSavedState();
        
        // إعداد المستمعين للأحداث
        this.setupEventListeners();
        
        // تحميل محتوى الكتاب
        this.loadBookContent();
        
        // تحديث واجهة المستخدم
        this.updateUI();
        
        // إعداد الفهرس
        this.setupTableOfContents();
        
        // إعداد نظام البحث
        this.setupSearch();
        
        // إعداد الملاحق
        this.loadAppendices();
        
        console.log('✅ التطبيق جاهز للاستخدام');
    },
    
    // تحميل الحالة المحفوظة
    loadSavedState: function() {
        // تحميل الوضع
        const savedTheme = localStorage.getItem('book-theme') || 'light';
        this.isDarkMode = savedTheme === 'dark';
        
        // تحميل اللغة
        const savedLang = localStorage.getItem('book-language') || 'ar';
        this.isEnglish = savedLang === 'en';
        
        // تحميل حجم الخط
        const savedFontSize = localStorage.getItem('book-font-size');
        if (savedFontSize) {
            this.fontSize = parseInt(savedFontSize);
        }
        
        // تحميل الإشارات المرجعية
        const savedBookmarks = localStorage.getItem('book-bookmarks');
        if (savedBookmarks) {
            this.bookmarks = JSON.parse(savedBookmarks);
        }
        
        // تحميل الفصل الحالي
        const savedChapter = localStorage.getItem('book-current-chapter');
        if (savedChapter) {
            this.currentChapter = parseInt(savedChapter);
        }
        
        // تطبيق التحميلات
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        document.body.classList.toggle('light-mode', !this.isDarkMode);
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners: function() {
        console.log('🔧 إعداد مستمعي الأحداث...');
        
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
            this.showTableOfContents();
        });
        
        document.getElementById('tocClose').addEventListener('click', () => {
            this.hideTableOfContents();
        });
        
        // التنقل بين الصفحات
        document.getElementById('nextPage').addEventListener('click', () => {
            this.nextPage();
        });
        
        document.getElementById('prevPage').addEventListener('click', () => {
            this.prevPage();
        });
        
        // التنقل بين الفصول - تم إصلاحها
        document.getElementById('nextChapter').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('👉 الضغط على الفصل التالي');
            this.nextChapter();
        });
        
        document.getElementById('prevChapter').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('👈 الضغط على الفصل السابق');
            this.prevChapter();
        });
        
        // تغيير حجم الخط
        document.getElementById('fontIncrease').addEventListener('click', () => {
            this.changeFontSize(1);
        });
        
        document.getElementById('fontDecrease').addEventListener('click', () => {
            this.changeFontSize(-1);
        });
        
        document.getElementById('fontReset').addEventListener('click', () => {
            this.resetFontSize();
        });
        
        // بدء القراءة
        document.getElementById('startReadingBtn').addEventListener('click', () => {
            this.startReading();
        });
        
        // شراء الكتاب
        document.getElementById('buyBookBtn').addEventListener('click', () => {
            this.showPurchaseModal();
        });
        
        document.getElementById('confirmPurchase').addEventListener('click', () => {
            this.processPurchase();
        });
        
        // الإشارات المرجعية
        document.getElementById('bookmarkBtn').addEventListener('click', () => {
            this.toggleBookmark();
        });
        
        // الطباعة
        document.getElementById('printBtn').addEventListener('click', () => {
            this.printCurrentChapter();
        });
        
        // إغلاق الفهرس بالنقر خارجيه
        document.addEventListener('click', (e) => {
            const toc = document.getElementById('tocSidebar');
            const tocToggle = document.getElementById('tocToggle');
            if (toc.classList.contains('active') && 
                !toc.contains(e.target) && 
                !tocToggle.contains(e.target)) {
                this.hideTableOfContents();
            }
        });
        
        // إغلاق نتائج البحث
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container') && 
                !e.target.closest('#searchResults')) {
                this.hideSearchResults();
            }
        });
        
        // التعامل مع مفتاح ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTableOfContents();
                this.hideSearchResults();
            }
            
            // مفاتيح التنقل
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                if (this.isEnglish) {
                    this.prevPage();
                } else {
                    this.nextPage();
                }
                e.preventDefault();
            }
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                if (this.isEnglish) {
                    this.nextPage();
                } else {
                    this.prevPage();
                }
                e.preventDefault();
            }
        });
        
        // التمرير
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateReadingProgress();
            }, 100);
        });
    },
    
    // تبديل الوضع
    toggleTheme: function() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        document.body.classList.toggle('light-mode', !this.isDarkMode);
        localStorage.setItem('book-theme', this.isDarkMode ? 'dark' : 'light');
        
        // تحديث زر الوضع
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.setAttribute('title', this.isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن');
    },
    
    // تبديل اللغة
    toggleLanguage: function() {
        this.isEnglish = !this.isEnglish;
        this.updateLanguage();
        localStorage.setItem('book-language', this.isEnglish ? 'en' : 'ar');
    },
    
    // تحديث اللغة
    updateLanguage: function() {
        const langBtn = document.getElementById('langToggle');
        
        if (this.isEnglish) {
            // تغيير اتجاه النص
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';
            document.body.classList.add('english-text');
            document.body.classList.remove('arabic-text');
            
            // تحديث النصوص
            langBtn.querySelector('.lang-text').textContent = 'AR';
            langBtn.setAttribute('title', 'Switch to Arabic');
            
            document.getElementById('bookTitle').textContent = 'The Practical Path to $1000 Monthly';
            document.getElementById('bookSubtitle').textContent = 'A Master Guide to Sustainable Digital Income';
            
            document.getElementById('startReadingBtn').innerHTML = '<i class="bi bi-book me-2"></i> Start Reading Now';
            document.getElementById('buyBookBtn').innerHTML = '<i class="bi bi-cart3 me-2"></i> Buy Book ($19)';
            
            // تحديث عناصر التحكم
            document.getElementById('prevPage').innerHTML = 'Previous <i class="bi bi-chevron-left"></i>';
            document.getElementById('prevPage').setAttribute('title', 'Previous Page');
            document.getElementById('nextPage').innerHTML = '<i class="bi bi-chevron-right"></i> Next';
            document.getElementById('nextPage').setAttribute('title', 'Next Page');
            
            document.getElementById('prevChapter').innerHTML = '<i class="bi bi-arrow-left-short me-1"></i> Previous Chapter';
            document.getElementById('nextChapter').innerHTML = 'Next Chapter <i class="bi bi-arrow-right-short ms-1"></i>';
            
            document.getElementById('bookSearch').placeholder = 'Search in book...';
            document.getElementById('tocToggle').innerHTML = '<i class="bi bi-list"></i> <span class="d-none d-md-inline">Contents</span>';
            
            // تحديث الفوتر
            document.querySelector('.footer-title:nth-child(1)').textContent = 'About the Book';
            document.querySelector('.footer-title:nth-child(2)').textContent = 'Quick Links';
            document.querySelector('.footer-title:nth-child(3)').textContent = 'Contact the Author';
        } else {
            // العودة للعربية
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
            document.body.classList.add('arabic-text');
            document.body.classList.remove('english-text');
            
            // تحديث النصوص
            langBtn.querySelector('.lang-text').textContent = 'EN';
            langBtn.setAttribute('title', 'تبديل إلى الإنجليزية');
            
            document.getElementById('bookTitle').textContent = 'الطريق العملي إلى 1000$ شهريًا';
            document.getElementById('bookSubtitle').textContent = 'دليل المتقنين للدخل الرقمي المستدام';
            
            document.getElementById('startReadingBtn').innerHTML = '<i class="bi bi-book me-2"></i> ابدأ القراءة الآن';
            document.getElementById('buyBookBtn').innerHTML = '<i class="bi bi-cart3 me-2"></i> شراء الكتاب (19$)';
            
            // تحديث عناصر التحكم
            document.getElementById('prevPage').innerHTML = '<i class="bi bi-chevron-right"></i> السابقة';
            document.getElementById('prevPage').setAttribute('title', 'الصفحة السابقة');
            document.getElementById('nextPage').innerHTML = 'التالية <i class="bi bi-chevron-left"></i>';
            document.getElementById('nextPage').setAttribute('title', 'الصفحة التالية');
            
            document.getElementById('prevChapter').innerHTML = '<i class="bi bi-arrow-right-short me-1"></i> الفصل السابق';
            document.getElementById('nextChapter').innerHTML = 'الفصل التالي <i class="bi bi-arrow-left-short ms-1"></i>';
            
            document.getElementById('bookSearch').placeholder = 'بحث في الكتاب...';
            document.getElementById('tocToggle').innerHTML = '<i class="bi bi-list"></i> <span class="d-none d-md-inline">فهرس</span>';
            
            // تحديث الفوتر
            document.querySelector('.footer-title:nth-child(1)').textContent = 'عن الكتاب';
            document.querySelector('.footer-title:nth-child(2)').textContent = 'روابط سريعة';
            document.querySelector('.footer-title:nth-child(3)').textContent = 'تواصل مع المؤلف';
        }
        
        // إعادة تحميل المحتوى
        this.loadBookContent();
        this.setupTableOfContents();
        this.loadAppendices();
        this.updateActiveChapter();
    },
    
    // تحميل محتوى الكتاب
    loadBookContent: function() {
        const contentDiv = document.getElementById('bookContent');
        const bookData = this.isEnglish ? englishBookContent : arabicBookContent;
        
        // مسح المحتوى الحالي
        contentDiv.innerHTML = '';
        
        // بناء محتوى الكتاب
        bookData.forEach((chapter, chapterIndex) => {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'chapter';
            chapterDiv.id = `chapter-${chapterIndex}`;
            chapterDiv.dataset.chapter = chapterIndex;
            
            const title = document.createElement('h2');
            title.className = 'chapter-title';
            title.textContent = chapter.title;
            chapterDiv.appendChild(title);
            
            // إضافة محتوى الفصل
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
                    blockquote.className = 'blockquote p-4 mb-4 border-start border-4';
                    blockquote.innerHTML = `<p class="mb-2">${section.text}</p>`;
                    if (section.author) {
                        blockquote.innerHTML += `<footer class="blockquote-footer mt-2">${section.author}</footer>`;
                    }
                    chapterDiv.appendChild(blockquote);
                }
            });
            
            contentDiv.appendChild(chapterDiv);
        });
        
        // تطبيق حجم الخط الحالي
        this.applyFontSize();
        
        // تحديث عدد الصفحات
        this.calculateTotalPages();
    },
    
    // إعداد الفهرس
    setupTableOfContents: function() {
        const tocDiv = document.getElementById('tocContent');
        const bookData = this.isEnglish ? englishBookContent : arabicBookContent;
        
        // مسح الفهرس الحالي
        tocDiv.innerHTML = '';
        
        // بناء الفهرس
        bookData.forEach((chapter, index) => {
            const tocItem = document.createElement('div');
            tocItem.className = 'toc-item';
            tocItem.innerHTML = `
                <span class="toc-item-number">${index + 1}</span>
                <span class="toc-item-title">${chapter.title}</span>
            `;
            tocItem.dataset.chapter = index;
            
            tocItem.addEventListener('click', () => {
                this.goToChapter(index);
                this.hideTableOfContents();
            });
            
            tocDiv.appendChild(tocItem);
        });
    },
    
    // إعداد نظام البحث
    setupSearch: function() {
        const searchInput = document.getElementById('bookSearch');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.searchQuery = query;
            
            if (query.length >= 2) {
                this.searchBook(query);
            } else {
                this.hideSearchResults();
            }
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.searchQuery) {
                this.searchBook(this.searchQuery);
            }
        });
    },
    
    // البحث في الكتاب
    searchBook: function(query) {
        const bookData = this.isEnglish ? englishBookContent : arabicBookContent;
        const results = [];
        
        bookData.forEach((chapter, chapterIndex) => {
            let chapterText = '';
            chapter.content.forEach(section => {
                if (section.type === 'paragraph') {
                    chapterText += section.text + ' ';
                } else if (section.type === 'list') {
                    chapterText += section.items.join(' ') + ' ';
                } else if (section.type === 'subtitle') {
                    chapterText += section.text + ' ';
                }
            });
            
            if (chapterText.toLowerCase().includes(query.toLowerCase())) {
                // العثور على المطابقات داخل الفصل
                const regex = new RegExp(`(.{0,50}${query}.{0,50})`, 'gi');
                const matches = chapterText.match(regex);
                
                if (matches) {
                    matches.forEach(match => {
                        results.push({
                            chapterIndex,
                            chapterTitle: chapter.title,
                            preview: this.highlightText(match, query),
                            relevance: this.calculateRelevance(match, query)
                        });
                    });
                }
            }
        });
        
        // ترتيب النتائج حسب الأهمية
        results.sort((a, b) => b.relevance - a.relevance);
        
        this.displaySearchResults(results);
    },
    
    // حساب أهمية النتيجة
    calculateRelevance: function(text, query) {
        let relevance = 0;
        
        // زيادة الأهمية إذا كان الاستعلام في بداية النص
        if (text.toLowerCase().startsWith(query.toLowerCase())) {
            relevance += 10;
        }
        
        // زيادة الأهمية بناءً على تكرار الاستعلام
        const regex = new RegExp(query, 'gi');
        const matches = text.match(regex);
        if (matches) {
            relevance += matches.length * 5;
        }
        
        // تقليل الأهمية إذا كان النص طويلاً جداً
        relevance -= text.length / 100;
        
        return relevance;
    },
    
    // عرض نتائج البحث
    displaySearchResults: function(results) {
        const container = document.getElementById('searchResults');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    ${this.isEnglish ? 'No results found for "' + this.searchQuery + '"' : 
                                      'لم يتم العثور على نتائج لـ "' + this.searchQuery + '"'}
                </div>
            `;
            container.classList.remove('d-none');
            return;
        }
        
        let html = `
            <div class="search-results-header">
                <h5>${this.isEnglish ? 'Search Results' : 'نتائج البحث'} (${results.length})</h5>
                <small>${this.isEnglish ? 'Click on a result to go to the chapter' : 
                                         'انقر على نتيجة للذهاب إلى الفصل'}</small>
            </div>
        `;
        
        // عرض أفضل 10 نتائج فقط
        results.slice(0, 10).forEach(result => {
            html += `
                <div class="search-result-item" data-chapter="${result.chapterIndex}">
                    <h6>${result.chapterTitle}</h6>
                    <div class="result-preview">...${result.preview}...</div>
                    <button class="btn btn-sm btn-primary mt-2 goto-result">
                        ${this.isEnglish ? 'Go to chapter' : 'الذهاب إلى الفصل'}
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
        container.classList.remove('d-none');
        
        // إضافة مستمعي الأحداث للنتائج
        document.querySelectorAll('.goto-result').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chapterIndex = parseInt(e.target.closest('.search-result-item').dataset.chapter);
                this.goToChapter(chapterIndex);
                this.hideSearchResults();
            });
        });
    },
    
    // إخفاء نتائج البحث
    hideSearchResults: function() {
        const container = document.getElementById('searchResults');
        container.classList.add('d-none');
    },
    
    // تمييز النص في نتائج البحث
    highlightText: function(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    },
    
    // عرض الفهرس
    showTableOfContents: function() {
        document.getElementById('tocSidebar').classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    // إخفاء الفهرس
    hideTableOfContents: function() {
        document.getElementById('tocSidebar').classList.remove('active');
        document.body.style.overflow = '';
    },
    
    // تحديث تقدم القراءة
    updateReadingProgress: function() {
        const chapters = document.querySelectorAll('.chapter');
        const viewportHeight = window.innerHeight;
        let totalScroll = 0;
        let viewedScroll = 0;
        
        chapters.forEach(chapter => {
            const rect = chapter.getBoundingClientRect();
            const chapterHeight = rect.height;
            totalScroll += chapterHeight;
            
            if (rect.top < viewportHeight && rect.bottom > 0) {
                // الجزء المرئي من الفصل
                const visibleTop = Math.max(0, -rect.top);
                const visibleBottom = Math.min(chapterHeight, viewportHeight - rect.top);
                const visibleHeight = visibleBottom - visibleTop;
                viewedScroll += visibleHeight;
            } else if (rect.top < viewportHeight) {
                // الفصل بأكمله تمت رؤيته
                viewedScroll += chapterHeight;
            }
        });
        
        const progress = Math.min(100, Math.round((viewedScroll / totalScroll) * 100));
        
        document.getElementById('readingProgress').style.width = `${progress}%`;
        document.getElementById('progressPercentage').textContent = `${progress}%`;
        
        // تحديث الصفحة الحالية
        const scrollPosition = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollPosition / docHeight;
        this.currentPage = Math.ceil(scrollPercent * this.totalPages) || 1;
        
        this.updatePageNavigation();
    },
    
    // حساب عدد الصفحات
    calculateTotalPages: function() {
        // تقدير عدد الصفحات بناءً على المحتوى
        const content = document.querySelector('.book-content');
        const words = content.textContent.split(/\s+/).length;
        this.totalPages = Math.max(70, Math.ceil(words / 250)); // 250 كلمة لكل صفحة
        
        document.getElementById('totalPages').textContent = this.totalPages;
    },
    
    // الصفحة التالية
    nextPage: function() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.scrollToCurrentPage();
            this.updatePageNavigation();
        }
    },
    
    // الصفحة السابقة
    prevPage: function() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.scrollToCurrentPage();
            this.updatePageNavigation();
        }
    },
    
    // الفصل التالي - تم إصلاحها
    nextChapter: function() {
        console.log(`📖 الفصل الحالي: ${this.currentChapter}, إجمالي الفصول: ${this.isEnglish ? englishBookContent.length : arabicBookContent.length}`);
        
        const totalChapters = this.isEnglish ? englishBookContent.length : arabicBookContent.length;
        
        if (this.currentChapter < totalChapters - 1) {
            this.currentChapter++;
            console.log(`➡️ الذهاب إلى الفصل: ${this.currentChapter + 1}`);
            this.goToChapter(this.currentChapter);
        } else {
            console.log('⏹️ هذا هو الفصل الأخير');
            this.showNotification(this.isEnglish ? 
                'This is the last chapter' : 
                'هذا هو الفصل الأخير', 'info');
        }
    },
    
    // الفصل السابق - تم إصلاحها
    prevChapter: function() {
        console.log(`📖 الفصل الحالي: ${this.currentChapter}`);
        
        if (this.currentChapter > 0) {
            this.currentChapter--;
            console.log(`⬅️ الذهاب إلى الفصل: ${this.currentChapter + 1}`);
            this.goToChapter(this.currentChapter);
        } else {
            console.log('⏹️ هذا هو الفصل الأول');
            this.showNotification(this.isEnglish ? 
                'This is the first chapter' : 
                'هذا هو الفصل الأول', 'info');
        }
    },
    
    // الذهاب إلى فصل محدد
    goToChapter: function(chapterIndex) {
        console.log(`🎯 الذهاب إلى الفصل: ${chapterIndex + 1}`);
        
        const chapterElement = document.getElementById(`chapter-${chapterIndex}`);
        
        if (chapterElement) {
            // تحديث الفصل الحالي
            this.currentChapter = chapterIndex;
            localStorage.setItem('book-current-chapter', chapterIndex);
            
            // التمرير إلى الفصل
            chapterElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // تحديث واجهة المستخدم
            this.updateActiveChapter();
            this.updatePageNavigation();
            
            // إظهار إشعار
            const bookData = this.isEnglish ? englishBookContent : arabicBookContent;
            const chapterTitle = bookData[chapterIndex].title;
            this.showNotification(
                this.isEnglish ? 
                `Now reading: ${chapterTitle}` : 
                `جاري القراءة: ${chapterTitle}`,
                'success'
            );
        } else {
            console.error(`❌ لم يتم العثور على الفصل: chapter-${chapterIndex}`);
        }
    },
    
    // تحديث الفصل النشط
    updateActiveChapter: function() {
        // تحديث الفهرس
        document.querySelectorAll('.toc-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.toc-item[data-chapter="${this.currentChapter}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // تحديث رقم الفصل في واجهة المستخدم
        document.getElementById('currentChapter').textContent = this.currentChapter + 1;
    },
    
    // التمرير إلى الصفحة الحالية
    scrollToCurrentPage: function() {
        const scrollPosition = (this.currentPage - 1) * (window.innerHeight * 0.8);
        window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    },
    
    // تحديث تنقل الصفحات
    updatePageNavigation: function() {
        document.getElementById('currentPage').textContent = this.currentPage;
        
        const progress = Math.round((this.currentPage / this.totalPages) * 100);
        document.getElementById('readingProgress').style.width = `${progress}%`;
        document.getElementById('progressPercentage').textContent = `${progress}%`;
        
        // تحديث حالة الأزرار
        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= this.totalPages;
        
        const totalChapters = this.isEnglish ? englishBookContent.length : arabicBookContent.length;
        document.getElementById('prevChapter').disabled = this.currentChapter <= 0;
        document.getElementById('nextChapter').disabled = this.currentChapter >= totalChapters - 1;
        
        // تحديث العنوان النشط
        this.updateActiveChapter();
    },
    
    // بدء القراءة
    startReading: function() {
        document.getElementById('bookReader').scrollIntoView({ 
            behavior: 'smooth' 
        });
    },
    
    // تغيير حجم الخط
    changeFontSize: function(delta) {
        this.fontSize = Math.min(Math.max(12, this.fontSize + delta), 24);
        this.applyFontSize();
        localStorage.setItem('book-font-size', this.fontSize);
    },
    
    // إعادة ضبط حجم الخط
    resetFontSize: function() {
        this.fontSize = 16;
        this.applyFontSize();
        localStorage.setItem('book-font-size', this.fontSize);
    },
    
    // تطبيق حجم الخط
    applyFontSize: function() {
        document.querySelector('.book-content').style.fontSize = `${this.fontSize}px`;
        this.calculateTotalPages();
    },
    
    // تحميل الملاحق
    loadAppendices: function() {
        const appendices = this.isEnglish ? englishAppendices : arabicAppendices;
        const container = document.getElementById('appendicesList');
        
        container.innerHTML = '';
        
        appendices.forEach((appendix, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-4';
            col.innerHTML = `
                <div class="appendix-item">
                    <h4>${appendix.title}</h4>
                    <div class="appendix-content">${appendix.content}</div>
                    <div class="appendix-actions mt-3">
                        <button class="btn btn-sm btn-outline-primary download-appendix" data-index="${index}">
                            <i class="bi bi-download me-1"></i>
                            ${this.isEnglish ? 'Download' : 'تحميل'}
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
        
        // إضافة مستمعي الأحداث لأزرار التحميل
        document.querySelectorAll('.download-appendix').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.download-appendix').dataset.index;
                this.downloadAppendix(index);
            });
        });
    },
    
    // تنزيل الملحق
    downloadAppendix: function(index) {
        const appendix = this.isEnglish ? englishAppendices[index] : arabicAppendices[index];
        
        // في الإصدار الحقيقي، هنا يتم تنزيل ملف حقيقي
        this.showNotification(
            this.isEnglish ? 
            `Downloading: ${appendix.title}` : 
            `جاري تحميل: ${appendix.title}`,
            'info'
        );
    },
    
    // عرض نافذة الشراء
    showPurchaseModal: function() {
        const modal = new bootstrap.Modal(document.getElementById('purchaseModal'));
        modal.show();
    },
    
    // معالجة الشراء
    processPurchase: function() {
        this.showNotification(
            this.isEnglish ? 
            'Redirecting to secure payment...' : 
            'جاري التوجيه إلى الدفع الآمن...',
            'info'
        );
        
        // في الإصدار الحقيقي، هنا يتم توجيه المستخدم إلى صفحة الدفع
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
            modal.hide();
            
            this.showNotification(
                this.isEnglish ? 
                'Thank you for your purchase! The book is now available.' : 
                'شكراً لشرائك! الكتاب متاح الآن.',
                'success'
            );
        }, 2000);
    },
    
    // تبديل الإشارة المرجعية
    toggleBookmark: function() {
        const bookmark = {
            chapter: this.currentChapter,
            page: this.currentPage,
            timestamp: new Date().toISOString(),
            title: this.isEnglish ? 
                englishBookContent[this.currentChapter].title : 
                arabicBookContent[this.currentChapter].title
        };
        
        // التحقق من وجود الإشارة المرجعية
        const existingIndex = this.bookmarks.findIndex(b => 
            b.chapter === bookmark.chapter && b.page === bookmark.page
        );
        
        if (existingIndex >= 0) {
            // إزالة الإشارة المرجعية
            this.bookmarks.splice(existingIndex, 1);
            this.showNotification(
                this.isEnglish ? 
                'Bookmark removed' : 
                'تمت إزالة الإشارة المرجعية',
                'info'
            );
        } else {
            // إضافة الإشارة المرجعية
            this.bookmarks.push(bookmark);
            this.showNotification(
                this.isEnglish ? 
                'Bookmark added' : 
                'تمت إضافة إشارة مرجعية',
                'success'
            );
        }
        
        // حفظ الإشارات المرجعية
        localStorage.setItem('book-bookmarks', JSON.stringify(this.bookmarks));
        
        // تحديث زر الإشارة المرجعية
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        const hasBookmark = this.bookmarks.some(b => b.chapter === this.currentChapter);
        bookmarkBtn.classList.toggle('active', hasBookmark);
    },
    
    // طباعة الفصل الحالي
    printCurrentChapter: function() {
        const chapterElement = document.getElementById(`chapter-${this.currentChapter}`);
        
        if (chapterElement) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${this.isEnglish ? englishBookContent[this.currentChapter].title : arabicBookContent[this.currentChapter].title}</title>
                    <style>
                        body { 
                            font-family: 'Cairo', Arial, sans-serif; 
                            line-height: 1.8;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                        h3 { color: #1e40af; margin-top: 30px; }
                        ul { padding-right: 20px; }
                        blockquote { border-right: 4px solid #3b82f6; padding-right: 15px; margin: 20px 0; font-style: italic; }
                        @media print {
                            body { font-size: 12pt; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${chapterElement.innerHTML}
                    <div class="no-print" style="margin-top: 50px; text-align: center; font-style: italic;">
                        ${this.isEnglish ? 
                          'Printed from: The Practical Path to $1000 Monthly - Amjad Al-Kalbani (2026)' :
                          'مطبوع من: الطريق العملي إلى 1000$ شهريًا - أمجد الكلباني (2026)'}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        }
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    },
    
    // إظهار إشعار
    showNotification: function(message, type = 'info') {
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
        `;
        
        // إضافة للإشعار
        document.body.appendChild(notification);
        
        // إزالة الإشعار تلقائياً بعد 3 ثوان
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    },
    
    // تحديث واجهة المستخدم
    updateUI: function() {
        // تحديث حجم الخط
        this.applyFontSize();
        
        // تحديث تقدم القراءة
        this.updateReadingProgress();
        
        // تحديث الأزرار
        this.updatePageNavigation();
        
        // تحديث الإشارات المرجعية
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        const hasBookmark = this.bookmarks.some(b => b.chapter === this.currentChapter);
        bookmarkBtn.classList.toggle('active', hasBookmark);
        
        console.log('🔄 تم تحديث واجهة المستخدم');
    }
};

// ==============================================
// تهيئة التطبيق عند تحميل الصفحة
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 بدء تحميل تطبيق الكتاب الإلكتروني...');
    BookApp.init();
});

// ==============================================
// تعريف المتغيرات العالمية
// ==============================================
let englishAppendices, arabicAppendices;

// سيتم تحميلها من ملف book-content.js