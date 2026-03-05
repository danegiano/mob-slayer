# Wilderness Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 3 wilderness areas (Frozen Tundra, Dark Forest, Ancient Ruins) with fortresses, bosses, and a sword kanji power system after defeating the troll.

**Architecture:** The troll victory scene becomes a transition where a wall cracks open. Each wilderness area is a scene with roaming enemies. Walking to the fortress entrance transitions to the fortress scene, then to the boss arena. Defeating each boss unlocks a kanji on the sword with a special power. After all 3 bosses, a final victory screen shows all kanji. New boss classes follow the same pattern as TrollBoss (scheduled attacks, health bar, death animation). New enemies reuse the Enemy class with different stats. Sprites are generated as base64 via Python/Pillow and embedded in SPRITE_DATA.

**Tech Stack:** Phaser 3 (CDN), vanilla JS (no build tools), Python/Pillow for sprite/background generation, base64-embedded sprites

---

## Important Codebase Context

**File structure:**
- `index.html` — loads all JS files via `<script>` tags (order matters!)
- `js/main.js` — `GameState` object, `SPRITE_DATA` (base64), `BootScene` (loads sprites/animations), Phaser config with scene array
- `js/Player.js` — movement, combo attack, dodge. `attackDamage`, `currentHitDamage`, `attackHitbox`
- `js/Enemy.js` — reusable enemy class. Constructor: `(scene, x, y, spriteKey, health)`. Has `speed`, `aggroRange`, `attackRange`, `damage`
- `js/TrollBoss.js` — boss pattern: `scheduleAttack()` → `doAttack()` with random attack selection, health bar at top, `takeDamage()`, `die()`
- `js/HUD.js` — health bar + weapon text display
- `js/DialogueBox.js` — E key dialogue. `update()` returns early with `if (!this.isOpen) return;` — this is critical for E key not being consumed
- `js/scenes/*.js` — each scene: `preload()` loads bg image, `create()` sets up ground/player/enemies, `update()` handles combat + scene transitions via position checks (e.g. `player.x > 750`)

**Scene transition pattern (MUST follow this):**
```javascript
// In update() — position-based, NOT zone overlaps (zones didn't work)
if (!this.transitioning && this.player.x > 750) {
    this.transitioning = true;
    this.scene.start('NextScene');
}
```

**Combat pattern (used in WoodsNightScene, BossArenaScene):**
```javascript
// Player attack hitting enemies
if (this.player.attackHitbox) {
    this.enemies.children.each(enemy => {
        if (enemy.isDead || enemy.justHit) return;
        const b1 = this.player.attackHitbox.getBounds();
        const b2 = enemy.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
            enemy.takeDamage(this.player.currentHitDamage);
            enemy.justHit = true;
            this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
        }
    });
}
```

**Boss combat pattern (from BossArenaScene):**
```javascript
// Player attack hitting boss (same as enemy but single target)
if (this.player.attackHitbox && this.boss && !this.boss.isDead) {
    const b1 = this.player.attackHitbox.getBounds();
    const b2 = this.boss.getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
        if (!this.boss.justHit) {
            this.boss.takeDamage(this.player.currentHitDamage);
            this.boss.justHit = true;
            this.time.delayedCall(300, () => { if (this.boss) this.boss.justHit = false; });
        }
    }
}

// Boss attacks hitting player (distance-based during attacks)
if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
    if (dist < 80 && !this.boss.playerHitThisAttack) {
        GameState.health -= 20;
        if (GameState.health < 0) GameState.health = 0;
        this.boss.playerHitThisAttack = true;
        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => this.player.clearTint());
        this.time.delayedCall(500, () => { if (this.boss) this.boss.playerHitThisAttack = false; });
    }
}
```

**Death/restart pattern:**
```javascript
if (GameState.health <= 0) {
    GameState.health = GameState.maxHealth;
    this.scene.restart();
}
```

**Ground position:** All scenes use invisible ground at y=415, player spawns around y=340.

**GameState currently:**
```javascript
const GameState = {
    health: 100, maxHealth: 100,
    weapon: 'wood',          // 'wood' or 'slayer'
    comboUnlocked: false,
    storyPhase: 0            // 0=start, 1=found sword, 2=talked to blacksmith, 3=night
};
```

---

### Task 1: Update GameState and HUD for sword powers

**Files:**
- Modify: `js/main.js:1-7` (GameState)
- Modify: `js/HUD.js`

**Step 1: Add sword power tracking to GameState**

In `js/main.js`, add `swordPowers` array to GameState:

```javascript
const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood',
    comboUnlocked: false,
    storyPhase: 0,
    swordPowers: []  // Will hold: 'ice', 'shadow', 'power'
};
```

**Step 2: Update HUD to show kanji**

In `js/HUD.js`, add a kanji display below the weapon text. The constructor should add:

```javascript
this.kanjiText = scene.add.text(20, 54, '', {
    fontSize: '16px', fill: '#ff44ff'
}).setScrollFactor(0).setDepth(101);
```

And in `update()`, after the weapon text update, add:

```javascript
const kanjiMap = { ice: '氷', shadow: '影', power: '力' };
const kanji = GameState.swordPowers.map(p => kanjiMap[p]).join(' ');
this.kanjiText.setText(kanji);
```

**Step 3: Commit**

```bash
git add js/main.js js/HUD.js
git commit -m "add sword power tracking to GameState and kanji display to HUD"
```

---

### Task 2: Generate new enemy and boss sprites

**Files:**
- Create: `generate_sprites.py`
- Modify: `js/main.js` (SPRITE_DATA)

**Context:** The existing sprites in `SPRITE_DATA` are base64 PNG images. Each sprite is a horizontal strip with 2 frames side by side. Enemy sprites are 24x24 per frame (48x24 total). Boss sprites are 64x80 per frame (128x80 total). We need to generate 6 new sprites:

- `ice_wolf` — 48x24 (2 frames of 24x24), white/ice blue wolf shape
- `shadow_beast` — 48x24 (2 frames of 24x24), dark purple/black beast
- `stone_golem` — 64x64 (2 frames of 32x32), gray/brown rocky humanoid (bigger than normal enemies)
- `frost_giant` — 128x80 (2 frames of 64x80), ice blue giant
- `shadow_lord` — 128x64 (2 frames of 64x64), dark purple/black humanoid
- `rune_guardian` — 128x80 (2 frames of 64x80), sandy brown/gold stone guardian

**Step 1: Create generate_sprites.py**

Write a Python script using Pillow that generates each sprite as a PNG, then converts to base64 and prints the SPRITE_DATA entries. Each sprite should be simple pixel art — blocky shapes with 2 slightly different frames (e.g., frame 1 = neutral pose, frame 2 = slight movement).

The script should:
1. Generate each sprite image
2. Save to a temp buffer
3. Convert to base64
4. Print the base64 string ready to paste into SPRITE_DATA

For each sprite, use simple geometric shapes:
- **Ice Wolf:** White body oval, blue legs (4 lines), pointy ears, red eyes, tail. Frame 2: legs shifted for walk animation.
- **Shadow Beast:** Dark purple body, glowing yellow eyes, wispy edges. Frame 2: slightly shifted position.
- **Stone Golem:** Gray/brown blocky body, wider than tall, rocky texture dots. Frame 2: arms in different position.
- **Frost Giant:** Tall blue humanoid, icy crown, big fists. Frame 2: slight lean.
- **Shadow Lord:** Dark flowing robes, glowing purple eyes, cape. Frame 2: cape billows differently.
- **Rune Guardian:** Sandy stone body, glowing gold runes (lines), bulky arms. Frame 2: runes glow differently.

**Step 2: Run the script**

```bash
cd /home/dane/Games/mob-slayer && python3 generate_sprites.py
```

**Step 3: Add base64 strings to SPRITE_DATA in js/main.js**

Copy the output base64 strings and add them as new entries in the `SPRITE_DATA` object:

```javascript
const SPRITE_DATA = {
    player: '...',
    goblin: '...',
    blacksmith: '...',
    night_goblin: '...',
    troll: '...',
    ice_wolf: '<paste from script>',
    shadow_beast: '<paste from script>',
    stone_golem: '<paste from script>',
    frost_giant: '<paste from script>',
    shadow_lord: '<paste from script>',
    rune_guardian: '<paste from script>'
};
```

**Step 4: Update BootScene to load new sprites and create animations**

In `js/main.js`, inside `onSpritesLoaded()`, add after the troll animation setup:

```javascript
// Ice Wolf: 2 frames of 24x24
this.textures.get('ice_wolf').add(0, 0, 0, 0, 24, 24);
this.textures.get('ice_wolf').add(1, 0, 24, 0, 24, 24);
this.anims.create({
    key: 'ice_wolf_idle',
    frames: [{ key: 'ice_wolf', frame: 0 }, { key: 'ice_wolf', frame: 1 }],
    frameRate: 4, repeat: -1
});

// Shadow Beast: 2 frames of 24x24
this.textures.get('shadow_beast').add(0, 0, 0, 0, 24, 24);
this.textures.get('shadow_beast').add(1, 0, 24, 0, 24, 24);
this.anims.create({
    key: 'shadow_beast_idle',
    frames: [{ key: 'shadow_beast', frame: 0 }, { key: 'shadow_beast', frame: 1 }],
    frameRate: 5, repeat: -1
});

// Stone Golem: 2 frames of 32x32
this.textures.get('stone_golem').add(0, 0, 0, 0, 32, 32);
this.textures.get('stone_golem').add(1, 0, 32, 0, 32, 32);
this.anims.create({
    key: 'stone_golem_idle',
    frames: [{ key: 'stone_golem', frame: 0 }, { key: 'stone_golem', frame: 1 }],
    frameRate: 2, repeat: -1
});

// Frost Giant: 2 frames of 64x80
this.textures.get('frost_giant').add(0, 0, 0, 0, 64, 80);
this.textures.get('frost_giant').add(1, 0, 64, 0, 64, 80);
this.anims.create({
    key: 'frost_giant_idle',
    frames: [{ key: 'frost_giant', frame: 0 }, { key: 'frost_giant', frame: 1 }],
    frameRate: 2, repeat: -1
});

// Shadow Lord: 2 frames of 64x64
this.textures.get('shadow_lord').add(0, 0, 0, 0, 64, 64);
this.textures.get('shadow_lord').add(1, 0, 64, 0, 64, 64);
this.anims.create({
    key: 'shadow_lord_idle',
    frames: [{ key: 'shadow_lord', frame: 0 }, { key: 'shadow_lord', frame: 1 }],
    frameRate: 3, repeat: -1
});

// Rune Guardian: 2 frames of 64x80
this.textures.get('rune_guardian').add(0, 0, 0, 0, 64, 80);
this.textures.get('rune_guardian').add(1, 0, 64, 0, 64, 80);
this.anims.create({
    key: 'rune_guardian_idle',
    frames: [{ key: 'rune_guardian', frame: 0 }, { key: 'rune_guardian', frame: 1 }],
    frameRate: 2, repeat: -1
});
```

**Step 5: Commit**

```bash
git add generate_sprites.py js/main.js
git commit -m "add new enemy and boss sprites for wilderness areas"
```

---

### Task 3: Generate 9 wilderness background PNGs

**Files:**
- Modify: `generate_backgrounds.py`

**Context:** The existing `generate_backgrounds.py` generates 4 backgrounds using Pillow. We need to add 9 more functions, one for each new scene. All are 800x450 RGBA PNGs saved to `assets/backgrounds/`.

**Step 1: Add 9 new generator functions to generate_backgrounds.py**

Add these functions (using the existing helper functions `fill_gradient`, `blob`, `draw_rect`, `draw_triangle`):

1. **`generate_tundra()`** → `tundra-bg.png`
   - White/ice-blue sky gradient
   - Snow-covered ground (white with light blue shadows)
   - Dead frozen trees (white/gray trunks, no leaves, maybe ice crystals)
   - Falling snow particles (white dots scattered)
   - Ice fortress visible in the background (right side, dark blue stone silhouette)
   - Ground at y~400 with snow

2. **`generate_ice_fortress()`** → `ice-fortress-bg.png`
   - Dark blue interior, ice walls on sides
   - Frozen floor with ice crystal reflections
   - Icicles hanging from ceiling
   - Torches with blue flames on walls
   - Dark blue stone walls like boss arena but icy

3. **`generate_frost_giant_arena()`** → `frost-giant-arena-bg.png`
   - Large icy cavern
   - Frozen stalactites/stalagmites
   - Icy blue floor
   - Blizzard particles (white streaks)
   - Dark atmosphere

4. **`generate_dark_forest()`** → `dark-forest-bg.png`
   - Very dark greens and blacks
   - Twisted gnarled trees (darker than woods-day, more twisted)
   - Glowing mushrooms (cyan/green dots on ground)
   - Eerie purple/green fog
   - Shadow Keep visible in background (dark twisted structure)

5. **`generate_shadow_keep()`** → `shadow-keep-bg.png`
   - Dark interior, twisted wood and stone walls
   - Purple torch flames
   - Dark stone floor
   - Shadow wisps floating (semi-transparent dark shapes)

6. **`generate_shadow_lord_arena()`** → `shadow-lord-arena-bg.png`
   - Completely dark background with purple highlights
   - Floating dark energy orbs
   - Cracked dark floor with purple light seeping through
   - Ominous purple glow

7. **`generate_ruins()`** → `ruins-bg.png`
   - Sandy brown/warm gray sky
   - Crumbling stone pillars and walls
   - Floating stone pieces (rectangles at angles)
   - Sandy ground
   - Shattered Temple visible in background (glowing rune structure)

8. **`generate_shattered_temple()`** → `shattered-temple-bg.png`
   - Ancient stone interior
   - Tall broken pillars
   - Glowing gold runes on walls (small rectangles)
   - Stone floor with cracks
   - Golden light from above

9. **`generate_rune_guardian_arena()`** → `rune-guardian-arena-bg.png`
   - Grand temple interior
   - Massive glowing rune circles on floor
   - Stone pillars with golden runes
   - Floating debris
   - Golden energy beams

**Step 2: Update the `__main__` block to call all new functions**

Add all 9 new function calls after the existing 4.

**Step 3: Run the script**

```bash
cd /home/dane/Games/mob-slayer && python3 generate_backgrounds.py
```

Verify all 13 PNGs exist in `assets/backgrounds/`.

**Step 4: Commit**

```bash
git add generate_backgrounds.py assets/backgrounds/
git commit -m "generate 9 wilderness background images"
```

---

### Task 4: Modify VictoryScene to become wall-crack transition

**Files:**
- Modify: `js/scenes/VictoryScene.js`

**Context:** Currently VictoryScene shows "COMBO UNLOCKED!" and "To be continued...". We need to change it so after the combo unlocked message, a wall cracks open and the player transitions to the Tundra. The scene should show the combo unlock, wait a few seconds, then show a dramatic wall-cracking animation, then auto-transition to TundraScene.

**Step 1: Rewrite VictoryScene.js**

```javascript
class VictoryScene extends Phaser.Scene {
    constructor() { super('Victory'); }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        // Combo unlocked text
        const kanjiText = this.add.text(400, 150, '斬', {
            fontSize: '96px', fill: '#ff44ff'
        }).setOrigin(0.5);

        const comboText = this.add.text(400, 250, 'COMBO UNLOCKED!', {
            fontSize: '32px', fill: '#ffcc00'
        }).setOrigin(0.5);

        const subText = this.add.text(400, 300, 'The モブスレイヤー has awakened.', {
            fontSize: '18px', fill: '#ffffff'
        }).setOrigin(0.5);

        // After 3 seconds, show wall cracking
        this.time.delayedCall(3000, () => {
            // Fade out combo text
            this.tweens.add({
                targets: [kanjiText, comboText, subText],
                alpha: 0, duration: 500
            });

            // Show wall cracking animation
            this.time.delayedCall(600, () => {
                this.showWallCrack();
            });
        });
    }

    showWallCrack() {
        // Dark stone wall
        this.add.rectangle(400, 225, 800, 450, 0x333333);

        // Stone brick pattern
        for (let y = 0; y < 450; y += 30) {
            for (let x = 0; x < 800; x += 50) {
                const offset = (Math.floor(y / 30) % 2) * 25;
                const shade = 0x2a2a2a + Math.floor(Math.random() * 0x101010);
                this.add.rectangle(x + offset + 25, y + 15, 48, 28, shade);
            }
        }

        // Crack text
        const crackText = this.add.text(400, 180, 'The wall trembles...', {
            fontSize: '24px', fill: '#ffcc00'
        }).setOrigin(0.5).setDepth(10);

        // Animated cracks (lines getting bigger)
        const cracks = [];
        for (let i = 0; i < 5; i++) {
            const crack = this.add.rectangle(
                400 + Phaser.Math.Between(-30, 30),
                225 + Phaser.Math.Between(-60, 60),
                2, 10, 0xffcc00
            ).setDepth(10);
            cracks.push(crack);
        }

        // Grow cracks over time
        this.tweens.add({
            targets: cracks,
            scaleX: 3, scaleY: 8,
            duration: 2000,
            ease: 'Power2'
        });

        // Camera shake
        this.time.delayedCall(500, () => {
            this.cameras.main.shake(1500, 0.01);
        });

        // Change text
        this.time.delayedCall(1500, () => {
            crackText.setText('The wall breaks open!');
        });

        // Flash white and transition
        this.time.delayedCall(2500, () => {
            this.cameras.main.flash(500, 255, 255, 255);
            this.time.delayedCall(600, () => {
                this.scene.start('Tundra');
            });
        });
    }
}
```

**Step 2: Commit**

```bash
git add js/scenes/VictoryScene.js
git commit -m "transform VictoryScene into wall-crack transition to wilderness"
```

---

### Task 5: Create Frozen Tundra area (TundraScene + IceFortressScene)

**Files:**
- Create: `js/scenes/TundraScene.js`
- Create: `js/scenes/IceFortressScene.js`

**Step 1: Create TundraScene.js**

This is a wilderness area with 3 ice wolves. Player enters from left, fortress entrance is at the right. Must kill all wolves to proceed.

```javascript
class TundraScene extends Phaser.Scene {
    constructor() { super('Tundra'); }

    preload() {
        this.load.image('tundra-bg', 'assets/backgrounds/tundra-bg.png');
    }

    create() {
        this.add.image(400, 225, 'tundra-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // 3 Ice Wolves — fast, low health, attack in packs
        for (let i = 0; i < 3; i++) {
            const x = 300 + i * 150;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 15);
            enemy.speed = 100;       // fast
            enemy.aggroRange = 250;  // wide aggro
            enemy.damage = 8;        // lower damage per hit
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        this.add.text(400, 50, 'Frozen Tundra', {
            fontSize: '20px', fill: '#88ccff'
        }).setOrigin(0.5);
    }

    update() {
        this.player.update();
        this.hud.update();

        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        // Player attack hitting enemies
        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Enter fortress at right edge after killing all enemies
        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('IceFortress');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 2: Create IceFortressScene.js**

Fortress interior with 4 ice wolves (harder). Exit right leads to boss.

```javascript
class IceFortressScene extends Phaser.Scene {
    constructor() { super('IceFortress'); }

    preload() {
        this.load.image('ice-fortress-bg', 'assets/backgrounds/ice-fortress-bg.png');
    }

    create() {
        this.add.image(400, 225, 'ice-fortress-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // 4 Ice Wolves inside fortress
        for (let i = 0; i < 4; i++) {
            const x = 250 + i * 130;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 20);
            enemy.speed = 110;
            enemy.aggroRange = 300;
            enemy.damage = 10;
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        this.add.text(400, 50, 'Ice Fortress', {
            fontSize: '20px', fill: '#4488ff'
        }).setOrigin(0.5);
    }

    update() {
        this.player.update();
        this.hud.update();

        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('FrostGiantArena');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 3: Commit**

```bash
git add js/scenes/TundraScene.js js/scenes/IceFortressScene.js
git commit -m "add Tundra and Ice Fortress scenes with ice wolves"
```

---

### Task 6: Create FrostGiant boss and arena

**Files:**
- Create: `js/FrostGiant.js`
- Create: `js/scenes/FrostGiantArenaScene.js`

**Step 1: Create FrostGiant.js**

Follow the same pattern as TrollBoss. Frost Giant has 3 attacks:
- **Slam:** Creates ice wave on ground (rectangle visual)
- **Throw:** Tosses ice boulder at player position (projectile rectangle)
- **Breath:** Freezing cone attack (wider hitbox in front)

```javascript
class FrostGiant extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'frost_giant');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('frost_giant_idle');
        this.setScale(2);
        this.setCollideWorldBounds(true);

        this.health = 250;
        this.maxHealth = 250;
        this.isDead = false;
        this.isAttacking = false;
        this.currentAttack = null;
        this.playerHitThisAttack = false;

        this.healthBg = scene.add.rectangle(400, 50, 300, 20, 0x333333).setDepth(100);
        this.healthBar = scene.add.rectangle(400, 50, 300, 20, 0x4488ff).setDepth(101);
        this.nameText = scene.add.text(400, 30, 'FROST GIANT', {
            fontSize: '14px', fill: '#88ccff'
        }).setOrigin(0.5).setDepth(101);

        this.scheduleAttack();
    }

    scheduleAttack() {
        const delay = Phaser.Math.Between(2000, 3500);
        this.attackTimer = this.scene.time.delayedCall(delay, () => {
            if (this.isDead) return;
            this.doAttack();
        });
    }

    doAttack() {
        const attacks = ['slam', 'throw', 'breath'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.playerHitThisAttack = false;

        if (this.currentAttack === 'slam') {
            this.setTint(0x4488ff);
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                // Ice wave on ground
                const wave = this.scene.add.rectangle(this.x, 410, 250, 15, 0x88ccff, 0.6);
                this.scene.time.delayedCall(400, () => wave.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'throw') {
            this.setTint(0xaaddff);
            this.scene.time.delayedCall(400, () => {
                if (this.isDead) return;
                // Ice boulder toward player
                const player = this.scene.player;
                const boulder = this.scene.add.rectangle(this.x, this.y, 20, 20, 0x88ccff, 0.8);
                this.scene.physics.add.existing(boulder, false);
                boulder.body.setAllowGravity(false);
                const dir = player.x > this.x ? 1 : -1;
                boulder.body.setVelocityX(dir * 300);
                boulder.body.setVelocityY(50);
                this.scene.time.delayedCall(1500, () => boulder.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'breath') {
            this.setTint(0x66bbff);
            // Cone attack in front
            const dir = this.flipX ? -1 : 1;
            const breathX = this.x + dir * 80;
            const breath = this.scene.add.rectangle(breathX, this.y, 100, 60, 0x88ccff, 0.4);
            this.scene.time.delayedCall(600, () => {
                if (this.isDead) return;
                breath.destroy();
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        }
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) this.clearTint();
        });
        const ratio = this.health / this.maxHealth;
        this.healthBar.width = 300 * ratio;
        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true;
        if (this.attackTimer) this.attackTimer.remove();
        this.scene.tweens.add({
            targets: this, alpha: 0, duration: 1000,
            onComplete: () => {
                this.healthBg.destroy();
                this.healthBar.destroy();
                this.nameText.destroy();
                this.destroy();
            }
        });
    }
}
```

**Step 2: Create FrostGiantArenaScene.js**

```javascript
class FrostGiantArenaScene extends Phaser.Scene {
    constructor() { super('FrostGiantArena'); }

    preload() {
        this.load.image('frost-giant-arena-bg', 'assets/backgrounds/frost-giant-arena-bg.png');
    }

    create() {
        this.add.image(400, 225, 'frost-giant-arena-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 100, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.boss = new FrostGiant(this, 600, 280);
        this.physics.add.collider(this.boss, this.ground);

        this.bossDefeated = false;
    }

    update() {
        this.player.update();
        this.hud.update();

        // Player attack hitting boss
        if (this.player.attackHitbox && this.boss && !this.boss.isDead) {
            const b1 = this.player.attackHitbox.getBounds();
            const b2 = this.boss.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                if (!this.boss.justHit) {
                    this.boss.takeDamage(this.player.currentHitDamage);
                    this.boss.justHit = true;
                    this.time.delayedCall(300, () => {
                        if (this.boss) this.boss.justHit = false;
                    });
                }
            }
        }

        // Boss defeated -> unlock ice power, go to dark forest
        if (this.boss && this.boss.isDead && !this.bossDefeated) {
            this.bossDefeated = true;
            GameState.swordPowers.push('ice');
            this.showPowerUnlock('氷', 'Ice Slash', 'DarkForest');
        }

        // Boss attacks hitting player
        if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, this.boss.x, this.boss.y
            );
            if (dist < 90 && !this.boss.playerHitThisAttack) {
                GameState.health -= 20;
                if (GameState.health < 0) GameState.health = 0;
                this.boss.playerHitThisAttack = true;
                this.player.setTint(0xff0000);
                this.time.delayedCall(200, () => this.player.clearTint());
                this.time.delayedCall(500, () => {
                    if (this.boss) this.boss.playerHitThisAttack = false;
                });
            }
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }

    showPowerUnlock(kanji, powerName, nextScene) {
        const kanjiText = this.add.text(400, 150, kanji, {
            fontSize: '96px', fill: '#88ccff'
        }).setOrigin(0.5).setDepth(200);

        const nameText = this.add.text(400, 250, powerName + ' Unlocked!', {
            fontSize: '28px', fill: '#ffcc00'
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: [kanjiText, nameText],
            alpha: 0, y: '-=20',
            duration: 2000, delay: 2000,
            onComplete: () => {
                kanjiText.destroy();
                nameText.destroy();
                this.scene.start(nextScene);
            }
        });
    }
}
```

**Step 3: Commit**

```bash
git add js/FrostGiant.js js/scenes/FrostGiantArenaScene.js
git commit -m "add Frost Giant boss and arena scene"
```

---

### Task 7: Create Dark Forest area (DarkForestScene + ShadowKeepScene)

**Files:**
- Create: `js/scenes/DarkForestScene.js`
- Create: `js/scenes/ShadowKeepScene.js`

**Step 1: Create DarkForestScene.js**

Same pattern as TundraScene but with 3 Shadow Beasts. These are fragile but hit hard and are faster.

```javascript
class DarkForestScene extends Phaser.Scene {
    constructor() { super('DarkForest'); }

    preload() {
        this.load.image('dark-forest-bg', 'assets/backgrounds/dark-forest-bg.png');
    }

    create() {
        this.add.image(400, 225, 'dark-forest-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // 3 Shadow Beasts — fragile but hit hard
        for (let i = 0; i < 3; i++) {
            const x = 300 + i * 150;
            const enemy = new Enemy(this, x, 340, 'shadow_beast', 12);
            enemy.speed = 120;
            enemy.aggroRange = 250;
            enemy.damage = 15;
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        this.add.text(400, 50, 'Dark Forest', {
            fontSize: '20px', fill: '#44ff44'
        }).setOrigin(0.5);
    }

    update() {
        this.player.update();
        this.hud.update();

        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('ShadowKeep');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 2: Create ShadowKeepScene.js**

```javascript
class ShadowKeepScene extends Phaser.Scene {
    constructor() { super('ShadowKeep'); }

    preload() {
        this.load.image('shadow-keep-bg', 'assets/backgrounds/shadow-keep-bg.png');
    }

    create() {
        this.add.image(400, 225, 'shadow-keep-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // 4 Shadow Beasts inside keep
        for (let i = 0; i < 4; i++) {
            const x = 250 + i * 130;
            const enemy = new Enemy(this, x, 340, 'shadow_beast', 15);
            enemy.speed = 130;
            enemy.aggroRange = 300;
            enemy.damage = 18;
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        this.add.text(400, 50, 'Shadow Keep', {
            fontSize: '20px', fill: '#9944ff'
        }).setOrigin(0.5);
    }

    update() {
        this.player.update();
        this.hud.update();

        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('ShadowLordArena');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 3: Commit**

```bash
git add js/scenes/DarkForestScene.js js/scenes/ShadowKeepScene.js
git commit -m "add Dark Forest and Shadow Keep scenes with shadow beasts"
```

---

### Task 8: Create ShadowLord boss and arena

**Files:**
- Create: `js/ShadowLord.js`
- Create: `js/scenes/ShadowLordArenaScene.js`

**Step 1: Create ShadowLord.js**

Shadow Lord has 3 attacks:
- **Split:** Creates 2 fake copies (visual only, fade out after 2s)
- **Dash:** Phases through to other side of arena (fast move, invulnerable briefly)
- **Summon:** Spawns 1 shadow beast enemy mid-fight

```javascript
class ShadowLord extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'shadow_lord');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('shadow_lord_idle');
        this.setScale(2);
        this.setCollideWorldBounds(true);

        this.health = 300;
        this.maxHealth = 300;
        this.isDead = false;
        this.isAttacking = false;
        this.currentAttack = null;
        this.playerHitThisAttack = false;

        this.healthBg = scene.add.rectangle(400, 50, 300, 20, 0x333333).setDepth(100);
        this.healthBar = scene.add.rectangle(400, 50, 300, 20, 0x9944ff).setDepth(101);
        this.nameText = scene.add.text(400, 30, 'SHADOW LORD', {
            fontSize: '14px', fill: '#cc88ff'
        }).setOrigin(0.5).setDepth(101);

        this.scheduleAttack();
    }

    scheduleAttack() {
        const delay = Phaser.Math.Between(1500, 3000);
        this.attackTimer = this.scene.time.delayedCall(delay, () => {
            if (this.isDead) return;
            this.doAttack();
        });
    }

    doAttack() {
        const attacks = ['split', 'dash', 'summon'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.playerHitThisAttack = false;

        if (this.currentAttack === 'split') {
            this.setTint(0x9944ff);
            // Create 2 fake copies
            const copy1 = this.scene.add.rectangle(this.x - 80, this.y, 40, 60, 0x9944ff, 0.5);
            const copy2 = this.scene.add.rectangle(this.x + 80, this.y, 40, 60, 0x9944ff, 0.5);
            this.scene.time.delayedCall(2000, () => {
                copy1.destroy();
                copy2.destroy();
            });
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'dash') {
            this.setTint(0x6622cc);
            this.setAlpha(0.3);
            const player = this.scene.player;
            const targetX = player.x > this.x ? player.x + 100 : player.x - 100;
            this.scene.tweens.add({
                targets: this,
                x: Phaser.Math.Clamp(targetX, 50, 750),
                duration: 300,
                onComplete: () => {
                    if (this.isDead) return;
                    this.setAlpha(1);
                    this.clearTint();
                    this.isAttacking = false;
                    this.scheduleAttack();
                }
            });
        } else if (this.currentAttack === 'summon') {
            this.setTint(0xff44ff);
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                // Spawn a shadow beast if the scene has an enemies group
                if (this.scene.enemies) {
                    const sx = Phaser.Math.Between(200, 600);
                    const enemy = new Enemy(this.scene, sx, 340, 'shadow_beast', 10);
                    enemy.speed = 120;
                    enemy.aggroRange = 300;
                    enemy.damage = 12;
                    this.scene.enemies.add(enemy);
                    this.scene.physics.add.collider(enemy, this.scene.ground);
                }
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        }
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) this.clearTint();
        });
        const ratio = this.health / this.maxHealth;
        this.healthBar.width = 300 * ratio;
        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true;
        if (this.attackTimer) this.attackTimer.remove();
        this.scene.tweens.add({
            targets: this, alpha: 0, duration: 1000,
            onComplete: () => {
                this.healthBg.destroy();
                this.healthBar.destroy();
                this.nameText.destroy();
                this.destroy();
            }
        });
    }
}
```

**Step 2: Create ShadowLordArenaScene.js**

Same boss arena pattern. On defeat, unlock shadow power, go to Ruins.

```javascript
class ShadowLordArenaScene extends Phaser.Scene {
    constructor() { super('ShadowLordArena'); }

    preload() {
        this.load.image('shadow-lord-arena-bg', 'assets/backgrounds/shadow-lord-arena-bg.png');
    }

    create() {
        this.add.image(400, 225, 'shadow-lord-arena-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 100, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        // Enemies group for summoned shadow beasts
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        this.boss = new ShadowLord(this, 600, 300);
        this.physics.add.collider(this.boss, this.ground);

        this.bossDefeated = false;
    }

    update() {
        this.player.update();
        this.hud.update();

        // Update summoned enemies
        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        // Player attack hitting boss
        if (this.player.attackHitbox && this.boss && !this.boss.isDead) {
            const b1 = this.player.attackHitbox.getBounds();
            const b2 = this.boss.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                if (!this.boss.justHit) {
                    this.boss.takeDamage(this.player.currentHitDamage);
                    this.boss.justHit = true;
                    this.time.delayedCall(300, () => {
                        if (this.boss) this.boss.justHit = false;
                    });
                }
            }
        }

        // Player attack hitting summoned enemies
        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Boss defeated -> unlock shadow power, go to ruins
        if (this.boss && this.boss.isDead && !this.bossDefeated) {
            this.bossDefeated = true;
            GameState.swordPowers.push('shadow');
            this.showPowerUnlock('影', 'Shadow Strike', 'Ruins');
        }

        // Boss attacks hitting player
        if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, this.boss.x, this.boss.y
            );
            if (dist < 80 && !this.boss.playerHitThisAttack) {
                GameState.health -= 25;
                if (GameState.health < 0) GameState.health = 0;
                this.boss.playerHitThisAttack = true;
                this.player.setTint(0xff0000);
                this.time.delayedCall(200, () => this.player.clearTint());
                this.time.delayedCall(500, () => {
                    if (this.boss) this.boss.playerHitThisAttack = false;
                });
            }
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }

    showPowerUnlock(kanji, powerName, nextScene) {
        const kanjiText = this.add.text(400, 150, kanji, {
            fontSize: '96px', fill: '#9944ff'
        }).setOrigin(0.5).setDepth(200);

        const nameText = this.add.text(400, 250, powerName + ' Unlocked!', {
            fontSize: '28px', fill: '#ffcc00'
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: [kanjiText, nameText],
            alpha: 0, y: '-=20',
            duration: 2000, delay: 2000,
            onComplete: () => {
                kanjiText.destroy();
                nameText.destroy();
                this.scene.start(nextScene);
            }
        });
    }
}
```

**Step 3: Commit**

```bash
git add js/ShadowLord.js js/scenes/ShadowLordArenaScene.js
git commit -m "add Shadow Lord boss and arena scene"
```

---

### Task 9: Create Ancient Ruins area (RuinsScene + ShatteredTempleScene)

**Files:**
- Create: `js/scenes/RuinsScene.js`
- Create: `js/scenes/ShatteredTempleScene.js`

**Step 1: Create RuinsScene.js**

3 Stone Golems — slow, tough, lots of health.

```javascript
class RuinsScene extends Phaser.Scene {
    constructor() { super('Ruins'); }

    preload() {
        this.load.image('ruins-bg', 'assets/backgrounds/ruins-bg.png');
    }

    create() {
        this.add.image(400, 225, 'ruins-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // 3 Stone Golems — slow, tough, lots of health
        for (let i = 0; i < 3; i++) {
            const x = 300 + i * 150;
            const enemy = new Enemy(this, x, 340, 'stone_golem', 50);
            enemy.speed = 40;         // slow
            enemy.aggroRange = 180;
            enemy.damage = 20;        // hits hard
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        this.add.text(400, 50, 'Ancient Ruins', {
            fontSize: '20px', fill: '#ccaa66'
        }).setOrigin(0.5);
    }

    update() {
        this.player.update();
        this.hud.update();

        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('ShatteredTemple');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 2: Create ShatteredTempleScene.js**

```javascript
class ShatteredTempleScene extends Phaser.Scene {
    constructor() { super('ShatteredTemple'); }

    preload() {
        this.load.image('shattered-temple-bg', 'assets/backgrounds/shattered-temple-bg.png');
    }

    create() {
        this.add.image(400, 225, 'shattered-temple-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // 4 Stone Golems inside temple
        for (let i = 0; i < 4; i++) {
            const x = 250 + i * 130;
            const enemy = new Enemy(this, x, 340, 'stone_golem', 60);
            enemy.speed = 45;
            enemy.aggroRange = 200;
            enemy.damage = 22;
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        this.add.text(400, 50, 'Shattered Temple', {
            fontSize: '20px', fill: '#ffcc44'
        }).setOrigin(0.5);
    }

    update() {
        this.player.update();
        this.hud.update();

        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('RuneGuardianArena');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 3: Commit**

```bash
git add js/scenes/RuinsScene.js js/scenes/ShatteredTempleScene.js
git commit -m "add Ruins and Shattered Temple scenes with stone golems"
```

---

### Task 10: Create RuneGuardian boss, arena, and FinalVictoryScene

**Files:**
- Create: `js/RuneGuardian.js`
- Create: `js/scenes/RuneGuardianArenaScene.js`
- Create: `js/scenes/FinalVictoryScene.js`

**Step 1: Create RuneGuardian.js**

Rune Guardian has 3 attacks:
- **Beam:** Energy beam attack (horizontal line visual)
- **Wall:** Creates stone barrier (rectangle that blocks for 2s)
- **Pound:** Ground smash with shockwave (expanding circle on ground)

```javascript
class RuneGuardian extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'rune_guardian');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('rune_guardian_idle');
        this.setScale(2);
        this.setCollideWorldBounds(true);

        this.health = 350;
        this.maxHealth = 350;
        this.isDead = false;
        this.isAttacking = false;
        this.currentAttack = null;
        this.playerHitThisAttack = false;

        this.healthBg = scene.add.rectangle(400, 50, 300, 20, 0x333333).setDepth(100);
        this.healthBar = scene.add.rectangle(400, 50, 300, 20, 0xffaa00).setDepth(101);
        this.nameText = scene.add.text(400, 30, 'RUNE GUARDIAN', {
            fontSize: '14px', fill: '#ffcc44'
        }).setOrigin(0.5).setDepth(101);

        this.scheduleAttack();
    }

    scheduleAttack() {
        const delay = Phaser.Math.Between(1500, 3000);
        this.attackTimer = this.scene.time.delayedCall(delay, () => {
            if (this.isDead) return;
            this.doAttack();
        });
    }

    doAttack() {
        const attacks = ['beam', 'wall', 'pound'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.playerHitThisAttack = false;

        if (this.currentAttack === 'beam') {
            this.setTint(0xffaa00);
            this.scene.time.delayedCall(400, () => {
                if (this.isDead) return;
                // Energy beam across arena
                const dir = this.scene.player.x > this.x ? 1 : -1;
                const beam = this.scene.add.rectangle(
                    this.x + dir * 200, this.y, 400, 10, 0xffaa00, 0.7
                );
                this.scene.time.delayedCall(300, () => beam.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'wall') {
            this.setTint(0x888888);
            this.scene.time.delayedCall(300, () => {
                if (this.isDead) return;
                // Stone wall barrier
                const wallX = (this.x + this.scene.player.x) / 2;
                const wall = this.scene.add.rectangle(wallX, 350, 20, 100, 0x666666, 0.8);
                this.scene.time.delayedCall(2000, () => wall.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'pound') {
            this.setTint(0xff6600);
            this.scene.time.delayedCall(600, () => {
                if (this.isDead) return;
                // Ground shockwave
                const shock = this.scene.add.rectangle(this.x, 410, 300, 20, 0xff6600, 0.5);
                this.scene.tweens.add({
                    targets: shock,
                    scaleX: 2,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => shock.destroy()
                });
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        }
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) this.clearTint();
        });
        const ratio = this.health / this.maxHealth;
        this.healthBar.width = 300 * ratio;
        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true;
        if (this.attackTimer) this.attackTimer.remove();
        this.scene.tweens.add({
            targets: this, alpha: 0, duration: 1000,
            onComplete: () => {
                this.healthBg.destroy();
                this.healthBar.destroy();
                this.nameText.destroy();
                this.destroy();
            }
        });
    }
}
```

**Step 2: Create RuneGuardianArenaScene.js**

On defeat, unlock power kanji, go to FinalVictory.

```javascript
class RuneGuardianArenaScene extends Phaser.Scene {
    constructor() { super('RuneGuardianArena'); }

    preload() {
        this.load.image('rune-guardian-arena-bg', 'assets/backgrounds/rune-guardian-arena-bg.png');
    }

    create() {
        this.add.image(400, 225, 'rune-guardian-arena-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 100, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.boss = new RuneGuardian(this, 600, 280);
        this.physics.add.collider(this.boss, this.ground);

        this.bossDefeated = false;
    }

    update() {
        this.player.update();
        this.hud.update();

        if (this.player.attackHitbox && this.boss && !this.boss.isDead) {
            const b1 = this.player.attackHitbox.getBounds();
            const b2 = this.boss.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                if (!this.boss.justHit) {
                    this.boss.takeDamage(this.player.currentHitDamage);
                    this.boss.justHit = true;
                    this.time.delayedCall(300, () => {
                        if (this.boss) this.boss.justHit = false;
                    });
                }
            }
        }

        // Boss defeated -> unlock power, go to final victory
        if (this.boss && this.boss.isDead && !this.bossDefeated) {
            this.bossDefeated = true;
            GameState.swordPowers.push('power');
            this.showPowerUnlock('力', 'Power Wave');
        }

        if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, this.boss.x, this.boss.y
            );
            if (dist < 90 && !this.boss.playerHitThisAttack) {
                GameState.health -= 25;
                if (GameState.health < 0) GameState.health = 0;
                this.boss.playerHitThisAttack = true;
                this.player.setTint(0xff0000);
                this.time.delayedCall(200, () => this.player.clearTint());
                this.time.delayedCall(500, () => {
                    if (this.boss) this.boss.playerHitThisAttack = false;
                });
            }
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }

    showPowerUnlock(kanji, powerName) {
        const kanjiText = this.add.text(400, 150, kanji, {
            fontSize: '96px', fill: '#ffaa00'
        }).setOrigin(0.5).setDepth(200);

        const nameText = this.add.text(400, 250, powerName + ' Unlocked!', {
            fontSize: '28px', fill: '#ffcc00'
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: [kanjiText, nameText],
            alpha: 0, y: '-=20',
            duration: 2000, delay: 2000,
            onComplete: () => {
                kanjiText.destroy();
                nameText.destroy();
                this.scene.start('FinalVictory');
            }
        });
    }
}
```

**Step 3: Create FinalVictoryScene.js**

Shows all 3 kanji glowing on the sword with a dramatic victory screen.

```javascript
class FinalVictoryScene extends Phaser.Scene {
    constructor() { super('FinalVictory'); }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        // Title
        this.add.text(400, 60, 'モブスレイヤー', {
            fontSize: '48px', fill: '#ff44ff'
        }).setOrigin(0.5);

        this.add.text(400, 110, 'The Mob Slayer', {
            fontSize: '24px', fill: '#ffccff'
        }).setOrigin(0.5);

        // All 3 kanji with glow animations
        const kanjiData = [
            { char: '氷', color: '#88ccff', label: 'Ice', x: 200 },
            { char: '影', color: '#9944ff', label: 'Shadow', x: 400 },
            { char: '力', color: '#ffaa00', label: 'Power', x: 600 }
        ];

        kanjiData.forEach((k, i) => {
            const kanji = this.add.text(k.x, 220, k.char, {
                fontSize: '72px', fill: k.color
            }).setOrigin(0.5).setAlpha(0);

            const label = this.add.text(k.x, 280, k.label, {
                fontSize: '16px', fill: '#ffffff'
            }).setOrigin(0.5).setAlpha(0);

            // Fade in one at a time
            this.tweens.add({
                targets: [kanji, label],
                alpha: 1,
                duration: 800,
                delay: 1000 + i * 800
            });

            // Pulse glow
            this.tweens.add({
                targets: kanji,
                alpha: 0.6,
                yoyo: true,
                repeat: -1,
                duration: 1000,
                delay: 3500 + i * 200
            });
        });

        // Victory text
        const victoryText = this.add.text(400, 350, 'All powers awakened!', {
            fontSize: '28px', fill: '#ffcc00'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            duration: 1000,
            delay: 4000
        });

        // Credits / end
        const endText = this.add.text(400, 400, 'You have mastered the Mob Slayer.', {
            fontSize: '18px', fill: '#aaaaaa'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: endText,
            alpha: 1,
            duration: 1000,
            delay: 5000
        });
    }
}
```

**Step 4: Commit**

```bash
git add js/RuneGuardian.js js/scenes/RuneGuardianArenaScene.js js/scenes/FinalVictoryScene.js
git commit -m "add Rune Guardian boss, arena, and final victory scene"
```

---

### Task 11: Wire up index.html, main.js scene array, and test

**Files:**
- Modify: `index.html`
- Modify: `js/main.js:98-111` (config scene array)

**Step 1: Add all new script tags to index.html**

Add these script tags BEFORE `js/main.js` (order matters — boss classes before scenes that use them):

```html
<script src="js/FrostGiant.js"></script>
<script src="js/ShadowLord.js"></script>
<script src="js/RuneGuardian.js"></script>
<script src="js/scenes/TundraScene.js"></script>
<script src="js/scenes/IceFortressScene.js"></script>
<script src="js/scenes/FrostGiantArenaScene.js"></script>
<script src="js/scenes/DarkForestScene.js"></script>
<script src="js/scenes/ShadowKeepScene.js"></script>
<script src="js/scenes/ShadowLordArenaScene.js"></script>
<script src="js/scenes/RuinsScene.js"></script>
<script src="js/scenes/ShatteredTempleScene.js"></script>
<script src="js/scenes/RuneGuardianArenaScene.js"></script>
<script src="js/scenes/FinalVictoryScene.js"></script>
```

**Step 2: Update the Phaser config scene array in main.js**

```javascript
scene: [
    BootScene,
    VillageScene, WoodsDayScene, WoodsNightScene,
    BossArenaScene, VictoryScene,
    TundraScene, IceFortressScene, FrostGiantArenaScene,
    DarkForestScene, ShadowKeepScene, ShadowLordArenaScene,
    RuinsScene, ShatteredTempleScene, RuneGuardianArenaScene,
    FinalVictoryScene
]
```

**Step 3: Test the full game flow**

Start the local server and test in browser:
```bash
cd /home/dane/Games/mob-slayer && python3 -m http.server 8080
```

Test flow:
1. Village → talk to blacksmith → go to Woods Day → pick up sword → go back to village
2. Talk to blacksmith (storyPhase 2) → go to Woods Night → kill goblins → Boss Arena
3. Kill troll → Victory/wall crack → Tundra
4. Kill ice wolves → Ice Fortress → kill wolves → Frost Giant Arena → kill boss
5. Dark Forest → Shadow Keep → Shadow Lord Arena → kill boss
6. Ruins → Shattered Temple → Rune Guardian Arena → kill boss → Final Victory

**Step 4: Commit**

```bash
git add index.html js/main.js
git commit -m "wire up all wilderness scenes in index.html and Phaser config"
```

---

### Task 12: Push to GitHub

**Step 1: Push all changes**

```bash
cd /home/dane/Games/mob-slayer && git push
```
