'use strict';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme (slate (dark) by default, remembers choice) ---------- */
const themeBtn = document.getElementById('theme');
function applyTheme(t) {
  root.dataset.theme = t;
  themeBtn.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} theme`);
  document.querySelector('meta[name="theme-color"]').content = t === 'dark' ? '#172229' : '#e9eff2';
}
applyTheme(localStorage.getItem('theme') || 'dark');
themeBtn.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  const swap = () => { applyTheme(next); localStorage.setItem('theme', next); };
  document.startViewTransition && !reduced ? document.startViewTransition(swap) : swap();
});

/* ---------- Work filter with View Transitions ---------- */
const buttons = [...document.querySelectorAll('.filters button')];
const credits = [...document.querySelectorAll('.credit')];
credits.forEach((c, i) => { c.style.viewTransitionName = `credit-${i}`; });

function applyFilter(f) {
  credits.forEach((c) => { c.hidden = f !== 'all' && c.dataset.type !== f; });
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
}
buttons.forEach((b) => b.addEventListener('click', () => {
  const f = b.dataset.f;
  document.startViewTransition && !reduced
    ? document.startViewTransition(() => applyFilter(f))
    : applyFilter(f);
}));

/* ---------- Fallback reveal when scroll-driven animations are unsupported ---------- */
if (!CSS.supports('animation-timeline: view()')) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.animate(
        [{ opacity: 0, transform: 'translateY(2rem)' }, { opacity: 1, transform: 'none' }],
        { duration: reduced ? 0 : 600, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }
      );
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

/* ---------- Count-up numbers ---------- */
if (!reduced) {
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 900, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io2.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((n) => io2.observe(n));
}

/* ---------- Pointer spotlight on cards ---------- */
document.querySelectorAll('.counts li, .poster').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

document.getElementById('yr').textContent = new Date().getFullYear();

/* ---------- Landing intro animation ---------- */
(function(){
  var root=document.documentElement;
  if(!root.classList.contains("px-intro")) return;
  var EXPO ="cubic-bezier(.16,1,.3,1)",
      DRAW ="cubic-bezier(.62,.04,.22,1)",
      PANEL="cubic-bezier(.77,0,.18,1)",
      SOFT ="cubic-bezier(.25,1,.5,1)";
  var narrow=matchMedia("(max-width:560px)").matches;
  var S=narrow?.8:1;
  var anims=[];
  function $(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
  function add(el,kf,o){o.fill="both";anims.push(el.animate(kf,o))}
  function play(){
    var paths=$(".rings path");
    var delay=[560,480,400, 560,480,400, 100,160,220,280,340,400];
    paths.forEach(function(p,i){
      var L=p.getTotalLength();
      add(p,[{strokeDasharray:"0px "+L+"px",strokeDashoffset:(-L/2)+"px"},
             {strokeDasharray:L+"px "+L+"px",strokeDashoffset:"0px"}],
          {duration:i>5?1350:1150,delay:delay[i]*(i>5?1:S),easing:DRAW});
    });
    $(".title span").forEach(function(s,i){
      add(s,[{translate:"0 105%"},{translate:"0 0"}],{duration:1000,delay:200+i*38*S,easing:EXPO});
    });
    add(document.querySelector(".lnav"),[{clipPath:"inset(0 50% 0 50%)"},{clipPath:"inset(0 0% 0 0%)"}],{duration:800,delay:450,easing:PANEL});
    $(".logo,.menu").forEach(function(e,i){
      add(e,[{opacity:0,translate:"0 35%"},{opacity:1,translate:"0 0"}],{duration:600,delay:780+i*70,easing:SOFT});
    });
    function lines(sel,start){
      $(sel+" .ln>span").forEach(function(s,i){
        add(s,[{translate:"0 105%"},{translate:"0 0"}],{duration:800,delay:start+i*70*S,easing:EXPO});
      });
    }
    lines(".copy--tl",700); lines(".copy--tr",760);
    $(".lbtn").forEach(function(b,i){
      add(b,[{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)"}],{duration:750,delay:950+i*90*S,easing:PANEL});
    });
    $(".lbl").forEach(function(l,i){
      add(l,[{opacity:0,translate:"0 .45em"},{opacity:1,translate:"0 0"}],{duration:550,delay:1200+i*90*S,easing:SOFT});
    });
    lines(".copy--bl",1100); lines(".copy--br",1160);
    clearTimeout(window.__pxFailsafe);
    Promise.all(anims.map(function(a){return a.finished})).then(function(){
      root.classList.remove("px-intro");
      anims.forEach(function(a){a.cancel()});
      anims.length=0;
    });
  }
  var img=document.querySelector(".scene>img");
  var ready=Promise.all([document.fonts?document.fonts.ready:0, img&&img.decode?img.decode().catch(function(){}):0]);
  var started=false;
  function go(){ if(started) return; started=true; requestAnimationFrame(play); }
  ready.then(go,go); setTimeout(go,1200);
})();
