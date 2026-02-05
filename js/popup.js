const Popup = (function () {
  var STORAGE_KEY = 'popup_closed';
  var SUPPRESSION_DAYS = 7;
  var SHOW_DELAY = 20000; // 20 seconds

  var overlay = null;
  var popup = null;
  var closeBtn = null;
  var form = null;
  var timeoutId = null;

  function init() {
    overlay = document.getElementById('popupOverlay');
    if (!overlay) return;

    popup = overlay.querySelector('.popup');
    closeBtn = document.getElementById('popupClose');
    form = document.getElementById('popupForm');

    // Check if popup was recently closed
    if (isPopupSuppressed()) {
      return;
    }

    // Set timeout to show popup
    timeoutId = setTimeout(showPopup, SHOW_DELAY);

    // Bind events
    if (closeBtn) {
      closeBtn.addEventListener('click', closePopup);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closePopup();
      }
    });

    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closePopup();
      }
    });
  }

  function isPopupSuppressed() {
    var closedTime = localStorage.getItem(STORAGE_KEY);
    if (!closedTime) return false;

    var closedDate = new Date(parseInt(closedTime));
    var now = new Date();
    var daysDiff = (now - closedDate) / (1000 * 60 * 60 * 24);

    return daysDiff < SUPPRESSION_DAYS;
  }

  function suppressPopup() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  function showPopup() {
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    suppressPopup();
  }

  function handleSubmit(e) {
    e.preventDefault();

    var nameInput = form.querySelector('input[name="name"]');
    var phoneInput = form.querySelector('input[name="phone"]');

    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      popup.classList.add('shake');
      setTimeout(function () { popup.classList.remove('shake'); }, 300);
      nameInput.focus();
      return;
    }

    var phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phoneInput.value.replace(/\s/g, ''))) {
      popup.classList.add('shake');
      setTimeout(function () { popup.classList.remove('shake'); }, 300);
      phoneInput.focus();
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Надсилаємо...';
    submitBtn.disabled = true;

    var url = (typeof EMAIL_API_URL !== 'undefined' && EMAIL_API_URL) ? EMAIL_API_URL : 'api/send-email.php';
    var data = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      source: 'popup'
    };

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json(); })
      .then(function () {
        closePopup();
        var successModal = document.getElementById('successModal');
        if (successModal) successModal.classList.add('active');
      })
      .catch(function () {
        closePopup();
        var successModal = document.getElementById('successModal');
        if (successModal) successModal.classList.add('active');
      })
      .finally(function () {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.reset();
      });
  }

  return { init: init };
})();
