# Mob Slayer — Game Design

## Overview

A 2D side-view exploration game built with Phaser 3. The player lives in a village, discovers a mysterious sword in the woods, and must fight creatures and a giant troll boss.

## Story

1. You live in a small village. You have a wood sword.
2. You go to the woods and find a mysterious sword: "Slayer of the Mobs".
3. You bring it back to the village. The blacksmith offers 1000 gold — you refuse.
4. You return to the woods. Small creatures attack you.
5. You fight through them and reach the troll boss.
6. Defeat the troll to win.

## Architecture: Scene-Based

Each area is a separate Phaser scene. Walking to the edge transitions to the next scene.

### Scenes

1. **Village** — peaceful, walk around, talk to blacksmith NPC. Exit right leads to woods.
2. **Woods** — find the sword, fight small creatures. Exit left leads to village, exit right leads to boss arena.
3. **Boss Arena** — deep in the woods, fight the giant troll.

## Player

- **Movement:** Arrow keys or WASD to walk left/right and jump
- **Attack:** Spacebar — press multiple times for a 3-hit combo (slash, slash, big swing)
- **Dodge:** Shift key — quick dash with brief invincibility
- **Health bar** displayed on screen
- **Weapons:**
  - Wood sword (starting) — low damage
  - Slayer of the Mobs (found in woods) — high damage

## Enemies

### Small Creatures (slimes/goblins)
- Low health
- Basic AI: walk toward player, attack when close
- Appear in the woods after finding the sword

### Troll Boss
- Large sprite, high health
- Attack patterns:
  - Ground slam — area damage, dodge roll to avoid
  - Club swing — dodge by jumping
  - Charge attack — run away to avoid
- Health bar displayed on screen

## NPCs & Dialogue

- **Blacksmith** in the village — press E to talk
- Dialogue system: text box at bottom of screen, press E to advance
- Story dialogue about the sword's meaning and the 1000 gold offer

## Art Style (Version 1)

- Colored rectangles as placeholders for fast prototyping
  - Player: blue
  - Small creatures: green
  - Troll boss: big red
  - Blacksmith: orange
  - Ground/platforms: brown
  - Sky: light blue background
- Swap in real sprites later

## Tech Stack

- **Phaser 3** — game framework
- **JavaScript** — game logic
- **HTML** — single index.html to run in browser
- No build tools needed — just open in browser

## Version 1 Scope

Included:
- 3 scenes (village, woods, boss arena)
- Player movement, jumping, combo attacks, dodge roll
- Blacksmith NPC with dialogue
- Mysterious sword pickup
- Small creature enemies
- Troll boss fight
- Win condition (defeat troll)

Not included (future versions):
- Wood/coal gathering tasks
- Inventory system
- More NPCs
- More areas (caves, castles)
- Real sprite art
- Sound effects and music
