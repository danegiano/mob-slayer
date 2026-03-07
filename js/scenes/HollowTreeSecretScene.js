class HollowTreeSecretScene extends Phaser.Scene {
    constructor() { super('HollowTreeSecret'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.add.rectangle(200, 150, 400, 300, 0x1e3e1e).setDepth(0);

        // Torches
        const torch1 = this.add.rectangle(40, 80, 6, 12, 0x44ff44).setDepth(5);
        const torch2 = this.add.rectangle(360, 80, 6, 12, 0x44ff44).setDepth(5);
        this.tweens.add({ targets: [torch1, torch2], alpha: 0.5, yoyo: true, repeat: -1, duration: 300 });

        this.player = new Player(this, 200, 250);
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);
        this.dialogue = new DialogueBox(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Mini-boss — big shadow beast
        this.enemies = this.physics.add.group();
        this.miniBoss = new Enemy(this, 200, 120, 'shadow_beast', 120);
        this.miniBoss.speed = 80;
        this.miniBoss.damage = 20;
        this.miniBoss.goldValue = 50;
        this.miniBoss.setScale(3);
        this.miniBoss.setTint(0xff4444);
        this.enemies.add(this.miniBoss);

        // Lore scroll
        this.scroll = new LoreScroll(this, 300, 120, 'hollowTree', [
            'The shadow beasts were once forest guardians...',
            'A dark curse twisted them into monsters.',
            'Only the bravest warriors dare face their king.'
        ]);

        // 200 gold chest (only openable after mini-boss dead)
        this.chest = new Chest(this, 120, 100, 'hollowTreeLore', {
            type: 'gold', amount: 200, name: '200 Gold'
        });

        this.physics.world.setBounds(0, 0, 400, 300);
        this.player.setCollideWorldBounds(true);
        this.transitioning = false;
        this.warningText = null;

        this.add.text(200, 30, 'Guardian\'s Lair', { fontSize: '14px', fill: '#ff4444' }).setOrigin(0.5).setDepth(50);
        this.add.text(200, 280, '< Exit >', { fontSize: '10px', fill: '#aaa' }).setOrigin(0.5).setDepth(50);
    }

    update() {
        if (!this.dialogue.isOpen && !this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();
        this.dialogue.update();

        // Update mini-boss
        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        // Player attack hitting mini-boss
        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    this.player.applySwordEffect(enemy, this.enemies);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        this.chest.showPrompt(this.player);
        this.scroll.showPrompt(this.player);

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.scroll.tryRead(this.player, this.dialogue);

            if (this.enemies.countActive() > 0) {
                // Show warning if mini-boss alive
                if (!this.warningText) {
                    this.warningText = this.add.text(200, 60, 'Defeat the guardian first!', {
                        fontSize: '10px', fill: '#ff4444'
                    }).setOrigin(0.5).setDepth(201);
                    this.time.delayedCall(2000, () => {
                        if (this.warningText) { this.warningText.destroy(); this.warningText = null; }
                    });
                }
            } else {
                this.chest.tryOpen(this.player, this);
            }
        }

        if (!this.transitioning && this.player.y >= 275) {
            this.transitioning = true;
            this.scene.start('HollowTree');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
