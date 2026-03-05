class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('player_idle');
        this.setCollideWorldBounds(true);
        this.body.setSize(20, 44);
        this.setScale(2);

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.moveSpeed = 200;
        this.jumpSpeed = -450;
        this.facing = 'right';

        // Attack
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.isAttacking = false;
        this.attackHitbox = null;
        this.attackDamage = 10;
        this.currentHitDamage = this.attackDamage;

        // Combo
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboWindow = 400;

        // Dodge
        this.dodgeKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.isDodging = false;
        this.dodgeCooldown = false;
    }

    attack() {
        if (this.isAttacking) return;

        if (GameState.comboUnlocked) {
            this.comboCount++;
            if (this.comboCount > 3) this.comboCount = 1;
            if (this.comboTimer) this.comboTimer.remove();
            this.comboTimer = this.scene.time.delayedCall(this.comboWindow, () => {
                this.comboCount = 0;
            });
        } else {
            this.comboCount = 1;
        }

        this.isAttacking = true;

        let hitDamage = this.attackDamage;
        let hitboxWidth = 24;
        let hitColor = 0xffffff;

        if (this.comboCount === 2) {
            hitDamage = this.attackDamage * 1.2;
            hitboxWidth = 28;
            hitColor = 0xffff88;
        } else if (this.comboCount === 3) {
            hitDamage = this.attackDamage * 2;
            hitboxWidth = 36;
            hitColor = 0xff4400;
        }

        this.setTint(hitColor);
        this.currentHitDamage = hitDamage;

        const offsetX = this.facing === 'right' ? 50 : -50;
        this.attackHitbox = this.scene.add.rectangle(
            this.x + offsetX, this.y, hitboxWidth, 40, hitColor, 0.3
        );
        this.scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);

        if (this.comboCount === 3 && GameState.comboUnlocked) {
            const comboText = this.scene.add.text(this.x, this.y - 40, 'COMBO!', {
                fontSize: '16px', fill: '#ff4400'
            }).setOrigin(0.5);
            this.scene.tweens.add({
                targets: comboText,
                alpha: 0, y: this.y - 70,
                duration: 600,
                onComplete: () => comboText.destroy()
            });
        }

        const attackDuration = this.comboCount === 3 ? 250 : 150;
        this.scene.time.delayedCall(attackDuration, () => {
            if (this.attackHitbox) {
                this.attackHitbox.destroy();
                this.attackHitbox = null;
            }
            this.clearTint();
            this.isAttacking = false;
        });
    }

    dodge() {
        if (this.isDodging || this.dodgeCooldown) return;
        this.isDodging = true;
        this.dodgeCooldown = true;

        const dashSpeed = this.facing === 'right' ? 400 : -400;
        this.setVelocityX(dashSpeed);
        this.setAlpha(0.4);

        this.scene.time.delayedCall(200, () => {
            this.isDodging = false;
            this.setAlpha(1);
        });

        this.scene.time.delayedCall(500, () => {
            this.dodgeCooldown = false;
        });
    }

    update() {
        if (!this.isDodging) {
            const left = this.cursors.left.isDown || this.wasd.left.isDown;
            const right = this.cursors.right.isDown || this.wasd.right.isDown;
            const jump = this.cursors.up.isDown || this.wasd.up.isDown;

            if (left) {
                this.setVelocityX(-this.moveSpeed);
                this.setFlipX(true);
                this.facing = 'left';
            } else if (right) {
                this.setVelocityX(this.moveSpeed);
                this.setFlipX(false);
                this.facing = 'right';
            } else {
                this.setVelocityX(0);
            }

            if (jump && this.body.onFloor()) {
                this.setVelocityY(this.jumpSpeed);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.attack();
        }

        if (Phaser.Input.Keyboard.JustDown(this.dodgeKey)) {
            this.dodge();
        }
    }
}
