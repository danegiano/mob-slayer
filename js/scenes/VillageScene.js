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
        // Tile 0 = grass (light green), tile 12 = grass (full)
        for (let i = 0; i < 26; i++) {
            // Top grass row (at y=414, the "surface")
            this.tile(16 + i * 32, 414, 0);
            // Dirt row below (at y=446)
            this.tile(16 + i * 32, 446, 37);
        }

        // Physics ground (invisible, same position as before)
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x000000, 0);
        this.physics.add.existing(this.ground, true);

        // === PATH — dirt tiles across middle of ground ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 414, 37).setDepth(-0.5);
        }

        // === TREES (decorative, behind buildings) ===
        // Tile 4 = big green tree top, tile 16 = tree trunk/base
        // Left trees
        this.tile(30, 350, 4, 2.5);
        this.tile(30, 385, 16, 2.5);
        // Far right trees
        this.tile(760, 350, 5, 2.5);
        this.tile(760, 385, 17, 2.5);
        // Background trees (smaller)
        this.tile(450, 360, 6, 1.8);
        this.tile(450, 385, 28, 1.8);

        // === FLOWERS & MUSHROOMS (ground decorations) ===
        this.tile(200, 398, 15, 1.5);  // flowers
        this.tile(500, 398, 15, 1.5);  // flowers
        this.tile(680, 398, 29, 1.5);  // mushroom

        // === HOUSE 1 (small, left side) — wooden house ===
        // Roof: tiles 62 area (pointy brown roof)
        this.tile(120, 338, 62, 2);  // roof left
        this.tile(152, 338, 63, 2);  // roof right
        // Walls: tile 72-74 (wooden walls with window/door)
        this.tile(120, 370, 72, 2);  // wall left
        this.tile(152, 370, 73, 2);  // wall right (with window)
        // Door
        this.tile(120, 398, 74, 2);  // door bottom

        // === HOUSE 2 (bigger, middle) — wooden house ===
        this.tile(290, 338, 62, 2);  // roof left
        this.tile(322, 338, 60, 2);  // roof middle
        this.tile(354, 338, 63, 2);  // roof right
        // Walls
        this.tile(290, 370, 72, 2);  // wall left
        this.tile(322, 370, 73, 2);  // wall middle (window)
        this.tile(354, 370, 72, 2);  // wall right
        // Door
        this.tile(322, 398, 74, 2);  // door

        // === BLACKSMITH FORGE (stone building, right side) ===
        // Roof: stone/grey (tiles 78-79 area)
        this.tile(570, 338, 78, 2);  // stone roof left
        this.tile(602, 338, 76, 2);  // stone roof middle
        this.tile(634, 338, 79, 2);  // stone roof right
        // Walls: stone walls
        this.tile(570, 370, 84, 2);  // stone wall left
        this.tile(602, 370, 85, 2);  // stone wall middle
        this.tile(634, 370, 84, 2);  // stone wall right
        // Door
        this.tile(602, 398, 91, 2);  // stone door
        // Forge sign
        this.add.text(602, 318, 'Forge', { fontSize: '10px', fill: '#ff8800' }).setOrigin(0.5);

        // === VILLAGE SIGN (near left edge) ===
        // Tile 45-47: fence/sign pieces
        this.tile(50, 388, 45, 2);
        this.add.text(50, 370, 'Village', { fontSize: '9px', fill: '#fff' }).setOrigin(0.5);

        // === FENCE sections ===
        this.tile(230, 398, 45, 2);
        this.tile(262, 398, 46, 2);
        this.tile(470, 398, 45, 2);
        this.tile(502, 398, 46, 2);

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
        this.door1Zone = this.add.rectangle(120, 400, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door1Zone, true);
        this.door1Prompt = this.add.text(120, 360, 'Press E', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // House 2 door
        this.door2Zone = this.add.rectangle(322, 400, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door2Zone, true);
        this.door2Prompt = this.add.text(322, 350, 'Press E', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Forge door
        this.door3Zone = this.add.rectangle(602, 400, 30, 40, 0x000000, 0);
        this.physics.add.existing(this.door3Zone, true);
        this.door3Prompt = this.add.text(602, 350, 'Press E', {
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
