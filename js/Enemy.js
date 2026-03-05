class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, health) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play(type + '_idle');
        this.setCollideWorldBounds(true);
        this.setScale(2);

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
            if (this.x < player.x) {
                this.setVelocityX(this.speed);
                this.setFlipX(false);
            } else {
                this.setVelocityX(-this.speed);
                this.setFlipX(true);
            }

            if (dist < this.attackRange && !this.attackCooldown) {
                this.attackPlayer(player);
            }
        } else {
            this.setVelocityX(0);
        }
    }

    attackPlayer(player) {
        if (player.isDodging) return;
        this.attackCooldown = true;

        GameState.health -= this.damage;
        if (GameState.health < 0) GameState.health = 0;

        const knockDir = player.x > this.x ? 200 : -200;
        player.setVelocityX(knockDir);
        player.setVelocityY(-150);
        player.setTint(0xff0000);
        player.scene.time.delayedCall(200, () => player.clearTint());

        this.scene.time.delayedCall(1000, () => {
            this.attackCooldown = false;
        });
    }
}
