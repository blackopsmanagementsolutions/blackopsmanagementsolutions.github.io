/* Lythous — motion
   Ambient background: dust in a shaft of morning light, taken from the room.
   Foreground: one orchestrated hero sequence, staggered reveals, a diagram that
   assembles, and parallax. Everything yields to prefers-reduced-motion. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = reduce.matches;

  /* ---------------------------------------------------------- ambient canvas */
  function ambient() {
    if (still) return;

    var c = document.createElement('canvas');
    c.className = 'ambient';
    c.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(c, document.body.firstChild);
    document.body.classList.add('has-ambient');

    var ctx = c.getContext('2d', { alpha: true });
    var w = 0, h = 0, dpr = 1, motes = [], blooms = [], raf = null, t = 0;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = window.innerWidth; h = window.innerHeight;
      c.width = Math.floor(w * dpr); c.height = Math.floor(h * dpr);
      c.style.width = w + 'px'; c.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      // density scaled to viewport, capped so phones stay smooth
      var n = Math.round(Math.min(Math.max((w * h) / 26000, 26), 78));
      motes = [];
      for (var i = 0; i < n; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.9,
          // drift: slow, upward-ish, as dust does in still warm air
          vx: -0.06 + Math.random() * 0.22,
          vy: -0.16 - Math.random() * 0.20,
          a: 0.05 + Math.random() * 0.20,
          ph: Math.random() * Math.PI * 2,
          sp: 0.004 + Math.random() * 0.010
        });
      }
      blooms = [
        { x: 0.16, y: 0.10, r: 0.62, hue: '198,150,86',  a: 0.16, dx: 0.00007, dy: 0.00005 },
        { x: 0.84, y: 0.30, r: 0.55, hue: '176,190,158', a: 0.11, dx: -0.00005, dy: 0.00008 },
        { x: 0.52, y: 0.88, r: 0.70, hue: '214,176,120', a: 0.10, dx: 0.00006, dy: -0.00004 }
      ];
    }

    function frame() {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      // warm light blooms, drifting on long cycles
      for (var b = 0; b < blooms.length; b++) {
        var B = blooms[b];
        var cx = (B.x + Math.sin(t * B.dx * 60) * 0.05) * w;
        var cy = (B.y + Math.cos(t * B.dy * 60) * 0.05) * h;
        var rr = B.r * Math.max(w, h) * 0.6;
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        g.addColorStop(0, 'rgba(' + B.hue + ',' + B.a + ')');
        g.addColorStop(1, 'rgba(' + B.hue + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // dust
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx; m.y += m.vy; m.ph += m.sp;
        if (m.y < -12) { m.y = h + 10; m.x = Math.random() * w; }
        if (m.x > w + 12) m.x = -10;
        if (m.x < -12) m.x = w + 10;
        var tw = m.a * (0.55 + 0.45 * Math.sin(m.ph));   // slow twinkle
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(186,146,92,' + tw.toFixed(3) + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    size();
    start();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(size, 160);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();          // never burn cycles in a hidden tab
    });
  }

  /* ------------------------------------------------------------- reveals */
  function reveals() {
    var els = document.querySelectorAll('.rv');
    if (still || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });

    // stagger children of any group marked .stagger
    var groups = document.querySelectorAll('.stagger');
    Array.prototype.forEach.call(groups, function (g) {
      Array.prototype.forEach.call(g.children, function (child, i) {
        child.style.transitionDelay = still ? '0ms' : (i * 70) + 'ms';
      });
    });
  }

  /* --------------------------------------------------------- hero sequence */
  function hero() {
    var h = document.querySelector('.hero-in');
    if (!h) return;
    if (still) { h.classList.add('lit'); return; }
    // one orchestrated entrance rather than scattered effects.
    // deliberately not rAF: that never fires in a background tab, which would
    // leave the headline invisible for anyone opening the link in one.
    setTimeout(function () { h.classList.add('lit'); }, 90);
  }

  /* ------------------------------------------------------- diagram assembly */
  function diagram() {
    var fig = document.querySelector('[data-diagram]');
    if (!fig) return;
    if (still || !('IntersectionObserver' in window)) { fig.classList.add('drawn'); return; }
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { fig.classList.add('drawn'); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(fig);
  }

  /* ------------------------------------------------------------- parallax */
  function parallax() {
    if (still) return;
    var items = document.querySelectorAll('[data-par]');
    if (!items.length) return;
    var ticking = false;

    function apply() {
      var vh = window.innerHeight;
      Array.prototype.forEach.call(items, function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) return;
        var mid = r.top + r.height / 2;
        var off = (mid - vh / 2) / vh;                 // -1 .. 1 through viewport
        var amt = parseFloat(el.getAttribute('data-par')) || 14;
        el.style.transform = 'translate3d(0,' + (-off * amt).toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    window.addEventListener('resize', apply, { passive: true });
    apply();
  }

  /* --------------------------------------------------------- scroll progress */
  function progress() {
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function upd() {
      var d = document.documentElement;
      var max = d.scrollHeight - d.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? (d.scrollTop || window.pageYOffset) / max : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  }

  function init() {
    ambient(); reveals(); hero(); diagram(); parallax(); progress();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  // honour a mid-session change of the OS setting
  (reduce.addEventListener ? reduce.addEventListener.bind(reduce, 'change')
                           : reduce.addListener.bind(reduce))(function () {
    location.reload();
  });
})();
