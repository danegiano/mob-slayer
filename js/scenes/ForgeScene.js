class ForgeScene extends Phaser.Scene {
    constructor() { super('Forge'); }

    create() {
        // Stone floor
        this.add.rectangle(400, 350, 800, 200, 0x555555);
        for (let x = 0; x < 800; x += 50) {
            this.add.rectangle(x, 350, 1, 200, 0x444444);
        }
        for (let y = 280; y < 450; y += 50) {
            this.add.rectangle(400, y, 800, 1, 0x444444);
        }

        // Walls — dark stone
        this.add.rectangle(400, 200, 800, 100, 0x666666);
        this.add.rectangle(400, 250, 800, 4, 0x555555);

        // Ground for physics
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x555555);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 700, 350);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // --- Forge furniture ---

        // Furnace (left side) — big stone box with orange glow
        this.add.rectangle(100, 380, 70, 60, 0x444444);  // furnace body
        this.add.rectangle(100, 365, 60, 25, 0xff4400);  // fire opening
        this.add.rectangle(100, 365, 50, 18, 0xff8800);  // inner fire
        this.add.rectangle(100, 360, 30, 10, 0xffcc00);  // bright center

        // Furnace glow effect
        this.furnaceGlow = this.add.circle(100, 375, 50, 0xff6600, 0.15);

        // Animate the glow
        this.tweens.add({
            targets: this.furnaceGlow,
            alpha: { from: 0.1, to: 0.25 },
            scaleX: { from: 0.9, to: 1.1 },
            scaleY: { from: 0.9, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Anvil (center)
        this.add.rectangle(300, 405, 40, 20, 0x333333); // anvil base
        this.add.rectangle(300, 393, 50, 8, 0x444444);  // anvil top
        this.add.rectangle(315, 397, 15, 4, 0x444444);  // anvil horn

        // Hammer on anvil
        this.add.rectangle(290, 387, 6, 14, 0x8B4513);  // handle
        this.add.rectangle(290, 378, 12, 8, 0x666666);  // head

        // Weapon rack on back wall
        this.add.rectangle(500, 210, 80, 50, 0x5a3a1a); // rack frame
        // Swords on rack
        this.add.rectangle(480, 200, 4, 35, 0xaaaaaa);  // sword 1
        this.add.rectangle(480, 180, 8, 4, 0x8B4513);   // hilt 1
        this.add.rectangle(500, 205, 4, 30, 0xaaaaaa);  // sword 2
        this.add.rectangle(500, 188, 8, 4, 0x8B4513);   // hilt 2
        this.add.rectangle(520, 200, 4, 35, 0xcccccc);  // sword 3 (shiny)
        this.add.rectangle(520, 180, 8, 4, 0xffcc00);   // hilt 3 (gold)

        // Barrel in corner
        this.add.rectangle(180, 400, 30, 35, 0x8B4513);
        this.add.rectangle(180, 390, 32, 3, 0x666666);  // barrel ring
        this.add.rectangle(180, 405, 32, 3, 0x666666);  // barrel ring

        // Scene label
        this.add.text(16, 16, 'Forge', { fontSize: '18px', fill: '#ff8800' });

        // Flavor text
        this.add.text(400, 270, 'The forge is warm.', {
            fontSize: '14px', fill: '#cc8844', fontStyle: 'italic'
        }).setOrigin(0.5);

        // --- Blacksmith NPC (pixel art loaded in BootScene) ---

        this.blacksmith = this.physics.add.staticSprite(400, 386, 'blacksmith');
        this.blacksmith.play('blacksmith_idle');
        this.add.text(400, 350, 'Blacksmith', {
            fontSize: '12px', fill: '#ddd'
        }).setOrigin(0.5);

        // Talk prompt
        this.talkPrompt = this.add.text(400, 340, 'Press E to talk', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Dialogue
        this.dialogue = new DialogueBox(this);

        // --- Exit door (right side) ---
        this.add.rectangle(740, 390, 30, 50, 0x5a3a1a);
        this.add.circle(732, 390, 3, 0xffcc00);

        this.doorZone = this.add.rectangle(740, 390, 40, 60, 0x000000, 0);
        this.physics.add.existing(this.doorZone, true);

        this.exitPrompt = this.add.text(740, 355, 'Press E to leave', {
            fontSize: '11px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // E key
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    update() {
        // Freeze player during dialogue
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
                return; // don't also check door
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
