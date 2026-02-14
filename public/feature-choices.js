// Feature choices at certain levels (5e D&D)

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
