class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, health) {
        super(scene, x, y, type);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play(type + '_idle');
        this.setCollideWorldBounds(true);
        this.setScale(1);

        this.enemyType = type;
        this.health = health || 30;
        this.maxHealth = this.health;
        this.damage = 10;
        this.speed = 60;
        this.baseSpeed = this.speed;
        this.aggroRange = 200;
        this.attackRange = 40;
        this.attackCooldown = false;
        this.isDead = false;
        this.goldValue = 5;

        // Power system
        this.powerCooldown = false;
        this.isUsingPower = false;
        this.isDashing = false;
        this.isInvisible = false;
    }

    takeDamage(amount) {
        if (this.isDead || this.isInvisible) return;
        this.health -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead && !this.isBurning && !this.isFrozen) this.clearTint();
        });

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
            // Try to use power if not on cooldown and not frozen/burning
            if (!this.powerCooldown && !this.isUsingPower && !this.isFrozen && !this.isBurning) {
                this.usePower(player);
            }

            // Don't chase while using power (except dashing)
            if (!this.isUsingPower) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                this.setVelocityX(Math.cos(angle) * this.speed);
                this.setVelocityY(Math.sin(angle) * this.speed);
                this.setFlipX(player.x < this.x);
            }

            if (dist < this.attackRange && !this.attackCooldown && !this.isUsingPower) {
                this.attackPlayer(player);
            }
        } else {
            this.setVelocityX(0);
            this.setVelocityY(0);
        }

        // Shadow dash damage check
        if (this.isDashing && !player.isDodging) {
            const dashDist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            if (dashDist < 30 && !this.dashHit) {
                this.dashHit = true;
                const armor = ARMOR_DATA[GameState.equipment.armor];
                const dmg = Math.round(this.damage * 1.5 * (1 - armor.reduction));
                GameState.health -= dmg;
                if (GameState.health < 0) GameState.health = 0;
                player.setTint(0xff0000);
                player.scene.time.delayedCall(200, () => player.clearTint());
            }
        }
    }

    usePower(player) {
        if (this.enemyType === 'night_goblin') {
            this.powerTeleport(player);
        } else if (this.enemyType === 'ice_wolf') {
            this.powerIceShard(player);
        } else if (this.enemyType === 'shadow_beast') {
            this.powerShadowDash(player);
        } else if (this.enemyType === 'stone_golem') {
            this.powerGroundSlam(player);
        }
    }

    // NIGHT GOBLIN — Teleport behind player
    powerTeleport(player) {
        this.powerCooldown = true;
        this.isUsingPower = true;

        // Flash purple
        this.setTint(0xaa00ff);
        this.setVelocityX(0);
        this.setVelocityY(0);

        // Poof particles at current position
        this.spawnPoof(this.x, this.y, 0xaa00ff);

        // Disappear after short delay
        this.scene.time.delayedCall(300, () => {
            if (this.isDead) return;
            this.isInvisible = true;
            this.setAlpha(0);

            // Reappear behind player after 0.5s
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                // Calculate position behind player based on their facing
                const behindX = player.x + (player.facing === 'right' ? -50 : player.facing === 'left' ? 50 : 0);
                const behindY = player.y + (player.facing === 'down' ? -50 : player.facing === 'up' ? 50 : 0);
                this.setPosition(behindX, behindY);
                this.setAlpha(1);
                this.isInvisible = false;
                this.clearTint();
                this.isUsingPower = false;

                // Poof at new position
                this.spawnPoof(this.x, this.y, 0xaa00ff);
            });
        });

        // Cooldown
        this.scene.time.delayedCall(4000, () => {
            this.powerCooldown = false;
        });
    }

    // ICE WOLF — Shoot ice shard projectile
    powerIceShard(player) {
        this.powerCooldown = true;
        this.isUsingPower = true;

        // Flash blue and stop
        this.setTint(0x44aaff);
        this.setVelocityX(0);
        this.setVelocityY(0);

        this.scene.time.delayedCall(400, () => {
            if (this.isDead) return;
            this.clearTint();
            this.isUsingPower = false;

            // Create ice shard projectile
            const shard = this.scene.add.rectangle(this.x, this.y, 8, 8, 0x44aaff).setDepth(10);
            this.scene.physics.add.existing(shard, false);
            shard.body.setAllowGravity(false);

            // Shoot toward player's current position
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            shard.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);

            // Trail effect
            const trailTimer = this.scene.time.addEvent({
                delay: 50,
                repeat: -1,
                callback: () => {
                    if (!shard.active) { trailTimer.remove(); return; }
                    const trail = this.scene.add.rectangle(shard.x, shard.y, 4, 4, 0x88ccff, 0.6).setDepth(9);
                    this.scene.tweens.add({
                        targets: trail, alpha: 0, duration: 200,
                        onComplete: () => trail.destroy()
                    });
                }
            });

            // Check for hit on player each frame
            const hitCheck = this.scene.time.addEvent({
                delay: 16,
                repeat: -1,
                callback: () => {
                    if (!shard.active) { hitCheck.remove(); return; }
                    const d = Phaser.Math.Distance.Between(shard.x, shard.y, player.x, player.y);
                    if (d < 20 && !player.isDodging) {
                        const armor = ARMOR_DATA[GameState.equipment.armor];
                        const dmg = Math.round(8 * (1 - armor.reduction));
                        GameState.health -= dmg;
                        if (GameState.health < 0) GameState.health = 0;
                        player.setTint(0x44aaff);
                        player.scene.time.delayedCall(200, () => player.clearTint());
                        shard.destroy();
                        hitCheck.remove();
                        trailTimer.remove();
                    }
                }
            });

            // Destroy after 3 seconds
            this.scene.time.delayedCall(3000, () => {
                if (shard.active) shard.destroy();
                hitCheck.remove();
                trailTimer.remove();
            });
        });

        // Cooldown
        this.scene.time.delayedCall(5000, () => {
            this.powerCooldown = false;
        });
    }

    // SHADOW BEAST — Dash at player at 3x speed
    powerShadowDash(player) {
        this.powerCooldown = true;
        this.isUsingPower = true;
        this.isDashing = true;
        this.dashHit = false;

        // Flash dark red warning
        this.setTint(0xcc0000);
        this.setVelocityX(0);
        this.setVelocityY(0);

        // Wind-up
        this.scene.time.delayedCall(300, () => {
            if (this.isDead) return;

            // Dash toward player's position
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            const dashSpeed = this.baseSpeed * 3;
            this.setVelocityX(Math.cos(angle) * dashSpeed);
            this.setVelocityY(Math.sin(angle) * dashSpeed);

            // Dash trail
            const dashTrail = this.scene.time.addEvent({
                delay: 30,
                repeat: 15,
                callback: () => {
                    if (this.isDead) return;
                    const afterimage = this.scene.add.rectangle(this.x, this.y, 16, 16, 0x440000, 0.5).setDepth(4);
                    this.scene.tweens.add({
                        targets: afterimage, alpha: 0, duration: 300,
                        onComplete: () => afterimage.destroy()
                    });
                }
            });

            // Stop dash after 0.5s
            this.scene.time.delayedCall(500, () => {
                if (this.isDead) return;
                this.isDashing = false;
                this.setVelocityX(0);
                this.setVelocityY(0);
                this.clearTint();

                // Pause after dash (vulnerable)
                this.scene.time.delayedCall(500, () => {
                    this.isUsingPower = false;
                });
            });
        });

        // Cooldown
        this.scene.time.delayedCall(4000, () => {
            this.powerCooldown = false;
        });
    }

    // STONE GOLEM — Ground slam shockwave
    powerGroundSlam(player) {
        this.powerCooldown = true;
        this.isUsingPower = true;

        // Yellow flash warning
        this.setTint(0xffff00);
        this.setVelocityX(0);
        this.setVelocityY(0);

        // Wind-up: slight jump up
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 300,
            yoyo: true,
            onComplete: () => {
                if (this.isDead) return;
                this.clearTint();

                // Shockwave ring
                const ring = this.scene.add.circle(this.x, this.y, 10, 0xffaa00, 0.4).setDepth(4);
                this.scene.tweens.add({
                    targets: ring,
                    scaleX: 8, scaleY: 8,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => ring.destroy()
                });

                // Screen shake
                this.scene.cameras.main.shake(150, 0.005);

                // Damage player if within 80px
                const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
                if (dist < 80 && !player.isDodging) {
                    const armor = ARMOR_DATA[GameState.equipment.armor];
                    const dmg = Math.round(15 * (1 - armor.reduction));
                    GameState.health -= dmg;
                    if (GameState.health < 0) GameState.health = 0;
                    player.setTint(0xffaa00);
                    player.scene.time.delayedCall(200, () => player.clearTint());

                    // Knockback
                    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                    player.setVelocityX(Math.cos(angle) * 300);
                    player.setVelocityY(Math.sin(angle) * 300);
                }

                this.isUsingPower = false;
            }
        });

        // Cooldown
        this.scene.time.delayedCall(6000, () => {
            this.powerCooldown = false;
        });
    }

    // Poof particle effect helper
    spawnPoof(x, y, color) {
        for (let i = 0; i < 5; i++) {
            const p = this.scene.add.circle(
                x + Phaser.Math.Between(-10, 10),
                y + Phaser.Math.Between(-10, 10),
                3, color, 0.7
            ).setDepth(50);
            this.scene.tweens.add({
                targets: p,
                x: p.x + Phaser.Math.Between(-20, 20),
                y: p.y + Phaser.Math.Between(-20, 20),
                alpha: 0,
                duration: 400,
                onComplete: () => p.destroy()
            });
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
