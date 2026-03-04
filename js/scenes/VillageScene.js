class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    create(data) {
        // Ground — brown rectangle across the bottom
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x8B4513);
        this.physics.add.existing(this.ground, true); // true = static body

        // Player — spawn at given X or default 100
        const spawnX = (data && data.spawnX) ? data.spawnX : 100;
        this.player = new Player(this, spawnX, 350);
        this.physics.add.collider(this.player, this.ground);

        // Scene label
        this.add.text(16, 16, 'Village', { fontSize: '18px', fill: '#333' });

        // Houses — simple rectangles to make it look like a village
        // House 1 (left side)
        this.add.rectangle(120, 370, 80, 60, 0x8B6914); // wall
        this.add.rectangle(120, 330, 90, 20, 0xcc3333); // roof
        this.add.rectangle(120, 385, 20, 30, 0x5a3a1a); // door

        // House 2 (middle)
        this.add.rectangle(320, 360, 100, 80, 0x9B7924); // wall
        this.add.rectangle(320, 310, 110, 20, 0xcc3333); // roof
        this.add.rectangle(320, 385, 20, 30, 0x5a3a1a); // door
        this.add.rectangle(290, 360, 15, 15, 0x88ccff); // window

        // Blacksmith shop
        this.add.rectangle(600, 360, 100, 80, 0x666666); // stone wall
        this.add.rectangle(600, 310, 110, 20, 0x444444); // roof
        this.add.text(600, 310, 'Forge', { fontSize: '10px', fill: '#ff8800' }).setOrigin(0.5);
        this.add.rectangle(600, 385, 20, 30, 0x5a3a1a); // door

        // Village sign
        this.add.rectangle(50, 390, 6, 30, 0x5a3a1a); // post
        this.add.rectangle(50, 370, 60, 20, 0x8B6914); // sign board
        this.add.text(50, 370, 'Village', { fontSize: '9px', fill: '#fff' }).setOrigin(0.5);

        // HUD
        this.hud = new HUD(this);

        // E key for interactions
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // --- Door entry zones ---
        // Each door has an invisible zone + a "Press E to enter" prompt

        // House 1 door
        this.door1Zone = this.add.rectangle(120, 390, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door1Zone, true);
        this.door1Prompt = this.add.text(120, 360, 'Press E to enter', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // House 2 door
        this.door2Zone = this.add.rectangle(320, 390, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door2Zone, true);
        this.door2Prompt = this.add.text(320, 350, 'Press E to enter', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Forge door
        this.door3Zone = this.add.rectangle(600, 390, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door3Zone, true);
        this.door3Prompt = this.add.text(600, 350, 'Press E to enter', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Right edge — go to woods
        this.exitRight = this.add.rectangle(800, 225, 20, 450, 0x000000, 0);
        this.physics.add.existing(this.exitRight, true);
        this.physics.add.overlap(this.player, this.exitRight, () => {
            if (GameState.storyPhase < 2) {
                this.scene.start('WoodsDay');
            } else {
                this.scene.start('WoodsNight');
            }
        });
    }

    update() {
        this.player.update();
        this.hud.update();

        // Check each door
        this.checkDoor(this.door1Zone, this.door1Prompt, 'House1');
        this.checkDoor(this.door2Zone, this.door2Prompt, 'House2');
        this.checkDoor(this.door3Zone, this.door3Prompt, 'Forge');
    }

    checkDoor(zone, prompt, sceneName) {
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            zone.x, zone.y
        );

        if (dist < 50) {
            prompt.setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.scene.start(sceneName);
            }
        } else {
            prompt.setVisible(false);
        }
    }
}
