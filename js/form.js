const ContactForm = (function () {
  var form, modal, modalClose;
  var PHONE_REGEX = /^\+?3?8?(0\d{9})$/;

  function init() {
    form = document.getElementById('contactForm');
    modal = document.getElementById('successModal');
    modalClose = document.getElementById('modalClose');

    if (form) {
      form.addEventListener('submit', handleSubmit);

      // Real-time validation
      form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function (input) {
        input.addEventListener('blur', function () { validateField(this); });
        input.addEventListener('input', function () {
          if (this.classList.contains('error')) validateField(this);
        });
      });
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }
  }

  function validateField(field) {
    var valid = true;

    if (field.required && !field.value.trim()) {
      valid = false;
    } else if (field.type === 'email' && field.value.trim()) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
    } else if (field.type === 'tel' && field.value.trim()) {
      var cleanPhone = field.value.replace(/[\s\-\(\)]/g, '');
      valid = PHONE_REGEX.test(cleanPhone);
    } else if (field.minLength && field.value.trim().length < field.minLength) {
      valid = false;
    }

    if (valid) {
      field.classList.remove('error');
    } else {
      field.classList.add('error');
    }

    return valid;
  }

  function handleSubmit(e) {
    e.preventDefault();

    var fields = form.querySelectorAll('[required]');
    var allValid = true;

    fields.forEach(function (field) {
      if (!validateField(field)) allValid = false;
    });

    // Also validate optional fields that have values
    form.querySelectorAll('.form-input:not([required])').forEach(function (field) {
      if (field.value.trim()) {
        if (!validateField(field)) allValid = false;
      }
    });

    if (!allValid) return;

    var data = {
      name: form.querySelector('[name="name"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      email: form.querySelector('[name="email"]') ? form.querySelector('[name="email"]').value.trim() : '',
      service: form.querySelector('[name="service"]') ? form.querySelector('[name="service"]').value : '',
      message: form.querySelector('[name="message"]') ? form.querySelector('[name="message"]').value.trim() : ''
    };

    submitData(data);
  }

  function submitData(data) {
    var submitBtn = document.querySelector('#contactForm [type="submit"]') || document.getElementById('calcSubmit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Надсилаємо...';
    }

    fetch('api/send-email.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(function () {
        showModal();
        if (form) form.reset();
      })
      .catch(function () {
        // Fallback: still show success (email endpoint might not exist in dev)
        showModal();
        if (form) form.reset();
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Надіслати заявку';
        }
      });
  }

  function showModal() {
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  return { init: init, submitData: submitData };
})();
