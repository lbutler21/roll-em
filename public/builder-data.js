// D&D Beyond-style character builder data

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const POINT_BUY_TOTAL = 27;

// Suggested ability placement by class (str, dex, con, int, wis, cha)
const STANDARD_ARRAY_BY_CLASS = {
  artificer: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
  barbarian: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 },
  bard: { str: 8, dex: 14, con: 12, int: 13, wis: 10, cha: 15 },
  cleric: { str: 14, dex: 8, con: 13, int: 10, wis: 15, cha: 12 },
  druid: { str: 8, dex: 12, con: 14, int: 13, wis: 15, cha: 10 },
  fighter: { str: 15, dex: 14, con: 13, int: 8, wis: 10, cha: 12 },
  monk: { str: 12, dex: 15, con: 13, int: 10, wis: 14, cha: 8 },
  paladin: { str: 15, dex: 10, con: 13, int: 8, wis: 12, cha: 14 },
  ranger: { str: 12, dex: 15, con: 13, int: 8, wis: 14, cha: 10 },
  rogue: { str: 12, dex: 15, con: 13, int: 14, wis: 10, cha: 8 },
  sorcerer: { str: 10, dex: 13, con: 14, int: 8, wis: 12, cha: 15 },
  warlock: { str: 8, dex: 14, con: 13, int: 12, wis: 10, cha: 15 },
  wizard: { str: 8, dex: 12, con: 13, int: 15, wis: 14, cha: 10 }
};

// Class proficiencies: saving throws (2), skills (choose N from list)
const CLASS_PROFICIENCIES = {
  artificer: {
    savingThrows: ['con', 'int'],
    skillChoices: 2,
    skills: ['arcana', 'history', 'investigation', 'medicine', 'nature', 'perception', 'sleightOfHand']
  },
  barbarian: {
    savingThrows: ['str', 'con'],
    skillChoices: 2,
    skills: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival']
  },
  bard: {
    savingThrows: ['dex', 'cha'],
    skillChoices: 3,
    skills: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival']
  },
  cleric: {
    savingThrows: ['wis', 'cha'],
    skillChoices: 2,
    skills: ['history', 'insight', 'medicine', 'persuasion', 'religion']
  },
  druid: {
    savingThrows: ['int', 'wis'],
    skillChoices: 2,
    skills: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival']
  },
  fighter: {
    savingThrows: ['str', 'con'],
    skillChoices: 2,
    skills: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival']
  },
  monk: {
    savingThrows: ['str', 'dex'],
    skillChoices: 2,
    skills: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth']
  },
  paladin: {
    savingThrows: ['wis', 'cha'],
    skillChoices: 2,
    skills: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion']
  },
  ranger: {
    savingThrows: ['str', 'dex'],
    skillChoices: 3,
    skills: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival']
  },
  rogue: {
    savingThrows: ['dex', 'int'],
    skillChoices: 4,
    skills: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth']
  },
  sorcerer: {
    savingThrows: ['con', 'cha'],
    skillChoices: 2,
    skills: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion']
  },
  warlock: {
    savingThrows: ['wis', 'cha'],
    skillChoices: 2,
    skills: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion']
  },
  wizard: {
    savingThrows: ['int', 'wis'],
    skillChoices: 2,
    skills: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion']
  }
};

// Background: skills (2 fixed), abilityBonuses (+2 one, +1 another or +1 to three)
const BACKGROUND_BUILDER = {
  acolyte: {
    skills: ['insight', 'religion'],
    abilityBonuses: { wis: 2, cha: 1 },
    equipment: 'Holy symbol, prayer book, vestments, incense, common clothes, belt pouch, 15 gp'
  },
  charlatan: {
    skills: ['deception', 'sleightOfHand'],
    abilityBonuses: { cha: 2, dex: 1 },
    equipment: 'Fine clothes, disguise kit, tools of the con, belt pouch, 15 gp'
  },
  criminal: {
    skills: ['deception', 'stealth'],
    abilityBonuses: { dex: 2, int: 1 },
    equipment: 'Crowbar, dark common clothes with hood, belt pouch, 15 gp'
  },
  entertainer: {
    skills: ['acrobatics', 'performance'],
    abilityBonuses: { cha: 2, dex: 1 },
    equipment: 'Musical instrument, costume, belt pouch, 15 gp'
  },
  folkHero: {
    skills: ['animalHandling', 'survival'],
    abilityBonuses: { dex: 2, wis: 1 },
    equipment: 'Artisan\'s tools, shovel, pot, common clothes, belt pouch, 10 gp'
  },
  guildArtisan: {
    skills: ['insight', 'persuasion'],
    abilityBonuses: { int: 2, wis: 1 },
    equipment: 'Artisan\'s tools, letter of introduction, traveler\'s clothes, belt pouch, 15 gp'
  },
  hermit: {
    skills: ['medicine', 'religion'],
    abilityBonuses: { wis: 2, int: 1 },
    equipment: 'Scroll case, winter blanket, herbalism kit, common clothes, 5 gp'
  },
  noble: {
    skills: ['history', 'persuasion'],
    abilityBonuses: { cha: 2, int: 1 },
    equipment: 'Fine clothes, signet ring, scroll of pedigree, purse, 25 gp'
  },
  outlaw: {
    skills: ['deception', 'stealth'],
    abilityBonuses: { dex: 2, int: 1 },
    equipment: 'Crowbar, dark common clothes, belt pouch, 15 gp'
  },
  sage: {
    skills: ['arcana', 'history'],
    abilityBonuses: { int: 2, wis: 1 },
    equipment: 'Bottle of black ink, quill, small knife, letter from dead colleague, common clothes, belt pouch, 10 gp'
  },
  sailor: {
    skills: ['athletics', 'perception'],
    abilityBonuses: { dex: 2, wis: 1 },
    equipment: 'Belaying pin, silk rope, lucky charm, common clothes, belt pouch, 10 gp'
  },
  soldier: {
    skills: ['athletics', 'intimidation'],
    abilityBonuses: { str: 2, con: 1 },
    equipment: 'Insignia of rank, trophy, dice/cards, common clothes, belt pouch, 10 gp'
  },
  urchin: {
    skills: ['sleightOfHand', 'stealth'],
    abilityBonuses: { dex: 2, wis: 1 },
    equipment: 'Small knife, map of hometown, pet mouse, token from parents, common clothes, belt pouch, 10 gp'
  }
};

// Starting equipment by class
const CLASS_STARTING_EQUIPMENT = {
  artificer: '(a) two handaxes or (b) any simple weapon\n(a) light crossbow and 20 bolts or (b) any simple weapon\n(a) dungeoneer\'s pack or (b) explorer\'s pack\nLeather armor, thieves\' tools, two artisan\'s tools of your choice',
  barbarian: '(a) greataxe or (b) any martial melee weapon\n4 javelins or any simple weapon',
  bard: '(a) rapier or (b) longsword or (c) any simple weapon\n(a) diplomat\'s pack or (b) entertainer\'s pack\n(a) lute or (b) any musical instrument\nLeather armor, dagger',
  cleric: '(a) mace or (b) warhammer\n(a) scale mail or (b) leather or (c) chain mail\n(a) light crossbow + 20 bolts or (b) any simple weapon\n(a) priest\'s pack or (b) explorer\'s pack\nShield, holy symbol',
  druid: '(a) wooden shield or (b) any simple weapon\n(a) scimitar or (b) any simple melee weapon\nLeather armor, explorer\'s pack, druidic focus',
  fighter: '(a) chain mail or (b) leather, longbow, 20 arrows\n(a) martial weapon + shield or (b) two martial weapons\n(a) light crossbow + 20 bolts or (b) two handaxes\n(a) dungeoneer\'s pack or (b) explorer\'s pack',
  monk: '(a) shortsword or (b) any simple weapon\n(a) dungeoneer\'s pack or (b) explorer\'s pack\n10 dart',
  paladin: '(a) martial weapon + shield or (b) two martial weapons\n(a) 5 javelins or (b) any simple melee weapon\n(a) priest\'s pack or (b) explorer\'s pack\nChain mail, holy symbol',
  ranger: '(a) scale mail or (b) leather armor\n(a) two shortswords or (b) two simple melee weapons\n(a) dungeoneer\'s pack or (b) explorer\'s pack\nLongbow, quiver, 20 arrows',
  rogue: '(a) rapier or (b) shortsword\n(a) shortbow + 20 arrows or (b) shortsword\n(a) burglar\'s pack or (b) dungeoneer\'s pack or (c) explorer\'s pack\nLeather armor, 2 daggers, thieves\' tools',
  sorcerer: '(a) light crossbow + 20 bolts or (b) any simple weapon\n(a) component pouch or (b) arcane focus\n(a) dungeoneer\'s pack or (b) explorer\'s pack\n2 daggers',
  warlock: '(a) light crossbow + 20 bolts or (b) any simple weapon\n(a) component pouch or (b) arcane focus\n(a) scholar\'s pack or (b) dungeoneer\'s pack\nLeather armor, any simple weapon, 2 daggers',
  wizard: '(a) quarterstaff or (b) dagger\n(a) component pouch or (b) arcane focus\n(a) scholar\'s pack or (b) explorer\'s pack\nSpellbook'
};
