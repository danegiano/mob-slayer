class MushroomGroveScene extends Phaser.Scene {
    constructor() { super('MushroomGrove'); }

    preload() {
        this.load.image('mushroom-grove-bg', 'assets/backgrounds/mushroom-grove-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'mushroom-grove-bg');

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

        // E key for picking up mushrooms
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 5 Shadow Beasts
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 5; i++) {
            const x = 150 + i * 130;
            const enemy = new Enemy(this, x, 340, 'shadow_beast', 12);
            enemy.speed = 120;
            enemy.aggroRange = 250;
            enemy.damage = 15;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        }

        // Collectible mushrooms at x=250, 450, 650 (only if quest not done)
        this.mushrooms = [];
        this.mushroomsCollected = 0;
        if (!GameState.quests.darkforest.mushrooms) {
            const positions = [250, 450, 650];
            positions.forEach(x => {
                const mush = this.physics.add.sprite(x, 390, 'collectible');
                mush.play('collectible_idle');
                mush.setScale(2);
                this.physics.add.collider(mush, this.ground);
                this.mushrooms.push(mush);
            });
        }

        // Pickup prompt
        this.pickupPrompt = this.add.text(400, 360, 'Press E to pick up', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Quest progress text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Mushroom Grove', {
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

        // Mushroom pickup — find nearest mushroom within 80px
        let nearestMush = null;
        let nearestDist = Infinity;
        this.mushrooms.forEach(mush => {
            if (!mush.active) return;
            const dist = Math.abs(this.player.x - mush.x);
            if (dist < 80 && dist < nearestDist) {
                nearestDist = dist;
                nearestMush = mush;
            }
        });

        if (nearestMush) {
            this.pickupPrompt.setPosition(nearestMush.x, nearestMush.y - 30);
            this.pickupPrompt.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                nearestMush.destroy();
                this.mushroomsCollected++;

                // Show pickup text
                const pickText = this.add.text(400, 200, 'Mushroom ' + this.mushroomsCollected + '/3!', {
                    fontSize: '24px', fill: '#ffdd00'
                }).setOrigin(0.5).setDepth(50);
                this.tweens.add({
                    targets: pickText,
                    alpha: 0, y: 170,
                    duration: 2000, delay: 1000,
                    onComplete: () => pickText.destroy()
                });

                // Check if all 3 collected
                if (this.mushroomsCollected >= 3) {
                    GameState.quests.darkforest.mushrooms = true;
                }
            }
        } else {
            this.pickupPrompt.setVisible(false);
        }

        // Quest progress display
        if (GameState.quests.darkforest.mushrooms) {
            this.questText.setText('Mushrooms: Complete!');
        } else {
            this.questText.setText('Mushrooms: ' + this.mushroomsCollected + '/3 collected');
        }

        // Exit left → Forest Village
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('ForestVillage');
        }

        // Exit right → Cursed Swamp
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('CursedSwamp');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
