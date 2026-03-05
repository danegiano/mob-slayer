class VictoryScene extends Phaser.Scene {
    constructor() { super('Victory'); }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        // Combo unlocked text
        const kanjiText = this.add.text(400, 150, '斬', {
            fontSize: '96px', fill: '#ff44ff'
        }).setOrigin(0.5);

        const comboText = this.add.text(400, 250, 'COMBO UNLOCKED!', {
            fontSize: '32px', fill: '#ffcc00'
        }).setOrigin(0.5);

        const subText = this.add.text(400, 300, 'The モブスレイヤー has awakened.', {
            fontSize: '18px', fill: '#ffffff'
        }).setOrigin(0.5);

        // After 3 seconds, show wall cracking
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [kanjiText, comboText, subText],
                alpha: 0, duration: 500
            });

            this.time.delayedCall(600, () => {
                this.showWallCrack();
            });
        });
    }

    showWallCrack() {
        // Dark stone wall
        this.add.rectangle(400, 225, 800, 450, 0x333333);

        // Stone brick pattern
        for (let y = 0; y < 450; y += 30) {
            for (let x = 0; x < 800; x += 50) {
                const offset = (Math.floor(y / 30) % 2) * 25;
                const shade = 0x2a2a2a + Math.floor(Math.random() * 0x101010);
                this.add.rectangle(x + offset + 25, y + 15, 48, 28, shade);
            }
        }

        // Crack text
        const crackText = this.add.text(400, 180, 'The wall trembles...', {
            fontSize: '24px', fill: '#ffcc00'
        }).setOrigin(0.5).setDepth(10);

        // Animated cracks
        const cracks = [];
        for (let i = 0; i < 5; i++) {
            const crack = this.add.rectangle(
                400 + Phaser.Math.Between(-30, 30),
                225 + Phaser.Math.Between(-60, 60),
                2, 10, 0xffcc00
            ).setDepth(10);
            cracks.push(crack);
        }

        // Grow cracks over time
        this.tweens.add({
            targets: cracks,
            scaleX: 3, scaleY: 8,
            duration: 2000,
            ease: 'Power2'
        });

        // Camera shake
        this.time.delayedCall(500, () => {
            this.cameras.main.shake(1500, 0.01);
        });

        // Change text
        this.time.delayedCall(1500, () => {
            crackText.setText('The wall breaks open!');
        });

        // Flash white and transition
        this.time.delayedCall(2500, () => {
            this.cameras.main.flash(500, 255, 255, 255);
            this.time.delayedCall(600, () => {
                this.scene.start('TundraVillage');
            });
        });
    }
}
