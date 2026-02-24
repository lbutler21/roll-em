// Feature choices at certain levels (2014 5e D&D)

// Ability Score Improvement: one +2 or two +1s (scores cannot exceed 20)
const ASI_OPTIONS = [
  { id: 'str2', name: 'Strength +2' },
  { id: 'dex2', name: 'Dexterity +2' },
  { id: 'con2', name: 'Constitution +2' },
  { id: 'int2', name: 'Intelligence +2' },
  { id: 'wis2', name: 'Wisdom +2' },
  { id: 'cha2', name: 'Charisma +2' },
  { id: 'str1dex1', name: 'Strength +1, Dexterity +1' },
  { id: 'str1con1', name: 'Strength +1, Constitution +1' },
  { id: 'str1int1', name: 'Strength +1, Intelligence +1' },
  { id: 'str1wis1', name: 'Strength +1, Wisdom +1' },
  { id: 'str1cha1', name: 'Strength +1, Charisma +1' },
  { id: 'dex1con1', name: 'Dexterity +1, Constitution +1' },
  { id: 'dex1int1', name: 'Dexterity +1, Intelligence +1' },
  { id: 'dex1wis1', name: 'Dexterity +1, Wisdom +1' },
  { id: 'dex1cha1', name: 'Dexterity +1, Charisma +1' },
  { id: 'con1int1', name: 'Constitution +1, Intelligence +1' },
  { id: 'con1wis1', name: 'Constitution +1, Wisdom +1' },
  { id: 'con1cha1', name: 'Constitution +1, Charisma +1' },
  { id: 'int1wis1', name: 'Intelligence +1, Wisdom +1' },
  { id: 'int1cha1', name: 'Intelligence +1, Charisma +1' },
  { id: 'wis1cha1', name: 'Wisdom +1, Charisma +1' }
];

// Skills for pair choices (Expertise, Skill Versatility)
const SKILL_LIST = [
  { id: 'acrobatics', name: 'Acrobatics' }, { id: 'animalHandling', name: 'Animal Handling' }, { id: 'arcana', name: 'Arcana' },
  { id: 'athletics', name: 'Athletics' }, { id: 'deception', name: 'Deception' }, { id: 'history', name: 'History' },
  { id: 'insight', name: 'Insight' }, { id: 'intimidation', name: 'Intimidation' }, { id: 'investigation', name: 'Investigation' },
  { id: 'medicine', name: 'Medicine' }, { id: 'nature', name: 'Nature' }, { id: 'perception', name: 'Perception' },
  { id: 'performance', name: 'Performance' }, { id: 'persuasion', name: 'Persuasion' }, { id: 'religion', name: 'Religion' },
  { id: 'sleightOfHand', name: 'Sleight of Hand' }, { id: 'stealth', name: 'Stealth' }, { id: 'survival', name: 'Survival' }
];
const SKILL_PAIR_OPTIONS = (function () {
  const o = [];
  for (let i = 0; i < SKILL_LIST.length; i++) for (let j = i + 1; j < SKILL_LIST.length; j++) o.push({ id: SKILL_LIST[i].id + '_' + SKILL_LIST[j].id, name: SKILL_LIST[i].name + ' & ' + SKILL_LIST[j].name });
  return o;
})();

// Languages (PHB/SRD)
const LANGUAGE_OPTIONS = [
  { id: 'common', name: 'Common' }, { id: 'dwarvish', name: 'Dwarvish' }, { id: 'elvish', name: 'Elvish' },
  { id: 'giant', name: 'Giant' }, { id: 'gnomish', name: 'Gnomish' }, { id: 'goblin', name: 'Goblin' },
  { id: 'halfling', name: 'Halfling' }, { id: 'orc', name: 'Orc' }, { id: 'abyssal', name: 'Abyssal' },
  { id: 'celestial', name: 'Celestial' }, { id: 'draconic', name: 'Draconic' }, { id: 'deepSpeech', name: 'Deep Speech' },
  { id: 'infernal', name: 'Infernal' }, { id: 'primordial', name: 'Primordial' }, { id: 'sylvan', name: 'Sylvan' },
  { id: 'undercommon', name: 'Undercommon' }
];

// Feats (optional rule; SRD/PHB subset)
const FEAT_OPTIONS = [
  { id: 'none', name: 'None (not using optional rule)' },
  { id: 'alert', name: 'Alert' }, { id: 'athlete', name: 'Athlete' }, { id: 'actor', name: 'Actor' },
  { id: 'charger', name: 'Charger' }, { id: 'crossbowExpert', name: 'Crossbow Expert' }, { id: 'defensiveDuelist', name: 'Defensive Duelist' },
  { id: 'dualWielder', name: 'Dual Wielder' }, { id: 'dungeonDelver', name: 'Dungeon Delver' }, { id: 'durable', name: 'Durable' },
  { id: 'elementalAdept', name: 'Elemental Adept' }, { id: 'grappler', name: 'Grappler' }, { id: 'greatWeaponMaster', name: 'Great Weapon Master' },
  { id: 'healer', name: 'Healer' }, { id: 'heavilyArmored', name: 'Heavily Armored' }, { id: 'heavyArmorMaster', name: 'Heavy Armor Master' },
  { id: 'inspiringLeader', name: 'Inspiring Leader' }, { id: 'keenMind', name: 'Keen Mind' }, { id: 'lightlyArmored', name: 'Lightly Armored' },
  { id: 'linguist', name: 'Linguist' }, { id: 'lucky', name: 'Lucky' }, { id: 'mageSlayer', name: 'Mage Slayer' },
  { id: 'magicInitiate', name: 'Magic Initiate' }, { id: 'martialAdept', name: 'Martial Adept' }, { id: 'mobile', name: 'Mobile' },
  { id: 'mountedCombatant', name: 'Mounted Combatant' }, { id: 'observant', name: 'Observant' }, { id: 'polearmMaster', name: 'Polearm Master' },
  { id: 'resilient', name: 'Resilient' }, { id: 'ritualCaster', name: 'Ritual Caster' }, { id: 'savageAttacker', name: 'Savage Attacker' },
  { id: 'sentinel', name: 'Sentinel' }, { id: 'sharpshooter', name: 'Sharpshooter' }, { id: 'shieldMaster', name: 'Shield Master' },
  { id: 'skulker', name: 'Skulker' }, { id: 'spellSniper', name: 'Spell Sniper' }, { id: 'tavernBrawler', name: 'Tavern Brawler' },
  { id: 'tough', name: 'Tough' }, { id: 'warCaster', name: 'War Caster' }, { id: 'weaponMaster', name: 'Weapon Master' }
];

// Metamagic (Sorcerer)
const METAMAGIC_OPTIONS = [
  { id: 'carefulSpell', name: 'Careful Spell' }, { id: 'distantSpell', name: 'Distant Spell' }, { id: 'empoweredSpell', name: 'Empowered Spell' },
  { id: 'extendedSpell', name: 'Extended Spell' }, { id: 'heightenedSpell', name: 'Heightened Spell' }, { id: 'quickenedSpell', name: 'Quickened Spell' },
  { id: 'subtleSpell', name: 'Subtle Spell' }, { id: 'twinnedSpell', name: 'Twinned Spell' }
];

// Eldritch Invocations (Warlock; same list for all levels – user picks valid per prereqs)
const INVOCATION_OPTIONS = [
  { id: 'agonizingBlast', name: 'Agonizing Blast' }, { id: 'armorOfShadows', name: 'Armor of Shadows' }, { id: 'beastSpeech', name: 'Beast Speech' },
  { id: 'devilsSight', name: "Devil's Sight" }, { id: 'eldritchSight', name: 'Eldritch Sight' }, { id: 'eyesOfTheRuneKeeper', name: "Eyes of the Rune Keeper" },
  { id: 'fiendishVigor', name: 'Fiendish Vigor' }, { id: 'maskOfManyFaces', name: 'Mask of Many Faces' }, { id: 'mistyVisions', name: 'Misty Visions' },
  { id: 'thiefOfFiveFates', name: "Thief of Five Fates" }, { id: 'eldritchSpear', name: 'Eldritch Spear' }, { id: 'bookOfAncientSecrets', name: 'Book of Ancient Secrets' },
  { id: 'voiceOfTheChainMaster', name: "Voice of the Chain Master" }, { id: 'thirstingBlade', name: 'Thirsting Blade' }, { id: 'mireTheMind', name: 'Mire the Mind' },
  { id: 'oneWithShadows', name: 'One with Shadows' }, { id: 'signOfIllOmen', name: "Sign of Ill Omen" }, { id: 'bewitchingWhispers', name: 'Bewitching Whispers' },
  { id: 'dreadfulWord', name: 'Dreadful Word' }, { id: 'ghostlyGaze', name: 'Ghostly Gaze' }, { id: 'trickstersEscape', name: "Trickster's Escape" },
  { id: 'otherworldlyLeap', name: 'Otherworldly Leap' }, { id: 'minionsOfChaos', name: 'Minions of Chaos' }, { id: 'whispersOfTheGrave', name: "Whispers of the Grave" },
  { id: 'ascendantStep', name: 'Ascendant Step' }, { id: 'visionsOfDistantRealms', name: 'Visions of Distant Realms' }, { id: 'witchSight', name: 'Witch Sight' },
  { id: 'chainsOfCarceri', name: 'Chains of Carceri' }
];

const FEATURE_CHOICES = {
  // Ranger – Favored Enemy (level 1)
  favoredEnemy: {
    source: 'class',
    sourceId: 'ranger',
    level: 1,
    featureLabel: 'Favored Enemy',
    prompt: 'Choose a type of enemy (or two humanoid races)',
    options: [
      { id: 'aberrations', name: 'Aberrations' },
      { id: 'beasts', name: 'Beasts' },
      { id: 'celestials', name: 'Celestials' },
      { id: 'constructs', name: 'Constructs' },
      { id: 'dragons', name: 'Dragons' },
      { id: 'elementals', name: 'Elementals' },
      { id: 'fey', name: 'Fey' },
      { id: 'fiends', name: 'Fiends' },
      { id: 'giants', name: 'Giants' },
      { id: 'monstrosities', name: 'Monstrosities' },
      { id: 'oozes', name: 'Oozes' },
      { id: 'plants', name: 'Plants' },
      { id: 'undead', name: 'Undead' },
      { id: 'humanoids', name: 'Two humanoid races (note in sheet)' }
    ]
  },
  favoredEnemy6: {
    source: 'class',
    sourceId: 'ranger',
    level: 6,
    featureLabel: 'Favored Enemy (2nd type)',
    prompt: 'Choose an additional favored enemy type',
    options: [
      { id: 'aberrations', name: 'Aberrations' }, { id: 'beasts', name: 'Beasts' }, { id: 'celestials', name: 'Celestials' },
      { id: 'constructs', name: 'Constructs' }, { id: 'dragons', name: 'Dragons' }, { id: 'elementals', name: 'Elementals' },
      { id: 'fey', name: 'Fey' }, { id: 'fiends', name: 'Fiends' }, { id: 'giants', name: 'Giants' },
      { id: 'monstrosities', name: 'Monstrosities' }, { id: 'oozes', name: 'Oozes' }, { id: 'plants', name: 'Plants' },
      { id: 'undead', name: 'Undead' }, { id: 'humanoids', name: 'Two humanoid races (note in sheet)' }
    ]
  },
  favoredEnemy14: {
    source: 'class',
    sourceId: 'ranger',
    level: 14,
    featureLabel: 'Favored Enemy (3rd type)',
    prompt: 'Choose another favored enemy type',
    options: [
      { id: 'aberrations', name: 'Aberrations' }, { id: 'beasts', name: 'Beasts' }, { id: 'celestials', name: 'Celestials' },
      { id: 'constructs', name: 'Constructs' }, { id: 'dragons', name: 'Dragons' }, { id: 'elementals', name: 'Elementals' },
      { id: 'fey', name: 'Fey' }, { id: 'fiends', name: 'Fiends' }, { id: 'giants', name: 'Giants' },
      { id: 'monstrosities', name: 'Monstrosities' }, { id: 'oozes', name: 'Oozes' }, { id: 'plants', name: 'Plants' },
      { id: 'undead', name: 'Undead' }, { id: 'humanoids', name: 'Two humanoid races (note in sheet)' }
    ]
  },
  // Ranger – Natural Explorer (level 1); additional terrains at 6 and 10
  naturalExplorer: {
    source: 'class',
    sourceId: 'ranger',
    level: 1,
    featureLabel: 'Natural Explorer',
    prompt: 'Choose a favored terrain',
    options: [
      { id: 'arctic', name: 'Arctic' },
      { id: 'coast', name: 'Coast' },
      { id: 'desert', name: 'Desert' },
      { id: 'forest', name: 'Forest' },
      { id: 'grassland', name: 'Grassland' },
      { id: 'mountain', name: 'Mountain' },
      { id: 'swamp', name: 'Swamp' },
      { id: 'underdark', name: 'Underdark' }
    ]
  },
  naturalExplorer6: {
    source: 'class',
    sourceId: 'ranger',
    level: 6,
    featureLabel: 'Natural Explorer (2nd terrain)',
    prompt: 'Choose a second favored terrain',
    options: [
      { id: 'arctic', name: 'Arctic' }, { id: 'coast', name: 'Coast' }, { id: 'desert', name: 'Desert' },
      { id: 'forest', name: 'Forest' }, { id: 'grassland', name: 'Grassland' }, { id: 'mountain', name: 'Mountain' },
      { id: 'swamp', name: 'Swamp' }, { id: 'underdark', name: 'Underdark' }
    ]
  },
  naturalExplorer10: {
    source: 'class',
    sourceId: 'ranger',
    level: 10,
    featureLabel: 'Natural Explorer (3rd terrain)',
    prompt: 'Choose a third favored terrain',
    options: [
      { id: 'arctic', name: 'Arctic' }, { id: 'coast', name: 'Coast' }, { id: 'desert', name: 'Desert' },
      { id: 'forest', name: 'Forest' }, { id: 'grassland', name: 'Grassland' }, { id: 'mountain', name: 'Mountain' },
      { id: 'swamp', name: 'Swamp' }, { id: 'underdark', name: 'Underdark' }
    ]
  },
  // Warlock – Pact Boon (level 3)
  pactBoon: {
    source: 'class',
    sourceId: 'warlock',
    level: 3,
    featureLabel: 'Pact Boon',
    prompt: 'Choose your Pact Boon',
    options: [
      { id: 'blade', name: 'Pact of the Blade', desc: 'Summon a pact weapon' },
      { id: 'chain', name: 'Pact of the Chain', desc: 'Gain a familiar' },
      { id: 'tome', name: 'Pact of the Tome', desc: 'Gain a book of cantrips' }
    ]
  },
  // Barbarian Totem Warrior – animal at 3, 6, 14
  totemAnimal3: {
    source: 'class',
    sourceId: 'barbarian',
    level: 3,
    featureLabel: 'Totem Spirit (3rd level)',
    prompt: 'Choose your totem animal',
    options: [
      { id: 'bear', name: 'Bear', desc: 'Resistance to all damage except psychic while raging' },
      { id: 'eagle', name: 'Eagle', desc: 'Others have disadvantage on opportunity attacks; dash as bonus action' },
      { id: 'wolf', name: 'Wolf', desc: 'Allies have advantage on melee attacks against creatures within 5 ft. of you' }
    ]
  },
  totemAnimal6: {
    source: 'class',
    sourceId: 'barbarian',
    level: 6,
    featureLabel: 'Aspect of the Beast (6th level)',
    prompt: 'Choose totem benefit for 6th level',
    options: [
      { id: 'bear', name: 'Bear' }, { id: 'eagle', name: 'Eagle' }, { id: 'wolf', name: 'Wolf' }
    ]
  },
  totemAnimal14: {
    source: 'class',
    sourceId: 'barbarian',
    level: 14,
    featureLabel: 'Totemic Attunement (14th level)',
    prompt: 'Choose totem benefit for 14th level',
    options: [
      { id: 'bear', name: 'Bear' }, { id: 'eagle', name: 'Eagle' }, { id: 'wolf', name: 'Wolf' }
    ]
  },
  // Druid Circle of the Land – terrain (level 2, Land only)
  landTerrain: {
    source: 'class',
    sourceId: 'druid',
    level: 2,
    featureLabel: 'Circle of the Land – terrain',
    prompt: 'Choose your land terrain (for circle spells)',
    options: [
      { id: 'arctic', name: 'Arctic' }, { id: 'coast', name: 'Coast' }, { id: 'desert', name: 'Desert' },
      { id: 'forest', name: 'Forest' }, { id: 'grassland', name: 'Grassland' }, { id: 'mountain', name: 'Mountain' },
      { id: 'swamp', name: 'Swamp' }, { id: 'underdark', name: 'Underdark' }
    ]
  },
  // Ranger Hunter – choices at 3, 7, 15
  huntersPrey: {
    source: 'class',
    sourceId: 'ranger',
    level: 3,
    featureLabel: "Hunter's Prey",
    prompt: 'Choose one option',
    options: [
      { id: 'colossusSlayer', name: 'Colossus Slayer', desc: 'Extra 1d8 when target below max hp' },
      { id: 'giantKiller', name: 'Giant Killer', desc: 'Reaction attack when Large+ creature hits you' },
      { id: 'hordeBreaker', name: 'Horde Breaker', desc: 'Extra attack on different creature within 5 ft.' }
    ]
  },
  defensiveTactics: {
    source: 'class',
    sourceId: 'ranger',
    level: 7,
    featureLabel: 'Defensive Tactics',
    prompt: 'Choose one option',
    options: [
      { id: 'escapeHorde', name: 'Escape the Horde' },
      { id: 'multiattackDefense', name: 'Multiattack Defense' },
      { id: 'steelWill', name: 'Steel Will' }
    ]
  },
  superiorHuntersDefense: {
    source: 'class',
    sourceId: 'ranger',
    level: 15,
    featureLabel: "Superior Hunter's Defense",
    prompt: 'Choose one option',
    options: [
      { id: 'evasion', name: 'Evasion' },
      { id: 'standAgainstTide', name: 'Stand Against the Tide' },
      { id: 'uncannyDodge', name: 'Uncanny Dodge' }
    ]
  },
  // Human – Extra Language (level 1)
  extraLanguage: {
    source: 'race',
    sourceId: 'human',
    level: 1,
    featureLabel: 'Extra Language',
    prompt: 'Choose one additional language',
    options: LANGUAGE_OPTIONS
  },
  // Human – Bonus Feat (optional rule)
  bonusFeat: {
    source: 'race',
    sourceId: 'human',
    level: 1,
    featureLabel: 'Bonus Feat',
    prompt: 'Choose one feat (optional rule) or None',
    options: FEAT_OPTIONS
  },
  // Half-Elf – Skill Versatility (two skills)
  skillVersatility: {
    source: 'race',
    sourceId: 'halfElf',
    level: 1,
    featureLabel: 'Skill Versatility',
    prompt: 'Choose two skills',
    options: SKILL_PAIR_OPTIONS
  },
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
  martialArchetype: {
    source: 'class',
    sourceId: 'fighter',
    level: 3,
    featureLabel: 'Martial Archetype',
    prompt: 'Choose a Martial Archetype',
    options: [
      { id: 'champion', name: 'Champion', desc: 'Improved Critical, Remarkable Athlete, additional fighting style' },
      { id: 'battleMaster', name: 'Battle Master', desc: 'Combat Superiority, maneuvers, Student of War' },
      { id: 'eldritchKnight', name: 'Eldritch Knight', desc: 'Spellcasting, Weapon Bond, martial and arcane blend' }
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
  },
  // Bard – Expertise (choose two skills at 3 and 10)
  expertiseBard3: {
    source: 'class',
    sourceId: 'bard',
    level: 3,
    featureLabel: 'Expertise (Level 3)',
    prompt: 'Choose two skills for double proficiency',
    options: SKILL_PAIR_OPTIONS
  },
  expertiseBard10: {
    source: 'class',
    sourceId: 'bard',
    level: 10,
    featureLabel: 'Expertise (Level 10)',
    prompt: 'Choose two more skills for double proficiency',
    options: SKILL_PAIR_OPTIONS
  },
  // Rogue – Expertise (choose two skills at 1 and 6)
  expertiseRogue1: {
    source: 'class',
    sourceId: 'rogue',
    level: 1,
    featureLabel: 'Expertise (Level 1)',
    prompt: 'Choose two skills for double proficiency',
    options: SKILL_PAIR_OPTIONS
  },
  expertiseRogue6: {
    source: 'class',
    sourceId: 'rogue',
    level: 6,
    featureLabel: 'Expertise (Level 6)',
    prompt: 'Choose two more skills for double proficiency',
    options: SKILL_PAIR_OPTIONS
  },
  // Sorcerer – Metamagic (2 at 3, +1 at 10, +1 at 17)
  metamagic3_1: {
    source: 'class',
    sourceId: 'sorcerer',
    level: 3,
    featureLabel: 'Metamagic (1st option)',
    prompt: 'Choose first Metamagic option',
    options: METAMAGIC_OPTIONS
  },
  metamagic3_2: {
    source: 'class',
    sourceId: 'sorcerer',
    level: 3,
    featureLabel: 'Metamagic (2nd option)',
    prompt: 'Choose second Metamagic option',
    options: METAMAGIC_OPTIONS
  },
  metamagic10: {
    source: 'class',
    sourceId: 'sorcerer',
    level: 10,
    featureLabel: 'Metamagic (3rd option)',
    prompt: 'Choose another Metamagic option',
    options: METAMAGIC_OPTIONS
  },
  metamagic17: {
    source: 'class',
    sourceId: 'sorcerer',
    level: 17,
    featureLabel: 'Metamagic (4th option)',
    prompt: 'Choose another Metamagic option',
    options: METAMAGIC_OPTIONS
  },
  // Warlock – Eldritch Invocations (2 at 2, +1 at 5, 7, 9, 12, 15, 18)
  invocation2_1: {
    source: 'class',
    sourceId: 'warlock',
    level: 2,
    featureLabel: 'Eldritch Invocation (1st)',
    prompt: 'Choose first invocation',
    options: INVOCATION_OPTIONS
  },
  invocation2_2: {
    source: 'class',
    sourceId: 'warlock',
    level: 2,
    featureLabel: 'Eldritch Invocation (2nd)',
    prompt: 'Choose second invocation',
    options: INVOCATION_OPTIONS
  },
  invocation5: {
    source: 'class',
    sourceId: 'warlock',
    level: 5,
    featureLabel: 'Eldritch Invocation (5th level)',
    prompt: 'Choose an invocation',
    options: INVOCATION_OPTIONS
  },
  invocation7: {
    source: 'class',
    sourceId: 'warlock',
    level: 7,
    featureLabel: 'Eldritch Invocation (7th level)',
    prompt: 'Choose an invocation',
    options: INVOCATION_OPTIONS
  },
  invocation9: {
    source: 'class',
    sourceId: 'warlock',
    level: 9,
    featureLabel: 'Eldritch Invocation (9th level)',
    prompt: 'Choose an invocation',
    options: INVOCATION_OPTIONS
  },
  invocation12: {
    source: 'class',
    sourceId: 'warlock',
    level: 12,
    featureLabel: 'Eldritch Invocation (12th level)',
    prompt: 'Choose an invocation',
    options: INVOCATION_OPTIONS
  },
  invocation15: {
    source: 'class',
    sourceId: 'warlock',
    level: 15,
    featureLabel: 'Eldritch Invocation (15th level)',
    prompt: 'Choose an invocation',
    options: INVOCATION_OPTIONS
  },
  invocation18: {
    source: 'class',
    sourceId: 'warlock',
    level: 18,
    featureLabel: 'Eldritch Invocation (18th level)',
    prompt: 'Choose an invocation',
    options: INVOCATION_OPTIONS
  },
  // Ability Score Improvement (one +2 or two +1s; cannot exceed 20)
  asi4: { source: 'class', sourceIds: ['artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'], level: 4, featureLabel: 'Ability Score Improvement (Level 4)', prompt: 'Increase one ability by 2, or two abilities by 1', options: ASI_OPTIONS },
  asi6: { source: 'class', sourceId: 'fighter', level: 6, featureLabel: 'Ability Score Improvement (Level 6)', prompt: 'Increase one ability by 2, or two abilities by 1', options: ASI_OPTIONS },
  asi8: { source: 'class', sourceIds: ['artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'], level: 8, featureLabel: 'Ability Score Improvement (Level 8)', prompt: 'Increase one ability by 2, or two abilities by 1', options: ASI_OPTIONS },
  asi10: { source: 'class', sourceIds: ['fighter', 'rogue'], level: 10, featureLabel: 'Ability Score Improvement (Level 10)', prompt: 'Increase one ability by 2, or two abilities by 1', options: ASI_OPTIONS },
  asi12: { source: 'class', sourceIds: ['artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'], level: 12, featureLabel: 'Ability Score Improvement (Level 12)', prompt: 'Increase one ability by 2, or two abilities by 1', options: ASI_OPTIONS },
  asi14: { source: 'class', sourceId: 'fighter', level: 14, featureLabel: 'Ability Score Improvement (Level 14)', prompt: 'Increase one ability by 2, or two abilities by 1', options: ASI_OPTIONS },
  asi16: { source: 'class', sourceIds: ['artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'], level: 16, featureLabel: 'Ability Score Improvement (Level 16)', prompt: 'Increase one ability by 2, or two abilities by 1', options: ASI_OPTIONS },
  asi19: { source: 'class', sourceIds: ['artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'], level: 19, featureLabel: 'Ability Score Improvement (Level 19)', prompt: 'Increase one ability by 2, or two abilities by 1', options: ASI_OPTIONS }
};

// Maps placeholder feature strings to choice keys (for class-specific: pass classId to getSubclassChoiceKey)
const PLACEHOLDER_TO_CHOICE = {
  'Path feature': 'primalPath',
  'College feature': 'bardCollege',
  'Divine Domain feature': 'divineDomain',
  'Druid Circle feature': 'druidCircle',
  'Martial Archetype': 'martialArchetype',
  'Oath feature': 'sacredOath',
  'Origin feature': 'sorcerousOrigin',
  'Patron feature': 'otherworldlyPatron',
  'Specialist feature': 'artificerSpecialist',
  'Artificer Specialist': 'artificerSpecialist'
};
const PLACEHOLDER_BY_CLASS = {
  'Archetype feature': { fighter: 'martialArchetype', ranger: 'rangerArchetype', rogue: 'roguishArchetype' },
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
  martialArchetype: {
    champion: {
      3: 'Improved Critical',
      7: 'Remarkable Athlete',
      10: 'Additional Fighting Style',
      15: 'Superior Critical',
      18: 'Survivor'
    },
    battleMaster: {
      3: 'Combat Superiority\nStudent of War',
      7: 'Know Your Enemy',
      10: 'Improved Combat Superiority',
      15: 'Relentless',
      18: '—'
    },
    eldritchKnight: {
      3: 'Spellcasting\nWeapon Bond',
      7: 'War Magic',
      10: 'Eldritch Strike',
      15: 'Arcane Charge',
      18: 'Improved War Magic'
    }
  },
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
