/* Root Variables */
:root {
  --bg: #0f1220;
  --surface: #151a2e;
  --card: #1b2140;
  --text: #e6e6f0;
  --muted: #a9b0c7;
  --primary: #7C3AED;   /* violet */
  --secondary: #06B6D4; /* cyan */
  --accent: #F59E0B;    /* amber */
  --success: #22C55E;   /* green */
  --danger: #EF4444;    /* red */
  --gradient: linear-gradient(135deg, var(--primary), var(--secondary));
  --footer-gradient: linear-gradient(135deg, #0f1220, #151a2e);
}

/* Global Styles */
* { box-sizing: border-box; }
html, body { height: 100%; margin:0; font-family: 'Cairo', system-ui, sans-serif; background: var(--bg); color: var(--text); line-height:1.8; }
a { text-decoration:none; }
ul { list-style:none; margin:0; padding:0; }

/* Back to top button */
#backToTop { position: fixed; bottom: 24px; left: 24px; width:44px;height:44px;border-radius:50%;border:none;background:var(--gradient);color:#fff;font-weight:800;cursor:pointer;box-shadow:0 10px 30px rgba(124,58,237,.35);opacity:0;pointer-events:none;transition: opacity .3s ease, transform .3s ease; }
#backToTop.show { opacity:1; pointer-events:auto; }
#backToTop:hover { transform: translateY(-4px) scale(1.05); }

/* Navbar */
.nav { position: sticky; top:0; z-index:1000; display:flex; align-items:center; justify-content:space-between; padding:14px 24px; backdrop-filter: blur(12px); background: rgba(21,26,46,0.85); border-bottom:1px solid rgba(255,255,255,.06); }
.brand { display:flex; align-items:center; gap:10px; }
.logo-dot { width:16px;height:16px;border-radius:50%;background:var(--gradient);box-shadow:0 0 20px rgba(124,58,237,.6); transition: transform .3s ease; }
.logo-dot:hover { transform: scale(1.2) rotate(20deg); }
.brand-text { font-weight:800; letter-spacing:.5px; font-size:18px; }
.nav-links { display:flex; gap:20px; }
.nav-links a { color:var(--text); font-weight:600; padding:8px 14px; border-radius:10px; position:relative; transition:all .3s ease; }
.nav-links a::after { content:''; position:absolute; width:0%; height:2px; left:0; bottom:0; background:var(--gradient); transition: width .3s ease; }
.nav-links a:hover::after { width:100%; }

/* Hamburger menu */
.hamburger { display:none; flex-direction:column; gap:5px; background:none;border:none;cursor:pointer; }
.hamburger span { display:block; height:3px; width:25px; background: var(--text); border-radius:3px; transition: all .3s ease; }

/* Sections */
.section { padding:80px 24px; }
.section-title { font-size:28px; font-weight:800; margin-bottom:12px; background: var(--gradient); -webkit-background-clip: text; color:transparent; }
.section-subtitle { color: var(--muted); margin-bottom:24px; }

/* Cards, Skills, Certificates */
.cards-grid, .skills-grid, .cert-grid { display:grid; gap:20px; }
.cards-grid { grid-template-columns: repeat(auto-fit,minmax(250px,1fr)); }
.skills-grid { grid-template-columns: repeat(auto-fit,minmax(120px,1fr)); }
.cert-grid { grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); }

.card.interactive, .skill-chip, .btn { cursor:pointer; transition: all .3s ease; border-radius:10px; }
.card.interactive { background:var(--card); padding:20px; position:relative; overflow:hidden; }
.skill-chip { background:var(--surface); padding:10px 16px; text-align:center; font-weight:600; }
.skill-chip:hover { background:var(--gradient); color:#fff; transform:scale(1.05); }

/* Footer */
.footer { background:var(--footer-gradient); padding:50px 24px; color:#fff; }
.footer-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.footer h4 { margin-bottom:12px; font-weight:700; font-size:18px; background: var(--gradient); -webkit-background-clip: text; color:transparent; }
.footer p { font-size:14px; line-height:1.6; color:var(--muted); }
.footer .btn-grid { display:flex; flex-direction:column; gap:8px; }
.footer .btn-secondary { background:var(--surface); color:#fff; padding:8px 12px; border-radius:8px; display:inline-block; transition: all .3s ease; }
.footer .btn-secondary:hover { background:var(--gradient); transform:scale(1.05); }

/* Social links */
.footer-social .social-links { display:flex; gap:12px; margin-top:8px; }
.footer-social a { width:44px;height:44px; display:flex;align-items:center;justify-content:center;border-radius:50%; background:var(--surface); color:#fff; font-size:20px; transition: all .3s ease; }
.footer-social a:hover { background:var(--gradient); transform:scale(1.1); }

/* Responsive */
@media(max-width:980px){.hero-grid{grid-template-columns:1fr;}}
@media(max-width:780px){
  .nav-links{position:absolute;top:70px;right:0;background:var(--surface);flex-direction:column;width:200px;padding:20px;border-radius:10px 0 0 10px;box-shadow:0 10px 30px rgba(0,0,0,.3);transform:translateX(100%);transition:transform .3s ease;}
  .nav-links.show{transform:translateX(0);}
  .hamburger{display:flex;}
  .footer-grid { grid-template-columns:1fr; }
}