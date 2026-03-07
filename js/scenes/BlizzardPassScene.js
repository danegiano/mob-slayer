class BlizzardPassScene extends Phaser.Scene {
    constructor() { super('BlizzardPass'); }

    preload() {
        this.load.image('blizzard-pass-bg', 'assets/backgrounds/blizzard-pass-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'blizzard-pass-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Enemies — 7 tougher Ice Wolves
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 7; i++) {
            const x = 150 + i * 85;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 25);
            enemy.speed = 120;
            enemy.aggroRange = 300;
            enemy.damage = 12;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        }

        // Quest status text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Blizzard Pass', {
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
                    this.player.applySwordEffect(enemy, this.enemies);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Clear-all quest: check if all enemies defeated
        if (this.enemies.countActive() === 0 && !GameState.quests.tundra.blizzard) {
            GameState.quests.tundra.blizzard = true;
        }

        // Quest status display
        if (GameState.quests.tundra.blizzard) {
            this.questText.setText('Blizzard Pass: Cleared!');
        } else {
            const remaining = this.enemies.countActive();
            this.questText.setText('Clear the Pass: ' + remaining + ' wolves remaining');
        }

        // Exit left → Snow Cave
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('SnowCave');
        }

        // Exit right → Ice Fortress
        if (!this.transitioning && this.player.x > 750) {
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
