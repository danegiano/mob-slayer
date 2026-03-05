# Mob Slayer v2 — Fresh Rebuild Design

## Overview

A 2D side-view action game built with Phaser 3. Same story as v1 but rebuilt from scratch with a cleaner approach: separate JS files, single background images (no tilemaps), and pixel art sprites.

## Story Flow

1. Wake up in a **village** with a **wood sword**
2. Walk into the **woods** and find a glowing sword — **モブスレイヤー** (Mob Slayer)
3. Bring it back. The **blacksmith** offers 1000 gold — you refuse
4. **Night falls.** Cursed creatures attack in the dark woods
5. Fight through to the **troll boss**
6. Beat the troll. A Japanese letter glows on the sword — **combo attacks unlocked!**
7. Victory screen — teases sequel

## Project Structure

```
mob-slayer/
  index.html              ← loads Phaser CDN + all JS files
  js/
    main.js               ← Phaser config, starts game
    Player.js             ← movement, attack, animations
    Enemy.js              ← base enemy class
    TrollBoss.js          ← boss with 3 attack patterns
    HUD.js                ← health bar, score
    DialogueBox.js        ← NPC text boxes
    scenes/
      VillageScene.js
      WoodsDayScene.js
      WoodsNightScene.js
      BossArenaScene.js
      VictoryScene.js
  assets/
    player.png            ← sprite sheet
    goblin.png            ← cursed creature sprite
    troll.png             ← boss sprite
    blacksmith.png        ← NPC sprite
    backgrounds/
      village-bg.png
      woods-day-bg.png
      woods-night-bg.png
      boss-arena-bg.png
```

## Player & Combat

- **Controls:** Arrow keys/WASD (move/jump), Spacebar (attack), Shift (dodge roll), E (talk)
- **Wood sword** — starting weapon, low damage, single attacks
- **モブスレイヤー** — found in woods, high damage
- **Combo system** — unlocked after beating troll: press spacebar 3x fast for slash → slash → BIG swing
- **Physics:** Phaser Arcade Physics, gravity, rectangle hitboxes

## Enemies

### Cursed Creatures (Woods at Night)
- Small, low health, walk toward player and attack when close
- Spawn in waves as player progresses

### Troll Boss
- Large sprite, health bar on screen
- 3 attacks: Ground Slam (dodge), Club Swing (jump), Charge (move away)
- Defeating triggers combo unlock

## Scenes

| Scene | Description | Exit |
|-------|-------------|------|
| Village | Walk around, talk to blacksmith | Right → Woods Day |
| Woods Day | Explore, find Slayer sword | Left → Village |
| Woods Night | Fight cursed creatures | Right → Boss Arena |
| Boss Arena | Troll boss fight | Win → Victory |
| Victory | Combo unlocked, sequel tease | — |

## Art Style

- Basic pixel art sprites for characters/enemies
- Single background images per scene (no tilemaps)
- Invisible physics rectangles for ground/platforms, positioned to match backgrounds

## Tech Stack

- Phaser 3 via CDN
- Vanilla JavaScript (separate files, loaded via script tags)
- No build tools — open index.html in browser

## Build Order

1. Player movement + attack in a test scene
2. Village scene with blacksmith NPC
3. Woods Day + sword pickup
4. Woods Night + cursed creatures
5. Boss Arena + troll fight
6. Combo unlock + Victory scene
