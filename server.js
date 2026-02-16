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

// Fetch all 5e spells from Open5e API (cached)
let spellsCache = null;

async function fetchAllSpells() {
  if (spellsCache) return spellsCache;
  const all = [];
  let url = 'https://api.open5e.com/spells/?limit=500';
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch spells');
    const data = await res.json();
    const level4OrLower = (data.results || []).filter(s => {
      const lvl = s.level_int ?? (s.level === 'Cantrip' ? 0 : parseInt(String(s.level || '').replace(/\D/g, ''), 10));
      return !isNaN(lvl) && lvl <= 4;
    });
    all.push(...level4OrLower);
    url = data.next || null;
  }
  spellsCache = all;
  return all;
}

app.get('/api/spells', async (req, res) => {
  try {
    const spells = await fetchAllSpells();
    const mapped = spells
      .map(s => ({
        name: s.name,
        level: s.level_int ?? (s.level === 'Cantrip' ? 0 : parseInt(String(s.level).replace(/\D/g, ''), 10) || 0),
        school: (s.school || '').charAt(0).toUpperCase() + (s.school || '').slice(1).toLowerCase(),
        classes: (s.spell_lists || []).length ? s.spell_lists : (s.dnd_class || '').split(',').map(c => c.trim().toLowerCase()).filter(Boolean),
        casting_time: s.casting_time || '',
        range: s.range || '',
        components: s.components || '',
        duration: s.duration || '',
        concentration: !!(s.concentration === 'yes' || s.requires_concentration),
        desc: [s.desc, s.higher_level].filter(Boolean).join('\n\n')
      }))
      .filter(s => s.level <= 4);
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch spells' });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
