/**
 * app.js — BusTrace Frontend Application
 * Handles: Auth (OTP), Route Search, Live Updates (Socket.IO), Reviews
 */

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
const state = {
  user: null,
  theme: localStorage.getItem('theme') || 'dark',
  selectedRating: 0,
  selectedTags: [],
  srcCoords: null,
  dstCoords: null,
  srcLabel: '',
  dstLabel: '',
  stops: [],
  results: [],
  socket: null,
  liveBuses: {},         // busId → { lat, lng, crowdLevel, seatsAvailable }
  activeSearchTimeout: null,
};

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(state.theme);
  await Promise.all([fetchStops(), fetchStats(), checkSession()]);
  initSocket();
  initOtpInput();   // wire up numeric-only enforcement on OTP field
});

// ─────────────────────────────────────────────
//  THEME
// ─────────────────────────────────────────────
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  applyTheme(state.theme);
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    document.body.style.backgroundColor = '#f1f5f9';
    document.getElementById('theme-icon').textContent = '🌙';
  } else {
    root.classList.add('dark');
    document.body.style.backgroundColor = '#090c10';
    document.getElementById('theme-icon').textContent = '☀️';
  }
}

// ─────────────────────────────────────────────
//  SESSION CHECK
// ─────────────────────────────────────────────
async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    if (res.success) setUser(res.user);
  } catch (_) { /* not logged in */ }
}

function setUser(user) {
  state.user = user;
  document.getElementById('auth-status').classList.add('hidden');
  const info = document.getElementById('user-info');
  info.classList.remove('hidden');
  info.classList.add('flex');
  document.getElementById('user-phone').textContent = user.phone;
}

function clearUser() {
  state.user = null;
  document.getElementById('auth-status').classList.remove('hidden');
  document.getElementById('user-info').classList.add('hidden');
  document.getElementById('user-info').classList.remove('flex');
}

// ─────────────────────────────────────────────
//  STOPS & STATS
// ─────────────────────────────────────────────
async function fetchStops() {
  try {
    const res = await api('/api/routes/stops');
    if (res.success) {
      state.stops = res.data;
      document.getElementById('stat-stops').textContent = res.count;
    }
  } catch (_) {}
}

async function fetchStats() {
  try {
    const res = await api('/api/buses');
    if (res.success) {
      document.getElementById('stat-active').textContent = res.count;
    }
  } catch (_) {}
}

// ─────────────────────────────────────────────
//  STOP AUTOCOMPLETE
// ─────────────────────────────────────────────
function handleSearch(input, type) {
  const query = input.value.trim().toLowerCase();
  const container = document.getElementById(`${type}-suggestions`);

  if (!query || query.length < 1) {
    container.classList.add('hidden');
    if (type === 'src') { state.srcCoords = null; state.srcLabel = ''; }
    else { state.dstCoords = null; state.dstLabel = ''; }
    return;
  }

  const matches = state.stops.filter(s =>
    s.name.toLowerCase().includes(query) ||
    (s.landmark || '').toLowerCase().includes(query)
  ).slice(0, 6);

  if (!matches.length) {
    container.classList.add('hidden');
    return;
  }

  container.innerHTML = matches.map(s => `
    <div onclick="selectStop('${type}','${s.stopId}','${escapeAttr(s.name)}',${s.lat},${s.lng})"
      class="px-4 py-3 cursor-pointer hover:bg-surface-600 transition-colors border-b border-surface-700 last:border-0 flex items-center justify-between group">
      <div>
        <div class="text-sm text-white font-medium">${highlightMatch(s.name, query)}</div>
        ${s.landmark ? `<div class="text-xs text-gray-500 mt-0.5">${s.landmark}</div>` : ''}
      </div>
      <div class="text-xs text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">${s.stopId}</div>
    </div>
  `).join('');

  container.classList.remove('hidden');
}

function selectStop(type, stopId, name, lat, lng) {
  if (type === 'src') {
    state.srcCoords = { lat, lng };
    state.srcLabel = name;
    document.getElementById('src-input').value = name;
    document.getElementById('src-suggestions').classList.add('hidden');
  } else {
    state.dstCoords = { lat, lng };
    state.dstLabel = name;
    document.getElementById('dst-input').value = name;
    document.getElementById('dst-suggestions').classList.add('hidden');
  }
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return text.slice(0, idx) +
    `<span class="text-brand-400">${text.slice(idx, idx + query.length)}</span>` +
    text.slice(idx + query.length);
}

function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// FIX: escapeHtml was missing — needed to safely render server data in innerHTML
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function swapLocations() {
  const srcInput = document.getElementById('src-input');
  const dstInput = document.getElementById('dst-input');

  [srcInput.value, dstInput.value] = [dstInput.value, srcInput.value];
  [state.srcCoords, state.dstCoords] = [state.dstCoords, state.srcCoords];
  [state.srcLabel, state.dstLabel] = [state.dstLabel, state.srcLabel];
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#src-input') && !e.target.closest('#src-suggestions')) {
    document.getElementById('src-suggestions').classList.add('hidden');
  }
  if (!e.target.closest('#dst-input') && !e.target.closest('#dst-suggestions')) {
    document.getElementById('dst-suggestions').classList.add('hidden');
  }
});

// ─────────────────────────────────────────────
//  ROUTE SEARCH
// ─────────────────────────────────────────────
async function searchBuses() {
  if (!state.srcCoords || !state.dstCoords) {
    if (!state.srcCoords) showInputError('src-input', 'Please select a source stop');
    if (!state.dstCoords) showInputError('dst-input', 'Please select a destination stop');
    return;
  }

  // FIX: guard against empty stops list (stops failed to load / DB down)
  // Without this, all searches silently return no results with no feedback.
  if (!state.stops || state.stops.length === 0) {
    showError('Stop data is not loaded. Please refresh the page. If the problem persists, the server may be starting up.');
    return;
  }

  const btn = document.getElementById('search-btn');
  btn.textContent = 'SEARCHING...';
  btn.disabled = true;
  btn.classList.add('opacity-70');

  hideAll(['results-section', 'empty-state', 'error-state']);
  showSkeleton();

  try {
    const { lat: sLat, lng: sLng } = state.srcCoords;
    const { lat: dLat, lng: dLng } = state.dstCoords;

    const res = await api(
      `/api/routes/search?srcLat=${sLat}&srcLng=${sLng}&dstLat=${dLat}&dstLng=${dLng}`
    );

    hideSkeleton();

    if (res.success && res.data.length > 0) {
      state.results = res.data;
      renderResults(res.data);
    } else {
      showEl('empty-state');
    }
  } catch (err) {
    hideSkeleton();
    showError(err.message || 'Failed to search routes. Is the server running?');
  } finally {
    btn.textContent = 'SEARCH BUSES →';
    btn.disabled = false;
    btn.classList.remove('opacity-70');
  }
}

// ─────────────────────────────────────────────
//  RENDER RESULTS
// ─────────────────────────────────────────────
function renderResults(buses) {
  const list = document.getElementById('results-list');
  const section = document.getElementById('results-section');
  const count = document.getElementById('results-count');

  count.textContent = `${buses.length} bus${buses.length !== 1 ? 'es' : ''} found`;

  list.innerHTML = buses.map((bus, i) => {
    const crowdColor = {
      green: 'text-green-400',
      yellow: 'text-yellow-400',
      red: 'text-red-400',
    }[bus.crowdLevel] || 'text-gray-400';

    const dotColor = {
      green: 'dot-green',
      yellow: 'dot-yellow',
      red: 'dot-red',
    }[bus.crowdLevel] || '';

    const crowdLabel = { green: 'Empty', yellow: 'Moderate', red: 'Full' }[bus.crowdLevel] || '—';
    const seatBar = buildSeatBar(bus.occupancyPercent, bus.crowdLevel);
    const typeTag = bus.type === 'AC'
      ? '<span class="text-xs bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500 border-opacity-30 px-1.5 py-0.5 rounded font-mono">AC</span>'
      : '<span class="text-xs bg-surface-600 text-gray-400 border border-surface-500 px-1.5 py-0.5 rounded font-mono">Non-AC</span>';

    return `
      <div class="glass-light rounded-xl p-4 cursor-pointer hover:border-brand-500 hover:border-opacity-40 transition-all animate-fade-in border border-transparent"
        style="animation-delay: ${i * 60}ms"
        onclick="showBusDetail(${i})">

        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono font-bold text-white text-sm">${bus.busId}</span>
              ${typeTag}
              <span class="w-1.5 h-1.5 rounded-full ${dotColor} inline-block"></span>
            </div>
            <div class="text-xs text-gray-500 font-mono">${escapeHtml(bus.registrationNumber)}</div>
          </div>
          <div class="text-right">
            <div class="font-mono font-bold text-brand-400 text-lg">${bus.eta.label}</div>
            <div class="text-xs text-gray-500">ETA arrival</div>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-3 text-xs">
          <span class="text-brand-400 font-mono">${bus.srcStop?.name || '—'}</span>
          <span class="text-gray-600 flex-1 border-t border-dashed border-gray-700 mx-1"></span>
          <span class="text-gray-500">${bus.numIntermediateStops} stop${bus.numIntermediateStops !== 1 ? 's' : ''}</span>
          <span class="text-gray-600 flex-1 border-t border-dashed border-gray-700 mx-1"></span>
          <span class="text-red-400 font-mono">${bus.dstStop?.name || '—'}</span>
        </div>

        <div class="mb-3">${seatBar}</div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span>📍 ${bus.distanceToBus} km away</span>
            <span>🛣 ${bus.routeDistance} km</span>
            <span class="${crowdColor} font-medium">${crowdLabel}</span>
          </div>
          <div class="font-mono text-white font-semibold text-sm">
            ₹${bus.fare.amount}
            ${bus.fare.isPeak ? '<span class="text-xs text-yellow-500 ml-1">⚡peak</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  section.classList.remove('hidden');
  section.classList.add('flex');
}

function buildSeatBar(occupancyPercent, crowdLevel) {
  const barColor = { green: '#2bef88', yellow: '#fbbf24', red: '#f87171' }[crowdLevel] || '#9ca3af';
  const seatsPercent = 100 - occupancyPercent;
  const label = `${seatsPercent}% seats available`;

  return `
    <div class="flex items-center gap-2">
      <div class="flex-1 h-1.5 bg-surface-600 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all" style="width:${seatsPercent}%; background:${barColor}"></div>
      </div>
      <span class="text-xs font-mono" style="color:${barColor}">${label}</span>
    </div>
  `;
}

// ─────────────────────────────────────────────
//  BUS DETAIL MODAL
// ─────────────────────────────────────────────
function showBusDetail(index) {
  const bus = state.results[index];
  if (!bus) return;

  const crowdBg = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }[bus.crowdLevel];
  const crowdLabel = { green: 'Plenty of seats', yellow: 'Moderately full', red: 'Almost full' }[bus.crowdLevel];

  document.getElementById('bus-detail-content').innerHTML = `
    <div class="flex items-start justify-between mb-5">
      <div>
        <h2 class="font-mono font-bold text-white text-xl">${bus.busId}</h2>
        <div class="text-gray-500 text-sm font-mono">${escapeHtml(bus.registrationNumber)} · ${escapeHtml(bus.type)}</div>
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-mono font-bold text-black ${crowdBg}">${crowdLabel}</span>
    </div>

    <div class="grid grid-cols-2 gap-3 mb-5">
      <div class="glass-light rounded-xl p-3 text-center">
        <div class="font-mono font-bold text-brand-400 text-2xl">${bus.eta.label}</div>
        <div class="text-gray-500 text-xs mt-0.5">ETA to boarding</div>
      </div>
      <div class="glass-light rounded-xl p-3 text-center">
        <div class="font-mono font-bold text-white text-2xl">₹${bus.fare.amount}</div>
        <div class="text-gray-500 text-xs mt-0.5">Estimated fare${bus.fare.isPeak ? ' ⚡' : ''}</div>
      </div>
    </div>

    <div class="glass-light rounded-xl p-4 mb-4 space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Route</span>
        <span class="text-white font-mono">${bus.routeId}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">From</span>
        <span class="text-brand-400">${bus.srcStop?.name || '—'}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">To</span>
        <span class="text-red-400">${bus.dstStop?.name || '—'}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Distance</span>
        <span class="text-white">${bus.routeDistance} km</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Intermediate Stops</span>
        <span class="text-white">${bus.numIntermediateStops}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Current Speed</span>
        <span class="text-white">${bus.speed} km/h</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Seats Available</span>
        <span class="text-white">${bus.seatsAvailable} / ${bus.capacity}</span>
      </div>
    </div>

    ${bus.fare.isPeak ? `
      <div class="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-xl p-3 mb-4 flex items-center gap-2">
        <span class="text-yellow-400">⚡</span>
        <span class="text-yellow-300 text-xs">Peak hour pricing active (×${bus.fare.breakdown.peakMultiplier})</span>
      </div>
    ` : ''}

    <div class="flex gap-3">
      <button onclick="loadReviews('${bus.busId}'); hideModal('bus-detail')"
        class="flex-1 text-sm border border-surface-500 text-gray-300 hover:bg-surface-600 py-2.5 rounded-xl transition-all font-mono">
        VIEW REVIEWS
      </button>
      <button onclick="prefillReview('${bus.busId}'); hideModal('bus-detail'); showSection('review')"
        class="flex-1 text-sm bg-brand-500 hover:bg-brand-600 text-black font-semibold py-2.5 rounded-xl transition-all font-mono">
        WRITE REVIEW
      </button>
    </div>
  `;

  showModal('bus-detail');
}

function prefillReview(busId) {
  document.getElementById('review-bus-id').value = busId;
}

// ─────────────────────────────────────────────
//  SOCKET.IO — LIVE BUS UPDATES
// ─────────────────────────────────────────────
function initSocket() {
  try {
    if (typeof io === 'undefined') {
      console.warn('Socket.IO not loaded — live updates disabled');
      return;
    }

    state.socket = io('/bus');

    state.socket.on('connect', () => {
      console.log('🔌 Connected to live bus feed');
      updateConnectionBadge(true);
    });

    state.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from live bus feed');
      updateConnectionBadge(false);
    });

    state.socket.on('bus:snapshot', (buses) => {
      buses.forEach(bus => { state.liveBuses[bus.busId] = bus; });
      document.getElementById('stat-active').textContent =
        buses.filter(b => b.status === 'active').length;
    });

    state.socket.on('bus:update', (update) => {
      state.liveBuses[update.busId] = { ...state.liveBuses[update.busId], ...update };
      updateBusCardLive(update);
      updateMapPin(update);
    });

    state.socket.on('bus:offline', ({ busId }) => {
      if (state.liveBuses[busId]) state.liveBuses[busId].status = 'inactive';
      markBusOffline(busId);
    });

  } catch (err) {
    console.warn('Socket.IO init failed:', err.message);
  }
}

function updateConnectionBadge(connected) {
  const badge = document.querySelector('.absolute.top-3.right-3');
  if (!badge) return;
  if (connected) {
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse inline-block"></span> LIVE`;
    badge.classList.remove('opacity-50');
  } else {
    badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span> OFFLINE`;
    badge.classList.add('opacity-50');
  }
}

function updateBusCardLive(update) {
  const idx = state.results.findIndex(b => b.busId === update.busId);
  if (idx === -1) return;
  state.results[idx] = { ...state.results[idx], ...update };
  const cards = document.querySelectorAll('#results-list > div');
  const card = cards[idx];
  if (!card) return;
  const dot = card.querySelector('.w-1\\.5.h-1\\.5.rounded-full');
  if (dot) {
    dot.className = `w-1.5 h-1.5 rounded-full ${
      { green: 'dot-green', yellow: 'dot-yellow', red: 'dot-red' }[update.crowdLevel] || ''
    } inline-block`;
  }
}

function updateMapPin(_update) {
  // Integrate with Leaflet / Google Maps here
}

function markBusOffline(busId) {
  const idx = state.results.findIndex(b => b.busId === busId);
  if (idx === -1) return;
  const cards = document.querySelectorAll('#results-list > div');
  const card = cards[idx];
  if (card) card.classList.add('opacity-40');
}

// ─────────────────────────────────────────────
//  AUTH — OTP FLOW
// ─────────────────────────────────────────────

// ── OTP timer state ──────────────────────────
let _otpCooldownSeconds = 0;
let _otpCooldownTimer   = null;
let _currentPhone       = '';   // remember phone across steps

/**
 * Wire up the OTP input field:
 *  - Allow digits only (block letters/symbols)
 *  - Max 6 characters
 *  - Submit on Enter if 6 digits filled
 */
function initOtpInput() {
  const otpInput = document.getElementById('otp-input');
  if (!otpInput) return;

  // Digits only
  otpInput.addEventListener('keypress', (e) => {
    if (!/\d/.test(e.key)) e.preventDefault();
  });

  // Strip any non-digit paste content and cap at 6
  otpInput.addEventListener('input', () => {
    otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
  });

  // Submit on Enter when 6 digits are present
  otpInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (otpInput.value.length === 6) {
        document.getElementById('verify-otp-btn')?.click();
      }
    }
  });
}

// ── SEND OTP ─────────────────────────────────
async function sendOTP(e) {
  e?.preventDefault();

  const phoneInput = document.getElementById('phone-input');
  if (!phoneInput) return;

  const phone = phoneInput.value.trim();
  clearAuthError();

  // ── Client-side validation ──
  if (!phone) {
    showAuthError('Please enter your mobile number.');
    return;
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    showAuthError('Enter a valid 10-digit Indian mobile number (starts with 6–9).');
    return;
  }

  // ── Client-side cooldown guard ──
  if (_otpCooldownSeconds > 0) {
    showAuthError(`Please wait ${_otpCooldownSeconds}s before requesting a new OTP.`);
    return;
  }

  const btn = document.getElementById('send-otp-btn');
  setButtonLoading(btn, 'SENDING...');

  try {
    const res = await api('/api/auth/send-otp', 'POST', { phone });

    if (res.success) {
      _currentPhone = phone;

      // Switch to OTP step
      document.getElementById('otp-phone-display').textContent = `+91 ${phone}`;
      document.getElementById('step-phone')?.classList.add('hidden');
      document.getElementById('step-otp')?.classList.remove('hidden');

      // ── NEVER auto-fill OTP — only show in console ──
      const otpInput = document.getElementById('otp-input');
      otpInput.value = '';
      otpInput.focus();

      // Backend logs OTP via console.log; we show a hint in the UI only in dev
      if (res._devOtp) {
        // DO NOT write to the input field.
        // Intentionally console-only so developers can copy-paste manually.
        console.log('%c🔐 DEV OTP:', 'color: #2bef88; font-weight: bold;', res._devOtp);
        showToast('OTP logged to console (dev mode)', 'info');
      }

      // Start resend cooldown
      startResendCooldown();

    } else {
      // Server-side rate-limit / validation error
      showAuthError(res.message || 'Could not send OTP. Try again.');
    }

  } catch (err) {
    if (err.status === 429) {
      showAuthError('Too many requests. Please wait before trying again.');
    } else if (err.status >= 500) {
      showAuthError('Server error. Please try again in a moment.');
    } else {
      showAuthError(err.message || 'Failed to send OTP. Check your connection.');
    }
  } finally {
    setButtonLoading(btn, 'SEND OTP', false);
  }
}

// ── VERIFY OTP ───────────────────────────────
async function verifyOTP(e) {
  e?.preventDefault();

  const phone    = _currentPhone || document.getElementById('phone-input')?.value.trim();
  const otpInput = document.getElementById('otp-input');
  const otp      = otpInput?.value.trim();

  clearAuthError();

  // ── Client-side guards ──
  if (!phone) {
    showAuthError('Session expired. Please go back and enter your number again.');
    return;
  }
  if (!otp) {
    showAuthError('Please enter the OTP sent to your phone.');
    otpInput?.focus();
    return;
  }
  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    showAuthError('OTP must be exactly 6 digits.');
    otpInput?.focus();
    return;
  }

  const btn = document.getElementById('verify-otp-btn');
  setButtonLoading(btn, 'VERIFYING...');

  try {
    const res = await api('/api/auth/verify-otp', 'POST', { phone, otp });

    if (res.success) {
      // Clear sensitive fields immediately
      if (otpInput) otpInput.value = '';
      stopResendCooldown();

      setUser(res.user);
      hideModal('login');
      showToast(`Welcome! Logged in as ${res.user.phone}`, 'success');

    } else {
      // Show error with attempts remaining if provided
      const attemptsMsg = typeof res.remainingAttempts === 'number'
        ? ` ${res.remainingAttempts} attempt${res.remainingAttempts !== 1 ? 's' : ''} left.`
        : '';

      showAuthError((res.message || 'Invalid OTP.') + attemptsMsg);

      // Shake the OTP input for visual feedback
      shakeElement(otpInput);

      // If no attempts left, force back to phone step after a moment
      if (res.code === 'MAX_ATTEMPTS' || res.remainingAttempts === 0) {
        setTimeout(() => {
          showAuthError('Too many failed attempts. Please request a new OTP.');
          resetToPhone(/* clearPhone= */ false);
        }, 1500);
      } else {
        // Clear input so user re-types cleanly
        if (otpInput) {
          otpInput.value = '';
          otpInput.focus();
        }
      }
    }

  } catch (err) {
    if (err.status === 429) {
      showAuthError('Too many attempts. Please request a new OTP.');
    } else if (err.status >= 500) {
      showAuthError('Server error during verification. Please try again.');
    } else {
      showAuthError(err.message || 'Verification failed. Check your connection.');
    }
  } finally {
    setButtonLoading(btn, 'VERIFY & LOGIN', false);
  }
}

// ── RESEND OTP ───────────────────────────────
async function resendOTP(e) {
  e?.preventDefault();

  if (_otpCooldownSeconds > 0) {
    showAuthError(`Please wait ${_otpCooldownSeconds}s before resending.`);
    return;
  }

  // Re-use sendOTP but keep the user on the OTP step
  clearAuthError();

  const phone = _currentPhone || document.getElementById('phone-input')?.value.trim();
  if (!phone) { resetToPhone(); return; }

  const btn = document.getElementById('resend-otp-btn');
  setButtonLoading(btn, 'SENDING...');

  try {
    const res = await api('/api/auth/send-otp', 'POST', { phone });

    if (res.success) {
      const otpInput = document.getElementById('otp-input');
      if (otpInput) { otpInput.value = ''; otpInput.focus(); }

      if (res._devOtp) {
        console.log('%c🔐 DEV OTP (resend):', 'color: #2bef88; font-weight: bold;', res._devOtp);
      }

      showToast('OTP resent. Check your phone.', 'success');
      startResendCooldown();
    } else {
      showAuthError(res.message || 'Could not resend OTP.');
    }

  } catch (err) {
    if (err.status === 429) {
      showAuthError('Rate limited. Please wait before retrying.');
    } else {
      showAuthError(err.message || 'Failed to resend OTP.');
    }
  } finally {
    setButtonLoading(btn, 'Resend OTP', false);
  }
}

// ── RESET TO PHONE STEP ──────────────────────
function resetToPhone(clearPhone = true) {
  document.getElementById('step-otp')?.classList.add('hidden');
  document.getElementById('step-phone')?.classList.remove('hidden');

  const otpInput = document.getElementById('otp-input');
  if (otpInput) otpInput.value = '';

  if (clearPhone) {
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) phoneInput.value = '';
    _currentPhone = '';
  }

  clearAuthError();
  stopResendCooldown();
}

// ── LOGOUT ───────────────────────────────────
async function logout() {
  try { await api('/api/auth/logout', 'POST'); } catch (_) {}
  clearUser();
  showToast('Logged out', 'info');
}

// ── AUTH ERROR HELPERS ───────────────────────
function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) el.classList.add('hidden');
}

// ── RESEND COOLDOWN ──────────────────────────
const RESEND_COOLDOWN_SECS = 30;

function startResendCooldown() {
  _otpCooldownSeconds = RESEND_COOLDOWN_SECS;
  _updateResendBtn();

  stopResendCooldown(); // clear any running timer first

  _otpCooldownTimer = setInterval(() => {
    _otpCooldownSeconds--;
    _updateResendBtn();

    if (_otpCooldownSeconds <= 0) {
      stopResendCooldown();
    }
  }, 1000);
}

function stopResendCooldown() {
  clearInterval(_otpCooldownTimer);
  _otpCooldownTimer = null;
  _otpCooldownSeconds = 0;
  _updateResendBtn();
}

function _updateResendBtn() {
  const btn = document.getElementById('resend-otp-btn');
  if (!btn) return;

  if (_otpCooldownSeconds > 0) {
    btn.textContent = `Resend in ${_otpCooldownSeconds}s`;
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    btn.classList.remove('hover:text-brand-400');
  } else {
    btn.textContent = 'Resend OTP';
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
    btn.classList.add('hover:text-brand-400');
  }
}

// ── SHAKE ANIMATION (invalid OTP feedback) ───
function shakeElement(el) {
  if (!el) return;
  el.classList.remove('shake');           // reset if already animating
  void el.offsetWidth;                    // force reflow
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

// ── BUTTON LOADING HELPER ────────────────────
function setButtonLoading(btn, label, loading = true) {
  if (!btn) return;
  btn.textContent = label;
  btn.disabled = loading;
  if (loading) btn.classList.add('opacity-70');
  else btn.classList.remove('opacity-70');
}

// ─────────────────────────────────────────────
//  REVIEWS
// ─────────────────────────────────────────────
let currentRating = 0;
let currentTags = new Set();

function setRating(n) {
  currentRating = n;
  document.querySelectorAll('#star-rating .star').forEach((s, i) => {
    s.className = `star text-3xl cursor-pointer transition-all hover:scale-110 ${
      i < n ? 'star-filled' : 'star-empty'
    }`;
  });
}

function toggleTag(el, tag) {
  if (currentTags.has(tag)) {
    currentTags.delete(tag);
    el.classList.remove('border-brand-500', 'text-brand-400');
    el.classList.add('border-surface-500', 'text-gray-400');
  } else {
    currentTags.add(tag);
    el.classList.add('border-brand-500', 'text-brand-400');
    el.classList.remove('border-surface-500', 'text-gray-400');
  }
}

async function submitReview() {
  if (!state.user) {
    hideModal('review');
    showSection('login');
    showToast('Please log in to submit a review', 'warning');
    return;
  }

  const busId   = document.getElementById('review-bus-id').value.trim();
  const comment = document.getElementById('review-comment').value.trim();
  const errEl   = document.getElementById('review-error');
  errEl.classList.add('hidden');

  if (!busId)         { reviewError('Please enter a Bus ID'); return; }
  if (!currentRating) { reviewError('Please select a rating'); return; }

  const btn = event.target;
  setButtonLoading(btn, 'SUBMITTING...');

  try {
    const res = await api('/api/reviews', 'POST', {
      busId,
      rating: currentRating,
      comment,
      tags: [...currentTags],
    });

    if (res.success) {
      hideModal('review');
      showToast('Review submitted! Thank you 🙏', 'success');
      resetReviewForm();
      loadReviews(busId);
    } else {
      reviewError(res.message || 'Failed to submit review.');
    }
  } catch (err) {
    reviewError(err.message || 'Failed to submit review. Check your connection.');
  } finally {
    setButtonLoading(btn, 'SUBMIT REVIEW', false);
  }
}

function reviewError(msg) {
  const el = document.getElementById('review-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function resetReviewForm() {
  document.getElementById('review-bus-id').value = '';
  document.getElementById('review-comment').value = '';
  currentRating = 0;
  currentTags.clear();
  setRating(0);
  document.querySelectorAll('#tag-selector .tag').forEach(el => {
    el.classList.remove('border-brand-500', 'text-brand-400');
    el.classList.add('border-surface-500', 'text-gray-400');
  });
}

async function loadReviews(busId) {
  const list = document.getElementById('reviews-list');
  list.innerHTML = `<div class="skeleton h-16 rounded-xl mb-2"></div><div class="skeleton h-16 rounded-xl"></div>`;

  try {
    const res = await api(`/api/reviews?busId=${busId}`);

    if (!res.success || !res.data.length) {
      list.innerHTML = `<div class="text-gray-600 text-sm text-center py-4 font-mono">No reviews yet for ${busId}</div>`;
      return;
    }

    const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
    list.innerHTML = `
      <div class="flex items-center gap-2 mb-3">
        <span class="font-mono font-bold text-yellow-400 text-lg">${res.avgRating}</span>
        <span class="text-yellow-400 text-sm">${stars(Math.round(res.avgRating))}</span>
        <span class="text-gray-600 text-xs">(${res.count} review${res.count !== 1 ? 's' : ''})</span>
      </div>
      ${res.data.map(r => `
        <div class="glass-light rounded-xl p-3 mb-2">
          <div class="flex items-center justify-between mb-1">
            <span class="text-yellow-400 text-sm">${stars(r.rating)}</span>
            <span class="text-gray-600 text-xs font-mono">${new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          ${r.tags?.length ? `
            <div class="flex flex-wrap gap-1 mb-1">
              ${r.tags.map(t => `<span class="text-xs text-brand-500 font-mono">#${t}</span>`).join('')}
            </div>
          ` : ''}
          ${r.comment ? `<p class="text-gray-400 text-xs">${r.comment}</p>` : ''}
          <div class="text-gray-600 text-xs mt-1 font-mono">${r.userId?.phone || 'Anonymous'}</div>
        </div>
      `).join('')}
    `;
  } catch (err) {
    list.innerHTML = `<div class="text-red-400 text-sm text-center py-4">Failed to load reviews</div>`;
  }
}

// ─────────────────────────────────────────────
//  SKELETON LOADING
// ─────────────────────────────────────────────
function showSkeleton() {
  const list    = document.getElementById('results-list');
  const section = document.getElementById('results-section');
  list.innerHTML = [1, 2, 3].map(() => `
    <div class="glass-light rounded-xl p-4">
      <div class="skeleton h-4 w-32 rounded mb-3"></div>
      <div class="skeleton h-3 w-full rounded mb-2"></div>
      <div class="skeleton h-2 w-full rounded mb-3"></div>
      <div class="skeleton h-4 w-24 rounded"></div>
    </div>
  `).join('');
  section.classList.remove('hidden');
  section.classList.add('flex');
}

function hideSkeleton() {
  // FIX: was a no-op — now actually hides the skeleton section so it
  // never stays visible when results / empty / error state takes over.
  const section = document.getElementById('results-section');
  if (section) {
    section.classList.add('hidden');
    section.classList.remove('flex');
  }
  const list = document.getElementById('results-list');
  if (list) list.innerHTML = '';
}

// ─────────────────────────────────────────────
//  MODAL / SECTION HELPERS
// ─────────────────────────────────────────────
function showModal(name) {
  document.getElementById(`modal-${name}`).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function hideModal(name) {
  document.getElementById(`modal-${name}`).classList.add('hidden');
  document.body.style.overflow = '';
}

function showSection(name) {
  if (name === 'login')  showModal('login');
  else if (name === 'review') showModal('review');
}

function showEl(id)     { document.getElementById(id)?.classList.remove('hidden'); }
function hideEl(id)     { document.getElementById(id)?.classList.add('hidden'); }
function hideAll(ids)   { ids.forEach(hideEl); }

function showError(msg) {
  document.getElementById('error-msg').textContent = msg;
  showEl('error-state');
}

function showInputError(inputId, msg) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.style.borderColor = '#f87171';
  input.placeholder = msg;
  setTimeout(() => {
    input.style.borderColor = '';
    input.placeholder = inputId === 'src-input' ? 'Source location...' : 'Destination...';
  }, 2500);
}

// Close modals on backdrop click
document.querySelectorAll('[id^="modal-"]').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.add('hidden'));
    document.body.style.overflow = '';
  }
});

// ─────────────────────────────────────────────
//  TOAST NOTIFICATIONS
// ─────────────────────────────────────────────
let toastTimer;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const colors = {
    success: 'text-green-400 border-green-500',
    warning: 'text-yellow-400 border-yellow-500',
    error:   'text-red-400 border-red-500',
    info:    'text-blue-400 border-blue-500',
  };
  const icons = { success: '✓', warning: '⚠', error: '✕', info: 'ℹ' };

  toast.className = `fixed bottom-6 right-6 z-50 glass text-sm px-5 py-3 rounded-xl font-mono animate-slide-up border ${colors[type] || colors.info}`;
  toast.innerHTML = `<span class="mr-2">${icons[type]}</span>${message}`;
  toast.classList.remove('hidden');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ─────────────────────────────────────────────
//  API HELPER
// ─────────────────────────────────────────────
async function api(url, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);

  // FIX: res.json() throws if server returns HTML (e.g. nginx 502 error page).
  // Safely parse — fall back to a plain error object so callers always get JSON.
  let data;
  try {
    data = await res.json();
  } catch (_parseErr) {
    const err = new Error(`Server returned non-JSON response (HTTP ${res.status}). Is the server running?`);
    err.status = res.status;
    throw err;
  }

  if (!res.ok && !data.success) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code   = data.code;
    throw err;
  }

  return data;
}