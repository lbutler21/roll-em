const API_BASE = '';

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
  character: null
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

  return {
    id: state.characterId,
    name: getValue('name'),
    class: getValue('class'),
    level: parseInt(getValue('level'), 10) || 1,
    race: getValue('race'),
    background: getValue('background'),
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
    featuresTraits: getValue('featuresTraits'),
    notes: getValue('notes')
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

function loadCharacterIntoForm(data) {
  if (!data) return;
  setValue('name', data.name);
  setValue('class', data.class);
  setValue('level', data.level);
  setValue('race', data.race);
  setValue('background', data.background);
  setValue('alignment', data.alignment);
  setValue('playerName', data.playerName);
  setValue('experiencePoints', data.experiencePoints);
  setValue('inspiration', data.inspiration);
  setValue('proficiencyBonus', data.proficiencyBonus);

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
  setValue('featuresTraits', data.featuresTraits ?? '');
  setValue('notes', data.notes ?? '');

  state.characterId = data.id || null;
  state.character = data;
  updateModifiers();
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

document.getElementById('btn-new')?.addEventListener('click', () => {
  state.characterId = null;
  loadCharacterIntoForm({
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    savingThrows: {},
    skills: {},
    deathSaves: { successes: 0, failures: 0 }
  });
  setValue('level', 1);
  setValue('proficiencyBonus', 2);
  setValue('armorClass', 10);
  setValue('speed', 30);
  setValue('hitPointMax', 10);
  setValue('hitPointCurrent', 10);
  setValue('hitPointTemp', 0);
  setValue('hitDice', '1d8');
  setValue('hitDiceTotal', '1');
  setValue('deathSuccesses', 0);
  setValue('deathFailures', 0);
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-status').className = 'save-status';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(API_BASE + '/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    if (!res.ok) throw new Error(await res.text());
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

document.getElementById('btn-load')?.addEventListener('click', async () => {
  const listEl = document.getElementById('character-list');
  listEl.innerHTML = '';
  try {
    const res = await fetch(API_BASE + '/api/characters');
    if (!res.ok) throw new Error('Failed to load list');
    const list = await res.json();
    if (list.length === 0) {
      listEl.innerHTML = '<li style="cursor:default">No saved characters</li>';
    } else {
      list.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${c.name || 'Unnamed'}</span><span class="char-level">${c.class || '—'} ${c.level || 1}</span>`;
        li.addEventListener('click', () => loadCharacter(c.id));
        listEl.appendChild(li);
      });
    }
    document.getElementById('load-modal').classList.remove('hidden');
  } catch (err) {
    listEl.innerHTML = '<li style="cursor:default;color:var(--danger)">Could not load list. Is the server running?</li>';
    document.getElementById('load-modal').classList.remove('hidden');
  }
});

async function loadCharacter(id) {
  try {
    const res = await fetch(API_BASE + '/api/characters/' + encodeURIComponent(id));
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

updateModifiers();
