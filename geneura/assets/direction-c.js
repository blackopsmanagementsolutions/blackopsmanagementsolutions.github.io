/* Lythous — Direction C.
   The page moves from night to first light as you read: --dawn runs 0 to 1
   across the story. Each beat of the story lights the margin note that belongs
   to it, so the institutional facts arrive where the story earns them. */
(function () {
  'use strict';
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = mq.matches;
  var raf = window.requestAnimationFrame.bind(window);

  /* ------------------------------------------------------------- reveals */
  function reveals() {
    var els = document.querySelectorAll('.rv,.stag,.pic');
    if (still || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add('in'); });
      return;
    }
    document.querySelectorAll('.stag').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.style.transitionDelay = (i * 55) + 'ms';
      });
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
    Array.prototype.forEach.call(els, function (e) { io.observe(e); });
  }

  /* ---------------------------- the story lights its own margin as you read */
  function story() {
    var beats = document.querySelectorAll('.beat');
    var notes = document.querySelectorAll('.margin .note');
    if (!beats.length) return null;
    if (still) {
      Array.prototype.forEach.call(beats, function (b) { b.classList.add('lit'); });
      Array.prototype.forEach.call(notes, function (n) { n.classList.add('on'); });
      return null;
    }
    var cur = -1;
    return function () {
      var mid = window.innerHeight * 0.42, best = 0, bestD = Infinity;
      for (var i = 0; i < beats.length; i++) {
        var r = beats[i].getBoundingClientRect();
        var d = Math.abs((r.top + r.height / 2) - mid);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best === cur) return;
      cur = best;
      Array.prototype.forEach.call(beats, function (b, k) { b.classList.toggle('lit', k === best); });
      // a beat can name the note it belongs to; otherwise nothing changes
      var want = beats[best].getAttribute('data-note');
      if (want !== null) {
        Array.prototype.forEach.call(notes, function (n) {
          n.classList.toggle('on', n.getAttribute('data-note') === want);
        });
      }
    };
  }

  /* --------------------------------------------------------- night to dawn */
  function scroller(storyUpdate) {
    var head = document.querySelector('.head');
    var root = document.documentElement;
    var pending = false;

    function upd() {
      pending = false;
      var y = window.pageYOffset || root.scrollTop;
      var max = root.scrollHeight - root.clientHeight;
      var p = max > 0 ? y / max : 0;
      // hold the night a while, then lift steadily, so dawn is earned
      var dawn = Math.max(0, Math.min((p - 0.12) / 0.72, 1));
      root.style.setProperty('--dawn', dawn.toFixed(3));
      if (head) head.classList.toggle('stuck', y > 30);
      if (storyUpdate) storyUpdate();
    }
    window.addEventListener('scroll', function () {
      if (!pending) { pending = true; raf(upd); }
    }, { passive: true });
    window.addEventListener('resize', upd, { passive: true });
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

  function init() { reveals(); menu(); scroller(story()); }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init) : init();
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))
    (function () { location.reload(); });
})();
