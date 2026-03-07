class HollowTreeScene extends Phaser.Scene {
    constructor() { super('HollowTree'); }

    preload() {
        this.load.image('hollow-tree-bg', 'assets/backgrounds/hollow-tree-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'hollow-tree-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Enemies — 8 tougher Shadow Beasts
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 8; i++) {
            const x = 120 + i * 80;
            const enemy = new Enemy(this, x, 340, 'shadow_beast', 20);
            enemy.speed = 140;
            enemy.aggroRange = 300;
            enemy.damage = 18;
            enemy.goldValue = 10;
            this.enemies.add(enemy);
        }

        // Quest status text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Hollow Tree', {
            fontSize: '20px', fill: '#88ff88'
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

        // Clear-all quest: check if all enemies defeated
        if (this.enemies.countActive() === 0 && !GameState.quests.darkforest.nest) {
            GameState.quests.darkforest.nest = true;
        }

        // Quest status display
        if (GameState.quests.darkforest.nest) {
            this.questText.setText('Shadow Nest: Cleared!');
        } else {
            const remaining = this.enemies.countActive();
            this.questText.setText('Clear the Nest: ' + remaining + ' beasts remaining');
        }

        // Exit left → Cursed Swamp
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('CursedSwamp');
        }

        // Exit right → Shadow Keep
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('ShadowKeep');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
