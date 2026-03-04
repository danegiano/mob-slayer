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

        // Top-left house (big brown one)
        addWall(200, 105, 160, 110);

        // Top-middle house (blue/gray roof)
        addWall(410, 90, 130, 100);

        // Bottom-left house (brown)
        addWall(145, 310, 150, 100);

        // Castle — left wall (left of gate)
        addWall(700, 200, 60, 160);
        // Castle — right wall (right of gate)
        addWall(820, 200, 80, 160);
        // Castle — top (above gate)
        addWall(760, 140, 200, 50);
        // Castle — towers on sides
        addWall(670, 300, 30, 100);
        addWall(870, 300, 30, 100);

        // Trees — top-left cluster
        addWall(30, 80, 50, 60);
        addWall(30, 190, 50, 50);
        addWall(30, 310, 40, 50);

        // Trees — scattered
        addWall(300, 20, 40, 50);
        addWall(360, 30, 30, 40);
        addWall(470, 190, 30, 40);
        addWall(530, 50, 30, 40);

        // Trees — right side
        addWall(830, 80, 40, 50);
        addWall(880, 140, 40, 50);
        addWall(870, 360, 40, 50);

        // Trees — bottom
        addWall(60, 430, 50, 40);
        addWall(830, 440, 60, 30);

        // Fences
        addWall(80, 230, 70, 10);
        addWall(410, 410, 250, 10);

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
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [BootScene, VillageScene]
};

const game = new Phaser.Game(config);
