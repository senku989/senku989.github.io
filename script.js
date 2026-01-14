// Intersection Observer for scroll animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('active');
  });
},{ threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Hamburger toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click',()=>{
  navLinks.classList.toggle('show');
  hamburger.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if(hamburger.classList.contains('open')){
    spans[0].style.transform="rotate(45deg) translate(5px,5px)";
    spans[1].style.opacity="0";
    spans[2].style.transform="rotate(-45deg) translate(5px,-5px)";
  } else {
    spans[0].style.transform="rotate(0) translate(0,0)";
    spans[1].style.opacity="1";
    spans[2].style.transform="rotate(0) translate(0,0)";
  }
});

// Back to top
const backToTop=document.getElementById('backToTop');
window.addEventListener('scroll',()=>{ window.scrollY>400 ? backToTop.classList.add('show') : backToTop.classList.remove('show'); });
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

// Skill chip hover effect
document.querySelectorAll('.skill-chip').forEach(chip=>{
  chip.addEventListener('mousemove',e=>{
    const rect=chip.getBoundingClientRect();
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    chip.style.setProperty('--mx',`${x}px`);
    chip.style.setProperty('--my',`${y}px`);
  });
});

// Tilt effect for mosaic
document.querySelectorAll('.mosaic-item.tilt').forEach(card=>{
  let bounds;
  const calc=e=>{ bounds=card.getBoundingClientRect(); const x=e.clientX-bounds.left, y=e.clientY-bounds.top; const rx=((y/bounds.height)-0.5)*-6; const ry=((x/bounds.width)-0.5)*6; card.style.transform=`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`; };
  const reset=()=>card.style.transform='';
  card.addEventListener('mousemove',calc);
  card.addEventListener('mouseleave',reset);
});

// Card ripple onClick
document.querySelectorAll('.card.interactive,.edu-card.interactive,.cert-card.interactive').forEach(card=>{
  card.addEventListener('click',e=>{
    const ripple=document.createElement('span');
    ripple.className='ripple';
    const rect=card.getBoundingClientRect();
    ripple.style.left=`${e.clientX-rect.left}px`;
    ripple.style.top=`${e.clientY-rect.top}px`;
    card.appendChild(ripple);
    setTimeout(()=>ripple.remove(),600);
  });
});