# Visual Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade all game sprites to higher quality 48x48 pixel art with more animation frames (walk, attack, death).

**Architecture:** Generate all new sprites via Python/PIL as base64-encoded PNG sprite sheets. Replace SPRITE_DATA entries in main.js, update BootScene frame definitions and animation creation, then update Player.js/Enemy.js to use new animations. Adjust physics bodies for larger sprites.

**Tech Stack:** Python 3 with PIL/Pillow for sprite generation, Phaser 3.80.1, vanilla JavaScript

---

### Task 1: Generate Player Sprite Sheets

**Files:**
- Create: `tools/generate_sprites.py`

**Goal:** Generate two 48x48 player sprite sheets (normal + slayer variant) with idle, walk, and attack animations in 4 directions.

**Sprite sheet layout (per player variant):**
- Row 0 (down): 2 idle + 4 walk + 3 attack = 9 frames
- Row 1 (left): 9 frames
- Row 2 (right): 9 frames
- Row 3 (up): 9 frames
- Total: 36 frames per variant, sheet size = 432 x 192 pixels

**Step 1: Create the sprite generation script**

Create `tools/generate_sprites.py` with a `generate_player()` function that:

1. Creates a 432x192 image (9 columns x 4 rows of 48x48 frames)
2. For each direction (down, left, right, up), draws:
   - **Idle frames (0-1):** Character standing with subtle arm position shift
   - **Walk frames (2-5):** 4-frame walk cycle with leg movement and body bob
   - **Attack frames (6-8):** Sword swing in 3 stages (wind-up, swing, follow-through)
3. Character details at 48x48:
   - Dark outline (1px border around character)
   - Head: 14x14 with hair (brown), skin (peach), eyes (2px dots)
   - Body: 16x20 tunic (green for normal, dark purple for slayer)
   - Arms: 6x12 with skin color, holding sword during attack frames
   - Legs: 6x14 with brown boots, animated during walk
   - Sword: visible on hip during idle/walk, swinging during attack (grey for normal, purple glow for slayer)
4. Uses 2-3 shade colors per surface (light, mid, dark) for depth
5. Saves as base64 string and prints it

**Player color palette:**
```python
SKIN = [(255, 220, 177), (230, 190, 150), (200, 160, 120)]  # light, mid, dark
HAIR = [(139, 90, 43), (110, 70, 30)]
TUNIC_NORMAL = [(76, 153, 76), (50, 120, 50), (35, 90, 35)]  # green
TUNIC_SLAYER = [(120, 60, 160), (90, 40, 130), (65, 25, 100)]  # purple
BOOTS = [(101, 67, 33), (80, 50, 25)]
SWORD_NORMAL = [(192, 192, 192), (160, 160, 160)]
SWORD_SLAYER = [(180, 100, 255), (140, 60, 220)]
OUTLINE = (30, 30, 30)
```

**Step 2: Run the script and verify output**

Run: `cd /home/dane/Games/mob-slayer && python3 tools/generate_sprites.py`
Expected: Base64 strings printed for `player` and `player_slayer`

**Step 3: Commit**

```bash
git add tools/generate_sprites.py
git commit -m "add sprite generation script with player sprites"
```

---

### Task 2: Generate Enemy Sprite Sheets

**Files:**
- Modify: `tools/generate_sprites.py`

**Goal:** Add generation functions for all 5 enemy types at 48x48 with idle, walk, and death animations.

**Enemy sprite sheet layout (per enemy):**
- 2 idle + 3 walk + 3 death = 8 frames per enemy
- Sheet size = 384 x 48 pixels (8 columns x 1 row)

**Step 1: Add enemy generation functions**

Add `generate_enemy(name, palette)` that creates 384x48 sprite sheets for each enemy:

**Goblin (48x48):**
- Green skin, pointy ears, small loincloth, tiny dagger
- Palette: skin `(76, 175, 80)`, dark `(56, 142, 60)`, loincloth `(139, 90, 43)`
- Idle: slight body sway between 2 frames
- Walk: 3 frames with hopping motion (legs alternate)
- Death: flash white, shrink, poof particles

**Night Goblin (48x48):**
- Dark purple skin, yellow glowing eyes, hooded cloak
- Palette: skin `(80, 40, 100)`, cloak `(50, 25, 70)`, eyes `(255, 255, 0)`
- Same frame layout as goblin but with hood and glowing eyes

**Ice Wolf (48x48):**
- White/light blue fur, quadruped stance, fangs, icy breath wisps
- Palette: fur `(200, 220, 255)`, dark `(150, 180, 220)`, fangs `(255, 255, 255)`
- Idle: breathing motion (slight size change)
- Walk: 3 frames of trotting animation (front/back legs alternate)
- Death: shatters into ice shards

**Shadow Beast (48x48):**
- Dark smoky body, hunched, red glowing eyes, sharp claws
- Palette: body `(40, 20, 50)`, smoke `(60, 30, 70)`, eyes `(255, 0, 0)`, claws `(80, 80, 80)`
- Idle: smoke wisps shift position
- Walk: 3 frames of prowling animation
- Death: dissolves into smoke

**Stone Golem (48x48):**
- Grey/brown rock body, bulky, glowing orange rune cracks, mossy patches
- Palette: rock `(130, 130, 130)`, dark `(90, 90, 90)`, runes `(255, 165, 0)`, moss `(80, 120, 60)`
- Idle: rune glow pulses (brighter/dimmer between frames)
- Walk: 2 frames of heavy stomping (stone golem is slower)
- Death: crumbles into rocks

**Step 2: Run script and verify output**

Run: `python3 tools/generate_sprites.py`
Expected: Base64 strings for all 5 enemies

**Step 3: Commit**

```bash
git add tools/generate_sprites.py
git commit -m "add enemy sprite generation (goblin, night goblin, ice wolf, shadow beast, stone golem)"
```

---

### Task 3: Generate Boss and NPC Sprite Sheets

**Files:**
- Modify: `tools/generate_sprites.py`

**Goal:** Add generation for 4 bosses at 96x96 and 6 NPCs at 48x64.

**Boss sprite sheet layout (per boss):**
- 2 idle frames, sheet = 192 x 96

**Bosses to generate:**

**Troll (96x96):** Massive green body, brown club, white tusks, scarred skin
- Palette: skin `(76, 140, 76)`, dark `(50, 100, 50)`, club `(120, 80, 40)`, tusks `(240, 240, 220)`

**Frost Giant (96x96):** Ice-blue skin, frost armor plates, icicle crown
- Palette: skin `(140, 180, 220)`, armor `(100, 150, 200)`, ice `(200, 230, 255)`

**Shadow Lord (96x96):** Dark robes, floating pose (no feet visible), purple energy orbs at hands
- Palette: robe `(30, 15, 45)`, energy `(160, 80, 255)`, eyes `(255, 0, 0)`

**Rune Guardian (96x96):** Stone construct body, glowing blue rune symbols across body, crystal core in chest
- Palette: stone `(120, 120, 130)`, runes `(0, 180, 255)`, crystal `(0, 255, 200)`

**NPC sprite sheet layout (per NPC):**
- 2 idle frames at 48x64, sheet = 96 x 64

**NPCs to generate:**

**Blacksmith (48x64):** Brown apron, muscular arms, hammer in hand
**Shopkeeper (48x64):** Blue merchant robe, coin pouch on belt
**Village NPC 1 (48x64):** Simple brown tunic, farmer hat
**Village NPC 2 (48x64):** Blue dress, apron (female villager)
**Village NPC 3 (48x64):** Grey robe, walking stick (elder)
**Lost Child (32x40):** Small, simple clothes, messy hair

**Step 1: Add boss and NPC generation functions**

Add `generate_boss(name, width, height, palette)` and `generate_npc(name, palette)` functions.

**Step 2: Run and verify**

Run: `python3 tools/generate_sprites.py`
Expected: Base64 for 4 bosses, 6 NPCs

**Step 3: Commit**

```bash
git add tools/generate_sprites.py
git commit -m "add boss and NPC sprite generation"
```

---

### Task 4: Update SPRITE_DATA and BootScene Frame Definitions

**Files:**
- Modify: `js/main.js:76-110` (SPRITE_DATA)
- Modify: `js/main.js:135-398` (BootScene.onSpritesLoaded)

**Goal:** Replace all base64 sprite data with new larger sprites and update frame slicing + animation creation.

**Step 1: Replace SPRITE_DATA entries**

Replace the base64 strings for these keys with the output from the generation script:
- `player`, `player_slayer` (new 432x192 sheets)
- `goblin`, `night_goblin`, `ice_wolf`, `shadow_beast`, `stone_golem` (new 384x48 sheets)
- `troll`, `frost_giant`, `shadow_lord`, `rune_guardian` (new 192x96 sheets)
- `blacksmith`, `shopkeeper`, `village_npc_1`, `village_npc_2`, `village_npc_3` (new 96x64 sheets)
- `lost_child` (new 64x40 sheet)

Keep unchanged: `collectible`, `gold_coin`, `target`, `tree`, `house`, `well`, `sword_pickup`, `sword_slash`, `chest_closed`, `chest_open`, `cracked_rock`, `rock_debris`, `locked_door`, `open_door`, `lore_scroll`, `hidden_tree`

**Step 2: Update BootScene frame definitions for player**

Replace the player frame setup (lines 136-180) with:

```javascript
// Player: 36 frames of 48x48 (4 rows x 9 cols)
// Layout per row: idle(2) + walk(4) + attack(3)
// Rows: down, left, right, up
for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 9; col++) {
        this.textures.get('player').add(row * 9 + col, 0, col * 48, row * 48, 48, 48);
    }
}

const dirs = ['down', 'left', 'right', 'up'];
dirs.forEach((dir, row) => {
    const base = row * 9;
    this.anims.create({
        key: 'player_idle_' + dir,
        frames: [{ key: 'player', frame: base }, { key: 'player', frame: base + 1 }],
        frameRate: 3, repeat: -1
    });
    this.anims.create({
        key: 'player_walk_' + dir,
        frames: [
            { key: 'player', frame: base + 2 }, { key: 'player', frame: base + 3 },
            { key: 'player', frame: base + 4 }, { key: 'player', frame: base + 5 }
        ],
        frameRate: 8, repeat: -1
    });
    this.anims.create({
        key: 'player_attack_' + dir,
        frames: [
            { key: 'player', frame: base + 6 }, { key: 'player', frame: base + 7 },
            { key: 'player', frame: base + 8 }
        ],
        frameRate: 12, repeat: 0
    });
});
```

**Step 3: Update BootScene frame definitions for player_slayer**

Same layout as player:

```javascript
// Player Slayer: same 36-frame layout
for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 9; col++) {
        this.textures.get('player_slayer').add(row * 9 + col, 0, col * 48, row * 48, 48, 48);
    }
}

dirs.forEach((dir, row) => {
    const base = row * 9;
    this.anims.create({
        key: 'slayer_idle_' + dir,
        frames: [{ key: 'player_slayer', frame: base }, { key: 'player_slayer', frame: base + 1 }],
        frameRate: 3, repeat: -1
    });
    this.anims.create({
        key: 'slayer_walk_' + dir,
        frames: [
            { key: 'player_slayer', frame: base + 2 }, { key: 'player_slayer', frame: base + 3 },
            { key: 'player_slayer', frame: base + 4 }, { key: 'player_slayer', frame: base + 5 }
        ],
        frameRate: 8, repeat: -1
    });
    this.anims.create({
        key: 'slayer_attack_' + dir,
        frames: [
            { key: 'player_slayer', frame: base + 6 }, { key: 'player_slayer', frame: base + 7 },
            { key: 'player_slayer', frame: base + 8 }
        ],
        frameRate: 12, repeat: 0
    });
});
```

**Step 4: Update BootScene frame definitions for enemies**

Replace each enemy's frame setup with 8-frame layout:

```javascript
// Enemy helper: 8 frames of 48x48 (idle x2, walk x3, death x3)
['goblin', 'night_goblin', 'ice_wolf', 'shadow_beast', 'stone_golem'].forEach(enemy => {
    for (let i = 0; i < 8; i++) {
        this.textures.get(enemy).add(i, 0, i * 48, 0, 48, 48);
    }
    this.anims.create({
        key: enemy + '_idle',
        frames: [{ key: enemy, frame: 0 }, { key: enemy, frame: 1 }],
        frameRate: 3, repeat: -1
    });
    this.anims.create({
        key: enemy + '_walk',
        frames: [
            { key: enemy, frame: 2 }, { key: enemy, frame: 3 }, { key: enemy, frame: 4 }
        ],
        frameRate: 6, repeat: -1
    });
    this.anims.create({
        key: enemy + '_death',
        frames: [
            { key: enemy, frame: 5 }, { key: enemy, frame: 6 }, { key: enemy, frame: 7 }
        ],
        frameRate: 6, repeat: 0
    });
});
```

**Step 5: Update BootScene frame definitions for bosses**

```javascript
// Bosses: 2 frames of 96x96
['troll', 'frost_giant', 'rune_guardian'].forEach(boss => {
    this.textures.get(boss).add(0, 0, 0, 0, 96, 96);
    this.textures.get(boss).add(1, 0, 96, 0, 96, 96);
    this.anims.create({
        key: boss + '_idle',
        frames: [{ key: boss, frame: 0 }, { key: boss, frame: 1 }],
        frameRate: 2, repeat: -1
    });
});

// Shadow Lord: 2 frames of 96x96
this.textures.get('shadow_lord').add(0, 0, 0, 0, 96, 96);
this.textures.get('shadow_lord').add(1, 0, 96, 0, 96, 96);
this.anims.create({
    key: 'shadow_lord_idle',
    frames: [{ key: 'shadow_lord', frame: 0 }, { key: 'shadow_lord', frame: 1 }],
    frameRate: 3, repeat: -1
});
```

**Step 6: Update BootScene frame definitions for NPCs**

```javascript
// NPCs: 2 frames of 48x64
['blacksmith', 'shopkeeper', 'village_npc_1', 'village_npc_2', 'village_npc_3'].forEach(npc => {
    this.textures.get(npc).add(0, 0, 0, 0, 48, 64);
    this.textures.get(npc).add(1, 0, 48, 0, 48, 64);
    this.anims.create({
        key: npc + '_idle',
        frames: [{ key: npc, frame: 0 }, { key: npc, frame: 1 }],
        frameRate: 2, repeat: -1
    });
});

// Lost Child: 2 frames of 32x40
this.textures.get('lost_child').add(0, 0, 0, 0, 32, 40);
this.textures.get('lost_child').add(1, 0, 32, 0, 32, 40);
this.anims.create({
    key: 'lost_child_idle',
    frames: [{ key: 'lost_child', frame: 0 }, { key: 'lost_child', frame: 1 }],
    frameRate: 2, repeat: -1
});
```

**Step 7: Commit**

```bash
git add js/main.js
git commit -m "update SPRITE_DATA and BootScene for new sprite sizes and animations"
```

---

### Task 5: Update Player.js for New Sprite Size and Attack Animation

**Files:**
- Modify: `js/Player.js`

**Goal:** Adjust physics body for 48x48 sprite, use attack animation instead of just tinting, update hitbox offsets.

**Step 1: Update constructor body size**

Change line 9 from:
```javascript
this.body.setSize(20, 20);
```
to:
```javascript
this.body.setSize(28, 28);
this.body.setOffset(10, 16);
```

**Step 2: Update attack method to play attack animation**

In the `attack()` method, after `this.isAttacking = true;` (line 59), add attack animation playback:

```javascript
// Play attack animation
const prefix = GameState.equipment.sword === 'slayer' ? 'slayer_' : 'player_';
this.play(prefix + 'attack_' + this.facing);
this.once('animationcomplete', () => {
    // Return to idle after attack anim
    const idleKey = prefix + 'idle_' + this.facing;
    this.play(idleKey);
});
```

**Step 3: Update hitbox offsets for larger sprite**

Change the hitbox offset values (lines 86-89) from 25 to 35 to match new sprite size:

```javascript
if (this.facing === 'right') { offsetX = 35; hbH = 24; }
else if (this.facing === 'left') { offsetX = -35; hbH = 24; }
else if (this.facing === 'down') { offsetY = 35; hbW = 24; }
else if (this.facing === 'up') { offsetY = -35; hbW = 24; }
```

**Step 4: Commit**

```bash
git add js/Player.js
git commit -m "update Player.js for 48x48 sprites and attack animations"
```

---

### Task 6: Update Enemy.js for Walk and Death Animations

**Files:**
- Modify: `js/Enemy.js`

**Goal:** Play walk animation when enemy is moving, death animation when enemy dies. Adjust physics body for 48x48.

**Step 1: Update constructor for new body size**

After `this.setScale(1);` (line 9), add:

```javascript
this.body.setSize(32, 32);
this.body.setOffset(8, 12);
```

**Step 2: Update the `update()` method to play walk animation**

In the `update()` method, where the enemy chases the player (around line 80-84), after setting velocity, add animation switching:

```javascript
// Play walk animation when moving
const walkKey = this.enemyType + '_walk';
if (this.anims.currentAnim?.key !== walkKey) {
    this.play(walkKey);
}
```

In the else branch (not in aggro range, lines 90-92), when velocity is 0:

```javascript
// Play idle when stopped
const idleKey = this.enemyType + '_idle';
if (this.anims.currentAnim?.key !== idleKey) {
    this.play(idleKey);
}
```

**Step 3: Update the `die()` method to play death animation**

Replace the existing death fade-out tween (lines 59-64) with:

```javascript
// Play death animation then destroy
if (this.anims.animationManager.exists(this.enemyType + '_death')) {
    this.play(this.enemyType + '_death');
    this.once('animationcomplete', () => {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 200,
            onComplete: () => this.destroy()
        });
    });
} else {
    this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 300,
        onComplete: () => this.destroy()
    });
}
```

**Step 4: Commit**

```bash
git add js/Enemy.js
git commit -m "update Enemy.js for walk/death animations and 48x48 body size"
```

---

### Task 7: Update Boss Classes for 96x96 Size

**Files:**
- Modify: `js/TrollBoss.js`
- Modify: `js/FrostGiant.js`
- Modify: `js/ShadowLord.js`
- Modify: `js/RuneGuardian.js`

**Goal:** Adjust physics bodies for all 4 boss classes to work with 96x96 sprites.

**Step 1: Read all 4 boss files to understand current body setup**

Read each file and find the `body.setSize()` or `setScale()` calls.

**Step 2: Update body sizes**

For each boss class, update the physics body to be proportional to 96x96:

```javascript
// In constructor, after scene.physics.add.existing(this):
this.body.setSize(60, 60);
this.body.setOffset(18, 28);
```

Exact values may vary per boss — the key is that the hitbox is roughly 60-65% of the sprite size, centered slightly lower (since most boss art has a head that extends above the hitbox).

**Step 3: Update attack ranges**

Boss attack ranges may need increasing since their sprites are now bigger. Check each boss's `attackRange` and increase by ~20px if needed.

**Step 4: Commit**

```bash
git add js/TrollBoss.js js/FrostGiant.js js/ShadowLord.js js/RuneGuardian.js
git commit -m "update boss classes for 96x96 sprite size"
```

---

### Task 8: Update index.html Cache Versions and Test

**Files:**
- Modify: `index.html`

**Goal:** Bump cache versions on all modified JS files so browsers load the new code.

**Step 1: Bump versions**

Update these script tag versions:
- `js/main.js` — bump to latest
- `js/Player.js` — bump to latest
- `js/Enemy.js` — bump to latest
- `js/TrollBoss.js` — bump to latest
- `js/FrostGiant.js` — bump to latest
- `js/ShadowLord.js` — bump to latest
- `js/RuneGuardian.js` — bump to latest

**Step 2: Test in browser**

Open the game in a browser and verify:
- [ ] Player sprite is 48x48 and walks/idles in all 4 directions
- [ ] Player attack animation plays (3 frames of sword swing)
- [ ] All 5 enemy types display at 48x48
- [ ] Enemies play walk animation when chasing
- [ ] Enemies play death animation when killed
- [ ] All 4 bosses display at 96x96
- [ ] NPCs display at 48x64
- [ ] No overlapping sprites or broken hitboxes
- [ ] Game still plays correctly (combat, powers, scene transitions)

**Step 3: Commit**

```bash
git add index.html
git commit -m "bump cache versions for visual upgrade"
```

---

### Task 9: Final Polish and Push

**Step 1: Play-test each region**

Walk through at least one scene per region to check sprites look correct:
- Village (NPCs, blacksmith, shopkeeper)
- Woods (goblins, night goblins, troll boss)
- Tundra (ice wolves, frost giant)
- Dark Forest (shadow beasts, shadow lord)
- Ruins (stone golems, rune guardian)

**Step 2: Fix any visual issues found**

Adjust body offsets, animation speeds, or sprite positions as needed.

**Step 3: Push to GitHub**

```bash
git push
```
