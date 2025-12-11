/* THEME + LANGUAGE MANAGER for QBank
   - يدعم أزرار متعددة (themeSwitch, themeToggle)
   - يدعم مفاتيح أيقونات themeIcon إن وُجدت
   - يدعم تبديل اللغة عبر langSwitch أو langToggle
   - يطبّق الترجمة على عناصر data-text و span[data-text]
*/

(() => {
  // ---------- translations (keep minimal; extendable) ----------
  const translations = {
    ar: {
      brand: "QBank",
      "brand-sub": "بنك الأسئلة – اختبر مستواك",
      login: "تسجيل دخول",
      signup: "إنشاء حساب",
      "hero-title": "اختبر نفسك — تعرف على مستواك الحقيقي",
      "hero-desc": "منصة QBank تمنحك اختبارات ذكية تتكيف مع مستواك، تتيح لك تتبع الأداء وتحسين نقاط الضعف — باشتراك بسيط شهريًا.",
      start: "لنبدأ",
      "see-features": "اطّلع على المميزات",
      "feat1-title": "اختبارات ذكية",
      "feat1-desc": "المنصة تختار الأسئلة حسب أداء الطالب لتقدم تحدّي مناسب وفعّال.",
      "feat2-title": "بنك أسئلة منظم",
      "feat2-desc": "أسئلة مصنفة حسب الصف والمادة والمستوى مع إمكانية إضافة دفعات بسهولة.",
      "feat3-title": "حماية الاشتراكات",
      "feat3-desc": "حد أجهزة مسموح وOTP عند أجهزة جديدة لتقليل مشاركة الحسابات.",
      "pricing-title": "خطط الاشتراك",
      f1: "اختبارات تكيّفية حسب الأداء",
      f2: "حماية الحساب من المشاركة غير المصرّح بها",
      f3: "تحليلات مفصّلة للأداء"
    },
    en: {
      brand: "QBank",
      "brand-sub": "Question Bank — Test Yourself",
      login: "Login",
      signup: "Sign Up",
      "hero-title": "Test Yourself — Discover Your Real Level",
      "hero-desc": "QBank offers smart adaptive exams, tracking performance and improving weaknesses — all with a simple monthly subscription.",
      start: "Start",
      "see-features": "View Features",
      "feat1-title": "Smart Exams",
      "feat1-desc": "The platform chooses questions based on student performance for effective adaptive learning.",
      "feat2-title": "Organized Question Bank",
      "feat2-desc": "Questions categorized by grade, subject and level, with easy bulk additions.",
      "feat3-title": "Subscription Protection",
      "feat3-desc": "Device limits + OTP for new devices to reduce account sharing.",
      "pricing-title": "Pricing Plans",
      f1: "Adaptive exams by performance",
      f2: "Account sharing protection",
      f3: "Detailed performance analytics"
    }
  };

  // ---------- helpers ----------
  const elByIds = (ids) => ids.map(id => document.getElementById(id)).filter(Boolean);
  const firstEl = (ids) => elByIds(ids)[0] || null;

  // Elements (support multiple possible IDs across pages)
  const themeButtons = elByIds(['themeSwitch','themeToggle']);
  const themeIconEls = elByIds(['themeIcon']);
  const langButtons = elByIds(['langSwitch','langToggle']);

  const THEME_KEY = 'qbank-theme';
  const LANG_KEY = 'qbank-lang';

  // safe apply theme
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeIconEls.forEach(ic => {
        if (ic.classList.contains('fa-moon')) ic.classList.replace('fa-moon','fa-sun');
        else if (!ic.classList.contains('fa-sun')) ic.classList.add('fa-sun');
      });
    } else {
      document.body.classList.remove('dark-mode');
      themeIconEls.forEach(ic => {
        if (ic.classList.contains('fa-sun')) ic.classList.replace('fa-sun','fa-moon');
        else if (!ic.classList.contains('fa-moon')) ic.classList.add('fa-moon');
      });
    }
  }

  // safe apply language (translate elements with data-text attributes)
  function applyLang(lang) {
    // set html lang + dir
    document.documentElement.lang = (lang === 'ar' ? 'ar' : 'en');
    document.documentElement.dir = (lang === 'ar' ? 'rtl' : 'ltr');

    // translate elements that have data-text
    document.querySelectorAll('[data-text]').forEach(el => {
      const key = el.getAttribute('data-text');
      if (!key) return;
      const map = translations[lang] || translations['ar'];
      if (map[key]) {
        el.textContent = map[key];
      }
    });

    // translate inline spans if any (span[data-text])
    document.querySelectorAll('span[data-text]').forEach(el => {
      const key = el.getAttribute('data-text');
      if (!key) return;
      const map = translations[lang] || translations['ar'];
      if (map[key]) el.textContent = map[key];
    });
  }

  // ---------- initialize based on saved values ----------
  try {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);
  } catch (err) { /* silent */ }

  try {
    const savedLang = localStorage.getItem(LANG_KEY) || (document.documentElement.lang === 'en' ? 'en' : 'ar');
    applyLang(savedLang);
  } catch (err) { /* silent */ }

  // ---------- event binding ----------
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isDark = document.body.classList.toggle('dark-mode');
      const next = isDark ? 'dark' : 'light';
      try { localStorage.setItem(THEME_KEY, next); } catch(e){/* silent */ }
      applyTheme(next);
    });
  });

  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.lang === 'ar' ? 'ar' : 'en';
      const next = current === 'ar' ? 'en' : 'ar';
      try { localStorage.setItem(LANG_KEY, next); } catch(e){/* silent */ }
      applyLang(next);
    });
  });

  // Expose for console debugging (optional)
  window.QBankUI = {
    setTheme: (t) => { applyTheme(t); try { localStorage.setItem(THEME_KEY, t); } catch(e){} },
    setLang: (l) => { applyLang(l); try { localStorage.setItem(LANG_KEY, l); } catch(e){} }
  };

})();
