const SmoothScroll = (function () {
  var headerHeight;

  function init() {
    headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;

    // Intercept anchor clicks
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    // Active nav tracking
    if ('IntersectionObserver' in window) {
      var sections = document.querySelectorAll('section[id]');
      var navLinks = document.querySelectorAll('.header__link');

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            navLinks.forEach(function (link) {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
              }
            });
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '-' + headerHeight + 'px 0px -40% 0px'
      });

      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  }

  return { init: init };
})();
