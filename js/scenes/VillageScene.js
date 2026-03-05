class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    preload() {
        this.load.image('village-bg', 'assets/backgrounds/village-bg.png');
    }

    create() {
        // Background image (covers the whole screen)
        this.add.image(400, 225, 'village-bg');

        // Invisible ground for physics — matches where grass meets dirt path in background
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Blacksmith NPC
        this.blacksmith = this.physics.add.sprite(400, 365, 'blacksmith');
        this.blacksmith.play('blacksmith_idle');
        this.blacksmith.body.setAllowGravity(false);
        this.blacksmith.setScale(2);

        this.talkPrompt = this.add.text(400, 320, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false);

        this.player = new Player(this, 100, 340);
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);
        this.dialogue = new DialogueBox(this);
        this.talkKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.transitioning = false;
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

        // Exit right — walk to right edge to enter the woods
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            if (GameState.storyPhase >= 2) {
                this.scene.start('WoodsNight');
            } else {
                this.scene.start('WoodsDay');
            }
        }

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
