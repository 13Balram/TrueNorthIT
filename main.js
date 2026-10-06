/* ═══════════════════════════════════════════════════════════════
   TrueNorth Managed IT — Main JavaScript
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Sticky Header ─────────────────────────────────────────── */
  const header = document.getElementById('header');

  function updateHeader() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ─── Mobile Nav ─────────────────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navList   = document.getElementById('nav-list');

  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  navList.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      navList.classList.remove('open');
      navToggle.classList.remove('active');
    }
  });

  /* ─── Active Nav Link on Scroll ─────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');

  function updateActiveNavFixed() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavFixed, { passive: true });

  /* ─── Scroll Animations (Intersection Observer) ──────────────── */
  const animElements = document.querySelectorAll('[data-animate]');

  function getDelay(el) {
    return parseInt(el.dataset.delay || 0, 10);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = getDelay(entry.target);
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  animElements.forEach(el => observer.observe(el));

  /* ─── Counter Animation ──────────────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const step     = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.round(current);
    }, step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  /* ─── Testimonials Slider ────────────────────────────────────── */
  const track    = document.getElementById('testimonials-track');
  const dotsWrap = document.getElementById('testimonials-dots');
  const prevBtn  = document.getElementById('prev-btn');
  const nextBtn  = document.getElementById('next-btn');

  if (track) {
    const slides = track.querySelectorAll('.testimonial-card');
    let current  = 0;
    let autoTimer;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;

      dotsWrap.querySelectorAll('.testimonials__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function startAuto() {
      autoTimer = setInterval(() => goTo(current + 1), 5500);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    // Swipe support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? current + 1 : current - 1);
        resetAuto();
      }
    });

    startAuto();
  }

  /* ─── Contact Form ───────────────────────────────────────────── */
  const form        = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    function validateField(input) {
      const id   = input.id;
      const errEl = document.getElementById('err-' + id.replace('f-', ''));
      let error  = '';

      if (input.required && !input.value.trim()) {
        error = 'This field is required.';
      } else if (id === 'f-email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) error = 'Please enter a valid email address.';
      }

      if (errEl) errEl.textContent = error;
      input.classList.toggle('error', !!error);
      return !error;
    }

    // Live validation on blur
    form.querySelectorAll('input[required], textarea[required]').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate all required fields
      const requiredFields = form.querySelectorAll('input[required], textarea[required]');
      let isValid = true;
      requiredFields.forEach(input => {
        if (!validateField(input)) isValid = false;
      });

      if (!isValid) return;

      // Simulate async submission
      const btnText    = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      btnText.style.display    = 'none';
      btnLoading.style.display = 'inline-flex';
      submitBtn.disabled = true;

      await new Promise(resolve => setTimeout(resolve, 1600));

      form.style.display    = 'none';
      formSuccess.style.display = 'block';
    });
  }

  /* ─── Back to Top ────────────────────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ─── Smooth Scroll for all anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = header ? header.offsetHeight : 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── Service Card Hover Stagger ──────────────────────────────── */
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 30}ms`;
  });

  /* ─── Industry Card Hover ────────────────────────────────────── */
  // Already handled via CSS, but add keyboard accessibility
  document.querySelectorAll('.industry-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') card.dispatchEvent(new MouseEvent('click'));
    });
  });

  /* ─── Tech Item Hover with ripple ────────────────────────────── */
  document.querySelectorAll('.tech-item').forEach(item => {
    item.addEventListener('click', () => {
      item.style.transform = 'scale(0.95)';
      setTimeout(() => { item.style.transform = ''; }, 150);
    });
  });

  /* ─── Checkbox styling enhancement ──────────────────────────── */
  document.querySelectorAll('.checkbox-item').forEach(label => {
    const checkbox = label.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        label.style.background = checkbox.checked ? 'rgba(0,86,210,.06)' : '';
        label.style.borderColor = checkbox.checked ? 'var(--primary)' : '';
        label.style.color = checkbox.checked ? 'var(--primary)' : '';
      });
    }
  });

  /* ─── Problem items: mouse-trail subtle effect ───────────────── */
  document.querySelectorAll('.problem-item:not(.problem-item--cta)').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.querySelector('i').style.color = 'var(--primary)';
      item.querySelector('i').style.background = 'rgba(0,86,210,.08)';
    });
    item.addEventListener('mouseleave', () => {
      item.querySelector('i').style.color = '';
      item.querySelector('i').style.background = '';
    });
  });

})();
