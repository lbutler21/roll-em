// Feature choices at certain levels (2014 5e D&D)

const FEATURE_CHOICES = {
  draconicAncestry: {
    source: 'race',
    sourceId: 'dragonborn',
    level: 1,
    featureLabel: 'Draconic Ancestry',
    prompt: 'Choose your Draconic Ancestry',
    options: [
      { id: 'black', name: 'Black Dragon', damageType: 'Acid', resistance: 'Acid', breathWeapon: '5 by 30 ft. line (Dex. save)' },
      { id: 'blue', name: 'Blue Dragon', damageType: 'Lightning', resistance: 'Lightning', breathWeapon: '5 by 30 ft. line (Dex. save)' },
      { id: 'brass', name: 'Brass Dragon', damageType: 'Fire', resistance: 'Fire', breathWeapon: '5 by 30 ft. line (Dex. save)' },
      { id: 'bronze', name: 'Bronze Dragon', damageType: 'Lightning', resistance: 'Lightning', breathWeapon: '5 by 30 ft. line (Dex. save)' },
      { id: 'copper', name: 'Copper Dragon', damageType: 'Acid', resistance: 'Acid', breathWeapon: '5 by 30 ft. line (Dex. save)' },
      { id: 'gold', name: 'Gold Dragon', damageType: 'Fire', resistance: 'Fire', breathWeapon: '15 ft. cone (Dex. save)' },
      { id: 'green', name: 'Green Dragon', damageType: 'Poison', resistance: 'Poison', breathWeapon: '15 ft. cone (Con. save)' },
      { id: 'red', name: 'Red Dragon', damageType: 'Fire', resistance: 'Fire', breathWeapon: '15 ft. cone (Dex. save)' },
      { id: 'silver', name: 'Silver Dragon', damageType: 'Cold', resistance: 'Cold', breathWeapon: '15 ft. cone (Con. save)' },
      { id: 'white', name: 'White Dragon', damageType: 'Cold', resistance: 'Cold', breathWeapon: '15 ft. cone (Con. save)' }
    ]
  },
  fightingStyle: {
    source: 'class',
    sourceIds: ['fighter', 'ranger', 'paladin'],
    level: 1,
    featureLabel: 'Fighting Style',
    prompt: 'Choose a Fighting Style',
    options: [
      { id: 'archery', name: 'Archery', desc: '+2 bonus to attack rolls you make with ranged weapons' },
      { id: 'defense', name: 'Defense', desc: '+1 AC while wearing armor' },
      { id: 'dueling', name: 'Dueling', desc: '+2 damage when wielding a melee weapon in one hand and no other weapons' },
      { id: 'greatWeaponFighting', name: 'Great Weapon Fighting', desc: 'Reroll 1s and 2s on damage dice for two-handed or versatile melee weapons' },
      { id: 'protection', name: 'Protection', desc: 'Use reaction to impose disadvantage when a creature you can see attacks an ally within 5 ft.' },
      { id: 'twoWeaponFighting', name: 'Two-Weapon Fighting', desc: 'Add ability modifier to damage of the second attack when two-weapon fighting' }
    ]
  },
  primalPath: {
    source: 'class',
    sourceId: 'barbarian',
    level: 3,
    featureLabel: 'Primal Path',
    prompt: 'Choose your Primal Path',
    options: [
      { id: 'berserker', name: 'Path of the Berserker', desc: 'Frenzy: bonus action attack while raging; exhaustion after' },
      { id: 'totem', name: 'Path of the Totem Warrior', desc: 'Totem spirit grants benefits based on animal chosen' }
    ]
  },
  bardCollege: {
    source: 'class',
    sourceId: 'bard',
    level: 3,
    featureLabel: 'Bard College',
    prompt: 'Choose a Bard College',
    options: [
      { id: 'lore', name: 'College of Lore', desc: 'Additional proficiencies, Cutting Words, Bonus Magical Secrets' },
      { id: 'valor', name: 'College of Valor', desc: 'Combat inspiration, Extra Attack, medium armor and shields' }
    ]
  },
  divineDomain: {
    source: 'class',
    sourceId: 'cleric',
    level: 1,
    featureLabel: 'Divine Domain',
    prompt: 'Choose a Divine Domain',
    options: [
      { id: 'life', name: 'Life Domain', desc: 'Bonus healing, domain spells, heavy armor' },
      { id: 'light', name: 'Light Domain', desc: 'Bonus cantrip, domain spells, Warding Flare' },
      { id: 'knowledge', name: 'Knowledge Domain', desc: 'Bonus proficiencies, domain spells' },
      { id: 'trickery', name: 'Trickery Domain', desc: 'Blessing of the Trickster, domain spells' },
      { id: 'war', name: 'War Domain', desc: 'Bonus proficiencies, War Priest, domain spells' }
    ]
  },
  druidCircle: {
    source: 'class',
    sourceId: 'druid',
    level: 2,
    featureLabel: 'Druid Circle',
    prompt: 'Choose a Druid Circle',
    options: [
      { id: 'land', name: 'Circle of the Land', desc: 'Bonus cantrip, Natural Recovery, Circle Spells' },
      { id: 'moon', name: 'Circle of the Moon', desc: 'Combat Wild Shape, Primal Strike' }
    ]
  },
  monasticTradition: {
    source: 'class',
    sourceId: 'monk',
    level: 3,
    featureLabel: 'Monastic Tradition',
    prompt: 'Choose a Monastic Tradition',
    options: [
      { id: 'openHand', name: 'Way of the Open Hand', desc: 'Open Hand Technique, Wholeness of Body' },
      { id: 'shadow', name: 'Way of Shadow', desc: 'Shadow Arts, Shadow Step' },
      { id: 'elements', name: 'Way of the Four Elements', desc: 'Disciple of the Elements, elemental disciplines' }
    ]
  },
  sacredOath: {
    source: 'class',
    sourceId: 'paladin',
    level: 3,
    featureLabel: 'Sacred Oath',
    prompt: 'Choose a Sacred Oath',
    options: [
      { id: 'devotion', name: 'Oath of Devotion', desc: 'Tenets of Devotion, Channel Divinity, Sacred Weapon' },
      { id: 'ancients', name: 'Oath of the Ancients', desc: 'Tenets of the Ancients, Channel Divinity' },
      { id: 'vengeance', name: 'Oath of Vengeance', desc: 'Tenets of Vengeance, Channel Divinity, Vow of Enmity' }
    ]
  },
  rangerArchetype: {
    source: 'class',
    sourceId: 'ranger',
    level: 3,
    featureLabel: 'Ranger Archetype',
    prompt: 'Choose a Ranger Archetype',
    options: [
      { id: 'hunter', name: 'Hunter', desc: 'Hunter\'s Prey, Defensive Tactics' },
      { id: 'beastMaster', name: 'Beast Master', desc: 'Ranger\'s Companion' }
    ]
  },
  roguishArchetype: {
    source: 'class',
    sourceId: 'rogue',
    level: 3,
    featureLabel: 'Roguish Archetype',
    prompt: 'Choose a Roguish Archetype',
    options: [
      { id: 'thief', name: 'Thief', desc: 'Fast Hands, Second-Story Work' },
      { id: 'assassin', name: 'Assassin', desc: 'Assassinate, Infiltration Expertise' },
      { id: 'arcaneTrickster', name: 'Arcane Trickster', desc: 'Spellcasting, Mage Hand Legerdemain' }
    ]
  },
  sorcerousOrigin: {
    source: 'class',
    sourceId: 'sorcerer',
    level: 1,
    featureLabel: 'Sorcerous Origin',
    prompt: 'Choose a Sorcerous Origin',
    options: [
      { id: 'draconic', name: 'Draconic Bloodline', desc: 'Dragon Ancestor, Draconic Resilience' },
      { id: 'wildMagic', name: 'Wild Magic', desc: 'Wild Magic Surge, Tides of Chaos' }
    ]
  },
  otherworldlyPatron: {
    source: 'class',
    sourceId: 'warlock',
    level: 1,
    featureLabel: 'Otherworldly Patron',
    prompt: 'Choose your Otherworldly Patron',
    options: [
      { id: 'archfey', name: 'The Archfey', desc: 'Fey Presence, patron spells' },
      { id: 'fiend', name: 'The Fiend', desc: 'Dark One\'s Blessing, patron spells' },
      { id: 'greatOldOne', name: 'The Great Old One', desc: 'Awakened Mind, patron spells' }
    ]
  },
  artificerSpecialist: {
    source: 'class',
    sourceId: 'artificer',
    level: 3,
    featureLabel: 'Artificer Specialist',
    prompt: 'Choose an Artificer Specialist',
    options: [
      { id: 'alchemist', name: 'Alchemist', desc: 'Alchemical formulae, Experimental Elixir' },
      { id: 'artillerist', name: 'Artillerist', desc: 'Eldritch Cannon' },
      { id: 'battleSmith', name: 'Battle Smith', desc: 'Battle Ready, Steel Defender' }
    ]
  },
  arcaneTradition: {
    source: 'class',
    sourceId: 'wizard',
    level: 2,
    featureLabel: 'Arcane Tradition',
    prompt: 'Choose an Arcane Tradition',
    options: [
      { id: 'evocation', name: 'School of Evocation', desc: 'Evocation Savant, Sculpt Spells' },
      { id: 'abjuration', name: 'School of Abjuration', desc: 'Abjuration Savant, Arcane Ward' },
      { id: 'divination', name: 'School of Divination', desc: 'Divination Savant, Portent' },
      { id: 'illusion', name: 'School of Illusion', desc: 'Illusion Savant, Improved Minor Illusion' }
    ]
  }
};

// Maps placeholder feature strings to choice keys (for class-specific: pass classId to getSubclassChoiceKey)
const PLACEHOLDER_TO_CHOICE = {
  'Path feature': 'primalPath',
  'College feature': 'bardCollege',
  'Divine Domain feature': 'divineDomain',
  'Druid Circle feature': 'druidCircle',
  'Oath feature': 'sacredOath',
  'Origin feature': 'sorcerousOrigin',
  'Patron feature': 'otherworldlyPatron',
  'Specialist feature': 'artificerSpecialist',
  'Artificer Specialist': 'artificerSpecialist'
};
const PLACEHOLDER_BY_CLASS = {
  'Archetype feature': { ranger: 'rangerArchetype', rogue: 'roguishArchetype' },
  'Tradition feature': { monk: 'monasticTradition', wizard: 'arcaneTradition' }
};
function getSubclassChoiceKey(placeholder, classId) {
  if (PLACEHOLDER_TO_CHOICE[placeholder]) return PLACEHOLDER_TO_CHOICE[placeholder];
  const byClass = PLACEHOLDER_BY_CLASS[placeholder];
  return byClass && classId ? byClass[classId] : null;
}

// Specific features per subclass per level (replaces generic placeholders)
// Format: choiceKey -> optionId -> level -> "Feature1\nFeature2"
const SUBCLASS_FEATURES = {
  primalPath: {
    berserker: {
      3: 'Frenzy',
      6: 'Mindless Rage',
      10: 'Intimidating Presence',
      14: 'Retaliation'
    },
    totem: {
      3: 'Spirit Seeker\nTotem Spirit',
      6: 'Aspect of the Beast',
      10: 'Spirit Walker',
      14: 'Totemic Attunement'
    }
  },
  bardCollege: {
    lore: {
      3: 'Bonus Proficiencies\nCutting Words',
      6: 'Additional Magical Secrets',
      14: 'Peerless Skill'
    },
    valor: {
      3: 'Bonus Proficiencies\nCombat Inspiration',
      6: 'Extra Attack',
      14: 'Battle Magic'
    }
  },
  divineDomain: {
    life: { 1: 'Domain Spells\nDisciple of Life', 2: 'Channel Divinity: Preserve Life', 6: 'Blessed Healer', 8: 'Divine Strike', 17: 'Supreme Healing' },
    light: { 1: 'Domain Spells\nWarding Flare', 2: 'Channel Divinity: Radiance of the Dawn', 6: 'Improved Flare', 8: 'Potent Spellcasting', 17: 'Corona of Light' },
    knowledge: { 1: 'Domain Spells\nBlessings of Knowledge', 2: 'Channel Divinity: Knowledge of the Ages', 6: 'Channel Divinity: Read Thoughts', 8: 'Potent Spellcasting', 17: 'Visions of the Past' },
    trickery: { 1: 'Domain Spells\nBlessing of the Trickster', 2: 'Channel Divinity: Invoke Duplicity', 6: 'Channel Divinity: Cloak of Shadows', 8: 'Divine Strike', 17: 'Improved Duplicity' },
    war: { 1: 'Domain Spells\nWar Priest', 2: 'Channel Divinity: Guided Strike', 6: 'Channel Divinity: War God\'s Blessing', 8: 'Divine Strike', 17: 'Avatar of Battle' }
  },
  druidCircle: {
    land: {
      2: 'Circle Spells\nNatural Recovery',
      6: 'Land\'s Stride',
      10: 'Nature\'s Ward',
      14: 'Nature\'s Sanctuary'
    },
    moon: {
      2: 'Combat Wild Shape\nCircle Forms',
      6: 'Primal Strike',
      10: 'Elemental Wild Shape',
      14: 'Thousand Forms'
    }
  },
  monasticTradition: {
    openHand: {
      3: 'Open Hand Technique',
      6: 'Wholeness of Body',
      11: 'Tranquility',
      17: 'Quivering Palm'
    },
    shadow: {
      3: 'Shadow Arts',
      6: 'Shadow Step',
      11: 'Cloak of Shadows',
      17: 'Opportunist'
    },
    elements: {
      3: 'Disciple of the Elements',
      6: 'Elemental Disciplines',
      11: 'Elemental Attunement',
      17: 'Shape the Flowing River'
    }
  },
  sacredOath: {
    devotion: {
      3: 'Oath Spells\nChannel Divinity\nSacred Weapon',
      7: 'Aura of Devotion',
      15: 'Purity of Spirit',
      20: 'Holy Nimbus'
    },
    ancients: {
      3: 'Oath Spells\nChannel Divinity\nNature\'s Wrath',
      7: 'Aura of Warding',
      15: 'Undying Sentinel',
      20: 'Elder Champion'
    },
    vengeance: {
      3: 'Oath Spells\nChannel Divinity\nVow of Enmity',
      7: 'Relentless Avenger',
      15: 'Soul of Vengeance',
      20: 'Avenging Angel'
    }
  },
  rangerArchetype: {
    hunter: {
      3: 'Hunter\'s Prey',
      7: 'Defensive Tactics',
      11: 'Multiattack',
      15: 'Superior Hunter\'s Defense'
    },
    beastMaster: {
      3: 'Ranger\'s Companion',
      7: 'Exceptional Training',
      11: 'Bestial Fury',
      15: 'Share Spells'
    }
  },
  roguishArchetype: {
    thief: {
      3: 'Fast Hands\nSecond-Story Work',
      9: 'Supreme Sneak',
      13: 'Use Magic Device',
      17: 'Thief\'s Reflexes'
    },
    assassin: {
      3: 'Bonus Proficiencies\nAssassinate',
      9: 'Infiltration Expertise',
      13: 'Impostor',
      17: 'Death Strike'
    },
    arcaneTrickster: {
      3: 'Spellcasting\nMage Hand Legerdemain',
      9: 'Magical Ambush',
      13: 'Versatile Trickster',
      17: 'Spell Thief'
    }
  },
  sorcerousOrigin: {
    draconic: {
      1: 'Dragon Ancestor\nDraconic Resilience',
      6: 'Elemental Affinity',
      14: 'Dragon Wings',
      18: 'Draconic Presence'
    },
    wildMagic: {
      1: 'Wild Magic Surge\nTides of Chaos',
      6: 'Bend Luck',
      14: 'Controlled Chaos',
      18: 'Spell Bombardment'
    }
  },
  otherworldlyPatron: {
    archfey: {
      1: 'Expanded Spell List\nFey Presence',
      6: 'Misty Escape',
      10: 'Beguiling Defenses',
      14: 'Dark Delirium'
    },
    fiend: {
      1: 'Expanded Spell List\nDark One\'s Blessing',
      6: 'Dark One\'s Own Luck',
      10: 'Fiendish Resilience',
      14: 'Hurl Through Hell'
    },
    greatOldOne: {
      1: 'Expanded Spell List\nAwakened Mind',
      6: 'Entropic Ward',
      10: 'Thought Shield',
      14: 'Create Thrall'
    }
  },
  artificerSpecialist: {
    alchemist: {
      3: 'Tool Proficiency\nExperimental Elixir',
      6: 'Alchemical Savant',
      10: 'Restorative Reagents',
      14: 'Chemical Mastery',
      18: 'Chemical Mastery'
    },
    artillerist: {
      3: 'Tool Proficiency\nEldritch Cannon',
      6: 'Arcane Firearm',
      10: 'Explosive Cannon',
      14: 'Fortified Position',
      18: 'Fortified Position'
    },
    battleSmith: {
      3: 'Tool Proficiency\nBattle Ready\nSteel Defender',
      6: 'Extra Attack',
      10: 'Arcane Jolt',
      14: 'Improved Defender',
      18: 'Improved Defender'
    }
  },
  arcaneTradition: {
    evocation: {
      2: 'Evocation Savant\nSculpt Spells',
      6: 'Potent Cantrip',
      10: 'Empowered Evocation',
      14: 'Overchannel'
    },
    abjuration: {
      2: 'Abjuration Savant\nArcane Ward',
      6: 'Projected Ward',
      10: 'Improved Abjuration',
      14: 'Spell Resistance'
    },
    divination: {
      2: 'Divination Savant\nPortent',
      6: 'Expert Divination',
      10: 'The Third Eye',
      14: 'Greater Portent'
    },
    illusion: {
      2: 'Illusion Savant\nImproved Minor Illusion',
      6: 'Malleable Illusions',
      10: 'Illusory Self',
      14: 'Illusory Reality'
    }
  }
};
