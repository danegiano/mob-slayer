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
        // Village background — this IS the world
        const bg = this.add.image(0, 0, 'village').setOrigin(0, 0);

        // Set world bounds to match the image
        this.physics.world.setBounds(0, 0, bg.width, bg.height);

        // Camera setup — bounded to the world, zoomed in 2x for crisp pixels
        this.cameras.main.setBounds(0, 0, bg.width, bg.height);
        this.cameras.main.setZoom(2);

        // Player — tile 128 from Kenney tilemap (the knight!)
        this.player = this.physics.add.sprite(460, 300, 'tiles', 128);
        this.player.setCollideWorldBounds(true);

        // Scale player up a bit so they match the world
        this.player.setScale(1);
        this.player.body.setSize(12, 12);
        this.player.body.setOffset(2, 4);

        // Camera follows the player smoothly
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Collision walls over buildings, trees, castle
        this.walls = this.physics.add.staticGroup();

        const addWall = (x, y, w, h) => {
            const wall = this.add.rectangle(x, y, w, h, 0xff0000, 0);
            this.physics.add.existing(wall, true);
            this.walls.add(wall);
        };

        // === HOUSES ===
        // Top-left big house (brown + red roof)
        addWall(201, 96, 176, 128);
        // Top-middle house (blue/gray roof)
        addWall(409, 88, 144, 112);
        // Small house top-right
        addWall(601, 56, 80, 80);
        // Bottom-left house
        addWall(153, 312, 176, 112);

        // === CASTLE (gate opening at x=737 to x=801) ===
        // Castle left wall
        addWall(697, 258, 80, 226);
        // Castle right wall
        addWall(850, 258, 98, 226);
        // Castle top (above gate)
        addWall(778, 155, 244, 50);

        // === TREES ===
        // Top-left cluster
        addWall(32, 72, 65, 80);
        addWall(32, 192, 65, 64);
        // Bottom-left
        addWall(24, 304, 48, 64);
        // Scattered top
        addWall(281, 24, 48, 48);
        addWall(329, 32, 48, 64);
        addWall(449, 184, 32, 48);
        addWall(521, 40, 48, 48);
        // Right side
        addWall(884, 80, 68, 64);
        addWall(884, 384, 68, 68);
        // Bottom
        addWall(65, 418, 96, 64);
        addWall(876, 434, 84, 56);

        // === FENCES ===
        addWall(81, 216, 64, 16);
        addWall(401, 392, 288, 16);

        // Collide player with walls
        this.physics.add.collider(this.player, this.walls);

        // Arrow keys + WASD input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    update() {
        const speed = 120;
        this.player.setVelocity(0);

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
        }

        // Vertical movement
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Normalize diagonal so you don't go faster diagonally
        if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
            this.player.setVelocityX(this.player.body.velocity.x * 0.707);
            this.player.setVelocityY(this.player.body.velocity.y * 0.707);
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
        arcade: { gravity: { y: 0 }, debug: true }
    },
    scene: [BootScene, VillageScene]
};

const game = new Phaser.Game(config);
