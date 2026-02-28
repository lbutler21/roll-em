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
  document.getElementById('profile-created-value').textContent = formatDate(user.createdAt);
}

function renderCharactersGrid(characters) {
  const grid = document.getElementById('profile-characters-grid');
  const empty = document.getElementById('profile-characters-empty');
  if (!grid) return;
  if (!characters || characters.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');
  grid.innerHTML = characters.map(c => {
    const name = escapeHtml(c.name || 'Unnamed');
    const cls = escapeHtml(c.class || '—');
    const level = c.level != null ? c.level : 1;
    const updated = formatDate(c.updatedAt);
    const openUrl = 'index.html?character=' + encodeURIComponent(c.id);
    return (
      '<article class="profile-character-card">' +
      '<h3 class="profile-character-name">' + name + '</h3>' +
      '<p class="profile-character-meta">' + cls + ' · Level ' + level + '</p>' +
      '<p class="profile-character-updated">Updated ' + updated + '</p>' +
      '<a href="' + openUrl + '" class="btn btn-primary btn-sm profile-character-open">Open</a>' +
      '</article>'
    );
  }).join('');
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

async function init() {
  setupThemeToggle();
  setupLogout();
  const data = await loadProfile();
  if (!data) return;
  renderProfile(data);
  renderCharactersGrid(data.characters || []);
}

init().catch(err => {
  console.error(err);
  document.body.innerHTML = '<div class="profile-main"><p style="color:var(--danger)">Failed to load profile. <a href="index.html">Return to character sheet</a></p></div>';
});
