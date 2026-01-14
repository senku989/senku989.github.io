// scroll reveal
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add("show");
  });
},{threshold:0.15});

document.querySelectorAll(".observe").forEach(el=>observer.observe(el));

// back to top
const topBtn=document.getElementById("backToTop");
window.addEventListener("scroll",()=>{
  topBtn.style.opacity=window.scrollY>400?1:0;
});
topBtn.onclick=()=>window.scrollTo({top:0,behavior:"smooth"});

// hamburger
const hamburger=document.querySelector(".hamburger");
const nav=document.querySelector(".nav-links");

hamburger.onclick=()=>{
  nav.classList.toggle("show");
};