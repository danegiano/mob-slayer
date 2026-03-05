class TestScene extends Phaser.Scene {
    constructor() { super('TestScene'); }

    create() {
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x4a7a2e);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 100, 350);
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        // Enemy group
        this.enemies = this.physics.add.group();
        const enemy = new Enemy(this, 600, 350, 'goblin', 30);
        this.enemies.add(enemy);
        this.physics.add.collider(this.enemies, this.ground);
    }

    update() {
        this.player.update();
        this.hud.update();

        // Update enemies
        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        // Check player attack hitting enemies
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

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
