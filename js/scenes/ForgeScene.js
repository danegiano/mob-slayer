class ForgeScene extends Phaser.Scene {
    constructor() { super('Forge'); }

    tile(x, y, frame, scale) {
        scale = scale || 2;
        return this.add.image(x, y, 'tilemap', frame).setScale(scale);
    }

    create() {
        // Dark stone background
        this.add.rectangle(400, 225, 800, 450, 0x444444);

        // === BACK WALL — stone wall tiles ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 240, 48);  // stone wall
            this.tile(16 + i * 32, 208, 49);  // stone wall upper
        }

        // === FLOOR — stone floor tiles ===
        for (let i = 0; i < 26; i++) {
            this.tile(16 + i * 32, 414, 50);  // stone floor
            this.tile(16 + i * 32, 382, 50);
            this.tile(16 + i * 32, 446, 51);
        }
        this.add.rectangle(400, 260, 800, 4, 0x555555);

        // Ground for physics
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x000000, 0);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 700, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // --- Forge furniture ---

        // Furnace (left side) — use brick wall tiles + fire glow
        this.tile(80, 380, 52, 2.5);   // brick/furnace body
        this.tile(120, 380, 53, 2.5);  // brick/furnace body
        // Fire opening (keep as colored rectangles for the glow effect)
        this.add.rectangle(100, 365, 50, 18, 0xff4400);
        this.add.rectangle(100, 365, 40, 12, 0xff8800);
        this.add.rectangle(100, 362, 24, 8, 0xffcc00);

        // Furnace glow effect
        this.furnaceGlow = this.add.circle(100, 375, 50, 0xff6600, 0.15);
        this.tweens.add({
            targets: this.furnaceGlow,
            alpha: { from: 0.1, to: 0.25 },
            scaleX: { from: 0.9, to: 1.1 },
            scaleY: { from: 0.9, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Anvil (center) — tile 119 area (tool-ish)
        this.add.rectangle(300, 405, 40, 20, 0x333333);
        this.add.rectangle(300, 393, 50, 8, 0x444444);
        this.add.rectangle(315, 397, 15, 4, 0x444444);

        // Hammer on anvil — tile 117 (tool)
        this.tile(290, 385, 117, 2);

        // Weapon rack on back wall — use sword/shield tiles
        this.tile(480, 220, 93, 2.5);   // sword
        this.tile(510, 220, 106, 2.5);  // shield/weapon
        this.tile(540, 220, 93, 2.5);   // another sword

        // Barrel — tile 95 (barrel/pot item)
        this.tile(180, 395, 95, 2.5);

        // Scene label
        this.add.text(16, 16, 'Forge', { fontSize: '18px', fill: '#ff8800' });
        this.add.text(400, 280, 'The forge is warm.', {
            fontSize: '14px', fill: '#cc8844', fontStyle: 'italic'
        }).setOrigin(0.5);

        // --- Blacksmith NPC ---
        this.blacksmith = this.add.sprite(400, 386, 'blacksmith');
        this.physics.add.existing(this.blacksmith, true);
        this.blacksmith.play('blacksmith_idle');
        this.add.text(400, 350, 'Blacksmith', {
            fontSize: '12px', fill: '#ddd'
        }).setOrigin(0.5);

        this.talkPrompt = this.add.text(400, 340, 'Press E to talk', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        this.dialogue = new DialogueBox(this);

        // --- Exit door ---
        this.tile(740, 390, 91, 2.5);  // stone door

        this.doorZone = this.add.rectangle(740, 390, 40, 60, 0x000000, 0);
        this.physics.add.existing(this.doorZone, true);

        this.exitPrompt = this.add.text(740, 355, 'Press E to leave', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    update() {
        if (this.dialogue && this.dialogue.isOpen) {
            this.dialogue.update();
            this.player.setVelocityX(0);
            return;
        }

        this.player.update();
        this.hud.update();
        this.dialogue.update();

        // --- Blacksmith talk ---
        const bsDist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.blacksmith.x, this.blacksmith.y
        );

        if (bsDist < 60 && !this.dialogue.isOpen) {
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
                return;
            }
        } else {
            this.talkPrompt.setVisible(false);
        }

        // --- Exit door ---
        const doorDist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.doorZone.x, this.doorZone.y
        );

        if (doorDist < 50) {
            this.exitPrompt.setVisible(true);
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.scene.start('Village', { spawnX: 600 });
            }
        } else {
            this.exitPrompt.setVisible(false);
        }
    }
}
