class BossArenaScene extends Phaser.Scene {
    constructor() { super('BossArena'); }

    create() {
        this.cameras.main.setBackgroundColor('#1a0a0a');

        this.ground = this.add.rectangle(400, 430, 800, 40, 0x2a1a1a);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 100, 350);
        this.player.attackDamage = 25; // has slayer sword
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);

        this.boss = new TrollBoss(this, 600, 300);
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
