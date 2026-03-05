class ShadowLord extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'shadow_lord');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('shadow_lord_idle');
        this.setScale(2);
        this.setCollideWorldBounds(true);

        this.health = 300;
        this.maxHealth = 300;
        this.isDead = false;
        this.isAttacking = false;
        this.currentAttack = null;
        this.playerHitThisAttack = false;

        this.healthBg = scene.add.rectangle(400, 50, 300, 20, 0x333333).setDepth(100);
        this.healthBar = scene.add.rectangle(400, 50, 300, 20, 0x9944ff).setDepth(101);
        this.nameText = scene.add.text(400, 30, 'SHADOW LORD', {
            fontSize: '14px', fill: '#cc88ff'
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
        const attacks = ['split', 'dash', 'summon'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.playerHitThisAttack = false;

        if (this.currentAttack === 'split') {
            this.setTint(0x9944ff);
            const copy1 = this.scene.add.rectangle(this.x - 80, this.y, 40, 60, 0x9944ff, 0.5);
            const copy2 = this.scene.add.rectangle(this.x + 80, this.y, 40, 60, 0x9944ff, 0.5);
            this.scene.time.delayedCall(2000, () => {
                copy1.destroy();
                copy2.destroy();
            });
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                this.clearTint();
                this.isAttacking = false;
                this.scheduleAttack();
            });
        } else if (this.currentAttack === 'dash') {
            this.setTint(0x6622cc);
            this.setAlpha(0.3);
            const player = this.scene.player;
            const targetX = player.x > this.x ? player.x + 100 : player.x - 100;
            this.scene.tweens.add({
                targets: this,
                x: Phaser.Math.Clamp(targetX, 50, 750),
                duration: 300,
                onComplete: () => {
                    if (this.isDead) return;
                    this.setAlpha(1);
                    this.clearTint();
                    this.isAttacking = false;
                    this.scheduleAttack();
                }
            });
        } else if (this.currentAttack === 'summon') {
            this.setTint(0xff44ff);
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                if (this.scene.enemies) {
                    const sx = Phaser.Math.Between(200, 600);
                    const enemy = new Enemy(this.scene, sx, 340, 'shadow_beast', 10);
                    enemy.speed = 120;
                    enemy.aggroRange = 300;
                    enemy.damage = 12;
                    this.scene.enemies.add(enemy);
                    this.scene.physics.add.collider(enemy, this.scene.ground);
                }
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
