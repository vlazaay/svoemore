const Header = (function () {
  let header, burger, nav;

  function init() {
    header = document.getElementById('header');
    burger = document.getElementById('burgerBtn');
    nav = document.getElementById('mainNav');

    if (!header) return;

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (burger) {
      burger.addEventListener('click', toggleMenu);
    }

    // Close menu on link click
    nav.querySelectorAll('.header__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close menu on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  function onScroll() {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  function toggleMenu() {
    burger.classList.toggle('active');
    nav.classList.toggle('mobile-open');
    document.body.classList.toggle('menu-open');
  }

  function closeMenu() {
    burger.classList.remove('active');
    nav.classList.remove('mobile-open');
    document.body.classList.remove('menu-open');
  }

  return { init };
})();
