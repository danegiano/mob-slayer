# Mob Slayer — Game Design

## Overview

A 2D side-view action game built with Phaser 3. The player lives in a village, discovers a mysterious Japanese sword in the woods, and must fight cursed creatures and a troll boss. Defeating the troll unlocks combo attacks.

## Story Flow

1. You wake up in a **village** with a **wood sword**
2. You walk into the **woods** and find a glowing sword — **"モブスレイヤー"** (Mob Slayer in Japanese)
3. You bring it back. The **blacksmith** says "I'll give you 1000 gold for that sword!" — you say no
4. **Night falls.** You go out into the dark woods. The animals are cursed — they attack you!
5. You fight through cursed creatures until you reach the **troll boss**
6. You beat the troll. A **Japanese letter glows** on the sword — you unlock **combo attacks!**
7. Victory screen — sets up a potential sequel

## Scenes

| Scene | What Happens | Transitions |
|-------|-------------|-------------|
| **Village** | Walk around, talk to blacksmith NPC | Exit right → Woods |
| **Woods (Day)** | Explore, find the Slayer sword | Exit left → Village |
| **Woods (Night)** | Dark version, cursed creatures attack | Exit right → Boss Arena |
| **Boss Arena** | Fight the troll boss | Beat him → Victory + combo unlock |

## Player

- **Movement:** Arrow keys or WASD — walk left/right, jump
- **Attack:** Spacebar — single hit before troll, 3-hit combo after troll
- **Dodge:** Shift — quick dash with brief invincibility
- **Talk:** E — interact with NPCs
- **Health bar** displayed on screen

### Weapons

- **Wood sword** (starting) — low damage, single attacks only
- **モブスレイヤー / Slayer of the Mobs** (found in woods) — high damage, combo unlock after troll

### Combo System

- **Before beating troll:** Single attacks only. Each spacebar press = one swing.
- **After beating troll:** 3-hit combo chain. Press spacebar 3 times fast = slash → slash → BIG swing (extra damage on 3rd hit).

## Enemies

### Cursed Creatures (Woods at Night)

- Small, low health
- Basic AI: walk toward player, attack when close
- Easy to kill — good for practicing combat

### Troll Boss (Boss Arena)

- Large sprite, high health, health bar on screen
- 3 attack patterns:
  - **Ground Slam** — area damage, dodge roll to avoid
  - **Club Swing** — jump over it
  - **Charge** — runs at player, get out of the way
- Defeating troll triggers Japanese letter glow + combo unlock

## NPCs & Dialogue

- **Blacksmith** in village — press E to talk
- Dialogue: text box at bottom of screen, press E to advance
- Key dialogue: blacksmith explains the sword, offers 1000 gold, player refuses

## Art Style (Version 1)

Colored rectangles as placeholders for fast prototyping:
- Player: blue
- Cursed creatures: green
- Troll boss: big red
- Blacksmith: orange
- Ground/platforms: brown
- Sky: light blue (day), dark blue (night)

Real pixel art sprites added later.

## Tech Stack

- **Phaser 3** — game framework (loaded via CDN)
- **JavaScript** — game logic
- **HTML** — single index.html entry point
- No build tools — just open in browser

## Version 1 Scope

**Included:**
- 4 scenes (village, woods day, woods night, boss arena)
- Player movement, jumping, single attacks, dodge roll
- Sword pickup with Japanese text display
- Blacksmith NPC with dialogue
- Cursed creature enemies
- Troll boss fight with 3 attack patterns
- Combo unlock after troll defeat
- Victory screen

**Not included (future versions):**
- Inventory system
- More NPCs and areas
- Real sprite art
- Sound effects and music
- Save system
