class FrostGiantArenaScene extends Phaser.Scene {
    constructor() { super('FrostGiantArena'); }

    preload() {
        this.load.image('frost-giant-arena-bg', 'assets/backgrounds/frost-giant-arena-bg.png');
    }

    create() {
        this.add.image(400, 225, 'frost-giant-arena-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 100, 340);
        this.player.attackDamage = 25;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.boss = new FrostGiant(this, 600, 280);
        this.physics.add.collider(this.boss, this.ground);

        this.bossDefeated = false;
    }

    update() {
        this.player.update();
        this.hud.update();

        // Player attack hitting boss
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

        // Boss defeated -> unlock ice power, go to dark forest
        if (this.boss && this.boss.isDead && !this.bossDefeated) {
            this.bossDefeated = true;
            GameState.swordPowers.push('ice');
            this.showPowerUnlock('氷', 'Ice Slash', 'DarkForest');
        }

        // Boss attacks hitting player
        if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, this.boss.x, this.boss.y
            );
            if (dist < 90 && !this.boss.playerHitThisAttack) {
                GameState.health -= 20;
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
            fontSize: '96px', fill: '#88ccff'
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
