class CrumblingBridgeScene extends Phaser.Scene {
    constructor() { super('CrumblingBridge'); }

    preload() {
        this.load.image('crumbling-bridge-bg', 'assets/backgrounds/crumbling-bridge-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'crumbling-bridge-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Enemies — 5 Stone Golems
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 5; i++) {
            const x = 200 + i * 110;
            const enemy = new Enemy(this, x, 340, 'stone_golem', 50);
            enemy.speed = 40;
            enemy.aggroRange = 180;
            enemy.damage = 20;
            enemy.goldValue = 12;
            this.enemies.add(enemy);
        }

        // Quest status text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Crumbling Bridge', {
            fontSize: '20px', fill: '#ddaa44'
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
        if (this.enemies.countActive() === 0 && !GameState.quests.ruins.bridge) {
            GameState.quests.ruins.bridge = true;
        }

        // Quest status display
        if (GameState.quests.ruins.bridge) {
            this.questText.setText('Crumbling Bridge: Cleared!');
        } else {
            const remaining = this.enemies.countActive();
            this.questText.setText('Clear the Bridge: ' + remaining + ' golems remaining');
        }

        // Exit left → Ruins Village
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('RuinsVillage');
        }

        // Exit right → Buried Library
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('BuriedLibrary');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
