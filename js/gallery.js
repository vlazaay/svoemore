const Gallery = (function () {
  var modal, modalImg, modalName, modalLocation, modalDetails, modalCounter;
  var prevBtn, nextBtn, closeBtn;
  var currentProject = null;
  var currentProjectId = null;
  var currentIndex = 0;
  var touchStartX = 0;

  // Map from data-project id to i18n key prefix
  var PROJECT_I18N = {
    'pool-beach': 'projects.poolbeach',
    'morewell': 'projects.morewell',
    'admiral': 'projects.admiral',
    'dogoda': 'projects.dogoda',
    'lis-i-more': 'projects.lisimore',
    'fit-house': 'projects.fithouse',
    'good-zone': 'projects.goodzone',
    'dorozhnyk': 'projects.dorozhnyk',
    'kon-tiki': 'projects.kontiki',
    'biluga': 'projects.biluga',
    'grand-sofia': 'projects.grandsofia'
  };

  var PROJECTS = {
    'pool-beach': {
      images: generateImages('pool-beach', 5),
      name: 'POOL&BEACH',
      location: '',
      details: 'Основний басейн 49\u00d725м\nДитячий басейн 20\u00d720м'
    },
    'morewell': {
      images: generateImages('morewell', 5),
      name: 'MOREWELL',
      location: 'с. Толокунюк, Київська обл.',
      details: 'Основний басейн 50\u00d715м\nГлибина від 20 до 140 см\nДитячий басейн з водним ігровим комплексом'
    },
    'admiral': {
      images: generateImages('admiral', 9),
      name: 'ADMIRAL',
      location: '',
      details: 'Основний басейн 33\u00d715м\nПлавальний басейн 18\u00d715м (глибина 1.2-1.7м)\nДитячий басейн 15\u00d75м (глибина 20-60 см)'
    },
    'dogoda': {
      images: generateImages('dogoda', 17),
      name: 'DOGODA',
      location: 'с. Дзвінкове, Київська обл.',
      details: 'Розмір басейну 25\u00d712м\nГлибина від 1.2 до 1.5м'
    },
    'lis-i-more': {
      images: generateImages('lis-i-more', 5),
      name: 'ЛІС І МОРЕ',
      location: 'с. Глібівка, Київська обл.',
      details: 'Басейн 25\u00d716м\nДві розкішні SPA-зони з джакузі'
    },
    'fit-house': {
      images: generateImages('fit-house', 5),
      name: 'FIT HOUSE',
      location: 'м. Дніпро',
      details: 'Басейн 25\u00d715м\nШирина доріжки 2.5м\nГлибина від 1.8 до 2.5м'
    },
    'good-zone': {
      images: generateImages('good-zone', 8),
      name: 'GOOD ZONE',
      location: '',
      details: 'Басейн 23\u00d710м\nБасейн 25\u00d74м'
    },
    'dorozhnyk': {
      images: generateImages('dorozhnyk', 8),
      name: 'ДОРОЖНИК',
      location: '',
      details: 'Основний басейн 18\u00d78м'
    },
    'kon-tiki': {
      images: generateImages('kon-tiki', 3),
      name: 'КОН ТІКІ',
      location: '',
      details: 'Основний басейн 25\u00d710м (глибина 1.2-1.5м)\nАквапарк 40\u00d715м'
    },
    'biluga': {
      images: generateImages('biluga', 7),
      name: 'БІЛУГА',
      location: 'с. Персин, Запорізька обл.',
      details: 'Басейн з морською водою 680 м\u00b2\nГлибина від 1 до 1.7м\nДитячий аквапарк 330 м\u00b2'
    },
    'grand-sofia': {
      images: generateImages('grand-sofia', 5),
      name: 'GRAND SOFIA',
      location: 'Південний берег (Київське море)',
      details: 'Басейн 28\u00d78м'
    }
  };

  function generateImages(projectId, count) {
    var arr = [];
    for (var i = 1; i <= count; i++) {
      arr.push('assets/images/projects/' + projectId + '/' + i + '.jpg');
    }
    return arr;
  }

  function getTranslated(projectId, field) {
    var prefix = PROJECT_I18N[projectId];
    if (!prefix) return null;
    if (typeof I18n !== 'undefined' && I18n.translate) {
      var val = I18n.translate(prefix + '.' + field);
      if (val !== null && val !== undefined) return val;
    }
    return null;
  }

  function init() {
    var grid = document.getElementById('projectsGrid');
    if (!grid) return;

    createModal();

    // Event delegation on the grid
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.project__card');
      if (!card) return;
      var projectId = card.dataset.project;
      if (projectId && PROJECTS[projectId]) {
        openModal(projectId);
      }
    });
  }

  function createModal() {
    modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.id = 'projectModal';
    modal.innerHTML =
      '<div class="project-modal__content">' +
        '<button class="project-modal__close" aria-label="\u0417\u0430\u043a\u0440\u0438\u0442\u0438">&times;</button>' +
        '<div class="project-modal__gallery">' +
          '<button class="project-modal__nav project-modal__prev" aria-label="\u041f\u043e\u043f\u0435\u0440\u0435\u0434\u043d\u044f">&#8249;</button>' +
          '<img class="project-modal__img" src="" alt="" draggable="false">' +
          '<button class="project-modal__nav project-modal__next" aria-label="\u041d\u0430\u0441\u0442\u0443\u043f\u043d\u0430">&#8250;</button>' +
        '</div>' +
        '<div class="project-modal__counter"></div>' +
        '<div class="project-modal__info">' +
          '<h3 class="project-modal__name"></h3>' +
          '<p class="project-modal__location"></p>' +
          '<p class="project-modal__details"></p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    modalImg = modal.querySelector('.project-modal__img');
    modalName = modal.querySelector('.project-modal__name');
    modalLocation = modal.querySelector('.project-modal__location');
    modalDetails = modal.querySelector('.project-modal__details');
    modalCounter = modal.querySelector('.project-modal__counter');
    prevBtn = modal.querySelector('.project-modal__prev');
    nextBtn = modal.querySelector('.project-modal__next');
    closeBtn = modal.querySelector('.project-modal__close');

    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', function () { navigate(-1); });
    nextBtn.addEventListener('click', function () { navigate(1); });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Touch swipe
    var gallery = modal.querySelector('.project-modal__gallery');
    gallery.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    gallery.addEventListener('touchend', function (e) {
      var touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        navigate(diff > 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  function openModal(projectId) {
    currentProject = PROJECTS[projectId];
    currentProjectId = projectId;
    currentIndex = 0;
    updateModal();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    modalImg.src = '';
  }

  function navigate(dir) {
    if (!currentProject) return;
    var len = currentProject.images.length;
    currentIndex = (currentIndex + dir + len) % len;
    updateModal();
  }

  function updateModal() {
    if (!currentProject) return;
    modalImg.src = currentProject.images[currentIndex];

    var name = getTranslated(currentProjectId, 'name') || currentProject.name;
    var location = getTranslated(currentProjectId, 'location');
    if (location === null) location = currentProject.location || '';
    var details = getTranslated(currentProjectId, 'details') || currentProject.details;

    modalImg.alt = name;
    modalName.textContent = name;
    modalLocation.textContent = location;
    modalDetails.textContent = details;
    modalCounter.textContent = (currentIndex + 1) + ' / ' + currentProject.images.length;

    var single = currentProject.images.length <= 1;
    prevBtn.style.display = single ? 'none' : '';
    nextBtn.style.display = single ? 'none' : '';
    modalCounter.style.display = single ? 'none' : '';
  }

  return { init: init };
})();
