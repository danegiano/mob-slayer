class TrollBoss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        const gfx = scene.add.graphics();
        gfx.fillStyle(0xcc2222);
        gfx.fillRect(0, 0, 64, 80);
        gfx.generateTexture('troll', 64, 80);
        gfx.destroy();

        super(scene, x, y, 'troll');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(64, 80);

        this.health = 200;
        this.maxHealth = 200;
        this.damage = 20;
        this.isAttacking = false;
        this.isHit = false;
        this.currentAttack = null;
        this.attackCooldown = false;
        this.slamHitbox = null;
        this.swingHitbox = null;

        this.hpBarBg = scene.add.rectangle(400, 60, 300, 16, 0x660000)
            .setScrollFactor(0).setDepth(100);
        this.hpBarFill = scene.add.rectangle(400, 60, 300, 16, 0xcc0000)
            .setScrollFactor(0).setDepth(101);
        this.hpLabel = scene.add.text(400, 60, 'TROLL', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    }

    update(playerX) {
        if (this.isHit || this.isAttacking) return;

        const speed = 50;
        if (playerX < this.x - 40) {
            this.setVelocityX(-speed);
        } else if (playerX > this.x + 40) {
            this.setVelocityX(speed);
        } else {
            this.setVelocityX(0);
        }

        if (!this.attackCooldown) {
            const dist = Math.abs(playerX - this.x);
            if (dist < 120) {
                this.chooseAttack(playerX);
            }
        }

        const pct = this.health / this.maxHealth;
        this.hpBarFill.setScale(pct, 1);
        this.hpBarFill.setX(400 - (1 - pct) * 150);
    }

    chooseAttack(playerX) {
        this.attackCooldown = true;
        const attacks = ['slam', 'swing', 'charge'];
        this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
        this.isAttacking = true;
        this.setVelocityX(0);

        switch (this.currentAttack) {
            case 'slam': this.doSlam(); break;
            case 'swing': this.doSwing(); break;
            case 'charge': this.doCharge(playerX); break;
        }

        this.scene.time.delayedCall(2000, () => {
            this.attackCooldown = false;
        });
    }

    doSlam() {
        this.setTint(0xff8800);
        const warn = this.scene.add.text(this.x, this.y - 60, 'SLAM!', {
            fontSize: '16px', fill: '#ff8800'
        }).setOrigin(0.5);

        this.scene.time.delayedCall(500, () => {
            this.slamHitbox = this.scene.add.rectangle(this.x, 410, 160, 30);
            this.scene.physics.add.existing(this.slamHitbox, false);
            this.slamHitbox.body.setAllowGravity(false);
            this.scene.cameras.main.shake(200, 0.01);

            this.scene.time.delayedCall(300, () => {
                if (this.slamHitbox) this.slamHitbox.destroy();
                this.slamHitbox = null;
                warn.destroy();
                this.clearTint();
                this.isAttacking = false;
            });
        });
    }

    doSwing() {
        this.setTint(0xff4444);
        const warn = this.scene.add.text(this.x, this.y - 60, 'SWING!', {
            fontSize: '16px', fill: '#ff4444'
        }).setOrigin(0.5);

        this.scene.time.delayedCall(400, () => {
            this.swingHitbox = this.scene.add.rectangle(this.x, 400, 200, 20);
            this.scene.physics.add.existing(this.swingHitbox, false);
            this.swingHitbox.body.setAllowGravity(false);

            this.scene.time.delayedCall(300, () => {
                if (this.swingHitbox) this.swingHitbox.destroy();
                this.swingHitbox = null;
                warn.destroy();
                this.clearTint();
                this.isAttacking = false;
            });
        });
    }

    doCharge(playerX) {
        this.setTint(0xffff00);
        const warn = this.scene.add.text(this.x, this.y - 60, 'CHARGE!', {
            fontSize: '16px', fill: '#ffff00'
        }).setOrigin(0.5);

        this.scene.time.delayedCall(600, () => {
            const dir = playerX < this.x ? -1 : 1;
            this.setVelocityX(dir * 350);

            this.scene.time.delayedCall(800, () => {
                this.setVelocityX(0);
                warn.destroy();
                this.clearTint();
                this.isAttacking = false;
            });
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        this.isHit = true;
        this.setTint(0xffffff);
        this.setVelocityX(0);

        this.scene.time.delayedCall(300, () => {
            this.isHit = false;
            this.clearTint();
        });

        if (this.health <= 0) {
            this.hpBarBg.destroy();
            this.hpBarFill.destroy();
            this.hpLabel.destroy();
            this.destroy();
            return true;
        }
        return false;
    }
}
