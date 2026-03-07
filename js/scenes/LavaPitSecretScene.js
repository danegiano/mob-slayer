class LavaPitSecretScene extends Phaser.Scene {
    constructor() { super('LavaPitSecret'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.add.rectangle(200, 150, 400, 300, 0x3e1a1a).setDepth(0);

        // Torches (red/lava theme)
        const torch1 = this.add.rectangle(40, 80, 6, 12, 0xff4422).setDepth(5);
        const torch2 = this.add.rectangle(360, 80, 6, 12, 0xff4422).setDepth(5);
        this.tweens.add({ targets: [torch1, torch2], alpha: 0.5, yoyo: true, repeat: -1, duration: 300 });

        this.player = new Player(this, 200, 250);
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Mini-boss — big stone golem
        this.enemies = this.physics.add.group();
        this.miniBoss = new Enemy(this, 200, 120, 'stone_golem', 80);
        this.miniBoss.speed = 40;
        this.miniBoss.damage = 25;
        this.miniBoss.goldValue = 60;
        this.miniBoss.setScale(3);
        this.miniBoss.setTint(0xff4444);
        this.enemies.add(this.miniBoss);

        // Life Ring chest (only openable after mini-boss dead)
        this.chest = new Chest(this, 200, 200, 'lavaPitRing', {
            type: 'accessory', id: 'lifeRing', name: 'Life Ring (+25 Max HP)'
        });

        this.physics.world.setBounds(0, 0, 400, 300);
        this.player.setCollideWorldBounds(true);
        this.transitioning = false;
        this.warningText = null;

        this.add.text(200, 30, 'Golem\'s Lair', { fontSize: '14px', fill: '#ff4422' }).setOrigin(0.5).setDepth(50);
        this.add.text(200, 280, '< Exit >', { fontSize: '10px', fill: '#aaa' }).setOrigin(0.5).setDepth(50);
    }

    update() {
        if (!this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();

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

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            if (this.enemies.countActive() > 0) {
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

        if (!this.transitioning && this.player.y > 280) {
            this.transitioning = true;
            this.scene.start('LavaPit');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
