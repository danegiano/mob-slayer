class ShadowLordArenaScene extends Phaser.Scene {
    constructor() { super('ShadowLordArena'); }

    preload() {
        this.load.image('shadow-lord-arena-bg', 'assets/backgrounds/shadow-lord-arena-bg.png');
    }

    create() {
        this.add.image(400, 225, 'shadow-lord-arena-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 100, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        this.boss = new ShadowLord(this, 600, 300);
        this.physics.add.collider(this.boss, this.ground);

        this.bossDefeated = false;
    }

    update() {
        this.player.update();
        this.hud.update();

        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        if (this.player.attackHitbox && this.boss && !this.boss.isDead) {
            const b1 = this.player.attackHitbox.getBounds();
            const b2 = this.boss.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                if (!this.boss.justHit) {
                    this.boss.takeDamage(this.player.currentHitDamage);
                    this.boss.justHit = true;
                    this.time.delayedCall(300, () => {
                        if (this.boss) this.boss.justHit = false;
                    });
                }
            }
        }

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

        if (this.boss && this.boss.isDead && !this.bossDefeated) {
            this.bossDefeated = true;
            GameState.swordPowers.push('shadow');
            this.showPowerUnlock('影', 'Shadow Strike', 'Ruins');
        }

        if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, this.boss.x, this.boss.y
            );
            if (dist < 80 && !this.boss.playerHitThisAttack) {
                GameState.health -= 25;
                if (GameState.health < 0) GameState.health = 0;
                this.boss.playerHitThisAttack = true;
                this.player.setTint(0xff0000);
                this.time.delayedCall(200, () => this.player.clearTint());
                this.time.delayedCall(500, () => {
                    if (this.boss) this.boss.playerHitThisAttack = false;
                });
            }
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }

    showPowerUnlock(kanji, powerName, nextScene) {
        const kanjiText = this.add.text(400, 150, kanji, {
            fontSize: '96px', fill: '#9944ff'
        }).setOrigin(0.5).setDepth(200);

        const nameText = this.add.text(400, 250, powerName + ' Unlocked!', {
            fontSize: '28px', fill: '#ffcc00'
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: [kanjiText, nameText],
            alpha: 0, y: '-=20',
            duration: 2000, delay: 2000,
            onComplete: () => {
                kanjiText.destroy();
                nameText.destroy();
                this.scene.start(nextScene);
            }
        });
    }
}
