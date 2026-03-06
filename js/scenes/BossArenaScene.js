class BossArenaScene extends Phaser.Scene {
    constructor() { super('BossArena'); }

    preload() {
        this.load.image('boss-arena-bg', 'assets/backgrounds/boss-arena-bg.png');
    }

    create() {
        // Background image (covers the whole screen)
        this.add.image(400, 225, 'boss-arena-bg');

        this.player = new Player(this, 150, 225);
        this.player.attackDamage = 25; // has slayer sword

        this.hud = new HUD(this);

        this.boss = new TrollBoss(this, 600, 225);

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

        // Boss defeated -> victory
        if (this.boss && this.boss.isDead && !this.bossDefeated) {
            this.bossDefeated = true;
            GameState.comboUnlocked = true;
            this.time.delayedCall(2000, () => {
                this.scene.start('Victory');
            });
        }

        // Boss attacks hitting player (distance-based during attacks)
        if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.boss.x, this.boss.y
            );
            if (dist < 80 && !this.boss.playerHitThisAttack) {
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

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
