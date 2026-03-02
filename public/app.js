const API_BASE = '';
const API_CREDENTIALS = { credentials: 'include' };

const THEME_KEY = 'dice-proj-theme';
const SCENE_KEY = 'dice-proj-scene';
const SCENE_BG_IMAGE_KEY = 'dice-proj-scene-bg-image';
const CHARACTER_SCENES_CACHE_KEY = 'dice-proj-character-scenes';
const CHARACTER_BACKUPS_KEY = 'dice-proj-character-backups';

const SCENES = [
  { id: 'default', name: 'Default' },
  { id: 'forest', name: 'Forest' },
  { id: 'ocean', name: 'Ocean' },
  { id: 'royal', name: 'Royal' },
  { id: 'ember', name: 'Ember' },
  { id: 'custom', name: 'Custom image' },
];

function getTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch (e) {}
  return 'dark';
}

function setTheme(theme) {
  theme = theme === 'light' ? 'light' : 'dark';
  if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  const icon = theme === 'light' ? '🌙' : '☀';
  const title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
  ['btn-theme-toggle', 'landing-theme-toggle'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) { btn.textContent = icon; btn.title = title; }
  });
}

function getScene() {
  try {
    const s = localStorage.getItem(SCENE_KEY);
    if (SCENES.some(sc => sc.id === s)) return s;
  } catch (e) {}
  return 'default';
}

function getSceneBgImage() {
  try {
    return localStorage.getItem(SCENE_BG_IMAGE_KEY) || '';
  } catch (e) {}
  return '';
}

function getCharacterScenesCache() {
  try {
    return JSON.parse(localStorage.getItem(CHARACTER_SCENES_CACHE_KEY) || '{}');
  } catch (e) {}
  return {};
}

function saveCurrentCharacterSceneToCache() {
  if (!state.characterId) return;
  const cache = getCharacterScenesCache();
  cache[state.characterId] = { scene: getScene(), sceneBgImage: getSceneBgImage() };
  try {
    localStorage.setItem(CHARACTER_SCENES_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {}
}

function getCharacterBackups() {
  try {
    const raw = localStorage.getItem(CHARACTER_BACKUPS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {}
  return [];
}

function addCharacterToBackup(char) {
  if (!char || typeof char !== 'object') return;
  const list = getCharacterBackups();
  const id = char.id;
  const idx = id ? list.findIndex(c => c.id === id) : -1;
  const copy = { ...char };
  if (idx >= 0) list[idx] = copy;
  else list.push(copy);
  try {
    localStorage.setItem(CHARACTER_BACKUPS_KEY, JSON.stringify(list));
  } catch (e) {}
}

function setScene(sceneId) {
  sceneId = SCENES.some(sc => sc.id === sceneId) ? sceneId : 'default';
  if (sceneId === 'default') document.documentElement.removeAttribute('data-scene');
  else document.documentElement.setAttribute('data-scene', sceneId);
  try { localStorage.setItem(SCENE_KEY, sceneId); } catch (e) {}

  if (sceneId === 'custom') {
    const stored = getSceneBgImage();
    if (stored) {
      const cssVal = stored.startsWith('data:') ? stored : ('"' + stored.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
      document.documentElement.style.setProperty('--scene-bg-image', 'url(' + cssVal + ')');
    } else document.documentElement.style.setProperty('--scene-bg-image', 'none');
  } else {
    document.documentElement.style.removeProperty('--scene-bg-image');
  }
  renderSceneOptions();
}

function openSceneModal() {
  renderSceneOptions();
  const modal = document.getElementById('scene-modal');
  if (modal) { modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); }
}

function closeSceneModal() {
  const modal = document.getElementById('scene-modal');
  if (modal) { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); }
}

function renderSceneOptions() {
  const container = document.getElementById('scene-options');
  if (!container) return;
  const current = getScene();
  container.innerHTML = SCENES.map(sc =>
    `<button type="button" class="scene-option" data-scene="${sc.id}" data-active="${sc.id === current}">${sc.name}</button>`
  ).join('');
  container.querySelectorAll('.scene-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.scene === 'custom') {
        if (getSceneBgImage()) setScene('custom');
        else document.getElementById('scene-bg-file')?.click();
      } else {
        setScene(btn.dataset.scene);
      }
    });
  });
  const removeBtn = document.getElementById('scene-custom-remove');
  if (removeBtn) {
    removeBtn.classList.toggle('hidden', current !== 'custom' || !getSceneBgImage());
  }
}

setTheme(getTheme());
setScene(getScene());

let authUser = null;
let showSheetWithoutAuth = false;

async function checkAuth() {
  try {
    const res = await fetch(API_BASE + '/api/auth/me', API_CREDENTIALS);
    authUser = res.ok ? await res.json() : null;
  } catch (e) {
    authUser = null;
  }
  const statusEl = document.getElementById('auth-status');
  const userEl = document.getElementById('auth-user');
  const usernameEl = document.getElementById('auth-username');
  if (statusEl) statusEl.classList.toggle('hidden', !!authUser);
  if (userEl) userEl.classList.toggle('hidden', !authUser);
  if (usernameEl) usernameEl.textContent = authUser ? 'Logged in as ' + (authUser.username || '') : '';
  const gated = document.querySelectorAll('.btn-gated-by-auth');
  gated.forEach(el => { el.disabled = !authUser; el.title = authUser ? (el.dataset.titleLoggedIn || '') : 'Log in to use this'; });
  updateLandingAndAppVisibility();
}

function openCharacterFromUrlIfPresent() {
  if (!authUser || isAdminView()) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('character');
  if (!id) return;
  if (typeof loadCharacter === 'function') loadCharacter(id);
  try { history.replaceState({}, '', location.pathname + location.hash); } catch (_) {}
}

function isAdminView() {
  return location.hash === '#admin' && authUser && authUser.id === 'admin';
}

function updateLandingAndAppVisibility() {
  const mainApp = document.getElementById('main-app');
  const adminPanel = document.getElementById('admin-panel');
  const landing = document.getElementById('landing-page');
  if (!mainApp || !adminPanel) return;
  if (isAdminView()) {
    mainApp.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    if (landing) landing.classList.add('hidden');
    loadAdminPanel();
  } else if (authUser || showSheetWithoutAuth) {
    mainApp.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    if (landing) landing.classList.add('hidden');
    const adminViewBanner = document.getElementById('admin-view-banner');
    const adminViewCharName = document.getElementById('admin-view-char-name');
    if (adminViewBanner && adminViewCharName) {
      if (state.adminViewingCharacter) {
        adminViewBanner.classList.remove('hidden');
        adminViewCharName.textContent = state.adminViewingCharacterName || getValue('name') || 'Unnamed';
      } else {
        adminViewBanner.classList.add('hidden');
      }
    }
  } else {
    mainApp.classList.add('hidden');
    adminPanel.classList.add('hidden');
    if (landing) landing.classList.remove('hidden');
  }
}

async function loadAdminPanel() {
  const usersEl = document.getElementById('admin-users-list');
  const charsEl = document.getElementById('admin-characters-list');
  if (!usersEl || !charsEl) return;
  usersEl.textContent = 'Loading…';
  charsEl.textContent = 'Loading…';
  try {
    const [usersRes, charsRes] = await Promise.all([
      fetch(API_BASE + '/api/admin/users', API_CREDENTIALS),
      fetch(API_BASE + '/api/admin/characters', API_CREDENTIALS)
    ]);
    if (!usersRes.ok || !charsRes.ok) {
      if (usersRes.status === 403 || charsRes.status === 403) {
        usersEl.textContent = 'Access denied.';
        charsEl.textContent = '';
        return;
      }
      usersEl.textContent = 'Failed to load.';
      charsEl.textContent = '';
      return;
    }
    const users = await usersRes.json();
    const characters = await charsRes.json();
    const userMap = {};
    (users || []).forEach(u => { userMap[u.id] = u.username || u.id; });
    userMap['admin'] = 'admin';

    if (!users.length) usersEl.innerHTML = '<p class="admin-empty">No users yet.</p>';
    else {
      usersEl.innerHTML = '<table class="admin-table"><thead><tr><th>Username</th><th>User ID</th><th>Created</th></tr></thead><tbody>' +
        users.map(u => '<tr><td>' + escapeHtml(u.username || '') + '</td><td><code>' + escapeHtml(u.id || '') + '</code></td><td>' + escapeHtml(u.createdAt || '') + '</td></tr>').join('') + '</tbody></table>';
    }

    if (!characters.length) charsEl.innerHTML = '<p class="admin-empty">No characters yet.</p>';
    else {
      charsEl.innerHTML = '<table class="admin-table"><thead><tr><th>Character</th><th>Class</th><th>Level</th><th>Owner</th><th>Updated</th><th></th><th></th></tr></thead><tbody>' +
        characters.map(c => '<tr><td>' + escapeHtml(c.name || '') + '</td><td>' + escapeHtml(c.class || '—') + '</td><td>' + (c.level || 1) + '</td><td>' + escapeHtml(userMap[c.userId] || c.userId || '—') + '</td><td>' + escapeHtml(c.updatedAt || '') + '</td><td><button type="button" class="btn btn-ghost btn-sm admin-view-char" data-id="' + escapeHtml(c.id) + '">View</button></td><td><button type="button" class="btn btn-ghost btn-sm btn-danger admin-delete-char" data-id="' + escapeHtml(c.id) + '">Delete</button></td></tr>').join('') + '</tbody></table>';
      charsEl.querySelectorAll('.admin-view-char').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            const res = await fetch(API_BASE + '/api/admin/characters/' + encodeURIComponent(btn.dataset.id), API_CREDENTIALS);
            if (!res.ok) throw new Error('Could not load character');
            const data = await res.json();
            state.characterId = data.id;
            state.character = data;
            state.adminViewingCharacter = true;
            state.adminViewingCharacterName = data.name || 'Unnamed';
            loadCharacterIntoForm(data);
            location.hash = '';
            updateLandingAndAppVisibility();
          } catch (e) { alert('Could not load character.'); }
        });
      });
      charsEl.querySelectorAll('.admin-delete-char').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this character? This cannot be undone.')) return;
          try {
            const res = await fetch(API_BASE + '/api/admin/characters/' + encodeURIComponent(btn.dataset.id), { method: 'DELETE', ...API_CREDENTIALS });
            if (res.ok) loadAdminPanel();
            else alert('Could not delete.');
          } catch (e) { alert('Network error.'); }
        });
      });
    }
  } catch (e) {
    usersEl.textContent = 'Failed to load.';
    charsEl.textContent = '';
  }
}

function openAuthModal(mode) {
  authModalMode = mode;
  const title = document.getElementById('auth-modal-title');
  const submitBtn = document.getElementById('auth-submit');
  const switchBtn = document.getElementById('auth-switch-mode');
  const emailRow = document.getElementById('auth-email-row');
  const emailInput = document.getElementById('auth-email-input');
  document.getElementById('auth-username-input').value = '';
  document.getElementById('auth-password-input').value = '';
  document.getElementById('auth-error').classList.add('hidden');
  if (mode === 'register') {
    if (title) title.textContent = 'Create account';
    if (submitBtn) submitBtn.textContent = 'Register';
    if (switchBtn) switchBtn.textContent = 'Already have an account? Log in';
    if (emailRow) emailRow.classList.remove('hidden');
    if (emailInput) { emailInput.value = ''; emailInput.required = true; }
  } else {
    if (title) title.textContent = 'Log in';
    if (submitBtn) submitBtn.textContent = 'Log in';
    if (switchBtn) switchBtn.textContent = 'Create an account';
    if (emailRow) emailRow.classList.add('hidden');
    if (emailInput) { emailInput.value = ''; emailInput.required = false; }
  }
  const pwInput = document.getElementById('auth-password-input');
  const toggleShow = document.querySelector('#auth-password-toggle .password-toggle-show');
  const toggleHide = document.querySelector('#auth-password-toggle .password-toggle-hide');
  if (pwInput) pwInput.type = 'password';
  if (toggleShow) { toggleShow.classList.remove('hidden'); }
  if (toggleHide) { toggleHide.classList.add('hidden'); }
  const toggleBtn = document.getElementById('auth-password-toggle');
  if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Show password');
  document.getElementById('auth-modal').classList.remove('hidden');
}

let authModalMode = 'login';

function getDisplayName(selectId, customId) {
  const sel = document.getElementById(selectId);
  const custom = document.getElementById(customId);
  const id = sel && sel.value ? sel.value.trim() : '';
  if (id === 'other' && custom) return (custom.value || '').trim();
  if (selectId === 'race' && id && RACE_OPTIONS[id]) {
    const subSel = document.getElementById('subrace');
    const subId = subSel && subSel.value ? subSel.value.trim() : '';
    const subraces = RACE_OPTIONS[id].subraces;
    if (subraces && subId && subraces[subId]) return subraces[subId].name;
    return RACE_OPTIONS[id].name;
  }
  const data = selectId === 'class' ? CLASS_OPTIONS[id] : selectId === 'background' ? BACKGROUND_OPTIONS[id] : null;
  return data ? data.name : '';
}

function featureNameToKey(name) {
  const cleaned = (name || '').replace(/\s*\([^)]*\)/g, '').trim().replace(/'/g, '').replace(/-/g, ' ');
  return cleaned.split(/\s+/).filter(Boolean).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

function wrapFeatureWithTooltip(name, customDesc) {
  const desc = customDesc || (FEATURE_DESCRIPTIONS && FEATURE_DESCRIPTIONS[featureNameToKey(name)]);
  if (desc) {
    const key = customDesc ? 'choice-' + featureNameToKey(name).replace(/[^a-z0-9]/gi, '') : featureNameToKey(name);
    return '<span class="feature-tooltip-trigger" data-feature="' + escapeHtml(key) + '" data-desc="' + escapeHtml(desc) + '">' + escapeHtml(name) + '</span>';
  }
  return escapeHtml(name);
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function getPendingFeatureChoices() {
  const raceId = getValue('race') || '';
  const classId = getValue('class') || '';
  const charLevel = Math.min(20, Math.max(1, parseInt(getValue('level'), 10) || 1));
  const pending = [];
  if (!FEATURE_CHOICES) return pending;
  Object.keys(FEATURE_CHOICES).forEach(key => {
    const cfg = FEATURE_CHOICES[key];
    if (charLevel < (cfg.level || 1)) return;
    if (cfg.source === 'race' && cfg.sourceId === raceId) pending.push({ key, ...cfg });
    if (cfg.source === 'class') {
      const ids = cfg.sourceIds || (cfg.sourceId ? [cfg.sourceId] : []);
      if (!ids.includes(classId)) return;
      // Only show Totem Spirit choices when Primal Path is Totem Warrior
      if (['totemAnimal3', 'totemAnimal6', 'totemAnimal14'].includes(key) && state.featureChoices.primalPath !== 'totem') return;
      // Only show Land terrain when Druid Circle is Land
      if (key === 'landTerrain' && state.featureChoices.druidCircle !== 'land') return;
      // Only show Hunter choices when Ranger Archetype is Hunter
      if (['huntersPrey', 'defensiveTactics', 'superiorHuntersDefense'].includes(key) && state.featureChoices.rangerArchetype !== 'hunter') return;
      pending.push({ key, ...cfg });
    }
  });
  return pending;
}

function getResolvedFeatureText(featureName, choiceKey) {
  const choice = state.featureChoices[choiceKey];
  if (!choice || !FEATURE_CHOICES || !FEATURE_CHOICES[choiceKey]) return { text: featureName, desc: null };
  const cfg = FEATURE_CHOICES[choiceKey];
  const opt = (cfg.options || []).find(o => o.id === choice);
  if (!opt) return { text: featureName, desc: null };
  let text, desc = opt.desc || null;
  if (choiceKey === 'draconicAncestry') {
    if (featureName === 'Draconic Ancestry') {
      text = 'Draconic Ancestry (' + opt.name + ')';
      desc = 'You have the heritage of a ' + opt.name.toLowerCase() + '. Your breath weapon deals ' + (opt.damageType || '').toLowerCase() + ' damage and you have resistance to ' + (opt.resistance || opt.damageType || '').toLowerCase() + ' damage.';
    } else if (featureName === 'Breath Weapon') {
      text = 'Breath Weapon (' + (opt.damageType || '') + ', ' + (opt.breathWeapon || '') + ')';
      desc = 'You can use your action to exhale destructive energy in a ' + (opt.breathWeapon || '') + '. Creatures in the area must make the appropriate saving throw or take 2d6 ' + (opt.damageType || '').toLowerCase() + ' damage (or half on success). You can\'t use this again until you finish a short or long rest.';
    } else if (featureName === 'Damage Resistance') {
      text = 'Damage Resistance (' + (opt.resistance || opt.damageType || '') + ')';
      desc = 'You have resistance to ' + (opt.resistance || opt.damageType || '').toLowerCase() + ' damage.';
    } else return { text: featureName, desc: null };
  } else if (choiceKey === 'extraLanguage') {
    text = 'Extra Language (' + opt.name + ')';
    desc = opt.desc || desc;
  } else if (choiceKey === 'bonusFeat') {
    if (choice === 'none') {
      text = 'Bonus Feat (optional rule)';
      desc = null;
    } else {
      text = 'Bonus Feat (' + opt.name + ')';
      desc = opt.desc || desc;
    }
  } else if (choiceKey === 'skillVersatility') {
    text = 'Skill Versatility (' + opt.name + ')';
    desc = opt.desc || desc;
  } else {
    text = featureName + ' (' + opt.name + ')';
    desc = opt.desc || desc;
  }
  return { text, desc };
}

function updateAutoFeatures() {
  const raceId = getValue('race') || '';
  const classId = getValue('class') || '';
  const bgId = getValue('background') || '';
  const charLevel = Math.min(20, Math.max(1, parseInt(getValue('level'), 10) || 1));
  const parts = [];
  const raceData = RACE_OPTIONS[raceId];
  const subraceId = getValue('subrace') || '';
  const subraceData = raceData && raceData.subraces && subraceId ? raceData.subraces[subraceId] : null;
  const raceDisplayName = subraceData ? subraceData.name : (raceData ? raceData.name : '');
  if (raceData && raceData.features) {
    let featLines = raceData.features.split(/\n/).filter(Boolean).map(f => {
      const name = f.trim();
      let choiceKey = 'draconicAncestry';
      if (name.indexOf('Extra Language') >= 0) choiceKey = 'extraLanguage';
      else if (name.indexOf('Bonus Feat') >= 0) choiceKey = 'bonusFeat';
      else if (name.indexOf('Skill Versatility') >= 0) choiceKey = 'skillVersatility';
      const resolved = getResolvedFeatureText(name, choiceKey);
      return wrapFeatureWithTooltip(resolved.text, resolved.desc);
    });
    if (subraceData && subraceData.features) {
      const subFeats = subraceData.features.split(/\n/).filter(Boolean).map(f => wrapFeatureWithTooltip(f.trim()));
      featLines = featLines.concat(subFeats);
    }
    parts.push('[Race: ' + raceDisplayName + ']\n' + featLines.join(', '));
  }
  const classData = CLASS_OPTIONS[classId];
  const choiceKeyByFeature = {};
  if (FEATURE_CHOICES) {
    Object.keys(FEATURE_CHOICES).forEach(key => {
      const cfg = FEATURE_CHOICES[key];
      if (cfg.source === 'race') return;
      const ids = cfg.sourceIds || (cfg.sourceId ? [cfg.sourceId] : []);
      if (ids.includes(classId) && charLevel >= (cfg.level || 1)) choiceKeyByFeature[cfg.featureLabel] = key;
    });
  }
  if (classData && classData.featuresByLevel && Object.keys(classData.featuresByLevel).length > 0) {
    const levelLines = [];
    for (let lvl = 1; lvl <= charLevel; lvl++) {
      const txt = classData.featuresByLevel[lvl];
      if (txt && txt !== '—') {
        const featNames = txt.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        const wrapped = featNames.map(name => {
          // Ability Score Improvement: resolve by level (asi4, asi6, etc.)
          if (name === 'Ability Score Improvement') {
            const asiKey = 'asi' + lvl;
            if (FEATURE_CHOICES && FEATURE_CHOICES[asiKey]) {
              const resolved = getResolvedFeatureText(name, asiKey);
              return wrapFeatureWithTooltip(resolved.text, resolved.desc);
            }
          }
          // Favored Enemy improvement: 2nd type at 6, 3rd at 14
          if (name === 'Favored Enemy improvement') {
            const key = lvl === 6 ? 'favoredEnemy6' : lvl === 14 ? 'favoredEnemy14' : null;
            if (key && FEATURE_CHOICES && FEATURE_CHOICES[key]) {
              const resolved = getResolvedFeatureText('Favored Enemy', key);
              const ord = lvl === 6 ? '2nd' : '3rd';
              const suffix = resolved.text.replace(/^Favored Enemy \(|\)$/g, '');
              const text = suffix ? 'Favored Enemy (' + ord + ' type: ' + suffix + ')' : name;
              return wrapFeatureWithTooltip(text, resolved.desc);
            }
          }
          // Natural Explorer improvement: 2nd terrain at 6, 3rd at 10
          if (name === 'Natural Explorer improvement') {
            const key = lvl === 6 ? 'naturalExplorer6' : lvl === 10 ? 'naturalExplorer10' : null;
            if (key && FEATURE_CHOICES && FEATURE_CHOICES[key]) {
              const choice = state.featureChoices[key];
              const cfg = FEATURE_CHOICES[key];
              const opt = (cfg.options || []).find(o => o.id === choice);
              const terrainName = opt ? opt.name : '';
              const ord = lvl === 6 ? '2nd' : '3rd';
              const text = terrainName ? 'Natural Explorer (' + ord + ' terrain: ' + terrainName + ')' : name;
              return wrapFeatureWithTooltip(text, null);
            }
          }
          // Totem Spirit / Aspect of the Beast / Totemic Attunement: show chosen animal
          if (name === 'Totem Spirit' && state.featureChoices.totemAnimal3) {
            const resolved = getResolvedFeatureText(name, 'totemAnimal3');
            return wrapFeatureWithTooltip(resolved.text, resolved.desc);
          }
          if (name === 'Aspect of the Beast' && state.featureChoices.totemAnimal6) {
            const resolved = getResolvedFeatureText(name, 'totemAnimal6');
            return wrapFeatureWithTooltip(resolved.text, resolved.desc);
          }
          if (name === 'Totemic Attunement' && state.featureChoices.totemAnimal14) {
            const resolved = getResolvedFeatureText(name, 'totemAnimal14');
            return wrapFeatureWithTooltip(resolved.text, resolved.desc);
          }
          // Expertise (Bard 3/10, Rogue 1/6)
          if (name === 'Expertise') {
            const expKey = classId === 'bard' && lvl === 3 ? 'expertiseBard3' : classId === 'bard' && lvl === 10 ? 'expertiseBard10' : classId === 'rogue' && lvl === 1 ? 'expertiseRogue1' : classId === 'rogue' && lvl === 6 ? 'expertiseRogue6' : null;
            if (expKey && FEATURE_CHOICES && FEATURE_CHOICES[expKey]) {
              const resolved = getResolvedFeatureText(name, expKey);
              return wrapFeatureWithTooltip(resolved.text, resolved.desc);
            }
          }
          // Metamagic (Sorcerer: 2 at 3, +1 at 10, +1 at 17)
          if (name === 'Metamagic' && classId === 'sorcerer') {
            if (lvl === 3) {
              const r1 = getResolvedFeatureText(name, 'metamagic3_1');
              const r2 = getResolvedFeatureText(name, 'metamagic3_2');
              return [r1, r2].map(r => wrapFeatureWithTooltip(r.text, r.desc)).join(', ');
            }
            const metaKey = lvl === 10 ? 'metamagic10' : lvl === 17 ? 'metamagic17' : null;
            if (metaKey && FEATURE_CHOICES && FEATURE_CHOICES[metaKey]) {
              const resolved = getResolvedFeatureText(name, metaKey);
              return wrapFeatureWithTooltip(resolved.text, resolved.desc);
            }
          }
          // Eldritch Invocations (Warlock: 2 at 2, +1 at 5,7,9,12,15,18)
          if (name === 'Eldritch Invocations' && classId === 'warlock') {
            if (lvl === 2) {
              const r1 = getResolvedFeatureText(name, 'invocation2_1');
              const r2 = getResolvedFeatureText(name, 'invocation2_2');
              return [r1, r2].map(r => wrapFeatureWithTooltip(r.text, r.desc)).join(', ');
            }
            const invKey = { 5: 'invocation5', 7: 'invocation7', 9: 'invocation9', 12: 'invocation12', 15: 'invocation15', 18: 'invocation18' }[lvl];
            if (invKey && FEATURE_CHOICES && FEATURE_CHOICES[invKey]) {
              const resolved = getResolvedFeatureText(name, invKey);
              return wrapFeatureWithTooltip(resolved.text, resolved.desc);
            }
          }
          // Replace subclass placeholders with specific feature names
          const subclassChoiceKey = typeof getSubclassChoiceKey === 'function' ? getSubclassChoiceKey(name, classId) : null;
          if (subclassChoiceKey && typeof SUBCLASS_FEATURES !== 'undefined') {
            const chosen = state.featureChoices[subclassChoiceKey];
            const spec = chosen && SUBCLASS_FEATURES[subclassChoiceKey] && SUBCLASS_FEATURES[subclassChoiceKey][chosen] && SUBCLASS_FEATURES[subclassChoiceKey][chosen][lvl];
            if (spec) {
              const names = spec.split(/\n/).map(s => s.trim()).filter(Boolean);
              return names.map(n => wrapFeatureWithTooltip(n, null)).join(', ');
            }
          }
          const choiceKey = Object.keys(choiceKeyByFeature).find(l => name.indexOf(l) === 0 || l.indexOf(name) >= 0);
          const resolved = choiceKey ? getResolvedFeatureText(name, choiceKeyByFeature[choiceKey]) : { text: name, desc: null };
          return wrapFeatureWithTooltip(resolved.text, resolved.desc);
        }).join(', ');
        levelLines.push('Level ' + lvl + ': ' + wrapped);
      }
    }
    if (levelLines.length) parts.push('[Class: ' + classData.name + ']\n' + levelLines.join('\n'));
  } else if (classData && classData.features) {
    const feats = classData.features.split(/\n/).filter(Boolean).map(f => {
      const name = f.trim();
      const choiceKey = choiceKeyByFeature[name] || Object.keys(choiceKeyByFeature).find(l => name.indexOf(l) === 0);
      const resolved = choiceKey ? getResolvedFeatureText(name, choiceKey) : { text: name, desc: null };
      return wrapFeatureWithTooltip(resolved.text, resolved.desc);
    }).join(', ');
    parts.push('[Class: ' + classData.name + ']\n' + feats);
  }
  const bgData = BACKGROUND_OPTIONS[bgId];
  if (bgData && bgData.features) {
    const feats = bgData.features.split(/\n/).filter(Boolean).map(f => wrapFeatureWithTooltip(f.trim())).join(', ');
    parts.push('[Background: ' + bgData.name + ']\n' + feats);
  }
  const el = document.getElementById('featuresAuto');
  if (el) el.innerHTML = parts.length ? parts.join('\n\n') : '';
  bindFeatureTooltips();
}

function bindFeatureTooltips() {
  document.querySelectorAll('.feature-tooltip-trigger').forEach(el => {
    el.removeEventListener('mouseenter', showFeatureTooltip);
    el.removeEventListener('mouseleave', hideTooltip);
    el.addEventListener('mouseenter', showFeatureTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

function showFeatureTooltip(e) {
  const desc = e.target.dataset.desc || (FEATURE_DESCRIPTIONS && FEATURE_DESCRIPTIONS[e.target.dataset.feature]);
  if (desc) showTooltip(e.target, desc);
}

function showSkillTooltip(e) {
  const key = e.target.dataset.skill;
  const desc = SKILL_DESCRIPTIONS && SKILL_DESCRIPTIONS[key];
  if (desc) showTooltip(e.target, desc);
}

function showTooltip(anchor, text) {
  let tip = document.getElementById('dnd-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'dnd-tooltip';
    tip.className = 'dnd-tooltip';
    document.body.appendChild(tip);
  }
  tip.textContent = text;
  tip.classList.add('visible');
  positionTooltip(tip, anchor);
}

function positionTooltip(tip, anchor) {
  const rect = anchor.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  let left = rect.left + (rect.width / 2) - (tipRect.width / 2);
  let top = rect.top - tipRect.height - 8;
  if (top < 8) top = rect.bottom + 8;
  if (left < 8) left = 8;
  if (left + tipRect.width > window.innerWidth - 8) left = window.innerWidth - tipRect.width - 8;
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
}

function hideTooltip() {
  const tip = document.getElementById('dnd-tooltip');
  if (tip) tip.classList.remove('visible');
}

function getSpellTooltipText(spell) {
  if (!spell) return '';
  const parts = [];
  const levelStr = spell.level === 0 ? 'Cantrip' : (spell.level === 1 ? '1st' : spell.level === 2 ? '2nd' : spell.level === 3 ? '3rd' : (spell.level || 0) + 'th');
  parts.push(levelStr + (spell.school ? ' • ' + spell.school : ''));
  if (spell.casting_time) parts.push('Casting time: ' + spell.casting_time);
  if (spell.range) parts.push('Range: ' + spell.range);
  if (spell.duration) parts.push('Duration: ' + spell.duration);
  const desc = (spell.desc || '').trim();
  const maxDesc = 600;
  const descShort = desc.length > maxDesc ? desc.slice(0, maxDesc) + '…' : desc;
  if (descShort) parts.push(descShort);
  return parts.join('\n\n');
}

function showSpellTooltip(e) {
  const name = (e.target.dataset.spellName || '').trim();
  if (!name || !sheetSpellsCache) return;
  const spell = sheetSpellsCache.find(s => (s.name || '').trim() === name);
  const text = getSpellTooltipText(spell);
  if (text) showTooltip(e.target, text);
}

function toggleCustomInputs() {
  ['race', 'class', 'background'].forEach(field => {
    const sel = document.getElementById(field);
    const custom = document.getElementById(field + 'Custom');
    if (!sel || !custom) return;
    if (sel.value === 'other') custom.classList.remove('hidden'); else custom.classList.add('hidden');
  });
}

function updateSubraceVisibility() {
  const raceId = getValue('race') || '';
  const raceData = RACE_OPTIONS[raceId];
  const subraceLabel = document.getElementById('subrace-label');
  const subraceSel = document.getElementById('subrace');
  if (!subraceLabel || !subraceSel) return;
  const hasSubraces = raceData && raceData.subraces && Object.keys(raceData.subraces).length > 0;
  if (hasSubraces) {
    subraceLabel.classList.remove('hidden');
    subraceSel.innerHTML = '<option value="">—</option>';
    Object.keys(raceData.subraces).forEach(subId => {
      const opt = document.createElement('option');
      opt.value = subId;
      opt.textContent = raceData.subraces[subId].name;
      subraceSel.appendChild(opt);
    });
  } else {
    subraceLabel.classList.add('hidden');
    subraceSel.innerHTML = '<option value="">—</option>';
    setValue('subrace', '');
  }
}

function abilityModifier(score) {
  const n = parseInt(score, 10);
  if (isNaN(n)) return 0;
  return Math.floor((n - 10) / 2);
}

function formatModifier(mod) {
  if (mod >= 0) return '+' + mod;
  return String(mod);
}

const SKILL_ABILITY_MAP = {
  acrobatics: 'dex', animalHandling: 'wis', arcana: 'int', athletics: 'str',
  deception: 'cha', history: 'int', insight: 'wis', intimidation: 'cha',
  investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis',
  performance: 'cha', persuasion: 'cha', religion: 'int', sleightOfHand: 'dex',
  stealth: 'dex', survival: 'wis'
};

const SPELLCASTING_CLASSES = ['artificer', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'];

// 2014 5e spells known by level (PHB/SRD 5.1). Index 0 = level 1.
const SPELLS_KNOWN_BARD = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
const SPELLS_KNOWN_RANGER = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]; // 0 at level 1 (no spells yet)
const SPELLS_KNOWN_SORCERER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
const SPELLS_KNOWN_WARLOCK = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
const SPELLS_KNOWN_ARTIFICER = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];

// 1/3 casters (Eldritch Knight, Arcane Trickster): 0 at 1–2, then 2/2/2/2, 3/3/3/3, 4 from 11 on. Index 0 = level 1.
const SPELLS_KNOWN_THIRDCaster = [0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];

// 2014 5e cantrips known by level (PHB/SRD). Index 0 = level 1. +1 at 4th and 10th for most; Artificer +1 at 5,9,13,17.
const CANTRIPS_KNOWN_BARD = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const CANTRIPS_KNOWN_CLERIC = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const CANTRIPS_KNOWN_DRUID = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const CANTRIPS_KNOWN_SORCERER = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
const CANTRIPS_KNOWN_WARLOCK = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const CANTRIPS_KNOWN_WIZARD = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
const CANTRIPS_KNOWN_ARTIFICER = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];
const CANTRIPS_KNOWN_THIRDCaster = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; // EK/AT

function getCantripLimit(classId, level) {
  const lvl = Math.min(20, Math.max(1, level || 1));
  const idx = lvl - 1;
  if (hasSubclassSpellcasting(classId, lvl)) return CANTRIPS_KNOWN_THIRDCaster[idx] ?? 0;
  switch (classId) {
    case 'bard': return CANTRIPS_KNOWN_BARD[idx] ?? 0;
    case 'cleric': return CANTRIPS_KNOWN_CLERIC[idx] ?? 0;
    case 'druid': return CANTRIPS_KNOWN_DRUID[idx] ?? 0;
    case 'sorcerer': return CANTRIPS_KNOWN_SORCERER[idx] ?? 0;
    case 'warlock': return CANTRIPS_KNOWN_WARLOCK[idx] ?? 0;
    case 'wizard': return CANTRIPS_KNOWN_WIZARD[idx] ?? 0;
    case 'artificer': return CANTRIPS_KNOWN_ARTIFICER[idx] ?? 0;
    default: return 0; // ranger, paladin: no cantrips in 5e
  }
}

// 2014 5e spells granted by race/subrace (PHB/SRD). minLevel = character level at which spell is gained. Not counted against spells known.
const RACIAL_GRANTED_SPELLS = {
  tiefling: [
    { name: 'Thaumaturgy', minLevel: 1 },
    { name: 'Hellish Rebuke', minLevel: 3 },
    { name: 'Darkness', minLevel: 5 }
  ],
  elf: {
    drow: [
      { name: 'Dancing Lights', minLevel: 1 },
      { name: 'Faerie Fire', minLevel: 3 },
      { name: 'Darkness', minLevel: 5 }
    ]
  },
  gnome: {
    forest: [
      { name: 'Minor Illusion', minLevel: 1 }
    ]
  }
};

function getRacialGrantedSpells(raceId, subraceId, characterLevel) {
  const lvl = Math.min(20, Math.max(1, characterLevel || 1));
  const out = [];
  if (!raceId) return out;
  const race = (raceId || '').toLowerCase().trim();
  const sub = (subraceId || '').toLowerCase().trim();
  const entry = RACIAL_GRANTED_SPELLS[race];
  if (!entry) return out;
  const list = Array.isArray(entry) ? entry : (sub && entry[sub]) ? entry[sub] : null;
  if (!list || !list.length) return out;
  list.forEach(({ name, minLevel }) => { if (lvl >= minLevel && name) out.push(name); });
  return out;
}

// 2014 5e full caster spell slots by character level [1st, 2nd, 3rd, ... 9th]. Index 0 = level 1.
const SPELL_SLOTS_FULL = [
  [2], [3], [4,2], [4,3], [4,3,2], [4,3,3], [4,3,3,1], [4,3,3,2], [4,3,3,3,1], [4,3,3,3,2],
  [4,3,3,3,2,1], [4,3,3,3,2,1], [4,3,3,3,2,1,1], [4,3,3,3,2,1,1], [4,3,3,3,2,1,1,1], [4,3,3,3,2,1,1,1],
  [4,3,3,3,2,1,1,1,1], [4,3,3,3,3,1,1,1,1], [4,3,3,3,3,2,1,1,1], [4,3,3,3,3,2,2,1,1,1]
];

/** True if character has spellcasting from subclass (Eldritch Knight, Arcane Trickster) at this level. */
function hasSubclassSpellcasting(classId, level) {
  const lvl = Math.min(20, Math.max(1, level || 1));
  if (lvl < 3) return false;
  const fc = state.featureChoices || {};
  return (classId === 'fighter' && fc.martialArchetype === 'eldritchKnight') ||
    (classId === 'rogue' && fc.roguishArchetype === 'arcaneTrickster');
}

/** True if character can have spells (full/half/third caster class or EK/AT at 3+). */
function hasSpellcasting(classId, level) {
  if (SPELLCASTING_CLASSES.includes(classId)) return true;
  return hasSubclassSpellcasting(classId, level);
}

/** Returns array of 9 slot counts [1st, 2nd, ... 9th]. Warlock: one level has slots, rest 0. */
function getSpellSlotsArray(classId, level) {
  const lvl = Math.min(20, Math.max(1, level || 1));
  const out = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const subclassCaster = hasSubclassSpellcasting(classId, lvl);
  if (!SPELLCASTING_CLASSES.includes(classId) && !subclassCaster) return out;
  if (classId === 'warlock') {
    const count = lvl >= 11 ? 3 : lvl >= 2 ? 2 : 1;
    const slotLevel = lvl >= 9 ? 5 : lvl >= 7 ? 4 : lvl >= 5 ? 3 : lvl >= 3 ? 2 : 1;
    out[slotLevel - 1] = count;
    return out;
  }
  if (subclassCaster) {
    const slotLevel = Math.floor(lvl / 3);
    if (slotLevel < 1) return out;
    const row = SPELL_SLOTS_FULL[Math.min(slotLevel, 20) - 1];
    if (row && row.length) row.forEach((n, i) => { if (i < 9) out[i] = n || 0; });
    return out;
  }
  const halfCasters = ['paladin', 'ranger', 'artificer'];
  const slotLevel = halfCasters.includes(classId) ? Math.floor(lvl / 2) : lvl;
  if (slotLevel < 1) return out;
  const row = SPELL_SLOTS_FULL[Math.min(slotLevel, 20) - 1];
  if (!row || !row.length) return out;
  row.forEach((n, i) => { if (i < 9) out[i] = n || 0; });
  return out;
}

function getSpellSlotsText(classId, level) {
  const lvl = Math.min(20, Math.max(1, level || 1));
  const subclassCaster = hasSubclassSpellcasting(classId, lvl);
  if (!SPELLCASTING_CLASSES.includes(classId) && !subclassCaster) return '';
  if (classId === 'warlock') {
    const count = lvl >= 11 ? 3 : lvl >= 2 ? 2 : 1;
    const slotLevel = lvl >= 9 ? 5 : lvl >= 7 ? 4 : lvl >= 5 ? 3 : lvl >= 3 ? 2 : 1;
    const ord = slotLevel === 1 ? '1st' : slotLevel === 2 ? '2nd' : slotLevel === 3 ? '3rd' : slotLevel === 4 ? '4th' : '5th';
    return count + ' slot' + (count !== 1 ? 's' : '') + ' (' + ord + ' level)';
  }
  if (subclassCaster) {
    const slotLevel = Math.floor(lvl / 3);
    if (slotLevel < 1) return '—';
    const row = SPELL_SLOTS_FULL[Math.min(slotLevel, 20) - 1];
    if (!row || !row.length) return '—';
    const parts = [];
    ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'].forEach((ord, i) => {
      if (row[i] && row[i] > 0) parts.push(row[i] + '×' + ord);
    });
    return parts.length ? parts.join(' ') : '—';
  }
  const halfCasters = ['paladin', 'ranger', 'artificer'];
  const slotLevel = halfCasters.includes(classId) ? Math.floor(lvl / 2) : lvl;
  if (slotLevel < 1) return '—';
  const row = SPELL_SLOTS_FULL[Math.min(slotLevel, 20) - 1];
  if (!row || !row.length) return '—';
  const parts = [];
  ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'].forEach((ord, i) => {
    if (row[i] && row[i] > 0) parts.push(row[i] + '×' + ord);
  });
  return parts.length ? parts.join(' ') : '—';
}

function getSpellLimit(classId, level, getAbilityMod) {
  const lvl = Math.min(20, Math.max(1, level || 1));
  const idx = lvl - 1;
  if (hasSubclassSpellcasting(classId, lvl))
    return { limit: SPELLS_KNOWN_THIRDCaster[idx] ?? 0, label: 'Spells known', type: 'known' };
  switch (classId) {
    case 'bard':
      return { limit: SPELLS_KNOWN_BARD[idx] ?? 0, label: 'Spells known', type: 'known' };
    case 'ranger':
      return { limit: SPELLS_KNOWN_RANGER[idx] ?? 0, label: 'Spells known', type: 'known' };
    case 'sorcerer':
      return { limit: SPELLS_KNOWN_SORCERER[idx] ?? 0, label: 'Spells known', type: 'known' };
    case 'warlock':
      return { limit: SPELLS_KNOWN_WARLOCK[idx] ?? 0, label: 'Spells known', type: 'known' };
    case 'artificer':
      return { limit: SPELLS_KNOWN_ARTIFICER[idx] ?? 0, label: 'Spells known', type: 'known' };
    case 'cleric':
    case 'druid': {
      const mod = getAbilityMod('wis');
      const limit = Math.max(1, lvl + mod);
      return { limit, label: 'Spells prepared', type: 'prepared' };
    }
    case 'paladin': {
      const mod = getAbilityMod('cha');
      const limit = Math.max(1, Math.floor(lvl / 2) + mod);
      return { limit, label: 'Spells prepared', type: 'prepared' };
    }
    case 'wizard': {
      const mod = getAbilityMod('int');
      const limit = Math.max(1, lvl + mod);
      return { limit, label: 'Spells prepared', type: 'prepared' };
    }
    default:
      return { limit: 0, label: 'Spells', type: 'known' };
  }
}

const state = {
  characterId: null,
  character: null,
  featureChoices: {},
  spellsKnown: [],
  /** spellSlotsUsed[level] = array of booleans (true = used). Level 1–9. */
  spellSlotsUsed: {},
  adminViewingCharacter: false,
  adminViewingCharacterName: ''
};

function getCharacterFromForm() {
  const asiBonus = typeof getASIBonuses === 'function' ? getASIBonuses() : {};
  const abilities = {};
  ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ab => {
    const el = document.getElementById('ability-' + ab);
    const effective = el ? parseInt(el.value, 10) || 10 : 10;
    abilities[ab] = Math.max(1, Math.min(30, effective - (asiBonus[ab] || 0)));
  });

  const savingThrows = {};
  ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ab => {
    const el = document.getElementById('save-' + ab);
    savingThrows[ab] = el ? el.checked : false;
  });

  const skills = {};
  const skillIds = Object.keys(SKILL_ABILITY_MAP);
  skillIds.forEach(skill => {
    const el = document.getElementById('skill-' + skill);
    skills[skill] = el ? el.checked : false;
  });

  const raceId = getValue('race') || '';
  const classId = getValue('class') || '';
  const backgroundId = getValue('background') || '';
  return {
    id: state.characterId,
    name: getValue('name'),
    class: getDisplayName('class', 'classCustom') || (CLASS_OPTIONS[classId] && CLASS_OPTIONS[classId].name),
    classId: classId || undefined,
    level: parseInt(getValue('level'), 10) || 1,
    race: getDisplayName('race', 'raceCustom') || (RACE_OPTIONS[raceId] && RACE_OPTIONS[raceId].name),
    raceId: raceId || undefined,
    subraceId: getValue('subrace') || undefined,
    background: getDisplayName('background', 'backgroundCustom') || (BACKGROUND_OPTIONS[backgroundId] && BACKGROUND_OPTIONS[backgroundId].name),
    backgroundId: backgroundId || undefined,
    raceCustom: getValue('raceCustom'),
    classCustom: getValue('classCustom'),
    backgroundCustom: getValue('backgroundCustom'),
    alignment: getValue('alignment'),
    playerName: getValue('playerName'),
    experiencePoints: parseInt(getValue('experiencePoints'), 10) || 0,
    inspiration: (document.getElementById('inspiration') && document.getElementById('inspiration').checked) ? 1 : 0,
    proficiencyBonus: parseInt(getValue('proficiencyBonus'), 10) || 2,
    abilities,
    savingThrows,
    skills,
    armorClass: parseInt(getValue('armorClass'), 10) || 10,
    initiative: parseInt(getValue('initiative'), 10) || 0,
    speed: parseInt(getValue('speed'), 10) || 30,
    hitPointMax: parseInt(getValue('hitPointMax'), 10) || 10,
    hitPointCurrent: parseInt(getValue('hitPointCurrent'), 10) || 10,
    hitPointTemp: parseInt(getValue('hitPointTemp'), 10) || 0,
    hitDice: getValue('hitDice') || '1d8',
    hitDiceTotal: getValue('hitDiceTotal') || '1',
    deathSaves: {
      successes: parseInt(getValue('deathSuccesses'), 10) || 0,
      failures: parseInt(getValue('deathFailures'), 10) || 0
    },
    attacks: getValue('attacks'),
    actionsNotepad: getValue('actions-notepad'),
    equipment: getValue('equipment'),
    spells: [...(state.spellsKnown || [])],
    spellSlotsUsed: JSON.parse(JSON.stringify(state.spellSlotsUsed || {})),
    customFeatures: getValue('customFeatures'),
    featuresTraits: getValue('customFeatures'),
    featureChoices: { ...state.featureChoices },
    notesOrganizations: getValue('notesOrganizations'),
    notesAllies: getValue('notesAllies'),
    notesEnemies: getValue('notesEnemies'),
    notesBackstory: getValue('notesBackstory'),
    notesOther: getValue('notesOther'),
    bgGender: getValue('bgGender'),
    bgEyes: getValue('bgEyes'),
    bgSize: getValue('bgSize'),
    bgHeight: getValue('bgHeight'),
    bgFaith: getValue('bgFaith'),
    bgHair: getValue('bgHair'),
    bgSkin: getValue('bgSkin'),
    bgAge: getValue('bgAge'),
    bgWeight: getValue('bgWeight'),
    bgPersonalityTraits: getValue('bgPersonalityTraits'),
    bgIdeals: getValue('bgIdeals'),
    bgBonds: getValue('bgBonds'),
    bgFlaws: getValue('bgFlaws'),
    toolProficiencies: getValue('toolProficiencies'),
    languages: getValue('languages'),
    portrait: getValue('portrait') || undefined,
    scene: getScene(),
    sceneBgImage: getSceneBgImage() || undefined
  };
}

function getValue(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  return el.value.trim();
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === 'checkbox') el.checked = !!value;
  else el.value = value == null ? '' : value;
}

var ASI_KEYS = ['asi4', 'asi6', 'asi8', 'asi10', 'asi12', 'asi14', 'asi16', 'asi19'];

function parseASIOptionId(optionId) {
  const out = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  if (!optionId || typeof optionId !== 'string') return out;
  const ab = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const m2 = optionId.match(/^(str|dex|con|int|wis|cha)2$/);
  if (m2) {
    out[m2[1]] = 2;
    return out;
  }
  const m1 = optionId.match(/^(str|dex|con|int|wis|cha)1(str|dex|con|int|wis|cha)1$/);
  if (m1) {
    out[m1[1]] = 1;
    out[m1[2]] = 1;
    return out;
  }
  return out;
}

function getASIBonuses() {
  const out = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  if (typeof FEATURE_CHOICES === 'undefined' || !FEATURE_CHOICES || !state.featureChoices) return out;
  ASI_KEYS.forEach(key => {
    const choice = state.featureChoices[key];
    if (!choice) return;
    const cfg = FEATURE_CHOICES[key];
    if (!cfg || !cfg.options) return;
    const opt = cfg.options.find(o => o.id === choice);
    if (!opt) return;
    const bonus = parseASIOptionId(opt.id);
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ab => { out[ab] = (out[ab] || 0) + (bonus[ab] || 0); });
  });
  return out;
}

function applyASIToAbilityScores(asiKey, newChoiceValue) {
  const abList = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const oldBonuses = getASIBonuses();
  const base = {};
  abList.forEach(ab => {
    const current = parseInt(getValue('ability-' + ab), 10) || 10;
    base[ab] = Math.max(1, Math.min(30, current - (oldBonuses[ab] || 0)));
  });
  state.featureChoices[asiKey] = newChoiceValue;
  if (!newChoiceValue) delete state.featureChoices[asiKey];
  const newBonuses = getASIBonuses();
  abList.forEach(ab => {
    setValue('ability-' + ab, base[ab] + (newBonuses[ab] || 0));
  });
  updateModifiers();
  if (typeof renderSpellsTab === 'function') renderSpellsTab();
}

function findOptionIdByName(options, name) {
  if (!name) return '';
  const n = String(name).trim();
  for (const id of Object.keys(options)) {
    if (id === 'other' || id === '') continue;
    if (options[id].name === n) return id;
  }
  return '';
}

function setRaceClassBackgroundFromData(data) {
  const setOne = (field, options) => {
    const sel = document.getElementById(field);
    const custom = document.getElementById(field + 'Custom');
    if (!sel) return;
    const id = data[field + 'Id'] != null ? data[field + 'Id'] : findOptionIdByName(options, data[field]);
    if (id && options[id]) {
      setValue(field, id);
      if (custom && id === 'other') setValue(field + 'Custom', data[field + 'Custom'] != null ? data[field + 'Custom'] : data[field] || '');
    } else if (data[field]) {
      setValue(field, 'other');
      if (custom) setValue(field + 'Custom', data[field]);
    } else {
      setValue(field, '');
      if (custom) setValue(field + 'Custom', '');
    }
  };
  setOne('race', RACE_OPTIONS);
  setOne('class', CLASS_OPTIONS);
  setOne('background', BACKGROUND_OPTIONS);
}

function loadCharacterIntoForm(data) {
  if (!data) return;
  saveCurrentCharacterSceneToCache();
  setValue('name', data.name);
  setValue('level', data.level);
  setValue('alignment', data.alignment);
  setValue('playerName', data.playerName);
  setValue('experiencePoints', data.experiencePoints);
  setValue('inspiration', data.inspiration);
  setValue('proficiencyBonus', data.proficiencyBonus);
  setRaceClassBackgroundFromData(data);
  setValue('customFeatures', data.customFeatures != null ? data.customFeatures : (data.featuresTraits || ''));
  state.featureChoices = data.featureChoices && typeof data.featureChoices === 'object' ? { ...data.featureChoices } : {};
  state.spellsKnown = Array.isArray(data.spells) ? [...data.spells] : [];
  state.spellSlotsUsed = (data.spellSlotsUsed && typeof data.spellSlotsUsed === 'object') ? JSON.parse(JSON.stringify(data.spellSlotsUsed)) : {};

  try {
    localStorage.setItem(SCENE_KEY, data.scene || 'default');
    localStorage.setItem(SCENE_BG_IMAGE_KEY, data.sceneBgImage || '');
  } catch (e) {}
  setScene(data.scene || 'default');

  updateSubraceVisibility();
  setValue('subrace', data.subraceId || '');

  const abilities = data.abilities || {};
  const asiBonus = typeof getASIBonuses === 'function' ? getASIBonuses() : {};
  ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ab => {
    const base = abilities[ab] ?? 10;
    setValue('ability-' + ab, base + (asiBonus[ab] || 0));
  });

  const savingThrows = data.savingThrows || {};
  ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ab => {
    setValue('save-' + ab, savingThrows[ab]);
  });

  const skills = data.skills || {};
  Object.keys(SKILL_ABILITY_MAP).forEach(skill => {
    setValue('skill-' + skill, skills[skill]);
  });

  setValue('armorClass', data.armorClass ?? 10);
  setValue('initiative', data.initiative ?? 0);
  setValue('speed', data.speed ?? 30);
  setValue('hitPointMax', data.hitPointMax ?? 10);
  setValue('hitPointCurrent', data.hitPointCurrent ?? 10);
  setValue('hitPointTemp', data.hitPointTemp ?? 0);
  setValue('hitDice', data.hitDice ?? '1d8');
  setValue('hitDiceTotal', data.hitDiceTotal ?? '1');
  setValue('deathSuccesses', data.deathSaves?.successes ?? 0);
  setValue('deathFailures', data.deathSaves?.failures ?? 0);
  setValue('attacks', data.attacks ?? '');
  setValue('actions-notepad', data.actionsNotepad ?? '');
  setValue('equipment', data.equipment ?? '');
  setValue('notesOrganizations', data.notesOrganizations ?? '');
  setValue('notesAllies', data.notesAllies ?? '');
  setValue('notesEnemies', data.notesEnemies ?? '');
  setValue('notesBackstory', data.notesBackstory ?? '');
  setValue('notesOther', data.notesOther ?? data.notes ?? '');
  setValue('bgGender', data.bgGender ?? '');
  setValue('bgEyes', data.bgEyes ?? '');
  setValue('bgSize', data.bgSize ?? '');
  setValue('bgHeight', data.bgHeight ?? '');
  setValue('bgFaith', data.bgFaith ?? '');
  setValue('bgHair', data.bgHair ?? '');
  setValue('bgSkin', data.bgSkin ?? '');
  setValue('bgAge', data.bgAge ?? '');
  setValue('bgWeight', data.bgWeight ?? '');
  setValue('bgPersonalityTraits', data.bgPersonalityTraits ?? '');
  setValue('bgIdeals', data.bgIdeals ?? '');
  setValue('bgBonds', data.bgBonds ?? '');
  setValue('bgFlaws', data.bgFlaws ?? '');
  setValue('toolProficiencies', data.toolProficiencies ?? '');
  setValue('languages', data.languages ?? '');
  setValue('portrait', data.portrait ?? '');
  const portraitUrlInput = document.getElementById('portrait-url');
  if (portraitUrlInput) portraitUrlInput.value = (data.portrait && (data.portrait.startsWith('http://') || data.portrait.startsWith('https://')) ? data.portrait : '');
  updatePortraitDisplay();
  toggleCustomInputs();
  updateAutoFeatures();

  state.characterId = data.id || null;
  state.character = data;
  const cache = getCharacterScenesCache();
  const cached = data.id && cache[data.id];
  if (cached) {
    try {
      localStorage.setItem(SCENE_KEY, cached.scene || 'default');
      localStorage.setItem(SCENE_BG_IMAGE_KEY, cached.sceneBgImage || '');
    } catch (e) {}
    setScene(cached.scene || 'default');
  }
  updateModifiers();
  updateBackgroundDisplay();
}

function updateBackgroundDisplay() {
  const el = document.getElementById('backgroundDisplay');
  if (!el) return;
  const bgId = getValue('background') || '';
  const bgCustom = getValue('backgroundCustom') || '';
  const bgData = bgId && BACKGROUND_OPTIONS[bgId] ? BACKGROUND_OPTIONS[bgId] : null;
  const name = bgData ? bgData.name : (bgCustom || '—');
  const features = bgData && bgData.features ? bgData.features : '';
  el.innerHTML = '<div class="bg-name">' + escapeHtml(name) + '</div>' +
    (features ? '<div class="bg-features">' + escapeHtml(features) + '</div>' : '');
}

function updateModifiers() {
  const prof = parseInt(getValue('proficiencyBonus'), 10) || 2;
  ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ab => {
    const score = parseInt(getValue('ability-' + ab), 10) || 10;
    const mod = abilityModifier(score);
    const modEl = document.getElementById('mod-' + ab);
    if (modEl) modEl.textContent = formatModifier(mod);

    const saveChecked = document.getElementById('save-' + ab)?.checked;
    const saveMod = saveChecked ? mod + prof : mod;
    const saveModEl = document.getElementById('save-mod-' + ab);
    if (saveModEl) saveModEl.textContent = formatModifier(saveMod);
  });

  Object.keys(SKILL_ABILITY_MAP).forEach(skill => {
    const ability = SKILL_ABILITY_MAP[skill];
    const score = parseInt(getValue('ability-' + ability), 10) || 10;
    const mod = abilityModifier(score);
    const proficient = document.getElementById('skill-' + skill)?.checked;
    const total = proficient ? mod + prof : mod;
    const el = document.getElementById('skill-mod-' + skill);
    if (el) el.textContent = formatModifier(total);
  });

  const profEl = document.getElementById('prof-display');
  if (profEl) profEl.textContent = formatModifier(prof);

  const wisMod = abilityModifier(parseInt(getValue('ability-wis'), 10) || 10);
  const intMod = abilityModifier(parseInt(getValue('ability-int'), 10) || 10);
  const perProf = document.getElementById('skill-perception')?.checked;
  const invProf = document.getElementById('skill-investigation')?.checked;
  const insProf = document.getElementById('skill-insight')?.checked;
  const pp = document.getElementById('passive-perception');
  const pi = document.getElementById('passive-investigation');
  const pins = document.getElementById('passive-insight');
  if (pp) pp.textContent = 10 + wisMod + (perProf ? prof : 0);
  if (pi) pi.textContent = 10 + intMod + (invProf ? prof : 0);
  if (pins) pins.textContent = 10 + wisMod + (insProf ? prof : 0);

  updateBanner();
}

function updatePortraitDisplay() {
  const val = getValue('portrait') || '';
  const bannerImg = document.getElementById('banner-portrait');
  const bannerPlaceholder = document.getElementById('banner-portrait-placeholder');
  const previewImg = document.getElementById('portrait-preview');
  const previewPlaceholder = document.getElementById('portrait-preview-placeholder');
  const setImg = (imgEl, placeholderEl, src) => {
    if (!imgEl || !placeholderEl) return;
    if (src && (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://'))) {
      imgEl.src = src;
      imgEl.classList.remove('hidden');
      placeholderEl.classList.add('hidden');
    } else {
      imgEl.src = '';
      imgEl.classList.add('hidden');
      placeholderEl.classList.remove('hidden');
    }
  };
  setImg(bannerImg, bannerPlaceholder, val);
  setImg(previewImg, previewPlaceholder, val);
  const wrap = document.getElementById('banner-portrait-wrap');
  if (wrap) wrap.classList.toggle('char-portrait-wrap--clickable', !!val);
}

function openPortraitLightbox() {
  const val = getValue('portrait') || '';
  if (!val || (!val.startsWith('data:') && !val.startsWith('http://') && !val.startsWith('https://'))) return;
  const img = document.getElementById('portrait-lightbox-img');
  const lb = document.getElementById('portrait-lightbox');
  if (img && lb) {
    img.src = val;
    lb.classList.remove('hidden');
    lb.setAttribute('aria-hidden', 'false');
  }
}

function closePortraitLightbox() {
  const lb = document.getElementById('portrait-lightbox');
  if (lb) {
    lb.classList.add('hidden');
    lb.setAttribute('aria-hidden', 'true');
  }
}

function updateBanner() {
  const name = getValue('name') || 'Character Sheet';
  const race = getDisplayName('race', 'raceCustom') || '';
  const cls = getDisplayName('class', 'classCustom') || '';
  const lvl = parseInt(getValue('level'), 10) || 1;
  const xp = parseInt(getValue('experiencePoints'), 10) || 0;
  const elName = document.getElementById('banner-name');
  const elSub = document.getElementById('banner-subtitle');
  const elLvl = document.getElementById('banner-level');
  const elBar = document.getElementById('xp-bar');
  if (elName) elName.textContent = name.trim() || 'Character Sheet';
  if (elSub) elSub.textContent = [race, cls, lvl].filter(Boolean).join(' ') || '—';
  if (elLvl) elLvl.textContent = lvl;
  if (elBar) {
    const xpThresholds = [0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
    const curr = xpThresholds[Math.min(lvl - 1, 19)] ?? 0;
    const next = lvl < 20 ? (xpThresholds[lvl] ?? 355000) : curr;
    const pct = next > curr ? Math.min(100, ((xp - curr) / (next - curr)) * 100) : 100;
    elBar.style.width = Math.max(0, pct) + '%';
  }
  updatePortraitDisplay();
}

function roll(diceNotation) {
  const match = diceNotation.toLowerCase().match(/^(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?$/);
  if (!match) return null;
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  let modifier = 0;
  if (match[3] && match[4]) modifier = match[3] === '-' ? -parseInt(match[4], 10) : parseInt(match[4], 10);
  let sum = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const r = 1 + Math.floor(Math.random() * sides);
    rolls.push(r);
    sum += r;
  }
  const total = sum + modifier;
  return { rolls, modifier, total, notation: diceNotation };
}

/** Pool of dice for mixed roll: array of sides, e.g. [4, 6, 6, 8] => 1d4 + 2d6 + 1d8 */
const mixedDicePool = [];

function mixedPoolNotation(pool) {
  if (!pool.length) return '';
  const counts = {};
  pool.forEach((sides) => { counts[sides] = (counts[sides] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => Number(a[0]) - Number(b[0])).map(([s, n]) => `${n}d${s}`).join(' + ');
}

function rollMixedPool(modifier = 0) {
  if (mixedDicePool.length === 0) return null;
  const rolls = [];
  let total = 0;
  mixedDicePool.forEach((sides) => {
    const r = 1 + Math.floor(Math.random() * sides);
    rolls.push(r);
    total += r;
  });
  total += modifier;
  const notation = mixedPoolNotation(mixedDicePool) + (modifier !== 0 ? (modifier >= 0 ? ' + ' : ' ') + modifier : '');
  return { rolls, modifier, total, notation };
}

function renderMixedPool() {
  const el = document.getElementById('mixed-pool-list');
  if (!el) return;
  if (mixedDicePool.length === 0) {
    el.innerHTML = '<span class="mixed-pool-empty">No dice in pool. Add dice below.</span>';
    return;
  }
  const notation = mixedPoolNotation(mixedDicePool);
  const bySides = {};
  mixedDicePool.forEach((sides, index) => {
    if (!bySides[sides]) bySides[sides] = [];
    bySides[sides].push(index);
  });
  el.innerHTML = Object.entries(bySides).sort((a, b) => Number(a[0]) - Number(b[0])).map(([sides, indices]) =>
    indices.map((i) => `<button type="button" class="mixed-pool-chip" data-index="${i}" title="Remove this die">d${sides} ×</button>`).join('')
  ).join('');
  el.querySelectorAll('.mixed-pool-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      mixedDicePool.splice(idx, 1);
      renderMixedPool();
    });
  });
}

const ROLL_HISTORY_MAX = 10;
const rollHistory = [];

function addToRollHistory(entry) {
  rollHistory.unshift(entry);
  if (rollHistory.length > ROLL_HISTORY_MAX) rollHistory.length = ROLL_HISTORY_MAX;
  renderRollHistory();
}

function renderRollHistory() {
  const list = document.getElementById('roll-history-list');
  if (!list) return;
  const parts = (entry) => {
    const modStr = entry.modifier !== 0 ? (entry.modifier > 0 ? ' + ' : ' ') + entry.modifier : '';
    return `${entry.notation} → [${entry.rolls.join(' + ')}]${modStr} = ${entry.total}`;
  };
  list.innerHTML = rollHistory.length === 0
    ? '<li class="roll-history-empty">No rolls yet</li>'
    : rollHistory.map((e) => `<li><span class="roll-history-label">${e.label}</span> <span class="roll-history-detail">${parts(e)}</span></li>`).join('');
}

var rollToastTimeout = null;

function showRollToast(label, total) {
  let container = document.getElementById('roll-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'roll-toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  if (rollToastTimeout) {
    clearTimeout(rollToastTimeout);
    rollToastTimeout = null;
  }
  const toast = document.createElement('div');
  toast.className = 'roll-toast';
  toast.innerHTML = '<span class="roll-toast-label">' + escapeHtml(label || 'Roll') + '</span><span class="roll-toast-total">' + escapeHtml(String(total)) + '</span>';
  container.innerHTML = '';
  container.appendChild(toast);
  container.classList.remove('roll-toast-hidden');
  rollToastTimeout = setTimeout(() => {
    container.classList.add('roll-toast-hidden');
    rollToastTimeout = setTimeout(() => {
      container.innerHTML = '';
      container.classList.remove('roll-toast-hidden');
      rollToastTimeout = null;
    }, 400);
  }, 5000);
}

function showDiceResult(result, label) {
  const el = document.getElementById('dice-result');
  if (!el) return;
  addToRollHistory({
    label: label || 'Roll',
    notation: result.notation,
    total: result.total,
    rolls: result.rolls,
    modifier: result.modifier
  });
  const parts = result.rolls.join(' + ');
  const modStr = result.modifier !== 0 ? (result.modifier > 0 ? ' + ' : ' ') + result.modifier : '';
  el.innerHTML = `
    <strong>${label || 'Roll'}: ${result.total}</strong>
    <div class="roll-detail">${result.notation} → [${parts}]${modStr} = ${result.total}</div>
  `;
  showRollToast(label || 'Roll', result.total);
}

function rollAbility(ability) {
  const score = parseInt(getValue('ability-' + ability), 10) || 10;
  const mod = abilityModifier(score);
  const result = roll('1d20' + (mod !== 0 ? (mod >= 0 ? ' + ' : ' ') + mod : ''));
  if (result) showDiceResult(result, ability.toUpperCase() + ' check');
}

function rollSkill(skill, ability) {
  const score = parseInt(getValue('ability-' + ability), 10) || 10;
  const mod = abilityModifier(score);
  const prof = parseInt(getValue('proficiencyBonus'), 10) || 2;
  const proficient = document.getElementById('skill-' + skill)?.checked;
  const totalMod = mod + (proficient ? prof : 0);
  const modStr = totalMod !== 0 ? (totalMod >= 0 ? ' + ' : ' ') + totalMod : '';
  const result = roll('1d20' + modStr);
  if (result) showDiceResult(result, skill.replace(/([A-Z])/g, ' $1').trim() + ' check');
}

document.querySelectorAll('.ability-score').forEach(input => {
  input.addEventListener('input', () => {
    updateModifiers();
    renderSpellsTab();
  });
});
document.querySelectorAll('[id^="save-"]').forEach(cb => {
  if (cb.type === 'checkbox') cb.addEventListener('change', updateModifiers);
});
document.querySelectorAll('[id^="skill-"]').forEach(el => {
  if (el.type === 'checkbox') el.addEventListener('change', updateModifiers);
});
document.getElementById('proficiencyBonus')?.addEventListener('input', updateModifiers);
document.getElementById('level')?.addEventListener('input', updateAutoFeatures);
document.getElementById('level')?.addEventListener('change', updateAutoFeatures);

document.querySelectorAll('.roll-btn').forEach(btn => {
  btn.addEventListener('click', () => rollAbility(btn.dataset.ability));
});
document.querySelectorAll('.skill-roll').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    rollSkill(btn.dataset.skill, btn.dataset.ability);
  });
});

document.getElementById('btn-roll-dice')?.addEventListener('click', () => {
  const count = parseInt(document.getElementById('dice-count').value, 10) || 1;
  const type = document.getElementById('dice-type').value;
  const mod = parseInt(document.getElementById('dice-modifier').value, 10) || 0;
  const notation = mod !== 0 ? `${count}d${type} ${mod >= 0 ? '+' : ''}${mod}` : `${count}d${type}`;
  const result = roll(notation);
  if (result) showDiceResult(result, 'Roll');
});

document.querySelectorAll('.quick-roll').forEach(btn => {
  btn.addEventListener('click', () => {
    const result = roll(btn.dataset.dice);
    if (result) showDiceResult(result, btn.dataset.dice);
  });
});

document.querySelectorAll('.mixed-add-die').forEach(btn => {
  btn.addEventListener('click', () => {
    mixedDicePool.push(parseInt(btn.dataset.sides, 10));
    renderMixedPool();
  });
});
document.getElementById('btn-clear-mixed-pool')?.addEventListener('click', () => {
  mixedDicePool.length = 0;
  renderMixedPool();
});
document.getElementById('btn-roll-mixed')?.addEventListener('click', () => {
  const mod = parseInt(document.getElementById('mixed-modifier')?.value, 10) || 0;
  const result = rollMixedPool(mod);
  if (result) showDiceResult(result, 'Mixed');
});
renderMixedPool();

document.getElementById('btn-clear-history')?.addEventListener('click', () => {
  rollHistory.length = 0;
  renderRollHistory();
});

(function initRollHistoryToggle() {
  const container = document.getElementById('roll-history');
  const toggleBtn = document.getElementById('btn-toggle-history');
  const title = container?.querySelector('.roll-history-title');
  const key = 'dice-proj-roll-history-collapsed';
  const collapsed = () => localStorage.getItem(key) === '1';

  function setCollapsed(c) {
    if (!container) return;
    container.classList.toggle('roll-history--collapsed', c);
    toggleBtn?.setAttribute('aria-expanded', c ? 'false' : 'true');
    try { localStorage.setItem(key, c ? '1' : '0'); } catch (e) {}
  }

  toggleBtn?.addEventListener('click', () => setCollapsed(!container.classList.contains('roll-history--collapsed')));
  title?.addEventListener('click', () => setCollapsed(!container.classList.contains('roll-history--collapsed')));
  setCollapsed(collapsed());
})();

(function initMixedDiceToggle() {
  const container = document.getElementById('mixed-dice');
  const toggleBtn = document.getElementById('btn-toggle-mixed-dice');
  const title = container?.querySelector('.mixed-dice-title');
  const key = 'dice-proj-mixed-dice-collapsed';
  const collapsed = () => localStorage.getItem(key) === '1';

  function setCollapsed(c) {
    if (!container) return;
    container.classList.toggle('mixed-dice--collapsed', c);
    toggleBtn?.setAttribute('aria-expanded', c ? 'false' : 'true');
    try { localStorage.setItem(key, c ? '1' : '0'); } catch (e) {}
  }

  toggleBtn?.addEventListener('click', () => setCollapsed(!container.classList.contains('mixed-dice--collapsed')));
  title?.addEventListener('click', () => setCollapsed(!container.classList.contains('mixed-dice--collapsed')));
  setCollapsed(collapsed());
})();

document.getElementById('btn-manage')?.addEventListener('click', () => {
  const deleteBtn = document.getElementById('btn-delete-character');
  if (deleteBtn) deleteBtn.style.display = state.characterId ? '' : 'none';
  document.getElementById('manage-modal').classList.remove('hidden');
});
document.getElementById('btn-close-manage')?.addEventListener('click', () => {
  document.getElementById('manage-modal').classList.add('hidden');
});
document.getElementById('manage-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'manage-modal') e.target.classList.add('hidden');
});

document.getElementById('portrait-file')?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    setValue('portrait', reader.result);
    updatePortraitDisplay();
    e.target.value = '';
  };
  reader.readAsDataURL(file);
});
document.getElementById('portrait-url')?.addEventListener('input', () => {
  const url = document.getElementById('portrait-url')?.value?.trim() || '';
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    setValue('portrait', url);
    updatePortraitDisplay();
  }
});
document.getElementById('portrait-url')?.addEventListener('blur', () => {
  const url = document.getElementById('portrait-url')?.value?.trim() || '';
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    setValue('portrait', url);
    updatePortraitDisplay();
  }
});
document.getElementById('portrait-clear')?.addEventListener('click', () => {
  setValue('portrait', '');
  document.getElementById('portrait-url').value = '';
  document.getElementById('portrait-file').value = '';
  updatePortraitDisplay();
});

document.getElementById('banner-portrait-wrap')?.addEventListener('click', () => {
  if (getValue('portrait')) openPortraitLightbox();
});
document.getElementById('portrait-lightbox')?.addEventListener('click', (e) => {
  if (e.target.id === 'portrait-lightbox') closePortraitLightbox();
});
document.getElementById('portrait-lightbox-close')?.addEventListener('click', (e) => {
  e.stopPropagation();
  closePortraitLightbox();
});

/* ========== Add to inventory (search equipment & magic items) ========== */
const inventoryAddState = { equipment: null, magicitems: null, loading: false };

function getMergedInventoryItems() {
  const eq = inventoryAddState.equipment || [];
  const mag = inventoryAddState.magicitems || [];
  const list = [];
  eq.forEach(i => {
    const type = (i.type || '').toLowerCase();
    let category = 'other';
    if (type.includes('weapon')) {
      if (type.includes('martial')) category = 'weapon_martial';
      else if (type.includes('modern')) category = 'weapon_modern';
      else if (type.includes('futuristic')) category = 'weapon_futuristic';
      else category = 'weapon_simple';
    } else if (type.includes('armor')) category = 'armor';
    list.push({ name: i.name, type: i.type, desc: i.desc || '', category, source: 'equipment' });
  });
  mag.forEach(i => {
    list.push({
      name: i.name,
      type: i.type || 'Magic Item',
      desc: (i.rarity ? i.rarity + '. ' : '') + (i.desc || ''),
      category: 'magic',
      source: 'magic'
    });
  });
  return list;
}

function filterInventoryItems(list, query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return list;
  const terms = q.split(/\s+/).filter(Boolean);
  return list.filter(item => {
    const name = (item.name || '').toLowerCase();
    const type = (item.type || '').toLowerCase();
    const desc = (item.desc || '').toLowerCase();
    const cat = item.category || '';
    const searchable = [name, type, desc, cat].join(' ');
    const matchesTerm = term => {
      if (term === 'weapon') return cat.startsWith('weapon') || type.includes('weapon');
      if (term === 'martial') return cat === 'weapon_martial' || type.includes('martial');
      if (term === 'simple') return cat === 'weapon_simple' || type.includes('simple');
      if (term === 'armor') return cat === 'armor' || type.includes('armor');
      if (term === 'magic') return cat === 'magic' || type.includes('magic');
      if (term === 'modern' || term === 'firearm') return cat === 'weapon_modern' || type.includes('modern');
      if (term === 'futuristic' || term === 'blaster' || term === 'laser' || term === 'sci-fi') return cat === 'weapon_futuristic' || type.includes('futuristic') || name.includes(term);
      return searchable.includes(term);
    };
    return terms.every(t => matchesTerm(t));
  });
}

function renderInventoryAddList(items) {
  const listEl = document.getElementById('inventory-add-list');
  if (!listEl) return;
  if (items.length === 0) {
    listEl.innerHTML = '<div class="inventory-add-empty">No items match your search.</div>';
    return;
  }
  listEl.innerHTML = items.map(item => {
    const typeLabel = item.type ? escapeHtml(item.type) : '';
    return '<button type="button" class="inventory-add-item" data-name="' + escapeHtml(item.name) + '" data-type="' + escapeHtml(typeLabel) + '" title="Click to add">' +
      '<span class="inventory-add-item-name">' + escapeHtml(item.name) + '</span>' +
      (typeLabel ? '<span class="inventory-add-item-type">' + typeLabel + '</span>' : '') +
      '</button>';
  }).join('');
  listEl.querySelectorAll('.inventory-add-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name || '';
      const type = btn.dataset.type || '';
      const equipmentEl = document.getElementById('equipment');
      if (!equipmentEl || !name) return;
      const current = equipmentEl.value.trim();
      const line = type ? name + ' (' + type + ')' : name;
      equipmentEl.value = current ? current + '\n' + line : line;
    });
  });
}

async function openInventoryAddModal() {
  const modal = document.getElementById('inventory-add-modal');
  const listEl = document.getElementById('inventory-add-list');
  const searchEl = document.getElementById('inventory-add-search');
  if (!modal || !listEl) return;
  modal.classList.remove('hidden');
  if (searchEl) searchEl.value = '';
  if (inventoryAddState.equipment === null || inventoryAddState.magicitems === null) {
    inventoryAddState.loading = true;
    listEl.innerHTML = '<div class="inventory-add-loading">Loading equipment and magic items…</div>';
    try {
      const [eqRes, magRes] = await Promise.all([
        fetch(API_BASE + '/api/equipment'),
        fetch(API_BASE + '/api/magicitems')
      ]);
      inventoryAddState.equipment = eqRes.ok ? await eqRes.json() : [];
      inventoryAddState.magicitems = magRes.ok ? await magRes.json() : [];
    } catch (err) {
      inventoryAddState.equipment = [];
      inventoryAddState.magicitems = [];
      listEl.innerHTML = '<div class="inventory-add-loading ref-error">Could not load items.</div>';
    }
    inventoryAddState.loading = false;
  }
  const merged = getMergedInventoryItems();
  const query = searchEl ? searchEl.value : '';
  renderInventoryAddList(filterInventoryItems(merged, query));
}

function closeInventoryAddModal() {
  document.getElementById('inventory-add-modal')?.classList.add('hidden');
}

document.getElementById('btn-add-inventory-items')?.addEventListener('click', openInventoryAddModal);
document.getElementById('btn-close-inventory-add')?.addEventListener('click', closeInventoryAddModal);
document.getElementById('inventory-add-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'inventory-add-modal') closeInventoryAddModal();
});
document.getElementById('inventory-add-search')?.addEventListener('input', () => {
  const query = document.getElementById('inventory-add-search')?.value || '';
  const merged = getMergedInventoryItems();
  renderInventoryAddList(filterInventoryItems(merged, query));
});

function toggleTheme() {
  setTheme(getTheme() === 'light' ? 'dark' : 'light');
}
document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleTheme);
document.getElementById('landing-theme-toggle')?.addEventListener('click', toggleTheme);
document.getElementById('btn-manage-change-scene')?.addEventListener('click', () => {
  document.getElementById('manage-modal').classList.add('hidden');
  openSceneModal();
});
document.getElementById('btn-close-scene')?.addEventListener('click', closeSceneModal);
document.getElementById('scene-modal')?.addEventListener('click', (e) => { if (e.target.id === 'scene-modal') closeSceneModal(); });
document.getElementById('scene-bg-file')?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      localStorage.setItem(SCENE_BG_IMAGE_KEY, reader.result);
      setScene('custom');
    } catch (err) {
      if (err.name === 'QuotaExceededError') alert('Image too large to store. Try a smaller image.');
    }
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});
document.getElementById('scene-custom-remove')?.addEventListener('click', () => {
  try { localStorage.removeItem(SCENE_BG_IMAGE_KEY); } catch (e) {}
  setScene('default');
});
document.getElementById('scene-custom-use-url')?.addEventListener('click', () => {
  const input = document.getElementById('scene-bg-url');
  const url = (input?.value || '').trim();
  if (!url) return;
  const lower = url.toLowerCase();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    alert('Please enter a valid image URL starting with http:// or https://');
    return;
  }
  try {
    localStorage.setItem(SCENE_BG_IMAGE_KEY, url);
    setScene('custom');
    if (input) input.value = '';
  } catch (e) {
    alert('Could not save URL.');
  }
});
document.getElementById('scene-bg-url')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('scene-custom-use-url')?.click();
});

function findInNotepad() {
  const notepadEl = document.getElementById('actions-notepad');
  const searchInput = document.getElementById('notepad-search');
  if (!notepadEl || !searchInput) return;
  const keyword = searchInput.value.trim();
  if (!keyword) return;
  const text = notepadEl.value;
  const lower = text.toLowerCase();
  const kw = keyword.toLowerCase();
  let start = notepadEl.selectionEnd ?? 0;
  let idx = lower.indexOf(kw, start);
  if (idx === -1) idx = lower.indexOf(kw, 0);
  if (idx === -1) {
    alert('No matches found.');
    return;
  }
  notepadEl.focus();
  notepadEl.setSelectionRange(idx, idx + keyword.length);
  notepadEl.scrollTop = Math.max(0, notepadEl.scrollHeight * (idx / text.length) - notepadEl.clientHeight / 2);
}

document.getElementById('notepad-find-btn')?.addEventListener('click', findInNotepad);
document.getElementById('notepad-search')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); findInNotepad(); }
});
document.getElementById('btn-login')?.addEventListener('click', () => openAuthModal('login'));
document.getElementById('btn-register')?.addEventListener('click', () => openAuthModal('register'));
document.getElementById('btn-start-now')?.addEventListener('click', () => {
  showSheetWithoutAuth = true;
  resetToBlankCharacter();
  updateLandingAndAppVisibility();
});
document.getElementById('landing-btn-login')?.addEventListener('click', () => openAuthModal('login'));
document.getElementById('landing-btn-register')?.addEventListener('click', () => openAuthModal('register'));
document.getElementById('btn-settings')?.addEventListener('click', () => {
  document.getElementById('settings-modal').classList.remove('hidden');
  document.getElementById('settings-modal').setAttribute('aria-hidden', 'false');
});
document.getElementById('settings-close')?.addEventListener('click', () => {
  document.getElementById('settings-modal').classList.add('hidden');
  document.getElementById('settings-modal').setAttribute('aria-hidden', 'true');
});
document.getElementById('settings-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'settings-modal') {
    e.target.classList.add('hidden');
    e.target.setAttribute('aria-hidden', 'true');
  }
});
document.getElementById('settings-btn-logout')?.addEventListener('click', async () => {
  document.getElementById('settings-modal').classList.add('hidden');
  await fetch(API_BASE + '/api/auth/logout', { method: 'POST', ...API_CREDENTIALS });
  showSheetWithoutAuth = false;
  resetToBlankCharacter();
  checkAuth();
});
document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('auth-username-input').value.trim();
  const password = document.getElementById('auth-password-input').value;
  const email = document.getElementById('auth-email-input')?.value?.trim() || '';
  const errEl = document.getElementById('auth-error');
  errEl.classList.add('hidden');
  const url = authModalMode === 'register' ? '/api/auth/register' : '/api/auth/login';
  const body = authModalMode === 'register' ? { username, password, email } : { username, password };
  try {
    const res = await fetch(API_BASE + url, {
      method: 'POST',
      ...API_CREDENTIALS,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      errEl.textContent = data.error || 'Request failed';
      errEl.classList.remove('hidden');
      return;
    }
    document.getElementById('auth-modal').classList.add('hidden');
    checkAuth();
  } catch (err) {
    errEl.textContent = 'Network error';
    errEl.classList.remove('hidden');
  }
});
document.getElementById('auth-switch-mode')?.addEventListener('click', () => openAuthModal(authModalMode === 'login' ? 'register' : 'login'));
document.getElementById('auth-cancel')?.addEventListener('click', () => document.getElementById('auth-modal').classList.add('hidden'));
document.getElementById('auth-modal')?.addEventListener('click', (e) => { if (e.target.id === 'auth-modal') e.target.classList.add('hidden'); });

document.getElementById('auth-password-toggle')?.addEventListener('click', () => {
  const input = document.getElementById('auth-password-input');
  const showSpan = document.querySelector('#auth-password-toggle .password-toggle-show');
  const hideSpan = document.querySelector('#auth-password-toggle .password-toggle-hide');
  const btn = document.getElementById('auth-password-toggle');
  if (!input || !btn) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (showSpan) showSpan.classList.add('hidden');
    if (hideSpan) hideSpan.classList.remove('hidden');
    btn.setAttribute('aria-label', 'Hide password');
    btn.setAttribute('title', 'Hide password');
  } else {
    input.type = 'password';
    if (showSpan) showSpan.classList.remove('hidden');
    if (hideSpan) hideSpan.classList.add('hidden');
    btn.setAttribute('aria-label', 'Show password');
    btn.setAttribute('title', 'Show password');
  }
});

document.getElementById('btn-delete-character')?.addEventListener('click', async () => {
  if (!state.characterId) return;
  if (!confirm('Delete this character? This cannot be undone.')) return;
  const statusEl = document.getElementById('save-status');
  try {
    const res = await fetch(API_BASE + '/api/characters/' + encodeURIComponent(state.characterId), { method: 'DELETE', ...API_CREDENTIALS });
    if (!res.ok) throw new Error('Delete failed');
    state.characterId = null;
    loadCharacterIntoForm({
      name: '',
      level: 1,
      proficiencyBonus: 2,
      armorClass: 10,
      speed: 30,
      hitPointMax: 10,
      hitPointCurrent: 10,
      hitPointTemp: 0,
      hitDice: '1d8',
      hitDiceTotal: '1',
      abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      savingThrows: {},
      skills: {},
      deathSaves: { successes: 0, failures: 0 }
    });
    setValue('customFeatures', '');
    state.featureChoices = {};
    statusEl.textContent = 'Character deleted.';
    statusEl.className = 'save-status saved';
    document.getElementById('manage-modal').classList.add('hidden');
  } catch (err) {
    statusEl.textContent = 'Could not delete character.';
    statusEl.className = 'save-status error';
  }
});
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const tabId = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    const pane = document.getElementById('tab-' + tabId);
    if (pane) { pane.classList.remove('hidden'); }
    if (tabId === 'background') updateBackgroundDisplay();
    if (tabId === 'spells') {
      await loadSpellsForSheet();
      renderSpellsTab();
    }
  });
});
document.getElementById('spells-search')?.addEventListener('input', () => renderSpellsTab());
document.getElementById('spells-search')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
document.getElementById('spells-available-toggle')?.addEventListener('click', () => {
  const body = document.getElementById('spells-available-body');
  const btn = document.getElementById('spells-available-toggle');
  const icon = btn?.querySelector('.spells-collapse-icon');
  if (!body || !btn) return;
  const isOpen = !body.classList.contains('spells-collapse-closed');
  body.classList.toggle('spells-collapse-closed', isOpen);
  btn.setAttribute('aria-expanded', !isOpen);
  if (icon) icon.textContent = isOpen ? '▶' : '▼';
});
document.querySelectorAll('.bg-sub-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.bgFilter;
    document.querySelectorAll('.bg-sub-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.bg-section').forEach(section => {
      const sectionName = section.dataset.bgSection;
      const show = filter === 'all' || sectionName === filter;
      section.classList.toggle('hidden-by-filter', !show);
    });
  });
});
['name', 'level', 'race', 'class', 'experiencePoints'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => { updateBanner(); if (id === 'class' || id === 'level' || id === 'race') renderSpellsTab(); });
  if (el) el.addEventListener('change', () => { updateBanner(); if (id === 'class' || id === 'level' || id === 'race') renderSpellsTab(); });
});

function resetToBlankCharacter() {
  state.characterId = null;
  state.spellsKnown = [];
  state.spellSlotsUsed = {};
  loadCharacterIntoForm({
    name: '',
    level: 1,
    proficiencyBonus: 2,
    armorClass: 10,
    speed: 30,
    hitPointMax: 10,
    hitPointCurrent: 10,
    hitPointTemp: 0,
    hitDice: '1d8',
    hitDiceTotal: '1',
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    savingThrows: {},
    skills: {},
    deathSaves: { successes: 0, failures: 0 }
  });
  setValue('customFeatures', '');
  state.featureChoices = {};
  const statusEl = document.getElementById('save-status');
  if (statusEl) { statusEl.textContent = ''; statusEl.className = 'save-status'; }
}

document.getElementById('btn-new')?.addEventListener('click', () => {
  resetToBlankCharacter();
});

/* ========== Character Builder (D&D Beyond style) ========== */
const builderState = { step: 1, classId: '', raceId: '', subraceId: '', backgroundId: '', skillChoices: [] };

function openBuilder() {
  builderState.step = 1;
  builderState.classId = '';
  builderState.raceId = '';
  builderState.subraceId = '';
  builderState.backgroundId = '';
  builderState.skillChoices = [];
  document.getElementById('builder-name').value = '';
  document.getElementById('builder-level').value = 1;
  document.querySelectorAll('.builder-option').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('input[name="abilityMethod"]').forEach(r => { r.checked = r.value === 'standard'; });
  ['str','dex','con','int','wis','cha'].forEach(ab => { document.getElementById('builder-' + ab).value = 10; });
  const eqEl = document.getElementById('builder-equipment-extra');
  if (eqEl) eqEl.value = '';
  buildBuilderOptionGrids();
  goToBuilderStep(1);
  document.getElementById('builder-modal').classList.remove('hidden');
}

function buildBuilderOptionGrids() {
  const classGrid = document.getElementById('builder-class-grid');
  classGrid.innerHTML = '';
  Object.keys(CLASS_OPTIONS).forEach(id => {
    if (id === '' || id === 'other') return;
    const opt = document.createElement('div');
    opt.className = 'builder-option' + (builderState.classId === id ? ' selected' : '');
    opt.textContent = CLASS_OPTIONS[id].name;
    opt.dataset.id = id;
    opt.dataset.type = 'class';
    opt.addEventListener('click', () => selectBuilderOption('class', id));
    classGrid.appendChild(opt);
  });
  const raceGrid = document.getElementById('builder-race-grid');
  raceGrid.innerHTML = '';
  Object.keys(RACE_OPTIONS).forEach(id => {
    if (id === '' || id === 'other') return;
    const opt = document.createElement('div');
    opt.className = 'builder-option' + (builderState.raceId === id ? ' selected' : '');
    opt.textContent = RACE_OPTIONS[id].name;
    opt.dataset.id = id;
    opt.dataset.type = 'race';
    opt.addEventListener('click', () => selectBuilderOption('race', id));
    raceGrid.appendChild(opt);
  });
  updateBuilderSubraceGrid();
  const bgGrid = document.getElementById('builder-background-grid');
  bgGrid.innerHTML = '';
  Object.keys(BACKGROUND_OPTIONS).forEach(id => {
    if (id === '' || id === 'other') return;
    const opt = document.createElement('div');
    opt.className = 'builder-option' + (builderState.backgroundId === id ? ' selected' : '');
    opt.textContent = BACKGROUND_OPTIONS[id].name;
    opt.dataset.id = id;
    opt.dataset.type = 'background';
    opt.addEventListener('click', () => selectBuilderOption('background', id));
    bgGrid.appendChild(opt);
  });
}

function updateBuilderSubraceGrid() {
  const wrap = document.getElementById('builder-subrace-wrap');
  const grid = document.getElementById('builder-subrace-grid');
  if (!wrap || !grid) return;
  const raceData = RACE_OPTIONS[builderState.raceId];
  const hasSubraces = raceData && raceData.subraces && Object.keys(raceData.subraces).length > 0;
  if (hasSubraces) {
    wrap.classList.remove('hidden');
    grid.innerHTML = '';
    Object.keys(raceData.subraces).forEach(subId => {
      const opt = document.createElement('div');
      opt.className = 'builder-option' + (builderState.subraceId === subId ? ' selected' : '');
      opt.textContent = raceData.subraces[subId].name;
      opt.dataset.id = subId;
      opt.dataset.type = 'subrace';
      opt.addEventListener('click', () => {
        builderState.subraceId = subId;
        document.querySelectorAll('.builder-option[data-type="subrace"]').forEach(el => {
          el.classList.toggle('selected', el.dataset.id === subId);
        });
      });
      grid.appendChild(opt);
    });
  } else {
    wrap.classList.add('hidden');
    grid.innerHTML = '';
    builderState.subraceId = '';
  }
}

function selectBuilderOption(type, id) {
  if (type === 'class') builderState.classId = id;
  else if (type === 'race') {
    builderState.raceId = id;
    builderState.subraceId = '';
    updateBuilderSubraceGrid();
  }
  else if (type === 'background') builderState.backgroundId = id;
  document.querySelectorAll('.builder-option[data-type="' + type + '"]').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  if (type === 'class' && builderState.step === 4) applyStandardArrayByClass();
}

function parseEquipmentLines(rawText) {
  const lines = rawText.split(/\n/).map(s => s.trim()).filter(Boolean);
  const result = [];
  const optionRegex = /^\(([abc])\)\s*(.+)$/;
  for (const line of lines) {
    const parts = line.split(/\s+or\s+/).map(s => s.trim());
    const options = [];
    for (const part of parts) {
      const m = part.match(optionRegex);
      if (m) options.push({ letter: m[1], text: m[2].trim() });
      else break;
    }
    if (options.length >= 2) {
      result.push({ type: 'choice', options });
    } else {
      result.push({ type: 'fixed', text: line });
    }
  }
  return result;
}

function populateBuilderEquipment() {
  const classEq = builderState.classId && CLASS_STARTING_EQUIPMENT[builderState.classId];
  const bgEq = builderState.backgroundId && BACKGROUND_BUILDER[builderState.backgroundId]?.equipment;
  const parts = [classEq, bgEq].filter(Boolean);
  const rawText = parts.join('\n\n');
  const listEl = document.getElementById('builder-equipment-list');
  const extraEl = document.getElementById('builder-equipment-extra');
  if (!listEl) return;
  listEl.innerHTML = '';
  if (extraEl) extraEl.value = '';

  const parsed = parseEquipmentLines(rawText);
  parsed.forEach((item, index) => {
    if (item.type === 'choice') {
      const group = document.createElement('div');
      group.className = 'builder-equipment-choice';
      const label = document.createElement('span');
      label.className = 'builder-equipment-choice-label';
      label.textContent = 'Choose one:';
      group.appendChild(label);
      const optsWrap = document.createElement('div');
      optsWrap.className = 'builder-equipment-options';
      const name = 'builder-eq-' + index;
      item.options.forEach((opt, i) => {
        const labelEl = document.createElement('label');
        labelEl.className = 'builder-equipment-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = opt.text;
        radio.dataset.letter = opt.letter;
        if (i === 0) radio.checked = true;
        labelEl.appendChild(radio);
        labelEl.appendChild(document.createTextNode(' (' + opt.letter + ') ' + opt.text));
        optsWrap.appendChild(labelEl);
      });
      group.appendChild(optsWrap);
      listEl.appendChild(group);
    } else {
      const fixed = document.createElement('div');
      fixed.className = 'builder-equipment-fixed';
      fixed.textContent = item.text;
      listEl.appendChild(fixed);
    }
  });
}

function goToBuilderStep(step) {
  builderState.step = step;
  document.querySelectorAll('.builder-step').forEach(el => el.classList.add('hidden'));
  document.getElementById('builder-step-' + step).classList.remove('hidden');
  document.querySelectorAll('.builder-steps .step').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step, 10) === step);
  });
  document.getElementById('btn-builder-back').style.display = step === 1 ? 'none' : '';
  document.getElementById('btn-builder-next').style.display = step === 7 ? 'none' : '';
  document.getElementById('btn-builder-complete').classList.toggle('hidden', step !== 7);
  if (step === 4) {
    updateBuilderAbilityUI();
    applyStandardArrayByClass();
  }
  if (step === 6) populateBuilderEquipment();
  if (step === 7) renderBuilderSummary();
}

function expandPackIfAny(line) {
  if (!line || typeof line !== 'string') return [];
  const trimmed = line.trim();
  const key = trimmed.toLowerCase();
  const contents = typeof PACK_CONTENTS !== 'undefined' && PACK_CONTENTS[key];
  if (contents) return contents.split('\n').map(s => s.trim()).filter(Boolean);
  return [trimmed];
}

function expandPacksInLine(line) {
  if (!line || typeof line !== 'string') return [];
  const trimmed = line.trim();
  const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  const result = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    const contents = typeof PACK_CONTENTS !== 'undefined' && PACK_CONTENTS[key];
    if (contents) result.push(...contents.split('\n').map(s => s.trim()).filter(Boolean));
    else result.push(part);
  }
  return result;
}

function getResolvedEquipmentString() {
  const listEl = document.getElementById('builder-equipment-list');
  const extraEl = document.getElementById('builder-equipment-extra');
  const lines = [];
  if (listEl) {
    for (const child of listEl.children) {
      if (child.classList.contains('builder-equipment-choice')) {
        const checked = child.querySelector('input[type="radio"]:checked');
        if (checked && checked.value) lines.push(...expandPackIfAny(checked.value));
      } else if (child.classList.contains('builder-equipment-fixed')) {
        const text = child.textContent.trim();
        if (text) lines.push(...expandPacksInLine(text));
      }
    }
  }
  const extra = extraEl ? extraEl.value.trim().split(/\n/).map(s => s.trim()).filter(Boolean) : [];
  return lines.concat(extra).join('\n');
}

function applyStandardArrayByClass() {
  const sugg = STANDARD_ARRAY_BY_CLASS[builderState.classId];
  if (sugg && document.querySelector('input[name="abilityMethod"]:checked')?.value === 'standard') {
    ['str','dex','con','int','wis','cha'].forEach(ab => {
      document.getElementById('builder-' + ab).value = sugg[ab] ?? 10;
    });
  }
}

function updateBuilderAbilityUI() {
  const method = document.querySelector('input[name="abilityMethod"]:checked')?.value;
  const sugg = STANDARD_ARRAY_BY_CLASS[builderState.classId];
  const hint = document.getElementById('ability-suggest-hint');
  hint.textContent = sugg ? 'Suggested for ' + (CLASS_OPTIONS[builderState.classId]?.name || '') + ' shown.' : '';
  document.getElementById('pointbuy-status').classList.toggle('hidden', method !== 'pointbuy');
  if (method === 'pointbuy') updatePointBuyDisplay();
}

function updatePointBuyDisplay() {
  const el = document.getElementById('pointbuy-remaining');
  if (!el) return;
  let total = 0;
  ['str','dex','con','int','wis','cha'].forEach(ab => {
    const input = document.getElementById('builder-' + ab);
    const v = input ? parseInt(input.value, 10) || 8 : 8;
    const capped = Math.min(15, Math.max(8, v));
    total += POINT_BUY_COSTS[capped] ?? 0;
  });
  el.textContent = POINT_BUY_TOTAL - total;
}

function roll4d6() {
  let sum = 0;
  const rolls = [];
  for (let i = 0; i < 4; i++) {
    const r = 1 + Math.floor(Math.random() * 6);
    rolls.push(r);
  }
  rolls.sort((a,b) => b - a);
  return rolls[0] + rolls[1] + rolls[2];
}

function completeBuilder() {
  const name = document.getElementById('builder-name').value.trim() || 'Unnamed';
  const level = Math.min(20, Math.max(1, parseInt(document.getElementById('builder-level').value, 10) || 1));
  const classId = builderState.classId || '';
  const raceId = builderState.raceId || '';
  const bgId = builderState.backgroundId || '';
  const classData = CLASS_OPTIONS[classId];
  const raceData = RACE_OPTIONS[raceId];
  const bgData = BACKGROUND_BUILDER[bgId];

  setValue('name', name);
  setValue('level', level);
  setValue('race', raceId);
  updateSubraceVisibility();
  setValue('subrace', builderState.subraceId || '');
  setValue('class', classId);
  setValue('background', bgId);
  setValue('raceCustom', '');
  setValue('classCustom', '');
  setValue('backgroundCustom', '');
  toggleCustomInputs();

  ['str','dex','con','int','wis','cha'].forEach(ab => {
    let base = parseInt(document.getElementById('builder-' + ab).value, 10) || 10;
    if (bgData && bgData.abilityBonuses && bgData.abilityBonuses[ab]) base += bgData.abilityBonuses[ab];
    setValue('ability-' + ab, Math.min(20, Math.max(1, base)));
  });

  Object.keys(SKILL_ABILITY_MAP).forEach(skill => {
    const el = document.getElementById('skill-' + skill);
    if (el) el.checked = false;
  });

  ['str','dex','con','int','wis','cha'].forEach(ab => {
    const prof = document.getElementById('save-' + ab);
    if (prof) prof.checked = classData && CLASS_PROFICIENCIES[classId]?.savingThrows?.includes(ab);
  });

  const proficientSkills = new Set();
  if (bgData && bgData.skills) bgData.skills.forEach(s => proficientSkills.add(s));
  if (classData && CLASS_PROFICIENCIES[classId]) {
    const cp = CLASS_PROFICIENCIES[classId];
    const pool = cp.skills || [];
    const n = cp.skillChoices || 0;
    let picked = 0;
    for (const skill of pool) {
      if (picked >= n) break;
      if (!proficientSkills.has(skill)) { proficientSkills.add(skill); picked++; }
    }
  }
  proficientSkills.forEach(skill => {
    const el = document.getElementById('skill-' + skill);
    if (el) el.checked = true;
  });

  const classEq = classData && CLASS_STARTING_EQUIPMENT[classId];
  const bgEq = bgData?.equipment || '';
  const equipment = getResolvedEquipmentString() || [classEq, bgEq].filter(Boolean).join('\n\n');
  setValue('equipment', equipment);

  if (classData) {
    setValue('hitDice', classData.hitDice || '1d8');
    setValue('hitDiceTotal', String(level));
    const conMod = abilityModifier(parseInt(getValue('ability-con'), 10) || 10);
    const hitDiceSize = parseInt((classData.hitDice || '1d8').split('d')[1], 10) || 8;
    setValue('hitPointMax', Math.max(1, hitDiceSize + conMod));
    setValue('hitPointCurrent', getValue('hitPointMax'));
  }

  setValue('proficiencyBonus', level >= 17 ? 6 : level >= 13 ? 5 : level >= 9 ? 4 : level >= 5 ? 3 : 2);
  updateAutoFeatures();
  updateModifiers();
  document.getElementById('builder-modal').classList.add('hidden');
  state.characterId = null;
}

function renderBuilderSummary() {
  const classData = CLASS_OPTIONS[builderState.classId];
  const raceData = RACE_OPTIONS[builderState.raceId];
  const bgData = BACKGROUND_OPTIONS[builderState.backgroundId];
  const name = document.getElementById('builder-name').value.trim() || 'Unnamed';
  const level = document.getElementById('builder-level').value || 1;
  let html = '<p><strong>' + name + '</strong> — Level ' + level + '</p>';
  html += '<p><strong>Class:</strong> ' + (classData?.name || '—') + '</p>';
  const raceDisplay = raceData && raceData.subraces && builderState.subraceId && raceData.subraces[builderState.subraceId]
    ? raceData.subraces[builderState.subraceId].name
    : (raceData?.name || '—');
  html += '<p><strong>Race:</strong> ' + raceDisplay + '</p>';
  html += '<p><strong>Background:</strong> ' + (bgData?.name || '—') + '</p>';
  const scores = ['str','dex','con','int','wis','cha'].map(ab => {
    const v = parseInt(document.getElementById('builder-' + ab).value, 10) || 10;
    const bonus = BACKGROUND_BUILDER[builderState.backgroundId]?.abilityBonuses?.[ab] || 0;
    const total = Math.min(20, v + bonus);
    return ab.toUpperCase() + ': ' + total + (bonus ? ' (+' + bonus + ' from background)' : '');
  });
  html += '<p><strong>Ability Scores:</strong> ' + scores.join(', ') + '</p>';
  document.getElementById('builder-summary').innerHTML = html;
}

document.getElementById('btn-create')?.addEventListener('click', openBuilder);

document.getElementById('btn-builder-back')?.addEventListener('click', () => {
  if (builderState.step > 1) goToBuilderStep(builderState.step - 1);
});

document.getElementById('btn-builder-next')?.addEventListener('click', () => {
  if (builderState.step < 7) goToBuilderStep(builderState.step + 1);
});

document.getElementById('btn-builder-complete')?.addEventListener('click', completeBuilder);

document.getElementById('btn-builder-cancel')?.addEventListener('click', () => {
  document.getElementById('builder-modal').classList.add('hidden');
});

document.querySelectorAll('input[name="abilityMethod"]').forEach(r => {
  r.addEventListener('change', () => {
    if (r.value === 'standard') applyStandardArrayByClass();
    updateBuilderAbilityUI();
  });
});

document.getElementById('btn-apply-standard')?.addEventListener('click', () => {
  document.querySelector('input[name="abilityMethod"][value="standard"]').checked = true;
  applyStandardArrayByClass();
  updateBuilderAbilityUI();
});

document.getElementById('btn-roll-abilities')?.addEventListener('click', () => {
  ['str','dex','con','int','wis','cha'].forEach(ab => {
    document.getElementById('builder-' + ab).value = roll4d6();
  });
  updateBuilderAbilityUI();
});

['str','dex','con','int','wis','cha'].forEach(ab => {
  document.getElementById('builder-' + ab)?.addEventListener('input', () => updatePointBuyDisplay());
});

document.querySelectorAll('.skill-tooltip-trigger').forEach(el => {
  el.addEventListener('mouseenter', showSkillTooltip);
  el.addEventListener('mouseleave', hideTooltip);
});

async function saveCharacter() {
  const payload = getCharacterFromForm();
  const statusEl = document.getElementById('save-status');
  statusEl.className = 'save-status';
  statusEl.textContent = 'Saving…';
  try {
    let res;
    if (state.characterId) {
      res = await fetch(API_BASE + '/api/characters/' + encodeURIComponent(state.characterId), {
        method: 'PUT',
        ...API_CREDENTIALS,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(API_BASE + '/api/characters', {
        method: 'POST',
        ...API_CREDENTIALS,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    if (!res.ok) {
      if (res.status === 401) {
        checkAuth();
        statusEl.textContent = 'Please log in to save.';
        statusEl.classList.add('error');
        return;
      }
      const text = await res.text();
      let msg = text;
      try {
        const j = JSON.parse(text);
        if (j && typeof j.error === 'string') msg = j.error;
      } catch (_) {}
      throw new Error(msg);
    }
    const data = await res.json();
    state.characterId = data.id;
    state.character = data;
    addCharacterToBackup(data);
    statusEl.textContent = 'Saved.';
    statusEl.classList.add('saved');
  } catch (err) {
    statusEl.textContent = 'Error: ' + (err.message || 'Could not save');
    statusEl.classList.add('error');
  }
}

document.getElementById('btn-save')?.addEventListener('click', saveCharacter);
document.getElementById('btn-save-pdf')?.addEventListener('click', () => {
  window.print();
});

async function renderCharacterList() {
  const listEl = document.getElementById('character-list');
  listEl.innerHTML = '';
  try {
    const res = await fetch(API_BASE + '/api/characters', API_CREDENTIALS);
    if (res.status === 401) {
      checkAuth();
      listEl.innerHTML = '<li class="char-list-empty">Please log in to load characters.</li>';
      return;
    }
    if (!res.ok) throw new Error('Failed to load list');
    const list = await res.json();
    if (list.length === 0) {
      const backups = getCharacterBackups();
      if (backups.length > 0) {
        listEl.innerHTML = '<li class="char-list-empty">No characters on the server (data may have been reset after an update).</li>' +
          '<li class="char-list-restore"><button type="button" id="btn-restore-backups" class="btn btn-primary">Restore ' + backups.length + ' character(s) from this device</button></li>';
        document.getElementById('btn-restore-backups').addEventListener('click', restoreFromBackup);
      } else {
        listEl.innerHTML = '<li class="char-list-empty">No saved characters</li>';
      }
    } else {
      const CHAR_LIMIT = 10;
      if (list.length >= CHAR_LIMIT) {
        const capLi = document.createElement('li');
        capLi.className = 'char-list-empty char-list-cap-hint';
        capLi.textContent = 'Character limit reached (' + list.length + '/' + CHAR_LIMIT + '). Delete one to create another.';
        listEl.appendChild(capLi);
      }
      list.forEach(c => {
        const li = document.createElement('li');
        li.className = 'char-list-item';
        li.innerHTML = '<span class="char-list-name">' + escapeHtml(c.name || 'Unnamed') + '</span><span class="char-level">' + escapeHtml(c.class || '—') + ' ' + (c.level || 1) + '</span><button type="button" class="btn-delete-char" title="Delete this character">Delete</button>';
        li.addEventListener('click', (e) => { if (!e.target.classList.contains('btn-delete-char')) loadCharacter(c.id); });
        li.querySelector('.btn-delete-char').addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('Delete "' + (c.name || 'Unnamed') + '"? This cannot be undone.')) return;
          try {
            const delRes = await fetch(API_BASE + '/api/characters/' + encodeURIComponent(c.id), { method: 'DELETE', ...API_CREDENTIALS });
            if (!delRes.ok) throw new Error('Delete failed');
            await renderCharacterList();
          } catch (err) {
            listEl.innerHTML = '<li class="char-list-empty" style="color:var(--danger)">Could not delete. Try again.</li>';
          }
        });
        listEl.appendChild(li);
      });
    }
  } catch (err) {
    listEl.innerHTML = '<li class="char-list-empty" style="color:var(--danger)">Could not load list. Is the server running?</li>';
  }
}

async function restoreFromBackup() {
  const backups = getCharacterBackups();
  if (backups.length === 0) return;
  const listEl = document.getElementById('character-list');
  const btn = document.getElementById('btn-restore-backups');
  if (btn) { btn.disabled = true; btn.textContent = 'Restoring…'; }
  try {
    for (const char of backups) {
      const payload = { ...char };
      delete payload.id;
      delete payload.userId;
      delete payload.createdAt;
      delete payload.updatedAt;
      const res = await fetch(API_BASE + '/api/characters', {
        method: 'POST',
        ...API_CREDENTIALS,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = 'Restore failed';
        try { const j = JSON.parse(text); if (j && typeof j.error === 'string') msg = j.error; } catch (_) {}
        throw new Error(msg);
      }
      const data = await res.json();
      addCharacterToBackup(data);
    }
    await renderCharacterList();
  } catch (err) {
    if (listEl) listEl.innerHTML = '<li class="char-list-empty" style="color:var(--danger)">Restore failed: ' + escapeHtml(err.message || 'Try again') + '</li>';
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Restore ' + getCharacterBackups().length + ' character(s) from this device'; }
}

document.getElementById('btn-load')?.addEventListener('click', async () => {
  await renderCharacterList();
  document.getElementById('load-modal').classList.remove('hidden');
});

async function loadCharacter(id) {
  try {
    const res = await fetch(API_BASE + '/api/characters/' + encodeURIComponent(id), API_CREDENTIALS);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    addCharacterToBackup(data);
    loadCharacterIntoForm(data);
    document.getElementById('load-modal').classList.add('hidden');
  } catch (err) {
    document.getElementById('character-list').innerHTML = '<li style="cursor:default;color:var(--danger)">Failed to load character</li>';
  }
}

document.getElementById('btn-close-load')?.addEventListener('click', () => {
  document.getElementById('load-modal').classList.add('hidden');
});

document.getElementById('load-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'load-modal') e.target.classList.add('hidden');
});

function getFeatureFamily(key, featureLabel) {
  const k = (key || '').toString();
  if (/^favoredEnemy/.test(k)) return { familyKey: 'favoredEnemy', familyLabel: 'Favored Enemy' };
  if (/^naturalExplorer/.test(k)) return { familyKey: 'naturalExplorer', familyLabel: 'Natural Explorer' };
  if (/^asi\d+$/.test(k)) return { familyKey: 'asi', familyLabel: 'Ability Score Improvement' };
  if (/^expertise/.test(k)) return { familyKey: 'expertise', familyLabel: 'Expertise' };
  if (/^metamagic/.test(k)) return { familyKey: 'metamagic', familyLabel: 'Metamagic' };
  if (/^invocation/.test(k)) return { familyKey: 'invocation', familyLabel: 'Eldritch Invocations' };
  if (/^totemAnimal/.test(k)) return { familyKey: 'totemAnimal', familyLabel: 'Totem Spirit' };
  return { familyKey: key, familyLabel: featureLabel || key };
}

var SUBCLASS_SELECTOR_DEPS = {
  primalPath: ['totemAnimal3', 'totemAnimal6', 'totemAnimal14'],
  druidCircle: ['landTerrain'],
  rangerArchetype: ['huntersPrey', 'defensiveTactics', 'superiorHuntersDefense']
};

function getSubclassFeaturesLabel(selectorKey) {
  const selectedId = state.featureChoices[selectorKey];
  const cfg = typeof FEATURE_CHOICES !== 'undefined' && FEATURE_CHOICES && FEATURE_CHOICES[selectorKey];
  const opt = cfg && (cfg.options || []).find(o => o.id === selectedId);
  return opt ? (opt.name + ' features') : 'Subclass features';
}

function renderOneFeatureChoice(bodyEl, item) {
  const { key, prompt, featureLabel, options } = item;
  const block = document.createElement('div');
  block.className = 'feature-choice-block';
  const current = state.featureChoices[key];
  const sel = document.createElement('select');
  sel.dataset.choiceKey = key;
  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = '— Choose —';
  sel.appendChild(opt0);
  (options || []).forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.id;
    o.textContent = opt.damageType ? opt.name + ' (' + opt.damageType + ')' : (opt.name + (opt.desc ? ' — ' + opt.desc : ''));
    if (opt.id === current) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', () => {
    if (/^asi\d+$/.test(key)) {
      applyASIToAbilityScores(key, sel.value || undefined);
      updateAutoFeatures();
    } else {
      state.featureChoices[key] = sel.value || undefined;
      if (!sel.value) delete state.featureChoices[key];
      updateAutoFeatures();
      if (typeof SUBCLASS_SELECTOR_DEPS !== 'undefined' && SUBCLASS_SELECTOR_DEPS && Object.prototype.hasOwnProperty.call(SUBCLASS_SELECTOR_DEPS, key)) {
        const wrap = sel.closest('.feature-choice-block');
        const next = wrap && wrap.nextElementSibling;
        if (next && next.classList.contains('feature-choices-subclass')) {
          const titleEl = next.querySelector('.feature-choices-subclass-title');
          if (titleEl) titleEl.textContent = getSubclassFeaturesLabel(key);
        }
      }
    }
  });
  block.innerHTML = '<label class="feature-choice-label">' + escapeHtml(featureLabel || prompt) + '</label>';
  block.appendChild(sel);
  bodyEl.appendChild(block);
}

document.getElementById('btn-feature-choices')?.addEventListener('click', () => {
  const pending = getPendingFeatureChoices();
  const listEl = document.getElementById('feature-choices-list');
  listEl.innerHTML = '';
  if (pending.length === 0) {
    listEl.innerHTML = '<p class="feature-choices-empty">No feature choices required for your current race, class, and level.</p>';
  } else {
    const bySource = { race: [], class: [], background: [] };
    pending.forEach(p => {
      const s = (p.source || 'class').toLowerCase();
      if (bySource[s]) bySource[s].push(p);
    });
    const sectionOrder = ['race', 'class', 'background'];
    const sectionTitles = { race: 'Race Features', class: 'Class Features', background: 'Background Features' };
    let firstSection = true;
    sectionOrder.forEach(source => {
      const items = bySource[source] || [];
      if (items.length === 0) return;
      const section = document.createElement('div');
      section.className = 'feature-choices-section';
      section.dataset.section = source;
      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'feature-choices-section-header';
      header.setAttribute('aria-expanded', firstSection ? 'true' : 'false');
      header.innerHTML = '<span class="feature-choices-section-title">' + escapeHtml(sectionTitles[source]) + '</span><span class="feature-choices-section-chevron" aria-hidden="true">' + (firstSection ? '▼' : '▶') + '</span>';
      const body = document.createElement('div');
      body.className = 'feature-choices-section-body' + (firstSection ? '' : ' collapsed');
      firstSection = false;
      header.addEventListener('click', () => {
        const open = body.classList.toggle('collapsed');
        header.setAttribute('aria-expanded', open ? 'false' : 'true');
        header.querySelector('.feature-choices-section-chevron').textContent = open ? '▶' : '▼';
      });
      var dependentKeysSet = new Set();
      if (source === 'class' && SUBCLASS_SELECTOR_DEPS) {
        Object.values(SUBCLASS_SELECTOR_DEPS).forEach(keys => keys.forEach(k => dependentKeysSet.add(k)));
      }
      var topLevelItems = source === 'class' ? items.filter(item => !dependentKeysSet.has(item.key)) : items;
      const byFamily = {};
      topLevelItems.forEach(item => {
        const { familyKey, familyLabel } = getFeatureFamily(item.key, item.featureLabel);
        if (!byFamily[familyKey]) byFamily[familyKey] = { label: familyLabel, items: [] };
        byFamily[familyKey].items.push(item);
      });
      Object.keys(byFamily).forEach(familyKey => {
        const { label: familyLabel, items: familyItems } = byFamily[familyKey];
        const isSubclassSelector = source === 'class' && SUBCLASS_SELECTOR_DEPS && Object.prototype.hasOwnProperty.call(SUBCLASS_SELECTOR_DEPS, familyItems[0].key);
        const dependentKeys = isSubclassSelector ? (SUBCLASS_SELECTOR_DEPS[familyItems[0].key] || []) : [];
        const dependentItems = dependentKeys.length ? dependentKeys.map(k => items.find(i => i.key === k)).filter(Boolean) : [];
        if (familyItems.length === 1 && dependentItems.length > 0) {
          renderOneFeatureChoice(body, familyItems[0]);
          const sub = document.createElement('div');
          sub.className = 'feature-choices-subclass';
          const subLabel = getSubclassFeaturesLabel(familyItems[0].key);
          const subHeader = document.createElement('button');
          subHeader.type = 'button';
          subHeader.className = 'feature-choices-subclass-header';
          subHeader.setAttribute('aria-expanded', 'false');
          subHeader.innerHTML = '<span class="feature-choices-subclass-title">' + escapeHtml(subLabel) + '</span><span class="feature-choices-subclass-chevron" aria-hidden="true">▶</span>';
          const subBody = document.createElement('div');
          subBody.className = 'feature-choices-subclass-body collapsed';
          subHeader.addEventListener('click', () => {
            const open = subBody.classList.toggle('collapsed');
            subHeader.setAttribute('aria-expanded', open ? 'false' : 'true');
            subHeader.querySelector('.feature-choices-subclass-chevron').textContent = open ? '▶' : '▼';
          });
          dependentItems.forEach(item => renderOneFeatureChoice(subBody, item));
          sub.appendChild(subHeader);
          sub.appendChild(subBody);
          body.appendChild(sub);
        } else if (familyItems.length === 1) {
          renderOneFeatureChoice(body, familyItems[0]);
        } else {
          const sub = document.createElement('div');
          sub.className = 'feature-choices-family';
          const subHeader = document.createElement('button');
          subHeader.type = 'button';
          subHeader.className = 'feature-choices-family-header';
          subHeader.setAttribute('aria-expanded', 'false');
          subHeader.innerHTML = '<span class="feature-choices-family-title">' + escapeHtml(familyLabel) + '</span><span class="feature-choices-family-chevron" aria-hidden="true">▶</span>';
          const subBody = document.createElement('div');
          subBody.className = 'feature-choices-family-body collapsed';
          subHeader.addEventListener('click', () => {
            const open = subBody.classList.toggle('collapsed');
            subHeader.setAttribute('aria-expanded', open ? 'false' : 'true');
            subHeader.querySelector('.feature-choices-family-chevron').textContent = open ? '▶' : '▼';
          });
          familyItems.forEach(item => renderOneFeatureChoice(subBody, item));
          sub.appendChild(subHeader);
          sub.appendChild(subBody);
          body.appendChild(sub);
        }
      });
      section.appendChild(header);
      section.appendChild(body);
      listEl.appendChild(section);
    });
  }
  document.getElementById('feature-choices-modal').classList.remove('hidden');
});

document.getElementById('btn-close-feature-choices')?.addEventListener('click', () => {
  document.getElementById('feature-choices-modal').classList.add('hidden');
});

document.getElementById('feature-choices-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'feature-choices-modal') e.target.classList.add('hidden');
});

/* ========== Spells tab (filtered by level and class) ========== */
let sheetSpellsCache = null;
let sheetSpellsLoading = false;

async function loadSpellsForSheet() {
  if (sheetSpellsCache !== null || sheetSpellsLoading) return;
  sheetSpellsLoading = true;
  try {
    const res = await fetch(API_BASE + '/api/spells');
    sheetSpellsCache = res.ok ? await res.json() : [];
  } catch (e) {
    sheetSpellsCache = [];
  }
  sheetSpellsLoading = false;
}

function getSpellsFilteredForCharacter() {
  const classId = (getValue('class') || '').toLowerCase().trim();
  const charLevel = Math.min(20, Math.max(1, parseInt(getValue('level'), 10) || 1));
  const subclassCaster = hasSubclassSpellcasting(classId, charLevel);
  if (!classId || (!SPELLCASTING_CLASSES.includes(classId) && !subclassCaster)) return [];
  if (!sheetSpellsCache || !sheetSpellsCache.length) return [];
  let result;
  if (subclassCaster) {
    const maxSpellLevel = Math.floor(charLevel / 3);
    result = sheetSpellsCache.filter(s => {
      const spellLevel = s.level ?? 0;
      if (spellLevel > maxSpellLevel) return false;
      const classes = s.classes || [];
      return classes.some(c => (c || '').toLowerCase().trim() === 'wizard');
    });
  } else {
    result = sheetSpellsCache.filter(s => {
      const spellLevel = s.level ?? 0;
      if (spellLevel > charLevel) return false;
      const classes = s.classes || [];
      return classes.some(c => (c || '').toLowerCase().trim() === classId);
    });
  }
  const seen = new Set();
  return result.filter(s => {
    const key = (s.name || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Parse search box text into level filter, school filter, and name search. Recognizes e.g. "cantrip", "3rd level", "evocation". */
function parseSpellSearchQuery(searchQ) {
  const q = (searchQ || '').toLowerCase().trim();
  if (!q) return { levelFilter: undefined, schoolFilter: undefined, namePart: '' };
  const words = q.split(/\s+/).filter(Boolean);
  let levelFilter = undefined;
  let schoolFilter = undefined;
  const nameWords = [];
  // All level types: cantrip (0) and 1st–9th (ordinals, words, or digits)
  const levelTokens = {
    cantrip: 0, '0th': 0, '0': 0,
    '1st': 1, first: 1, '1': 1,
    '2nd': 2, second: 2, '2': 2,
    '3rd': 3, third: 3, '3': 3,
    '4th': 4, fourth: 4, '4': 4,
    '5th': 5, fifth: 5, '5': 5,
    '6th': 6, sixth: 6, '6': 6,
    '7th': 7, seventh: 7, '7': 7,
    '8th': 8, eighth: 8, '8': 8,
    '9th': 9, ninth: 9, '9': 9
  };
  // All 5e schools (exact word match, case-insensitive)
  const schoolTokens = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation'];
  let i = 0;
  while (i < words.length) {
    const w = words[i];
    const wNext = i + 1 < words.length ? words[i + 1] : '';
    if (levelFilter === undefined && (levelTokens[w] !== undefined || (w === 'level' && levelTokens[wNext] !== undefined))) {
      if (w === 'level') { levelFilter = levelTokens[wNext]; i += 2; continue; }
      levelFilter = levelTokens[w];
      i++;
      if (i < words.length && words[i] === 'level') i++;
      continue;
    }
    if (schoolFilter === undefined) {
      const school = schoolTokens.find(s => s === w);
      if (school) {
        schoolFilter = school.charAt(0).toUpperCase() + school.slice(1);
        i++;
        continue;
      }
    }
    nameWords.push(w);
    i++;
  }
  const namePart = nameWords.join(' ').trim();
  return { levelFilter, schoolFilter, namePart };
}

function renderSpellsTab() {
  const hint = document.getElementById('spells-hint');
  const wrap = document.getElementById('spells-available-wrap');
  const classId = (getValue('class') || '').toLowerCase().trim();
  const charLevel = Math.min(20, Math.max(1, parseInt(getValue('level'), 10) || 1));
  const isCaster = hasSpellcasting(classId, charLevel);

  if (!isCaster) {
    state.spellsKnown = [];
    if (hint) hint.textContent = 'Choose a spellcasting class (e.g. Wizard, Cleric, Bard) or a subclass that grants spells (Eldritch Knight, Arcane Trickster at 3rd level) and set your level to see spells you can add.';
    if (hint) hint.classList.remove('hidden');
    if (wrap) wrap.classList.add('hidden');
    return;
  }

  if (hint) hint.classList.add('hidden');
  if (wrap) wrap.classList.remove('hidden');

  const getAbilityMod = (ability) => abilityModifier(parseInt(getValue('ability-' + ability), 10) || 10);
  const limitInfo = getSpellLimit(classId, charLevel, getAbilityMod);
  const cantripLimit = getCantripLimit(classId, charLevel);
  // PHB "Spells Known" / "Spells Prepared" is leveled spells (1st+) only; cantrips use a separate limit. Keep both independent.
  const leveledSpellsLimit = limitInfo.limit || 0;

  // Build name -> spell level map (0 = cantrip) for known-spell lookups
  const filteredForChar = getSpellsFilteredForCharacter();
  const spellLevelByName = new Map();
  filteredForChar.forEach(s => { spellLevelByName.set((s.name || '').trim(), s.level ?? 0); });

  const knownListRaw = (state.spellsKnown || []).filter(Boolean);
  const cantripsInList = knownListRaw.filter(name => spellLevelByName.get((name || '').trim()) === 0);
  const leveledInList = knownListRaw.filter(name => spellLevelByName.get((name || '').trim()) !== 0);

  if (limitInfo.limit === 0) {
    state.spellsKnown = [];
  } else {
    const keptCantrips = cantripLimit >= 0 ? cantripsInList.slice(0, cantripLimit) : cantripsInList;
    const keptLeveled = leveledSpellsLimit >= 0 ? leveledInList.slice(0, leveledSpellsLimit) : leveledInList;
    state.spellsKnown = [...keptLeveled, ...keptCantrips];
  }

  const currentLeveledCount = (state.spellsKnown || []).filter(Boolean).filter(name => spellLevelByName.get((name || '').trim()) !== 0).length;
  const currentCantripCount = (state.spellsKnown || []).filter(Boolean).filter(name => spellLevelByName.get((name || '').trim()) === 0).length;
  const atOrOverLeveledLimit = leveledSpellsLimit > 0 && currentLeveledCount >= leveledSpellsLimit;
  const atOrOverCantripLimit = cantripLimit > 0 && currentCantripCount >= cantripLimit;

  const limitEl = document.getElementById('spells-limit-display');
  if (limitEl) {
    let limitText = limitInfo.label + ': ' + currentLeveledCount + ' / ' + leveledSpellsLimit + ' (Cantrips: ' + currentCantripCount + ' / ' + cantripLimit + ')';
    limitEl.textContent = limitText;
    limitEl.classList.toggle('spells-limit-over', (leveledSpellsLimit > 0 && currentLeveledCount > leveledSpellsLimit) || (cantripLimit > 0 && currentCantripCount > cantripLimit));
  }

  const slotsEl = document.getElementById('spells-slots-display');
  if (slotsEl) slotsEl.textContent = getSpellSlotsText(classId, charLevel) ? ('Spell slots: ' + getSpellSlotsText(classId, charLevel)) : '';

  const slotCounterWrap = document.getElementById('spell-slots-counter-wrap');
  const slotCounterList = document.getElementById('spell-slots-counter-list');
  const slotCounts = getSpellSlotsArray(classId, charLevel);
  const hasSlots = slotCounts.some(n => n > 0);
  if (slotCounterWrap) slotCounterWrap.classList.toggle('hidden', !hasSlots);
  if (slotCounterList && hasSlots) {
    slotCounterList.innerHTML = '';
    const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
    slotCounts.forEach((total, levelIndex) => {
      if (total < 1) return;
      const level = levelIndex + 1;
      let used = state.spellSlotsUsed[level];
      if (!Array.isArray(used)) used = [];
      used = used.slice(0, total);
      while (used.length < total) used.push(false);
      state.spellSlotsUsed[level] = used;

      const row = document.createElement('div');
      row.className = 'spell-slots-counter-row';
      const label = document.createElement('span');
      label.className = 'spell-slots-counter-label';
      label.textContent = ordinals[levelIndex] + ' level:';
      row.appendChild(label);
      const boxes = document.createElement('span');
      boxes.className = 'spell-slots-counter-boxes';
      for (let i = 0; i < total; i++) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'spell-slot-' + level + '-' + i;
        cb.className = 'spell-slot-cb';
        cb.setAttribute('data-level', String(level));
        cb.setAttribute('data-index', String(i));
        cb.checked = !!used[i];
        cb.title = 'Used';
        cb.addEventListener('change', () => {
          state.spellSlotsUsed[level][i] = cb.checked;
          const sumSpan = row.querySelector('.spell-slots-counter-summary');
          if (sumSpan) {
            const usedCount = state.spellSlotsUsed[level].filter(Boolean).length;
            sumSpan.textContent = usedCount + ' / ' + total + ' used';
          }
        });
        boxes.appendChild(cb);
      }
      row.appendChild(boxes);
      const usedCount = used.filter(Boolean).length;
      const summary = document.createElement('span');
      summary.className = 'spell-slots-counter-summary';
      summary.textContent = usedCount + ' / ' + total + ' used';
      row.appendChild(summary);
      slotCounterList.appendChild(row);
    });
  }

  const raceId = (getValue('race') || '').trim();
  const subraceId = (getValue('subrace') || '').trim();
  const racialGrantedSpells = getRacialGrantedSpells(raceId, subraceId, charLevel);

  const availableList = document.getElementById('spells-available-list');
  const knownList = document.getElementById('spells-known-list');
  const searchRaw = (document.getElementById('spells-search')?.value || '').trim();
  const { levelFilter, schoolFilter, namePart } = parseSpellSearchQuery(searchRaw);

  let filtered = filteredForChar;
  if (levelFilter !== undefined) filtered = filtered.filter(s => Number(s.level ?? 0) === levelFilter);
  if (schoolFilter) filtered = filtered.filter(s => (String(s.school || '').toLowerCase()) === schoolFilter.toLowerCase());
  if (namePart) filtered = filtered.filter(s => (s.name || '').toLowerCase().includes(namePart.toLowerCase()));
  filtered.sort((a, b) => {
    if (a.level !== b.level) return (a.level ?? 0) - (b.level ?? 0);
    return (a.name || '').localeCompare(b.name || '');
  });

  const knownSetLower = new Set([...(state.spellsKnown || []).map(n => (n || '').trim().toLowerCase()).filter(Boolean), ...racialGrantedSpells.map(n => (n || '').trim().toLowerCase()).filter(Boolean)]);
  const available = filtered.filter(s => !knownSetLower.has((s.name || '').trim().toLowerCase()));

  if (availableList) {
    availableList.innerHTML = '';
    available.forEach(spell => {
      const levelStr = spell.level === 0 ? 'Cantrip' : (spell.level === 1 ? '1st' : spell.level === 2 ? '2nd' : spell.level === 3 ? '3rd' : (spell.level || 0) + 'th');
      const row = document.createElement('div');
      row.className = 'spells-list-row';
      const nameEsc = escapeHtml(spell.name || '');
      const isCantrip = spell.level === 0;
      const atLimitForThis = isCantrip ? atOrOverCantripLimit : atOrOverLeveledLimit;
      const addDisabled = atLimitForThis ? ' disabled' : '';
      const addDimmed = atLimitForThis ? ' spell-add-btn--at-limit' : '';
      let addTitle = '';
      if (atLimitForThis) addTitle = isCantrip ? ' title="At maximum cantrips known (' + cantripLimit + ')"' : ' title="At maximum ' + limitInfo.label.toLowerCase() + ' (' + leveledSpellsLimit + ')"';
      row.innerHTML = '<span class="spell-level-tag">[' + levelStr + ']</span> <span class="spell-tooltip-trigger" data-spell-name="' + nameEsc + '">' + nameEsc + '</span> <button type="button" class="btn btn-ghost btn-sm spell-add-btn' + addDimmed + '" data-name="' + nameEsc + '"' + addDisabled + addTitle + '>Add</button>';
      const addBtn = row.querySelector('.spell-add-btn');
      if (addBtn && !atLimitForThis) {
        addBtn.addEventListener('click', () => {
          const name = (addBtn.dataset.name || '').trim();
          if (name && !state.spellsKnown.includes(name)) state.spellsKnown.push(name);
          renderSpellsTab();
        });
      }
      availableList.appendChild(row);
    });
  }

  if (knownList) {
    knownList.innerHTML = '';
    racialGrantedSpells.forEach(name => {
      const spellMatch = (sheetSpellsCache || []).find(s => (s.name || '').trim().toLowerCase() === (name || '').trim().toLowerCase());
      const displayName = (spellMatch && spellMatch.name) ? (spellMatch.name || '').trim() : name;
      const row = document.createElement('div');
      row.className = 'spells-list-row spells-known-granted';
      const nameEsc = escapeHtml(displayName);
      row.innerHTML = '<span class="spell-tooltip-trigger" data-spell-name="' + nameEsc + '">' + nameEsc + '</span> <span class="spell-granted-tag" title="Granted by race; does not count against spells known">(granted)</span>';
      knownList.appendChild(row);
    });
    const knownNames = (state.spellsKnown || []).filter(Boolean);
    knownNames.forEach(name => {
      const row = document.createElement('div');
      row.className = 'spells-list-row';
      const nameEsc = escapeHtml(name);
      row.innerHTML = '<span class="spell-tooltip-trigger" data-spell-name="' + nameEsc + '">' + nameEsc + '</span> <button type="button" class="btn btn-ghost btn-sm btn-danger spell-remove-btn" data-name="' + nameEsc + '">Remove</button>';
      row.querySelector('.spell-remove-btn')?.addEventListener('click', () => {
        state.spellsKnown = state.spellsKnown.filter(n => n !== name);
        renderSpellsTab();
      });
      knownList.appendChild(row);
    });
  }

  document.querySelectorAll('.spell-tooltip-trigger').forEach(el => {
    el.removeEventListener('mouseenter', showSpellTooltip);
    el.removeEventListener('mouseleave', hideTooltip);
    el.addEventListener('mouseenter', showSpellTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

/* ========== Reference Database (Open5e API – 2014 5e SRD; no new tabs, no credentials) ========== */
let refState = {
  category: 'spells',
  selectedIndex: -1,
  spells: null,
  spellsLoading: false,
  equipment: null,
  equipmentLoading: false,
  magicitems: null,
  magicitemsLoading: false,
  rules: null,
  rulesLoading: false
};

function openReference() {
  refState.category = 'spells';
  refState.selectedIndex = -1;
  refState.spells = null;
  refState.equipment = null;
  refState.magicitems = null;
  refState.rules = null;
  document.querySelectorAll('.ref-sub-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.ref-sub-btn[data-ref-cat="spells"]')?.classList.add('active');
  document.getElementById('reference-search-input').value = '';
  document.getElementById('reference-spell-filters')?.classList.toggle('hidden', false);
  ['ref-spell-filter-school', 'ref-spell-filter-class', 'ref-spell-filter-level'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('reference-modal').classList.remove('hidden');
  loadReferenceSpells();
  renderReferenceList();
  renderReferenceDetail();
}

async function loadReferenceSpells() {
  if (refState.spells !== null || refState.spellsLoading) return;
  refState.spellsLoading = true;
  const listEl = document.getElementById('ref-list');
  if (listEl) listEl.innerHTML = '<div class="ref-loading">Loading spells…</div>';
  try {
    const res = await fetch(API_BASE + '/api/spells');
    if (!res.ok) throw new Error('Failed to load');
    refState.spells = await res.json();
  } catch (err) {
    refState.spells = [];
    if (listEl) listEl.innerHTML = '<div class="ref-loading ref-error">Could not load spells. Is the server running?</div>';
  }
  refState.spellsLoading = false;
  renderReferenceList();
  renderReferenceDetail();
}

async function loadReferenceEquipment() {
  if (refState.equipment !== null || refState.equipmentLoading) return;
  refState.equipmentLoading = true;
  const listEl = document.getElementById('ref-list');
  if (listEl) listEl.innerHTML = '<div class="ref-loading">Loading equipment…</div>';
  try {
    const res = await fetch(API_BASE + '/api/equipment');
    if (!res.ok) throw new Error('Failed to load');
    refState.equipment = await res.json();
  } catch (err) {
    refState.equipment = [];
    if (listEl) listEl.innerHTML = '<div class="ref-loading ref-error">Could not load equipment.</div>';
  }
  refState.equipmentLoading = false;
  renderReferenceList();
  renderReferenceDetail();
}

async function loadReferenceMagicItems() {
  if (refState.magicitems !== null || refState.magicitemsLoading) return;
  refState.magicitemsLoading = true;
  const listEl = document.getElementById('ref-list');
  if (listEl) listEl.innerHTML = '<div class="ref-loading">Loading magic items…</div>';
  try {
    const res = await fetch(API_BASE + '/api/magicitems');
    if (!res.ok) throw new Error('Failed to load');
    refState.magicitems = await res.json();
  } catch (err) {
    refState.magicitems = [];
    if (listEl) listEl.innerHTML = '<div class="ref-loading ref-error">Could not load magic items.</div>';
  }
  refState.magicitemsLoading = false;
  renderReferenceList();
  renderReferenceDetail();
}

async function loadReferenceRules() {
  if (refState.rules !== null || refState.rulesLoading) return;
  refState.rulesLoading = true;
  const listEl = document.getElementById('ref-list');
  if (listEl) listEl.innerHTML = '<div class="ref-loading">Loading rules…</div>';
  try {
    const res = await fetch(API_BASE + '/api/rules');
    if (!res.ok) throw new Error('Failed to load');
    refState.rules = await res.json();
  } catch (err) {
    refState.rules = [];
    if (listEl) listEl.innerHTML = '<div class="ref-loading ref-error">Could not load rules.</div>';
  }
  refState.rulesLoading = false;
  renderReferenceList();
  renderReferenceDetail();
}

function getReferenceData() {
  const q = (document.getElementById('reference-search-input')?.value || '').toLowerCase().trim();
  if (refState.category === 'spells') {
    let list = refState.spells || [];
    const school = document.getElementById('ref-spell-filter-school')?.value || '';
    const cls = document.getElementById('ref-spell-filter-class')?.value || '';
    const levelStr = document.getElementById('ref-spell-filter-level')?.value || '';
    const levelFilter = levelStr === '' ? null : parseInt(levelStr, 10);
    list = list.filter(s => {
      if (school && (s.school || '') !== school) return false;
      if (cls && (!s.classes || !s.classes.includes(cls))) return false;
      if (levelFilter !== null && s.level !== levelFilter) return false;
      if (q && !(s.name || '').toLowerCase().includes(q) && !(s.school || '').toLowerCase().includes(q) && !(s.desc || '').toLowerCase().includes(q)) return false;
      return true;
    });
    const seen = new Set();
    return list.filter(s => {
      const key = (s.name || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  if (refState.category === 'equipment') {
    let list = refState.equipment || [];
    if (q) list = list.filter(i => (i.name || '').toLowerCase().includes(q) || (i.type || '').toLowerCase().includes(q) || (i.desc || '').toLowerCase().includes(q));
    return list;
  }
  if (refState.category === 'magicitems') {
    let list = refState.magicitems || [];
    if (q) list = list.filter(i => (i.name || '').toLowerCase().includes(q) || (i.type || '').toLowerCase().includes(q) || (i.rarity || '').toLowerCase().includes(q) || (i.desc || '').toLowerCase().includes(q));
    return list;
  }
  if (refState.category === 'rules') {
    let list = refState.rules || [];
    if (q) list = list.filter(r => (r.title || '').toLowerCase().includes(q) || (r.content || '').toLowerCase().includes(q));
    return list;
  }
  return [];
}

function renderReferenceList() {
  const listEl = document.getElementById('ref-list');
  if (!listEl) return;
  if (refState.category === 'spells' && refState.spellsLoading) return;
  if (refState.category === 'equipment' && refState.equipmentLoading) return;
  if (refState.category === 'magicitems' && refState.magicitemsLoading) return;
  if (refState.category === 'rules' && refState.rulesLoading) return;
  const data = getReferenceData();
  listEl.innerHTML = '';
  data.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'ref-list-item' + (i === refState.selectedIndex ? ' selected' : '');
    if (refState.category === 'spells') {
      const levelStr = item.level === 0 ? 'Cantrip' : (item.level === 1 ? '1st' : item.level === 2 ? '2nd' : item.level === 3 ? '3rd' : item.level + 'th');
      div.innerHTML = '<span class="spell-level-tag">[' + levelStr + ']</span>' + escapeHtml(item.name || '');
    } else {
      div.textContent = item.name || item.title;
    }
    div.dataset.index = i;
    div.addEventListener('click', () => {
      refState.selectedIndex = i;
      renderReferenceList();
      renderReferenceDetail();
    });
    listEl.appendChild(div);
  });
  if (data.length > 0 && refState.selectedIndex < 0) {
    refState.selectedIndex = 0;
    renderReferenceList();
    renderReferenceDetail();
  } else if (data.length === 0) {
    const msg = refState.category === 'spells' ? 'No spells match the filters.' : refState.category === 'equipment' ? 'No equipment match.' : refState.category === 'magicitems' ? 'No magic items match.' : 'No rules match.';
    listEl.innerHTML = '<div class="ref-loading">' + msg + '</div>';
    renderReferenceDetail();
  }
}

function renderReferenceDetail() {
  const detailEl = document.getElementById('ref-detail');
  if (!detailEl) return;
  const data = getReferenceData();
  const item = data[refState.selectedIndex];
  if (!item) {
    const loading = (refState.category === 'spells' && refState.spellsLoading) || (refState.category === 'equipment' && refState.equipmentLoading) || (refState.category === 'magicitems' && refState.magicitemsLoading) || (refState.category === 'rules' && refState.rulesLoading);
    detailEl.innerHTML = '<p class="ref-desc">' + (loading ? 'Loading…' : 'Select an entry from the list.') + '</p>';
    return;
  }
  if (refState.category === 'spells') {
    const s = item;
    const levelStr = s.level === 0 ? 'Cantrip' : (s.level === 1 ? '1st' : s.level === 2 ? '2nd' : s.level === 3 ? '3rd' : s.level + 'th') + '-level';
    const classList = s.classes && s.classes.length ? 'Classes: ' + s.classes.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ') : '';
    detailEl.innerHTML = '<h4>' + escapeHtml(s.name) + '</h4>' +
      '<div class="ref-meta">' + escapeHtml(levelStr) + ' ' + escapeHtml(s.school || '') + ' · ' + escapeHtml(s.casting_time || '') + ' · ' + escapeHtml(s.range || '') + ' · ' + escapeHtml(s.components || '') + ' · ' + escapeHtml(s.duration || '') + (s.concentration ? ' (conc.)' : '') + (classList ? '<br>' + escapeHtml(classList) : '') + '</div>' +
      '<div class="ref-desc">' + escapeHtml(s.desc || '') + '</div>';
  } else if (refState.category === 'equipment' || refState.category === 'magicitems') {
    const meta = item.rarity ? escapeHtml(item.type || '') + ' · ' + escapeHtml(item.rarity) : escapeHtml(item.type || '');
    detailEl.innerHTML = '<h4>' + escapeHtml(item.name) + '</h4>' +
      (meta ? '<div class="ref-meta">' + meta + '</div>' : '') +
      '<div class="ref-desc">' + escapeHtml(item.desc || '') + '</div>';
  } else if (refState.category === 'rules') {
    const sections = parseRuleSections(item.content || '');
    const sectionHtml = sections.map((sec, i) => {
      const id = 'ref-section-' + i;
      const escapedTitle = escapeHtml(sec.title);
      const escapedBody = escapeHtml(sec.body).replace(/\n/g, '<br>');
      const collapsed = i > 0 ? ' ref-detail-section--collapsed' : '';
      return '<div class="ref-detail-section' + collapsed + '" data-section-index="' + i + '">' +
        '<button type="button" class="ref-detail-section-header" aria-expanded="' + (i === 0 ? 'true' : 'false') + '" aria-controls="' + id + '" id="' + id + '-head">' +
        '<span class="ref-detail-section-chevron" aria-hidden="true">▼</span>' +
        '<span class="ref-detail-section-title">' + escapedTitle + '</span></button>' +
        '<div class="ref-detail-section-body" id="' + id + '" role="region" aria-labelledby="' + id + '-head">' +
        '<div class="ref-desc">' + escapedBody + '</div></div></div>';
    }).join('');
    detailEl.innerHTML = '<h4>' + escapeHtml(item.title) + '</h4>' + sectionHtml;
    detailEl.querySelectorAll('.ref-detail-section-header').forEach((btn) => {
      btn.addEventListener('click', () => {
        const section = btn.closest('.ref-detail-section');
        if (section) {
          section.classList.toggle('ref-detail-section--collapsed');
          btn.setAttribute('aria-expanded', section.classList.contains('ref-detail-section--collapsed') ? 'false' : 'true');
        }
      });
    });
  }
}

/** Split rule content by ### (or any #) headings; text after each # line is collapsible up to the next # line. */
function parseRuleSections(content) {
  if (!content || !content.trim()) return [{ title: 'Content', body: '' }];
  const parts = content.split(/\n(?=#+\s)/);
  const sections = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;
    if (part.startsWith('#')) {
      const firstNewline = part.indexOf('\n');
      const titleLine = firstNewline >= 0 ? part.slice(0, firstNewline) : part;
      const title = titleLine.replace(/^#+\s*/, '').trim();
      const body = firstNewline >= 0 ? part.slice(firstNewline + 1).trim() : '';
      sections.push({ title: title || 'Section', body });
    } else {
      sections.push({ title: 'Overview', body: part });
    }
  }
  return sections.length ? sections : [{ title: 'Content', body: content.trim() }];
}

document.getElementById('btn-reference')?.addEventListener('click', openReference);
document.getElementById('btn-close-reference')?.addEventListener('click', () => {
  document.getElementById('reference-modal').classList.add('hidden');
});
document.getElementById('reference-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'reference-modal') e.target.classList.add('hidden');
});
document.querySelectorAll('.ref-sub-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    refState.category = btn.dataset.refCat;
    refState.selectedIndex = -1;
    document.querySelectorAll('.ref-sub-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtersEl = document.getElementById('reference-spell-filters');
    filtersEl?.classList.toggle('hidden', refState.category !== 'spells');
    if (refState.category === 'spells') loadReferenceSpells();
    else if (refState.category === 'equipment') loadReferenceEquipment();
    else if (refState.category === 'magicitems') loadReferenceMagicItems();
    else if (refState.category === 'rules') loadReferenceRules();
    renderReferenceList();
    renderReferenceDetail();
  });
});

['ref-spell-filter-school', 'ref-spell-filter-class', 'ref-spell-filter-level'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', () => {
    refState.selectedIndex = -1;
    renderReferenceList();
    renderReferenceDetail();
  });
});
document.getElementById('reference-search-input')?.addEventListener('input', () => {
  refState.selectedIndex = -1;
  renderReferenceList();
  renderReferenceDetail();
});

function populateSelects() {
  const fill = (selectId, options) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    Object.keys(options).forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = options[id].name;
      sel.appendChild(opt);
    });
  };
  fill('race', RACE_OPTIONS);
  fill('class', CLASS_OPTIONS);
  fill('background', BACKGROUND_OPTIONS);
  updateSubraceVisibility();
}

populateSelects();
toggleCustomInputs();
updateBanner();

['race', 'class', 'background'].forEach(field => {
  const sel = document.getElementById(field);
  if (!sel) return;
  sel.addEventListener('change', () => {
    toggleCustomInputs();
    if (field === 'race') updateSubraceVisibility();
    updateAutoFeatures();
    updateBanner();
    if (field === 'background') updateBackgroundDisplay();
    if (field === 'class') {
      const classId = getValue('class') || '';
      const data = CLASS_OPTIONS[classId];
      if (data && data.hitDice) setValue('hitDice', data.hitDice);
    }
  });
});

document.getElementById('subrace')?.addEventListener('change', () => {
  updateAutoFeatures();
  updateBanner();
  if (typeof renderSpellsTab === 'function') renderSpellsTab();
});

updateModifiers();
checkAuth().then(openCharacterFromUrlIfPresent);

function showBackdoorIfHash() {
  const overlay = document.getElementById('backdoor-overlay');
  if (!overlay) return;
  if (location.hash === '#backdoor') {
    overlay.classList.remove('hidden');
    document.getElementById('backdoor-secret').value = '';
    document.getElementById('backdoor-error').classList.add('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}
showBackdoorIfHash();
window.addEventListener('hashchange', () => {
  showBackdoorIfHash();
  updateLandingAndAppVisibility();
});
document.getElementById('admin-back-to-sheet')?.addEventListener('click', (e) => {
  e.preventDefault();
  location.hash = '';
  updateLandingAndAppVisibility();
});
document.getElementById('admin-back-to-admin')?.addEventListener('click', (e) => {
  e.preventDefault();
  state.adminViewingCharacter = false;
  state.adminViewingCharacterName = '';
  location.hash = 'admin';
  updateLandingAndAppVisibility();
});
document.getElementById('backdoor-submit')?.addEventListener('click', async () => {
  const secret = document.getElementById('backdoor-secret')?.value || '';
  const errEl = document.getElementById('backdoor-error');
  errEl.classList.add('hidden');
  try {
    const res = await fetch(API_BASE + '/api/auth/backdoor', {
      method: 'POST',
      ...API_CREDENTIALS,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret })
    });
    if (!res.ok) {
      errEl.textContent = res.status === 404
        ? 'Backdoor not available. Restart the server (npm start) and try again.'
        : 'Invalid secret.';
      errEl.classList.remove('hidden');
      return;
    }
    document.getElementById('backdoor-overlay').classList.add('hidden');
    location.hash = 'admin';
    await checkAuth();
  } catch (e) {
    errEl.textContent = 'Network error.';
    errEl.classList.remove('hidden');
  }
});
