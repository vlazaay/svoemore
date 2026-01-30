const Gallery = (function () {
  var grid, items, lightbox, lightboxImg, currentIndex;

  function init() {
    grid = document.getElementById('galleryGrid');
    if (!grid) return;

    items = Array.from(grid.querySelectorAll('.gallery__item'));

    // Filters
    document.querySelectorAll('.gallery__filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.gallery__filter').forEach(function (b) {
          b.classList.remove('active');
        });
        this.classList.add('active');
        filterItems(this.dataset.filter);
      });
    });

    // Lightbox
    createLightbox();

    items.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index);
      });
    });
  }

  function filterItems(category) {
    items.forEach(function (item) {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  function createLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
      '<button class="lightbox__close" aria-label="Закрити">&times;</button>' +
      '<button class="lightbox__nav lightbox__prev" aria-label="Попередня">&lsaquo;</button>' +
      '<img class="lightbox__img" src="" alt="">' +
      '<button class="lightbox__nav lightbox__next" aria-label="Наступна">&rsaquo;</button>';
    document.body.appendChild(lightbox);

    lightboxImg = lightbox.querySelector('.lightbox__img');

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', function () { navigate(-1); });
    lightbox.querySelector('.lightbox__next').addEventListener('click', function () { navigate(1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  function openLightbox(index) {
    currentIndex = index;
    var visibleItems = getVisibleItems();
    if (!visibleItems.length) return;

    var img = visibleItems[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    var visibleItems = getVisibleItems();
    currentIndex = (currentIndex + dir + visibleItems.length) % visibleItems.length;
    var img = visibleItems[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }

  function getVisibleItems() {
    return items.filter(function (item) {
      return item.style.display !== 'none';
    });
  }

  return { init };
})();
