class TrollBoss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'troll');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('troll_idle');
        this.setScale(2);
        this.setCollideWorldBounds(true);

        this.health = 200;
        this.maxHealth = 200;
        this.isDead = false;
        this.isAttacking = false;
        this.currentAttack = null;

        // Boss health bar at top of screen
        this.healthBg = scene.add.rectangle(400, 50, 300, 20, 0x333333).setDepth(100);
        this.healthBar = scene.add.rectangle(400, 50, 300, 20, 0xcc0000).setDepth(101);
        this.nameText = scene.add.text(400, 30, 'TROLL BOSS', {
            fontSize: '14px', fill: '#fff'
        }).setOrigin(0.5).setDepth(101);

        this.scheduleAttack();
    }

    scheduleAttack() {
        const delay = Phaser.Math.Between(2000, 4000);
        this.attackTimer = this.scene.time.delayedCall(delay, () => {
            if (this.isDead) return;
            this.doAttack();
        });
    }

    doAttack() {
        const attacks = ['slam', 'swing', 'charge'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.playerHitThisAttack = false;

        if (this.currentAttack === 'slam') {
            this.setTint(0xff8800);
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                // Circular slam around the boss
                const wave = this.scene.add.circle(this.x, this.y, 100, 0xff4400, 0.3);
                this.scene.time.delayedCall(300, () => wave.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'swing') {
            this.setTint(0xffff00);
            this.scene.time.delayedCall(400, () => {
                if (this.isDead) return;
                // Swing toward the player's direction
                const player = this.scene.player;
                const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                const swingX = this.x + Math.cos(angle) * 80;
                const swingY = this.y + Math.sin(angle) * 80;
                const swing = this.scene.add.circle(swingX, swingY, 30, 0xffff00, 0.4);
                this.scene.time.delayedCall(200, () => swing.destroy());
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'charge') {
            this.setTint(0xff0000);
            const player = this.scene.player;
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocityX(Math.cos(angle) * 350);
            this.setVelocityY(Math.sin(angle) * 350);
            this.scene.time.delayedCall(800, () => {
                if (this.isDead) return;
                this.setVelocityX(0);
                this.setVelocityY(0);
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        }
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
            targets: this,
            alpha: 0, duration: 1000,
            onComplete: () => {
                this.healthBg.destroy();
                this.healthBar.destroy();
                this.nameText.destroy();
                this.destroy();
            }
        });
    }
}
