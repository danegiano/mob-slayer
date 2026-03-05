# Wilderness Expansion Design

## Overview

After defeating the troll boss, a stone wall cracks open. The player walks through into the Wilderness — 3 new areas with roaming enemies, fortresses, and bosses. Each boss defeated adds a new Japanese kanji to the sword and unlocks a special power.

## Entry

- Beat the troll → wall cracks open behind where the troll was
- Walk through → brief "combo unlocked" moment
- Enter the Wilderness (Frozen Tundra first area)

## Area 1: Frozen Tundra

- **Background:** White/ice blue sky, snow ground, dead frozen trees, falling snow
- **Enemies:** Ice Wolves — fast, low health, attack in packs (2-3 at a time)
- **Fortress:** Ice Fortress — dark blue stone walls
- **Boss:** Frost Giant
  - Slam: creates ice wave on ground
  - Throw: tosses ice boulders (dodge or jump)
  - Breath: freezing cone attack
- **Reward:** Kanji 氷 (ice) → Ice Slash — leaves freezing trail that slows enemies

## Area 2: Dark Forest

- **Background:** Very dark greens/blacks, twisted trees, glowing mushrooms
- **Enemies:** Shadow Beasts — teleport short distances, hit hard, fragile
- **Fortress:** Shadow Keep — twisted dark wood and stone
- **Boss:** Shadow Lord
  - Split: creates copies of itself
  - Dash: phases through player
  - Summon: spawns shadow beasts mid-fight
- **Reward:** Kanji 影 (shadow) → Shadow Strike — dash attack through enemies

## Area 3: Ancient Ruins

- **Background:** Sandy brown/gray, crumbling pillars, floating stones
- **Enemies:** Stone Golems — slow, tough, lots of health
- **Fortress:** The Shattered Temple — ancient stone, glowing runes
- **Boss:** Rune Guardian
  - Beam: energy beam attack
  - Wall: creates stone barriers
  - Pound: ground smash with shockwave
- **Reward:** Kanji 力 (power) → Power Wave — ranged energy slash projectile

## Wilderness Layout

Boss Arena wall → Frozen Tundra (with Ice Fortress) → Dark Forest (with Shadow Keep) → Ancient Ruins (with Shattered Temple)

Each area is a separate scene. Fortresses are entered by walking to the fortress entrance. Each area has 3-5 roaming enemies.

## Sword Upgrade System

- GameState tracks which kanji are unlocked: `swordPowers: []`
- Each power is a special attack activated differently than normal attack
- Powers display as glowing kanji on the sword/HUD
- After all 3 bosses: final victory screen with all kanji glowing

## New Sprites Needed

- Ice Wolf (24x24, 2 frames)
- Shadow Beast (24x24, 2 frames)
- Stone Golem (32x32, 2 frames)
- Frost Giant (64x80, 2 frames)
- Shadow Lord (64x64, 2 frames)
- Rune Guardian (64x80, 2 frames)
- 3 wilderness backgrounds (800x450 each)
- 3 fortress backgrounds (800x450 each)
- 3 boss arena backgrounds (800x450 each)

## Scenes to Add

1. TundraScene (wilderness area)
2. IceFortressScene (fortress interior)
3. FrostGiantArena (boss fight)
4. DarkForestScene (wilderness area)
5. ShadowKeepScene (fortress interior)
6. ShadowLordArena (boss fight)
7. RuinsScene (wilderness area)
8. ShatteredTempleScene (fortress interior)
9. RuneGuardianArena (boss fight)
10. FinalVictoryScene (all kanji unlocked)
