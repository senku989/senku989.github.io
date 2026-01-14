// ===== Hamburger Menu =====
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('show');
    hamburger.classList.toggle('active');
  });

  // Close menu when clicking a link (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('active');
    });
  });
}

// ===== Back to Top =====
const backToTop = document.getElementById('backToTop');
const toggleBackToTop = () => {
  if (window.scrollY > 300) backToTop.classList.add('show');
  else backToTop.classList.remove('show');
};
window.addEventListener('scroll', toggleBackToTop);
window.addEventListener('load', toggleBackToTop);
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Reveal Animations =====
const reveals = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  reveals.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      setTimeout(() => el.classList.add('active'), i * 120);
    }
  });
};
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== ScrollSpy =====
const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-links a");

const activateNavItem = () => {
  let current = "";
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120) {
      current = section.getAttribute("id");
    }
  });

  navItems.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
};

window.addEventListener("scroll", activateNavItem);
window.addEventListener("load", activateNavItem);

// ===== Contact Form (Demo) =====
const sendBtn = document.getElementById('sendMsg');
if (sendBtn) {
  sendBtn.addEventListener('click', () => {
    alert('✅ تم إرسال رسالتك (نموذج تجريبي للعرض فقط).');
  });
}