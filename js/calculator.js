const Calculator = (function () {
  var currentStep = 1;
  var totalSteps = 5;

  var state = {
    type: 'pool', // Fixed
    bowlType: null,
    location: null,
    shape: null,
    poolType: null,
    entry: null,
    length: 6,
    width: 3,
    depth: 1.5,
    heating: null,
    disinfection: null,
    extras: [],
    file: null
  };

  var els = {};

  function init() {
    els.progressFill = document.getElementById('calcProgressFill');
    els.prevBtn = document.getElementById('calcPrev');
    els.nextBtn = document.getElementById('calcNext');
    els.panels = document.querySelectorAll('.calc__panel');
    els.dots = document.querySelectorAll('.calc__step-dot');
    els.lengthRange = document.getElementById('calcLengthRange');
    els.widthRange = document.getElementById('calcWidthRange');
    els.depthRange = document.getElementById('calcDepthRange');
    els.lengthOut = document.getElementById('calcLength');
    els.widthOut = document.getElementById('calcWidth');
    els.depthOut = document.getElementById('calcDepth');
    els.volume = document.getElementById('calcVolume');
    els.dimensions = document.getElementById('calcDimensions');
    els.summary = document.getElementById('calcSummary');
    els.submitBtn = document.getElementById('calcSubmit');
    els.fileInput = document.getElementById('calcFile');
    els.fileName = document.getElementById('calcFileName');

    if (!els.prevBtn || !els.nextBtn) return;

    els.prevBtn.addEventListener('click', prevStep);
    els.nextBtn.addEventListener('click', nextStep);

    // Bowl type
    document.querySelectorAll('input[name="calcBowlType"]').forEach(function (r) {
      r.addEventListener('change', function () { state.bowlType = this.value; });
    });

    // Location
    document.querySelectorAll('input[name="calcLocation"]').forEach(function (r) {
      r.addEventListener('change', function () { state.location = this.value; });
    });

    // Shape
    document.querySelectorAll('input[name="calcShape"]').forEach(function (r) {
      r.addEventListener('change', function () { state.shape = this.value; });
    });

    // Pool type (water exchange)
    document.querySelectorAll('input[name="calcPoolType"]').forEach(function (r) {
      r.addEventListener('change', function () { state.poolType = this.value; });
    });

    // Entry
    document.querySelectorAll('input[name="calcEntry"]').forEach(function (r) {
      r.addEventListener('change', function () { state.entry = this.value; });
    });

    // Heating
    document.querySelectorAll('input[name="calcHeating"]').forEach(function (r) {
      r.addEventListener('change', function () { state.heating = this.value; });
    });

    // Disinfection
    document.querySelectorAll('input[name="calcDisinfection"]').forEach(function (r) {
      r.addEventListener('change', function () { state.disinfection = this.value; });
    });

    // Sliders
    if (els.lengthRange) {
      els.lengthRange.addEventListener('input', function () {
        state.length = parseFloat(this.value);
        els.lengthOut.textContent = this.value;
        updateVolume();
      });
    }
    if (els.widthRange) {
      els.widthRange.addEventListener('input', function () {
        state.width = parseFloat(this.value);
        els.widthOut.textContent = this.value;
        updateVolume();
      });
    }
    if (els.depthRange) {
      els.depthRange.addEventListener('input', function () {
        state.depth = parseFloat(this.value);
        els.depthOut.textContent = this.value;
        updateVolume();
      });
    }

    // File upload
    if (els.fileInput) {
      els.fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
          state.file = this.files[0];
          if (els.fileName) {
            els.fileName.textContent = this.files[0].name;
          }
        }
      });
    }

    // Submit from calculator
    if (els.submitBtn) {
      els.submitBtn.addEventListener('click', handleCalcSubmit);
    }

    updateProgress();
    updateVolume();
  }

  function updateVolume() {
    var vol = (state.length * state.width * state.depth).toFixed(1);
    if (els.volume) els.volume.textContent = vol;
  }

  function updateProgress() {
    var pct = (currentStep / totalSteps) * 100;
    if (els.progressFill) els.progressFill.style.width = pct + '%';

    els.dots.forEach(function (dot, i) {
      dot.classList.remove('active', 'completed');
      if (i + 1 === currentStep) {
        dot.classList.add('active');
      } else if (i + 1 < currentStep) {
        dot.classList.add('completed');
      }
    });

    // Show/hide nav buttons
    if (els.prevBtn) {
      els.prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }
    if (els.nextBtn) {
      els.nextBtn.style.display = currentStep === totalSteps ? 'none' : '';
    }
  }

  function showPanel(n) {
    els.panels.forEach(function (p) { p.classList.remove('active'); });
    var target = document.querySelector('[data-panel="' + n + '"]');
    if (target) target.classList.add('active');
  }

  function nextStep() {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
      currentStep++;
      prepareStep(currentStep);
      showPanel(currentStep);
      updateProgress();
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      showPanel(currentStep);
      updateProgress();
    }
  }

  function validateStep(step) {
    switch (step) {
      case 1:
        return !!state.bowlType && !!state.location;
      case 2:
        return !!state.shape && !!state.poolType && !!state.entry;
      case 3:
        return true; // Dimensions always valid
      case 4:
        return !!state.heating && !!state.disinfection;
      default:
        return true;
    }
  }

  function prepareStep(step) {
    if (step === 5) {
      // Collect extras
      state.extras = [];
      document.querySelectorAll('input[name="calcExtras"]:checked').forEach(function (cb) {
        state.extras.push(cb.value);
      });
      renderSummary();
    }
  }

  function t(key) {
    if (typeof I18n !== 'undefined' && I18n.translate) {
      var val = I18n.translate(key);
      if (val !== null && val !== undefined) return val;
    }
    return key;
  }

  function renderSummary() {
    var bowlTypeLabels = {
      concrete: t('calc.step1.concrete'),
      composite: t('calc.step1.composite')
    };
    var locationLabels = {
      outdoor: t('calc.step1.outdoor'),
      indoor: t('calc.step1.indoor')
    };
    var shapeLabels = {
      rectangular: t('calc.step2.rectangular'),
      oval: t('calc.step2.oval'),
      custom: t('calc.step2.custom')
    };
    var poolTypeLabels = {
      skimmer: t('calc.step2.skimmer'),
      overflow: t('calc.step2.overflow')
    };
    var entryLabels = {
      stairs: t('calc.step2.stairs'),
      ladder: t('calc.step2.ladder')
    };
    var heatingLabels = {
      yes: t('calc.step4.heatingYes'),
      no: t('calc.step4.heatingNo'),
      unknown: t('calc.step4.heatingUnknown')
    };
    var disinfectionLabels = {
      auto: t('calc.step4.disinfectionAuto'),
      basic: t('calc.step4.disinfectionBasic')
    };
    var extrasLabels = {
      lighting: t('calc.step4.extrasLighting'),
      hydromassage: t('calc.step4.extrasHydromassage'),
      counter: t('calc.step4.extrasCounter'),
      waterfall: t('calc.step4.extrasWaterfall')
    };

    var lines = [];
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.objectType') + ':</span><strong>' + t('calc.summary.pool') + '</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.bowlType') + ':</span><strong>' + (bowlTypeLabels[state.bowlType] || '—') + '</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.location') + ':</span><strong>' + (locationLabels[state.location] || '—') + '</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.shape') + ':</span><strong>' + (shapeLabels[state.shape] || '—') + '</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.poolType') + ':</span><strong>' + (poolTypeLabels[state.poolType] || '—') + '</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.entry') + ':</span><strong>' + (entryLabels[state.entry] || '—') + '</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.dimensions') + ':</span><strong>' + state.length + ' × ' + state.width + ' × ' + state.depth + ' м</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.volume') + ':</span><strong>' + (state.length * state.width * state.depth).toFixed(1) + ' ' + t('calc.step3.volumeUnit') + '</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.heating') + ':</span><strong>' + (heatingLabels[state.heating] || '—') + '</strong></div>');
    lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.disinfection') + ':</span><strong>' + (disinfectionLabels[state.disinfection] || '—') + '</strong></div>');

    if (state.extras.length) {
      var extraNames = state.extras.map(function (e) { return extrasLabels[e] || e; });
      lines.push('<div class="calc__summary-row"><span>' + t('calc.summary.extras') + ':</span><strong>' + extraNames.join(', ') + '</strong></div>');
    }

    if (els.summary) {
      els.summary.innerHTML = lines.join('');
    }
  }

  function handleCalcSubmit() {
    var name = document.getElementById('calcName');
    var phone = document.getElementById('calcPhone');
    var email = document.getElementById('calcEmail');

    if (!name || !phone || !email) return;

    var hasError = false;
    if (!name.value.trim()) {
      name.classList.add('error');
      hasError = true;
    } else {
      name.classList.remove('error');
    }

    if (!phone.value.trim()) {
      phone.classList.add('error');
      hasError = true;
    } else {
      phone.classList.remove('error');
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
      email.classList.add('error');
      hasError = true;
    } else {
      email.classList.remove('error');
    }

    if (hasError) return;

    var messenger = document.getElementById('calcMessenger');
    var summaryText = els.summary ? els.summary.textContent : '';

    var data = {
      name: name.value.trim(),
      phone: phone.value.trim(),
      email: email.value.trim(),
      messenger: messenger ? messenger.value : '',
      service: 'pool',
      message: summaryText,
      source: 'calculator'
    };

    // Handle file if present
    if (state.file) {
      data.hasFile = true;
      data.fileName = state.file.name;
    }

    ContactForm.submitData(data);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  return { init: init };
})();
