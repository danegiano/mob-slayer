class LockedDoor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'locked_door');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(2);
        this.setDepth(5);
        this.isUnlocked = false;

        this.lockText = scene.add.text(x, y - 20, 'Defeat all enemies!', {
            fontSize: '8px', fill: '#ff4444'
        }).setOrigin(0.5).setVisible(false).setDepth(50);
    }

    checkUnlock(enemies, player) {
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);

        if (!this.isUnlocked && dist < 60) {
            if (enemies.countActive() === 0) {
                this.unlock();
            } else {
                this.lockText.setVisible(true);
            }
        } else {
            this.lockText.setVisible(false);
        }
    }

    unlock() {
        this.isUnlocked = true;
        this.setTexture('open_door');
        this.lockText.setVisible(false);
        this.body.enable = false;
    }
}
