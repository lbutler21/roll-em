const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'characters.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dice-proj-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
}

function readUsers() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
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

// ---------- Auth ----------
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Not logged in' });
}

app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.userId) {
    const users = readUsers();
    const user = users.find(u => u.id === req.session.userId);
    if (user) return res.json({ id: user.id, username: user.username });
  }
  res.json(null);
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password } = req.body || {};
    const u = (username || '').trim().toLowerCase();
    const p = password == null ? '' : String(password);
    if (!u || u.length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters' });
    if (!p || p.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const users = readUsers();
    if (users.some(usr => (usr.username || '').toLowerCase() === u)) return res.status(409).json({ error: 'Username already taken' });
    const id = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    const hash = bcrypt.hashSync(p, 10);
    users.push({ id, username: u, passwordHash: hash, createdAt: new Date().toISOString() });
    writeUsers(users);
    req.session.userId = id;
    req.session.username = u;
    res.status(201).json({ id, username: u });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    const u = (username || '').trim().toLowerCase();
    const p = password == null ? '' : String(password);
    if (!u || !p) return res.status(400).json({ error: 'Username and password required' });
    const users = readUsers();
    const user = users.find(usr => (usr.username || '').toLowerCase() === u);
    if (!user || !bcrypt.compareSync(p, user.passwordHash || '')) return res.status(401).json({ error: 'Invalid username or password' });
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {});
  res.json({ ok: true });
});

// Admin backdoor: only exists when ADMIN_BACKDOOR_SECRET is set. Not linked in UI.
// Use by visiting the app with hash #backdoor and entering the secret, or POST from console.
app.post('/api/auth/backdoor', (req, res) => {
  const secret = process.env.ADMIN_BACKDOOR_SECRET;
  if (!secret) return res.status(404).json({ error: 'Not available' });
  const provided = (req.body && req.body.secret) ? String(req.body.secret) : '';
  if (provided !== secret) return res.status(401).json({ error: 'Invalid' });
  req.session.userId = 'admin';
  req.session.username = 'admin';
  res.json({ id: 'admin', username: 'admin' });
});

// ---------- Characters (require login; scoped to user) ----------
app.get('/api/characters', requireAuth, (req, res) => {
  try {
    const characters = readCharacters();
    const mine = characters.filter(c => c.userId === req.session.userId);
    const list = mine.map(c => ({
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

app.get('/api/characters/:id', requireAuth, (req, res) => {
  try {
    const characters = readCharacters();
    const c = characters.find(x => x.id === req.params.id && x.userId === req.session.userId);
    if (!c) return res.status(404).json({ error: 'Character not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/characters', requireAuth, (req, res) => {
  try {
    const characters = readCharacters();
    const body = { ...getDefaultCharacter(), ...req.body };
    body.id = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    body.userId = req.session.userId;
    body.createdAt = new Date().toISOString();
    body.updatedAt = body.createdAt;
    characters.push(body);
    writeCharacters(characters);
    res.status(201).json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/characters/:id', requireAuth, (req, res) => {
  try {
    const characters = readCharacters();
    const idx = characters.findIndex(x => x.id === req.params.id && x.userId === req.session.userId);
    if (idx === -1) return res.status(404).json({ error: 'Character not found' });
    const updated = { ...characters[idx], ...req.body, id: req.params.id, userId: req.session.userId, updatedAt: new Date().toISOString() };
    characters[idx] = updated;
    writeCharacters(characters);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/characters/:id', requireAuth, (req, res) => {
  try {
    let characters = readCharacters();
    const idx = characters.findIndex(x => x.id === req.params.id && x.userId === req.session.userId);
    if (idx === -1) return res.status(404).json({ error: 'Character not found' });
    characters.splice(idx, 1);
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
