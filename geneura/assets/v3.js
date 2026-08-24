/* Lythous — version three.
   The ambient is a sunrise: a sun that climbs as you scroll, rays radiating and
   breathing, colour warming as it rises. Radiating outward rather than sweeping,
   which is the whole point: light that arrives, not light that searches.
   Plus the pointer light, scrollytelling steps, and a mobile menu. */
(function () {
  'use strict';
  var mq   = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = mq.matches;
  var fine  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf   = window.requestAnimationFrame.bind(window);

  var progress = 0;                       // 0 at top of page, 1 at bottom
  var ptrX = -1, ptrY = -1, eX = -1, eY = -1, hasPtr = false;

  /* ------------------------------------------------------------- sunrise */
  function sunrise() {
    if (still) return;
    document.body.classList.add('lit-bg');

    var c = document.createElement('canvas');
    c.className = 'ambient';
    c.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(c, document.body.firstChild);
    var x = c.getContext('2d');

    var w = 0, h = 0, dpr = 1, id = null, last = 0, t = 0;
    var RAYS = 15;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      c.width  = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = w + 'px'; c.style.height = h + 'px';
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // warm amber low on the horizon, pale gold once it has risen
    function warm(p, a) {
      var r = Math.round(232 + 18 * p);
      var g = Math.round(166 + 60 * p);
      var b = Math.round(96  + 90 * p);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }

    function frame(ts) {
      id = raf(frame);
      if (ts - last < 26) return;         // ~38fps, ample for this
      last = ts;
      t++;

      // the sun climbs from just under the fold to high on the page
      var climb = 0.10 + progress * 0.78;
      var cx = w * 0.5;
      var cy = h * (1.16 - climb);
      var breath = 0.5 + 0.5 * Math.sin(t * 0.011);

      x.clearRect(0, 0, w, h);

      // strata: the banded light of the mural on the wall of the room
      for (var s = 0; s < 3; s++) {
        var band = h * (0.62 + s * 0.16) - climb * h * 0.3;
        var bg = x.createLinearGradient(0, band - h * 0.18, 0, band + h * 0.18);
        bg.addColorStop(0, warm(climb, 0));
        bg.addColorStop(0.5, warm(climb, 0.05 - s * 0.012));
        bg.addColorStop(1, warm(climb, 0));
        x.fillStyle = bg;
        x.fillRect(0, band - h * 0.18, w, h * 0.36);
      }

      // rays, radiating evenly outward and breathing rather than sweeping
      var reach = Math.max(w, h) * 1.5;
      for (var i = 0; i < RAYS; i++) {
        var a0 = (i / RAYS) * Math.PI * 2 + t * 0.00035;
        var pulse = 0.55 + 0.45 * Math.sin(t * 0.013 + i * 1.7);
        var spread = 0.021 + 0.012 * pulse;
        var g = x.createRadialGradient(cx, cy, 0, cx, cy, reach);
        g.addColorStop(0,   warm(climb, 0.20 * pulse));
        g.addColorStop(0.3, warm(climb, 0.085 * pulse));
        g.addColorStop(1,   warm(climb, 0));
        x.beginPath();
        x.moveTo(cx, cy);
        x.arc(cx, cy, reach, a0 - spread, a0 + spread);
        x.closePath();
        x.fillStyle = g;
        x.fill();
      }

      // the disc, and the glow around it
      var halo = x.createRadialGradient(cx, cy, 0, cx, cy, h * (0.42 + 0.06 * breath));
      halo.addColorStop(0,   warm(climb, 0.34));
      halo.addColorStop(0.4, warm(climb, 0.12));
      halo.addColorStop(1,   warm(climb, 0));
      x.fillStyle = halo; x.fillRect(0, 0, w, h);

      var core = x.createRadialGradient(cx, cy, 0, cx, cy, h * 0.115);
      core.addColorStop(0,   warm(climb, 0.5));
      core.addColorStop(0.7, warm(climb, 0.18));
      core.addColorStop(1,   warm(climb, 0));
      x.fillStyle = core; x.fillRect(0, 0, w, h);

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
      document.hidden ? off() : on();
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

  function init() { sunrise(); hero(); reveals(); menu(); scroller(steps()); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))
    (function () { location.reload(); });
})();
