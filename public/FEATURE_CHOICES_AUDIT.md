# Feature choices audit (2014 5e D&D)

Every race, class, and background feature that requires a **player choice** (not just a fixed rule).  
**Implemented** = appears in "Manage Feature Choices" and is stored with the character.

---

## RACES

| Feature | Source | Choice required | Implemented |
|--------|--------|------------------|-------------|
| **Draconic Ancestry** | Dragonborn | Choose dragon type (determines breath weapon & resistance) | ✅ draconicAncestry |
| **Extra Language (choose one)** | Human | Choose one language | ✅ extraLanguage |
| **Bonus Feat (optional rule)** | Human | Choose one feat (optional rule; large list) | ✅ bonusFeat |
| **Skill Versatility (two skills)** | Half-Elf | Choose two skills | ✅ skillVersatility |

All other race features (Darkvision, Fey Ancestry, Lucky, etc.) are fixed—no dropdown choice.

---

## CLASSES

### Level 1

| Feature | Class | Choice required | Implemented |
|--------|--------|------------------|-------------|
| **Divine Domain** | Cleric | Choose domain | ✅ divineDomain |
| **Fighting Style** | Fighter, Ranger, Paladin | Choose style | ✅ fightingStyle |
| **Sorcerous Origin** | Sorcerer | Choose origin (e.g. Draconic, Wild Magic) | ✅ sorcerousOrigin |
| **Otherworldly Patron** | Warlock | Choose patron | ✅ otherworldlyPatron |
| **Favored Enemy** | Ranger | Choose enemy type (or two humanoid races); again at 6, 14 | ✅ favoredEnemy, favoredEnemy6, favoredEnemy14 |
| **Natural Explorer** | Ranger | Choose favored terrain (+ 2nd at 6, 3rd at 10) | ✅ naturalExplorer, naturalExplorer6, naturalExplorer10 |
| **Expertise** | Bard (at 3, 10), Rogue (at 1 & 6) | Choose two skills for double proficiency | ✅ expertiseBard3, expertiseBard10, expertiseRogue1, expertiseRogue6 |

### Level 2

| Feature | Class | Choice required | Implemented |
|--------|--------|------------------|-------------|
| **Druid Circle** | Druid | Choose circle | ✅ druidCircle |
| **Circle of the Land – terrain** | Druid (Land only) | Choose land type for circle spells | ✅ landTerrain |
| **Arcane Tradition** | Wizard | Choose school | ✅ arcaneTradition |
| **Eldritch Invocations** | Warlock | Choose invocations (2 at 2, +1 at 5,7,9,12,15,18) | ✅ invocation2_1, invocation2_2, invocation5, invocation7, invocation9, invocation12, invocation15, invocation18 |

### Level 3

| Feature | Class | Choice required | Implemented |
|--------|--------|------------------|-------------|
| **Martial Archetype** | Fighter | Champion, Battle Master, Eldritch Knight | ✅ martialArchetype |
| **Primal Path** | Barbarian | Berserker, Totem Warrior | ✅ primalPath |
| **Totem Spirit (animal)** | Barbarian (Totem only) | Bear, Eagle, Wolf (and again at 6, 14) | ✅ totemAnimal3, totemAnimal6, totemAnimal14 |
| **Bard College** | Bard | Lore, Valor | ✅ bardCollege |
| **Monastic Tradition** | Monk | Open Hand, Shadow, Four Elements | ✅ monasticTradition |
| **Sacred Oath** | Paladin | Devotion, Ancients, Vengeance | ✅ sacredOath |
| **Ranger Archetype** | Ranger | Hunter, Beast Master | ✅ rangerArchetype |
| **Hunter's Prey** | Ranger (Hunter only) | Colossus Slayer, Giant Killer, Horde Breaker | ✅ huntersPrey |
| **Roguish Archetype** | Rogue | Thief, Assassin, Arcane Trickster | ✅ roguishArchetype |
| **Artificer Specialist** | Artificer | Alchemist, Artillerist, Battle Smith | ✅ artificerSpecialist |
| **Pact Boon** | Warlock | Blade, Chain, Tome | ✅ pactBoon |
| **Metamagic** | Sorcerer | Choose 2 at 3, +1 at 10, +1 at 17 | ✅ metamagic3_1, metamagic3_2, metamagic10, metamagic17 |

### Level 4, 6, 8, 10, 12, 14, 16, 19

| Feature | Class | Choice required | Implemented |
|--------|--------|------------------|-------------|
| **Ability Score Improvement** | All (Fighter/Rogue extra at 6/10/14) | +2 one ability or +1 two abilities | ✅ asi4, asi6, asi8, asi10, asi12, asi14, asi16, asi19 |

### Ranger (Hunter) – later levels

| Feature | Class | Choice required | Implemented |
|--------|--------|------------------|-------------|
| **Defensive Tactics** | Ranger (Hunter), 7 | Escape the Horde, Multiattack Defense, Steel Will | ✅ defensiveTactics |
| **Superior Hunter's Defense** | Ranger (Hunter), 15 | Evasion, Stand Against the Tide, Uncanny Dodge | ✅ superiorHuntersDefense |

---

## BACKGROUNDS

Background features in the app are **fixed** per background (e.g. Guild Membership, Criminal Contact).  
PHB allows some background customization (e.g. tool proficiencies, variant names like Gladiator for Entertainer); those are not modeled as separate "feature choices" in the sheet. **No background feature currently requires a Manage Feature Choices dropdown.**

---

## SUMMARY

- **Implemented:** Draconic Ancestry, Extra Language (Human), Bonus Feat (Human), Skill Versatility (Half-Elf), Fighting Style, Martial Archetype, Primal Path, Totem Spirit (3/6/14), Bard College, Expertise (Bard 3/10, Rogue 1/6), Divine Domain, Druid Circle, Land terrain, Monastic Tradition, Sacred Oath, Ranger Archetype, Favored Enemy, Natural Explorer (1/6/10), Hunter's Prey, Defensive Tactics, Superior Hunter's Defense, Roguish Archetype, Sorcerous Origin, Metamagic (Sorcerer 3/10/17), Otherworldly Patron, Pact Boon, Eldritch Invocations (Warlock 2/5/7/9/12/15/18), Artificer Specialist, Arcane Tradition, all ASI levels.
- **Not implemented:** None; all audited feature choices are implemented.
