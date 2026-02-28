const API_BASE = '';
const API_CREDENTIALS = { credentials: 'include' };

function escapeHtml(s) {
  if (s == null) return '';
  const t = String(s);
  const div = document.createElement('div');
  div.textContent = t;
  return div.innerHTML;
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (_) {
    return iso;
  }
}

async function loadProfile() {
  try {
    const res = await fetch(API_BASE + '/api/profile', API_CREDENTIALS);
    if (res.status === 401) {
      window.location.href = 'index.html';
      return null;
    }
    if (res.ok) return res.json();
    // 404/500 or other: try fallback using /api/auth/me + /api/characters (same data, different endpoints)
    const meRes = await fetch(API_BASE + '/api/auth/me', API_CREDENTIALS);
    const me = meRes.ok ? await meRes.json() : null;
    if (!me || !me.id) {
      window.location.href = 'index.html';
      return null;
    }
    const charsRes = await fetch(API_BASE + '/api/characters', API_CREDENTIALS);
    const characters = charsRes.ok ? await charsRes.json() : [];
    return {
      user: { id: me.id, username: me.username, createdAt: me.createdAt },
      characters: Array.isArray(characters) ? characters : []
    };
  } catch (e) {
    // Network or parse error: try fallback
    try {
      const meRes = await fetch(API_BASE + '/api/auth/me', API_CREDENTIALS);
      const me = meRes.ok ? await meRes.json() : null;
      if (!me || !me.id) throw new Error('Not logged in');
      const charsRes = await fetch(API_BASE + '/api/characters', API_CREDENTIALS);
      const characters = charsRes.ok ? await charsRes.json() : [];
      return {
        user: { id: me.id, username: me.username, createdAt: me.createdAt },
        characters: Array.isArray(characters) ? characters : []
      };
    } catch (_) {
      throw new Error('Failed to load profile. Make sure you’re logged in and the server is running.');
    }
  }
}

function renderProfile(data) {
  const user = data.user || {};
  document.getElementById('profile-username').textContent = user.username || '';
  document.getElementById('profile-username-value').textContent = escapeHtml(user.username || '—');
  const emailEl = document.getElementById('profile-email-value');
  if (emailEl) emailEl.textContent = user.email ? escapeHtml(user.email) : '—';
  document.getElementById('profile-created-value').textContent = formatDate(user.createdAt);
}

async function renderCharactersGrid(characters) {
  const grid = document.getElementById('profile-characters-grid');
  const empty = document.getElementById('profile-characters-empty');
  if (!grid) return;
  if (!characters || characters.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');
  const missingPortrait = characters.map((c, i) => ({ c, i })).filter(({ c }) => !(c.portrait != null && String(c.portrait).trim().length > 0));
  if (missingPortrait.length > 0) {
    const filled = await Promise.all(missingPortrait.map(async ({ c, i }) => {
      try {
        const r = await fetch(API_BASE + '/api/characters/' + encodeURIComponent(c.id), API_CREDENTIALS);
        if (!r.ok) return characters[i];
        const full = await r.json();
        if (full.portrait && String(full.portrait).trim().length > 0) return { ...c, portrait: full.portrait };
      } catch (_) {}
      return characters[i];
    }));
    missingPortrait.forEach(({ i }, j) => { characters[i] = filled[j]; });
  }
  function safeSrc(url) {
    const s = String(url).trim();
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  grid.innerHTML = characters.map(c => {
    const name = escapeHtml(c.name || 'Unnamed');
    const cls = escapeHtml(c.class || '—');
    const level = c.level != null ? c.level : 1;
    const openUrl = 'index.html?character=' + encodeURIComponent(c.id);
    const portraitVal = c.portrait != null ? String(c.portrait).trim() : '';
    const hasPortrait = portraitVal.length > 0;
    const portraitHtml = hasPortrait
      ? '<img class="profile-character-portrait-img" src="' + safeSrc(portraitVal) + '" alt="" data-fallback="no-portrait" />'
      : '<div class="profile-character-portrait-placeholder">No portrait</div>';
    return (
      '<article class="profile-character-card">' +
      '<a href="' + openUrl + '" class="profile-character-card-link">' +
      '<div class="profile-character-portrait-wrap">' + portraitHtml + '</div>' +
      '<h3 class="profile-character-name">' + name + '</h3>' +
      '<p class="profile-character-meta">' + cls + ' · Level ' + level + '</p>' +
      '</a>' +
      '<a href="' + openUrl + '" class="btn btn-primary btn-sm profile-character-open">Open</a>' +
      '</article>'
    );
  }).join('');
  grid.querySelectorAll('.profile-character-portrait-img[data-fallback="no-portrait"]').forEach(img => {
    img.addEventListener('error', function () {
      const wrap = this.closest('.profile-character-portrait-wrap');
      if (wrap) wrap.innerHTML = '<div class="profile-character-portrait-placeholder">No portrait</div>';
    });
  });
}

function setupThemeToggle() {
  document.getElementById('profile-theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    html.setAttribute('data-theme', isLight ? 'dark' : 'light');
    try { localStorage.setItem('dice-proj-theme', isLight ? 'dark' : 'light'); } catch (_) {}
  });
}

function setupLogout() {
  document.getElementById('profile-logout')?.addEventListener('click', async () => {
    await fetch(API_BASE + '/api/auth/logout', { method: 'POST', ...API_CREDENTIALS });
    window.location.href = 'index.html';
  });
}

function setupChangePassword() {
  const modal = document.getElementById('profile-change-password-modal');
  const btn = document.getElementById('profile-btn-change-password');
  const cancelBtn = document.getElementById('profile-password-cancel');
  const form = document.getElementById('profile-change-password-form');
  const errEl = document.getElementById('profile-password-error');

  function showError(msg) {
    if (errEl) {
      errEl.textContent = msg || '';
      errEl.classList.toggle('hidden', !msg);
    }
  }

  function closeModal() {
    if (modal) modal.classList.add('hidden');
    if (form) form.reset();
    showError('');
  }

  btn?.addEventListener('click', () => {
    if (modal) modal.classList.remove('hidden');
    showError('');
    document.getElementById('profile-current-password')?.focus();
  });

  cancelBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = document.getElementById('profile-current-password')?.value || '';
    const newP = document.getElementById('profile-new-password')?.value || '';
    const confirmP = document.getElementById('profile-confirm-password')?.value || '';
    showError('');
    if (newP.length < 6) {
      showError('New password must be at least 6 characters.');
      return;
    }
    if (newP !== confirmP) {
      showError('New password and confirmation do not match.');
      return;
    }
    try {
      const res = await fetch(API_BASE + '/api/profile/change-password', {
        method: 'POST',
        ...API_CREDENTIALS,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: newP })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.error || 'Failed to update password.');
        return;
      }
      closeModal();
    } catch (err) {
      showError('Network error. Try again.');
    }
  });
}

async function init() {
  setupThemeToggle();
  setupLogout();
  setupChangePassword();
  const data = await loadProfile();
  if (!data) return;
  renderProfile(data);
  await renderCharactersGrid(data.characters || []);
}

init().catch(err => {
  console.error(err);
  document.body.innerHTML = '<div class="profile-main"><p style="color:var(--danger)">Failed to load profile. <a href="index.html">Return to character sheet</a></p></div>';
});
