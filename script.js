// Hamburger toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if(hamburger){
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    hamburger.classList.toggle('active');
  });
}

// Back to top button
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if(window.scrollY > 300){
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});
backToTop.addEventListener('click', () => {
  window.scrollTo({top:0, behavior:'smooth'});
});

// Reveal on scroll with stagger
const reveals = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  reveals.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight - 100){
      setTimeout(() => el.classList.add('active'), i * 120);
    }
  });
};
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Tilt effect for mosaic items
const tiltItems = document.querySelectorAll('.tilt');
tiltItems.forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    item.style.transform = `rotateY(${x*12}deg) rotateX(${y*12}deg)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'rotateY(0) rotateX(0)';
  });
});

// Counters (Achievements)
const counters = document.querySelectorAll('.counter');
const runCounters = () => {
  counters.forEach(card => {
    const target = +card.getAttribute('data-target');
    const countEl = card.querySelector('.count');
    if(!countEl) return;
    const rect = card.getBoundingClientRect();
    if(rect.top < window.innerHeight - 80){
      let current = 0;
      const step = Math.ceil(target / 60);
      const interval = setInterval(() => {
        current += step;
        if(current >= target){
          current = target;
          clearInterval(interval);
        }
        countEl.textContent = current;
      }, 20);
    }
  });
};
window.addEventListener('scroll', runCounters);
window.addEventListener('load', runCounters);

// Contact form (demo)
const sendBtn = document.getElementById('sendMsg');
if(sendBtn){
  sendBtn.addEventListener('click', () => {
    alert('تم إرسال رسالتك (نموذج تجريبي).');
  });
}