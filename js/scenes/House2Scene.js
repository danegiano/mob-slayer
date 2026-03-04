class House2Scene extends Phaser.Scene {
    constructor() { super('House2'); }

    tile(x, y, frame, scale) {
        scale = scale || 2;
        return this.add.image(x, y, 'tilemap', frame).setScale(scale);
    }

    create() {
        // Warm indoor background
        this.add.rectangle(400, 225, 800, 450, 0xd4b060);

        // === BACK WALL — wooden wall tiles ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 240, 73);  // wooden wall (with windows)
            this.tile(16 + i * 32, 208, 60);  // upper wall
        }

        // === FLOOR ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 414, 37);
            this.tile(16 + i * 32, 382, 37);
            this.tile(16 + i * 32, 446, 37);
        }
        this.add.rectangle(400, 260, 800, 4, 0x9B7924);

        // Ground for physics
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x000000, 0);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 700, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // --- Furniture using tiles ---

        // Big table (center) — tile 80
        this.tile(300, 395, 80, 3);

        // Chairs (keep as small rectangles — no chair tile)
        this.add.rectangle(240, 400, 20, 30, 0x5a3a1a);
        this.add.rectangle(240, 385, 20, 4, 0x5a3a1a);
        this.add.rectangle(360, 400, 20, 30, 0x5a3a1a);
        this.add.rectangle(360, 385, 20, 4, 0x5a3a1a);

        // Chest in corner — tile 82
        this.tile(60, 395, 82, 2.5);

        // Bookshelf on back wall — tile 83 (cabinet/shelf)
        this.tile(500, 220, 83, 2.5);
        this.tile(540, 220, 83, 2.5);

        // Items on table — tile 94 (plate/coin)
        this.tile(300, 375, 94, 1.5);

        // Windows
        this.tile(150, 220, 73, 2.5);
        this.tile(420, 220, 73, 2.5);

        // Rug
        this.add.rectangle(300, 405, 140, 50, 0x884466).setAlpha(0.3);

        // Scene label
        this.add.text(16, 16, 'House', { fontSize: '18px', fill: '#333' });
        this.add.text(400, 280, "Someone lives here... but they're not home.", {
            fontSize: '14px', fill: '#665533', fontStyle: 'italic'
        }).setOrigin(0.5);

        // --- Exit door ---
        this.tile(740, 390, 74, 2.5);

        this.doorZone = this.add.rectangle(740, 390, 40, 60, 0x000000, 0);
        this.physics.add.existing(this.doorZone, true);

        this.exitPrompt = this.add.text(740, 355, 'Press E to leave', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    update() {
        this.player.update();
        this.hud.update();

        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.doorZone.x, this.doorZone.y
        );

        if (dist < 50) {
            this.exitPrompt.setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.scene.start('Village', { spawnX: 320 });
            }
        } else {
            this.exitPrompt.setVisible(false);
        }
    }
}
