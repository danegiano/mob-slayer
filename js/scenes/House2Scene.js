class House2Scene extends Phaser.Scene {
    constructor() { super('House2'); }

    create() {
        // Floor — wooden planks
        this.add.rectangle(400, 350, 800, 200, 0xA88834);
        for (let x = 0; x < 800; x += 70) {
            this.add.rectangle(x, 350, 2, 200, 0x8a6c1e);
        }

        // Walls
        this.add.rectangle(400, 200, 800, 100, 0xd4b566); // back wall
        this.add.rectangle(400, 250, 800, 4, 0x9B7924);   // wall-floor line

        // Ground for physics
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x9B7924);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 700, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // --- Furniture ---

        // Big table (center)
        this.add.rectangle(300, 390, 100, 35, 0x8B6914); // tabletop
        this.add.rectangle(265, 410, 6, 20, 0x5a3a1a);   // leg
        this.add.rectangle(335, 410, 6, 20, 0x5a3a1a);   // leg

        // Chairs around table
        this.add.rectangle(250, 400, 20, 30, 0x5a3a1a); // chair left
        this.add.rectangle(250, 385, 20, 4, 0x5a3a1a);  // chair back
        this.add.rectangle(350, 400, 20, 30, 0x5a3a1a); // chair right
        this.add.rectangle(350, 385, 20, 4, 0x5a3a1a);  // chair back

        // Plate on table
        this.add.circle(300, 385, 8, 0xdddddd);
        this.add.circle(300, 385, 5, 0xeeeeee);

        // Chest in corner (left)
        this.add.rectangle(60, 400, 50, 35, 0x8B4513);  // chest body
        this.add.rectangle(60, 382, 52, 6, 0x6b3410);   // chest lid
        this.add.rectangle(60, 398, 8, 8, 0xffcc00);    // lock/clasp

        // Bookshelf on back wall
        this.add.rectangle(500, 210, 60, 50, 0x5a3a1a); // shelf
        this.add.rectangle(490, 195, 10, 18, 0xcc3333); // book red
        this.add.rectangle(500, 195, 10, 18, 0x3366cc); // book blue
        this.add.rectangle(510, 195, 10, 18, 0x33aa33); // book green
        this.add.rectangle(490, 218, 10, 15, 0xccaa33); // book yellow
        this.add.rectangle(503, 218, 10, 15, 0x8833cc); // book purple

        // Windows
        this.add.rectangle(150, 200, 40, 30, 0x88ccff);
        this.add.rectangle(150, 200, 42, 2, 0x5a3a1a);
        this.add.rectangle(150, 200, 2, 32, 0x5a3a1a);
        this.add.rectangle(450, 200, 40, 30, 0x88ccff);
        this.add.rectangle(450, 200, 42, 2, 0x5a3a1a);
        this.add.rectangle(450, 200, 2, 32, 0x5a3a1a);

        // Rug
        this.add.rectangle(300, 405, 140, 50, 0x884466).setAlpha(0.4);

        // Scene label
        this.add.text(16, 16, 'House', { fontSize: '18px', fill: '#333' });

        // Flavor text
        this.add.text(400, 270, "Someone lives here... but they're not home.", {
            fontSize: '14px', fill: '#665533', fontStyle: 'italic'
        }).setOrigin(0.5);

        // --- Exit door (right side) ---
        this.add.rectangle(740, 390, 30, 50, 0x5a3a1a);
        this.add.circle(732, 390, 3, 0xffcc00);

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
