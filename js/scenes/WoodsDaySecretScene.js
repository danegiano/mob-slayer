class WoodsDaySecretScene extends Phaser.Scene {
    constructor() { super('WoodsDaySecret'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.add.rectangle(200, 150, 400, 300, 0x2a2a3e).setDepth(0);

        // Torches
        const torch1 = this.add.rectangle(40, 80, 6, 12, 0xff6600).setDepth(5);
        const torch2 = this.add.rectangle(360, 80, 6, 12, 0xff6600).setDepth(5);
        this.tweens.add({ targets: [torch1, torch2], alpha: 0.5, yoyo: true, repeat: -1, duration: 300 });

        // Player
        this.player = new Player(this, 200, 250);
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // 100 gold chest
        this.chest = new Chest(this, 200, 100, 'woodsDayGold', {
            type: 'gold', amount: 100, name: '100 Gold'
        });

        // Room bounds
        this.physics.world.setBounds(0, 0, 400, 300);
        this.player.setCollideWorldBounds(true);

        this.transitioning = false;

        this.add.text(200, 30, 'Secret Room', {
            fontSize: '14px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        this.add.text(200, 280, '< Exit >', {
            fontSize: '10px', fill: '#aaa'
        }).setOrigin(0.5).setDepth(50);
    }

    update() {
        if (!this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();

        this.chest.showPrompt(this.player);
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.chest.tryOpen(this.player, this);
        }

        // Exit bottom
        if (!this.transitioning && this.player.y >= 275) {
            this.transitioning = true;
            this.scene.start('WoodsDay');
        }
    }
}
