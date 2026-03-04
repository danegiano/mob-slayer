class House1Scene extends Phaser.Scene {
    constructor() { super('House1'); }

    create() {
        // Floor — wooden planks
        this.add.rectangle(400, 350, 800, 200, 0x9B7924);
        // Plank lines
        for (let x = 0; x < 800; x += 80) {
            this.add.rectangle(x, 350, 2, 200, 0x7a5c14);
        }

        // Walls
        this.add.rectangle(400, 200, 800, 100, 0xc4a556); // back wall
        this.add.rectangle(400, 250, 800, 4, 0x8B6914);   // wall-floor line

        // Ground for physics
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x8B6914);
        this.physics.add.existing(this.ground, true);

        // Player — spawns near door
        this.player = new Player(this, 700, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // --- Furniture ---

        // Bed (left side) — frame + pillow + blanket
        this.add.rectangle(120, 390, 80, 40, 0x5a3a1a); // bed frame
        this.add.rectangle(120, 385, 70, 30, 0x4488cc); // blue blanket
        this.add.rectangle(85, 380, 20, 20, 0xeeeeee);  // pillow

        // Small table (center)
        this.add.rectangle(350, 395, 60, 30, 0x8B6914); // tabletop
        this.add.rectangle(330, 410, 6, 20, 0x5a3a1a);  // leg left
        this.add.rectangle(370, 410, 6, 20, 0x5a3a1a);  // leg right

        // Candle on table
        this.add.rectangle(350, 377, 4, 10, 0xffeedd);   // candle
        this.add.circle(350, 370, 4, 0xffaa00);          // flame

        // Rug on floor
        this.add.rectangle(250, 405, 100, 40, 0xcc4444).setAlpha(0.5);

        // Window on back wall
        this.add.rectangle(200, 200, 40, 30, 0x88ccff); // window glass
        this.add.rectangle(200, 200, 42, 2, 0x5a3a1a);  // window frame h
        this.add.rectangle(200, 200, 2, 32, 0x5a3a1a);  // window frame v

        // Scene label
        this.add.text(16, 16, 'House', { fontSize: '18px', fill: '#333' });

        // Flavor text
        this.add.text(400, 270, 'A cozy little home.', {
            fontSize: '14px', fill: '#665533', fontStyle: 'italic'
        }).setOrigin(0.5);

        // --- Exit door (right side) ---
        this.add.rectangle(740, 390, 30, 50, 0x5a3a1a); // door
        this.add.circle(732, 390, 3, 0xffcc00);          // doorknob

        // Door exit zone
        this.doorZone = this.add.rectangle(740, 390, 40, 60, 0x000000, 0);
        this.physics.add.existing(this.doorZone, true);

        // "Press E" prompt
        this.exitPrompt = this.add.text(740, 355, 'Press E to leave', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // E key
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    update() {
        this.player.update();
        this.hud.update();

        // Check if near door
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
