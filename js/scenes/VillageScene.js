class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    create() {
        this.cameras.main.setBackgroundColor('#87CEEB');

        this.ground = this.add.rectangle(400, 430, 800, 40, 0x4a7a2e);
        this.physics.add.existing(this.ground, true);

        // Houses
        this.add.rectangle(200, 380, 80, 60, 0x8B4513);
        this.add.rectangle(200, 345, 80, 10, 0xCC0000);
        this.add.rectangle(500, 380, 80, 60, 0x8B4513);
        this.add.rectangle(500, 345, 80, 10, 0xCC0000);

        // Blacksmith NPC
        this.blacksmith = this.physics.add.sprite(400, 380, 'blacksmith');
        this.blacksmith.play('blacksmith_idle');
        this.blacksmith.body.setAllowGravity(false);
        this.blacksmith.setScale(2);

        this.talkPrompt = this.add.text(400, 340, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false);

        this.player = new Player(this, 100, 350);
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);
        this.dialogue = new DialogueBox(this);
        this.talkKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Exit right — goes to woods day or woods night depending on story phase
        this.exitZone = this.add.zone(790, 225, 20, 450);
        this.physics.add.existing(this.exitZone, true);
        this.physics.add.overlap(this.player, this.exitZone, () => {
            if (GameState.storyPhase >= 2) {
                this.scene.start('WoodsNight');
            } else {
                this.scene.start('WoodsDay');
            }
        });
    }

    update() {
        if (!this.dialogue.isOpen) {
            this.player.update();
        }
        this.hud.update();
        this.dialogue.update();

        const dist = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.blacksmith.x, this.blacksmith.y
        );
        this.talkPrompt.setVisible(dist < 60 && !this.dialogue.isOpen);

        if (Phaser.Input.Keyboard.JustDown(this.talkKey) && dist < 60 && !this.dialogue.isOpen) {
            if (GameState.storyPhase === 0) {
                this.dialogue.open('Blacksmith', [
                    'Hey there, adventurer!',
                    "Take this wood sword. It's not much, but it'll do.",
                    'I heard strange noises from the woods to the east...',
                    'Be careful out there!'
                ]);
            } else if (GameState.storyPhase === 1) {
                this.dialogue.open('Blacksmith', [
                    "What's that sword?! It's glowing!",
                    'That\'s the legendary \u30E2\u30D6\u30B9\u30EC\u30A4\u30E4\u30FC!',
                    "I'll give you 1000 gold for it!",
                    '...',
                    'No? Fine. But something feels wrong tonight...',
                    'The animals in the woods... they\'re changing.'
                ], () => {
                    GameState.storyPhase = 2;
                });
            }
        }
    }
}
