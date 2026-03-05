class WoodsNightScene extends Phaser.Scene {
    constructor() { super('WoodsNight'); }

    preload() {
        this.load.image('woods-night-bg', 'assets/backgrounds/woods-night-bg.png');
    }

    create() {
        // Background image (covers the whole screen)
        this.add.image(400, 225, 'woods-night-bg');

        // Invisible ground for physics — matches ground in background
        this.ground = this.add.rectangle(400, 420, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25; // player has slayer sword by this point
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // Spawn 4 night goblins
        for (let i = 0; i < 4; i++) {
            const x = 300 + i * 120;
            const enemy = new Enemy(this, x, 340, 'night_goblin', 20);
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        this.add.text(400, 50, 'The woods are cursed...', {
            fontSize: '20px', fill: '#ff4444'
        }).setOrigin(0.5);
    }

    update() {
        this.player.update();
        this.hud.update();

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

        // Exit right — walk to right edge after killing all enemies
        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('BossArena');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
