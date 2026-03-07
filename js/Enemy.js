class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, health) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play(type + '_idle');
        this.setCollideWorldBounds(true);
        this.setScale(1);

        this.health = health || 30;
        this.maxHealth = this.health;
        this.damage = 10;
        this.speed = 60;
        this.aggroRange = 200;
        this.attackRange = 40;
        this.attackCooldown = false;
        this.isDead = false;
        this.goldValue = 5;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => this.clearTint());

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        GameState.gold += this.goldValue;

        // Floating gold text
        const goldText = this.scene.add.text(this.x, this.y - 20, '+' + this.goldValue + 'g', {
            fontSize: '12px', fill: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(50);
        this.scene.tweens.add({
            targets: goldText,
            y: goldText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => goldText.destroy()
        });

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 300,
            onComplete: () => this.destroy()
        });
    }

    update(player) {
        if (this.isDead || !player) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        if (dist < this.aggroRange) {
            // Chase on both axes
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocityX(Math.cos(angle) * this.speed);
            this.setVelocityY(Math.sin(angle) * this.speed);

            // Flip sprite based on horizontal direction
            this.setFlipX(player.x < this.x);

            if (dist < this.attackRange && !this.attackCooldown) {
                this.attackPlayer(player);
            }
        } else {
            this.setVelocityX(0);
            this.setVelocityY(0);
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
        const origSpeed = this.speed;
        this.speed = 0;
        scene.time.delayedCall(1000, () => {
            this.isFrozen = false;
            this.speed = origSpeed;
            if (!this.isDead) this.clearTint();
        });
    }

    attackPlayer(player) {
        if (player.isDodging) return;
        this.attackCooldown = true;

        const armor = ARMOR_DATA[GameState.equipment.armor];
        const reducedDamage = Math.round(this.damage * (1 - armor.reduction));
        GameState.health -= reducedDamage;
        if (GameState.health < 0) GameState.health = 0;

        // Knockback away from enemy in any direction
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        player.setVelocityX(Math.cos(angle) * 250);
        player.setVelocityY(Math.sin(angle) * 250);
        player.setTint(0xff0000);
        player.scene.time.delayedCall(200, () => player.clearTint());

        this.scene.time.delayedCall(1000, () => {
            this.attackCooldown = false;
        });
    }
}
