/* In-page sheets.

   Nothing on this page navigates away. Anything with data-sheet="<id>" opens the
   hidden block with that id inside a native <dialog>, which gives us the focus
   trap, Escape to close, the top layer and focus restored to the trigger without
   reimplementing any of it.

   The content lives in the HTML rather than in this file, so it stays editable by
   anyone working on the page and is present in the document for anything that
   reads it. */

(function () {
  'use strict';

  var dlg = document.getElementById('sheet');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  var body = dlg.querySelector('.sheet-in');
  var slot = document.getElementById('sheet-slot');

  function open (id) {
    var src = document.getElementById('sheet-' + id);
    if (!src) return;

    slot.innerHTML = src.innerHTML;

    var h = slot.querySelector('h3');
    if (h) {
      if (!h.id) h.id = 'sheet-title-' + id;
      dlg.setAttribute('aria-labelledby', h.id);
    } else {
      dlg.removeAttribute('aria-labelledby');
    }

    /* stop the page scrolling behind the dialog. body keeps its scroll position
       because nothing here is positioned fixed, so there is nothing to restore. */
    document.body.style.overflow = 'hidden';

    dlg.showModal();
    body.scrollTop = 0;
  }

  function shut () {
    document.body.style.overflow = '';
  }

  /* Watch the open attribute rather than listening for close and cancel.
     Those events do not fire reliably in every runtime this page has to survive,
     and a missed one leaves the page permanently unscrollable, which is a far
     worse failure than any it would have saved. The attribute is the truth: it
     covers close(), Escape, and a form submitting with method="dialog" alike. */
  new MutationObserver(function () {
    if (!dlg.open) shut();
  }).observe(dlg, { attributes: true, attributeFilter: ['open'] });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-sheet]');
    if (t) {
      e.preventDefault();
      open(t.getAttribute('data-sheet'));
      return;
    }
    if (e.target.closest('[data-sheet-close]')) { dlg.close(); return; }

    /* clicking the backdrop closes: the dialog element fills the viewport, so a
       click landing on it rather than on the panel inside it is a backdrop click */
    if (e.target === dlg) dlg.close();
  });

  /* a link inside a sheet that points at an anchor on this page should close the
     sheet and travel there, rather than scrolling underneath it */
  slot.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    dlg.close();
    window.requestAnimationFrame(function () {
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

})();
