# Enemy Powers Design

## Overview

Give each enemy type a unique special ability that activates during combat, making fights more interesting and requiring dodging/strategy.

## Enemy Powers

### Night Goblin — Teleport
- Every 4 seconds, goblin flashes purple, disappears, reappears behind player
- Small poof particle effect on vanish and appear
- 0.5 second delay where it's invisible (can't be hit)
- Only when within aggro range

### Ice Wolf — Ice Shard
- Every 5 seconds, wolf stops and flashes blue, shoots an ice shard toward player
- Shard is a small blue rectangle, speed 200
- Deals 8 damage on hit (reduced by armor), destroyed on contact or after 3 seconds
- Only when within aggro range

### Shadow Beast — Shadow Dash
- Every 4 seconds, beast turns dark red and dashes at 3x speed toward player
- Dash lasts 0.5 seconds, deals 1.5x normal damage if it hits
- After dash, pauses for 0.5 seconds (vulnerable)
- Only when within aggro range

### Stone Golem — Ground Slam
- Every 6 seconds, golem stops, jumps up slightly, slams down
- Expanding shockwave ring visual around it
- Anything within 80px takes 15 damage (reduced by armor)
- 0.3 second wind-up with yellow flash as warning
- Only when within aggro range

## Rules
- Powers only activate when enemy is within aggro range
- Powers don't activate when enemy is frozen or burning
- All powers have cooldowns to prevent spam
- Visual warnings before each attack so player can dodge
