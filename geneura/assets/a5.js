/* Lythous India - motion.
   The ambient is a lighthouse: a lamp above the page throwing two opposing
   cones that turn slowly on their own and faster as you scroll, so the light
   sweeps while you read. Plus the pointer light, scroll reveals, the
   scrollytelling steps and the mobile menu.

   This is v3.js with the sunrise swapped for the beam. v3.js is left alone so
   the earlier mock-up keeps rendering the way the client last saw it. */
(function () {
  'use strict';
  var mq   = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = mq.matches;
  var fine  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf   = window.requestAnimationFrame.bind(window);

  var progress = 0;                       // 0 at top of page, 1 at bottom
  var ptrX = -1, ptrY = -1, eX = -1, eY = -1, hasPtr = false;

  /* ---------------------------------------------------------- the beam */
  /* The lamp sits above the page and throws two opposing cones. They turn
     slowly on their own and faster as the page scrolls, so the light sweeps
     while you read rather than idling. Ported from the premium direction.
     Reduced motion switches the whole thing off. */
  function beam() {
    if (still) return;
    document.body.classList.add('lit-bg');

    var c = document.createElement('canvas');
    c.className = 'ambient';
    c.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(c, document.body.firstChild);
    var x = c.getContext('2d');

    var w = 0, h = 0, dpr = 1, id = null, last = 0, f = 0;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      c.width  = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = w + 'px'; c.style.height = h + 'px';
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function cone(ox, oy, a0, spread, reach, stops) {
      var g = x.createRadialGradient(ox, oy, 0, ox, oy, reach);
      for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
      x.beginPath();
      x.moveTo(ox, oy);
      x.arc(ox, oy, reach, a0 - spread, a0 + spread);
      x.closePath();
      x.fillStyle = g;
      x.fill();
    }

    function frame(ts) {
      id = raf(frame);
      if (ts - last < 26) return;          // ~38fps, ample for light this soft
      last = ts;
      f++;

      x.clearRect(0, 0, w, h);

      var ox = w * 0.5, oy = -h * 0.16;
      var ang = f * 0.0024 + progress * Math.PI * 2.4;
      var reach = Math.max(w, h) * 2.1;

      for (var k = 0; k < 2; k++) {
        var a0 = ang + k * Math.PI;
        // wide soft body
        cone(ox, oy, a0, 0.235, reach, [
          [0,   'rgba(255,238,208,.62)'],
          [.26, 'rgba(251,227,188,.38)'],
          [.62, 'rgba(234,203,157,.19)'],
          [1,   'rgba(234,203,157,0)']
        ]);
        // bright core, so the beam has an edge rather than being a haze
        cone(ox, oy, a0, 0.062, reach, [
          [0,   'rgba(255,250,236,.70)'],
          [.35, 'rgba(255,242,214,.38)'],
          [.8,  'rgba(247,225,184,.13)'],
          [1,   'rgba(247,225,184,0)']
        ]);
      }

      // the lamp itself
      var lg = x.createRadialGradient(ox, oy, 0, ox, oy, h * .62);
      lg.addColorStop(0,  'rgba(255,246,224,.58)');
      lg.addColorStop(.5, 'rgba(255,240,212,.20)');
      lg.addColorStop(1,  'rgba(255,238,208,0)');
      x.fillStyle = lg; x.fillRect(0, 0, w, h);

      // the light that follows the pointer
      if (hasPtr) {
        eX += (ptrX - eX) * .085;
        eY += (ptrY - eY) * .085;
        var r = Math.min(w, h) * .40;
        var pg = x.createRadialGradient(eX, eY, 0, eX, eY, r);
        pg.addColorStop(0,   'rgba(255,243,222,.26)');
        pg.addColorStop(.45, 'rgba(250,228,194,.11)');
        pg.addColorStop(1,   'rgba(250,228,194,0)');
        x.fillStyle = pg; x.fillRect(0, 0, w, h);
      }
    }

    function on()  { if (!id) id = raf(frame); }
    function off() { if (id) { cancelAnimationFrame(id); id = null; } }

    size(); on();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(size, 150);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      /* a tab that loads while hidden can measure a zero viewport, and the
         canvas would stay 0x0 for good, since size() otherwise only re-runs on
         resize. Re-measure whenever the page becomes visible. */
      if (document.hidden) { off(); } else { size(); on(); }
    });
    if (fine) {
      window.addEventListener('pointermove', function (e) {
        ptrX = e.clientX; ptrY = e.clientY;
        if (!hasPtr) { eX = ptrX; eY = ptrY; hasPtr = true; }
      }, { passive: true });
    }
  }

  /* ------------------------------------------------------------- reveals */
  function reveals() {
    var els = document.querySelectorAll('.rv,.stagger,.mask');
    if (still || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add('in'); });
      return;
    }
    document.querySelectorAll('.stagger').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (ch, i) {
        ch.style.transitionDelay = (i * 55) + 'ms';
      });
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: .05 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* ---------------------------------------------------------- hero entrance */
  function hero() {
    var el = document.querySelector('.hero-in');
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    if (still) { el.style.opacity = '1'; el.style.transform = 'none'; return; }
    el.style.transition = 'opacity .7s cubic-bezier(.22,.7,.3,1),transform .7s cubic-bezier(.22,.7,.3,1)';
    setTimeout(function () { el.style.opacity = '1'; el.style.transform = 'none'; }, 90);
  }

  /* ------------------------- steps: all seven readable, art follows along */
  function steps() {
    var list = document.querySelectorAll('.step');
    var arts = document.querySelectorAll('.step-art .art');
    if (!list.length) return null;
    if (still) {
      Array.prototype.forEach.call(list, function (s) { s.classList.add('on'); });
      if (arts[0]) arts[0].classList.add('on');
      return null;
    }
    var cur = -1;
    return function () {
      var mid = window.innerHeight * 0.46, best = 0, bestD = Infinity;
      for (var i = 0; i < list.length; i++) {
        var r = list[i].getBoundingClientRect();
        var d = Math.abs((r.top + r.height / 2) - mid);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best === cur) return;
      cur = best;
      Array.prototype.forEach.call(list, function (s, k) { s.classList.toggle('on', k === best); });
      Array.prototype.forEach.call(arts, function (a, k) { a.classList.toggle('on', k === best); });
    };
  }

  /* --------------------------------- one scroll handler for the whole page */
  function scroller(stepUpdate) {
    var head = document.querySelector('.site-head');
    var heroImg = document.querySelector('.hero-media img');
    var pending = false;

    function upd() {
      pending = false;
      var d = document.documentElement;
      var y = window.pageYOffset || d.scrollTop;
      var max = d.scrollHeight - d.clientHeight;
      progress = max > 0 ? y / max : 0;
      if (head) head.classList.toggle('stuck', y > 40);
      if (stepUpdate) stepUpdate();
      if (!still && heroImg && y < window.innerHeight * 1.3) {
        heroImg.style.transform = 'translate3d(0,' + (y * .2).toFixed(1) + 'px,0)';
      }
    }
    window.addEventListener('scroll', function () {
      if (!pending) { pending = true; raf(upd); }
    }, { passive: true });
    window.addEventListener('resize', upd, { passive: true });
    upd();
  }

  /* ------------------------------------------------------------ mobile menu */
  function menu() {
    var btn = document.querySelector('.menu-btn');
    var nav = document.querySelector('.mobile-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function init() { beam(); hero(); reveals(); menu(); scroller(steps()); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))
    (function () { location.reload(); });
})();
