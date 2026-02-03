/**
 * Analytics & Event Tracking
 * Підтримує: Google Analytics 4 (GA4), Facebook Pixel, Google Tag Manager
 */
const Analytics = (function () {
  // ========== CONFIGURATION ==========
  // TODO: Замінити на реальні ID
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';  // Google Analytics 4
  const FB_PIXEL_ID = 'XXXXXXXXXXXXXXX';     // Facebook Pixel (опціонально)
  const GTM_ID = 'GTM-XXXXXXX';              // Google Tag Manager (опціонально)

  // ========== INITIALIZATION ==========
  function init() {
    // Відкладене завантаження скриптів (не блокує рендер)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadAnalytics);
    } else {
      loadAnalytics();
    }
  }

  function loadAnalytics() {
    // Google Analytics 4
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      loadGA4();
    }

    // Facebook Pixel
    if (FB_PIXEL_ID && FB_PIXEL_ID !== 'XXXXXXXXXXXXXXX') {
      loadFBPixel();
    }

    // Google Tag Manager
    if (GTM_ID && GTM_ID !== 'GTM-XXXXXXX') {
      loadGTM();
    }

    // Bind event tracking
    bindEventTracking();
  }

  // ========== GOOGLE ANALYTICS 4 ==========
  function loadGA4() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  }

  // ========== FACEBOOK PIXEL ==========
  function loadFBPixel() {
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', FB_PIXEL_ID);
    fbq('track', 'PageView');
  }

  // ========== GOOGLE TAG MANAGER ==========
  function loadGTM() {
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',GTM_ID);
  }

  // ========== EVENT TRACKING ==========
  function bindEventTracking() {
    // Track CTA button clicks
    document.querySelectorAll('.btn--primary, .btn--outline').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var label = this.textContent.trim() || this.getAttribute('aria-label') || 'Button';
        trackEvent('cta_click', { button_text: label });
      });
    });

    // Track phone clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
      link.addEventListener('click', function() {
        trackEvent('phone_click', { phone: this.href.replace('tel:', '') });
      });
    });

    // Track social links
    document.querySelectorAll('.contact__social, .footer__social').forEach(function(link) {
      link.addEventListener('click', function() {
        var platform = this.getAttribute('aria-label') || 'Social';
        trackEvent('social_click', { platform: platform });
      });
    });

    // Track form submissions
    trackFormSubmissions();

    // Track calculator usage
    trackCalculator();

    // Track scroll depth
    trackScrollDepth();

    // Track time on page
    trackTimeOnPage();
  }

  // ========== FORM TRACKING ==========
  function trackFormSubmissions() {
    // Contact form
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function() {
        trackEvent('form_submit', {
          form_name: 'contact_form',
          service: contactForm.querySelector('[name="service"]')?.value || ''
        });
        trackConversion('lead');
      });
    }

    // Popup form
    var popupForm = document.getElementById('popupForm');
    if (popupForm) {
      popupForm.addEventListener('submit', function() {
        trackEvent('form_submit', { form_name: 'popup_form' });
        trackConversion('lead');
      });
    }

    // Calculator form
    var calcSubmit = document.getElementById('calcSubmit');
    if (calcSubmit) {
      calcSubmit.addEventListener('click', function() {
        trackEvent('form_submit', { form_name: 'calculator_form' });
        trackConversion('lead');
      });
    }
  }

  // ========== CALCULATOR TRACKING ==========
  function trackCalculator() {
    var calcNext = document.getElementById('calcNext');
    if (calcNext) {
      var currentStep = 1;
      calcNext.addEventListener('click', function() {
        currentStep++;
        trackEvent('calculator_step', { step: currentStep });

        if (currentStep === 5) {
          // User reached final step
          trackEvent('calculator_complete', {});
        }
      });
    }

    // Track type selection
    document.querySelectorAll('input[name="calcType"]').forEach(function(input) {
      input.addEventListener('change', function() {
        trackEvent('calculator_type_selected', { type: this.value });
      });
    });
  }

  // ========== SCROLL DEPTH TRACKING ==========
  function trackScrollDepth() {
    var depths = [25, 50, 75, 100];
    var tracked = {};

    window.addEventListener('scroll', function() {
      var scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      depths.forEach(function(depth) {
        if (scrollPercent >= depth && !tracked[depth]) {
          tracked[depth] = true;
          trackEvent('scroll_depth', { percent: depth });
        }
      });
    }, { passive: true });
  }

  // ========== TIME ON PAGE ==========
  function trackTimeOnPage() {
    var intervals = [30, 60, 120, 300]; // seconds
    var tracked = {};

    intervals.forEach(function(seconds) {
      setTimeout(function() {
        if (!tracked[seconds]) {
          tracked[seconds] = true;
          trackEvent('time_on_page', { seconds: seconds });
        }
      }, seconds * 1000);
    });
  }

  // ========== CORE TRACKING FUNCTIONS ==========
  function trackEvent(eventName, params) {
    params = params || {};

    // Google Analytics 4
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }

    // Facebook Pixel
    if (typeof fbq === 'function') {
      fbq('trackCustom', eventName, params);
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    }

    // Debug in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Analytics]', eventName, params);
    }
  }

  function trackConversion(type) {
    // GA4 conversion
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: GA_MEASUREMENT_ID,
        event_category: 'conversion',
        event_label: type
      });
    }

    // Facebook Lead event
    if (typeof fbq === 'function') {
      fbq('track', 'Lead');
    }
  }

  // ========== PUBLIC API ==========
  return {
    init: init,
    trackEvent: trackEvent,
    trackConversion: trackConversion
  };
})();

// Auto-initialize
Analytics.init();
