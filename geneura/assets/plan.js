/* The room plan. Ported from Direction B, rewired for accessibility.

   B made each SVG zone a tabbable role="button" inside an svg carrying
   role="img", which cancels itself out: role="img" makes the whole subtree
   presentational, so the zones were focusable but never announced, and nothing
   handled Enter or Space. Here the SVG is decorative and the list beneath it is
   the real control: five ordinary buttons, keyboard native, every zone name and
   description already in the text. Pointing at the drawing still selects, which
   is what a mouse expects. */

(function () {
  'use strict';

  var zones = document.querySelectorAll('.zone');
  var btns  = document.querySelectorAll('.zone-btn');
  if (!zones.length || !btns.length) return;

  function select(i) {
    Array.prototype.forEach.call(zones, function (z, k) {
      z.classList.toggle('on', k === i);
    });
    Array.prototype.forEach.call(btns, function (b, k) {
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
    b.addEventListener('focus', function () { select(i); });
  });

  select(0);
})();
