# Mob Slayer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 2D side-view exploration game where the player discovers a mysterious sword and fights mobs and a troll boss.

**Architecture:** Scene-based Phaser 3 game. Each area (village, woods, boss arena) is a separate Phaser scene. Shared game state (health, weapon, story progress) lives in a GameState object passed between scenes. All art is colored rectangles for fast prototyping.

**Tech Stack:** Phaser 3 (loaded via CDN), vanilla JavaScript, single index.html entry point, no build tools.

---

### Task 1: Project Setup & Boilerplate

**Files:**
- Create: `index.html`
- Create: `js/main.js`

**Step 1: Create index.html with Phaser CDN and canvas**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Mob Slayer</title>
    <style>
        * { margin: 0; padding: 0; }
        body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

**Step 2: Create js/main.js with Phaser config and a placeholder scene**

```js
// Game state shared between scenes
const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood', // 'wood' or 'slayer'
    storyPhase: 0,
    // 0 = start, 1 = found sword, 2 = talked to blacksmith, 3 = mobs appear
    playerX: 100 // remember position between scene transitions
};

class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    create() {
        this.scene.start('Village');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [BootScene]
};

const game = new Phaser.Game(config);
```

**Step 3: Open in browser to verify blue sky background appears**

Run: Open `index.html` in a browser (or use a local server).
Expected: Blue sky canvas, no errors in console.

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
- Modify: `js/main.js` (add test scene with player)

**Step 1: Create js/Player.js with player class**

The Player is a colored rectangle with physics. Handles movement, jumping, and facing direction.

```js
class Player extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        // Blue rectangle: 32 wide, 48 tall
        super(scene, x, y, 32, 48, 0x3333ff);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);

        // Movement properties
        this.speed = 200;
        this.jumpPower = -400;
        this.isOnGround = false;
        this.facingRight = true;

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D'
        });
    }

    update() {
        this.isOnGround = this.body.blocked.down;

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.body.setVelocityX(-this.speed);
            this.facingRight = false;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.body.setVelocityX(this.speed);
            this.facingRight = true;
        } else {
            this.body.setVelocityX(0);
        }

        // Jump
        if ((this.cursors.up.isDown || this.wasd.up.isDown) && this.isOnGround) {
            this.body.setVelocityY(this.jumpPower);
        }
    }
}
```

**Step 2: Add Player.js script to index.html (before main.js)**

Add this line in index.html before the main.js script tag:
```html
<script src="js/Player.js"></script>
```

**Step 3: Create a test scene in main.js to try the player**

Replace BootScene with a TestScene that has ground and a player:

```js
class TestScene extends Phaser.Scene {
    constructor() {
        super('Test');
    }

    create() {
        // Ground
        const ground = this.add.rectangle(400, 430, 800, 40, 0x8B4513);
        this.physics.add.existing(ground, true); // true = static

        // Player
        this.player = new Player(this, 100, 300);
        this.physics.add.collider(this.player, ground);
    }

    update() {
        this.player.update();
    }
}
```

Update the config scene array to: `scene: [TestScene]`

**Step 4: Test in browser**

Expected: Blue player rectangle on brown ground. Arrow keys / WASD to move and jump.

**Step 5: Commit**

```bash
git add js/Player.js js/main.js index.html
git commit -m "add player with movement and jumping"
```

---

### Task 3: Combat System — Combo Attacks & Dodge

**Files:**
- Modify: `js/Player.js` (add attack and dodge)

**Step 1: Add attack combo system to Player**

Add these properties in the constructor:
```js
// Combat
this.attackKey = scene.input.keyboard.addKey('SPACE');
this.dodgeKey = scene.input.keyboard.addKey('SHIFT');

this.isAttacking = false;
this.comboCount = 0; // 0, 1, 2 for 3-hit combo
this.comboTimer = 0;
this.comboWindow = 500; // ms to chain next hit
this.attackDuration = 300; // ms per attack
this.attackTimer = 0;

this.isDodging = false;
this.dodgeSpeed = 400;
this.dodgeDuration = 250; // ms
this.dodgeCooldown = 500; // ms
this.dodgeTimer = 0;
this.lastDodgeTime = 0;

// Attack hitbox (invisible, created during attacks)
this.attackBox = null;

// Damage based on weapon and combo
this.getDamage = function() {
    const base = GameState.weapon === 'slayer' ? 25 : 10;
    const multiplier = this.comboCount === 2 ? 2 : 1; // big swing on 3rd hit
    return base * multiplier;
};
```

**Step 2: Add attack logic to update()**

```js
// In update(), after movement code:
const time = this.scene.time.now;

// Dodge
if (Phaser.Input.Keyboard.JustDown(this.dodgeKey) && !this.isDodging &&
    time - this.lastDodgeTime > this.dodgeCooldown) {
    this.isDodging = true;
    this.dodgeTimer = time;
    this.lastDodgeTime = time;
    this.setAlpha(0.5); // visual feedback: semi-transparent
    const dir = this.facingRight ? 1 : -1;
    this.body.setVelocityX(dir * this.dodgeSpeed);
}

if (this.isDodging && time - this.dodgeTimer > this.dodgeDuration) {
    this.isDodging = false;
    this.setAlpha(1);
}

// Attack
if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && !this.isDodging) {
    // Check if within combo window
    if (time - this.comboTimer < this.comboWindow && this.comboCount < 2) {
        this.comboCount++;
    } else {
        this.comboCount = 0;
    }

    this.isAttacking = true;
    this.attackTimer = time;

    // Create attack hitbox in front of player
    const offsetX = this.facingRight ? 30 : -30;
    const width = this.comboCount === 2 ? 50 : 35; // big swing = wider
    this.attackBox = this.scene.add.rectangle(
        this.x + offsetX, this.y, width, 40, 0xffff00
    );
    this.attackBox.setAlpha(0.5);
    this.scene.physics.add.existing(this.attackBox);
    this.attackBox.body.setAllowGravity(false);
}

if (this.isAttacking && time - this.attackTimer > this.attackDuration) {
    this.isAttacking = false;
    this.comboTimer = time;
    if (this.attackBox) {
        this.attackBox.destroy();
        this.attackBox = null;
    }
}

// Keep attack box following player
if (this.attackBox) {
    const offsetX = this.facingRight ? 30 : -30;
    this.attackBox.x = this.x + offsetX;
    this.attackBox.y = this.y;
}
```

**Step 3: Test in browser**

Expected: Press SPACE to see yellow attack hitbox flash. Press multiple times quickly for combo. Press SHIFT to dodge (player goes semi-transparent and dashes).

**Step 4: Commit**

```bash
git add js/Player.js
git commit -m "add combo attack system and dodge roll"
```

---

### Task 4: HUD — Health Bar & Weapon Display

**Files:**
- Create: `js/HUD.js`
- Modify: `index.html` (add script tag)

**Step 1: Create js/HUD.js**

```js
class HUD {
    constructor(scene) {
        this.scene = scene;

        // Health bar background (gray)
        this.healthBg = scene.add.rectangle(120, 25, 204, 20, 0x333333);
        this.healthBg.setScrollFactor(0);
        this.healthBg.setDepth(100);

        // Health bar fill (red)
        this.healthBar = scene.add.rectangle(120, 25, 200, 16, 0xff0000);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(101);

        // Health label
        this.healthLabel = scene.add.text(20, 15, 'HP', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });
        this.healthLabel.setScrollFactor(0);
        this.healthLabel.setDepth(101);

        // Weapon display
        this.weaponText = scene.add.text(20, 42, '', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });
        this.weaponText.setScrollFactor(0);
        this.weaponText.setDepth(101);
    }

    update() {
        const ratio = GameState.health / GameState.maxHealth;
        this.healthBar.width = 200 * ratio;
        // Shift bar left as it shrinks so it drains from right
        this.healthBar.x = 120 - (200 - this.healthBar.width) / 2;

        const weaponName = GameState.weapon === 'slayer' ? 'Slayer of the Mobs' : 'Wood Sword';
        this.weaponText.setText('Weapon: ' + weaponName);
    }
}
```

**Step 2: Add HUD.js script to index.html**

```html
<script src="js/HUD.js"></script>
```

**Step 3: Test by adding HUD to TestScene, verify it renders**

**Step 4: Commit**

```bash
git add js/HUD.js index.html
git commit -m "add HUD with health bar and weapon display"
```

---

### Task 5: Dialogue System

**Files:**
- Create: `js/DialogueBox.js`
- Modify: `index.html` (add script tag)

**Step 1: Create js/DialogueBox.js**

```js
class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.lines = [];
        this.currentLine = 0;

        // Dark box at bottom of screen
        this.box = scene.add.rectangle(400, 390, 760, 100, 0x000000, 0.8);
        this.box.setScrollFactor(0);
        this.box.setDepth(200);
        this.box.setVisible(false);

        // Speaker name
        this.nameText = scene.add.text(40, 350, '', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffcc00',
            fontStyle: 'bold'
        });
        this.nameText.setScrollFactor(0);
        this.nameText.setDepth(201);
        this.nameText.setVisible(false);

        // Dialogue text
        this.text = scene.add.text(40, 375, '', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            wordWrap: { width: 720 }
        });
        this.text.setScrollFactor(0);
        this.text.setDepth(201);
        this.text.setVisible(false);

        // "Press E" prompt
        this.prompt = scene.add.text(680, 420, '[E] Next', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#aaaaaa'
        });
        this.prompt.setScrollFactor(0);
        this.prompt.setDepth(201);
        this.prompt.setVisible(false);

        // E key listener
        this.advanceKey = scene.input.keyboard.addKey('E');
    }

    show(speaker, lines) {
        this.lines = lines;
        this.currentLine = 0;
        this.isActive = true;
        this.speaker = speaker;

        this.box.setVisible(true);
        this.nameText.setVisible(true);
        this.nameText.setText(speaker);
        this.text.setVisible(true);
        this.text.setText(lines[0]);
        this.prompt.setVisible(true);
    }

    update() {
        if (!this.isActive) return;

        if (Phaser.Input.Keyboard.JustDown(this.advanceKey)) {
            this.currentLine++;
            if (this.currentLine >= this.lines.length) {
                this.hide();
            } else {
                this.text.setText(this.lines[this.currentLine]);
            }
        }
    }

    hide() {
        this.isActive = false;
        this.box.setVisible(false);
        this.nameText.setVisible(false);
        this.text.setVisible(false);
        this.prompt.setVisible(false);
    }
}
```

**Step 2: Add script tag to index.html**

```html
<script src="js/DialogueBox.js"></script>
```

**Step 3: Commit**

```bash
git add js/DialogueBox.js index.html
git commit -m "add dialogue box system for NPC conversations"
```

---

### Task 6: Village Scene

**Files:**
- Create: `js/scenes/VillageScene.js`
- Modify: `index.html` (add script tag)
- Modify: `js/main.js` (register scene)

**Step 1: Create js/scenes/VillageScene.js**

```js
class VillageScene extends Phaser.Scene {
    constructor() {
        super('Village');
    }

    create() {
        // Sky is already the background color

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x8B4513);
        this.physics.add.existing(this.ground, true);

        // Village buildings (simple rectangles as houses)
        this.add.rectangle(150, 360, 100, 100, 0x654321); // house 1
        this.add.rectangle(150, 300, 110, 20, 0x8B0000);  // roof 1
        this.add.rectangle(400, 370, 80, 80, 0x654321);   // house 2
        this.add.rectangle(400, 320, 90, 20, 0x8B0000);   // roof 2

        // Blacksmith (orange rectangle NPC)
        this.blacksmith = this.add.rectangle(400, 386, 28, 44, 0xFF8C00);
        this.physics.add.existing(this.blacksmith, true);

        // "Blacksmith" label
        this.add.text(370, 350, 'Blacksmith', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        // "Press E" indicator (shown when near blacksmith)
        this.talkPrompt = this.add.text(370, 340, '[E] Talk', {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#ffcc00'
        });
        this.talkPrompt.setVisible(false);

        // Exit sign on right
        this.add.text(740, 380, '→ Woods', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        // Player
        const startX = GameState.playerX || 100;
        this.player = new Player(this, startX, 300);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Dialogue
        this.dialogue = new DialogueBox(this);

        // E key for talking
        this.talkKey = this.input.keyboard.addKey('E');
        this.canTalk = false;
    }

    update() {
        if (this.dialogue.isActive) {
            this.dialogue.update();
            return; // freeze player during dialogue
        }

        this.player.update();
        this.hud.update();

        // Check if near blacksmith
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.blacksmith.x, this.blacksmith.y
        );
        this.canTalk = dist < 60;
        this.talkPrompt.setVisible(this.canTalk);

        // Talk to blacksmith
        if (this.canTalk && Phaser.Input.Keyboard.JustDown(this.talkKey)) {
            this.startBlacksmithDialogue();
        }

        // Scene transition: walk off right edge → Woods
        if (this.player.x > 780) {
            GameState.playerX = 30;
            this.scene.start('Woods');
        }
    }

    startBlacksmithDialogue() {
        if (GameState.storyPhase === 0) {
            this.dialogue.show('Blacksmith', [
                'Hey there! Be careful in the woods today.',
                'I heard strange noises coming from deep in the forest...'
            ]);
        } else if (GameState.storyPhase === 1) {
            // Player found the sword and came back
            this.dialogue.show('Blacksmith', [
                'What is THAT?! Let me see that sword...',
                'This is... the Slayer of the Mobs! An ancient weapon!',
                'I\'ll give you 1000 gold for it! What do you say?'
            ]);
            // After this dialogue ends, advance story
            this.time.delayedCall(100, () => {
                const check = this.time.addEvent({
                    delay: 100,
                    loop: true,
                    callback: () => {
                        if (!this.dialogue.isActive) {
                            check.remove();
                            this.dialogue.show('You', [
                                'Uhh... no. It must be very special.',
                                'I\'m going to keep it.'
                            ]);
                            // After player refuses, advance to phase 2
                            const check2 = this.time.addEvent({
                                delay: 100,
                                loop: true,
                                callback: () => {
                                    if (!this.dialogue.isActive) {
                                        check2.remove();
                                        GameState.storyPhase = 2;
                                    }
                                }
                            });
                        }
                    }
                });
            });
        } else if (GameState.storyPhase >= 2) {
            this.dialogue.show('Blacksmith', [
                'Be careful with that sword. It attracts... things.',
                'Go to the woods if you dare. But be ready to fight!'
            ]);
            if (GameState.storyPhase === 2) {
                GameState.storyPhase = 3; // mobs now appear in woods
            }
        }
    }
}
```

**Step 2: Add script tag and register scene in config**

Add to index.html:
```html
<script src="js/scenes/VillageScene.js"></script>
```

Update main.js config scene array:
```js
scene: [BootScene, VillageScene]
```

Remove TestScene from main.js (no longer needed).

**Step 3: Test in browser**

Expected: Village with houses, blacksmith NPC. Walk around, talk to blacksmith with E key. Walk off right edge to trigger scene change (will error since Woods doesn't exist yet — that's ok).

**Step 4: Commit**

```bash
git add js/scenes/VillageScene.js js/main.js index.html
git commit -m "add village scene with blacksmith NPC and dialogue"
```

---

### Task 7: Woods Scene with Sword Pickup & Enemies

**Files:**
- Create: `js/Enemy.js`
- Create: `js/scenes/WoodsScene.js`
- Modify: `index.html` (add script tags)
- Modify: `js/main.js` (register scene)

**Step 1: Create js/Enemy.js — small creature**

```js
class Enemy extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        // Green rectangle: 24 wide, 24 tall
        super(scene, x, y, 24, 24, 0x00cc00);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);

        this.health = 30;
        this.speed = 60;
        this.damage = 10;
        this.knockbackForce = 200;
        this.attackCooldown = 1000; // ms between attacks
        this.lastAttackTime = 0;
        this.isAlive = true;
    }

    update(playerX) {
        if (!this.isAlive) return;

        // Walk toward player
        if (playerX < this.x) {
            this.body.setVelocityX(-this.speed);
        } else {
            this.body.setVelocityX(this.speed);
        }
    }

    takeDamage(amount, fromRight) {
        this.health -= amount;
        // Flash white
        this.setFillStyle(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this.isAlive) this.setFillStyle(0x00cc00);
        });
        // Knockback
        const dir = fromRight ? 1 : -1;
        this.body.setVelocityX(dir * this.knockbackForce);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        this.setAlpha(0);
        this.body.setEnable(false);
        // Remove after a short delay
        this.scene.time.delayedCall(200, () => {
            this.destroy();
        });
    }
}
```

**Step 2: Create js/scenes/WoodsScene.js**

```js
class WoodsScene extends Phaser.Scene {
    constructor() {
        super('Woods');
    }

    create() {
        // Darker green background for woods
        this.cameras.main.setBackgroundColor('#2d5a1e');

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x3d2b1f);
        this.physics.add.existing(this.ground, true);

        // Trees (dark green rectangles with brown trunks)
        this.addTree(100, 340);
        this.addTree(300, 350);
        this.addTree(550, 330);
        this.addTree(700, 345);

        // Player
        const startX = GameState.playerX || 30;
        this.player = new Player(this, startX, 300);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Dialogue
        this.dialogue = new DialogueBox(this);

        // Mysterious sword pickup (only if not found yet)
        this.swordPickup = null;
        if (GameState.storyPhase === 0) {
            // Glowing yellow rectangle = the sword on the ground
            this.swordPickup = this.add.rectangle(600, 400, 8, 30, 0xFFD700);
            this.physics.add.existing(this.swordPickup, true);

            // Glow effect — pulsing
            this.tweens.add({
                targets: this.swordPickup,
                alpha: 0.4,
                duration: 500,
                yoyo: true,
                repeat: -1
            });

            this.add.text(575, 370, '???', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#FFD700'
            });
        }

        // Enemies (only if storyPhase >= 3)
        this.enemies = [];
        if (GameState.storyPhase >= 3) {
            this.spawnEnemies();
        }

        // Exit labels
        this.add.text(10, 380, '← Village', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });

        if (GameState.storyPhase >= 3) {
            this.add.text(720, 380, '→ Deep Woods', {
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ff4444'
            });
        }
    }

    addTree(x, y) {
        // Trunk
        this.add.rectangle(x, y + 30, 20, 60, 0x5c3a1e);
        // Leaves
        this.add.rectangle(x, y - 20, 60, 50, 0x0a4a0a);
    }

    spawnEnemies() {
        const positions = [200, 350, 500, 650];
        positions.forEach(x => {
            const enemy = new Enemy(this, x, 380);
            this.physics.add.collider(enemy, this.ground);
            this.enemies.push(enemy);
        });
    }

    update() {
        if (this.dialogue.isActive) {
            this.dialogue.update();
            return;
        }

        this.player.update();
        this.hud.update();

        // Sword pickup
        if (this.swordPickup && GameState.storyPhase === 0) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.swordPickup.x, this.swordPickup.y
            );
            if (dist < 40) {
                this.swordPickup.destroy();
                this.swordPickup = null;
                GameState.weapon = 'slayer';
                GameState.storyPhase = 1;
                this.dialogue.show('You', [
                    'What is this...?',
                    'There\'s writing on it: "Slayer of the Mobs"',
                    'I should show this to the Blacksmith!'
                ]);
            }
        }

        // Enemy AI and combat
        this.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;

            enemy.update(this.player.x);

            // Enemy damages player
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            const time = this.time.now;
            if (dist < 30 && !this.player.isDodging &&
                time - enemy.lastAttackTime > enemy.attackCooldown) {
                enemy.lastAttackTime = time;
                GameState.health -= enemy.damage;
                // Knockback player
                const dir = this.player.x < enemy.x ? -1 : 1;
                this.player.body.setVelocityX(dir * 200);
            }

            // Player attack hits enemy
            if (this.player.attackBox && this.player.isAttacking) {
                const atkDist = Phaser.Math.Distance.Between(
                    this.player.attackBox.x, this.player.attackBox.y,
                    enemy.x, enemy.y
                );
                if (atkDist < 40) {
                    const fromRight = this.player.x < enemy.x;
                    enemy.takeDamage(this.player.getDamage(), fromRight);
                }
            }
        });

        // Clean up dead enemies
        this.enemies = this.enemies.filter(e => e.isAlive);

        // Check player death
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            GameState.playerX = 100;
            this.scene.start('Village');
        }

        // Scene transitions
        if (this.player.x < 20) {
            GameState.playerX = 750;
            this.scene.start('Village');
        }

        if (this.player.x > 780 && GameState.storyPhase >= 3) {
            GameState.playerX = 30;
            this.scene.start('BossArena');
        }
    }
}
```

**Step 3: Add script tags and register scenes**

Add to index.html:
```html
<script src="js/Enemy.js"></script>
<script src="js/scenes/WoodsScene.js"></script>
```

Update main.js scene array:
```js
scene: [BootScene, VillageScene, WoodsScene]
```

**Step 4: Test the full flow**

1. Start in village, talk to blacksmith
2. Walk right to woods
3. Find the glowing sword
4. Walk left back to village, talk to blacksmith (sword dialogue plays)
5. Walk right to woods again — enemies should appear

**Step 5: Commit**

```bash
git add js/Enemy.js js/scenes/WoodsScene.js js/main.js index.html
git commit -m "add woods scene with sword pickup and enemy combat"
```

---

### Task 8: Boss Arena & Troll Boss Fight

**Files:**
- Create: `js/TrollBoss.js`
- Create: `js/scenes/BossArenaScene.js`
- Modify: `index.html` (add script tags)
- Modify: `js/main.js` (register scene)

**Step 1: Create js/TrollBoss.js**

```js
class TrollBoss extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        // Big red rectangle: 64 wide, 80 tall
        super(scene, x, y, 64, 80, 0xcc0000);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setCollideWorldBounds(true);

        this.health = 300;
        this.maxHealth = 300;
        this.speed = 80;
        this.isAlive = true;

        // Attack state
        this.currentAttack = null; // 'slam', 'swing', 'charge'
        this.attackTimer = 0;
        this.attackCooldown = 2000;
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.attackHitbox = null;

        // Health bar (above boss)
        this.healthBg = scene.add.rectangle(x, y - 55, 70, 8, 0x333333);
        this.healthBg.setDepth(50);
        this.healthFill = scene.add.rectangle(x, y - 55, 66, 6, 0xff0000);
        this.healthFill.setDepth(51);
        this.nameTag = scene.add.text(x - 30, y - 70, 'TROLL', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ff4444',
            fontStyle: 'bold'
        });
        this.nameTag.setDepth(51);
    }

    update(playerX, playerY, time) {
        if (!this.isAlive) return;

        // Update health bar position
        this.healthBg.x = this.x;
        this.healthBg.y = this.y - 55;
        this.healthFill.x = this.x;
        this.healthFill.y = this.y - 55;
        const ratio = this.health / this.maxHealth;
        this.healthFill.width = 66 * ratio;
        this.nameTag.x = this.x - 30;
        this.nameTag.y = this.y - 70;

        if (this.isAttacking) return;

        // Choose and execute attacks
        if (time - this.lastAttackTime > this.attackCooldown) {
            const dist = Math.abs(this.x - playerX);
            if (dist < 80) {
                // Close range: slam or swing
                this.currentAttack = Math.random() > 0.5 ? 'slam' : 'swing';
            } else {
                // Far range: charge
                this.currentAttack = 'charge';
            }
            this.startAttack(playerX, time);
        } else {
            // Walk toward player slowly
            if (playerX < this.x) {
                this.body.setVelocityX(-this.speed);
            } else {
                this.body.setVelocityX(this.speed);
            }
        }
    }

    startAttack(playerX, time) {
        this.isAttacking = true;
        this.lastAttackTime = time;
        this.body.setVelocityX(0);

        // Flash to warn player
        this.setFillStyle(0xff4444);

        const scene = this.scene;

        if (this.currentAttack === 'slam') {
            // Ground slam — delay then area damage
            scene.time.delayedCall(500, () => {
                if (!this.isAlive) return;
                this.setFillStyle(0xcc0000);
                // Area hitbox on ground
                this.attackHitbox = scene.add.rectangle(this.x, 410, 120, 30, 0xff6600, 0.5);
                scene.physics.add.existing(this.attackHitbox);
                this.attackHitbox.body.setAllowGravity(false);

                scene.time.delayedCall(300, () => {
                    if (this.attackHitbox) this.attackHitbox.destroy();
                    this.attackHitbox = null;
                    this.isAttacking = false;
                });
            });
        } else if (this.currentAttack === 'swing') {
            // Club swing — horizontal attack
            scene.time.delayedCall(400, () => {
                if (!this.isAlive) return;
                this.setFillStyle(0xcc0000);
                const dir = playerX < this.x ? -1 : 1;
                this.attackHitbox = scene.add.rectangle(
                    this.x + dir * 50, this.y, 60, 50, 0xff6600, 0.5
                );
                scene.physics.add.existing(this.attackHitbox);
                this.attackHitbox.body.setAllowGravity(false);

                scene.time.delayedCall(300, () => {
                    if (this.attackHitbox) this.attackHitbox.destroy();
                    this.attackHitbox = null;
                    this.isAttacking = false;
                });
            });
        } else if (this.currentAttack === 'charge') {
            // Charge at player
            scene.time.delayedCall(600, () => {
                if (!this.isAlive) return;
                this.setFillStyle(0xcc0000);
                const dir = playerX < this.x ? -1 : 1;
                this.body.setVelocityX(dir * 350);

                scene.time.delayedCall(800, () => {
                    this.body.setVelocityX(0);
                    this.isAttacking = false;
                });
            });
        }
    }

    takeDamage(amount, fromRight) {
        this.health -= amount;
        this.setFillStyle(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this.isAlive) this.setFillStyle(0xcc0000);
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;
        this.healthBg.setVisible(false);
        this.healthFill.setVisible(false);
        this.nameTag.setVisible(false);
        if (this.attackHitbox) {
            this.attackHitbox.destroy();
            this.attackHitbox = null;
        }

        // Death animation — flash and fade
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
```

**Step 2: Create js/scenes/BossArenaScene.js**

```js
class BossArenaScene extends Phaser.Scene {
    constructor() {
        super('BossArena');
    }

    create() {
        // Dark red-tinted background
        this.cameras.main.setBackgroundColor('#1a0a0a');

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x2a1a1a);
        this.physics.add.existing(this.ground, true);

        // Dead trees for atmosphere
        this.add.rectangle(100, 360, 15, 80, 0x3a2a1a);
        this.add.rectangle(700, 350, 15, 90, 0x3a2a1a);

        // Warning text
        this.warningText = this.add.text(300, 200, 'TROLL APPROACHES...', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: '#ff4444',
            fontStyle: 'bold'
        });
        this.warningText.setAlpha(0);

        // Player
        this.player = new Player(this, 50, 300);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Dialogue
        this.dialogue = new DialogueBox(this);

        // Spawn boss after dramatic pause
        this.troll = null;
        this.bossSpawned = false;

        this.tweens.add({
            targets: this.warningText,
            alpha: 1,
            duration: 1000,
            hold: 1500,
            yoyo: true,
            onComplete: () => {
                this.spawnBoss();
            }
        });
    }

    spawnBoss() {
        this.troll = new TrollBoss(this, 650, 350);
        this.physics.add.collider(this.troll, this.ground);
        this.bossSpawned = true;
    }

    update() {
        if (this.dialogue.isActive) {
            this.dialogue.update();
            return;
        }

        this.player.update();
        this.hud.update();

        if (!this.bossSpawned || !this.troll) return;

        const time = this.time.now;
        this.troll.update(this.player.x, this.player.y, time);

        // Boss hitbox damages player
        if (this.troll.attackHitbox && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.troll.attackHitbox.x, this.troll.attackHitbox.y
            );
            if (dist < 50) {
                GameState.health -= 20;
                // Knockback
                const dir = this.player.x < this.troll.x ? -1 : 1;
                this.player.body.setVelocityX(dir * 300);
                this.player.body.setVelocityY(-150);
            }
        }

        // Boss body damages player (charge attack)
        if (this.troll.currentAttack === 'charge' && !this.player.isDodging) {
            const bodyDist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.troll.x, this.troll.y
            );
            if (bodyDist < 45 && Math.abs(this.troll.body.velocity.x) > 100) {
                GameState.health -= 25;
                const dir = this.player.x < this.troll.x ? -1 : 1;
                this.player.body.setVelocityX(dir * 350);
                this.player.body.setVelocityY(-200);
            }
        }

        // Player attack hits boss
        if (this.player.attackBox && this.player.isAttacking && this.troll.isAlive) {
            const atkDist = Phaser.Math.Distance.Between(
                this.player.attackBox.x, this.player.attackBox.y,
                this.troll.x, this.troll.y
            );
            if (atkDist < 50) {
                const fromRight = this.player.x < this.troll.x;
                this.troll.takeDamage(this.player.getDamage(), fromRight);
            }
        }

        // Boss defeated!
        if (!this.troll.isAlive && !this.victoryShown) {
            this.victoryShown = true;
            this.time.delayedCall(1500, () => {
                this.dialogue.show('', [
                    'The troll has been defeated!',
                    'The Slayer of the Mobs glows with power...',
                    'You are the true Mob Slayer!',
                    'CONGRATULATIONS! You beat the game!'
                ]);
            });
        }

        // Player death
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            GameState.playerX = 100;
            this.scene.start('Village');
        }

        // Prevent walking off left edge back to woods during boss fight
        if (this.player.x < 20) {
            this.player.x = 20;
        }
    }
}
```

**Step 3: Add script tags and register scenes**

Add to index.html:
```html
<script src="js/TrollBoss.js"></script>
<script src="js/scenes/BossArenaScene.js"></script>
```

Update main.js scene array:
```js
scene: [BootScene, VillageScene, WoodsScene, BossArenaScene]
```

**Step 4: Test the complete game flow**

1. Village → talk to blacksmith → go to woods
2. Find sword → go back to village → talk to blacksmith (refuses gold)
3. Go to woods → fight creatures → go right to boss arena
4. Fight troll boss → win!
5. Test dying and respawning in village

**Step 5: Commit**

```bash
git add js/TrollBoss.js js/scenes/BossArenaScene.js js/main.js index.html
git commit -m "add boss arena with troll boss fight and victory screen"
```

---

### Task 9: Final Polish & README

**Files:**
- Create: `README.md`
- Possible tweaks to any file for bugs found during final testing

**Step 1: Full playtest**

Play through the entire game start to finish. Check for:
- Movement feels good
- Combo attacks work
- Dodge works against all enemy attacks
- Story dialogue plays in correct order
- Scene transitions work both ways
- Boss fight is beatable but challenging
- Health bar updates correctly

**Step 2: Create README.md**

```markdown
# Mob Slayer

A 2D side-scrolling adventure game built with Phaser 3.

## How to Play

Open `index.html` in a web browser.

### Controls
- **Arrow Keys / WASD** — Move and jump
- **SPACE** — Attack (press multiple times for combos!)
- **SHIFT** — Dodge roll
- **E** — Talk to NPCs

### Story
You live in a small village. One day you discover a mysterious sword in the woods called "Slayer of the Mobs". When creatures begin to attack, you must fight your way through and defeat the giant troll boss!

## Tech
- Phaser 3
- Vanilla JavaScript
- No build tools required
```

**Step 3: Commit**

```bash
git add README.md
git commit -m "add README with game instructions"
```

---

## Summary

| Task | What it builds |
|------|---------------|
| 1 | Project setup, Phaser boilerplate |
| 2 | Player movement & jumping |
| 3 | Combo attacks & dodge roll |
| 4 | HUD (health bar, weapon display) |
| 5 | Dialogue system |
| 6 | Village scene with blacksmith |
| 7 | Woods scene with sword & enemies |
| 8 | Boss arena with troll fight |
| 9 | Polish & README |
