class House1Scene extends Phaser.Scene {
    constructor() { super('House1'); }

    tile(x, y, frame, scale) {
        scale = scale || 2;
        return this.add.image(x, y, 'tilemap', 'tile_' + frame).setScale(scale);
    }

    create() {
        // Warm indoor background
        this.add.rectangle(400, 225, 800, 450, 0xc4a050);

        // === BACK WALL — wooden wall tiles ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 240, 72);  // wooden wall
            this.tile(16 + i * 32, 208, 60);  // upper wall
        }

        // === FLOOR — wooden plank tiles ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 414, 37);  // wood floor
            this.tile(16 + i * 32, 382, 37);  // wood floor upper
            this.tile(16 + i * 32, 446, 37);  // wood floor lower
        }
        // Wall-floor divider
        this.add.rectangle(400, 260, 800, 4, 0x8B6914);

        // Ground for physics
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x000000, 0);
        this.physics.add.existing(this.ground, true);

        // Player — spawns near door
        this.player = new Player(this, 700, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // --- Furniture using tiles ---

        // Bed (left side) — tile 81 looks like a bed/couch
        this.tile(100, 395, 81, 2.5);
        // Table (center) — tile 80
        this.tile(300, 395, 80, 2.5);
        // Candle on table — tile 95 (orange glowy item)
        this.tile(300, 365, 95, 1.8);

        // Chest — tile 82 (box/chest item)
        this.tile(200, 395, 82, 2.5);

        // Window on back wall — tile 73 has a window
        this.tile(200, 220, 73, 2.5);
        this.tile(450, 220, 73, 2.5);

        // Rug (keep as rectangle — no rug tile)
        this.add.rectangle(400, 405, 120, 40, 0xcc4444).setAlpha(0.3);

        // Scene label
        this.add.text(16, 16, 'House', { fontSize: '18px', fill: '#333' });
        this.add.text(400, 280, 'A cozy little home.', {
            fontSize: '14px', fill: '#665533', fontStyle: 'italic'
        }).setOrigin(0.5);

        // --- Exit door (right side) ---
        this.tile(740, 390, 74, 2.5);  // door tile

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
                this.scene.start('Village', { spawnX: 120 });
            }
        } else {
            this.exitPrompt.setVisible(false);
        }
    }
}
