# Visual Upgrade Design

## Overview

Generate pixel art PNG backgrounds for all 4 gameplay scenes using a Python script with Pillow. Replace the colored rectangles with proper pixel art backgrounds.

## Scenes

### Village (800x450)
- Gradient sky (light blue → white), fluffy clouds, distant mountains
- 2-3 houses with peaked roofs, wooden walls, glowing windows, doors
- Blacksmith area near center
- Layered grass ground, dirt path, fence posts, flowers

### Woods Day (800x450)
- Green-filtered sky, dappled light
- Tall trees with leafy canopy, varying heights
- Bushes/undergrowth, dirt path, sunbeams

### Woods Night (800x450)
- Dark navy sky with stars and moon
- Dark tree silhouettes, fog/mist at ground level
- Dark earth, dead grass, creepy glowing eyes in bushes

### Boss Arena (800x450)
- Dark red/black stormy sky
- Stone floor with cracks, broken pillars on sides

## Tech

- Python script: `generate_backgrounds.py`
- Uses Pillow to draw pixel art
- Outputs to `assets/backgrounds/`
- Game loads as Phaser images (no tilemaps)
