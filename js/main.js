/* ===== RANLOCK GLOBAL JAVASCRIPT ===== */

function openBooking() {
  // Try bO and bM (used in services.html and location pages)
  var bo = document.getElementById('bO');
  var bm = document.getElementById('bM');
  if (bo && bm) {
    bo.style.opacity = '1';
    bo.style.pointerEvents = 'all';
    bm.style.transform = 'translateY(0)';
  }
  
  // Try bookingOverlay and bookingModal (used in index.html, about-us.html, contact-us.html, instant-estimator.html, storm-damage.html)
  var overlay = document.getElementById('bookingOverlay');
  var modal = document.getElementById('bookingModal');
  if (overlay && modal) {
    overlay.classList.add('open');
    modal.classList.add('open');
    
    // Also support inline styles for overlay and modal
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    modal.style.transform = 'translateY(0)';
  }
  
  document.body.style.overflow = 'hidden';
}

function closeBooking() {
  // Try bO and bM (used in services.html and location pages)
  var bo = document.getElementById('bO');
  var bm = document.getElementById('bM');
  if (bo && bm) {
    bo.style.opacity = '0';
    bo.style.pointerEvents = 'none';
    bm.style.transform = 'translateY(100%)';
  }
  
  // Try bookingOverlay and bookingModal (used in index.html, about-us.html, contact-us.html, instant-estimator.html, storm-damage.html)
  var overlay = document.getElementById('bookingOverlay');
  var modal = document.getElementById('bookingModal');
  if (overlay && modal) {
    overlay.classList.remove('open');
    modal.classList.remove('open');
    
    // Also support inline styles for overlay and modal
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    modal.style.transform = 'translateY(100%)';
  }
  
  document.body.style.overflow = '';
}

// Mobile Menu Toggle
function toggleMenu() {
  var m = document.getElementById('mobileMenu');
  if (m) {
    var open = m.classList.toggle('open');
    var hamburger = document.querySelector('.hamburger');
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', open);
    }
  }
}

// FAQ Accordion
function toggleFaq(el) {
  var wasOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(function(i) {
    i.classList.remove('open');
  });
  if (!wasOpen) {
    el.classList.add('open');
  }
}

// Close mobile menu on outside click
document.addEventListener('click', function(e) {
  var mm = document.getElementById('mobileMenu');
  var hb = document.querySelector('.hamburger');
  if (mm && mm.classList.contains('open') && !mm.contains(e.target) && hb && !hb.contains(e.target)) {
    mm.classList.remove('open');
    hb.setAttribute('aria-expanded', 'false');
  }
});

// Smooth scroll for hash links
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var href = this.getAttribute('href');
    if (href === '#') return;
    var t = document.querySelector(href);
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Escape key closes modals
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeBooking();
  }
});

// Form Submissions
function bmSubmit(e) {
  e.preventDefault();
  var btn = e.target.querySelector('[type="submit"]');
  if (btn) {
    btn.textContent = '✓ Callback Requested!';
    btn.style.background = '#2A7A3A';
    btn.disabled = true;
  }
}

function bmStormSubmit(e) {
  e.preventDefault();
  var btn = e.target.querySelector('[type="submit"]');
  if (btn) {
    btn.textContent = '✓ Emergency Callback Requested!';
    btn.style.background = '#2A7A3A';
    btn.disabled = true;
  }
}

function contactSubmit(e) {
  e.preventDefault();
  var btn = e.target.querySelector('[type="submit"]');
  if (btn) {
    btn.textContent = '✓ Submitted — We\'ll Be In Touch Soon!';
    btn.style.background = '#2A7A3A';
    btn.disabled = true;
  }
}

function stormFormSubmit(e) {
  e.preventDefault();
  var btn = e.target.querySelector('[type="submit"]');
  if (btn) {
    btn.textContent = '✓ Storm Report Submitted!';
    btn.style.background = '#2A7A3A';
    btn.disabled = true;
  }
}

function bmS(e) {
  e.preventDefault();
  var btn = e.target.querySelector('[type="submit"]');
  if (btn) {
    btn.textContent = '✓ Callback Requested!';
    btn.style.background = '#2A7A3A';
    btn.disabled = true;
  }
}
