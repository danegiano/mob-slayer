class FrostGiant extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'frost_giant');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('frost_giant_idle');
        this.setScale(2);
        this.setCollideWorldBounds(true);

        this.health = 250;
        this.maxHealth = 250;
        this.isDead = false;
        this.isAttacking = false;
        this.currentAttack = null;
        this.playerHitThisAttack = false;

        this.healthBg = scene.add.rectangle(400, 50, 300, 20, 0x333333).setDepth(100);
        this.healthBar = scene.add.rectangle(400, 50, 300, 20, 0x4488ff).setDepth(101);
        this.nameText = scene.add.text(400, 30, 'FROST GIANT', {
            fontSize: '14px', fill: '#88ccff'
        }).setOrigin(0.5).setDepth(101);

        this.scheduleAttack();
    }

    scheduleAttack() {
        const delay = Phaser.Math.Between(2000, 3500);
        this.attackTimer = this.scene.time.delayedCall(delay, () => {
            if (this.isDead) return;
            this.doAttack();
        });
    }

    doAttack() {
        const attacks = ['slam', 'throw', 'breath'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.playerHitThisAttack = false;

        if (this.currentAttack === 'slam') {
            this.setTint(0x4488ff);
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                const wave = this.scene.add.rectangle(this.x, 410, 250, 15, 0x88ccff, 0.6);
                this.scene.time.delayedCall(400, () => wave.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'throw') {
            this.setTint(0xaaddff);
            this.scene.time.delayedCall(400, () => {
                if (this.isDead) return;
                const player = this.scene.player;
                const boulder = this.scene.add.rectangle(this.x, this.y, 20, 20, 0x88ccff, 0.8);
                this.scene.physics.add.existing(boulder, false);
                boulder.body.setAllowGravity(false);
                const dir = player.x > this.x ? 1 : -1;
                boulder.body.setVelocityX(dir * 300);
                boulder.body.setVelocityY(50);
                this.scene.time.delayedCall(1500, () => boulder.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'breath') {
            this.setTint(0x66bbff);
            const dir = this.flipX ? -1 : 1;
            const breathX = this.x + dir * 80;
            const breath = this.scene.add.rectangle(breathX, this.y, 100, 60, 0x88ccff, 0.4);
            this.scene.time.delayedCall(600, () => {
                if (this.isDead) return;
                breath.destroy();
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
