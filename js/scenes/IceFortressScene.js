class IceFortressScene extends Phaser.Scene {
    constructor() { super('IceFortress'); }

    preload() {
        this.load.image('ice-fortress-bg', 'assets/backgrounds/ice-fortress-bg.png');
    }

    create() {
        // Background image (covers the whole screen)
        this.add.image(400, 225, 'ice-fortress-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Enemies — Ice Wolves (harder wave)
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // 4 Ice Wolves — stronger than Tundra wave
        for (let i = 0; i < 4; i++) {
            const x = 250 + i * 130;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 20);
            enemy.speed = 110;
            enemy.aggroRange = 300;
            enemy.damage = 10;
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        // Scene title
        this.add.text(400, 50, 'Ice Fortress', {
            fontSize: '20px', fill: '#4488ff'
        }).setOrigin(0.5);
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

        // Exit right when all enemies defeated
        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('FrostGiantArena');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
