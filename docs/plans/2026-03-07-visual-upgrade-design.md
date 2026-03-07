# Visual Upgrade Design

## Overview

Upgrade all game sprites to higher quality pixel art with bigger sizes and more animation frames. Keep the same pixel art style, just better.

## Sprite Sizes

| Category | Old Size | New Size |
|----------|----------|----------|
| Player | 32x32 | 48x48 |
| Enemies | 24x24 | 48x48 |
| Bosses | 64x80 | 96x96 |
| NPCs | 32x48 | 48x64 |
| Items | 16x16 | 16x16 (unchanged) |

## Player Sprite (48x48)

Sprite sheet with 4 directions x multiple states:

| Animation | Frames | Description |
|-----------|--------|-------------|
| idle (4 dirs) | 2 each | Subtle breathing motion |
| walk (4 dirs) | 4 each | Smooth walk cycle with bob |
| attack (4 dirs) | 3 each | Sword swing arc |

Details: hair, tunic, belt, boots, sword on hip. Dark outline, 2-3 color shading.

Also need `player_slayer` variant with purple sword/darker armor.

## Enemy Sprites (48x48)

| Enemy | Idle | Walk | Death | Visual Details |
|-------|------|------|-------|----------------|
| Goblin | 2 | 3 | 3 | Green skin, pointy ears, loincloth, small dagger |
| Night Goblin | 2 | 3 | 3 | Dark purple skin, glowing yellow eyes, hooded cloak |
| Ice Wolf | 2 | 3 | 3 | White/blue fur, icy breath wisps, sharp fangs |
| Shadow Beast | 2 | 3 | 3 | Black smoky body, red glowing eyes, claws |
| Stone Golem | 2 | 2 | 3 | Grey rock body, glowing rune cracks, mossy patches |

Death animation: flash white, crumble/dissolve over 3 frames.

## Boss Sprites (96x96)

| Boss | Idle | Visual Details |
|------|------|----------------|
| Troll | 2 | Massive green body, club, tusks, scarred skin |
| Frost Giant | 2 | Ice-blue skin, frost armor, icicle crown |
| Shadow Lord | 2 | Dark robes, floating, purple energy orbs |
| Rune Guardian | 2 | Stone construct, glowing rune symbols, crystal core |

## NPC Sprites (48x64)

| NPC | Frames | Details |
|-----|--------|---------|
| Blacksmith | 2 | Apron, hammer, muscular |
| Shopkeeper | 2 | Merchant robe, coin pouch |
| Village NPCs 1-3 | 2 each | Varied villager outfits |
| Lost Child | 2 | Small, simple clothes |

## Items (unchanged sizes)

Coins, scrolls, pickups stay at 16x16 or 24x24.

## Generation Method

All sprites generated via Python/PIL script. Programmatic pixel art with:
- Dark outlines for readability
- 2-3 color shading per surface
- Consistent palette per character
- Anti-alias disabled (crisp pixels)

## Code Changes Required

- Update SPRITE_DATA in js/main.js with new base64 sprites
- Update BootScene frame definitions for new sizes (48x48, 96x96, 48x64)
- Update animation creation for new frame counts (walk 4 frames, attack 3 frames, death 3 frames)
- Update Player.js for attack animations and new frame size
- Update Enemy.js for walk/death animations
- Adjust physics body offsets for larger sprites
- Update boss classes for 96x96 size
