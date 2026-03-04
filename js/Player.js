class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Create a blue rectangle texture for the player
        const gfx = scene.add.graphics();
        gfx.fillStyle(0x3366ff);
        gfx.fillRect(0, 0, 32, 48);
        gfx.generateTexture('player', 32, 48);
        gfx.destroy();

        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(32, 48);

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.moveSpeed = 200;
        this.jumpSpeed = -400;
        this.facing = 'right';

        // Attack
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.isAttacking = false;
        this.attackTimer = null;
        this.attackDamage = 10; // wood sword damage
        this.attackHitbox = null;
        this.currentHitDamage = 10;
        this.isHurt = false;
    }

    attack() {
        if (this.isAttacking) return;
        this.isAttacking = true;

        this.currentHitDamage = this.attackDamage;

        // Visual feedback — flash white briefly
        this.setTint(0xffffff);

        // Create a hitbox in front of the player
        const offsetX = this.facing === 'right' ? 30 : -30;
        this.attackHitbox = this.scene.add.rectangle(this.x + offsetX, this.y, 24, 40);
        this.scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);

        // Remove hitbox after short delay
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

        // Horizontal movement
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

        // Jump — only when on the ground
        if (jump && this.body.onFloor()) {
            this.setVelocityY(this.jumpSpeed);
        }

        // Attack
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.attack();
        }
    }
}
