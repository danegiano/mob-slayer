# Mob Slayer Big Expansion Design

## Overview

Massive expansion to Mob Slayer in 3 phases:
- Phase 1: Weapons, Armor & Equipment (build first)
- Phase 2: Bigger Levels + Secret Rooms
- Phase 3: Overworld Map

This document covers Phase 1 in detail. Phase 2 and 3 get their own design docs later.

---

## Phase 1: Weapons, Armor & Equipment System

### Goal

Add 5 swords with special effects, 4 armor tiers with damage reduction, an inventory screen, and treasure chests to find gear in.

### Weapons

| Sword | Attack | Effect | How to Get |
|-------|--------|--------|------------|
| Wood Sword | 10 | None | Start with it |
| Iron Sword | 20 | None | Buy in Village shop (200g) |
| Fire Sword | 35 | Burns enemies (3 dmg/sec for 3 sec) | Chest in WoodsNight |
| Ice Sword | 35 | Freezes enemies for 1 second | Chest in SnowCave |
| Dragon Sword | 50 | Burns + chains lightning to nearby enemy | Beat all 3 region bosses |

The Mob Slayer sword stays as a separate story weapon (25 dmg + purple look). Better swords replace it once found.

Each sword changes the sword color in the player's hand:
- Wood: brown
- Iron: grey
- Fire: orange
- Ice: blue
- Dragon: red

### Armor

| Armor | Damage Reduction | How to Get |
|-------|-----------------|------------|
| None | 0% | Start |
| Leather Armor | 20% less damage | Buy in Village shop (150g) |
| Chain Armor | 40% less damage | Buy in Tundra shop (300g) |
| Dragon Armor | 60% less damage | Secret room in Ruins |

Armor changes player sprite color:
- None: normal
- Leather: light brown
- Chain: silver
- Dragon: red/gold

### Inventory Screen

- Press I to open/close
- Shows equipped sword and armor
- Lists all found swords and armor
- UP/DOWN to select, E to equip
- Displays stats: attack damage, damage reduction percentage
- Uses setScrollFactor(0) for zoom compatibility

### Treasure Chests

- Sprite you walk up to and press E to open
- Lid-open animation
- Popup showing what you found
- Each chest opens once (tracked in GameState.chests)
- Phase 1 places 2 chests:
  - Fire Sword chest in WoodsNight (tricky corner)
  - Ice Sword chest in SnowCave (tricky corner)

### GameState Changes

```javascript
// Add to GameState:
equipment: {
    sword: 'wood',     // wood, iron, fire, ice, dragon, slayer
    armor: 'none'      // none, leather, chain, dragon
},
inventory: {
    swords: ['wood'],          // unlocked swords
    armors: ['none']           // unlocked armors
},
chests: {
    woodsNightFire: false,     // Fire Sword chest
    snowCaveIce: false         // Ice Sword chest
}
```

### Sword Stats Lookup

```javascript
const SWORD_DATA = {
    wood:    { attack: 10, effect: 'none',      color: 0x8B4513, name: 'Wood Sword' },
    iron:    { attack: 20, effect: 'none',      color: 0xAAAAAA, name: 'Iron Sword' },
    fire:    { attack: 35, effect: 'burn',      color: 0xFF6600, name: 'Fire Sword' },
    ice:     { attack: 35, effect: 'freeze',    color: 0x44AAFF, name: 'Ice Sword' },
    dragon:  { attack: 50, effect: 'lightning', color: 0xFF2222, name: 'Dragon Sword' },
    slayer:  { attack: 25, effect: 'none',      color: 0x9900FF, name: 'Mob Slayer' }
};

const ARMOR_DATA = {
    none:    { reduction: 0,   color: null,     name: 'No Armor' },
    leather: { reduction: 0.2, color: 0xC4A882, name: 'Leather Armor' },
    chain:   { reduction: 0.4, color: 0xCCCCCC, name: 'Chain Armor' },
    dragon:  { reduction: 0.6, color: 0xFF4444, name: 'Dragon Armor' }
};
```

### Player.js Changes

- attackDamage reads from SWORD_DATA[equipment.sword].attack + attackBonus
- On hit, apply sword effect:
  - burn: enemy takes 3 dmg/sec for 3 seconds (tinted orange)
  - freeze: enemy stops moving for 1 second (tinted blue)
  - lightning: after hitting, deal 15 dmg to nearest other enemy within 100px (flash white)
- Damage taken multiplied by (1 - ARMOR_DATA[equipment.armor].reduction)
- Sword sprite color from SWORD_DATA

### Shop Changes

- Village shop adds: Iron Sword (200g), Leather Armor (150g)
- Tundra shop adds: Chain Armor (300g)
- Shop checks if player already owns item

### Files to Create/Modify

- Create: js/EquipmentData.js (SWORD_DATA, ARMOR_DATA constants)
- Create: js/InventoryMenu.js (inventory screen UI)
- Create: js/Chest.js (chest sprite + interaction)
- Modify: js/main.js (GameState additions)
- Modify: js/Player.js (equipment-based damage, armor reduction, effects)
- Modify: js/Enemy.js (burn/freeze/lightning effects)
- Modify: js/ShopMenu.js (add sword/armor items)
- Modify: js/scenes/WoodsNightScene.js (place Fire Sword chest)
- Modify: js/scenes/SnowCaveScene.js (place Ice Sword chest)
- Modify: js/scenes/VictoryScene.js or FinalVictoryScene.js (Dragon Sword reward)
- Modify: index.html (add new script tags)

---

## Phase 2: Bigger Levels + Secret Rooms (future)

- Make combat levels 2-3x bigger with camera scrolling
- Add secret rooms found via: hidden walls, breakable walls, puzzles
- Treasure chests with gold, potions, rare gear
- Mini-bosses guarding best loot
- Lore scrolls and NPCs telling world story

## Phase 3: Overworld Map (future)

- Big top-down map connecting all 4 biomes
- Walk between villages
- Discover hidden forests, caves, side areas
- Bonus enemies and exploration rewards
