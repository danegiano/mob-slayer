class BossArenaScene extends Phaser.Scene {
    constructor() { super('BossArena'); }

    create() {
        this.cameras.main.setBackgroundColor('#2a0a0a');

        this.ground = this.add.rectangle(400, 430, 800, 40, 0x4a2a1a);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 100, 350);
        this.physics.add.collider(this.player, this.ground);

        this.boss = new TrollBoss(this, 600, 350);
        this.physics.add.collider(this.boss, this.ground);

        this.hud = new HUD(this);

        this.add.text(16, 16, 'Boss Arena', { fontSize: '18px', fill: '#cc4444' });

        this.dialogue = new DialogueBox(this);
        this.dialogue.open([
            "A massive troll blocks your path!",
            "Its eyes glow with the same curse...",
            "Fight!"
        ]);

        this.bossDefeated = false;
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

        if (this.boss && this.boss.active) {
            this.boss.update(this.player.x);

            if (!this.player.isDodging && !this.player.isHurt) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    this.boss.x, this.boss.y
                );
                if (dist < 50) {
                    this.playerTakeDamage(this.boss.damage);
                }
            }

            ['slamHitbox', 'swingHitbox'].forEach(hb => {
                if (this.boss[hb] && !this.player.isDodging && !this.player.isHurt) {
                    const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
                        this.boss[hb].getBounds(),
                        this.player.getBounds()
                    );
                    if (overlap) {
                        this.playerTakeDamage(this.boss.damage);
                    }
                }
            });

            if (this.player.attackHitbox && !this.boss.isHit) {
                const overlap = Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.attackHitbox.getBounds(),
                    this.boss.getBounds()
                );
                if (overlap) {
                    const dead = this.boss.takeDamage(this.player.currentHitDamage || this.player.attackDamage);
                    if (dead) {
                        this.onBossDefeated();
                    }
                }
            }
        }
    }

    onBossDefeated() {
        if (this.bossDefeated) return;
        this.bossDefeated = true;

        this.cameras.main.flash(1000, 255, 255, 100);

        const glow = this.add.text(400, 200, 'モブスレイヤー', {
            fontSize: '48px', fill: '#ffdd00'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: glow,
            alpha: 1,
            scale: { from: 0.5, to: 1.5 },
            duration: 2000,
            onComplete: () => {
                GameState.comboUnlocked = true;
                this.dialogue.open([
                    "The troll falls!",
                    "The sword glows with ancient power...",
                    "モブスレイヤー — Slayer of the Mobs!",
                    "You feel new power coursing through you...",
                    "COMBO ATTACKS UNLOCKED!",
                    "Press ATTACK rapidly for a 3-hit combo!"
                ], () => {
                    this.scene.start('Victory');
                });
            }
        });
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
