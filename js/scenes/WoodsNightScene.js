class WoodsNightScene extends Phaser.Scene {
    constructor() { super('WoodsNight'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a3a');

        this.ground = this.add.rectangle(400, 430, 800, 40, 0x3a2a1a);
        this.physics.add.existing(this.ground, true);

        for (let i = 0; i < 6; i++) {
            const tx = 80 + i * 130;
            this.add.rectangle(tx, 340, 30, 120, 0x1a3a0e);
            this.add.rectangle(tx, 270, 70, 60, 0x0e2a08);
        }

        this.player = new Player(this, 50, 350);
        this.physics.add.collider(this.player, this.ground);

        this.enemies = this.add.group();
        this.spawnEnemies();

        this.physics.add.collider(this.enemies, this.ground);

        this.hud = new HUD(this);

        this.add.text(16, 16, 'The Dark Woods', { fontSize: '18px', fill: '#aa88cc' });

        this.dialogue = new DialogueBox(this);

        this.dialogue.open([
            "The woods are different at night...",
            "The animals — they're cursed! Their eyes glow red!",
            "Prepare to fight!"
        ]);

        this.exitRight = this.add.rectangle(800, 225, 20, 450, 0x000000, 0);
        this.physics.add.existing(this.exitRight, true);
        this.physics.add.overlap(this.player, this.exitRight, () => {
            if (this.enemies.countActive() === 0) {
                this.scene.start('BossArena');
            }
        });

        this.enemiesDefeatedOnce = false;
    }

    spawnEnemies() {
        const positions = [250, 400, 550, 680];
        positions.forEach(x => {
            const enemy = new Enemy(this, x, 380, 0x33cc33, 30, 10, 60, 'night_goblin');
            this.enemies.add(enemy);
            this.physics.add.collider(enemy, this.ground);
        });
    }

    update() {
        if (this.dialogue && this.dialogue.isOpen) {
            this.dialogue.update();
            this.player.setVelocityX(0);
            return;
        }

        this.player.update();
        this.hud.update();
        this.dialogue.update();

        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
            enemy.update(this.player.x);

            if (!this.player.isDodging && !this.player.isHurt && !enemy.isHit) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );
                if (dist < 30) {
                    this.playerTakeDamage(enemy.damage);
                }
            }
        });

        if (this.player.attackHitbox) {
            this.enemies.getChildren().forEach(enemy => {
                if (!enemy.active) return;
                const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.attackHitbox.getBounds(),
                    enemy.getBounds()
                );
                if (overlap && !enemy.isHit) {
                    enemy.takeDamage(this.player.currentHitDamage || this.player.attackDamage);
                }
            });
        }

        if (this.enemies.countActive() === 0 && !this.enemiesDefeatedOnce) {
            this.enemiesDefeatedOnce = true;
            this.dialogue.open([
                "The cursed creatures are defeated!",
                "But you sense something bigger deeper in the woods..."
            ]);
        }
    }

    playerTakeDamage(amount) {
        if (this.player.isHurt) return;
        this.player.isHurt = true;
        GameState.health = Math.max(0, GameState.health - amount);
        this.player.setTint(0xff0000);
        this.time.delayedCall(500, () => {
            this.player.isHurt = false;
            this.player.clearTint();
        });

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
