// 5e D&D race, class, and background options with auto-filled features

const RACE_OPTIONS = {
  '': { name: '—', features: '' },
  elf: {
    name: 'Elf',
    features: 'Darkvision\nFey Ancestry\nTrance'
  },
  dwarf: {
    name: 'Dwarf',
    features: 'Darkvision\nDwarven Resilience\nDwarven Combat Training\nStonecunning'
  },
  halfling: {
    name: 'Halfling',
    features: 'Lucky\nBrave\nHalfling Nimbleness'
  },
  human: {
    name: 'Human',
    features: 'Extra Language (choose one)\nBonus Feat (optional rule)'
  },
  dragonborn: {
    name: 'Dragonborn',
    features: 'Draconic Ancestry\nBreath Weapon\nDamage Resistance'
  },
  gnome: {
    name: 'Gnome',
    features: 'Darkvision\nGnome Cunning'
  },
  halfElf: {
    name: 'Half-Elf',
    features: 'Darkvision\nFey Ancestry\nSkill Versatility (two skills)'
  },
  halfOrc: {
    name: 'Half-Orc',
    features: 'Darkvision\nMenacing\nRelentless Endurance\nSavage Attacks'
  },
  tiefling: {
    name: 'Tiefling',
    features: 'Darkvision\nHellish Resistance\nInfernal Legacy'
  },
  tabaxi: {
    name: 'Tabaxi',
    features: 'Darkvision\nFeline Agility\nCat\'s Claws'
  },
  other: { name: 'Other', features: '' }
};

const CLASS_OPTIONS = {
  '': { name: '—', features: '', featuresByLevel: {}, hitDice: '1d8' },
  artificer: {
    name: 'Artificer',
    features: 'Spellcasting\nMagical Tinkering',
    hitDice: '1d8',
    featuresByLevel: {
      1: 'Spellcasting\nMagical Tinkering',
      2: 'Infuse Item',
      3: 'Artificer Specialist',
      4: 'Ability Score Improvement',
      5: '—',
      6: 'Specialist feature',
      7: 'Flash of Genius',
      8: 'Ability Score Improvement',
      9: '—',
      10: 'Specialist feature',
      11: 'Spell-Storing Item',
      12: 'Ability Score Improvement',
      13: '—',
      14: 'Specialist feature',
      15: '—',
      16: 'Ability Score Improvement',
      17: '—',
      18: 'Specialist feature',
      19: 'Ability Score Improvement',
      20: 'Soul of Artifice'
    }
  },
  barbarian: {
    name: 'Barbarian',
    features: 'Rage\nUnarmored Defense',
    hitDice: '1d12',
    featuresByLevel: {
      1: 'Rage\nUnarmored Defense',
      2: 'Reckless Attack\nDanger Sense',
      3: 'Primal Path',
      4: 'Ability Score Improvement',
      5: 'Extra Attack\nFast Movement',
      6: 'Path feature',
      7: 'Feral Instinct',
      8: 'Ability Score Improvement',
      9: 'Brutal Critical (1 die)',
      10: 'Path feature',
      11: 'Relentless Rage',
      12: 'Ability Score Improvement',
      13: 'Brutal Critical (2 dice)',
      14: 'Path feature',
      15: 'Persistent Rage',
      16: 'Ability Score Improvement',
      17: 'Brutal Critical (3 dice)',
      18: 'Indomitable Might',
      19: 'Ability Score Improvement',
      20: 'Primal Champion'
    }
  },
  bard: {
    name: 'Bard',
    features: 'Spellcasting\nBardic Inspiration',
    hitDice: '1d8',
    featuresByLevel: {
      1: 'Spellcasting\nBardic Inspiration',
      2: 'Jack of All Trades\nSong of Rest',
      3: 'Bard College\nExpertise',
      4: 'Ability Score Improvement',
      5: 'Font of Inspiration',
      6: 'Countercharm\nCollege feature',
      7: '—',
      8: 'Ability Score Improvement',
      9: '—',
      10: 'Bardic Inspiration improvement\nExpertise\nMagical Secrets',
      11: '—',
      12: 'Ability Score Improvement',
      13: '—',
      14: 'Magical Secrets',
      15: '—',
      16: 'Ability Score Improvement',
      17: '—',
      18: 'Magical Secrets',
      19: 'Ability Score Improvement',
      20: 'Superior Inspiration'
    }
  },
  cleric: {
    name: 'Cleric',
    features: 'Spellcasting\nDivine Domain',
    hitDice: '1d8',
    featuresByLevel: {
      1: 'Spellcasting\nDivine Domain',
      2: 'Channel Divinity\nDivine Domain feature',
      3: '—',
      4: 'Ability Score Improvement',
      5: 'Destroy Undead (CR 1/2)',
      6: 'Channel Divinity (2/rest)\nDivine Domain feature',
      7: '—',
      8: 'Ability Score Improvement\nDestroy Undead (CR 1)',
      9: '—',
      10: 'Divine Intervention',
      11: 'Destroy Undead (CR 2)',
      12: 'Ability Score Improvement',
      13: '—',
      14: 'Destroy Undead (CR 3)',
      15: '—',
      16: 'Ability Score Improvement',
      17: 'Destroy Undead (CR 4)',
      18: 'Channel Divinity (3/rest)',
      19: 'Ability Score Improvement',
      20: 'Divine Intervention improvement'
    }
  },
  druid: {
    name: 'Druid',
    features: 'Spellcasting\nDruidic\nWild Shape',
    hitDice: '1d8',
    featuresByLevel: {
      1: 'Spellcasting\nDruidic',
      2: 'Wild Shape\nDruid Circle',
      3: '—',
      4: 'Ability Score Improvement\nWild Shape (CR 1/4)',
      5: '—',
      6: 'Druid Circle feature',
      7: '—',
      8: 'Ability Score Improvement\nWild Shape (CR 1)',
      9: '—',
      10: 'Druid Circle feature',
      11: '—',
      12: 'Ability Score Improvement',
      13: '—',
      14: 'Druid Circle feature',
      15: '—',
      16: 'Ability Score Improvement',
      17: '—',
      18: 'Beast Spells\nTimeless Body',
      19: 'Ability Score Improvement',
      20: 'Archdruid'
    }
  },
  fighter: {
    name: 'Fighter',
    features: 'Fighting Style\nSecond Wind',
    hitDice: '1d10',
    featuresByLevel: {
      1: 'Fighting Style\nSecond Wind',
      2: 'Action Surge',
      3: 'Martial Archetype',
      4: 'Ability Score Improvement',
      5: 'Extra Attack',
      6: 'Ability Score Improvement',
      7: 'Archetype feature',
      8: 'Ability Score Improvement',
      9: 'Indomitable (1 use)',
      10: 'Archetype feature',
      11: 'Extra Attack (2)',
      12: 'Ability Score Improvement',
      13: 'Indomitable (2 uses)',
      14: 'Ability Score Improvement',
      15: 'Archetype feature',
      16: 'Ability Score Improvement',
      17: 'Action Surge (2 uses)\nIndomitable (3 uses)',
      18: 'Archetype feature',
      19: 'Ability Score Improvement',
      20: 'Extra Attack (3)'
    }
  },
  monk: {
    name: 'Monk',
    features: 'Unarmored Defense\nMartial Arts',
    hitDice: '1d8',
    featuresByLevel: {
      1: 'Unarmored Defense\nMartial Arts',
      2: 'Ki\nUnarmored Movement',
      3: 'Monastic Tradition\nDeflect Missiles',
      4: 'Ability Score Improvement\nSlow Fall',
      5: 'Extra Attack\nStunning Strike',
      6: 'Ki-Empowered Strikes\nTradition feature',
      7: 'Evasion\nStillness of Mind',
      8: 'Ability Score Improvement',
      9: 'Unarmored Movement improvement',
      10: 'Purity of Body',
      11: 'Tradition feature',
      12: 'Ability Score Improvement',
      13: 'Tongue of the Sun and Moon',
      14: 'Diamond Soul',
      15: 'Timeless Body',
      16: 'Ability Score Improvement',
      17: 'Tradition feature',
      18: 'Empty Body',
      19: 'Ability Score Improvement',
      20: 'Perfect Self'
    }
  },
  paladin: {
    name: 'Paladin',
    features: 'Divine Sense\nLay on Hands',
    hitDice: '1d10',
    featuresByLevel: {
      1: 'Divine Sense\nLay on Hands',
      2: 'Fighting Style\nSpellcasting\nDivine Smite',
      3: 'Divine Health\nSacred Oath',
      4: 'Ability Score Improvement',
      5: 'Extra Attack',
      6: 'Aura of Protection',
      7: 'Oath feature',
      8: 'Ability Score Improvement',
      9: '—',
      10: 'Aura of Courage',
      11: 'Improved Divine Smite',
      12: 'Ability Score Improvement',
      13: '—',
      14: 'Cleansing Touch',
      15: 'Oath feature',
      16: 'Ability Score Improvement',
      17: '—',
      18: 'Aura improvements',
      19: 'Ability Score Improvement',
      20: 'Oath feature'
    }
  },
  ranger: {
    name: 'Ranger',
    features: 'Favored Enemy\nNatural Explorer',
    hitDice: '1d10',
    featuresByLevel: {
      1: 'Favored Enemy\nNatural Explorer',
      2: 'Fighting Style\nSpellcasting',
      3: 'Ranger Archetype',
      4: 'Ability Score Improvement',
      5: 'Extra Attack',
      6: 'Favored Enemy improvement\nNatural Explorer improvement',
      7: 'Archetype feature',
      8: 'Ability Score Improvement',
      9: '—',
      10: 'Natural Explorer improvement\nHide in Plain Sight',
      11: 'Archetype feature',
      12: 'Ability Score Improvement',
      13: '—',
      14: 'Favored Enemy improvement\nVanish',
      15: 'Archetype feature',
      16: 'Ability Score Improvement',
      17: '—',
      18: 'Feral Senses',
      19: 'Ability Score Improvement',
      20: 'Foe Slayer'
    }
  },
  rogue: {
    name: 'Rogue',
    features: 'Expertise\nSneak Attack\nThieves\' Cant',
    hitDice: '1d8',
    featuresByLevel: {
      1: 'Expertise\nSneak Attack\nThieves\' Cant',
      2: 'Cunning Action',
      3: 'Roguish Archetype',
      4: 'Ability Score Improvement',
      5: 'Uncanny Dodge',
      6: 'Expertise',
      7: 'Evasion\nArchetype feature',
      8: 'Ability Score Improvement',
      9: 'Archetype feature',
      10: 'Ability Score Improvement',
      11: 'Reliable Talent',
      12: 'Ability Score Improvement',
      13: 'Archetype feature',
      14: 'Blindsense',
      15: 'Slippery Mind',
      16: 'Ability Score Improvement',
      17: 'Archetype feature',
      18: 'Elusive',
      19: 'Ability Score Improvement',
      20: 'Stroke of Luck'
    }
  },
  sorcerer: {
    name: 'Sorcerer',
    features: 'Spellcasting\nSorcerous Origin',
    hitDice: '1d6',
    featuresByLevel: {
      1: 'Spellcasting\nSorcerous Origin',
      2: 'Font of Magic',
      3: 'Metamagic',
      4: 'Ability Score Improvement',
      5: '—',
      6: 'Origin feature',
      7: '—',
      8: 'Ability Score Improvement',
      9: '—',
      10: 'Metamagic',
      11: '—',
      12: 'Ability Score Improvement',
      13: '—',
      14: 'Origin feature',
      15: '—',
      16: 'Ability Score Improvement',
      17: 'Metamagic',
      18: 'Origin feature',
      19: 'Ability Score Improvement',
      20: 'Sorcerous Restoration'
    }
  },
  warlock: {
    name: 'Warlock',
    features: 'Spellcasting\nOtherworldly Patron\nPact Magic',
    hitDice: '1d8',
    featuresByLevel: {
      1: 'Spellcasting\nOtherworldly Patron\nPact Magic',
      2: 'Eldritch Invocations',
      3: 'Pact Boon',
      4: 'Ability Score Improvement',
      5: '—',
      6: 'Patron feature',
      7: '—',
      8: 'Ability Score Improvement',
      9: '—',
      10: 'Patron feature',
      11: 'Mystic Arcanum (6th level)',
      12: 'Ability Score Improvement',
      13: 'Mystic Arcanum (7th level)',
      14: 'Patron feature',
      15: 'Mystic Arcanum (8th level)',
      16: 'Ability Score Improvement',
      17: 'Mystic Arcanum (9th level)',
      18: '—',
      19: 'Ability Score Improvement',
      20: 'Eldritch Master'
    }
  },
  wizard: {
    name: 'Wizard',
    features: 'Spellcasting\nArcane Recovery',
    hitDice: '1d6',
    featuresByLevel: {
      1: 'Spellcasting\nArcane Recovery',
      2: 'Arcane Tradition',
      3: '—',
      4: 'Ability Score Improvement',
      5: '—',
      6: 'Tradition feature',
      7: '—',
      8: 'Ability Score Improvement',
      9: '—',
      10: 'Tradition feature',
      11: '—',
      12: 'Ability Score Improvement',
      13: '—',
      14: 'Tradition feature',
      15: '—',
      16: 'Ability Score Improvement',
      17: '—',
      18: 'Spell Mastery',
      19: 'Ability Score Improvement',
      20: 'Signature Spells'
    }
  },
  other: { name: 'Other', features: '', featuresByLevel: {}, hitDice: '1d8' }
};

const BACKGROUND_OPTIONS = {
  '': { name: '—', features: '' },
  acolyte: {
    name: 'Acolyte',
    features: 'Shelter of the Faithful'
  },
  charlatan: {
    name: 'Charlatan',
    features: 'False Identity'
  },
  criminal: {
    name: 'Criminal',
    features: 'Criminal Contact'
  },
  entertainer: {
    name: 'Entertainer',
    features: 'By Popular Demand'
  },
  folkHero: {
    name: 'Folk Hero',
    features: 'Rustic Hospitality'
  },
  guildArtisan: {
    name: 'Guild Artisan',
    features: 'Guild Membership'
  },
  hermit: {
    name: 'Hermit',
    features: 'Discovery'
  },
  noble: {
    name: 'Noble',
    features: 'Position of Privilege'
  },
  outlaw: {
    name: 'Outlaw',
    features: 'Criminal Contact'
  },
  sage: {
    name: 'Sage',
    features: 'Researcher'
  },
  sailor: {
    name: 'Sailor',
    features: 'Ship\'s Passage'
  },
  soldier: {
    name: 'Soldier',
    features: 'Military Rank'
  },
  urchin: {
    name: 'Urchin',
    features: 'City Secrets'
  },
  other: { name: 'Other', features: '' }
};
