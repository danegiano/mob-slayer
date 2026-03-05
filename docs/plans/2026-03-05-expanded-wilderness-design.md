# Expanded Wilderness Design

## Overview

Each wilderness area (Frozen Tundra, Dark Forest, Ancient Ruins) expands from ~8 minutes to ~30 minutes. Each area gets a village hub, 3 combat sub-areas with quest objectives, a mini-game, and a shop/upgrade system. Players must help all villagers (complete all quests + mini-game) before the fortress unlocks.

## Area Structure

Each area follows this flow:

```
Village → Sub-area 1 → Sub-area 2 → Sub-area 3 → Fortress (gated) → Boss Arena
```

**Time breakdown (~30 min):**
- Village: ~5 min (talk NPCs, shop, mini-game)
- 3 Sub-areas: ~5 min each (combat + quest objective = 15 min)
- Fortress: ~5 min (harder combat)
- Boss: ~5 min

## Gold & Shop System

### Gold
- `GameState.gold` tracks player gold (starts at 0)
- Enemies drop gold on death: ice wolves 5g, shadow beasts 8g, stone golems 12g
- Gold shown in HUD (top-right, coin icon + number)

### Shop (1 per village)
- Health Potion: 50g — restores 50 HP instantly
- Max HP Up: 100g — increases maxHealth by 25 (one-time per shop)
- Attack Up: 150g — increases damage by 5 (one-time per shop)
- Shop uses DialogueBox-style E key interaction with choices

## Quest System

### GameState Tracking
```js
GameState.quests = {
    tundra: { wolves: false, amulet: false, blizzard: false, miniGame: false },
    darkforest: { mushrooms: false, villager: false, nest: false, miniGame: false },
    ruins: { bridge: false, scroll: false, runes: false, miniGame: false }
};
GameState.gold = 0;
GameState.attackBonus = 0;
```

### Quest Gate
- Fortress entrance checks all 4 quests (3 NPC quests + mini-game) are true
- If not complete: sign reads "The gate is sealed..." + NPC in village says what's left
- If complete: fortress entrance works normally

## Area 1: Frozen Tundra

### Tundra Village
- 3 quest NPCs + 1 shop NPC + 1 mini-game NPC
- Warm wooden buildings on snowy ground
- Safe zone (no enemies)
- **Quest NPC 1 (Hunter):** "Ice wolves are terrorizing us! Kill 5 in the Frozen Lake area."
- **Quest NPC 2 (Elder):** "I lost my amulet in the Snow Cave. Please find it!"
- **Quest NPC 3 (Scout):** "Blizzard Pass is overrun. Clear it out!"
- **Mini-game NPC:** "Test your aim! Hit 5 moving targets."

### Frozen Lake (Sub-area 1)
- 6 ice wolves, kill counter tracks toward quest (kill 5)
- Icy blue ground, frozen water patches
- Exit right to Snow Cave, exit left to Village

### Snow Cave (Sub-area 2)
- 5 ice wolves + hidden amulet item (glowing sprite on ground, press E to pick up)
- Dark cave interior with ice formations
- Exit right to Blizzard Pass, exit left to Frozen Lake

### Blizzard Pass (Sub-area 3)
- 7 tougher ice wolves (HP:25, speed:120)
- Snow blowing effect, narrow path feel
- Quest completes when all enemies dead
- Exit right to Ice Fortress entrance, exit left to Snow Cave

### Target Practice Mini-game
- 5 targets move across screen at random heights/speeds
- Player presses attack key when target is in range
- Hit 5/5 to complete, can retry
- Timer adds pressure (30 seconds)

## Area 2: Dark Forest

### Forest Village
- Treehouse-style buildings, lantern lighting
- **Quest NPC 1 (Herbalist):** "I need 3 glowing mushrooms from the Mushroom Grove."
- **Quest NPC 2 (Mother):** "My child wandered into the Cursed Swamp! Save them!"
- **Quest NPC 3 (Warrior):** "A shadow beast nest in the Hollow Tree must be destroyed."
- **Mini-game NPC:** "Can you survive my obstacle course?"

### Mushroom Grove (Sub-area 1)
- 5 shadow beasts + 3 collectible mushrooms (glowing sprites, press E)
- Bioluminescent mushrooms in background, dark greens
- Exit right to Cursed Swamp, exit left to Village

### Cursed Swamp (Sub-area 2)
- 6 shadow beasts + lost villager NPC at far end (talk to rescue)
- Murky green/purple ground, dead trees
- Exit right to Hollow Tree, exit left to Mushroom Grove

### Hollow Tree (Sub-area 3)
- 8 tougher shadow beasts (HP:20, speed:140)
- Inside a massive hollow tree, dark wood walls
- Quest completes when all enemies dead
- Exit right to Shadow Keep entrance, exit left to Cursed Swamp

### Obstacle Course Mini-game
- Auto-scrolling scene, player must jump over gaps and duck under obstacles
- Reach the end to complete
- 3 lives (hits), can retry

## Area 3: Ancient Ruins

### Ruins Village
- Stone/sandstone buildings, floating rune particles
- **Quest NPC 1 (Builder):** "Stone golems guard the Crumbling Bridge. Defeat them to repair it!"
- **Quest NPC 2 (Scholar):** "An ancient scroll is hidden in the Buried Library. Retrieve it!"
- **Quest NPC 3 (Priestess):** "Activate the 3 rune stones in the Lava Pit to seal the breach."
- **Mini-game NPC:** "Test your mind! Repeat the rune sequence."

### Crumbling Bridge (Sub-area 1)
- 5 stone golems, kill all to "repair bridge" (quest complete)
- Sandy ground, broken stone pillars, bridge structure
- Exit right to Buried Library, exit left to Village

### Buried Library (Sub-area 2)
- 6 stone golems + hidden scroll item (press E to pick up)
- Dark stone interior, bookshelves, floating dust
- Exit right to Lava Pit, exit left to Crumbling Bridge

### Lava Pit (Sub-area 3)
- 7 tougher stone golems (HP:70, speed:50)
- 3 rune stones to activate (press E near each, after clearing nearby enemies)
- Red/orange lava glow, cracked ground
- Exit right to Shattered Temple entrance, exit left to Buried Library

### Memory Puzzle Mini-game
- 4 rune symbols light up in sequence (starts at 3, goes to 5)
- Player repeats sequence by pressing corresponding keys
- Complete 3 rounds to win, can retry

## New Scenes (15 total)

1. `TundraVillageScene`
2. `FrozenLakeScene`
3. `SnowCaveScene`
4. `BlizzardPassScene`
5. `TundraTargetPracticeScene`
6. `ForestVillageScene`
7. `MushroomGroveScene`
8. `CursedSwampScene`
9. `HollowTreeScene`
10. `ForestObstacleCourseScene`
11. `RuinsVillageScene`
12. `CrumblingBridgeScene`
13. `BuriedLibraryScene`
14. `LavaPitScene`
15. `RuinsMemoryPuzzleScene`

## Modified Existing Scenes

- `IceFortressScene` — add quest gate check
- `ShadowKeepScene` — add quest gate check
- `ShatteredTempleScene` — add quest gate check
- `HUD.js` — add gold display
- `VictoryScene` — transition to TundraVillage instead of Tundra

## Scene Flow

```
VictoryScene → TundraVillageScene ←→ FrozenLake ←→ SnowCave ←→ BlizzardPass
                                                                    ↓ (quests done)
                                                              IceFortressScene
                                                                    ↓
                                                            FrostGiantArena
                                                                    ↓
ForestVillageScene ←→ MushroomGrove ←→ CursedSwamp ←→ HollowTree
                                                           ↓ (quests done)
                                                     ShadowKeepScene
                                                           ↓
                                                     ShadowLordArena
                                                           ↓
RuinsVillageScene ←→ CrumblingBridge ←→ BuriedLibrary ←→ LavaPit
                                                            ↓ (quests done)
                                                      ShatteredTempleScene
                                                            ↓
                                                      RuneGuardianArena
                                                            ↓
                                                      FinalVictoryScene
```

Note: Villages also link to their mini-game scene (enter a building). Sub-areas allow going back (left = previous area).

## New Sprites Needed

- Collectible items: amulet, mushroom, scroll, rune stone (16x16 each, simple glowing sprites)
- Village NPCs: shopkeeper, quest givers (reuse blacksmith style, different colors)
- Lost villager child (16x24, simple)
- Target for mini-game (16x16)
- Gold coin for drops (8x8)
- Obstacle course objects (16x16 spikes/barriers)

## New Backgrounds Needed (15)

- 3 village backgrounds (800x450)
- 9 sub-area backgrounds (800x450) — 3 per wilderness region
- 3 mini-game backgrounds (800x450)
