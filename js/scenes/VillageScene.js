class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    // Helper: place a tile from the tilemap at (x,y) scaled 2x (so 16px tile = 32px)
    tile(x, y, frame, scale) {
        scale = scale || 2;
        return this.add.image(x, y, 'tilemap', 'tile_' + frame).setScale(scale);
    }

    create(data) {
        // Animated background — sky, clouds, sun, grass, flowers
        Background.village(this);

        // === GROUND — grass tiles across the bottom ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 414, 0);   // grass top row
            this.tile(16 + i * 32, 446, 24);   // dirt row below
        }

        // Physics ground (invisible)
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x000000, 0);
        this.physics.add.existing(this.ground, true);

        // === PATH — dirt tiles across ground ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 414, 25).setDepth(-0.5);
        }

        // === TREES ===
        // Left trees (green, 2x2 block)
        this.tile(20, 355, 3, 2.5);   // top-left
        this.tile(52, 355, 4, 2.5);   // top-right
        this.tile(20, 387, 15, 2.5);  // bottom-left
        this.tile(52, 387, 16, 2.5);  // bottom-right

        // Right trees (autumn)
        this.tile(740, 355, 9, 2.5);
        this.tile(772, 355, 10, 2.5);
        this.tile(740, 387, 21, 2.5);
        this.tile(772, 387, 22, 2.5);

        // Background bush (smaller)
        this.tile(445, 370, 5, 1.8);
        this.tile(465, 370, 6, 1.8);
        this.tile(445, 388, 17, 1.8);
        this.tile(465, 388, 18, 1.8);

        // === FLOWERS & MUSHROOMS ===
        this.tile(200, 400, 27, 1.5);
        this.tile(500, 400, 28, 1.5);
        this.tile(680, 400, 29, 1.5);

        // === HOUSE 1 (left side) — brown roof ===
        // Roof
        this.tile(104, 340, 36, 2);   // roof left
        this.tile(136, 340, 37, 2);   // roof mid
        this.tile(168, 340, 38, 2);   // roof right
        // Walls
        this.tile(104, 372, 48, 2);   // wall left
        this.tile(136, 372, 49, 2);   // wall mid (door)
        this.tile(168, 372, 50, 2);   // wall right

        // === HOUSE 2 (middle) — red roof ===
        // Roof
        this.tile(274, 340, 39, 2);   // roof left
        this.tile(306, 340, 40, 2);   // roof mid
        this.tile(338, 340, 41, 2);   // roof right
        // Walls
        this.tile(274, 372, 51, 2);   // wall left
        this.tile(306, 372, 52, 2);   // wall mid
        this.tile(338, 372, 51, 2);   // wall right

        // === FORGE (right side) — stone building ===
        // Roof
        this.tile(554, 340, 60, 2);   // stone top left
        this.tile(586, 340, 61, 2);   // stone top mid
        this.tile(618, 340, 62, 2);   // stone top right
        // Walls
        this.tile(554, 372, 72, 2);   // stone wall left
        this.tile(586, 372, 73, 2);   // stone wall mid
        this.tile(618, 372, 74, 2);   // stone wall right
        // Door (wooden door in the middle)
        this.tile(586, 396, 77, 2);
        // Forge sign
        this.add.text(586, 318, 'Forge', { fontSize: '10px', fill: '#ff8800' }).setOrigin(0.5);

        // === SIGN POST ===
        this.tile(50, 390, 69, 2);
        this.add.text(50, 370, 'Village', { fontSize: '9px', fill: '#fff' }).setOrigin(0.5);

        // === FENCES ===
        this.tile(220, 400, 96, 2);   // fence left
        this.tile(252, 400, 97, 2);   // fence mid
        this.tile(284, 400, 98, 2);   // fence right

        this.tile(460, 400, 96, 2);
        this.tile(492, 400, 97, 2);

        // Player — spawn at given X or default 100
        const spawnX = (data && data.spawnX) ? data.spawnX : 100;
        this.player = new Player(this, spawnX, 350);
        this.physics.add.collider(this.player, this.ground);

        // Scene label
        this.add.text(16, 16, 'Village', { fontSize: '18px', fill: '#333' });

        // HUD
        this.hud = new HUD(this);

        // E key for interactions
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // --- Door entry zones ---
        // House 1 door
        this.door1Zone = this.add.rectangle(136, 400, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door1Zone, true);
        this.door1Prompt = this.add.text(136, 360, 'Press E', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // House 2 door
        this.door2Zone = this.add.rectangle(306, 400, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door2Zone, true);
        this.door2Prompt = this.add.text(306, 350, 'Press E', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Forge door
        this.door3Zone = this.add.rectangle(586, 400, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door3Zone, true);
        this.door3Prompt = this.add.text(586, 350, 'Press E', {
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
