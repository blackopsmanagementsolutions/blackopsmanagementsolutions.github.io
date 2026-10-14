(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.site-nav');
  const progress = document.querySelector('[data-progress]');
  const heroTitle = document.querySelector('.hero-title');
  const heroImage = document.querySelector('[data-parallax]');
  const method = document.querySelector('[data-method]');
  const methodSteps = method ? [...method.querySelectorAll('.method-step')] : [];
  const animatedItems = [...document.querySelectorAll('.reveal, .display')];

  const showEverything = () => {
    root.classList.remove('motion-ready');
    animatedItems.forEach((item) => item.classList.add('is-visible'));
    if (heroTitle) heroTitle.classList.add('is-visible');
  };

  const failSafe = window.setTimeout(showEverything, 3500);

  try {
    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
      root.classList.add('motion-ready');
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

      animatedItems.forEach((item) => revealObserver.observe(item));
      if (heroTitle) requestAnimationFrame(() => heroTitle.classList.add('is-visible'));
    } else {
      showEverything();
    }

    document.body.classList.add('is-loaded');
    window.clearTimeout(failSafe);
  } catch (error) {
    showEverything();
  }

  const closeMenu = (returnFocus = false) => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.style.overflow = '';
    if (returnFocus) menuButton.focus();
  };

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const opening = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(opening));
      menu.classList.toggle('is-open', opening);
      document.body.style.overflow = opening ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', (event) => {
      if (!menu.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = [menuButton, ...menu.querySelectorAll('a[href]')]
        .filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    });
    const mobileNavigation = window.matchMedia('(max-width: 820px)');
    mobileNavigation.addEventListener?.('change', (event) => {
      if (!event.matches) closeMenu();
    });
  }

  let ticking = false;
  const updateScrollEffects = () => {
    const y = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    if (header) header.classList.toggle('is-scrolled', y > 28);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;

    if (heroImage && !reducedMotion.matches && !coarsePointer.matches && y < window.innerHeight * 1.25) {
      heroImage.style.transform = `translate3d(0, ${Math.min(34, y * .045)}px, 0) scale(${Math.max(1, 1.035 - y * .00004)})`;
    }

    if (method && methodSteps.length) {
      const rect = method.getBoundingClientRect();
      const position = Math.max(0, Math.min(0.999, (window.innerHeight * .7 - rect.top) / Math.max(rect.height, 1)));
      const active = Math.min(methodSteps.length - 1, Math.floor(position * methodSteps.length));
      methodSteps.forEach((step, index) => step.classList.toggle('is-current', index <= active));
      method.style.setProperty('--method-progress', `${((active + 1) / methodSteps.length) * 100}%`);
    }
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollEffects);
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  reducedMotion.addEventListener?.('change', () => {
    showEverything();
    if (heroImage) heroImage.style.transform = '';
  });
  updateScrollEffects();

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
