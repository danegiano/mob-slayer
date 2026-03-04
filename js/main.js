// ============================================
// Mob Slayer — Village Preview
// Uses Kenney Tiny Town sample map directly!
// ============================================

class VillagePreview extends Phaser.Scene {
    constructor() {
        super('VillagePreview');
    }

    preload() {
        // Load Kenney's actual sample village map
        this.load.image('village', 'assets/village_bg.png');
    }

    create() {
        // Show the Kenney village, scaled to fit the screen
        const bg = this.add.image(400, 225, 'village');

        // Scale it to fit nicely — the image is 918x515
        // We want it to fill the 800x450 game window
        const scaleX = 800 / bg.width;
        const scaleY = 450 / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // Title
        this.add.text(400, 20, 'Mob Slayer — Village', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,
    backgroundColor: '#5a8f3c',
    scene: [VillagePreview]
};

const game = new Phaser.Game(config);
