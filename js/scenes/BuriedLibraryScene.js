class BuriedLibraryScene extends Phaser.Scene {
    constructor() { super('BuriedLibrary'); }

    preload() {
        this.load.image('buried-library-bg', 'assets/backgrounds/buried-library-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'buried-library-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // E key for picking up scroll
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 6 Stone Golems
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 6; i++) {
            const x = 150 + i * 100;
            const enemy = new Enemy(this, x, 340, 'stone_golem', 50);
            enemy.speed = 40;
            enemy.aggroRange = 180;
            enemy.damage = 20;
            enemy.goldValue = 12;
            this.enemies.add(enemy);
        }

        // Collectible scroll at x=650 (only if quest not done)
        this.scroll = null;
        if (!GameState.quests.ruins.scroll) {
            this.scroll = this.physics.add.sprite(650, 390, 'collectible');
            this.scroll.play('collectible_idle');
            this.scroll.setScale(2);
            this.physics.add.collider(this.scroll, this.ground);
        }

        // Pickup prompt
        this.pickupPrompt = this.add.text(650, 360, 'Press E to pick up', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Buried Library', {
            fontSize: '20px', fill: '#ddaa44'
        }).setOrigin(0.5);

        this.transitioning = false;
    }

    update() {
        this.player.update();
        this.hud.update();

        // Update enemies
        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        // Player attack hitting enemies
        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Scroll pickup
        if (this.scroll && !GameState.quests.ruins.scroll) {
            const scrollDist = Math.abs(this.player.x - this.scroll.x);
            this.pickupPrompt.setVisible(scrollDist < 80);

            if (scrollDist < 80 && Phaser.Input.Keyboard.JustDown(this.eKey)) {
                GameState.quests.ruins.scroll = true;
                this.scroll.destroy();
                this.scroll = null;
                this.pickupPrompt.setVisible(false);

                // Show pickup text
                const pickText = this.add.text(400, 200, 'Ancient Scroll Found!', {
                    fontSize: '24px', fill: '#ffdd00'
                }).setOrigin(0.5).setDepth(50);
                this.tweens.add({
                    targets: pickText,
                    alpha: 0, y: 170,
                    duration: 2000, delay: 1000,
                    onComplete: () => pickText.destroy()
                });
            }
        } else {
            this.pickupPrompt.setVisible(false);
        }

        // Exit left → Crumbling Bridge
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('CrumblingBridge');
        }

        // Exit right → Lava Pit
        if (!this.transitioning && this.player.x > 750) {
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
