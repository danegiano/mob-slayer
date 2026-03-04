# Mob Slayer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 2D side-view action game where the player discovers a mysterious Japanese sword, fights cursed creatures, defeats a troll boss, and unlocks combo attacks.

**Architecture:** Scene-based Phaser 3 game. Each area (village, woods day, woods night, boss arena) is a separate Phaser scene. Shared game state (health, weapon, story progress) lives in a `GameState` object accessible to all scenes. All art is colored rectangles for fast prototyping. Player, enemies, and NPC logic live in separate JS files.

**Tech Stack:** Phaser 3 (loaded via CDN), vanilla JavaScript, single `index.html` entry point, no build tools. Test by opening in browser.

**Testing approach:** No automated tests — this is a CDN-loaded browser game. Each step has a "Verify" section describing what to check in browser + dev console.

---

### Task 1: Project Boilerplate

**Files:**
- Create: `index.html`
- Create: `js/main.js`

**Step 1: Create index.html**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mob Slayer</title>
    <style>
        * { margin: 0; padding: 0; }
        body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
    </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

**Step 2: Create js/main.js with game config and GameState**

```js
const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood',       // 'wood' or 'slayer'
    comboUnlocked: false,  // unlocked after beating troll
    storyPhase: 0          // 0=start, 1=found sword, 2=talked to blacksmith, 3=night mode
};

class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() {
        this.add.text(400, 225, 'Mob Slayer', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 280, 'Loading...', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);
        this.time.delayedCall(1000, () => this.scene.start('Village'));
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: [BootScene]
};

const game = new Phaser.Game(config);
```

**Step 3: Verify in browser**

Open `index.html` in browser. Expected: Blue sky background, "Mob Slayer" title text, then blank blue screen after 1 second (Village scene doesn't exist yet — that's fine, no console errors).

**Step 4: Commit**

```bash
git add index.html js/main.js
git commit -m "project setup with Phaser 3 boilerplate"
```

---

### Task 2: Player Movement & Physics

**Files:**
- Create: `js/Player.js`
- Modify: `index.html` (add script tag)
- Create: `js/scenes/VillageScene.js`
- Modify: `index.html` (add script tag)
- Modify: `js/main.js` (register VillageScene)

**Step 1: Create js/Player.js**

The Player class extends `Phaser.Physics.Arcade.Sprite`. It handles movement (left/right/jump) using arrow keys and WASD. It's a blue rectangle.

```js
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Create a blue rectangle texture for the player
        const gfx = scene.add.graphics();
        gfx.fillStyle(0x3366ff);
        gfx.fillRect(0, 0, 32, 48);
        gfx.generateTexture('player', 32, 48);
        gfx.destroy();

        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(32, 48);

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.moveSpeed = 200;
        this.jumpSpeed = -400;
        this.facing = 'right';
    }

    update() {
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const jump = this.cursors.up.isDown || this.wasd.up.isDown;

        // Horizontal movement
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

        // Jump — only when on the ground
        if (jump && this.body.onFloor()) {
            this.setVelocityY(this.jumpSpeed);
        }
    }
}
```

**Step 2: Create js/scenes/VillageScene.js**

A simple scene with ground, sky, and the player.

```js
class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    create() {
        // Ground — brown rectangle across the bottom
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x8B4513);
        this.physics.add.existing(this.ground, true); // true = static body

        // Player
        this.player = new Player(this, 100, 350);
        this.physics.add.collider(this.player, this.ground);

        // Scene label
        this.add.text(16, 16, 'Village', { fontSize: '18px', fill: '#333' });
    }

    update() {
        this.player.update();
    }
}
```

**Step 3: Update index.html — add script tags before main.js**

Add these lines before the `main.js` script tag:

```html
    <script src="js/Player.js"></script>
    <script src="js/scenes/VillageScene.js"></script>
```

**Step 4: Update js/main.js — register VillageScene**

Replace the scene array:
```js
    scene: [BootScene, VillageScene]
```

**Step 5: Verify in browser**

Open `index.html`. Expected: After boot screen, you see a blue rectangle (player) standing on a brown ground strip. Arrow keys / WASD move left/right. Up arrow / W makes player jump. Player falls back down with gravity. Player can't walk off screen edges.

**Step 6: Commit**

```bash
git add js/Player.js js/scenes/VillageScene.js index.html js/main.js
git commit -m "add player movement and village scene with ground"
```

---

### Task 3: Player Attack (Single Hit)

**Files:**
- Modify: `js/Player.js` (add attack logic)

**Step 1: Add attack to Player.js**

Add spacebar input in constructor:
```js
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.isAttacking = false;
        this.attackTimer = null;
        this.attackDamage = 10; // wood sword damage
```

Add attack hitbox creation method and attack method:
```js
    attack() {
        if (this.isAttacking) return;
        this.isAttacking = true;

        // Visual feedback — flash white briefly
        this.setTint(0xffffff);

        // Create a hitbox in front of the player
        const offsetX = this.facing === 'right' ? 30 : -30;
        this.attackHitbox = this.scene.add.rectangle(this.x + offsetX, this.y, 24, 40);
        this.scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);

        // Remove hitbox after short delay
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

Add to update() — check for spacebar press:
```js
        // Attack
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.attack();
        }
```

**Step 2: Verify in browser**

Press spacebar. Expected: Player flashes white briefly. No errors in console. A small hitbox appears in front of the player (you can set `debug: true` in physics config to see it, then turn it back off).

**Step 3: Commit**

```bash
git add js/Player.js
git commit -m "add single-hit attack with hitbox"
```

---

### Task 4: Dodge Roll

**Files:**
- Modify: `js/Player.js` (add dodge roll)

**Step 1: Add dodge to Player.js**

Add in constructor:
```js
        this.dodgeKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.isDodging = false;
        this.dodgeCooldown = false;
```

Add dodge method:
```js
    dodge() {
        if (this.isDodging || this.dodgeCooldown) return;
        this.isDodging = true;
        this.dodgeCooldown = true;

        // Dash in facing direction
        const dashSpeed = this.facing === 'right' ? 400 : -400;
        this.setVelocityX(dashSpeed);

        // Brief invincibility — make semi-transparent
        this.setAlpha(0.4);
        this.body.checkCollision.none = true;

        // End dodge after 200ms
        this.scene.time.delayedCall(200, () => {
            this.isDodging = false;
            this.setAlpha(1);
            this.body.checkCollision.none = false;
        });

        // Cooldown — can't dodge again for 500ms
        this.scene.time.delayedCall(500, () => {
            this.dodgeCooldown = false;
        });
    }
```

Add to update():
```js
        // Dodge
        if (Phaser.Input.Keyboard.JustDown(this.dodgeKey)) {
            this.dodge();
        }
```

Also, prevent movement input during dodge — wrap the existing movement code in update():
```js
        if (!this.isDodging) {
            // ... existing left/right/jump movement code ...
        }
```

**Step 2: Verify in browser**

Press Shift. Expected: Player dashes forward quickly, goes semi-transparent for a moment, then returns to normal. Can't dodge again for half a second.

**Step 3: Commit**

```bash
git add js/Player.js
git commit -m "add dodge roll with invincibility and cooldown"
```

---

### Task 5: HUD — Health Bar

**Files:**
- Create: `js/HUD.js`
- Modify: `index.html` (add script tag)
- Modify: `js/scenes/VillageScene.js` (add HUD)

**Step 1: Create js/HUD.js**

```js
class HUD {
    constructor(scene) {
        this.scene = scene;

        // Health bar background (dark red)
        this.healthBarBg = scene.add.rectangle(120, 30, 200, 20, 0x660000);
        this.healthBarBg.setScrollFactor(0); // stays on screen
        this.healthBarBg.setDepth(100);

        // Health bar fill (green)
        this.healthBarFill = scene.add.rectangle(120, 30, 200, 20, 0x00cc00);
        this.healthBarFill.setScrollFactor(0);
        this.healthBarFill.setDepth(101);

        // Health text
        this.healthText = scene.add.text(120, 30, '100/100', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        // Weapon label
        this.weaponText = scene.add.text(16, 50, 'Weapon: Wood Sword', {
            fontSize: '14px', fill: '#333'
        }).setScrollFactor(0).setDepth(100);
    }

    update() {
        const pct = GameState.health / GameState.maxHealth;
        this.healthBarFill.setScale(pct, 1);
        // Shift the bar left as it shrinks so it drains from right to left
        this.healthBarFill.setX(120 - (1 - pct) * 100);
        this.healthText.setText(`${GameState.health}/${GameState.maxHealth}`);

        if (GameState.weapon === 'slayer') {
            this.weaponText.setText('Weapon: モブスレイヤー');
        }
    }
}
```

**Step 2: Add script tag to index.html before main.js**

```html
    <script src="js/HUD.js"></script>
```

**Step 3: Add HUD to VillageScene.js**

In `create()`:
```js
        this.hud = new HUD(this);
```

In `update()`:
```js
        this.hud.update();
```

**Step 4: Verify in browser**

Expected: Green health bar in top-left showing "100/100". "Weapon: Wood Sword" text below it.

**Step 5: Commit**

```bash
git add js/HUD.js index.html js/scenes/VillageScene.js
git commit -m "add HUD with health bar and weapon display"
```

---

### Task 6: Dialogue System

**Files:**
- Create: `js/DialogueBox.js`
- Modify: `index.html` (add script tag)

**Step 1: Create js/DialogueBox.js**

A reusable dialogue box that shows text at the bottom of the screen. Press E to advance through lines. Calls a callback when done.

```js
class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.currentLine = 0;
        this.onComplete = null;

        // Dark semi-transparent background box
        this.bg = scene.add.rectangle(400, 400, 760, 80, 0x000000, 0.8);
        this.bg.setScrollFactor(0).setDepth(200);
        this.bg.setVisible(false);

        // Text
        this.text = scene.add.text(40, 375, '', {
            fontSize: '16px', fill: '#fff', wordWrap: { width: 720 }
        }).setScrollFactor(0).setDepth(201);
        this.text.setVisible(false);

        // "Press E" hint
        this.hint = scene.add.text(720, 420, '[E]', {
            fontSize: '12px', fill: '#aaa'
        }).setScrollFactor(0).setDepth(201);
        this.hint.setVisible(false);

        // E key
        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    open(lines, onComplete) {
        this.lines = lines;
        this.currentLine = 0;
        this.onComplete = onComplete || null;
        this.isOpen = true;
        this.bg.setVisible(true);
        this.text.setVisible(true);
        this.hint.setVisible(true);
        this.text.setText(this.lines[0]);
    }

    update() {
        if (!this.isOpen) return;

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.currentLine++;
            if (this.currentLine >= this.lines.length) {
                this.close();
            } else {
                this.text.setText(this.lines[this.currentLine]);
            }
        }
    }

    close() {
        this.isOpen = false;
        this.bg.setVisible(false);
        this.text.setVisible(false);
        this.hint.setVisible(false);
        if (this.onComplete) this.onComplete();
    }
}
```

**Step 2: Add script tag to index.html**

```html
    <script src="js/DialogueBox.js"></script>
```

**Step 3: Verify — we'll test this in the next task with the blacksmith**

No visual test yet — just make sure no console errors when loading.

**Step 4: Commit**

```bash
git add js/DialogueBox.js index.html
git commit -m "add reusable dialogue box system"
```

---

### Task 7: Blacksmith NPC in Village

**Files:**
- Modify: `js/scenes/VillageScene.js` (add blacksmith NPC and dialogue)

**Step 1: Add blacksmith to VillageScene.js**

In `create()` add the blacksmith as an orange rectangle, dialogue box, and interaction zone:

```js
        // Blacksmith NPC — orange rectangle
        const bsGfx = this.add.graphics();
        bsGfx.fillStyle(0xff8800);
        bsGfx.fillRect(0, 0, 32, 48);
        bsGfx.generateTexture('blacksmith', 32, 48);
        bsGfx.destroy();

        this.blacksmith = this.physics.add.staticImage(600, 386, 'blacksmith');

        // Label above blacksmith
        this.add.text(600, 350, 'Blacksmith', {
            fontSize: '12px', fill: '#333'
        }).setOrigin(0.5);

        // "Press E" prompt — shown when player is close
        this.talkPrompt = this.add.text(600, 340, 'Press E to talk', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Dialogue box
        this.dialogue = new DialogueBox(this);

        // E key for NPC interaction
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
```

In `update()` add proximity check and dialogue:

```js
        // Dialogue system
        this.dialogue.update();

        // Show "Press E" when near blacksmith
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.blacksmith.x, this.blacksmith.y
        );

        if (dist < 60 && !this.dialogue.isOpen) {
            this.talkPrompt.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.talkPrompt.setVisible(false);

                if (GameState.storyPhase === 0) {
                    this.dialogue.open([
                        "Blacksmith: Hey there! Heading out to the woods?",
                        "Blacksmith: Be careful — strange things have been happening lately.",
                        "Blacksmith: If you find anything interesting, come show me!"
                    ]);
                } else if (GameState.storyPhase === 1) {
                    this.dialogue.open([
                        "Blacksmith: What's that sword?! Let me see...",
                        "Blacksmith: This is... モブスレイヤー — the Slayer of Mobs!",
                        "Blacksmith: I'll give you 1000 gold for it! That's a fortune!",
                        "You: Uhhh... no. I think I'll keep it.",
                        "Blacksmith: Your choice, kid. But be careful with that thing."
                    ], () => {
                        GameState.storyPhase = 2;
                    });
                } else {
                    this.dialogue.open([
                        "Blacksmith: Be careful out there. It's getting dark..."
                    ]);
                }
            }
        } else {
            this.talkPrompt.setVisible(false);
        }
```

**Step 2: Verify in browser**

Expected: Orange rectangle blacksmith in the village. Walk up to him, "Press E to talk" appears. Press E, dialogue box opens at bottom. Press E to advance through lines. Different dialogue plays based on story phase.

**Step 3: Commit**

```bash
git add js/scenes/VillageScene.js
git commit -m "add blacksmith NPC with story-based dialogue"
```

---

### Task 8: Woods Day Scene — Sword Pickup

**Files:**
- Create: `js/scenes/WoodsDayScene.js`
- Modify: `index.html` (add script tag)
- Modify: `js/main.js` (register scene)
- Modify: `js/scenes/VillageScene.js` (add scene transition)

**Step 1: Create js/scenes/WoodsDayScene.js**

```js
class WoodsDayScene extends Phaser.Scene {
    constructor() { super('WoodsDay'); }

    create() {
        // Darker green sky for woods
        this.cameras.main.setBackgroundColor('#4a8c3f');

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x5a3a1a);
        this.physics.add.existing(this.ground, true);

        // Trees (dark green rectangles as decoration)
        for (let i = 0; i < 6; i++) {
            const tx = 80 + i * 130;
            this.add.rectangle(tx, 340, 30, 120, 0x2d5a1e); // trunk
            this.add.rectangle(tx, 270, 70, 60, 0x1a4010);  // leaves
        }

        // Player
        this.player = new Player(this, 50, 350);
        this.physics.add.collider(this.player, this.ground);

        // The Slayer sword — glowing yellow rectangle
        if (GameState.storyPhase === 0) {
            const swordGfx = this.add.graphics();
            swordGfx.fillStyle(0xffdd00);
            swordGfx.fillRect(0, 0, 12, 36);
            swordGfx.generateTexture('slayer-sword', 12, 36);
            swordGfx.destroy();

            this.sword = this.physics.add.staticImage(650, 392, 'slayer-sword');

            // Glow effect — pulsing tint
            this.tweens.add({
                targets: this.sword,
                alpha: { from: 0.6, to: 1 },
                duration: 600,
                yoyo: true,
                repeat: -1
            });

            // Pickup label
            this.swordLabel = this.add.text(650, 360, '???', {
                fontSize: '12px', fill: '#ffdd00'
            }).setOrigin(0.5);

            // Overlap for pickup
            this.physics.add.overlap(this.player, this.sword, () => {
                this.pickUpSword();
            });
        }

        // HUD
        this.hud = new HUD(this);

        // Scene label
        this.add.text(16, 16, 'The Woods', { fontSize: '18px', fill: '#ddd' });

        // Dialogue box
        this.dialogue = new DialogueBox(this);

        // Left edge — back to village
        this.exitZone = this.add.rectangle(0, 225, 20, 450, 0x000000, 0);
        this.physics.add.existing(this.exitZone, true);
        this.physics.add.overlap(this.player, this.exitZone, () => {
            this.scene.start('Village');
        });
    }

    pickUpSword() {
        if (GameState.storyPhase !== 0) return;
        GameState.storyPhase = 1;
        GameState.weapon = 'slayer';
        this.player.attackDamage = 25;

        this.sword.destroy();
        this.swordLabel.destroy();

        this.dialogue.open([
            "You found a glowing sword!",
            "The blade reads: モブスレイヤー",
            "\"Slayer of the Mobs\"",
            "You feel its power flowing through you..."
        ]);
    }

    update() {
        this.player.update();
        this.hud.update();
        this.dialogue.update();

        // Don't move player during dialogue
        if (this.dialogue.isOpen) {
            this.player.setVelocityX(0);
        }
    }
}
```

**Step 2: Add script tag to index.html**

```html
    <script src="js/scenes/WoodsDayScene.js"></script>
```

**Step 3: Register in js/main.js scene array**

```js
    scene: [BootScene, VillageScene, WoodsDayScene]
```

**Step 4: Add exit zone in VillageScene.js — right edge goes to woods**

In VillageScene `create()`:
```js
        // Right edge — go to woods
        this.exitRight = this.add.rectangle(800, 225, 20, 450, 0x000000, 0);
        this.physics.add.existing(this.exitRight, true);
        this.physics.add.overlap(this.player, this.exitRight, () => {
            if (GameState.storyPhase < 2) {
                this.scene.start('WoodsDay');
            } else {
                this.scene.start('WoodsNight');
            }
        });
```

**Step 5: Verify in browser**

Walk right in village → transition to woods. See trees, darker background. Walk to glowing yellow sword → dialogue about finding it. Walk left → back to village. Talk to blacksmith → new dialogue about the sword and 1000 gold offer.

**Step 6: Commit**

```bash
git add js/scenes/WoodsDayScene.js index.html js/main.js js/scenes/VillageScene.js
git commit -m "add woods day scene with sword pickup and scene transitions"
```

---

### Task 9: Woods Night Scene — Cursed Creatures

**Files:**
- Create: `js/Enemy.js`
- Create: `js/scenes/WoodsNightScene.js`
- Modify: `index.html` (add script tags)
- Modify: `js/main.js` (register scene)

**Step 1: Create js/Enemy.js**

```js
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, color, health, damage, speed) {
        // Generate texture from color
        const key = 'enemy_' + color.toString(16);
        if (!scene.textures.exists(key)) {
            const gfx = scene.add.graphics();
            gfx.fillStyle(color);
            gfx.fillRect(0, 0, 24, 24);
            gfx.generateTexture(key, 24, 24);
            gfx.destroy();
        }

        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.speed = speed;
        this.isHit = false;

        // Health bar above enemy
        this.hpBar = scene.add.rectangle(x, y - 20, 24, 4, 0x00cc00).setDepth(10);
    }

    update(playerX) {
        if (this.isHit) return;

        // Simple AI: walk toward player
        if (playerX < this.x) {
            this.setVelocityX(-this.speed);
        } else {
            this.setVelocityX(this.speed);
        }

        // Update health bar position
        this.hpBar.setPosition(this.x, this.y - 20);
        this.hpBar.setScale(this.health / this.maxHealth, 1);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.isHit = true;
        this.setTint(0xff0000);

        // Knockback
        this.scene.time.delayedCall(200, () => {
            this.isHit = false;
            this.clearTint();
        });

        if (this.health <= 0) {
            this.hpBar.destroy();
            this.destroy();
            return true; // dead
        }
        return false; // alive
    }
}
```

**Step 2: Create js/scenes/WoodsNightScene.js**

```js
class WoodsNightScene extends Phaser.Scene {
    constructor() { super('WoodsNight'); }

    create() {
        // Dark blue night sky
        this.cameras.main.setBackgroundColor('#1a1a3a');

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x3a2a1a);
        this.physics.add.existing(this.ground, true);

        // Dark trees
        for (let i = 0; i < 6; i++) {
            const tx = 80 + i * 130;
            this.add.rectangle(tx, 340, 30, 120, 0x1a3a0e);
            this.add.rectangle(tx, 270, 70, 60, 0x0e2a08);
        }

        // Player
        this.player = new Player(this, 50, 350);
        this.physics.add.collider(this.player, this.ground);

        // Enemies — cursed creatures (green rectangles)
        this.enemies = this.add.group();
        this.spawnEnemies();

        // Collisions
        this.physics.add.collider(this.enemies, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Scene label
        this.add.text(16, 16, 'The Dark Woods', { fontSize: '18px', fill: '#aa88cc' });

        // Dialogue
        this.dialogue = new DialogueBox(this);

        // Intro dialogue
        this.dialogue.open([
            "The woods are different at night...",
            "The animals — they're cursed! Their eyes glow red!",
            "Prepare to fight!"
        ]);

        // Right edge — to boss arena
        this.exitRight = this.add.rectangle(800, 225, 20, 450, 0x000000, 0);
        this.physics.add.existing(this.exitRight, true);
        this.physics.add.overlap(this.player, this.exitRight, () => {
            if (this.enemies.countActive() === 0) {
                this.scene.start('BossArena');
            }
        });

        this.enemiesDefeatedOnce = false;
    }

    spawnEnemies() {
        const positions = [250, 400, 550, 680];
        positions.forEach(x => {
            const enemy = new Enemy(this, x, 380, 0x33cc33, 30, 10, 60);
            this.enemies.add(enemy);
            this.physics.add.collider(enemy, this.ground);
        });
    }

    update() {
        this.player.update();
        this.hud.update();
        this.dialogue.update();

        if (this.dialogue.isOpen) {
            this.player.setVelocityX(0);
            return;
        }

        // Enemy AI
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(this.player.x);

            // Enemy damages player on contact
            if (!this.player.isDodging && !enemy.isHit) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );
                if (dist < 30) {
                    this.playerTakeDamage(enemy.damage);
                }
            }
        });

        // Check player attack hitbox vs enemies
        if (this.player.attackHitbox) {
            this.enemies.getChildren().forEach(enemy => {
                const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.attackHitbox.getBounds(),
                    enemy.getBounds()
                );
                if (overlap) {
                    enemy.takeDamage(this.player.attackDamage);
                }
            });
        }

        // All enemies defeated — show message
        if (this.enemies.countActive() === 0 && !this.enemiesDefeatedOnce) {
            this.enemiesDefeatedOnce = true;
            this.dialogue.open([
                "The cursed creatures are defeated!",
                "But you sense something bigger deeper in the woods..."
            ]);
        }
    }

    playerTakeDamage(amount) {
        if (this.player.isHurt) return;
        this.player.isHurt = true;
        GameState.health = Math.max(0, GameState.health - amount);
        this.player.setTint(0xff0000);
        this.time.delayedCall(500, () => {
            this.player.isHurt = false;
            this.player.clearTint();
        });

        if (GameState.health <= 0) {
            // Simple death — restart scene
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 3: Add script tags to index.html**

```html
    <script src="js/Enemy.js"></script>
    <script src="js/scenes/WoodsNightScene.js"></script>
```

**Step 4: Register in js/main.js**

```js
    scene: [BootScene, VillageScene, WoodsDayScene, WoodsNightScene]
```

**Step 5: Verify in browser**

Complete the story flow: find sword → talk to blacksmith → walk right → dark woods scene. Green enemies walk toward you. Attack them with spacebar. They flash red and take damage. When all defeated, dialogue appears. Can proceed right to boss arena (scene doesn't exist yet — that's OK).

**Step 6: Commit**

```bash
git add js/Enemy.js js/scenes/WoodsNightScene.js index.html js/main.js
git commit -m "add woods night scene with cursed creature enemies"
```

---

### Task 10: Troll Boss Fight

**Files:**
- Create: `js/TrollBoss.js`
- Create: `js/scenes/BossArenaScene.js`
- Modify: `index.html` (add script tags)
- Modify: `js/main.js` (register scene)

**Step 1: Create js/TrollBoss.js**

```js
class TrollBoss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Big red rectangle
        const gfx = scene.add.graphics();
        gfx.fillStyle(0xcc2222);
        gfx.fillRect(0, 0, 64, 80);
        gfx.generateTexture('troll', 64, 80);
        gfx.destroy();

        super(scene, x, y, 'troll');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(64, 80);

        this.health = 200;
        this.maxHealth = 200;
        this.damage = 20;
        this.isAttacking = false;
        this.isHit = false;
        this.currentAttack = null;
        this.attackCooldown = false;

        // Boss health bar (wide, at top of screen)
        this.hpBarBg = scene.add.rectangle(400, 60, 300, 16, 0x660000)
            .setScrollFactor(0).setDepth(100);
        this.hpBarFill = scene.add.rectangle(400, 60, 300, 16, 0xcc0000)
            .setScrollFactor(0).setDepth(101);
        this.hpLabel = scene.add.text(400, 60, 'TROLL', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    }

    update(playerX) {
        if (this.isHit || this.isAttacking) return;

        // Walk toward player slowly
        const speed = 50;
        if (playerX < this.x - 40) {
            this.setVelocityX(-speed);
        } else if (playerX > this.x + 40) {
            this.setVelocityX(speed);
        } else {
            this.setVelocityX(0);
        }

        // Random attacks
        if (!this.attackCooldown) {
            const dist = Math.abs(playerX - this.x);
            if (dist < 120) {
                this.chooseAttack(playerX);
            }
        }

        // Update boss health bar
        const pct = this.health / this.maxHealth;
        this.hpBarFill.setScale(pct, 1);
        this.hpBarFill.setX(400 - (1 - pct) * 150);
    }

    chooseAttack(playerX) {
        this.attackCooldown = true;
        const attacks = ['slam', 'swing', 'charge'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.setVelocityX(0);

        switch (this.currentAttack) {
            case 'slam':
                this.doSlam();
                break;
            case 'swing':
                this.doSwing();
                break;
            case 'charge':
                this.doCharge(playerX);
                break;
        }

        // Cooldown between attacks
        this.scene.time.delayedCall(2000, () => {
            this.attackCooldown = false;
        });
    }

    doSlam() {
        // Jump up then slam down — area damage
        this.setTint(0xff8800);

        // Warning text
        const warn = this.scene.add.text(this.x, this.y - 60, 'SLAM!', {
            fontSize: '16px', fill: '#ff8800'
        }).setOrigin(0.5);

        this.scene.time.delayedCall(500, () => {
            // Create ground shockwave hitbox
            this.slamHitbox = this.scene.add.rectangle(this.x, 410, 160, 30);
            this.scene.physics.add.existing(this.slamHitbox, false);
            this.slamHitbox.body.setAllowGravity(false);

            // Screen shake
            this.scene.cameras.main.shake(200, 0.01);

            this.scene.time.delayedCall(300, () => {
                if (this.slamHitbox) this.slamHitbox.destroy();
                this.slamHitbox = null;
                warn.destroy();
                this.clearTint();
                this.isAttacking = false;
            });
        });
    }

    doSwing() {
        // Horizontal club swing — jump to dodge
        this.setTint(0xff4444);

        const warn = this.scene.add.text(this.x, this.y - 60, 'SWING!', {
            fontSize: '16px', fill: '#ff4444'
        }).setOrigin(0.5);

        this.scene.time.delayedCall(400, () => {
            // Hitbox at player height — need to jump over
            this.swingHitbox = this.scene.add.rectangle(this.x, 400, 200, 20);
            this.scene.physics.add.existing(this.swingHitbox, false);
            this.swingHitbox.body.setAllowGravity(false);

            this.scene.time.delayedCall(300, () => {
                if (this.swingHitbox) this.swingHitbox.destroy();
                this.swingHitbox = null;
                warn.destroy();
                this.clearTint();
                this.isAttacking = false;
            });
        });
    }

    doCharge(playerX) {
        // Charge at the player
        this.setTint(0xffff00);

        const warn = this.scene.add.text(this.x, this.y - 60, 'CHARGE!', {
            fontSize: '16px', fill: '#ffff00'
        }).setOrigin(0.5);

        this.scene.time.delayedCall(600, () => {
            const dir = playerX < this.x ? -1 : 1;
            this.setVelocityX(dir * 350);

            this.scene.time.delayedCall(800, () => {
                this.setVelocityX(0);
                warn.destroy();
                this.clearTint();
                this.isAttacking = false;
            });
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        this.isHit = true;
        this.setTint(0xffffff);
        this.setVelocityX(0);

        this.scene.time.delayedCall(300, () => {
            this.isHit = false;
            this.clearTint();
        });

        if (this.health <= 0) {
            this.hpBarBg.destroy();
            this.hpBarFill.destroy();
            this.hpLabel.destroy();
            this.destroy();
            return true; // dead
        }
        return false;
    }
}
```

**Step 2: Create js/scenes/BossArenaScene.js**

```js
class BossArenaScene extends Phaser.Scene {
    constructor() { super('BossArena'); }

    create() {
        // Dark red sky
        this.cameras.main.setBackgroundColor('#2a0a0a');

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x4a2a1a);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 100, 350);
        this.physics.add.collider(this.player, this.ground);

        // Troll boss
        this.boss = new TrollBoss(this, 600, 350);
        this.physics.add.collider(this.boss, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Scene label
        this.add.text(16, 16, 'Boss Arena', { fontSize: '18px', fill: '#cc4444' });

        // Dialogue
        this.dialogue = new DialogueBox(this);
        this.dialogue.open([
            "A massive troll blocks your path!",
            "Its eyes glow with the same curse...",
            "Fight!"
        ]);

        this.bossDefeated = false;
    }

    update() {
        this.player.update();
        this.hud.update();
        this.dialogue.update();

        if (this.dialogue.isOpen) {
            this.player.setVelocityX(0);
            return;
        }

        if (this.boss && this.boss.active) {
            this.boss.update(this.player.x);

            // Boss contact damage
            if (!this.player.isDodging && !this.player.isHurt) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    this.boss.x, this.boss.y
                );
                if (dist < 50) {
                    this.playerTakeDamage(this.boss.damage);
                }
            }

            // Boss attack hitboxes damage player
            ['slamHitbox', 'swingHitbox'].forEach(hb => {
                if (this.boss[hb] && !this.player.isDodging && !this.player.isHurt) {
                    const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
                        this.boss[hb].getBounds(),
                        this.player.getBounds()
                    );
                    if (overlap) {
                        this.playerTakeDamage(this.boss.damage);
                    }
                }
            });

            // Player attack hits boss
            if (this.player.attackHitbox) {
                const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.attackHitbox.getBounds(),
                    this.boss.getBounds()
                );
                if (overlap && !this.boss.isHit) {
                    const dead = this.boss.takeDamage(this.player.attackDamage);
                    if (dead) {
                        this.onBossDefeated();
                    }
                }
            }
        }
    }

    onBossDefeated() {
        if (this.bossDefeated) return;
        this.bossDefeated = true;

        // Screen flash
        this.cameras.main.flash(1000, 255, 255, 100);

        // Japanese letter glow effect
        const glow = this.add.text(400, 200, 'モブスレイヤー', {
            fontSize: '48px', fill: '#ffdd00'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: glow,
            alpha: 1,
            scale: { from: 0.5, to: 1.5 },
            duration: 2000,
            onComplete: () => {
                GameState.comboUnlocked = true;
                this.dialogue.open([
                    "The troll falls!",
                    "The sword glows with ancient power...",
                    "モブスレイヤー — Slayer of the Mobs!",
                    "You feel new power coursing through you...",
                    "COMBO ATTACKS UNLOCKED!",
                    "Press ATTACK rapidly for a 3-hit combo!"
                ], () => {
                    this.scene.start('Victory');
                });
            }
        });
    }

    playerTakeDamage(amount) {
        if (this.player.isHurt) return;
        this.player.isHurt = true;
        GameState.health = Math.max(0, GameState.health - amount);
        this.player.setTint(0xff0000);
        this.time.delayedCall(500, () => {
            this.player.isHurt = false;
            this.player.clearTint();
        });

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 3: Add script tags to index.html**

```html
    <script src="js/TrollBoss.js"></script>
    <script src="js/scenes/BossArenaScene.js"></script>
```

**Step 4: Register in js/main.js**

```js
    scene: [BootScene, VillageScene, WoodsDayScene, WoodsNightScene, BossArenaScene]
```

**Step 5: Verify in browser**

Play through the whole story to reach the boss. Troll is a big red rectangle. It walks toward you and does random attacks (SLAM, SWING, CHARGE) with warning text. Hit it with spacebar. Its health bar drains. When health reaches 0: screen flashes, Japanese text glows, dialogue plays about combo unlock.

**Step 6: Commit**

```bash
git add js/TrollBoss.js js/scenes/BossArenaScene.js index.html js/main.js
git commit -m "add troll boss fight with 3 attack patterns"
```

---

### Task 11: Victory Scene

**Files:**
- Create: `js/scenes/VictoryScene.js`
- Modify: `index.html` (add script tag)
- Modify: `js/main.js` (register scene)

**Step 1: Create js/scenes/VictoryScene.js**

```js
class VictoryScene extends Phaser.Scene {
    constructor() { super('Victory'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a2a');

        this.add.text(400, 120, 'モブスレイヤー', {
            fontSize: '56px', fill: '#ffdd00'
        }).setOrigin(0.5);

        this.add.text(400, 180, 'MOB SLAYER', {
            fontSize: '28px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 240, 'You defeated the troll and unlocked combo attacks!', {
            fontSize: '16px', fill: '#aaaacc'
        }).setOrigin(0.5);

        this.add.text(400, 280, 'The curse on the woods has been lifted...', {
            fontSize: '14px', fill: '#8888aa'
        }).setOrigin(0.5);

        this.add.text(400, 320, 'Or has it?', {
            fontSize: '14px', fill: '#cc4444'
        }).setOrigin(0.5);

        this.add.text(400, 380, 'Press SPACE to play again', {
            fontSize: '18px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => {
            // Reset game state
            GameState.health = 100;
            GameState.weapon = 'wood';
            GameState.comboUnlocked = false;
            GameState.storyPhase = 0;
            this.scene.start('Village');
        });
    }
}
```

**Step 2: Add script tag to index.html**

```html
    <script src="js/scenes/VictoryScene.js"></script>
```

**Step 3: Register in js/main.js**

```js
    scene: [BootScene, VillageScene, WoodsDayScene, WoodsNightScene, BossArenaScene, VictoryScene]
```

**Step 4: Verify in browser**

After beating troll → victory screen with Japanese text, congratulations, "Or has it?" teaser, and play again option.

**Step 5: Commit**

```bash
git add js/scenes/VictoryScene.js index.html js/main.js
git commit -m "add victory screen with play-again option"
```

---

### Task 12: Combo Attack System

**Files:**
- Modify: `js/Player.js` (add combo chain logic)

**Step 1: Add combo state to Player constructor**

```js
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboWindow = 400; // ms to press next attack in combo
```

**Step 2: Replace the attack() method with combo-aware version**

```js
    attack() {
        if (this.isAttacking) return;

        // If combos unlocked, track combo chain
        if (GameState.comboUnlocked) {
            this.comboCount++;
            if (this.comboCount > 3) this.comboCount = 1;

            // Reset combo timer
            if (this.comboTimer) this.comboTimer.remove();
            this.comboTimer = this.scene.time.delayedCall(this.comboWindow, () => {
                this.comboCount = 0; // reset if too slow
            });
        } else {
            this.comboCount = 1; // always first hit when no combos
        }

        this.isAttacking = true;

        // Visual feedback based on combo hit
        let hitDamage = this.attackDamage;
        let hitboxWidth = 24;
        let hitColor = 0xffffff;

        if (this.comboCount === 2) {
            hitDamage = this.attackDamage * 1.2;
            hitboxWidth = 28;
            hitColor = 0xffff88;
        } else if (this.comboCount === 3) {
            hitDamage = this.attackDamage * 2; // BIG swing
            hitboxWidth = 36;
            hitColor = 0xff4400;
        }

        this.setTint(hitColor);
        this.currentHitDamage = hitDamage;

        // Create hitbox
        const offsetX = this.facing === 'right' ? 30 : -30;
        this.attackHitbox = this.scene.add.rectangle(
            this.x + offsetX, this.y, hitboxWidth, 40
        );
        this.scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);

        // Combo 3 text flash
        if (this.comboCount === 3 && GameState.comboUnlocked) {
            const comboText = this.scene.add.text(this.x, this.y - 40, 'COMBO!', {
                fontSize: '16px', fill: '#ff4400'
            }).setOrigin(0.5);
            this.scene.tweens.add({
                targets: comboText,
                alpha: 0, y: this.y - 70,
                duration: 600,
                onComplete: () => comboText.destroy()
            });
        }

        const attackDuration = this.comboCount === 3 ? 250 : 150;
        this.scene.time.delayedCall(attackDuration, () => {
            if (this.attackHitbox) {
                this.attackHitbox.destroy();
                this.attackHitbox = null;
            }
            this.clearTint();
            this.isAttacking = false;
        });
    }
```

**Step 3: Update enemy/boss hit detection to use currentHitDamage**

In WoodsNightScene.js and BossArenaScene.js, change:
```js
enemy.takeDamage(this.player.attackDamage);
```
to:
```js
enemy.takeDamage(this.player.currentHitDamage || this.player.attackDamage);
```

Same for boss:
```js
this.boss.takeDamage(this.player.currentHitDamage || this.player.attackDamage);
```

**Step 4: Verify in browser**

Before troll: spacebar does single hits (white flash, same damage each time). After troll (on replay or if you set `GameState.comboUnlocked = true` in console): pressing spacebar 3 times quickly does slash → slash → BIG SWING with "COMBO!" text and extra damage on 3rd hit.

**Step 5: Commit**

```bash
git add js/Player.js js/scenes/WoodsNightScene.js js/scenes/BossArenaScene.js
git commit -m "add 3-hit combo system unlocked after troll defeat"
```

---

### Task 13: README and Polish

**Files:**
- Create: `README.md`

**Step 1: Create README.md**

```markdown
# Mob Slayer モブスレイヤー

A 2D side-view action game built with Phaser 3.

## How to Play

Open `index.html` in your browser — no install needed!

### Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move & Jump |
| Spacebar | Attack |
| Shift | Dodge Roll |
| E | Talk to NPCs |

### Story

You start in a village with a wood sword. Explore the woods to find the legendary
モブスレイヤー (Mob Slayer) sword. But when night falls, cursed creatures attack!
Fight through them and defeat the troll boss to unlock combo attacks!

## Built With

- [Phaser 3](https://phaser.io/) — game framework
- Vanilla JavaScript
- Made by Dane
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "add README with controls and story summary"
```

---

## Summary

| Task | What It Builds |
|------|---------------|
| 1 | Project boilerplate — HTML + Phaser config |
| 2 | Player movement, jumping, physics |
| 3 | Single-hit attack with hitbox |
| 4 | Dodge roll with invincibility |
| 5 | HUD — health bar + weapon display |
| 6 | Dialogue box system |
| 7 | Blacksmith NPC with story dialogue |
| 8 | Woods day scene — sword pickup |
| 9 | Woods night — cursed creatures |
| 10 | Troll boss fight |
| 11 | Victory screen |
| 12 | 3-hit combo system |
| 13 | README |

Each task builds on the last. After task 8, you can play through the first half of the story. After task 11, the full game works. Task 12 adds the combo reward.
