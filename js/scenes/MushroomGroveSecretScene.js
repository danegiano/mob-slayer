class MushroomGroveSecretScene extends Phaser.Scene {
    constructor() { super('MushroomGroveSecret'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.add.rectangle(200, 150, 400, 300, 0x1e3e1e).setDepth(0);

        // Torches (green for forest theme)
        const torch1 = this.add.rectangle(40, 80, 6, 12, 0x44ff44).setDepth(5);
        const torch2 = this.add.rectangle(360, 80, 6, 12, 0x44ff44).setDepth(5);
        this.tweens.add({ targets: [torch1, torch2], alpha: 0.5, yoyo: true, repeat: -1, duration: 300 });

        this.player = new Player(this, 200, 250);
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);
        this.dialogue = new DialogueBox(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Lore scroll
        this.scroll = new LoreScroll(this, 300, 120, 'mushroomGrove', [
            'The ancient forest spirits once protected this grove...',
            'They say the mushrooms glow with their lingering magic.',
            'Those who listen can still hear their whispers.'
        ]);

        // 150 gold chest
        this.chest = new Chest(this, 120, 100, 'mushroomGroveLore', {
            type: 'gold', amount: 150, name: '150 Gold'
        });

        this.physics.world.setBounds(0, 0, 400, 300);
        this.player.setCollideWorldBounds(true);
        this.transitioning = false;

        this.add.text(200, 30, 'Grove Secret', { fontSize: '14px', fill: '#88ff88' }).setOrigin(0.5).setDepth(50);
        this.add.text(200, 280, '< Exit >', { fontSize: '10px', fill: '#aaa' }).setOrigin(0.5).setDepth(50);
    }

    update() {
        if (!this.dialogue.isOpen && !this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();
        this.dialogue.update();

        this.chest.showPrompt(this.player);
        this.scroll.showPrompt(this.player);

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.scroll.tryRead(this.player, this.dialogue);
            this.chest.tryOpen(this.player, this);
        }

        if (!this.transitioning && this.player.y > 280) {
            this.transitioning = true;
            this.scene.start('MushroomGrove');
        }
    }
}
