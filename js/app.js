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
  initTeamSlider();

  // Lazy load Google Maps
  lazyLoadMap();
});

function initTeamSlider() {
  var topSection = document.getElementById('teamGallery');
  if (!topSection) return;

  var images = [
    'assets/images/team/1.jpg',
    'assets/images/team/2.jpg',
    'assets/images/team/3.jpg',
    'assets/images/team/4.jpg',
    'assets/images/team/5.jpg',
    'assets/images/team/6.jpg'
  ];
  var current = 0;

  // Click hero photo → open lightbox at index 0 (group photo)
  var hero = topSection.querySelector('.team__hero');
  if (hero) {
    hero.addEventListener('click', function () {
      openLightbox(0);
    });
  }

  var thumbsContainer = document.querySelector('.team__thumbs');
  if (thumbsContainer) {
    thumbsContainer.addEventListener('click', function (e) {
      var card = e.target.closest('.team__card');
      if (!card) return;
      var idx = parseInt(card.dataset.index, 10);
      if (!isNaN(idx)) openLightbox(idx);
    });
  }

  // ---- Lightbox ----
  var lightbox, lbImg, lbCounter, lbTouchStartX;

  function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'team-lightbox';
    lightbox.innerHTML =
      '<div class="team-lightbox__content">' +
        '<button class="team-lightbox__close">&times;</button>' +
        '<button class="team-lightbox__nav team-lightbox__prev">&#8249;</button>' +
        '<img class="team-lightbox__img" src="" alt="" draggable="false">' +
        '<button class="team-lightbox__nav team-lightbox__next">&#8250;</button>' +
        '<div class="team-lightbox__counter"></div>' +
      '</div>';
    document.body.appendChild(lightbox);

    lbImg = lightbox.querySelector('.team-lightbox__img');
    lbCounter = lightbox.querySelector('.team-lightbox__counter');

    lightbox.querySelector('.team-lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.team-lightbox__prev').addEventListener('click', function () { navLightbox(-1); });
    lightbox.querySelector('.team-lightbox__next').addEventListener('click', function () { navLightbox(1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    });

    // Touch swipe
    var content = lightbox.querySelector('.team-lightbox__content');
    content.addEventListener('touchstart', function (e) {
      lbTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    content.addEventListener('touchend', function (e) {
      var diff = lbTouchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) navLightbox(diff > 0 ? 1 : -1);
    }, { passive: true });
  }

  function openLightbox(idx) {
    if (!lightbox) createLightbox();
    current = idx;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navLightbox(dir) {
    current = (current + dir + images.length) % images.length;
    updateLightbox();
  }

  function updateLightbox() {
    lbImg.src = images[current];
    lbCounter.textContent = (current + 1) + ' / ' + images.length;
  }
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
