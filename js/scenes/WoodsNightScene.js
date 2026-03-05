class WoodsNightScene extends Phaser.Scene {
    constructor() { super('WoodsNight'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a2a');

        this.ground = this.add.rectangle(400, 430, 800, 40, 0x1a1a1a);
        this.physics.add.existing(this.ground, true);

        // Dark trees
        for (let i = 0; i < 5; i++) {
            const tx = 100 + i * 170;
            this.add.rectangle(tx, 350, 20, 80, 0x2a1a0a);
            this.add.circle(tx, 300, 35, 0x0a2a0a);
        }

        this.player = new Player(this, 30, 350);
        this.player.attackDamage = 25; // player has slayer sword by this point
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // Spawn 4 night goblins
        for (let i = 0; i < 4; i++) {
            const x = 300 + i * 120;
            const enemy = new Enemy(this, x, 350, 'night_goblin', 20);
            this.enemies.add(enemy);
        }

        // Exit right -> boss (only after killing all enemies)
        this.exitRight = this.add.zone(790, 225, 20, 450);
        this.physics.add.existing(this.exitRight, true);
        this.physics.add.overlap(this.player, this.exitRight, () => {
            if (this.enemies.countActive() === 0) {
                this.scene.start('BossArena');
            }
        });

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

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
