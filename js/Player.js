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
    }

    attack() {
        if (this.isAttacking) return;
        this.isAttacking = true;

        this.setTint(0xffffff);

        const offsetX = this.facing === 'right' ? 50 : -50;
        this.attackHitbox = this.scene.add.rectangle(
            this.x + offsetX, this.y, 24, 40, 0xffffff, 0.3
        );
        this.scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);

        this.scene.time.delayedCall(150, () => {
            if (this.attackHitbox) {
                this.attackHitbox.destroy();
                this.attackHitbox = null;
            }
            this.clearTint();
            this.isAttacking = false;
        });
    }

    update() {
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

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.attack();
        }
    }
}
