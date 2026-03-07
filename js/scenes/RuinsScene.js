class RuinsScene extends Phaser.Scene {
    constructor() { super('Ruins'); }

    preload() {
        this.load.image('ruins-bg', 'assets/backgrounds/ruins-bg.png');
    }

    create() {
        this.add.image(400, 225, 'ruins-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 3; i++) {
            const x = 300 + i * 150;
            const enemy = new Enemy(this, x, 340, 'stone_golem', 50);
            enemy.speed = 40;
            enemy.aggroRange = 180;
            enemy.damage = 20;
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        this.add.text(400, 50, 'Ancient Ruins', {
            fontSize: '20px', fill: '#ccaa66'
        }).setOrigin(0.5);
    }

    update() {
        this.player.update();
        this.hud.update();

        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

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

        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('ShatteredTemple');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
