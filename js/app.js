document.addEventListener('DOMContentLoaded', function () {
  I18n.init();
  Header.init();
  HeroSlider.init();
  Calculator.init();
  Gallery.init();
  ContactForm.init();
  ScrollAnimations.init();
  SmoothScroll.init();
  Popup.init();
  initCertificateLightbox();
  initTeamSlider();

  // Lazy load Google Maps
  lazyLoadMap();
});

function initCertificateLightbox() {
  var lightbox = document.getElementById('certificateLightbox');
  if (!lightbox) return;

  var lightboxImg = lightbox.querySelector('img');
  var closeBtn = lightbox.querySelector('.certificate-lightbox__close');

  // Use event delegation on the certificates grid
  var grid = document.querySelector('.certificates__grid');
  if (grid) {
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.certificate__card');
      if (!card) return;
      var src = card.dataset.src || card.querySelector('img').src;
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

function initTeamSlider() {
  var slider = document.getElementById('teamSlider');
  var dotsContainer = document.getElementById('teamDots');
  if (!slider || !dotsContainer) return;

  var slides = slider.querySelectorAll('.team__slide');
  var dots = dotsContainer.querySelectorAll('.team__dot');
  var current = 0;
  var interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function startAutoplay() {
    interval = setInterval(next, 4000);
  }

  function resetAutoplay() {
    clearInterval(interval);
    startAutoplay();
  }

  dotsContainer.addEventListener('click', function (e) {
    var dot = e.target.closest('.team__dot');
    if (!dot) return;
    var idx = parseInt(dot.dataset.index, 10);
    if (!isNaN(idx) && idx !== current) {
      goTo(idx);
      resetAutoplay();
    }
  });

  startAutoplay();
}

function lazyLoadMap() {
  var mapContainer = document.getElementById('mapEmbed');
  if (!mapContainer || !mapContainer.dataset.src) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadMap(mapContainer);
          observer.unobserve(mapContainer);
        }
      });
    }, { rootMargin: '200px' });

    observer.observe(mapContainer);
  } else {
    loadMap(mapContainer);
  }
}

function loadMap(container) {
  var iframe = document.createElement('iframe');
  iframe.src = container.dataset.src;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.style.border = 'none';
  iframe.style.minHeight = '450px';
  iframe.loading = 'lazy';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  container.appendChild(iframe);
}
