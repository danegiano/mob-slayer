class BreakableWall extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'cracked_rock');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(2);
        this.setDepth(5);
        this.isBroken = false;
    }

    checkAttack(attackHitbox, scene) {
        if (this.isBroken) return false;
        if (!attackHitbox) return false;
        const b1 = attackHitbox.getBounds();
        const b2 = this.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
            this.breakWall(scene);
            return true;
        }
        return false;
    }

    breakWall(scene) {
        this.isBroken = true;
        // Particle effect — spawn small debris rectangles
        for (let i = 0; i < 6; i++) {
            const debris = scene.add.rectangle(
                this.x + Phaser.Math.Between(-10, 10),
                this.y + Phaser.Math.Between(-10, 10),
                4, 4, 0x888888
            ).setDepth(50);
            scene.tweens.add({
                targets: debris,
                x: debris.x + Phaser.Math.Between(-30, 30),
                y: debris.y + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: 500,
                onComplete: () => debris.destroy()
            });
        }
        this.destroy();
    }
}
