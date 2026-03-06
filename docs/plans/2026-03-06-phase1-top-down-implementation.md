# Phase 1: Top-Down Conversion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the core game (Village, WoodsDay, WoodsNight, BossArena, Victory) from side-scrolling to top-down Zelda-style movement with a new top-down player sprite.

**Architecture:** Remove gravity, add 4-direction movement to Player.js, update Enemy.js for 2D chase, update TrollBoss.js for 2D attacks, create a new top-down pixel art sprite sheet, and convert 5 scenes to remove ground platforms and use edge-based transitions.

**Tech Stack:** Phaser 3.80.1 (Arcade Physics), vanilla JavaScript, base64-encoded sprites

---

### Task 1: Create new top-down player sprite

**Files:**
- Modify: `js/main.js:22` (SPRITE_DATA.player)
- Modify: `js/main.js:68-77` (BootScene frame slicing + animations)

**What this does:** Replace the side-view 32x48 player sprite with a 3/4 top-down 32x32 sprite sheet. The sheet has 4 directions (down, left, right, up) with 2 frames each = 8 frames total, arranged as a 256x32 strip (8 frames x 32px).

**Step 1: Create the top-down player sprite**

Use the pixel-art-gamedev skill to create a 3/4 top-down pixel art character:
- 32x32 pixels per frame
- 8 frames in a horizontal strip (256x32 total)
- Frame layout: down1, down2, left1, left2, right1, right2, up1, up2
- Style: simple RPG hero with a sword, similar to early Zelda/Pokemon

Generate the sprite as a base64 PNG and replace `SPRITE_DATA.player` in `js/main.js:22`.

**Step 2: Update BootScene frame slicing and animations**

In `js/main.js`, replace lines 68-77 (the player frame setup) with:

```javascript
// Player: 8 frames of 32x32 (down x2, left x2, right x2, up x2)
for (let i = 0; i < 8; i++) {
    this.textures.get('player').add(i, 0, i * 32, 0, 32, 32);
}

this.anims.create({
    key: 'player_idle_down',
    frames: [{ key: 'player', frame: 0 }],
    frameRate: 1, repeat: -1
});
this.anims.create({
    key: 'player_walk_down',
    frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }],
    frameRate: 6, repeat: -1
});
this.anims.create({
    key: 'player_idle_left',
    frames: [{ key: 'player', frame: 2 }],
    frameRate: 1, repeat: -1
});
this.anims.create({
    key: 'player_walk_left',
    frames: [{ key: 'player', frame: 2 }, { key: 'player', frame: 3 }],
    frameRate: 6, repeat: -1
});
this.anims.create({
    key: 'player_idle_right',
    frames: [{ key: 'player', frame: 4 }],
    frameRate: 1, repeat: -1
});
this.anims.create({
    key: 'player_walk_right',
    frames: [{ key: 'player', frame: 4 }, { key: 'player', frame: 5 }],
    frameRate: 6, repeat: -1
});
this.anims.create({
    key: 'player_idle_up',
    frames: [{ key: 'player', frame: 6 }],
    frameRate: 1, repeat: -1
});
this.anims.create({
    key: 'player_walk_up',
    frames: [{ key: 'player', frame: 6 }, { key: 'player', frame: 7 }],
    frameRate: 6, repeat: -1
});
```

Also remove the old `player_idle` animation that was defined before.

**Step 3: Test in browser**

Open `index.html` — the game should load without errors. The player sprite will look different but movement isn't updated yet, so just confirm no crashes.

**Step 4: Commit**

```bash
git add js/main.js
git commit -m "add top-down player sprite with 4-direction animations"
```

---

### Task 2: Convert Player.js to 4-direction movement

**Files:**
- Modify: `js/Player.js` (full rewrite of movement + attack + dodge)

**What this does:** Remove gravity-based platformer movement. Add WASD/arrow movement in all 4 directions. Track facing as up/down/left/right. Attack hitbox spawns in facing direction. Dodge dashes in movement direction.

**Step 1: Update the constructor**

In `js/Player.js`, update the constructor:

```javascript
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('player_idle_down');
        this.setCollideWorldBounds(true);
        this.body.setSize(20, 20);
        this.setScale(2);

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.moveSpeed = 200;
        this.facing = 'down';

        // Attack
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.isAttacking = false;
        this.attackHitbox = null;
        this.attackDamage = 10;
        this.currentHitDamage = this.attackDamage;

        // Combo
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboWindow = 400;

        // Dodge
        this.dodgeKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.isDodging = false;
        this.dodgeCooldown = false;
    }
```

**Step 2: Update the attack method for 4 directions**

```javascript
    attack() {
        if (this.isAttacking) return;

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

        this.isAttacking = true;

        let hitDamage = this.attackDamage;
        let hitboxSize = 24;
        let hitColor = 0xffffff;

        if (this.comboCount === 2) {
            hitDamage = this.attackDamage * 1.2;
            hitboxSize = 28;
            hitColor = 0xffff88;
        } else if (this.comboCount === 3) {
            hitDamage = this.attackDamage * 2;
            hitboxSize = 36;
            hitColor = 0xff4400;
        }

        this.setTint(hitColor);
        this.currentHitDamage = hitDamage;

        // Spawn hitbox in facing direction
        let offsetX = 0, offsetY = 0;
        let hbW = hitboxSize, hbH = hitboxSize;
        if (this.facing === 'right') { offsetX = 50; hbH = 40; }
        else if (this.facing === 'left') { offsetX = -50; hbH = 40; }
        else if (this.facing === 'down') { offsetY = 50; hbW = 40; }
        else if (this.facing === 'up') { offsetY = -50; hbW = 40; }

        this.attackHitbox = this.scene.add.rectangle(
            this.x + offsetX, this.y + offsetY, hbW, hbH, hitColor, 0.3
        );
        this.scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);

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

**Step 3: Update the dodge method for 4 directions**

```javascript
    dodge() {
        if (this.isDodging || this.dodgeCooldown) return;
        this.isDodging = true;
        this.dodgeCooldown = true;

        // Dash in the direction currently moving (or facing if standing still)
        const dashSpeed = 400;
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        let dx = 0, dy = 0;
        if (left) dx = -1;
        else if (right) dx = 1;
        if (up) dy = -1;
        else if (down) dy = 1;

        // If not moving, dash in facing direction
        if (dx === 0 && dy === 0) {
            if (this.facing === 'left') dx = -1;
            else if (this.facing === 'right') dx = 1;
            else if (this.facing === 'up') dy = -1;
            else if (this.facing === 'down') dy = 1;
        }

        this.setVelocityX(dx * dashSpeed);
        this.setVelocityY(dy * dashSpeed);
        this.setAlpha(0.4);

        this.scene.time.delayedCall(200, () => {
            this.isDodging = false;
            this.setAlpha(1);
        });

        this.scene.time.delayedCall(500, () => {
            this.dodgeCooldown = false;
        });
    }
```

**Step 4: Update the update method for 4-direction movement + animations**

```javascript
    update() {
        if (!this.isDodging) {
            const left = this.cursors.left.isDown || this.wasd.left.isDown;
            const right = this.cursors.right.isDown || this.wasd.right.isDown;
            const up = this.cursors.up.isDown || this.wasd.up.isDown;
            const down = this.cursors.down.isDown || this.wasd.down.isDown;

            let vx = 0, vy = 0;

            if (left) { vx = -this.moveSpeed; this.facing = 'left'; }
            else if (right) { vx = this.moveSpeed; this.facing = 'right'; }
            if (up) { vy = -this.moveSpeed; this.facing = 'up'; }
            else if (down) { vy = this.moveSpeed; this.facing = 'down'; }

            this.setVelocityX(vx);
            this.setVelocityY(vy);

            // Play walk or idle animation based on movement
            const moving = vx !== 0 || vy !== 0;
            const animKey = (moving ? 'player_walk_' : 'player_idle_') + this.facing;
            if (this.anims.currentAnim?.key !== animKey) {
                this.play(animKey);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.attack();
        }

        if (Phaser.Input.Keyboard.JustDown(this.dodgeKey)) {
            this.dodge();
        }
    }
}
```

**Step 5: Test in browser**

Open `index.html` — player should walk in all 4 directions with WASD/arrows. Attack should spawn hitbox in facing direction. Dodge should dash in movement direction.

**Step 6: Commit**

```bash
git add js/Player.js
git commit -m "convert Player.js to 4-direction top-down movement"
```

---

### Task 3: Convert Enemy.js to 2D chase + knockback

**Files:**
- Modify: `js/Enemy.js`

**What this does:** Enemies chase the player on both X and Y axes. Knockback pushes in the direction away from the enemy (not just left/right). Remove Y velocity knockback that assumed gravity.

**Step 1: Update Enemy.update() for 2D chase**

Replace the `update` method in `js/Enemy.js`:

```javascript
    update(player) {
        if (this.isDead || !player) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (dist < this.aggroRange) {
            // Chase on both axes
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocityX(Math.cos(angle) * this.speed);
            this.setVelocityY(Math.sin(angle) * this.speed);

            // Flip sprite based on horizontal direction
            this.setFlipX(player.x < this.x);

            if (dist < this.attackRange && !this.attackCooldown) {
                this.attackPlayer(player);
            }
        } else {
            this.setVelocityX(0);
            this.setVelocityY(0);
        }
    }
```

**Step 2: Update Enemy.attackPlayer() for 2D knockback**

Replace the `attackPlayer` method:

```javascript
    attackPlayer(player) {
        if (player.isDodging) return;
        this.attackCooldown = true;

        GameState.health -= this.damage;
        if (GameState.health < 0) GameState.health = 0;

        // Knockback away from enemy in any direction
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        player.setVelocityX(Math.cos(angle) * 250);
        player.setVelocityY(Math.sin(angle) * 250);
        player.setTint(0xff0000);
        player.scene.time.delayedCall(200, () => player.clearTint());

        this.scene.time.delayedCall(1000, () => {
            this.attackCooldown = false;
        });
    }
```

**Step 3: Test in browser**

Go to WoodsNight scene — enemies should chase you from any direction and knockback should push you away from the enemy.

**Step 4: Commit**

```bash
git add js/Enemy.js
git commit -m "convert Enemy.js to 2D chase and directional knockback"
```

---

### Task 4: Convert TrollBoss.js to 2D attacks

**Files:**
- Modify: `js/TrollBoss.js`

**What this does:** Update the Troll boss so its charge attack works in 2D (charges toward player position on both axes). Slam and swing attacks also work in the 2D space.

**Step 1: Update TrollBoss.doAttack()**

Replace the `doAttack` method in `js/TrollBoss.js`:

```javascript
    doAttack() {
        const attacks = ['slam', 'swing', 'charge'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.playerHitThisAttack = false;

        if (this.currentAttack === 'slam') {
            this.setTint(0xff8800);
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                // Circular slam around the boss
                const wave = this.scene.add.circle(this.x, this.y, 100, 0xff4400, 0.3);
                this.scene.time.delayedCall(300, () => wave.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'swing') {
            this.setTint(0xffff00);
            this.scene.time.delayedCall(400, () => {
                if (this.isDead) return;
                // Swing toward the player's direction
                const player = this.scene.player;
                const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                const swingX = this.x + Math.cos(angle) * 80;
                const swingY = this.y + Math.sin(angle) * 80;
                const swing = this.scene.add.circle(swingX, swingY, 30, 0xffff00, 0.4);
                this.scene.time.delayedCall(200, () => swing.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'charge') {
            this.setTint(0xff0000);
            const player = this.scene.player;
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocityX(Math.cos(angle) * 350);
            this.setVelocityY(Math.sin(angle) * 350);
            this.scene.time.delayedCall(800, () => {
                if (this.isDead) return;
                this.setVelocityX(0);
                this.setVelocityY(0);
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        }
    }
```

**Step 2: Test in browser**

Play through to the BossArena — boss should charge toward you in any direction, slam should be circular, swing should aim at your position.

**Step 3: Commit**

```bash
git add js/TrollBoss.js
git commit -m "convert TrollBoss to 2D attack patterns"
```

---

### Task 5: Remove gravity from game config

**Files:**
- Modify: `js/main.js:259` (physics config)

**What this does:** Set gravity to 0 so nothing falls. This is the key physics change for top-down.

**Step 1: Update the physics config**

In `js/main.js`, change the arcade gravity line:

```javascript
arcade: { gravity: { y: 0 }, debug: false }
```

**Step 2: Commit**

```bash
git add js/main.js
git commit -m "remove gravity for top-down physics"
```

---

### Task 6: Convert VillageScene to top-down

**Files:**
- Modify: `js/scenes/VillageScene.js`

**What this does:** Remove ground platform and ground colliders. Move player and NPC spawn positions to center area. Change exit transition from "walk right" to edge-based exits.

**Step 1: Update VillageScene.create()**

```javascript
    create() {
        this.add.image(400, 225, 'village-bg');

        // No ground needed — top-down movement

        // Blacksmith NPC in center area
        this.blacksmith = this.physics.add.sprite(400, 200, 'blacksmith');
        this.blacksmith.play('blacksmith_idle');
        this.blacksmith.setScale(2);
        this.blacksmith.body.setImmovable(true);

        this.talkPrompt = this.add.text(400, 170, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Player spawns center-left
        this.player = new Player(this, 200, 225);

        this.hud = new HUD(this);
        this.dialogue = new DialogueBox(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.transitioning = false;
    }
```

**Step 2: Update VillageScene.update() exit logic**

Change the exit check from `this.player.x > 750` to:

```javascript
        // Exit right edge
        if (!this.transitioning && this.player.x > 770) {
            this.transitioning = true;
            if (GameState.storyPhase >= 2) {
                this.scene.start('WoodsNight');
            } else {
                this.scene.start('WoodsDay');
            }
        }
```

Also update the distance check to use full 2D distance:

```javascript
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.blacksmith.x, this.blacksmith.y);
        this.talkPrompt.setPosition(this.blacksmith.x, this.blacksmith.y - 50);
        this.talkPrompt.setVisible(dist < 80 && !this.dialogue.isOpen);
```

And update the dialogue trigger similarly:

```javascript
        if (!this.dialogue.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey) && dist < 80) {
```

**Step 3: Test in browser**

Play Village — player should walk freely in all directions. Blacksmith should be in center. Walk to right edge to exit.

**Step 4: Commit**

```bash
git add js/scenes/VillageScene.js
git commit -m "convert VillageScene to top-down layout"
```

---

### Task 7: Convert WoodsDayScene to top-down

**Files:**
- Modify: `js/scenes/WoodsDayScene.js`

**What this does:** Remove ground. Move player and sword pickup to center area. Exit left to go back to village.

**Step 1: Update WoodsDayScene.create()**

```javascript
    create() {
        this.add.image(400, 225, 'woods-day-bg');

        // No ground needed

        this.player = new Player(this, 50, 225);
        this.hud = new HUD(this);

        // Glowing sword pickup — in center-right area
        if (GameState.storyPhase === 0) {
            this.sword = this.add.rectangle(600, 225, 8, 30, 0xff44ff);
            this.physics.add.existing(this.sword, true);
            this.tweens.add({
                targets: this.sword,
                alpha: 0.4, yoyo: true, repeat: -1, duration: 500
            });
            this.physics.add.overlap(this.player, this.sword, () => {
                this.pickUpSword();
            });
        }

        this.swordPickedUp = false;
        this.transitioning = false;
    }
```

**Step 2: Update exit logic in update()**

Keep the same left-edge exit but player spawns at left:

```javascript
        if (!this.transitioning && this.player.x < 30) {
            this.transitioning = true;
            this.scene.start('Village');
        }
```

**Step 3: Commit**

```bash
git add js/scenes/WoodsDayScene.js
git commit -m "convert WoodsDayScene to top-down layout"
```

---

### Task 8: Convert WoodsNightScene to top-down

**Files:**
- Modify: `js/scenes/WoodsNightScene.js`

**What this does:** Remove ground. Spawn enemies across the 2D space. Player enters from left, exits right after clearing enemies.

**Step 1: Update WoodsNightScene.create()**

```javascript
    create() {
        this.add.image(400, 225, 'woods-night-bg');

        // No ground needed

        this.player = new Player(this, 50, 225);
        this.player.attackDamage = 25;

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();

        // Spawn 4 night goblins spread across the area
        const positions = [
            { x: 300, y: 150 }, { x: 500, y: 300 },
            { x: 400, y: 200 }, { x: 600, y: 250 }
        ];
        positions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'night_goblin', 20);
            this.enemies.add(enemy);
        });

        this.transitioning = false;

        this.add.text(400, 30, 'The woods are cursed...', {
            fontSize: '20px', fill: '#ff4444'
        }).setOrigin(0.5);
    }
```

**Step 2: Keep update() mostly the same**

Just change the exit check:

```javascript
        if (!this.transitioning && this.player.x > 770 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('BossArena');
        }
```

**Step 3: Commit**

```bash
git add js/scenes/WoodsNightScene.js
git commit -m "convert WoodsNightScene to top-down layout"
```

---

### Task 9: Convert BossArenaScene to top-down

**Files:**
- Modify: `js/scenes/BossArenaScene.js`

**What this does:** Remove ground. Player and boss spawn in open 2D arena. Boss combat uses the 2D attacks from Task 4.

**Step 1: Update BossArenaScene.create()**

```javascript
    create() {
        this.add.image(400, 225, 'boss-arena-bg');

        // No ground needed

        this.player = new Player(this, 150, 225);
        this.player.attackDamage = 25;

        this.hud = new HUD(this);

        this.boss = new TrollBoss(this, 600, 225);

        this.bossDefeated = false;
    }
```

**Step 2: Update() stays the same**

The boss combat logic (hitbox checks, health, death transitions) doesn't need changes since it already uses distance-based detection.

**Step 3: Commit**

```bash
git add js/scenes/BossArenaScene.js
git commit -m "convert BossArenaScene to top-down layout"
```

---

### Task 10: VictoryScene — no changes needed

The VictoryScene is a cutscene with no gameplay movement. It uses text, rectangles, and camera effects — none of which depend on gravity or ground platforms. **Skip this task.**

---

### Task 11: Full playthrough test

**What this does:** Play through the entire Phase 1 flow to make sure everything works together.

**Test checklist:**
1. Game loads without errors
2. Village: walk in all 4 directions, talk to blacksmith with E
3. Village: walk right to exit to WoodsDay
4. WoodsDay: pick up glowing sword, walk left to return to Village
5. Village: talk to blacksmith again (story advances), walk right to WoodsNight
6. WoodsNight: fight 4 night goblins in 2D, attacks work in all 4 directions
7. WoodsNight: after killing all enemies, walk right to BossArena
8. BossArena: fight Troll boss, boss charges in 2D, slam is circular
9. BossArena: defeat boss -> Victory cutscene plays
10. Victory: wall crack animation -> transitions to TundraVillage
11. Dodge/dash works in all directions
12. Combo attacks work (after unlocking)

**Step 1: Fix any bugs found during testing**

**Step 2: Final commit**

```bash
git add -A
git commit -m "phase 1 top-down conversion complete: core game converted"
```
