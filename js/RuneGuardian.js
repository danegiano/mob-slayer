class RuneGuardian extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'rune_guardian');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('rune_guardian_idle');
        this.setScale(1);
        this.setCollideWorldBounds(true);
        this.body.setSize(60, 60);
        this.body.setOffset(18, 28);

        this.health = 350;
        this.maxHealth = 350;
        this.isDead = false;
        this.isAttacking = false;
        this.currentAttack = null;
        this.playerHitThisAttack = false;

        this.healthBg = scene.add.rectangle(400, 50, 300, 20, 0x333333).setDepth(100);
        this.healthBar = scene.add.rectangle(400, 50, 300, 20, 0xffaa00).setDepth(101);
        this.nameText = scene.add.text(400, 30, 'RUNE GUARDIAN', {
            fontSize: '14px', fill: '#ffcc44'
        }).setOrigin(0.5).setDepth(101);

        this.scheduleAttack();
    }

    scheduleAttack() {
        const delay = Phaser.Math.Between(1500, 3000);
        this.attackTimer = this.scene.time.delayedCall(delay, () => {
            if (this.isDead) return;
            this.doAttack();
        });
    }

    doAttack() {
        const attacks = ['beam', 'wall', 'pound'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.playerHitThisAttack = false;

        if (this.currentAttack === 'beam') {
            this.setTint(0xffaa00);
            this.scene.time.delayedCall(400, () => {
                if (this.isDead) return;
                const dir = this.scene.player.x > this.x ? 1 : -1;
                const beam = this.scene.add.rectangle(
                    this.x + dir * 200, this.y, 400, 10, 0xffaa00, 0.7
                );
                this.scene.time.delayedCall(300, () => beam.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'wall') {
            this.setTint(0x888888);
            this.scene.time.delayedCall(300, () => {
                if (this.isDead) return;
                const wallX = (this.x + this.scene.player.x) / 2;
                const wall = this.scene.add.rectangle(wallX, 350, 20, 100, 0x666666, 0.8);
                this.scene.time.delayedCall(2000, () => wall.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'pound') {
            this.setTint(0xff6600);
            this.scene.time.delayedCall(600, () => {
                if (this.isDead) return;
                const shock = this.scene.add.rectangle(this.x, 410, 300, 20, 0xff6600, 0.5);
                this.scene.tweens.add({
                    targets: shock,
                    scaleX: 2, alpha: 0,
                    duration: 500,
                    onComplete: () => shock.destroy()
                });
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        }
    }

    applyBurn(scene) {
        if (this.isDead || this.isBurning) return;
        this.isBurning = true;
        this.setTint(0xFF6600);
        let ticks = 0;
        const burnTimer = scene.time.addEvent({
            delay: 1000,
            repeat: 2,
            callback: () => {
                if (this.isDead) { burnTimer.remove(); return; }
                this.takeDamage(3);
                ticks++;
                if (ticks >= 3) {
                    this.isBurning = false;
                    if (!this.isDead) this.clearTint();
                }
            }
        });
    }

    applyFreeze(scene) {
        if (this.isDead || this.isFrozen) return;
        this.isFrozen = true;
        this.setTint(0x44AAFF);
        scene.time.delayedCall(1000, () => {
            this.isFrozen = false;
            if (!this.isDead) this.clearTint();
        });
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) this.clearTint();
        });
        const ratio = this.health / this.maxHealth;
        this.healthBar.width = 300 * ratio;
        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true;
        if (this.attackTimer) this.attackTimer.remove();
        this.scene.tweens.add({
            targets: this, alpha: 0, duration: 1000,
            onComplete: () => {
                this.healthBg.destroy();
                this.healthBar.destroy();
                this.nameText.destroy();
                this.destroy();
            }
        });
    }
}
