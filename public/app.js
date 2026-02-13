const API_BASE = '';

function getDisplayName(selectId, customId) {
  const sel = document.getElementById(selectId);
  const custom = document.getElementById(customId);
  const id = sel && sel.value ? sel.value.trim() : '';
  if (id === 'other' && custom) return (custom.value || '').trim();
  const data = selectId === 'race' ? RACE_OPTIONS[id] : selectId === 'class' ? CLASS_OPTIONS[id] : BACKGROUND_OPTIONS[id];
  return data ? data.name : '';
}

function updateAutoFeatures() {
  const raceId = getValue('race') || '';
  const classId = getValue('class') || '';
  const bgId = getValue('background') || '';
  const charLevel = Math.min(20, Math.max(1, parseInt(getValue('level'), 10) || 1));
  const parts = [];
  const raceData = RACE_OPTIONS[raceId];
  if (raceData && raceData.features) parts.push('[Race: ' + raceData.name + ']\n' + raceData.features);
  const classData = CLASS_OPTIONS[classId];
  if (classData && classData.featuresByLevel && Object.keys(classData.featuresByLevel).length > 0) {
    const levelParts = [];
    for (let lvl = 1; lvl <= charLevel; lvl++) {
      const txt = classData.featuresByLevel[lvl];
      if (txt && txt !== '—') levelParts.push('Level ' + lvl + ': ' + txt.replace(/\n/g, ', '));
    }
    if (levelParts.length) parts.push('[Class: ' + classData.name + ']\n' + levelParts.join('\n'));
  } else if (classData && classData.features) {
    parts.push('[Class: ' + classData.name + ']\n' + classData.features);
  }
  const bgData = BACKGROUND_OPTIONS[bgId];
  if (bgData && bgData.features) parts.push('[Background: ' + bgData.name + ']\n' + bgData.features);
  const el = document.getElementById('featuresAuto');
  if (el) el.textContent = parts.length ? parts.join('\n\n') : '';
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
  setValue('notes', data.notes ?? '');
  toggleCustomInputs();
  updateAutoFeatures();

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

document.getElementById('btn-new')?.addEventListener('click', () => {
  state.characterId = null;
  loadCharacterIntoForm({
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

['race', 'class', 'background'].forEach(field => {
  const sel = document.getElementById(field);
  if (!sel) return;
  sel.addEventListener('change', () => {
    toggleCustomInputs();
    updateAutoFeatures();
    if (field === 'class') {
      const classId = getValue('class') || '';
      const data = CLASS_OPTIONS[classId];
      if (data && data.hitDice) setValue('hitDice', data.hitDice);
    }
  });
});

updateModifiers();
