const HeroSlider = (function () {
  let slides, current, timer;
  var INTERVAL = 5000;

  function init() {
    slides = document.querySelectorAll('.hero__slide');
    if (slides.length < 2) return;

    current = 0;
    startAutoplay();

    // Pause on hover
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stopAutoplay);
      hero.addEventListener('mouseleave', startAutoplay);
    }
  }

  function next() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(next, INTERVAL);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  return { init };
})();
