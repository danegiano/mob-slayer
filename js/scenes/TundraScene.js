class TundraScene extends Phaser.Scene {
    constructor() { super('Tundra'); }

    preload() {
        this.load.image('tundra-bg', 'assets/backgrounds/tundra-bg.png');
    }

    create() {
        // Background image (covers the whole screen)
        this.add.image(400, 225, 'tundra-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        // Enemies — Ice Wolves
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        // 3 Ice Wolves — fast, low health
        for (let i = 0; i < 3; i++) {
            const x = 300 + i * 150;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 35);
            enemy.speed = 100;
            enemy.aggroRange = 250;
            enemy.damage = 8;
            this.enemies.add(enemy);
        }

        this.transitioning = false;

        // Scene title
        this.add.text(400, 50, 'Frozen Tundra', {
            fontSize: '20px', fill: '#88ccff'
        }).setOrigin(0.5);
    }

    update() {
        if (!this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();

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
                    this.player.applySwordEffect(enemy, this.enemies);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Exit right when all enemies defeated
        if (!this.transitioning && this.player.x > 750 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('IceFortress');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
