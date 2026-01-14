// Hamburger toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
  hamburger.classList.toggle('active');
});

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
window.addEventListener('scroll', () => {
  reveals.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight - 100){
      setTimeout(() => el.classList.add('active'), i * 150);
    }
  });
});

// Tilt effect for mosaic items
const tiltItems = document.querySelectorAll('.tilt');
tiltItems.forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const {width, height} = item.getBoundingClientRect();
    const x = e.offsetX / width - 0.5;
    const y = e.offsetY / height - 0.5;
    item.style.transform = `rotateY(${x*20}deg) rotateX(${y*20}deg)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'rotateY(0) rotateX(0)';
  });
});