class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    preload() {
        this.load.image('village-bg', 'assets/backgrounds/village-bg.png');
    }

    create() {
        // Background image
        this.add.image(400, 225, 'village-bg');

        // Blacksmith NPC
        this.blacksmith = this.physics.add.sprite(400, 200, 'blacksmith');
        this.blacksmith.play('blacksmith_idle');
        this.blacksmith.setScale(2);
        this.blacksmith.body.setImmovable(true);

        this.talkPrompt = this.add.text(400, 170, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Player
        this.player = new Player(this, 200, 225);

        // HUD
        this.hud = new HUD(this);

        // Dialogue — uses its own E key internally (like the old game)
        this.dialogue = new DialogueBox(this);

        // E key for opening dialogue
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.transitioning = false;
    }

    update() {
        if (!this.dialogue.isOpen) {
            this.player.update();
        }
        this.hud.update();

        // Dialogue handles its own E key when open (returns early if not open)
        this.dialogue.update();

        // Horizontal distance to blacksmith
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.blacksmith.x, this.blacksmith.y);
        this.talkPrompt.setPosition(this.blacksmith.x, this.blacksmith.y - 50);
        this.talkPrompt.setVisible(dist < 80 && !this.dialogue.isOpen);

        // Exit right
        if (!this.transitioning && this.player.x > 770) {
            this.transitioning = true;
            if (GameState.storyPhase >= 2) {
                this.scene.start('WoodsNight');
            } else {
                this.scene.start('WoodsDay');
            }
        }

        // Open dialogue when pressing E near blacksmith (only when dialogue is NOT open)
        if (!this.dialogue.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey) && dist < 80) {
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
                    "That's the legendary \u30E2\u30D6\u30B9\u30EC\u30A4\u30E4\u30FC!",
                    "I'll give you 1000 gold for it!",
                    '...',
                    'No? Fine. But something feels wrong tonight...',
                    "The animals in the woods... they're changing."
                ], () => {
                    GameState.storyPhase = 2;
                });
            }
        }
    }
}
