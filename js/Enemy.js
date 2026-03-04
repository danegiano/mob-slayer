class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, color, health, damage, speed, textureKey) {
        // Use pixel art sprite if provided, otherwise fall back to colored rectangle
        const key = textureKey || 'enemy_' + color.toString(16);
        if (!textureKey && !scene.textures.exists(key)) {
            const gfx = scene.add.graphics();
            gfx.fillStyle(color);
            gfx.fillRect(0, 0, 24, 24);
            gfx.generateTexture(key, 24, 24);
            gfx.destroy();
        }

        super(scene, x, y, key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Play idle animation if using a sprite sheet
        if (textureKey) {
            this.play(textureKey + '_idle');
        }

        this.setCollideWorldBounds(true);
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.speed = speed;
        this.isHit = false;

        this.hpBar = scene.add.rectangle(x, y - 20, 24, 4, 0x00cc00).setDepth(10);
    }

    update(playerX) {
        if (this.isHit) return;

        if (playerX < this.x) {
            this.setVelocityX(-this.speed);
        } else {
            this.setVelocityX(this.speed);
        }

        this.hpBar.setPosition(this.x, this.y - 20);
        this.hpBar.setScale(this.health / this.maxHealth, 1);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.isHit = true;
        this.setTint(0xff0000);

        this.scene.time.delayedCall(200, () => {
            this.isHit = false;
            this.clearTint();
        });

        if (this.health <= 0) {
            this.hpBar.destroy();
            this.destroy();
            return true;
        }
        return false;
    }
}
