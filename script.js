// Scroll reveal
const observer = new IntersectionObserver(
  entries => { 
    entries.forEach(entry => { 
      if(entry.isIntersecting) entry.target.classList.add('revealed'); 
    }); 
  }, { threshold: 0.15 }
);
document.querySelectorAll('.observe').forEach(el => observer.observe(el));

// Back to top
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) backToTop.classList.add('show');
  else backToTop.classList.remove('show');
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Hamburger toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
  hamburger.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if(hamburger.classList.contains('open')){
    spans[0].style.transform =