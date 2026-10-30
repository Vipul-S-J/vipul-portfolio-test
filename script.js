// ============================================================
//  Vipul S Jain — editorial portfolio (Motion: https://motion.dev)
// ============================================================
(function () {
  'use strict';

  var root = document.documentElement;
  var M = window.Motion;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  // ----------------------------------------------------------
  // Wordmark: scale the letters so the word spans the full width
  // ----------------------------------------------------------
  var wordmarkEl = $('.wordmark');
  var wordLine = $('#wordmark');
  function fitWordmark() {
    if (!wordmarkEl || !wordLine) return;
    var style = getComputedStyle(wordmarkEl);
    var available = wordmarkEl.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    // Measure the letters at a known size, packed tightly, then scale to fit
    var probe = 100;
    wordmarkEl.style.fontSize = probe + 'px';
    wordLine.style.display = 'inline-flex';
    var natural = wordLine.getBoundingClientRect().width;
    wordLine.style.display = '';
    if (natural > 0) wordmarkEl.style.fontSize = (probe * available / natural * 0.995).toFixed(2) + 'px';
  }
  fitWordmark();
  window.addEventListener('resize', fitWordmark);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);

  // ----------------------------------------------------------
  // Masthead: solid on scroll, light text over the dark contact
  // ----------------------------------------------------------
  var masthead = $('#masthead');
  var contact = $('#contact');
  var ticking = false;
  function onScroll() {
    ticking = false;
    if (!masthead) return;
    var y = window.scrollY;
    var heroH = ($('#top') || {}).offsetHeight || window.innerHeight;
    var overDark = contact && contact.getBoundingClientRect().top < masthead.offsetHeight;
    masthead.classList.toggle('masthead--night', !!overDark);
    masthead.classList.toggle('masthead--solid', !overDark && y > heroH * 0.85);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // ----------------------------------------------------------
  // Menu overlay
  // ----------------------------------------------------------
  var menuBtn = $('#menuBtn');
  var menu = $('#menu');
  var mainEl = $('#main');
  var footerEl = $('.footer');
  var menuOpen = false;

  function setInert(on) {
    [mainEl, footerEl].forEach(function (el) {
      if (!el) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }

  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    setInert(true);
    document.body.style.overflow = 'hidden';
    var links = $$('.menu__list a', menu);
    if (M && !reduceMotion) {
      M.animate(menu, { clipPath: ['circle(0% at calc(100% - 2.5rem) 2.5rem)', 'circle(150% at calc(100% - 2.5rem) 2.5rem)'] }, { duration: 0.7, ease: [0.76, 0, 0.24, 1] });
      M.animate(links, { y: ['110%', '0%'], opacity: [0, 1] }, { type: 'spring', visualDuration: 0.6, bounce: 0, delay: M.stagger(0.06, { startDelay: 0.2 }) });
      M.animate($('.menu__foot', menu), { opacity: [0, 1] }, { duration: 0.4, delay: 0.55 });
    } else {
      menu.classList.add('is-open');
    }
    setTimeout(function () { if (links[0]) links[0].focus(); }, 60);
  }

  function closeMenu(returnFocus) {
    if (!menuOpen) return;
    menuOpen = false;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    setInert(false);
    document.body.style.overflow = '';
    function hide() { menu.hidden = true; menu.classList.remove('is-open'); }
    if (M && !reduceMotion) {
      M.animate(menu, { clipPath: ['circle(150% at calc(100% - 2.5rem) 2.5rem)', 'circle(0% at calc(100% - 2.5rem) 2.5rem)'] }, { duration: 0.5, ease: [0.76, 0, 0.24, 1] }).then(hide);
    } else {
      hide();
    }
    if (returnFocus) menuBtn.focus();
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { if (menuOpen) closeMenu(true); else openMenu(); });
    document.addEventListener('keydown', function (e) {
      if (!menuOpen) return;
      if (e.key === 'Escape') { closeMenu(true); return; }
      if (e.key === 'Tab') { // keep focus inside the menu and its button
        var items = [menuBtn].concat($$('a', menu));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
  }

  // In-page links: close the menu first, then scroll
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var wasOpen = menuOpen;
      closeMenu(false);
      var go = function () {
        var top = id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
        history.replaceState(null, '', '#' + id);
        if (id === 'main') target.focus({ preventScroll: true });
      };
      if (wasOpen) setTimeout(go, reduceMotion ? 0 : 320); else go();
    });
  });

  // ----------------------------------------------------------
  // Pause control for looping motion (ticker, sigil, scroll cue)
  // ----------------------------------------------------------
  var paused = false;
  try { paused = localStorage.getItem('obsidianMotionPaused') === '1'; } catch (e) {}
  var toggle = $('#motionToggle');
  var toggleLabel = $('#motionToggleLabel');
  function renderPause() {
    root.classList.toggle('motion-paused', paused);
    if (toggle) toggle.setAttribute('aria-pressed', String(paused));
    if (toggleLabel) toggleLabel.textContent = paused ? 'Play motion' : 'Pause motion';
  }
  if (toggle && !reduceMotion) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      paused = !paused;
      try { localStorage.setItem('obsidianMotionPaused', paused ? '1' : '0'); } catch (e) {}
      renderPause();
    });
  }
  renderPause();

  // ----------------------------------------------------------
  // Copy email
  // ----------------------------------------------------------
  var copyBtn = $('#copyEmail');
  if (copyBtn) {
    var copyLabel = $('#copyLabel');
    var copyStatus = $('#copyStatus');
    var copyTimer;
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.dataset.email;
      var done = function (ok) {
        copyLabel.textContent = ok ? 'Copied ✓' : email;
        copyStatus.textContent = ok ? 'Email address copied to clipboard' : 'Copy failed. Email address is ' + email;
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () { copyLabel.textContent = 'Copy email'; copyStatus.textContent = ''; }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = email; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done(ok);
      }
    });
  }

  // ----------------------------------------------------------
  // Without Motion: show everything and stop here
  // ----------------------------------------------------------
  if (!M) {
    clearTimeout(window.__revealFallback);
    root.classList.add('reveal-all');
    return;
  }
  clearTimeout(window.__revealFallback);

  var animate = M.animate, inView = M.inView, scroll = M.scroll, stagger = M.stagger;
  var ENTER = { type: 'spring', visualDuration: 0.8, bounce: 0 };
  var FADE = { duration: 0.6, ease: 'easeOut' };

  function enter(targets, dist, delay) {
    if (reduceMotion) return animate(targets, { opacity: [0, 1] }, { duration: 0.3, delay: delay });
    return animate(targets, { opacity: [0, 1], y: [dist, 0] }, {
      y: Object.assign({ delay: delay }, ENTER),
      opacity: Object.assign({ delay: delay }, FADE)
    });
  }

  // ----------------------------------------------------------
  // Hero entrance: letters rise, the figure emerges from shadow
  // ----------------------------------------------------------
  var letters = $$('#wordmark > span');
  var figure = $('#figure');
  if (reduceMotion) {
    letters.forEach(function (l) { l.style.transform = 'none'; });
    animate(figure, { opacity: [0, 1] }, { duration: 0.4 });
    animate($$('[data-hero]'), { opacity: [0, 1] }, { duration: 0.4 });
  } else {
    animate(letters, { y: ['105%', '0%'] }, { type: 'spring', visualDuration: 1.0, bounce: 0, delay: stagger(0.07, { startDelay: 0.15 }) });
    // The rise runs on the inner svg, because the scroll-linked effect below owns the figure's transform
    animate(figure.querySelector('svg'), { y: [60, 0] }, { type: 'spring', visualDuration: 1.4, bounce: 0, delay: 0.45 });
    animate(figure, { opacity: [0, 1], filter: ['blur(14px) brightness(0.6)', 'blur(0px) brightness(1)'] }, {
      opacity: { duration: 1.1, ease: 'easeOut', delay: 0.45 },
      filter: { duration: 1.3, ease: 'easeOut', delay: 0.45 }
    }).then(function () {
      // drop the idle filter layer once the figure is sharp
      requestAnimationFrame(function () { figure.style.filter = 'none'; });
    });
    enter($$('[data-hero]'), 16, stagger(0.1, { startDelay: 1.0 }));
  }

  // ----------------------------------------------------------
  // Depth: mouse parallax and scroll
  // ----------------------------------------------------------
  var hero = $('#top');
  if (!reduceMotion && hero) {
    scroll(animate(wordLine, { y: [0, -90], opacity: [1, 0.15] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
    scroll(animate(figure, { scale: [1, 0.9], y: [0, 120] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  }
  if (finePointer && !reduceMotion && hero) {
    var PAR = { type: 'spring', stiffness: 60, damping: 20 };
    var pending = false, mx = 0, my = 0;
    hero.addEventListener('pointermove', function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        animate(wordmarkEl, { x: mx * -24, y: my * -10 }, PAR);
        animate(figure.querySelector('svg'), { x: mx * 22, y: my * 8, rotate: mx * 1.5 }, PAR);
      });
    });
    hero.addEventListener('pointerleave', function () {
      animate(wordmarkEl, { x: 0, y: 0 }, PAR);
      animate(figure.querySelector('svg'), { x: 0, y: 0, rotate: 0 }, PAR);
    });
  }

  // ----------------------------------------------------------
  // Reveal on scroll (with a catch-up for very fast scrolls)
  // ----------------------------------------------------------
  function revealOne(el) { if (el.dataset.shown) return; el.dataset.shown = '1'; enter(el, 40, 0); }
  function revealGroup(el) { if (el.dataset.shown) return; el.dataset.shown = '1'; enter(Array.prototype.slice.call(el.children), 28, stagger(0.07)); }
  inView('[data-reveal]', revealOne, { margin: '0px 0px -10% 0px' });
  inView('[data-stagger]', revealGroup, { margin: '0px 0px -8% 0px' });
  var catchUp;
  window.addEventListener('scroll', function () {
    clearTimeout(catchUp);
    catchUp = setTimeout(function () {
      var limit = window.innerHeight;
      $$('[data-reveal]:not([data-shown])').forEach(function (el) { if (el.getBoundingClientRect().top < limit) revealOne(el); });
      $$('[data-stagger]:not([data-shown])').forEach(function (el) { if (el.getBoundingClientRect().top < limit) revealGroup(el); });
    }, 150);
  }, { passive: true });

  // Count-up stats
  inView('.stats', function (el) {
    $$('[data-count]', el).forEach(function (b, i) {
      var end = Number(b.dataset.count), pre = b.dataset.prefix || '', suf = b.dataset.suffix || '';
      if (reduceMotion) return;
      animate(0, end, { duration: 1.5, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1], onUpdate: function (v) { b.textContent = pre + Math.round(v) + suf; } });
    });
  }, { amount: 0.4 });

  // ----------------------------------------------------------
  // Work index: a coloured card with the service icon follows the cursor
  // ----------------------------------------------------------
  var preview = $('#preview');
  var previewIcon = $('#previewIcon');
  var workIndex = $('#workIndex');
  if (finePointer && !reduceMotion && preview && workIndex) {
    var FOLLOW = { type: 'spring', stiffness: 260, damping: 26 };
    var shown = false;
    var px = 0, py = 0, rafQueued = false;
    workIndex.addEventListener('pointermove', function (e) {
      px = e.clientX + 28; py = e.clientY - 130;
      if (rafQueued) return;
      rafQueued = true;
      requestAnimationFrame(function () {
        rafQueued = false;
        animate(preview, { x: px, y: py }, shown ? FOLLOW : { duration: 0 });
      });
    });
    $$('.index__row', workIndex).forEach(function (row) {
      row.addEventListener('pointerenter', function () {
        preview.style.setProperty('--preview-color', row.dataset.color);
        previewIcon.src = row.dataset.icon;
        shown = true;
        animate(preview, { opacity: 1, scale: 1, rotate: -4 }, { type: 'spring', visualDuration: 0.35, bounce: 0.15 });
      });
    });
    workIndex.addEventListener('pointerleave', function () {
      shown = false;
      animate(preview, { opacity: 0, scale: 0.6, rotate: 0 }, { duration: 0.2 });
    });
  }
})();
