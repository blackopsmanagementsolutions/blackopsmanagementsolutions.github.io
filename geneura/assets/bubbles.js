/* --------------------------------------------------------------- bubbles.js
   The six services in "The problem" float on their own paths and give way to
   the pointer. The argument of the section is that nothing connects them, so
   nothing here is synchronised: every bubble gets its own frequencies, phases
   and amplitudes, and the two axes run at different rates, so the paths are
   Lissajous curves rather than circles. They drift apart and never line up.

   The CSS keyframe in gap.css is the no-JS fallback. When this takes over it
   adds .js-on, which switches that animation off so the two do not compound.

   Two things worth knowing if you edit this:

   - Distances are measured from each bubble's UNDISPLACED centre, taken from
     offsetLeft/offsetTop, which transforms do not affect. Measuring from the
     live rect would feed the push back into itself and set them oscillating.
   - Every rect is read before any transform is written. Interleaving the two
     forces a style recalculation per bubble per frame.

   Runs only where the bubbles are absolutely placed (the wide layout), while
   the section is on screen and the tab is visible, and never under
   prefers-reduced-motion. */

(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wrap = document.querySelector('.bubbles');
  if (!wrap || reduce || !window.requestAnimationFrame) return;

  var items = Array.prototype.slice.call(wrap.children);
  if (!items.length) return;

  /* per bubble, deliberately unrelated numbers */
  var SEED = [
    { ax: 19, ay: 25, fx: 0.081, fy: 0.053, px: 0.0, py: 1.7 },
    { ax: 27, ay: 17, fx: 0.062, fy: 0.091, px: 2.3, py: 0.4 },
    { ax: 16, ay: 28, fx: 0.099, fy: 0.067, px: 4.1, py: 3.2 },
    { ax: 24, ay: 20, fx: 0.049, fy: 0.079, px: 1.2, py: 5.0 },
    { ax: 29, ay: 18, fx: 0.073, fy: 0.101, px: 5.6, py: 2.1 },
    { ax: 18, ay: 26, fx: 0.089, fy: 0.058, px: 3.4, py: 4.4 },
    { ax: 22, ay: 21, fx: 0.057, fy: 0.085, px: 0.9, py: 2.8 },
    { ax: 26, ay: 15, fx: 0.094, fy: 0.061, px: 4.7, py: 5.5 },
    { ax: 17, ay: 24, fx: 0.068, fy: 0.096, px: 2.0, py: 1.1 },
    { ax: 21, ay: 19, fx: 0.104, fy: 0.072, px: 5.2, py: 3.9 }
  ];

  var REACH = 150;   /* how close the pointer must get, in px */
  var SHOVE = 78;    /* how far a bubble is pushed at closest range */
  var EASE = 0.07;   /* how quickly it gives way, and drifts back */

  var state = items.map(function (el, i) {
    return { el: el, s: SEED[i % SEED.length], cx: 0, cy: 0, rx: 0, ry: 0 };
  });

  var pointer = { x: 0, y: 0, live: false };
  var running = false, onScreen = false, floating = false, raf = 0, t0 = 0;

  /* the bubbles only take absolute positions on the wide layout; in the
     wrapped layout they sit in flow and this leaves them alone */
  function layoutIsFloating() {
    return getComputedStyle(items[0]).position === 'absolute';
  }

  /* centre of each bubble relative to the container, ignoring any transform */
  function measure() {
    for (var i = 0; i < state.length; i++) {
      var el = state[i].el;
      state[i].cx = el.offsetLeft + el.offsetWidth / 2;
      state[i].cy = el.offsetTop + el.offsetHeight / 2;
    }
  }

  function clear() {
    for (var i = 0; i < state.length; i++) {
      state[i].rx = state[i].ry = 0;
      state[i].el.style.transform = '';
    }
    wrap.classList.remove('js-on');
  }

  function frame(now) {
    if (!running) return;
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;

    /* every read first, then every write. Centres are re-taken each frame
       rather than cached from start(): a cached measurement goes stale the
       moment anything above the section changes height, and then only the
       bubbles that happen to still be where they were will answer the
       pointer. offsetLeft ignores transforms, so this stays honest. */
    var box = wrap.getBoundingClientRect();
    var px = pointer.x - box.left;
    var py = pointer.y - box.top;

    for (var m = 0; m < state.length; m++) {
      state[m].cx = state[m].el.offsetLeft + state[m].el.offsetWidth / 2;
      state[m].cy = state[m].el.offsetTop + state[m].el.offsetHeight / 2;
    }

    for (var i = 0; i < state.length; i++) {
      var b = state[i], s = b.s;

      /* ambient: two axes, unrelated rates */
      var ax = Math.sin(t * s.fx * 2 * Math.PI + s.px) * s.ax;
      var ay = Math.cos(t * s.fy * 2 * Math.PI + s.py) * s.ay;

      /* pointer: push straight away, hardest when closest */
      var tx = 0, ty = 0;
      if (pointer.live) {
        var dx = b.cx - px;
        var dy = b.cy - py;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < REACH && d > 0.001) {
          var force = (1 - d / REACH) * SHOVE;
          tx = (dx / d) * force;
          ty = (dy / d) * force;
        }
      }
      b.rx += (tx - b.rx) * EASE;
      b.ry += (ty - b.ry) * EASE;

      b.el.style.transform =
        'translate3d(' + (ax + b.rx).toFixed(2) + 'px,' + (ay + b.ry).toFixed(2) + 'px,0)';
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    t0 = 0;
    measure();
    wrap.classList.add('js-on');
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function sync() {
    var was = floating;
    floating = layoutIsFloating();
    if (!floating) {
      if (was) { stop(); clear(); }
      return;
    }
    if (onScreen && document.visibilityState !== 'hidden') start();
    else stop();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[entries.length - 1].isIntersecting;
      sync();
    }, { rootMargin: '140px' }).observe(wrap);
  } else {
    onScreen = true;
  }

  document.addEventListener('visibilitychange', sync);

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.live = true;
  }, { passive: true });

  /* the pointer leaving the document, not the window losing focus */
  document.addEventListener('pointerleave', function () { pointer.live = false; }, { passive: true });
  document.addEventListener('mouseleave', function () { pointer.live = false; }, { passive: true });
  window.addEventListener('blur', function () { pointer.live = false; });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { sync(); if (running) measure(); }, 150);
  }, { passive: true });

  sync();
})();
