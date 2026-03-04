class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    create() {
        // Ground — brown rectangle across the bottom
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x8B4513);
        this.physics.add.existing(this.ground, true); // true = static body

        // Player
        this.player = new Player(this, 100, 350);
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

        // Blacksmith shop (behind blacksmith)
        this.add.rectangle(600, 360, 100, 80, 0x666666); // stone wall
        this.add.rectangle(600, 310, 110, 20, 0x444444); // roof
        this.add.text(600, 310, 'Forge', { fontSize: '10px', fill: '#ff8800' }).setOrigin(0.5);

        // Village sign
        this.add.rectangle(50, 390, 6, 30, 0x5a3a1a); // post
        this.add.rectangle(50, 370, 60, 20, 0x8B6914); // sign board
        this.add.text(50, 370, 'Village', { fontSize: '9px', fill: '#fff' }).setOrigin(0.5);

        // HUD
        this.hud = new HUD(this);

        // Blacksmith NPC — orange rectangle
        if (!this.textures.exists('blacksmith')) {
            const bsGfx = this.add.graphics();
            bsGfx.fillStyle(0xff8800);
            bsGfx.fillRect(0, 0, 32, 48);
            bsGfx.generateTexture('blacksmith', 32, 48);
            bsGfx.destroy();
        }

        this.blacksmith = this.physics.add.staticImage(600, 386, 'blacksmith');

        // Label above blacksmith
        this.add.text(600, 350, 'Blacksmith', {
            fontSize: '12px', fill: '#333'
        }).setOrigin(0.5);

        // "Press E" prompt
        this.talkPrompt = this.add.text(600, 340, 'Press E to talk', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Dialogue box
        this.dialogue = new DialogueBox(this);

        // E key for NPC interaction
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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
        // If dialogue is open, freeze the player
        if (this.dialogue && this.dialogue.isOpen) {
            this.dialogue.update();
            this.player.setVelocityX(0);
            return; // skip all other updates
        }

        this.player.update();
        this.hud.update();

        // Dialogue system
        this.dialogue.update();

        // Show "Press E" when near blacksmith
        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.blacksmith.x, this.blacksmith.y
        );

        if (dist < 60 && !this.dialogue.isOpen) {
            this.talkPrompt.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.talkPrompt.setVisible(false);

                if (GameState.storyPhase === 0) {
                    this.dialogue.open([
                        "Blacksmith: Hey there! Heading out to the woods?",
                        "Blacksmith: Be careful — strange things have been happening lately.",
                        "Blacksmith: If you find anything interesting, come show me!"
                    ]);
                } else if (GameState.storyPhase === 1) {
                    this.dialogue.open([
                        "Blacksmith: What's that sword?! Let me see...",
                        "Blacksmith: This is... モブスレイヤー — the Slayer of Mobs!",
                        "Blacksmith: I'll give you 1000 gold for it! That's a fortune!",
                        "You: Uhhh... no. I think I'll keep it.",
                        "Blacksmith: Your choice, kid. But be careful with that thing."
                    ], () => {
                        GameState.storyPhase = 2;
                    });
                } else {
                    this.dialogue.open([
                        "Blacksmith: Be careful out there. It's getting dark..."
                    ]);
                }
            }
        } else {
            this.talkPrompt.setVisible(false);
        }
    }
}
