const Calculator = (function () {
  var currentStep = 1;
  var totalSteps = 5;

  var PRICING = {
    base: {
      pool: { skimmer: 18000, overflow: 25000 },
      spa: { 4: 180000, 6: 260000, 8: 350000 },
      hammam: 35000,
      complex: 0.9
    },
    location: { outdoor: 1.0, indoor: 1.35 },
    finish: { pvc: 1.0, mosaic: 1.4, stone: 1.9 },
    equipment: { standard: 1.0, comfort: 1.25, premium: 1.6 },
    extras: {
      heating: 45000,
      led: 25000,
      counter: 65000,
      waterfall: 40000,
      cover: 35000
    }
  };

  var state = {
    type: null,
    poolType: null,
    location: null,
    spaSize: null,
    length: 6,
    width: 3,
    depth: 1.5,
    area: 8,
    finish: null,
    equipment: null,
    extras: []
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
    els.areaRange = document.getElementById('calcAreaRange');
    els.lengthOut = document.getElementById('calcLength');
    els.widthOut = document.getElementById('calcWidth');
    els.depthOut = document.getElementById('calcDepth');
    els.areaOut = document.getElementById('calcArea');
    els.volume = document.getElementById('calcVolume');
    els.poolTypeGroup = document.getElementById('calcPoolType');
    els.locationGroup = document.getElementById('calcLocation');
    els.spaSizeGroup = document.getElementById('calcSpaSize');
    els.dimensions = document.getElementById('calcDimensions');
    els.hammamDimensions = document.getElementById('calcHammamDimensions');
    els.priceMin = document.getElementById('calcPriceMin');
    els.priceMax = document.getElementById('calcPriceMax');
    els.summary = document.getElementById('calcSummary');
    els.submitBtn = document.getElementById('calcSubmit');

    if (!els.prevBtn || !els.nextBtn) return;

    els.prevBtn.addEventListener('click', prevStep);
    els.nextBtn.addEventListener('click', nextStep);

    // Type selection
    document.querySelectorAll('input[name="calcType"]').forEach(function (r) {
      r.addEventListener('change', function () {
        state.type = this.value;
      });
    });

    // Pool type
    document.querySelectorAll('input[name="calcPoolType"]').forEach(function (r) {
      r.addEventListener('change', function () { state.poolType = this.value; });
    });

    // Location
    document.querySelectorAll('input[name="calcLocation"]').forEach(function (r) {
      r.addEventListener('change', function () { state.location = this.value; });
    });

    // Spa size
    document.querySelectorAll('input[name="calcSpaSize"]').forEach(function (r) {
      r.addEventListener('change', function () { state.spaSize = parseInt(this.value); });
    });

    // Finish
    document.querySelectorAll('input[name="calcFinish"]').forEach(function (r) {
      r.addEventListener('change', function () { state.finish = this.value; });
    });

    // Equipment
    document.querySelectorAll('input[name="calcEquipment"]').forEach(function (r) {
      r.addEventListener('change', function () { state.equipment = this.value; });
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
    if (els.areaRange) {
      els.areaRange.addEventListener('input', function () {
        state.area = parseInt(this.value);
        els.areaOut.textContent = this.value;
      });
    }

    // Submit from calculator
    if (els.submitBtn) {
      els.submitBtn.addEventListener('click', handleCalcSubmit);
    }

    updateProgress();
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
      case 1: return !!state.type;
      case 2:
        if (state.type === 'pool' || state.type === 'complex') {
          return !!state.poolType && !!state.location;
        }
        if (state.type === 'spa') return !!state.spaSize;
        if (state.type === 'hammam') return true;
        return true;
      case 3: return true;
      case 4: return !!state.finish && !!state.equipment;
      default: return true;
    }
  }

  function prepareStep(step) {
    if (step === 2) {
      // Show/hide conditional groups
      var isPool = state.type === 'pool' || state.type === 'complex';
      var isSpa = state.type === 'spa';
      var isHammam = state.type === 'hammam';

      els.poolTypeGroup.style.display = isPool ? '' : 'none';
      els.locationGroup.style.display = (isPool || isSpa) ? '' : 'none';
      els.spaSizeGroup.style.display = isSpa ? '' : 'none';
    }

    if (step === 3) {
      var showPoolDims = state.type === 'pool' || state.type === 'complex';
      var showHammamDims = state.type === 'hammam';

      els.dimensions.style.display = (showPoolDims || state.type === 'spa') ? '' : 'none';
      els.hammamDimensions.style.display = showHammamDims ? '' : 'none';

      if (state.type === 'spa') {
        // For spa, hide depth and use simpler dimensions
        els.dimensions.style.display = 'none';
        els.hammamDimensions.style.display = 'none';
      }
    }

    if (step === 5) {
      // Collect extras
      state.extras = [];
      document.querySelectorAll('input[name="calcExtras"]:checked').forEach(function (cb) {
        state.extras.push(cb.value);
      });

      calculatePrice();
      renderSummary();
    }
  }

  function calculatePrice() {
    var price = 0;

    if (state.type === 'pool') {
      var volume = state.length * state.width * state.depth;
      var baseRate = PRICING.base.pool[state.poolType] || 18000;
      price = baseRate * volume;
      price *= PRICING.location[state.location] || 1;
    } else if (state.type === 'spa') {
      price = PRICING.base.spa[state.spaSize] || 180000;
    } else if (state.type === 'hammam') {
      price = PRICING.base.hammam * state.area;
    } else if (state.type === 'complex') {
      var volume = state.length * state.width * state.depth;
      var baseRate = PRICING.base.pool[state.poolType] || 18000;
      price = baseRate * volume;
      price *= PRICING.location[state.location] || 1;
      price *= PRICING.base.complex; // 10% discount
    }

    price *= PRICING.finish[state.finish] || 1;
    price *= PRICING.equipment[state.equipment] || 1;

    // Add extras
    state.extras.forEach(function (extra) {
      price += PRICING.extras[extra] || 0;
    });

    var min = Math.round(price);
    var max = Math.round(price * 1.2);

    if (els.priceMin) els.priceMin.textContent = formatNumber(min);
    if (els.priceMax) els.priceMax.textContent = formatNumber(max);
  }

  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function renderSummary() {
    var typeLabels = { pool: 'Басейн', spa: 'Спа / Джакузі', hammam: 'Хамам', complex: 'Комплекс' };
    var poolTypeLabels = { skimmer: 'Скімерний', overflow: 'Переливний' };
    var locationLabels = { outdoor: 'Вуличний', indoor: 'Критий' };
    var finishLabels = { pvc: 'Плівка ПВХ', mosaic: 'Мозаїка', stone: 'Натуральний камінь' };
    var equipLabels = { standard: 'Стандарт', comfort: 'Комфорт', premium: 'Преміум' };
    var extrasLabels = {
      heating: 'Підігрів', led: 'Підсвітка LED', counter: 'Противотечія',
      waterfall: 'Водоспад', cover: 'Накриття'
    };

    var lines = [];
    lines.push('<strong>Тип:</strong> ' + (typeLabels[state.type] || state.type));

    if (state.type === 'pool' || state.type === 'complex') {
      lines.push('<strong>Тип басейну:</strong> ' + (poolTypeLabels[state.poolType] || ''));
      lines.push('<strong>Розташування:</strong> ' + (locationLabels[state.location] || ''));
      lines.push('<strong>Розміри:</strong> ' + state.length + ' x ' + state.width + ' x ' + state.depth + ' м');
      lines.push('<strong>Об\'єм:</strong> ' + (state.length * state.width * state.depth).toFixed(1) + ' м³');
    } else if (state.type === 'spa') {
      lines.push('<strong>Місць:</strong> ' + state.spaSize);
    } else if (state.type === 'hammam') {
      lines.push('<strong>Площа:</strong> ' + state.area + ' м²');
    }

    lines.push('<strong>Оздоблення:</strong> ' + (finishLabels[state.finish] || ''));
    lines.push('<strong>Обладнання:</strong> ' + (equipLabels[state.equipment] || ''));

    if (state.extras.length) {
      var extraNames = state.extras.map(function (e) { return extrasLabels[e] || e; });
      lines.push('<strong>Додатково:</strong> ' + extraNames.join(', '));
    }

    if (els.summary) {
      els.summary.innerHTML = lines.join('<br>');
    }
  }

  function handleCalcSubmit() {
    var name = document.getElementById('calcName');
    var phone = document.getElementById('calcPhone');

    if (!name || !phone) return;
    if (!name.value.trim() || !phone.value.trim()) {
      if (!name.value.trim()) name.classList.add('error');
      if (!phone.value.trim()) phone.classList.add('error');
      return;
    }

    name.classList.remove('error');
    phone.classList.remove('error');

    var messenger = document.getElementById('calcMessenger');
    var data = {
      name: name.value.trim(),
      phone: phone.value.trim(),
      messenger: messenger ? messenger.value : '',
      service: state.type,
      summary: els.summary ? els.summary.textContent : '',
      price_min: els.priceMin ? els.priceMin.textContent : '',
      price_max: els.priceMax ? els.priceMax.textContent : ''
    };

    ContactForm.submitData(data);
  }

  return { init };
})();
