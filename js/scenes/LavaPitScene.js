class LavaPitScene extends Phaser.Scene {
    constructor() { super('LavaPit'); }

    preload() {
        this.load.image('lava-pit-bg', 'assets/backgrounds/lava-pit-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'lava-pit-bg');

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

        // E key for activating rune stones
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 7 tougher Stone Golems
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 7; i++) {
            const x = 150 + i * 85;
            const enemy = new Enemy(this, x, 340, 'stone_golem', 70);
            enemy.speed = 50;
            enemy.aggroRange = 200;
            enemy.damage = 25;
            enemy.goldValue = 15;
            this.enemies.add(enemy);
        }

        // 3 Rune stones at x=250, 450, 650 (only if quest not done)
        this.runeStones = [];
        this.runesActivated = 0;
        if (!GameState.quests.ruins.runes) {
            const runePositions = [250, 450, 650];
            runePositions.forEach(rx => {
                const rune = this.physics.add.sprite(rx, 390, 'collectible');
                rune.play('collectible_idle');
                rune.setScale(2);
                rune.activated = false;
                this.physics.add.collider(rune, this.ground);
                this.runeStones.push(rune);
            });
        }

        // Activate prompt
        this.activatePrompt = this.add.text(400, 360, 'Press E to activate', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Quest status text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Lava Pit', {
            fontSize: '20px', fill: '#ff6644'
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

        // Rune stone activation
        let nearRune = null;
        this.runeStones.forEach(rune => {
            if (rune.activated) return;
            const dist = Math.abs(this.player.x - rune.x);
            if (dist < 80) {
                nearRune = rune;
            }
        });

        if (nearRune && !GameState.quests.ruins.runes) {
            this.activatePrompt.setPosition(nearRune.x, nearRune.y - 30);
            this.activatePrompt.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                nearRune.activated = true;
                nearRune.setTint(0x00ff00);
                this.runesActivated++;

                // Check if all 3 runes activated
                if (this.runesActivated >= 3) {
                    GameState.quests.ruins.runes = true;

                    // Show completion text
                    const doneText = this.add.text(400, 200, 'All Runes Activated!', {
                        fontSize: '24px', fill: '#00ff00'
                    }).setOrigin(0.5).setDepth(50);
                    this.tweens.add({
                        targets: doneText,
                        alpha: 0, y: 170,
                        duration: 2000, delay: 1000,
                        onComplete: () => doneText.destroy()
                    });
                }
            }
        } else {
            this.activatePrompt.setVisible(false);
        }

        // Quest status display
        if (GameState.quests.ruins.runes) {
            this.questText.setText('Rune Stones: All Sealed!');
        } else {
            this.questText.setText('Rune Stones: ' + this.runesActivated + '/3 activated');
        }

        // Exit left → Buried Library
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('BuriedLibrary');
        }

        // Exit right → Shattered Temple
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('ShatteredTemple');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
