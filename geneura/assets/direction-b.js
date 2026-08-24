/* Lythous — Direction B.
   Motion here is mechanical rather than atmospheric: rules draw, figures count
   up, the plan responds to selection. No ambient canvas, on purpose. */
(function () {
  'use strict';
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = mq.matches;
  var raf = window.requestAnimationFrame.bind(window);

  /* ------------------------------------------------------------- reveals */
  function reveals() {
    var els = document.querySelectorAll('.rv,.stag,.pic,.rule');
    if (still || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add('in'); });
      return;
    }
    document.querySelectorAll('.stag').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.style.transitionDelay = (i * 45) + 'ms';
      });
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: .04 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* -------------------------------------------------------- counting up */
  function counters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (still || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (e) {
        e.textContent = e.getAttribute('data-count');
      });
      return;
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = el.getAttribute('data-count');
        var suffix = el.getAttribute('data-suffix') || '';
        var n = parseInt(target, 10);
        if (isNaN(n)) { el.textContent = target; return; }
        var start = null, dur = 900;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          // ease out, so it settles rather than stops
          var v = Math.round(n * (1 - Math.pow(1 - p, 3)));
          el.textContent = v + suffix;
          if (p < 1) raf(tick);
        }
        raf(tick);
      });
    }, { threshold: .5 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* ------------------------------------------------------- the floor plan */
  function plan() {
    var zones = document.querySelectorAll('.zone');
    var btns  = document.querySelectorAll('.zone-btn');
    if (!zones.length) return;

    function select(i) {
      Array.prototype.forEach.call(zones, function (z, k) { z.classList.toggle('on', k === i); });
      Array.prototype.forEach.call(btns,  function (b, k) {
        b.classList.toggle('on', k === i);
        b.setAttribute('aria-expanded', k === i ? 'true' : 'false');
      });
    }
    Array.prototype.forEach.call(zones, function (z, i) {
      z.addEventListener('mouseenter', function () { select(i); });
      z.addEventListener('click', function () { select(i); });
    });
    Array.prototype.forEach.call(btns, function (b, i) {
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('mouseenter', function () { select(i); });
    });
    select(0);
  }

  /* ------------------------------------------------------------- header */
  function head() {
    var h = document.querySelector('.head');
    var pending = false;
    function upd() {
      pending = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (h) h.classList.toggle('stuck', y > 30);
    }
    window.addEventListener('scroll', function () {
      if (!pending) { pending = true; raf(upd); }
    }, { passive: true });
    upd();
  }

  /* --------------------------------------------------------- mobile menu */
  function menu() {
    var btn = document.querySelector('.menu-btn');
    var nav = document.querySelector('.mnav');
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

  function init() { reveals(); counters(); plan(); head(); menu(); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))
    (function () { location.reload(); });
})();
