# Village Walkabout — Design

## Goal

Player walks around the Kenney Tiny Town village with arrow keys. Camera follows. Can't walk through buildings or trees.

## Camera Style

Top-down (like Zelda/Pokemon). Matches the Kenney Tiny Town art.

## Story

Same as original — find the モブスレイヤー sword, fight cursed creatures, beat the troll boss. This is just the first scene: exploring the village.

## What We're Building

1. **Map** — Kenney village_bg.png as background. Invisible collision rectangles on buildings, trees, fences, castle.
2. **Player** — Tile 128 from Kenney Tiny Town (blue helmet knight). Moves in 4 directions with arrow keys/WASD.
3. **Camera** — Follows player, bounded to the map size so it doesn't show empty space.
4. **Collisions** — Arcade physics. Static rectangles placed over solid objects.

## Not Included (Yet)

- Combat / attacking
- NPCs / dialogue
- Scene transitions (woods, boss arena)
- Sound effects
- Kenney Tiny Dungeon sprites (future upgrade)

## Tech

- Phaser 3 (CDN)
- Arcade physics (simple AABB collisions)
- No build tools
