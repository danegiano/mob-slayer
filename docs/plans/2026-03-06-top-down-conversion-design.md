# Mob Slayer: Top-Down Conversion Design

## Overview
Convert Mob Slayer from a side-scrolling platformer to a top-down action RPG (Zelda-style). Player walks in 4 directions, attacks in the direction they're facing, and dashes in the direction they're moving. Conversion happens gradually, region by region.

## Approach: Gradual Conversion
Convert the game in phases so each phase is playable and testable before moving on.

### Phase 1: Core + Early Game
- Player.js (4-direction movement, no gravity)
- Enemy.js (2D chase + knockback)
- New top-down sprite
- Scenes: Village, WoodsDay, WoodsNight, BossArena, Victory

### Phase 2: Tundra Region
- TundraVillage, FrozenLake, SnowCave, BlizzardPass
- TundraTargetPracticeScene, TundraScene, IceFortressScene
- FrostGiantArenaScene + FrostGiant boss conversion

### Phase 3: Forest Region
- ForestVillageScene, MushroomGroveScene, CursedSwampScene, HollowTreeScene
- ForestObstacleCourseScene, DarkForestScene, ShadowKeepScene
- ShadowLordArenaScene + ShadowLord boss conversion

### Phase 4: Ruins Region
- RuinsVillageScene, CrumblingBridgeScene, BuriedLibraryScene, LavaPitScene
- RuinsMemoryPuzzleScene, RuinsScene, ShatteredTempleScene
- RuneGuardianArenaScene + RuneGuardian boss conversion

## Player Movement
- WASD / Arrow keys move in all 4 directions at 200 px/sec
- No gravity, no jumping
- Facing direction tracked as 'up', 'down', 'left', 'right' (last direction moved)
- Dodge/dash (Shift) launches in the direction currently moving, not facing
- Player spawns near center of each scene

## New Top-Down Sprite
- 3/4 top-down view pixel art (Pokemon/Stardew Valley style)
- 4 directions with 2 frames each = 8 frames total
- Size: 32x32 pixels (square for top-down)
- Created using pixel-art skill
- Attack: sword slash hitbox in facing direction (art added later)

## Combat
- Space to attack in facing direction
- Hitbox rectangle spawns in front of player (up/down/left/right)
- Combo system unchanged (rapid taps for multi-hit)

## Enemy Changes
- Chase player on both X and Y axes
- Knockback pushes away from hit direction (not just left/right)

## Boss Changes
- Remove gravity-dependent movement
- Charge attacks work in 2D (boss charges toward player position)
- Patterns stay similar, adapted for free movement
- Each boss converted with its region

## Scene Changes
- Remove ground rectangles and ground colliders
- Remove gravity (arcade.gravity.y = 0)
- Exit zones at screen edges for transitions (top/bottom/left/right)
- Fixed 800x450 screens, no scrolling
- Backgrounds stay the same
- Player spawns center-ish

## Controls
| Key | Action |
|-----|--------|
| W / Arrow Up | Walk up |
| S / Arrow Down | Walk down |
| A / Arrow Left | Walk left |
| D / Arrow Right | Walk right |
| Space | Attack (direction facing) |
| Shift | Dash (direction moving) |
| E | Talk to NPCs |
