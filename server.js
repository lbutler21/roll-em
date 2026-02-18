const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'characters.json');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
}

function readCharacters() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeCharacters(characters) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(characters, null, 2));
}

function getDefaultCharacter() {
  return {
    id: null,
    name: '',
    class: '',
    level: 1,
    race: '',
    background: '',
    alignment: '',
    playerName: '',
    experiencePoints: 0,
    inspiration: 0,
    proficiencyBonus: 2,
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    savingThrows: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
    skills: {
      acrobatics: false, animalHandling: false, arcana: false, athletics: false,
      deception: false, history: false, insight: false, intimidation: false,
      investigation: false, medicine: false, nature: false, perception: false,
      performance: false, persuasion: false, religion: false, sleightOfHand: false,
      stealth: false, survival: false
    },
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitPointMax: 10,
    hitPointCurrent: 10,
    hitPointTemp: 0,
    hitDice: '1d8',
    hitDiceTotal: '1',
    deathSaves: { successes: 0, failures: 0 },
    attacks: [],
    equipment: '',
    featuresTraits: '',
    customFeatures: '',
    featureChoices: {},
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// List all characters
app.get('/api/characters', (req, res) => {
  try {
    const characters = readCharacters();
    const list = characters.map(c => ({
      id: c.id,
      name: c.name || 'Unnamed',
      class: c.class,
      level: c.level,
      updatedAt: c.updatedAt
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one character
app.get('/api/characters/:id', (req, res) => {
  try {
    const characters = readCharacters();
    const c = characters.find(x => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Character not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create character
app.post('/api/characters', (req, res) => {
  try {
    const characters = readCharacters();
    const body = { ...getDefaultCharacter(), ...req.body };
    body.id = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    body.createdAt = new Date().toISOString();
    body.updatedAt = body.createdAt;
    characters.push(body);
    writeCharacters(characters);
    res.status(201).json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update character
app.put('/api/characters/:id', (req, res) => {
  try {
    const characters = readCharacters();
    const idx = characters.findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Character not found' });
    const updated = { ...characters[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    characters[idx] = updated;
    writeCharacters(characters);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete character
app.delete('/api/characters/:id', (req, res) => {
  try {
    let characters = readCharacters();
    const len = characters.length;
    characters = characters.filter(x => x.id !== req.params.id);
    if (characters.length === len) return res.status(404).json({ error: 'Character not found' });
    writeCharacters(characters);
    res.json({ deleted: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- Open5e API (no credentials required) ----------
// https://api.open5e.com/ - 5e SRD & OGL content

let spellsCache = null;
let equipmentCache = null;
let magicitemsCache = null;
let rulesCache = null;

async function fetchAllSpells() {
  if (spellsCache) return spellsCache;
  const all = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await fetch(`https://api.open5e.com/v1/spells/?limit=500&page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch spells');
    const data = await res.json();
    const results = data.results || [];
    all.push(...results);
    hasMore = !!data.next && results.length === 500;
    page++;
  }
  spellsCache = all;
  return all;
}

async function fetchAllEquipment() {
  if (equipmentCache) return equipmentCache;
  const list = [];
  const [weaponsRes, armorRes] = await Promise.all([
    fetch('https://api.open5e.com/v2/weapons/?limit=500'),
    fetch('https://api.open5e.com/v2/armor/?limit=500')
  ]);
  if (!weaponsRes.ok || !armorRes.ok) throw new Error('Failed to fetch equipment');
  const weapons = (await weaponsRes.json()).results || [];
  const armor = (await armorRes.json()).results || [];
  weapons.forEach(w => {
    const dmgType = w.damage_type && (typeof w.damage_type === 'object' ? w.damage_type.name : w.damage_type);
    const dmg = w.damage_dice && dmgType ? ` ${w.damage_dice} ${dmgType}` : '';
    const props = (w.properties || []).map(p => p.property?.name).filter(Boolean).join(', ');
    list.push({
      name: w.name,
      type: 'Weapon' + (w.is_simple ? ' (Simple)' : ' (Martial)'),
      desc: (props ? props + '. ' : '') + (dmg ? dmg.trim() : '') || 'Weapon.'
    });
  });
  armor.forEach(a => {
    list.push({
      name: a.name,
      type: (a.category || 'Armor').charAt(0).toUpperCase() + (a.category || 'armor').slice(1) + ' Armor',
      desc: (a.ac_display ? `AC ${a.ac_display}. ` : '') + (a.strength_score_required ? `Str ${a.strength_score_required} required. ` : '') + (a.grants_stealth_disadvantage ? 'Stealth disadvantage.' : '')
    });
  });
  equipmentCache = list;
  return list;
}

async function fetchAllMagicItems() {
  if (magicitemsCache) return magicitemsCache;
  const all = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await fetch(`https://api.open5e.com/v1/magicitems/?limit=500&page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch magic items');
    const data = await res.json();
    const results = data.results || [];
    all.push(...results.map(m => ({
      name: m.name,
      type: m.type || 'Magic Item',
      rarity: m.rarity || '',
      desc: m.desc || ''
    })));
    hasMore = !!data.next && results.length === 500;
    page++;
  }
  magicitemsCache = all;
  return all;
}

async function fetchAllRules() {
  if (rulesCache) return rulesCache;
  const all = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await fetch(`https://api.open5e.com/v1/sections/?limit=100&page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch rules');
    const data = await res.json();
    const results = data.results || [];
    all.push(...results.map(r => ({
      title: r.name,
      content: r.desc || ''
    })));
    hasMore = !!data.next && results.length === 100;
    page++;
  }
  rulesCache = all;
  return all;
}

app.get('/api/spells', async (req, res) => {
  try {
    const spells = await fetchAllSpells();
    const mapped = spells.map(s => ({
      name: s.name,
      level: s.level_int ?? (s.level === 'Cantrip' ? 0 : parseInt(String(s.level || '').replace(/\D/g, ''), 10) || 0),
      school: (s.school || '').charAt(0).toUpperCase() + (s.school || '').slice(1).toLowerCase(),
      classes: (s.spell_lists || []).length ? s.spell_lists : (s.dnd_class || '').split(',').map(c => c.trim().toLowerCase()).filter(Boolean),
      casting_time: s.casting_time || '',
      range: s.range || '',
      components: s.components || '',
      duration: s.duration || '',
      concentration: !!(s.concentration === 'yes' || s.requires_concentration),
      desc: [s.desc, s.higher_level].filter(Boolean).join('\n\n')
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch spells' });
  }
});

app.get('/api/equipment', async (req, res) => {
  try {
    res.json(await fetchAllEquipment());
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch equipment' });
  }
});

app.get('/api/magicitems', async (req, res) => {
  try {
    res.json(await fetchAllMagicItems());
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch magic items' });
  }
});

app.get('/api/rules', async (req, res) => {
  try {
    res.json(await fetchAllRules());
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch rules' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
