/* ----------------------------------------------------------------- hello.js
   The whole student page has one job: get somebody to make contact. So the ask
   follows them down it.

   It stays out of the way at the two moments it would be noise: while the hero
   is still on screen, where the same two buttons already sit, and while the
   ways to make contact or the emergency numbers are on screen, where it would
   cover the very thing it is pointing at.

   Uses IntersectionObserver rather than a scroll handler, so nothing runs on
   the main thread between the moments the state actually changes. */

(function () {
  var btn = document.querySelector('.hello');
  if (!btn || !('IntersectionObserver' in window)) return;

  var hero = document.getElementById('top');
  /* only the section it points at. Everywhere else it should be there, which
     is what "appears once you are past the hero" means in practice. */
  var quiet = ['ways'].map(function (id) { return document.getElementById(id); })
                      .filter(Boolean);
  if (hero) quiet.push(hero);
  if (!quiet.length) return;

  var covering = 0;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var was = e.target.dataset.helloHit === '1';
      if (e.isIntersecting === was) return;
      e.target.dataset.helloHit = e.isIntersecting ? '1' : '0';
      covering += e.isIntersecting ? 1 : -1;
    });
    if (covering < 0) covering = 0;
    btn.classList.toggle('on', covering === 0);
  }, { threshold: 0 });

  quiet.forEach(function (el) { io.observe(el); });
})();
