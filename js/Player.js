class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Create a blue rectangle texture for the player (only once)
        if (!scene.textures.exists('player')) {
            const gfx = scene.add.graphics();
            gfx.fillStyle(0x3366ff);
            gfx.fillRect(0, 0, 32, 48);
            gfx.generateTexture('player', 32, 48);
            gfx.destroy();
        }

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
        this.attackDamage = GameState.weapon === 'slayer' ? 25 : 10;
        this.attackHitbox = null;
        this.currentHitDamage = 10;
        this.comboCount = 0;
        this.comboTimer = null;
        this.comboWindow = 400; // ms to press next attack in combo
        this.isHurt = false;

        // Dodge
        this.dodgeKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.isDodging = false;
        this.dodgeCooldown = false;
    }

    attack() {
        if (this.isAttacking) return;

        // If combos unlocked, track combo chain
        if (GameState.comboUnlocked) {
            this.comboCount++;
            if (this.comboCount > 3) this.comboCount = 1;

            // Reset combo timer
            if (this.comboTimer) this.comboTimer.remove();
            this.comboTimer = this.scene.time.delayedCall(this.comboWindow, () => {
                this.comboCount = 0;
            });
        } else {
            this.comboCount = 1; // always first hit when no combos
        }

        this.isAttacking = true;

        // Visual feedback based on combo hit
        let hitDamage = this.attackDamage;
        let hitboxWidth = 24;
        let hitColor = 0xffffff;

        if (this.comboCount === 2) {
            hitDamage = this.attackDamage * 1.2;
            hitboxWidth = 28;
            hitColor = 0xffff88;
        } else if (this.comboCount === 3) {
            hitDamage = this.attackDamage * 2; // BIG swing
            hitboxWidth = 36;
            hitColor = 0xff4400;
        }

        this.setTint(hitColor);
        this.currentHitDamage = hitDamage;

        // Create hitbox
        const offsetX = this.facing === 'right' ? 30 : -30;
        this.attackHitbox = this.scene.add.rectangle(
            this.x + offsetX, this.y, hitboxWidth, 40
        );
        this.scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);

        // Combo 3 text flash
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

        // Dash in facing direction
        const dashSpeed = this.facing === 'right' ? 400 : -400;
        this.setVelocityX(dashSpeed);

        // Brief invincibility — make semi-transparent
        this.setAlpha(0.4);

        // End dodge after 200ms
        this.scene.time.delayedCall(200, () => {
            this.isDodging = false;
            this.setAlpha(1);
        });

        // Cooldown — can't dodge again for 500ms
        this.scene.time.delayedCall(500, () => {
            this.dodgeCooldown = false;
        });
    }

    update() {
        if (!this.isDodging) {
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
        }

        // Attack
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.attack();
        }

        // Dodge
        if (Phaser.Input.Keyboard.JustDown(this.dodgeKey)) {
            this.dodge();
        }
    }
}
