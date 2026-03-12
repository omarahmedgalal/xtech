let selectedTime = '';

const BRAND = {
  bookingWebhook: 'PUT_YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE'
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  const target = document.getElementById(id);
  if (target) target.classList.add('active');

  const map = {
    'home-page': 'nav-home',
    'services-page': 'nav-services',
    'contact-page': 'nav-contact',
    'booking-page': 'nav-booking'
  };

  document.querySelectorAll('.nav-links button').forEach(btn => {
    btn.classList.remove('active');
  });

  if (map[id]) {
    const activeBtn = document.getElementById(map[id]);
    if (activeBtn) activeBtn.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMobileMenu();
}

function toggleMenu() {
  const nav = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');

  if (!nav) return;

  nav.classList.toggle('open');

  if (hamburger) {
    hamburger.setAttribute(
      'aria-expanded',
      nav.classList.contains('open') ? 'true' : 'false'
    );
  }
}

function closeMobileMenu() {
  const nav = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');

  if (nav) nav.classList.remove('open');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
}

function selectSlot(el, time) {
  document.querySelectorAll('.slot').forEach(slot => {
    slot.classList.remove('selected');
  });

  el.classList.add('selected');
  selectedTime = time;
  setText('sum-time', time);
}

function updateSummary() {
  const name = val('b-name');
  const model = val('b-model');
  const repair = val('b-repair');
  const location = val('b-address');
  const dateValue = val('b-date');

  setText('sum-name', name || '—');
  setText('sum-model', model || '—');
  setText('sum-repair', repair || '—');
  setText('sum-loc', location || '—');

  if (dateValue) {
    const d = new Date(`${dateValue}T12:00:00`);
    const formatted = d.toLocaleDateString('en-EG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    setText('sum-date', formatted);
  } else {
    setText('sum-date', '—');
  }
}

function submitContact() {
  const first = val('cfirst');
  const email = val('cemail');

  if (!first || !email) {
    alert('Please fill in at least your name and email.');
    return;
  }

  hide('contactFormWrap');
  show('contactSuccess');
}

function submitBooking() {
  const name = val('b-name');
  const phone = val('b-phone');
  const model = val('b-model');
  const repair = val('b-repair');
  const address = val('b-address');
  const date = val('b-date');
  const notes = val('b-notes');

  if (!name) {
    alert('Please enter your name.');
    return;
  }

  if (!phone) {
    alert('Please enter your phone number.');
    return;
  }

  if (!model) {
    alert('Please enter your iPhone model.');
    return;
  }

  if (!repair) {
    alert('Please select a repair type.');
    return;
  }

  if (!address) {
    alert('Please enter your address.');
    return;
  }

  if (!date) {
    alert('Please choose a date.');
    return;
  }

  if (!selectedTime) {
    alert('Please select a time slot.');
    return;
  }

  const webhook = BRAND.bookingWebhook?.trim();

  if (!webhook || webhook === 'PUT_YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE') {
    alert('Please add your Google Apps Script Web App URL in main.js first.');
    return;
  }

  const submitBtn = document.getElementById('bookingSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.classList.add('loading-state');
  }

  const params = new URLSearchParams({
    name,
    phone,
    model,
    repair,
    address,
    preferredDate: date,
    preferredTime: selectedTime,
    notes,
    source: window.location.href,
    createdAt: new Date().toISOString()
  });

  const img = new Image();

  img.onload = function () {
    showBookingSuccess(name, phone, model, repair, address, date, selectedTime);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';
      submitBtn.classList.remove('loading-state');
    }
  };

  img.onerror = function () {
    alert('Booking could not be sent. Please check your Google Apps Script deployment.');

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';
      submitBtn.classList.remove('loading-state');
    }
  };

  img.src = `${webhook}?${params.toString()}`;
}

function showBookingSuccess(name, phone, model, repair, address, date, time) {
  const d = new Date(`${date}T12:00:00`);
  const dateStr = d.toLocaleDateString('en-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const detailsEl = document.getElementById('bookingConfirmDetails');

  if (detailsEl) {
    detailsEl.innerHTML = `
      <div class="dl">Name</div><div class="dv">${escapeHtml(name)}</div>
      <div class="dl">Phone</div><div class="dv">${escapeHtml(phone)}</div>
      <div class="dl">Device</div><div class="dv">${escapeHtml(model)}</div>
      <div class="dl">Repair</div><div class="dv">${escapeHtml(repair)}</div>
      <div class="dl">Location</div><div class="dv">${escapeHtml(address)}</div>
      <div class="dl" style="grid-column:span 2;">Date & Time</div>
      <div class="dv" style="grid-column:span 2;">${escapeHtml(dateStr)} at ${escapeHtml(time)}</div>
    `;
  }

  hide('bookingSteps');
  show('bookingConfirm');
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('b-date');

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  updateSummary();
});