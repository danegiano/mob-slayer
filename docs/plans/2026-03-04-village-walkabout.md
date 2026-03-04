# Village Walkabout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a top-down village scene where the player walks around Kenney's Tiny Town map with arrow keys, camera follows, and collisions prevent walking through buildings/trees.

**Architecture:** Single Phaser scene using the Kenney sample image (918x515) as the world background. Player is a sprite extracted from tilemap tile 128 (16x16 knight). Arcade physics with static collision rectangles placed over buildings, trees, castle, and fences. Camera follows player, bounded to world size.

**Tech Stack:** Phaser 3 (CDN), Arcade physics, vanilla JavaScript, no build tools.

**Testing approach:** No automated tests — browser game. Each step has a "Verify" section describing what to check in browser + dev console (F12).

---

### Task 1: Game Boilerplate + Background

**Files:**
- Modify: `index.html` (already exists, keep as-is)
- Modify: `js/main.js` (rewrite)

**Step 1: Rewrite js/main.js with BootScene that loads the village background**

```js
// js/main.js

class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    preload() {
        this.load.image('village', 'assets/village_bg.png');
        this.load.spritesheet('tiles', 'assets/tilemap.png', {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        this.scene.start('Village');
    }
}

class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    create() {
        // Village background — this IS the world
        const bg = this.add.image(0, 0, 'village').setOrigin(0, 0);

        // Set world bounds to match the image
        this.physics.world.setBounds(0, 0, bg.width, bg.height);

        // Camera setup — bounded to the world
        this.cameras.main.setBounds(0, 0, bg.width, bg.height);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,
    backgroundColor: '#5a8f3c',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: true }
    },
    scene: [BootScene, VillageScene]
};

const game = new Phaser.Game(config);
```

**Step 2: Verify**

Open http://localhost:8000 — you should see the Kenney village. No player yet, but the background should display. Debug mode is ON (green lines visible) so we can see collision boxes later. No errors in console (F12).

**Step 3: Commit**

```bash
git add js/main.js
git commit -m "add boot and village scenes with background image"
```

---

### Task 2: Player Sprite + Movement

**Files:**
- Modify: `js/main.js` (add player to VillageScene)

**Step 1: Add player sprite and arrow key movement to VillageScene.create()**

Add after the camera setup in VillageScene:

```js
    // Player — tile 128 from the Kenney tilemap (the knight!)
    // Spawn in the middle-ish of the village
    this.player = this.physics.add.sprite(460, 300, 'tiles', 128);
    this.player.setCollideWorldBounds(true);

    // Scale player up 2x so they're visible (16px is tiny)
    this.player.setScale(2);
    // Adjust the physics body to match the scaled size
    this.player.body.setSize(12, 12);
    this.player.body.setOffset(2, 4);

    // Camera follows the player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Arrow keys + WASD input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
```

**Step 2: Add VillageScene.update() for movement**

```js
    update() {
        const speed = 120;
        this.player.setVelocity(0);

        // Horizontal
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
        }

        // Vertical
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Normalize diagonal movement so you don't go faster diagonally
        if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            this.player.setVelocityX(this.player.body.velocity.x * 0.707);
            this.player.setVelocityY(this.player.body.velocity.y * 0.707);
        }
    }
```

**Step 3: Verify**

Refresh browser. You should see the knight on the village. Arrow keys or WASD move the knight in 4 directions. Camera follows smoothly. Knight stops at world edges. No errors in console.

**Step 4: Commit**

```bash
git add js/main.js
git commit -m "add player sprite with 4-direction movement and camera follow"
```

---

### Task 3: Collision Boxes on Buildings and Trees

**Files:**
- Modify: `js/main.js` (add collision group to VillageScene)

The village image (918x515) has these solid objects. Approximate pixel positions from examining the sample:

**Step 1: Add collision rectangles in VillageScene.create() after the player**

```js
    // Invisible collision walls over buildings, trees, castle, fences
    this.walls = this.physics.add.staticGroup();

    // Helper: add an invisible collision box at (x, y) with width x height
    const addWall = (x, y, w, h) => {
        const wall = this.add.rectangle(x, y, w, h, 0xff0000, 0);
        this.physics.add.existing(wall, true); // true = static
        this.walls.add(wall);
    };

    // --- TOP-LEFT HOUSE (brown, big) ---
    addWall(200, 105, 160, 110);

    // --- TOP-MIDDLE HOUSE (blue/gray roof) ---
    addWall(410, 90, 130, 100);

    // --- BOTTOM-LEFT HOUSE (brown) ---
    addWall(145, 310, 150, 100);

    // --- CASTLE (right side) ---
    addWall(760, 260, 200, 250);

    // --- Trees (top-left cluster) ---
    addWall(30, 80, 50, 60);
    addWall(30, 190, 50, 50);
    addWall(30, 310, 40, 50);

    // --- Trees (top row, scattered) ---
    addWall(300, 20, 40, 50);
    addWall(360, 30, 30, 40);
    addWall(470, 190, 30, 40);
    addWall(530, 50, 30, 40);

    // --- Trees (right side) ---
    addWall(830, 80, 40, 50);
    addWall(880, 140, 40, 50);
    addWall(870, 360, 40, 50);

    // --- Trees (bottom) ---
    addWall(60, 430, 50, 50);
    addWall(100, 450, 50, 40);
    addWall(830, 450, 60, 50);

    // --- Fence (top-left, horizontal) ---
    addWall(80, 230, 70, 10);

    // --- Fence (bottom, horizontal) ---
    addWall(410, 410, 250, 10);

    // --- Stone path border walls (the rocks/stones on ground) ---
    // These are decorative but walkable — skip them

    // Collide player with walls
    this.physics.add.collider(this.player, this.walls);
```

**Step 2: Verify**

Refresh browser. With debug mode ON (green boxes visible), you should see green rectangles over buildings, trees, castle. Walk into a building — the knight should stop and not walk through it. Walk around buildings — should be smooth.

**Step 3: Fine-tune collision boxes**

Look at the game in the browser. If any green box is too big, too small, or in the wrong spot, adjust the x/y/w/h values. The goal is that you can walk along paths but not through solid objects. This is a manual process — tweak, refresh, repeat.

**Step 4: Turn off debug mode once collisions feel right**

In the config, change `debug: true` to `debug: false`.

**Step 5: Commit**

```bash
git add js/main.js
git commit -m "add collision boxes on buildings, trees, castle, and fences"
```

---

### Task 4: Polish + Camera Zoom

**Files:**
- Modify: `js/main.js`

**Step 1: Add camera zoom so the pixel art is bigger and clearer**

In VillageScene.create(), after the camera bounds:

```js
    // Zoom in a bit so the pixel art is bigger and clearer
    this.cameras.main.setZoom(2);
```

Note: When zoomed, the camera bounds need to account for the viewport being smaller. Phaser handles this automatically.

**Step 2: Verify**

Refresh. The village should be zoomed in 2x. The knight should still move and camera should follow. You'll see less of the map at once but it'll look much crispier.

**Step 3: Commit**

```bash
git add js/main.js
git commit -m "add camera zoom for crisper pixel art"
```

---

### Task 5: Push to GitHub

**Step 1: Push**

```bash
git push
```

**Verify:** Check https://github.com/danegiano/mob-slayer — all commits should be there.
