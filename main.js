let selectedTime = '';

const BRAND = {
webhook: 'https://script.google.com/macros/s/AKfycbwiHc1RYICV4Yq9iMFLlCgSQSysSa0gI9hg0maBn5rGHLs1uAensUMqYQ_6AcaIovUm_w/exec'};

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

  if (id === 'booking-page') {
    const bookingConfirm = document.getElementById('bookingConfirm');
    const bookingSteps = document.getElementById('bookingSteps');

    if (bookingConfirm && bookingSteps && bookingConfirm.style.display === 'block') {
      bookingConfirm.style.display = 'none';
      bookingSteps.style.display = 'block';
    }
  }

  if (id === 'contact-page') {
    const contactSuccess = document.getElementById('contactSuccess');
    const contactFormWrap = document.getElementById('contactFormWrap');

    if (contactSuccess && contactFormWrap && contactSuccess.style.display === 'block') {
      contactSuccess.style.display = 'none';
      contactFormWrap.style.display = 'block';
    }
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

async function submitContact() {
  const firstName = val('cfirst');
  const lastName = val('clast');
  const email = val('cemail');
  const phone = val('cphone');
  const subject = val('csubject');
  const message = val('cmessage');

  if (!firstName || !email || !message) {
    alert('Please fill in at least your first name, email, and message.');
    return;
  }

  const webhook = BRAND.webhook?.trim();

  if (!webhook || webhook === 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE') {
    alert('Please add your Google Apps Script Web App URL in main.js first.');
    return;
  }

  const submitBtn = document.getElementById('contactSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.classList.add('loading-state');
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        type: 'contact',
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        source: window.location.href
      })
    });

    const result = await res.json();

    if (!result.ok) {
      throw new Error(result.message || 'Contact form failed');
    }

    hide('contactFormWrap');
    show('contactSuccess');
    clearContactForm();

  } catch (err) {
    console.error(err);
    alert('Message could not be sent. Please check your Apps Script deployment.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      submitBtn.classList.remove('loading-state');
    }
  }
}

async function submitBooking() {
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

  const today = new Date().toISOString().split('T')[0];
  if (date < today) {
    alert('Please choose a valid future date.');
    return;
  }

  if (!selectedTime) {
    alert('Please select a time slot.');
    return;
  }

  const webhook = BRAND.webhook?.trim();

  if (!webhook || webhook === 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE') {
    alert('Please add your Google Apps Script Web App URL in main.js first.');
    return;
  }

  const submitBtn = document.getElementById('bookingSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.classList.add('loading-state');
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        type: 'booking',
        name,
        phone,
        model,
        repair,
        address,
        preferredDate: date,
        preferredTime: selectedTime,
        notes,
        source: window.location.href
      })
    });

    const result = await res.json();

    if (!result.ok) {
      throw new Error(result.message || 'Booking failed');
    }

    showBookingSuccess(name, phone, model, repair, address, date, selectedTime);
    clearBookingForm();

  } catch (err) {
    console.error(err);
    alert('Booking could not be sent. Please check your Apps Script deployment.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';
      submitBtn.classList.remove('loading-state');
    }
  }
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

function clearContactForm() {
  setValue('cfirst', '');
  setValue('clast', '');
  setValue('cemail', '');
  setValue('cphone', '');
  setValue('csubject', '');
  setValue('cmessage', '');
}

function clearBookingForm() {
  setValue('b-name', '');
  setValue('b-phone', '');
  setValue('b-model', '');
  setValue('b-repair', '');
  setValue('b-address', '');
  setValue('b-notes', '');

  const dateInput = document.getElementById('b-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  selectedTime = '';
  document.querySelectorAll('.slot').forEach(slot => {
    slot.classList.remove('selected');
  });

  updateSummary();
  setText('sum-time', '—');
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
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