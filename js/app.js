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
  var gallery = document.getElementById('teamGallery');
  if (!gallery) return;

  var mainImg = document.getElementById('teamMainImg');
  var thumbs = gallery.querySelectorAll('.team__thumb');
  var images = [];
  var current = 0;

  thumbs.forEach(function (t) {
    images.push(t.querySelector('img').src);
  });

  // Click thumbnail → set as main
  gallery.querySelector('.team__thumbs').addEventListener('click', function (e) {
    var thumb = e.target.closest('.team__thumb');
    if (!thumb) return;
    var idx = parseInt(thumb.dataset.index, 10);
    if (isNaN(idx) || idx === current) return;
    setActive(idx);
  });

  // Click main photo → open lightbox
  mainImg.addEventListener('click', function () {
    openLightbox(current);
  });

  function setActive(idx) {
    thumbs[current].classList.remove('active');
    current = idx;
    thumbs[current].classList.add('active');
    mainImg.src = images[current];
    mainImg.dataset.index = current;
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
    setActive(current);
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
