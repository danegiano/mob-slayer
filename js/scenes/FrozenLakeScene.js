class FrozenLakeScene extends Phaser.Scene {
    constructor() { super('FrozenLake'); }

    preload() {
        this.load.image('frozen-lake-bg', 'assets/backgrounds/frozen-lake-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'frozen-lake-bg');

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

        // Enemies — 6 Ice Wolves
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 6; i++) {
            const x = 200 + i * 100;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 15);
            enemy.speed = 100;
            enemy.aggroRange = 250;
            enemy.damage = 8;
            enemy.goldValue = 5;
            this.enemies.add(enemy);
        }

        // Track kills for quest
        this.killCount = 0;

        // Quest progress text at bottom
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Frozen Lake', {
            fontSize: '20px', fill: '#88ccff'
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
                    const wasDead = enemy.isDead;
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });

                    // Count kill if enemy just died
                    if (!wasDead && enemy.isDead) {
                        this.killCount++;
                        if (this.killCount >= 5 && !GameState.quests.tundra.wolves) {
                            GameState.quests.tundra.wolves = true;
                        }
                    }
                }
            });
        }

        // Quest progress display
        if (GameState.quests.tundra.wolves) {
            this.questText.setText('Wolf Hunt: Complete!');
        } else {
            this.questText.setText('Wolf Hunt: ' + Math.min(this.killCount, 5) + '/5 wolves');
        }

        // Exit left → Tundra Village
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('TundraVillage');
        }

        // Exit right → Snow Cave
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('SnowCave');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
