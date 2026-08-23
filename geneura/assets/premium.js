/* Lythous premium — motion.
   One canvas draws everything: a slow lighthouse beam that turns as you scroll,
   cached warm blooms, drifting dust, and a pool of light that follows the pointer.
   Reduced motion switches all of it off. */
(function () {
  'use strict';
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = mq.matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf = window.requestAnimationFrame.bind(window);

  var scrollY = 0, scrollMax = 1, scrollProgress = 0;
  var ptrX = -1, ptrY = -1, easeX = -1, easeY = -1, hasPtr = false;

  /* ------------------------------------------------------------- the light */
  function light() {
    if (still) return;
    document.body.classList.add('has-ambient');

    var c = document.createElement('canvas');
    c.className = 'ambient';
    c.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(c, document.body.firstChild);
    var x = c.getContext('2d');

    // blooms are slow and expensive, so they live on their own buffer and get
    // repainted a few times a second rather than sixty
    var buf = document.createElement('canvas');
    var bx = buf.getContext('2d');

    var w = 0, h = 0, dpr = 1, motes = [], blooms = [], f = 0, id = null, last = 0;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth; h = window.innerHeight;
      c.width = buf.width = Math.floor(w * dpr);
      c.height = buf.height = Math.floor(h * dpr);
      c.style.width = w + 'px'; c.style.height = h + 'px';
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      bx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(); paintBlooms();
    }

    function seed() {
      var n = Math.round(Math.min(Math.max((w * h) / 26000, 24), 62));
      motes = [];
      for (var i = 0; i < n; i++) motes.push({
        x: Math.random() * w, y: Math.random() * h, r: .5 + Math.random() * 1.9,
        vx: -.04 + Math.random() * .17, vy: -.12 - Math.random() * .17,
        a: .04 + Math.random() * .18, ph: Math.random() * 6.28,
        sp: .004 + Math.random() * .008, z: .45 + Math.random() * .55
      });
      blooms = [
        { x: .14, y: .09, r: .64, c: '201,153,88',  a: .16 },
        { x: .86, y: .30, r: .56, c: '171,187,152', a: .10 },
        { x: .50, y: .92, r: .72, c: '216,178,120', a: .10 }
      ];
    }

    function paintBlooms() {
      bx.clearRect(0, 0, w, h);
      for (var i = 0; i < blooms.length; i++) {
        var B = blooms[i];
        var X = (B.x + Math.sin(f * .0009 + i) * .04) * w;
        var Y = (B.y + Math.cos(f * .0007 + i) * .04) * h;
        var R = B.r * Math.max(w, h) * .62;
        var g = bx.createRadialGradient(X, Y, 0, X, Y, R);
        g.addColorStop(0, 'rgba(' + B.c + ',' + B.a + ')');
        g.addColorStop(1, 'rgba(' + B.c + ',0)');
        bx.fillStyle = g; bx.fillRect(0, 0, w, h);
      }
    }

    // the lighthouse: two opposing cones from a source above the page,
    // turning slowly on their own and faster as you scroll
    function beam() {
      var ox = w * 0.5, oy = -h * 0.16;
      var ang = f * 0.0024 + scrollProgress * Math.PI * 2.4;
      var reach = Math.max(w, h) * 2.1;

      function cone(a0, spread, stops) {
        var g = x.createRadialGradient(ox, oy, 0, ox, oy, reach);
        for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
        x.beginPath();
        x.moveTo(ox, oy);
        x.arc(ox, oy, reach, a0 - spread, a0 + spread);
        x.closePath();
        x.fillStyle = g;
        x.fill();
      }

      for (var k = 0; k < 2; k++) {
        var a0 = ang + k * Math.PI;
        // wide soft body
        cone(a0, 0.235, [
          [0,   'rgba(255,238,208,.62)'],
          [.26, 'rgba(251,227,188,.38)'],
          [.62, 'rgba(234,203,157,.19)'],
          [1,   'rgba(234,203,157,0)']
        ]);
        // bright core, so the beam has an edge instead of a haze
        cone(a0, 0.062, [
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
    }

    function frame(ts) {
      id = raf(frame);
      if (ts - last < 24) return;            // ~40fps is plenty for this
      last = ts;
      f++;

      x.clearRect(0, 0, w, h);
      if (f % 18 === 0) paintBlooms();
      x.drawImage(buf, 0, 0, w, h);
      beam();

      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx * m.z; m.y += m.vy * m.z; m.ph += m.sp;
        if (m.y < -14) { m.y = h + 12; m.x = Math.random() * w; }
        if (m.x > w + 14) m.x = -12;
        if (m.x < -14) m.x = w + 12;
        var a = m.a * (.5 + .5 * Math.sin(m.ph)) * m.z;
        x.beginPath(); x.arc(m.x, m.y, m.r, 0, 6.2832);
        x.fillStyle = 'rgba(190,150,96,' + a.toFixed(3) + ')'; x.fill();
      }

      if (hasPtr) {
        easeX += (ptrX - easeX) * .09;
        easeY += (ptrY - easeY) * .09;
        var r = Math.min(w, h) * .42;
        var pg = x.createRadialGradient(easeX, easeY, 0, easeX, easeY, r);
        pg.addColorStop(0,  'rgba(255,240,214,.30)');
        pg.addColorStop(.45,'rgba(250,226,190,.13)');
        pg.addColorStop(1,  'rgba(250,226,190,0)');
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
        if (!hasPtr) { easeX = ptrX; easeY = ptrY; hasPtr = true; }
      }, { passive: true });
    }
  }

  /* ------------------------------- portraits lift as the light passes them */
  function portraits() {
    if (still || !fine) return;
    var people = [].slice.call(document.querySelectorAll('.person'));
    if (!people.length) return;
    var pending = false;
    function upd() {
      pending = false;
      var reach = 260;
      for (var i = 0; i < people.length; i++) {
        var el = people[i], r = el.getBoundingClientRect();
        if (r.bottom < -reach || r.top > window.innerHeight + reach) {
          if (el.style.getPropertyValue('--lit') !== '0') el.style.setProperty('--lit', '0');
          continue;
        }
        var dx = easeX - (r.left + r.width / 2);
        var dy = easeY - (r.top + r.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        // quantise: filter changes repaint, so only write when it visibly moves
        var v = (Math.round(Math.max(0, 1 - d / reach) * 20) / 20).toFixed(2);
        if (el.style.getPropertyValue('--lit') !== v) el.style.setProperty('--lit', v);
      }
    }
    window.addEventListener('pointermove', function () {
      if (!pending) { pending = true; raf(upd); }
    }, { passive: true });
    window.addEventListener('scroll', function () {
      if (!pending) { pending = true; raf(upd); }
    }, { passive: true });
  }

  /* ---------------------------------------------------------- hero entrance */
  function hero() {
    var el = document.querySelector('.hero-in');
    if (!el) return;
    var h1 = el.querySelector('h1');
    if (h1 && !still) {
      h1.innerHTML = h1.textContent.trim().split(/\s+/).map(function (word, i) {
        return '<span class="wm"><span style="transition-delay:' + (90 + i * 52) + 'ms">' +
               word + '</span></span>';
      }).join(' ');
    }
    ['.eyebrow', '.lede', '.hero-cta'].forEach(function (sel, i) {
      var n = el.querySelector(sel);
      if (n) { n.classList.add('fade'); n.style.transitionDelay = (still ? 0 : 560 + i * 130) + 'ms'; }
    });
    setTimeout(function () { el.classList.add('lit'); }, still ? 0 : 70);
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
        ch.style.transitionDelay = (i * 80) + 'ms';
      });
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* ------------------------------------------------------ pinned sequence */
  function pinned() {
    var wrap = document.querySelector('.pin-wrap');
    if (!wrap) return;
    var steps = wrap.querySelectorAll('.pin-step');
    var bars  = wrap.querySelectorAll('.pin-bars i');
    var count = wrap.querySelector('.pin-count');
    // .art, not img: these became line drawings and the old selector
    // silently matched nothing, so every step showed the first one
    var shots = wrap.querySelectorAll('.pin-visual .art');
    if (still || !steps.length) {
      Array.prototype.forEach.call(steps, function (s) { s.classList.add('on'); });
      return;
    }
    wrap.style.height = (steps.length * 78) + 'vh';
    var cur = -1;
    return function () {
      var r = wrap.getBoundingClientRect();
      var total = wrap.offsetHeight - window.innerHeight;
      var p = Math.min(Math.max(-r.top / (total || 1), 0), .9999);
      var i = Math.floor(p * steps.length);
      if (i === cur) return;
      cur = i;
      Array.prototype.forEach.call(steps, function (s, k) { s.classList.toggle('on', k === i); });
      Array.prototype.forEach.call(bars,  function (b, k) { b.classList.toggle('done', k <= i); });
      Array.prototype.forEach.call(shots, function (im, k) { im.classList.toggle('on', k === i); });
      if (count) count.textContent = ('0' + (i + 1)).slice(-2);
    };
  }

  /* ------------------------------- one scroll handler drives everything else */
  function scroller(pinUpdate) {
    var head = document.querySelector('.site-head');
    var heroImg = document.querySelector('.hero-media img');
    var pars = document.querySelectorAll('[data-par]');
    var bar = document.createElement('div');
    bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var pending = false;

    function upd() {
      pending = false;
      var d = document.documentElement;
      scrollY = window.pageYOffset || d.scrollTop;
      scrollMax = d.scrollHeight - d.clientHeight;
      scrollProgress = scrollMax > 0 ? scrollY / scrollMax : 0;
      bar.style.transform = 'scaleX(' + scrollProgress + ')';
      if (head) head.classList.toggle('stuck', scrollY > 40);
      if (pinUpdate) pinUpdate();
      if (!still) {
        if (heroImg && scrollY < window.innerHeight * 1.25)
          heroImg.style.transform = 'translate3d(0,' + (scrollY * .26).toFixed(1) + 'px,0)';
        var vh = window.innerHeight;
        Array.prototype.forEach.call(pars, function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < -120 || r.top > vh + 120) return;
          var off = (r.top + r.height / 2 - vh / 2) / vh;
          el.style.transform =
            'translate3d(0,' + (-off * (parseFloat(el.dataset.par) || 14)).toFixed(1) + 'px,0)';
        });
      }
    }
    window.addEventListener('scroll', function () {
      if (!pending) { pending = true; raf(upd); }
    }, { passive: true });
    window.addEventListener('resize', upd, { passive: true });
    upd();
  }

  /* --------------------------------------------------------- magnetic btns */
  function magnetic() {
    if (still || !fine) return;
    document.querySelectorAll('.btn-lg,.help-dock').forEach(function (el) {
      var qx = 0, qy = 0, pending = false;
      function apply() { pending = false; el.style.transform = 'translate(' + qx + 'px,' + qy + 'px)'; }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        qx = (((e.clientX - (r.left + r.width / 2)) / r.width) * 9).toFixed(1);
        qy = (((e.clientY - (r.top + r.height / 2)) / r.height) * 7).toFixed(1);
        if (!pending) { pending = true; raf(apply); }   // never write style per raw event
      }, { passive: true });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; }, { passive: true });
    });
  }

  function init() {
    light(); hero(); reveals(); portraits();
    scroller(pinned()); magnetic();
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))
    (function () { location.reload(); });
})();
