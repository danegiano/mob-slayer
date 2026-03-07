class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play('player_idle_down');
        this.setCollideWorldBounds(true);
        this.body.setSize(28, 28);
        this.body.setOffset(10, 16);
        this.setScale(1);

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.moveSpeed = 200;
        if (GameState.accessories.speedBoots) {
            this.moveSpeed += 20;
        }
        this.facing = 'down';

        // Attack
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.isAttacking = false;
        this.attackHitbox = null;
        this.attackDamage = SWORD_DATA[GameState.equipment.sword].attack + GameState.attackBonus;
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

        // Play attack animation
        const prefix = GameState.equipment.sword === 'slayer' ? 'slayer_' : 'player_';
        this.play(prefix + 'attack_' + this.facing);
        this.once('animationcomplete', () => {
            if (!this.isAttacking) return;
            const idleKey = prefix + 'idle_' + this.facing;
            this.play(idleKey);
        });

        // Recalculate damage from current equipment each attack
        this.attackDamage = SWORD_DATA[GameState.equipment.sword].attack + GameState.attackBonus;

        let hitDamage = this.attackDamage;
        let hitboxSize = 24;
        let hitColor = 0xffffff;

        if (this.comboCount === 2) {
            hitDamage = this.attackDamage * 1.2;
            hitboxSize = 28;
            hitColor = 0xffff88;
        } else if (this.comboCount === 3) {
            hitDamage = this.attackDamage * 2;
            hitboxSize = 36;
            hitColor = 0xff4400;
        }

        this.setTint(hitColor);
        this.currentHitDamage = hitDamage;

        const attackDuration = this.comboCount === 3 ? 250 : 150;

        // Spawn hitbox in facing direction
        let offsetX = 0, offsetY = 0;
        let hbW = hitboxSize, hbH = hitboxSize;
        if (this.facing === 'right') { offsetX = 35; hbH = 24; }
        else if (this.facing === 'left') { offsetX = -35; hbH = 24; }
        else if (this.facing === 'down') { offsetY = 35; hbW = 24; }
        else if (this.facing === 'up') { offsetY = -35; hbW = 24; }

        this.attackHitbox = this.scene.add.rectangle(
            this.x + offsetX, this.y + offsetY, hbW, hbH, hitColor, 0.0
        );
        this.scene.physics.add.existing(this.attackHitbox, false);
        this.attackHitbox.body.setAllowGravity(false);

        // Sword slash visual — animated swing
        this.slashSprite = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'sword_slash', 0);
        this.slashSprite.setDepth(50);
        let startAngle, endAngle;
        if (this.facing === 'down')  { startAngle = -90; endAngle = 90; }
        else if (this.facing === 'up')    { startAngle = 90;  endAngle = -90; }
        else if (this.facing === 'left')  { startAngle = 0;   endAngle = 180; }
        else                              { startAngle = 180;  endAngle = 0; }
        this.slashSprite.setAngle(startAngle);
        this.scene.tweens.add({
            targets: this.slashSprite,
            angle: endAngle,
            duration: attackDuration,
            ease: 'Power2'
        });

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
        this.scene.time.delayedCall(attackDuration, () => {
            if (this.attackHitbox) {
                this.attackHitbox.destroy();
                this.attackHitbox = null;
            }
            if (this.slashSprite) {
                this.slashSprite.destroy();
                this.slashSprite = null;
            }
            this.clearTint();
            this.isAttacking = false;
        });
    }

    dodge() {
        if (this.isDodging || this.dodgeCooldown) return;
        this.isDodging = true;
        this.dodgeCooldown = true;

        // Dash in the direction currently moving (or facing if standing still)
        const dashSpeed = 400;
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        let dx = 0, dy = 0;
        if (left) dx = -1;
        else if (right) dx = 1;
        if (up) dy = -1;
        else if (down) dy = 1;

        // If not moving, dash in facing direction
        if (dx === 0 && dy === 0) {
            if (this.facing === 'left') dx = -1;
            else if (this.facing === 'right') dx = 1;
            else if (this.facing === 'up') dy = -1;
            else if (this.facing === 'down') dy = 1;
        }

        this.setVelocityX(dx * dashSpeed);
        this.setVelocityY(dy * dashSpeed);
        this.setAlpha(0.4);

        this.scene.time.delayedCall(200, () => {
            this.isDodging = false;
            this.setAlpha(1);
        });

        this.scene.time.delayedCall(500, () => {
            this.dodgeCooldown = false;
        });
    }

    applySwordEffect(enemy, allEnemies) {
        const effect = SWORD_DATA[GameState.equipment.sword].effect;
        if (effect === 'burn') {
            enemy.applyBurn(this.scene);
        } else if (effect === 'freeze') {
            enemy.applyFreeze(this.scene);
        } else if (effect === 'lightning') {
            enemy.applyBurn(this.scene);
            // Chain lightning to nearest alive enemy within 100px
            let nearest = null;
            let minDist = Infinity;
            allEnemies.children.each(other => {
                if (other === enemy || other.isDead) return;
                const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y);
                if (d < 100 && d < minDist) {
                    minDist = d;
                    nearest = other;
                }
            });
            if (nearest) {
                nearest.takeDamage(15);
                nearest.setTint(0xFFFFFF);
                this.scene.time.delayedCall(200, () => {
                    if (nearest && !nearest.isDead) nearest.clearTint();
                });
                const line = this.scene.add.graphics();
                line.lineStyle(2, 0xFFFF00, 1);
                line.lineBetween(enemy.x, enemy.y, nearest.x, nearest.y);
                line.setDepth(50);
                this.scene.time.delayedCall(200, () => line.destroy());
            }
        }
    }

    update() {
        if (!this.isDodging) {
            const left = this.cursors.left.isDown || this.wasd.left.isDown;
            const right = this.cursors.right.isDown || this.wasd.right.isDown;
            const up = this.cursors.up.isDown || this.wasd.up.isDown;
            const down = this.cursors.down.isDown || this.wasd.down.isDown;

            let vx = 0, vy = 0;

            if (left) { vx = -this.moveSpeed; this.facing = 'left'; }
            else if (right) { vx = this.moveSpeed; this.facing = 'right'; }
            if (up) { vy = -this.moveSpeed; this.facing = 'up'; }
            else if (down) { vy = this.moveSpeed; this.facing = 'down'; }

            this.setVelocityX(vx);
            this.setVelocityY(vy);

            // Play walk or idle animation — use slayer sprite if weapon equipped
            const moving = vx !== 0 || vy !== 0;
            const prefix = GameState.equipment.sword === 'slayer' ? 'slayer_' : 'player_';
            const animKey = prefix + (moving ? 'walk_' : 'idle_') + this.facing;
            if (this.anims.currentAnim?.key !== animKey) {
                this.play(animKey);
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
