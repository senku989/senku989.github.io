// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
});

document.querySelectorAll('.observe').forEach(el => observer.observe(el));

// Back to top
const btn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) btn.classList.add('show');
  else btn.classList.remove('show');
});

btn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});