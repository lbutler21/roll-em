const API_BASE = '';
const API_CREDENTIALS = { credentials: 'include' };

let authUser = null;

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
  updateAdminPanelVisibility();
}

function isAdminView() {
  return location.hash === '#admin' && authUser && authUser.id === 'admin';
}

function updateAdminPanelVisibility() {
  const mainApp = document.getElementById('main-app');
  const adminPanel = document.getElementById('admin-panel');
  if (!mainApp || !adminPanel) return;
  if (isAdminView()) {
    mainApp.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadAdminPanel();
  } else {
    mainApp.classList.remove('hidden');
    adminPanel.classList.add('hidden');
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
      charsEl.innerHTML = '<table class="admin-table"><thead><tr><th>Character</th><th>Class</th><th>Level</th><th>Owner</th><th>Updated</th><th></th></tr></thead><tbody>' +
        characters.map(c => '<tr><td>' + escapeHtml(c.name || '') + '</td><td>' + escapeHtml(c.class || '—') + '</td><td>' + (c.level || 1) + '</td><td>' + escapeHtml(userMap[c.userId] || c.userId || '—') + '</td><td>' + escapeHtml(c.updatedAt || '') + '</td><td><button type="button" class="btn btn-ghost btn-sm btn-danger admin-delete-char" data-id="' + escapeHtml(c.id) + '">Delete</button></td></tr>').join('') + '</tbody></table>';
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
  document.getElementById('auth-modal').classList.remove('hidden');
}

let authModalMode = 'login';

function getDisplayName(selectId, customId) {
  const sel = document.getElementById(selectId);
  const custom = document.getElementById(customId);
  const id = sel && sel.value ? sel.value.trim() : '';
  if (id === 'other' && custom) return (custom.value || '').trim();
  const data = selectId === 'race' ? RACE_OPTIONS[id] : selectId === 'class' ? CLASS_OPTIONS[id] : BACKGROUND_OPTIONS[id];
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
      if (ids.includes(classId)) pending.push({ key, ...cfg });
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
  if (raceData && raceData.features) {
    const feats = raceData.features.split(/\n/).filter(Boolean).map(f => {
      const name = f.trim();
      const resolved = getResolvedFeatureText(name, 'draconicAncestry');
      return wrapFeatureWithTooltip(resolved.text, resolved.desc);
    }).join(', ');
    parts.push('[Race: ' + raceData.name + ']\n' + feats);
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

function toggleCustomInputs() {
  ['race', 'class', 'background'].forEach(field => {
    const sel = document.getElementById(field);
    const custom = document.getElementById(field + 'Custom');
    if (!sel || !custom) return;
    if (sel.value === 'other') custom.classList.remove('hidden'); else custom.classList.add('hidden');
  });
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

const state = {
  characterId: null,
  character: null,
  featureChoices: {}
};

function getCharacterFromForm() {
  const abilities = {};
  ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ab => {
    const el = document.getElementById('ability-' + ab);
    abilities[ab] = el ? parseInt(el.value, 10) || 10 : 10;
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
    background: getDisplayName('background', 'backgroundCustom') || (BACKGROUND_OPTIONS[backgroundId] && BACKGROUND_OPTIONS[backgroundId].name),
    backgroundId: backgroundId || undefined,
    raceCustom: getValue('raceCustom'),
    classCustom: getValue('classCustom'),
    backgroundCustom: getValue('backgroundCustom'),
    alignment: getValue('alignment'),
    playerName: getValue('playerName'),
    experiencePoints: parseInt(getValue('experiencePoints'), 10) || 0,
    inspiration: parseInt(getValue('inspiration'), 10) || 0,
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
    equipment: getValue('equipment'),
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
    languages: getValue('languages')
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

  const abilities = data.abilities || {};
  ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ab => {
    setValue('ability-' + ab, abilities[ab] ?? 10);
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
  toggleCustomInputs();
  updateAutoFeatures();

  state.characterId = data.id || null;
  state.character = data;
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

function showDiceResult(result, label) {
  const el = document.getElementById('dice-result');
  if (!el) return;
  const parts = result.rolls.join(' + ');
  const modStr = result.modifier !== 0 ? (result.modifier > 0 ? ' + ' : ' ') + result.modifier : '';
  el.innerHTML = `
    <strong>${label || 'Roll'}: ${result.total}</strong>
    <div class="roll-detail">${result.notation} → [${parts}]${modStr} = ${result.total}</div>
  `;
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
  input.addEventListener('input', updateModifiers);
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

document.getElementById('btn-login')?.addEventListener('click', () => openAuthModal('login'));
document.getElementById('btn-register')?.addEventListener('click', () => openAuthModal('register'));
document.getElementById('btn-logout')?.addEventListener('click', async () => {
  await fetch(API_BASE + '/api/auth/logout', { method: 'POST', ...API_CREDENTIALS });
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
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    const pane = document.getElementById('tab-' + tabId);
    if (pane) { pane.classList.remove('hidden'); }
    if (tabId === 'background') updateBackgroundDisplay();
  });
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
  if (el) el.addEventListener('input', updateBanner);
  if (el) el.addEventListener('change', updateBanner);
});

document.getElementById('btn-new')?.addEventListener('click', () => {
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
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-status').className = 'save-status';
});

/* ========== Character Builder (D&D Beyond style) ========== */
const builderState = { step: 1, classId: '', raceId: '', backgroundId: '', skillChoices: [] };

function openBuilder() {
  builderState.step = 1;
  builderState.classId = '';
  builderState.raceId = '';
  builderState.backgroundId = '';
  builderState.skillChoices = [];
  document.getElementById('builder-name').value = '';
  document.getElementById('builder-level').value = 1;
  document.querySelectorAll('.builder-option').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('input[name="abilityMethod"]').forEach(r => { r.checked = r.value === 'standard'; });
  ['str','dex','con','int','wis','cha'].forEach(ab => { document.getElementById('builder-' + ab).value = 10; });
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

function selectBuilderOption(type, id) {
  if (type === 'class') builderState.classId = id;
  else if (type === 'race') builderState.raceId = id;
  else if (type === 'background') builderState.backgroundId = id;
  document.querySelectorAll('.builder-option[data-type="' + type + '"]').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  if (type === 'class' && builderState.step === 4) applyStandardArrayByClass();
}

function goToBuilderStep(step) {
  builderState.step = step;
  document.querySelectorAll('.builder-step').forEach(el => el.classList.add('hidden'));
  document.getElementById('builder-step-' + step).classList.remove('hidden');
  document.querySelectorAll('.builder-steps .step').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step, 10) === step);
  });
  document.getElementById('btn-builder-back').style.display = step === 1 ? 'none' : '';
  document.getElementById('btn-builder-next').style.display = step === 6 ? 'none' : '';
  document.getElementById('btn-builder-complete').classList.toggle('hidden', step !== 6);
  if (step === 4) {
    updateBuilderAbilityUI();
    applyStandardArrayByClass();
  }
  if (step === 6) renderBuilderSummary();
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
  setValue('equipment', [classEq, bgEq].filter(Boolean).join('\n\n'));

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
  html += '<p><strong>Race:</strong> ' + (raceData?.name || '—') + '</p>';
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
  if (builderState.step < 6) goToBuilderStep(builderState.step + 1);
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
      throw new Error(await res.text());
    }
    const data = await res.json();
    state.characterId = data.id;
    state.character = data;
    statusEl.textContent = 'Saved.';
    statusEl.classList.add('saved');
  } catch (err) {
    statusEl.textContent = 'Error: ' + (err.message || 'Could not save');
    statusEl.classList.add('error');
  }
}

document.getElementById('btn-save')?.addEventListener('click', saveCharacter);

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
      listEl.innerHTML = '<li class="char-list-empty">No saved characters</li>';
    } else {
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

document.getElementById('btn-load')?.addEventListener('click', async () => {
  await renderCharacterList();
  document.getElementById('load-modal').classList.remove('hidden');
});

async function loadCharacter(id) {
  try {
    const res = await fetch(API_BASE + '/api/characters/' + encodeURIComponent(id), API_CREDENTIALS);
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
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

document.getElementById('btn-feature-choices')?.addEventListener('click', () => {
  const pending = getPendingFeatureChoices();
  const listEl = document.getElementById('feature-choices-list');
  listEl.innerHTML = '';
  if (pending.length === 0) {
    listEl.innerHTML = '<p class="feature-choices-empty">No feature choices required for your current race, class, and level.</p>';
  } else {
    pending.forEach(({ key, prompt, featureLabel, options }) => {
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
        state.featureChoices[key] = sel.value || undefined;
        if (!sel.value) delete state.featureChoices[key];
        updateAutoFeatures();
      });
      block.innerHTML = '<label class="feature-choice-label">' + escapeHtml(featureLabel || prompt) + '</label>';
      block.appendChild(sel);
      listEl.appendChild(block);
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

/* ========== Reference Database (Open5e API – no new tabs, no credentials) ========== */
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
    return list;
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
    detailEl.innerHTML = '<h4>' + escapeHtml(item.title) + '</h4>' +
      '<div class="ref-desc">' + escapeHtml(item.content || '') + '</div>';
  }
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
}

populateSelects();
toggleCustomInputs();
updateBanner();

['race', 'class', 'background'].forEach(field => {
  const sel = document.getElementById(field);
  if (!sel) return;
  sel.addEventListener('change', () => {
    toggleCustomInputs();
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

updateModifiers();
checkAuth();

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
  updateAdminPanelVisibility();
});
document.getElementById('admin-back-to-sheet')?.addEventListener('click', (e) => {
  e.preventDefault();
  location.hash = '';
  updateAdminPanelVisibility();
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
