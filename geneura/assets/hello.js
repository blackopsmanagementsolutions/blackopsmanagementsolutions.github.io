/* ----------------------------------------------------------------- hello.js
   The whole student page has one job: get somebody to make contact. So the ask
   follows them down it.

   Both buttons stay out of the way at the two moments they would be noise:
   while the hero is on screen, where the same two asks already sit and in the
   header above it, and while the ways to make contact are on screen, where
   "Say hello" would cover the very thing it points at.

   Uses IntersectionObserver rather than a scroll handler, so nothing runs on
   the main thread between the moments the state actually changes. */

(function () {
  /* the pair moves together. While the hero is on screen the same two asks are
     already in it and in the header, so nothing is lost by holding these back
     until it has gone. */
  var btn = document.querySelector('.float-cta') || document.querySelector('.hello');
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
