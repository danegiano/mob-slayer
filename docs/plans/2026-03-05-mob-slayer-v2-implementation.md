# Mob Slayer v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Mob Slayer from scratch as a 2D side-view action game with Phaser 3 — player movement, combat, enemies, boss fight, and story progression.

**Architecture:** Separate JS files loaded via script tags in index.html. No build tools. Sprites are base64-embedded in main.js so no server is needed. Each scene uses a single background image (no tilemaps). Physics uses Phaser Arcade with gravity.

**Tech Stack:** Phaser 3 (CDN), vanilla JavaScript, HTML5

---

### Task 1: Clean slate — new index.html and main.js

**Files:**
- Overwrite: `index.html`
- Overwrite: `js/main.js`
- Delete contents of: `js/scenes/` (all old scene files)
- Delete: `js/Background.js`
- Keep: `assets/` (sprites stay)

**Step 1: Write the new index.html**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mob Slayer モブスレイヤー</title>
    <style>
        * { margin: 0; padding: 0; }
        body {
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
    <script src="js/Player.js"></script>
    <script src="js/HUD.js"></script>
    <script src="js/scenes/TestScene.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

**Step 2: Write the new main.js with GameState and BootScene**

GameState holds global game data. BootScene loads base64 sprites and creates animations. Start with just the player sprite for now.

```javascript
const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood',        // 'wood' or 'slayer'
    comboUnlocked: false,
    storyPhase: 0           // 0=start, 1=found sword, 2=talked to blacksmith, 3=night
};

const SPRITE_DATA = {
    // Copy the existing player base64 string from old main.js
    player: '<existing base64 string>'
};

class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    create() {
        this.add.text(400, 225, 'Mob Slayer モブスレイヤー', {
            fontSize: '48px', fill: '#fff'
        }).setOrigin(0.5);
        this.add.text(400, 280, 'Loading...', {
            fontSize: '20px', fill: '#aaa'
        }).setOrigin(0.5);

        const keys = Object.keys(SPRITE_DATA);
        let loaded = 0;

        keys.forEach(key => {
            this.textures.once('addtexture-' + key, () => {
                loaded++;
                if (loaded === keys.length) this.onSpritesLoaded();
            });
            this.textures.addBase64(key, SPRITE_DATA[key]);
        });
    }

    onSpritesLoaded() {
        // Player: 2 frames of 32x48
        this.textures.get('player').add(0, 0, 0, 0, 32, 48);
        this.textures.get('player').add(1, 0, 32, 0, 32, 48);

        this.anims.create({
            key: 'player_idle',
            frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }],
            frameRate: 3,
            repeat: -1
        });

        this.scene.start('TestScene');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: [BootScene, TestScene]
};

const game = new Phaser.Game(config);
```

**Step 3: Delete old scene files and Background.js**

```bash
rm js/scenes/VillageScene.js js/scenes/WoodsDayScene.js js/scenes/WoodsNightScene.js
rm js/scenes/BossArenaScene.js js/scenes/VictoryScene.js
rm js/scenes/House1Scene.js js/scenes/House2Scene.js js/scenes/ForgeScene.js
rm js/Background.js
```

**Step 4: Commit**

```bash
git add -A
git commit -m "fresh start: clean slate for Mob Slayer v2"
```

---

### Task 2: Player movement — walk, jump, flip

**Files:**
- Overwrite: `js/Player.js`
- Create: `js/scenes/TestScene.js`

**Step 1: Write TestScene — a simple ground + sky to test the player**

```javascript
class TestScene extends Phaser.Scene {
    constructor() { super('TestScene'); }

    create() {
        // Simple ground — a green rectangle
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x4a7a2e);
        this.physics.add.existing(this.ground, true); // true = static

        // Create the player
        this.player = new Player(this, 100, 350);

        // Player stands on the ground
        this.physics.add.collider(this.player, this.ground);
    }

    update() {
        this.player.update();
    }
}
```

**Step 2: Write Player.js — movement only (no attack yet)**

```javascript
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('player_idle');
        this.setCollideWorldBounds(true);
        this.body.setSize(20, 44);
        this.setScale(2); // make the sprite bigger so it's easy to see

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.moveSpeed = 200;
        this.jumpSpeed = -450;
        this.facing = 'right';
    }

    update() {
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const jump = this.cursors.up.isDown || this.wasd.up.isDown;

        if (left) {
            this.setVelocityX(-this.moveSpeed);
            this.setFlipX(true);
            this.facing = 'left';
        } else if (right) {
            this.setVelocityX(this.moveSpeed);
            this.setFlipX(false);
            this.facing = 'right';
        } else {
            this.setVelocityX(0);
        }

        if (jump && this.body.onFloor()) {
            this.setVelocityY(this.jumpSpeed);
        }
    }
}
```

**Step 3: Test in browser**

Open `index.html`. You should see:
- Blue sky background
- Green ground bar at bottom
- Player sprite that walks left/right with arrow keys or WASD
- Player flips to face direction of movement
- Player jumps when pressing up/W and can't double-jump

**Step 4: Commit**

```bash
git add js/Player.js js/scenes/TestScene.js
git commit -m "add player movement: walk, jump, flip direction"
```

---

### Task 3: Player attack — sword swing with hitbox

**Files:**
- Modify: `js/Player.js`

**Step 1: Add attack properties to Player constructor**

Add after the movement properties:

```javascript
// Attack
this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
this.isAttacking = false;
this.attackHitbox = null;
this.attackDamage = 10;
this.facing = 'right';
```

**Step 2: Add attack() method to Player**

```javascript
attack() {
    if (this.isAttacking) return;
    this.isAttacking = true;

    // Visual feedback — flash white
    this.setTint(0xffffff);

    // Create a hitbox in front of the player
    const offsetX = this.facing === 'right' ? 50 : -50;
    this.attackHitbox = this.scene.add.rectangle(
        this.x + offsetX, this.y, 24, 40, 0xffffff, 0.3
    );
    this.scene.physics.add.existing(this.attackHitbox, false);
    this.attackHitbox.body.setAllowGravity(false);

    // Clean up after 150ms
    this.scene.time.delayedCall(150, () => {
        if (this.attackHitbox) {
            this.attackHitbox.destroy();
            this.attackHitbox = null;
        }
        this.clearTint();
        this.isAttacking = false;
    });
}
```

**Step 3: Call attack() from update()**

Add to the end of update():

```javascript
if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
    this.attack();
}
```

**Step 4: Test in browser**

- Press spacebar → white flash on player + small white rectangle appears in front
- Attack works facing both directions
- Can't spam attack (locked out during swing)

**Step 5: Commit**

```bash
git add js/Player.js
git commit -m "add player attack with visible hitbox"
```

---

### Task 4: Player dodge roll

**Files:**
- Modify: `js/Player.js`

**Step 1: Add dodge properties to constructor**

```javascript
// Dodge
this.dodgeKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
this.isDodging = false;
this.dodgeCooldown = false;
```

**Step 2: Add dodge() method**

```javascript
dodge() {
    if (this.isDodging || this.dodgeCooldown) return;
    this.isDodging = true;
    this.dodgeCooldown = true;

    const dashSpeed = this.facing === 'right' ? 400 : -400;
    this.setVelocityX(dashSpeed);
    this.setAlpha(0.4); // semi-transparent = invincible look

    this.scene.time.delayedCall(200, () => {
        this.isDodging = false;
        this.setAlpha(1);
    });

    this.scene.time.delayedCall(500, () => {
        this.dodgeCooldown = false;
    });
}
```

**Step 3: Call dodge from update() and skip movement during dodge**

Wrap the movement code in `if (!this.isDodging)` and add dodge key check:

```javascript
if (Phaser.Input.Keyboard.JustDown(this.dodgeKey)) {
    this.dodge();
}
```

**Step 4: Test in browser**

- Press Shift → player dashes forward, goes semi-transparent
- Can't spam dodge (500ms cooldown)
- No movement input during dodge dash

**Step 5: Commit**

```bash
git add js/Player.js
git commit -m "add dodge roll with dash and invincibility"
```

---

### Task 5: HUD — health bar

**Files:**
- Overwrite: `js/HUD.js`
- Modify: `js/scenes/TestScene.js` (add HUD)

**Step 1: Write HUD.js**

```javascript
class HUD {
    constructor(scene) {
        this.scene = scene;

        // Health bar background (dark red)
        this.healthBg = scene.add.rectangle(120, 20, 200, 16, 0x333333)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

        // Health bar fill (green)
        this.healthBar = scene.add.rectangle(120, 20, 200, 16, 0x00cc00)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

        // Health text
        this.healthText = scene.add.text(20, 12, 'HP', {
            fontSize: '14px', fill: '#fff'
        }).setScrollFactor(0).setDepth(101);

        // Weapon text
        this.weaponText = scene.add.text(20, 36, '', {
            fontSize: '12px', fill: '#ffcc00'
        }).setScrollFactor(0).setDepth(101);
    }

    update() {
        const ratio = GameState.health / GameState.maxHealth;
        this.healthBar.width = 200 * ratio;

        // Change color based on health
        if (ratio > 0.5) this.healthBar.setFillStyle(0x00cc00);
        else if (ratio > 0.25) this.healthBar.setFillStyle(0xcccc00);
        else this.healthBar.setFillStyle(0xcc0000);

        // Show weapon name
        const weaponName = GameState.weapon === 'slayer' ? 'モブスレイヤー' : 'Wood Sword';
        this.weaponText.setText(weaponName);
    }
}
```

**Step 2: Add HUD to TestScene**

In TestScene.create(), add:
```javascript
this.hud = new HUD(this);
```

In TestScene.update(), add:
```javascript
this.hud.update();
```

**Step 3: Test in browser**

- Green health bar in top-left corner
- Shows "Wood Sword" weapon text
- Health bar will update when we add damage later

**Step 4: Commit**

```bash
git add js/HUD.js js/scenes/TestScene.js
git commit -m "add HUD with health bar and weapon display"
```

---

### Task 6: Enemy class — basic goblin AI

**Files:**
- Overwrite: `js/Enemy.js`
- Modify: `js/main.js` (add goblin sprite data + animation)
- Modify: `js/scenes/TestScene.js` (spawn test enemy)
- Modify: `index.html` (add Enemy.js script tag)

**Step 1: Add goblin sprite data to SPRITE_DATA in main.js**

Add the existing goblin and night_goblin base64 strings from the old main.js. Add frame setup and animation in onSpritesLoaded():

```javascript
// Goblin: 2 frames of 24x24
this.textures.get('goblin').add(0, 0, 0, 0, 24, 24);
this.textures.get('goblin').add(1, 0, 24, 0, 24, 24);

this.anims.create({
    key: 'goblin_idle',
    frames: [{ key: 'goblin', frame: 0 }, { key: 'goblin', frame: 1 }],
    frameRate: 3,
    repeat: -1
});
```

**Step 2: Write Enemy.js**

```javascript
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, health) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play(type + '_idle');
        this.setCollideWorldBounds(true);
        this.setScale(2);

        this.health = health || 30;
        this.maxHealth = this.health;
        this.damage = 10;
        this.speed = 60;
        this.aggroRange = 200;
        this.attackRange = 40;
        this.attackCooldown = false;
        this.isDead = false;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => this.clearTint());

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 300,
            onComplete: () => this.destroy()
        });
    }

    update(player) {
        if (this.isDead || !player) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (dist < this.aggroRange) {
            // Move toward player
            if (this.x < player.x) {
                this.setVelocityX(this.speed);
                this.setFlipX(false);
            } else {
                this.setVelocityX(-this.speed);
                this.setFlipX(true);
            }

            // Attack if close enough
            if (dist < this.attackRange && !this.attackCooldown) {
                this.attackPlayer(player);
            }
        } else {
            this.setVelocityX(0);
        }
    }

    attackPlayer(player) {
        if (player.isDodging) return; // dodging = invincible
        this.attackCooldown = true;

        GameState.health -= this.damage;
        if (GameState.health < 0) GameState.health = 0;

        // Knockback the player
        const knockDir = player.x > this.x ? 200 : -200;
        player.setVelocityX(knockDir);
        player.setVelocityY(-150);
        player.setTint(0xff0000);
        player.scene.time.delayedCall(200, () => player.clearTint());

        this.scene.time.delayedCall(1000, () => {
            this.attackCooldown = false;
        });
    }
}
```

**Step 3: Add Enemy script tag to index.html**

Add before TestScene.js:
```html
<script src="js/Enemy.js"></script>
```

**Step 4: Add a test enemy to TestScene**

In TestScene.create(), add after creating the player:

```javascript
// Test enemy
this.enemy = new Enemy(this, 600, 350, 'goblin', 30);
this.physics.add.collider(this.enemy, this.ground);
```

In TestScene.update(), add:
```javascript
this.enemy.update(this.player);
```

**Step 5: Add player attack hitting enemies**

In TestScene.create(), add overlap check:
```javascript
// Check if player's attack hits enemy
this.physics.add.overlap(this.player, this.enemy, (player, enemy) => {
    // Only damage during attack
}, null, this);
```

Actually, the attack hitbox approach is better — in TestScene.update(), check overlap between player.attackHitbox and enemies each frame.

**Step 6: Test in browser**

- Goblin stands at right side
- Walks toward player when close enough
- Attacks player (health bar goes down, player gets knocked back)
- Player can hit goblin with spacebar attack
- Goblin flashes red and dies after enough hits
- Dodge makes player invincible to attacks

**Step 7: Commit**

```bash
git add js/Enemy.js js/main.js js/scenes/TestScene.js index.html
git commit -m "add enemy with chase AI, combat, and player damage"
```

---

### Task 7: Player-enemy combat loop polish

**Files:**
- Modify: `js/scenes/TestScene.js`
- Modify: `js/Player.js`

**Step 1: Add proper attack-enemy overlap using attackHitbox**

In TestScene, create an enemies group and use overlap detection in update():

```javascript
// In create():
this.enemies = this.physics.add.group();
this.enemy = new Enemy(this, 600, 350, 'goblin', 30);
this.enemies.add(this.enemy);
this.physics.add.collider(this.enemies, this.ground);

// In update():
// Check player attack hitting enemies
if (this.player.attackHitbox) {
    this.enemies.children.each(enemy => {
        if (enemy.isDead) return;
        const bounds1 = this.player.attackHitbox.getBounds();
        const bounds2 = enemy.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2)) {
            if (!enemy.justHit) {
                enemy.takeDamage(this.player.attackDamage);
                enemy.justHit = true;
                this.time.delayedCall(300, () => { enemy.justHit = false; });
            }
        }
    });
}
```

**Step 2: Add death/game over check**

```javascript
// In update():
if (GameState.health <= 0) {
    // Simple restart for now
    GameState.health = GameState.maxHealth;
    this.scene.restart();
}
```

**Step 3: Test in browser**

- Attack the goblin → it takes damage and flashes red
- Goblin attacks you → health bar goes down
- Kill the goblin → it fades out
- Die → scene restarts

**Step 4: Commit**

```bash
git add js/scenes/TestScene.js js/Player.js
git commit -m "polish combat: attack hitbox detection, death, restart"
```

---

### Task 8: Village scene with blacksmith NPC

**Files:**
- Create: `js/scenes/VillageScene.js`
- Overwrite: `js/DialogueBox.js`
- Modify: `js/main.js` (add blacksmith sprite, add VillageScene)
- Modify: `index.html` (add script tags)

**Step 1: Add blacksmith sprite data to main.js**

Copy existing blacksmith base64 string. Add frames and animation in onSpritesLoaded():

```javascript
this.textures.get('blacksmith').add(0, 0, 0, 0, 32, 48);
this.textures.get('blacksmith').add(1, 0, 32, 0, 32, 48);

this.anims.create({
    key: 'blacksmith_idle',
    frames: [{ key: 'blacksmith', frame: 0 }, { key: 'blacksmith', frame: 1 }],
    frameRate: 2,
    repeat: -1
});
```

**Step 2: Write DialogueBox.js**

```javascript
class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.lineIndex = 0;

        // Dark box at bottom of screen
        this.bg = scene.add.rectangle(400, 400, 760, 80, 0x000000, 0.85)
            .setDepth(200).setVisible(false);

        // Speaker name
        this.nameText = scene.add.text(40, 370, '', {
            fontSize: '14px', fill: '#ffcc00'
        }).setDepth(201).setVisible(false);

        // Dialogue text
        this.text = scene.add.text(40, 390, '', {
            fontSize: '14px', fill: '#ffffff', wordWrap: { width: 720 }
        }).setDepth(201).setVisible(false);

        // "Press E" hint
        this.hint = scene.add.text(730, 425, 'E ▶', {
            fontSize: '12px', fill: '#aaaaaa'
        }).setDepth(201).setVisible(false);

        this.talkKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    open(speakerName, lines) {
        this.lines = lines;
        this.lineIndex = 0;
        this.isOpen = true;
        this.nameText.setText(speakerName);
        this.text.setText(this.lines[0]);
        this.bg.setVisible(true);
        this.nameText.setVisible(true);
        this.text.setVisible(true);
        this.hint.setVisible(true);
    }

    advance() {
        if (!this.isOpen) return;
        this.lineIndex++;
        if (this.lineIndex >= this.lines.length) {
            this.close();
        } else {
            this.text.setText(this.lines[this.lineIndex]);
        }
    }

    close() {
        this.isOpen = false;
        this.bg.setVisible(false);
        this.nameText.setVisible(false);
        this.text.setVisible(false);
        this.hint.setVisible(false);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.talkKey) && this.isOpen) {
            this.advance();
        }
    }
}
```

**Step 3: Write VillageScene.js**

```javascript
class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    create() {
        // Sky blue background
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Simple village — ground + some buildings as rectangles
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x4a7a2e);
        this.physics.add.existing(this.ground, true);

        // Houses (simple colored rectangles for now)
        this.add.rectangle(200, 380, 80, 60, 0x8B4513); // brown house
        this.add.rectangle(200, 345, 80, 10, 0xCC0000); // red roof
        this.add.rectangle(500, 380, 80, 60, 0x8B4513);
        this.add.rectangle(500, 345, 80, 10, 0xCC0000);

        // Blacksmith NPC
        this.blacksmith = this.physics.add.sprite(400, 380, 'blacksmith');
        this.blacksmith.play('blacksmith_idle');
        this.blacksmith.body.setAllowGravity(false);
        this.blacksmith.setScale(2);

        // "Press E" prompt (shows when near blacksmith)
        this.talkPrompt = this.add.text(400, 340, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false);

        // Player
        this.player = new Player(this, 100, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Dialogue
        this.dialogue = new DialogueBox(this);
        this.talkKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Exit zone — right edge goes to woods
        this.exitZone = this.add.zone(790, 225, 20, 450);
        this.physics.add.existing(this.exitZone, true);
        this.physics.add.overlap(this.player, this.exitZone, () => {
            this.scene.start('WoodsDay');
        });
    }

    update() {
        if (!this.dialogue.isOpen) {
            this.player.update();
        }

        this.hud.update();
        this.dialogue.update();

        // Show talk prompt when near blacksmith
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.blacksmith.x, this.blacksmith.y
        );
        this.talkPrompt.setVisible(dist < 60 && !this.dialogue.isOpen);

        // Open dialogue when pressing E near blacksmith
        if (Phaser.Input.Keyboard.JustDown(this.talkKey) && dist < 60 && !this.dialogue.isOpen) {
            if (GameState.storyPhase === 0) {
                this.dialogue.open('Blacksmith', [
                    'Hey there, adventurer!',
                    'Take this wood sword. It\'s not much, but it\'ll do.',
                    'I heard strange noises from the woods to the east...',
                    'Be careful out there!'
                ]);
            } else if (GameState.storyPhase === 1) {
                this.dialogue.open('Blacksmith', [
                    'What\'s that sword?! It\'s glowing!',
                    'That\'s the legendary モブスレイヤー!',
                    'I\'ll give you 1000 gold for it!',
                    '...',
                    'No? Fine. But something feels wrong tonight...',
                    'The animals in the woods... they\'re changing.'
                ]);
                GameState.storyPhase = 2;
            }
        }
    }
}
```

**Step 4: Update index.html and main.js**

Add script tags for DialogueBox.js and VillageScene.js. Add VillageScene to the Phaser config scene array. Change BootScene to start 'Village' instead of 'TestScene'.

**Step 5: Test in browser**

- Starts in village with houses and blacksmith
- Walk up to blacksmith, see "Press E to talk"
- Press E → dialogue box opens with story text
- Press E to advance dialogue
- Walk to right edge → transitions to WoodsDay (will be blank for now)

**Step 6: Commit**

```bash
git add js/DialogueBox.js js/scenes/VillageScene.js js/main.js index.html
git commit -m "add village scene with blacksmith NPC and dialogue"
```

---

### Task 9: Woods Day scene — find the Slayer sword

**Files:**
- Create: `js/scenes/WoodsDayScene.js`
- Modify: `js/main.js` (add scene to config)
- Modify: `index.html` (add script tag)

**Step 1: Write WoodsDayScene.js**

A forest scene with trees (green rectangles on brown trunks). A glowing sword pickup at the far right. Walking over it picks it up and triggers a text effect.

```javascript
class WoodsDayScene extends Phaser.Scene {
    constructor() { super('WoodsDay'); }

    create() {
        this.cameras.main.setBackgroundColor('#2d5a1e');

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x3a2a1a);
        this.physics.add.existing(this.ground, true);

        // Trees (simple shapes)
        for (let i = 0; i < 5; i++) {
            const tx = 100 + i * 170;
            this.add.rectangle(tx, 350, 20, 80, 0x5a3a1a); // trunk
            this.add.circle(tx, 300, 35, 0x1a6a1a);         // leaves
        }

        // Player
        this.player = new Player(this, 30, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Glowing sword pickup (if not already found)
        if (GameState.storyPhase === 0) {
            this.sword = this.add.rectangle(700, 400, 8, 30, 0xff44ff);
            this.physics.add.existing(this.sword, true);

            // Glow effect
            this.tweens.add({
                targets: this.sword,
                alpha: 0.4,
                yoyo: true,
                repeat: -1,
                duration: 500
            });

            this.physics.add.overlap(this.player, this.sword, () => {
                this.pickUpSword();
            });
        }

        // Exit left → village
        this.exitLeft = this.add.zone(10, 225, 20, 450);
        this.physics.add.existing(this.exitLeft, true);
        this.physics.add.overlap(this.player, this.exitLeft, () => {
            this.scene.start('Village');
        });
    }

    pickUpSword() {
        if (this.swordPickedUp) return;
        this.swordPickedUp = true;

        GameState.weapon = 'slayer';
        GameState.storyPhase = 1;
        this.sword.destroy();

        // Big dramatic text
        const swordText = this.add.text(400, 200, 'モブスレイヤー', {
            fontSize: '48px', fill: '#ff44ff'
        }).setOrigin(0.5);

        const subText = this.add.text(400, 250, 'Mob Slayer', {
            fontSize: '20px', fill: '#ffccff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [swordText, subText],
            alpha: 0,
            y: '-=30',
            duration: 3000,
            delay: 1500,
            onComplete: () => {
                swordText.destroy();
                subText.destroy();
            }
        });
    }

    update() {
        this.player.update();
        this.hud.update();
    }
}
```

**Step 2: Add WoodsDayScene to main.js config and index.html**

**Step 3: Test in browser**

- From village, walk right → enter woods
- See trees and dark green background
- Walk to glowing pink sword → pick it up
- Big "モブスレイヤー" text appears
- HUD shows weapon changed
- Walk left → back to village

**Step 4: Commit**

```bash
git add js/scenes/WoodsDayScene.js js/main.js index.html
git commit -m "add woods day scene with sword pickup"
```

---

### Task 10: Woods Night scene — fight cursed creatures

**Files:**
- Create: `js/scenes/WoodsNightScene.js`
- Modify: `js/main.js` (add night_goblin sprite, add scene)
- Modify: `index.html`
- Modify: `js/scenes/VillageScene.js` (trigger night transition after blacksmith dialogue)

**Step 1: Add night_goblin sprite data and animation to main.js**

Copy existing night_goblin base64 string. Add frames + animation.

**Step 2: Write WoodsNightScene.js**

Dark background, waves of night goblins that spawn as you progress. Exit right goes to boss arena.

```javascript
class WoodsNightScene extends Phaser.Scene {
    constructor() { super('WoodsNight'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a2a');

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x1a1a1a);
        this.physics.add.existing(this.ground, true);

        // Dark trees
        for (let i = 0; i < 5; i++) {
            const tx = 100 + i * 170;
            this.add.rectangle(tx, 350, 20, 80, 0x2a1a0a);
            this.add.circle(tx, 300, 35, 0x0a2a0a);
        }

        // Player
        this.player = new Player(this, 30, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Enemy group
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // Spawn enemies
        this.spawnWave();

        // Exit right → boss arena (only after killing all enemies)
        this.exitRight = this.add.zone(790, 225, 20, 450);
        this.physics.add.existing(this.exitRight, true);
        this.physics.add.overlap(this.player, this.exitRight, () => {
            if (this.enemies.countActive() === 0) {
                this.scene.start('BossArena');
            }
        });

        // Warning text
        this.add.text(400, 50, 'The woods are cursed...', {
            fontSize: '20px', fill: '#ff4444'
        }).setOrigin(0.5);
    }

    spawnWave() {
        for (let i = 0; i < 4; i++) {
            const x = 300 + i * 120;
            const enemy = new Enemy(this, x, 350, 'night_goblin', 20);
            this.enemies.add(enemy);
        }
    }

    update() {
        this.player.update();
        this.hud.update();

        // Update enemies
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
                    enemy.takeDamage(this.player.attackDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 3: Modify VillageScene — after blacksmith storyPhase 2 dialogue, set storyPhase to 3 and go to WoodsNight**

After setting `GameState.storyPhase = 2` in the blacksmith dialogue callback, add a delayed transition:

```javascript
// When dialogue closes after storyPhase 2, transition to night
// Add in the dialogue close callback or check in update
```

Actually, simpler: in VillageScene.update(), after dialogue closes, if storyPhase === 2, exit right goes to WoodsNight instead of WoodsDay.

**Step 4: Update main.js config and index.html**

**Step 5: Test in browser**

- After finding sword and talking to blacksmith about it
- Exit village right → dark woods with night goblins
- Fight them! Attack with spacebar, dodge with shift
- Kill all 4 → exit right to boss arena

**Step 6: Commit**

```bash
git add js/scenes/WoodsNightScene.js js/scenes/VillageScene.js js/main.js index.html
git commit -m "add woods night scene with cursed creature combat"
```

---

### Task 11: Troll boss fight

**Files:**
- Overwrite: `js/TrollBoss.js`
- Create: `js/scenes/BossArenaScene.js`
- Modify: `js/main.js` (add troll sprite, add scene)
- Modify: `index.html`

**Step 1: Add troll sprite data and animation to main.js**

Copy existing troll base64. Add frames (64x80, 2 frames) and animation.

**Step 2: Write TrollBoss.js**

```javascript
class TrollBoss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'troll');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('troll_idle');
        this.setScale(2);
        this.setCollideWorldBounds(true);

        this.health = 200;
        this.maxHealth = 200;
        this.isDead = false;
        this.isAttacking = false;
        this.attackTimer = null;
        this.currentAttack = null;

        // Boss health bar (at top of screen)
        this.healthBg = scene.add.rectangle(400, 50, 300, 20, 0x333333)
            .setDepth(100);
        this.healthBar = scene.add.rectangle(400, 50, 300, 20, 0xcc0000)
            .setDepth(101);
        this.nameText = scene.add.text(400, 30, 'TROLL BOSS', {
            fontSize: '14px', fill: '#fff'
        }).setOrigin(0.5).setDepth(101);

        // Start attack cycle
        this.scheduleAttack(scene);
    }

    scheduleAttack(scene) {
        const delay = Phaser.Math.Between(2000, 4000);
        this.attackTimer = scene.time.delayedCall(delay, () => {
            if (this.isDead) return;
            this.doAttack(scene);
        });
    }

    doAttack(scene) {
        const attacks = ['slam', 'swing', 'charge'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;

        if (this.currentAttack === 'slam') {
            // Ground slam — area damage
            this.setTint(0xff8800);
            scene.time.delayedCall(500, () => {
                // Create shockwave
                const wave = scene.add.rectangle(this.x, 430, 200, 20, 0xff4400, 0.5);
                scene.time.delayedCall(300, () => wave.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack(scene);
            });
        } else if (this.currentAttack === 'swing') {
            // Club swing — horizontal hitbox
            this.setTint(0xffff00);
            scene.time.delayedCall(400, () => {
                const swingX = this.flipX ? this.x + 80 : this.x - 80;
                const swing = scene.add.rectangle(swingX, this.y, 60, 40, 0xffff00, 0.4);
                scene.time.delayedCall(200, () => swing.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack(scene);
            });
        } else if (this.currentAttack === 'charge') {
            // Charge at player
            this.setTint(0xff0000);
            const target = scene.player;
            const dir = target.x > this.x ? 1 : -1;
            this.setVelocityX(dir * 350);
            scene.time.delayedCall(800, () => {
                this.setVelocityX(0);
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack(scene);
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

        // Update health bar
        const ratio = this.health / this.maxHealth;
        this.healthBar.width = 300 * ratio;

        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true;
        if (this.attackTimer) this.attackTimer.remove();
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1000,
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

**Step 3: Write BossArenaScene.js**

```javascript
class BossArenaScene extends Phaser.Scene {
    constructor() { super('BossArena'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a0a0a');

        // Arena ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x2a1a1a);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 100, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Boss
        this.boss = new TrollBoss(this, 600, 300);
        this.physics.add.collider(this.boss, this.ground);

        // Boss defeated flag
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
                    this.boss.takeDamage(this.player.attackDamage);
                    this.boss.justHit = true;
                    this.time.delayedCall(300, () => {
                        if (this.boss) this.boss.justHit = false;
                    });
                }
            }
        }

        // Boss defeated → victory!
        if (this.boss && this.boss.isDead && !this.bossDefeated) {
            this.bossDefeated = true;
            GameState.comboUnlocked = true;
            this.time.delayedCall(2000, () => {
                this.scene.start('Victory');
            });
        }

        // Boss attacks hitting player
        // (Simplified: check distance during boss attack)
        if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.boss.x, this.boss.y
            );
            if (dist < 80 && !this.boss.playerHitThisAttack) {
                GameState.health -= 20;
                this.boss.playerHitThisAttack = true;
                this.player.setTint(0xff0000);
                this.time.delayedCall(200, () => this.player.clearTint());
                // Reset flag when attack ends
                this.time.delayedCall(500, () => {
                    if (this.boss) this.boss.playerHitThisAttack = false;
                });
            }
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 4: Update main.js config and index.html**

**Step 5: Test in browser**

- Enter boss arena → troll boss appears with health bar
- Boss cycles through 3 attacks: slam, swing, charge
- Attack boss with spacebar → its health goes down
- Get hit → your health goes down, dodge to avoid
- Kill boss → 2 second pause → victory scene

**Step 6: Commit**

```bash
git add js/TrollBoss.js js/scenes/BossArenaScene.js js/main.js index.html
git commit -m "add troll boss fight with 3 attack patterns"
```

---

### Task 12: Combo unlock + Victory scene

**Files:**
- Create: `js/scenes/VictoryScene.js`
- Modify: `js/Player.js` (add combo system)
- Modify: `js/main.js` (add scene)
- Modify: `index.html`

**Step 1: Add combo system to Player.attack()**

When `GameState.comboUnlocked`, track combo count (1→2→3) with a timing window. Hit 3 = big damage + "COMBO!" text.

```javascript
// Add to constructor:
this.comboCount = 0;
this.comboTimer = null;
this.comboWindow = 400;

// Modify attack():
// If combos unlocked, track chain
if (GameState.comboUnlocked) {
    this.comboCount++;
    if (this.comboCount > 3) this.comboCount = 1;
    if (this.comboTimer) this.comboTimer.remove();
    this.comboTimer = this.scene.time.delayedCall(this.comboWindow, () => {
        this.comboCount = 0;
    });
} else {
    this.comboCount = 1;
}

// Scale damage/size by combo hit
let hitDamage = this.attackDamage;
let hitboxWidth = 24;
if (this.comboCount === 2) {
    hitDamage *= 1.2;
    hitboxWidth = 28;
} else if (this.comboCount === 3) {
    hitDamage *= 2;
    hitboxWidth = 36;
}
```

**Step 2: Write VictoryScene.js**

```javascript
class VictoryScene extends Phaser.Scene {
    constructor() { super('Victory'); }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        // Japanese letter glow
        this.add.text(400, 150, '斬', {
            fontSize: '96px', fill: '#ff44ff'
        }).setOrigin(0.5);

        this.add.text(400, 250, 'COMBO UNLOCKED!', {
            fontSize: '32px', fill: '#ffcc00'
        }).setOrigin(0.5);

        this.add.text(400, 300, 'The モブスレイヤー has awakened.', {
            fontSize: '18px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 340, 'Press Space 3x fast for COMBO attacks!', {
            fontSize: '14px', fill: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(400, 400, 'To be continued...', {
            fontSize: '20px', fill: '#666666'
        }).setOrigin(0.5);
    }
}
```

**Step 3: Update main.js config and index.html**

**Step 4: Test the full game loop**

1. Start in village → talk to blacksmith
2. Go right to woods → find glowing sword
3. Go back to village → talk to blacksmith again (he offers gold)
4. Go right → now it's night woods with enemies
5. Kill all enemies → go right to boss
6. Beat the troll → victory screen!

**Step 5: Commit**

```bash
git add js/Player.js js/scenes/VictoryScene.js js/main.js index.html
git commit -m "add combo system and victory scene - game complete!"
```

---

### Task 13: Clean up — remove TestScene and old files

**Files:**
- Delete: `js/scenes/TestScene.js`
- Modify: `index.html` (remove TestScene script tag)
- Modify: `js/main.js` (remove TestScene from config, keep only game scenes)
- Delete: `generate_sprites.py` (not needed)

**Step 1: Remove TestScene references**

**Step 2: Clean up main.js scene list**

Final scene order: `[BootScene, VillageScene, WoodsDayScene, WoodsNightScene, BossArenaScene, VictoryScene]`

**Step 3: Test full game one more time**

**Step 4: Commit**

```bash
git add -A
git commit -m "clean up: remove test scene and unused files"
```
