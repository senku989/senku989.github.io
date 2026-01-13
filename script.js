// Scroll reveal
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('revealed');});
},{threshold:0.15});
document.querySelectorAll('.observe').forEach(el=>observer.observe(el));

// Back to top
const backToTop=document.getElementById('backToTop');
window.addEventListener('scroll',()=>{
  if(window.scrollY>400) backToTop.classList.add('show');
  else backToTop.classList.remove('show');
});
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

// Interactive cards ripple
document.querySelectorAll('.card.interactive').forEach(card=>{
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

// Skill hover effect
document.querySelectorAll('.skill-chip').forEach(chip=>{
  chip.addEventListener('mousemove',e=>{
    const rect=chip.getBoundingClientRect();
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    chip.style.setProperty('--mx',`${x}px`);
    chip.style.setProperty('--my',`${y}px`);
  });
});