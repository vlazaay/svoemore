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

  // Lazy load Google Maps
  lazyLoadMap();
});

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
