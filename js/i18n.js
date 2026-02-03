const I18n = (function () {
  var currentLang = 'uk';
  var translations = {};

  function init() {
    // Load saved language
    var saved = localStorage.getItem('lang');
    if (saved && (saved === 'uk' || saved === 'en')) {
      currentLang = saved;
    }

    // Bind language buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchLang(this.dataset.lang);
      });

      // Set initial active state
      if (btn.dataset.lang === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // If not Ukrainian, load and apply translations
    if (currentLang !== 'uk') {
      loadLang(currentLang).then(function () {
        applyTranslations();
      });
    }
  }

  function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update button states
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update html lang attribute
    document.documentElement.lang = lang;

    if (lang === 'uk') {
      // Reload page to get original Ukrainian text
      location.reload();
      return;
    }

    loadLang(lang).then(function () {
      applyTranslations();
    });
  }

  function loadLang(lang) {
    if (translations[lang]) {
      return Promise.resolve();
    }

    // Get base path for GitHub Pages compatibility
    var basePath = getBasePath();
    var url = basePath + 'js/lang/' + lang + '.json';

    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        translations[lang] = data;
      })
      .catch(function (err) {
        console.warn('Failed to load translations for', lang, ':', err);
      });
  }

  function getBasePath() {
    // Detect if we're in a subdirectory (like GitHub Pages)
    var scripts = document.querySelectorAll('script[src*="i18n.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src');
      return src.replace('js/i18n.js', '');
    }
    return '';
  }

  function applyTranslations() {
    var data = translations[currentLang];
    if (!data) return;

    // Text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      var value = getNestedValue(data, key);
      if (value) el.textContent = value;
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.dataset.i18nPlaceholder;
      var value = getNestedValue(data, key);
      if (value) el.placeholder = value;
    });

    // Alt text
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var key = el.dataset.i18nAlt;
      var value = getNestedValue(data, key);
      if (value) el.alt = value;
    });
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce(function (o, key) {
      return o && o[key] !== undefined ? o[key] : null;
    }, obj);
  }

  return { init: init, switchLang: switchLang };
})();
