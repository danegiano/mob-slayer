// ============================================
// Mob Slayer — Village Walkabout
// Kenney Tiny Town — walk around the village!
// ============================================

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
        // Village background
        const bg = this.add.image(0, 0, 'village').setOrigin(0, 0);

        // World bounds match the image
        this.physics.world.setBounds(0, 0, bg.width, bg.height);

        // Camera — zoomed in 2x, follows player
        this.cameras.main.setBounds(0, 0, bg.width, bg.height);
        this.cameras.main.setZoom(2);

        // Player — tile 128 (knight), scaled up 1.5x so you can see them!
        this.player = this.physics.add.sprite(460, 300, 'tiles', 128);
        this.player.setScale(1.5);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(10, 10);
        this.player.body.setOffset(3, 6);
        this.player.setDepth(10); // player draws on top of NPCs

        // Camera follows the player smoothly
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // === COLLISION WALLS ===
        this.walls = this.physics.add.staticGroup();

        const addWall = (x, y, w, h) => {
            const wall = this.add.rectangle(x, y, w, h, 0xff0000, 0);
            this.physics.add.existing(wall, true);
            this.walls.add(wall);
        };

        // Houses
        addWall(201, 96, 176, 128);    // top-left big house
        addWall(409, 88, 144, 112);    // top-middle house
        addWall(601, 56, 80, 80);      // small house top-right
        addWall(153, 312, 176, 112);   // bottom-left house

        // Castle — split into pieces with gate opening!
        // The gate/entrance is at roughly x=704 to x=752, y=360 to y=410
        // Left castle wall (everything left of gate)
        addWall(672, 240, 64, 200);
        // Right castle wall (everything right of gate)
        addWall(856, 240, 96, 200);
        // Castle top section
        addWall(764, 155, 280, 50);
        // Castle back wall (above the gate, between left and right)
        addWall(764, 290, 120, 60);
        // Leave the gate open at the bottom! (around x=720-750, y=360-410)

        // Trees
        addWall(32, 72, 65, 80);       // top-left cluster
        addWall(32, 192, 65, 64);      // mid-left
        addWall(24, 304, 48, 64);      // bottom-left
        addWall(281, 24, 48, 48);      // scattered top
        addWall(329, 32, 48, 64);
        addWall(449, 184, 32, 48);
        addWall(521, 40, 48, 48);
        addWall(884, 80, 68, 64);      // right side
        addWall(884, 384, 68, 68);
        addWall(65, 418, 96, 64);      // bottom
        addWall(876, 434, 84, 56);

        // Fences
        addWall(81, 216, 64, 16);
        addWall(401, 392, 288, 16);

        // Collide player with walls
        this.physics.add.collider(this.player, this.walls);

        // === NPCS — they walk around! ===
        this.npcs = [];

        // Helper: create an NPC that wanders around a home point
        const addNPC = (x, y, tile, wanderRange) => {
            const npc = this.physics.add.sprite(x, y, 'tiles', tile);
            npc.setScale(1.5);
            npc.setCollideWorldBounds(true);
            npc.body.setSize(10, 10);
            npc.body.setOffset(3, 6);

            // Remember where this NPC "lives" so they wander nearby
            npc.homeX = x;
            npc.homeY = y;
            npc.wanderRange = wanderRange;
            npc.wanderTimer = 0;
            npc.wanderDir = { x: 0, y: 0 };

            // NPCs collide with walls and the player
            this.physics.add.collider(npc, this.walls);
            this.physics.add.collider(npc, this.player);

            this.npcs.push(npc);
            return npc;
        };

        // Place NPCs around the village
        addNPC(370, 200, 127, 40);   // villager wandering in the middle
        addNPC(530, 230, 129, 30);   // villager near the castle
        addNPC(200, 220, 127, 35);   // villager near top-left house
        addNPC(460, 360, 129, 25);   // villager at bottom

        // === INPUT ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    update(time, delta) {
        // === PLAYER MOVEMENT ===
        const speed = 120;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Normalize diagonal
        if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            this.player.setVelocityX(this.player.body.velocity.x * 0.707);
            this.player.setVelocityY(this.player.body.velocity.y * 0.707);
        }

        // === NPC WANDERING ===
        const npcSpeed = 30;

        for (const npc of this.npcs) {
            npc.wanderTimer -= delta;

            if (npc.wanderTimer <= 0) {
                // Pick a new random direction (or stop)
                const choice = Math.random();
                if (choice < 0.3) {
                    // Stand still for a bit
                    npc.setVelocity(0);
                    npc.wanderTimer = 1000 + Math.random() * 2000;
                } else {
                    // Walk in a random direction
                    const angle = Math.random() * Math.PI * 2;
                    npc.setVelocityX(Math.cos(angle) * npcSpeed);
                    npc.setVelocityY(Math.sin(angle) * npcSpeed);
                    npc.wanderTimer = 500 + Math.random() * 1500;

                    // Flip sprite based on direction
                    if (npc.body.velocity.x < 0) npc.setFlipX(true);
                    else if (npc.body.velocity.x > 0) npc.setFlipX(false);
                }
            }

            // If NPC wanders too far from home, nudge them back
            const dx = npc.x - npc.homeX;
            const dy = npc.y - npc.homeY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > npc.wanderRange) {
                // Point back toward home
                npc.setVelocityX(-dx * 0.5);
                npc.setVelocityY(-dy * 0.5);
                npc.wanderTimer = 500;
            }
        }
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
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [BootScene, VillageScene]
};

const game = new Phaser.Game(config);
