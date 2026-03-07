class BuriedLibrarySecretScene extends Phaser.Scene {
    constructor() { super('BuriedLibrarySecret'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.add.rectangle(200, 150, 400, 300, 0x3e2a1e).setDepth(0);

        // Torches
        const torch1 = this.add.rectangle(40, 80, 6, 12, 0xff8833).setDepth(5);
        const torch2 = this.add.rectangle(360, 80, 6, 12, 0xff8833).setDepth(5);
        this.tweens.add({ targets: [torch1, torch2], alpha: 0.5, yoyo: true, repeat: -1, duration: 300 });

        this.player = new Player(this, 200, 250);
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);
        this.dialogue = new DialogueBox(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Lore scroll
        this.scroll = new LoreScroll(this, 300, 120, 'buriedLibrary', [
            'The great civilization fell when they dug too deep...',
            'Their knowledge was vast, but their greed was greater.',
            'The ruins hold their secrets still, waiting to be found.'
        ]);

        // 300 gold chest
        this.chest = new Chest(this, 120, 100, 'buriedLibraryLore', {
            type: 'gold', amount: 300, name: '300 Gold'
        });

        this.physics.world.setBounds(0, 0, 400, 300);
        this.player.setCollideWorldBounds(true);
        this.transitioning = false;

        this.add.text(200, 30, 'Library Vault', { fontSize: '14px', fill: '#ddaa44' }).setOrigin(0.5).setDepth(50);
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

        if (!this.transitioning && this.player.y >= 275) {
            this.transitioning = true;
            this.scene.start('BuriedLibrary');
        }
    }
}
