class SnowCaveScene extends Phaser.Scene {
    constructor() { super('SnowCave'); }

    preload() {
        this.load.image('snow-cave-bg', 'assets/backgrounds/snow-cave-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'snow-cave-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // E key for picking up amulet
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 5 Ice Wolves
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 5; i++) {
            const x = 200 + i * 110;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 15);
            enemy.speed = 100;
            enemy.aggroRange = 250;
            enemy.damage = 8;
            enemy.goldValue = 5;
            this.enemies.add(enemy);
        }

        // Collectible amulet at x=650 (only if quest not done)
        this.amulet = null;
        if (!GameState.quests.tundra.amulet) {
            this.amulet = this.physics.add.sprite(650, 390, 'collectible');
            this.amulet.play('collectible_idle');
            this.amulet.setScale(2);
            this.physics.add.collider(this.amulet, this.ground);
        }

        // Pickup prompt
        this.pickupPrompt = this.add.text(650, 360, 'Press E to pick up', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Snow Cave', {
            fontSize: '20px', fill: '#aaddff'
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

        // Amulet pickup
        if (this.amulet && !GameState.quests.tundra.amulet) {
            const amuletDist = Math.abs(this.player.x - this.amulet.x);
            this.pickupPrompt.setVisible(amuletDist < 80);

            if (amuletDist < 80 && Phaser.Input.Keyboard.JustDown(this.eKey)) {
                GameState.quests.tundra.amulet = true;
                this.amulet.destroy();
                this.amulet = null;
                this.pickupPrompt.setVisible(false);

                // Show pickup text
                const pickText = this.add.text(400, 200, 'Ancient Amulet Found!', {
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

        // Exit left → Frozen Lake
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('FrozenLake');
        }

        // Exit right → Blizzard Pass
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('BlizzardPass');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
