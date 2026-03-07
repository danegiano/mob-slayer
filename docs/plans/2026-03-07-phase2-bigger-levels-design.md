# Phase 2: Bigger Levels + Secret Rooms Design

## Overview

Expand all 12 combat levels to 1600x900 (4x the area), add 1 secret room per level with treasure chests, mini-bosses, and lore scrolls.

---

## Bigger Levels

- Each combat level expands from 800x450 to 1600x900
- Camera already follows player with zoom — update world bounds and physics bounds
- Tile/extend backgrounds to fill bigger space
- Add more obstacles (trees, rocks, walls) to fill expanded area
- Spread more enemies across the bigger space
- Place secret room entrance in the expanded area

### Levels to expand (all 12):

**Starter:** WoodsDay, WoodsNight, BossArena
**Tundra:** FrozenLake, SnowCave, BlizzardPass
**Forest:** MushroomGrove, CursedSwamp, HollowTree
**Ruins:** CrumblingBridge, BuriedLibrary, LavaPit

## Secret Room Types

### Hidden Wall (3 levels)
- A tree/rock that looks solid but player can walk through
- Subtle hint: slightly lighter color than surrounding obstacles
- Walking through transitions to secret room scene

### Breakable Wall (3 levels)
- Cracked rock sprite visible in the level
- Player attacks it (hitbox overlap) to break it
- Small particle effect on break, reveals passage
- Walking into passage transitions to secret room

### Kill-All Puzzle (3 levels)
- Locked door sprite blocks a passage
- Text shows "Defeat all enemies to unlock"
- Door opens when all enemies in level are dead
- Walk through to secret room

### Mini-Boss (3 levels)
- Same door mechanic but inside the secret room
- Secret room contains a tough enemy (2x health, 2x damage)
- Chest only openable after mini-boss is dead

## Secret Room Scenes

- Small scenes (400x300)
- Dark background with torch-lit atmosphere
- Contains: treasure chest + optional lore scroll NPC
- Exit back to main level

## Secret Room Rewards

| Level | Secret Type | Reward |
|-------|------------|--------|
| WoodsDay | Hidden wall | 100 gold chest |
| WoodsNight | Breakable wall | 150 gold chest |
| BossArena | Kill-all puzzle | Health Potion x3 |
| FrozenLake | Hidden wall | 200 gold chest |
| SnowCave | Breakable wall | Speed Boots (+20 speed) |
| BlizzardPass | Kill-all puzzle | 250 gold chest |
| MushroomGrove | Hidden wall | Lore scroll + 150 gold |
| CursedSwamp | Breakable wall | Dragon Armor (DEF 60%) |
| HollowTree | Mini-boss | Lore scroll + 200 gold |
| CrumblingBridge | Hidden wall | 200 gold chest |
| BuriedLibrary | Breakable wall | Lore scroll + 300 gold |
| LavaPit | Mini-boss | Life Ring (+25 max HP) |

## New Items

### Speed Boots
- Found in SnowCave secret room
- Permanently adds +20 to player move speed
- Tracked in GameState.inventory

### Life Ring
- Found in LavaPit secret room
- Permanently adds +25 max HP
- Tracked in GameState.inventory

### Dragon Armor
- Already in ARMOR_DATA (DEF 60%)
- Found in CursedSwamp secret room chest

## New Sprites Needed

- Cracked rock (16x16) — breakable wall
- Locked door (16x16) — closed and open versions
- Lore scroll pickup (16x16)
- Mini-boss variants — recolor existing enemy sprites with 2x scale
- Secret room background (400x300)

## GameState Changes

```javascript
// Add to GameState:
secretRooms: {
    woodsDay: false,
    woodsNight: false,
    bossArena: false,
    frozenLake: false,
    snowCave: false,
    blizzardPass: false,
    mushroomGrove: false,
    cursedSwamp: false,
    hollowTree: false,
    crumblingBridge: false,
    buriedLibrary: false,
    lavaPit: false
},
accessories: {
    speedBoots: false,
    lifeRing: false
}
```

## Files to Create

- 12 secret room scenes (e.g., WoodsDaySecretScene.js)
- js/BreakableWall.js — cracked rock that breaks on attack
- js/LockedDoor.js — door that opens when enemies cleared
- js/LoreScroll.js — pickup that shows lore text in dialogue

## Files to Modify

- All 12 combat scene files — expand to 1600x900, add secret entrances
- js/main.js — GameState additions, new sprite data
- js/Player.js — speed boots effect
- index.html — new script tags
