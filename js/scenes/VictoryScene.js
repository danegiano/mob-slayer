class VictoryScene extends Phaser.Scene {
    constructor() { super('Victory'); }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        this.add.text(400, 150, '\u659c', {
            fontSize: '96px', fill: '#ff44ff'
        }).setOrigin(0.5);

        this.add.text(400, 250, 'COMBO UNLOCKED!', {
            fontSize: '32px', fill: '#ffcc00'
        }).setOrigin(0.5);

        this.add.text(400, 300, 'The \u30E2\u30D6\u30B9\u30EC\u30A4\u30E4\u30FC has awakened.', {
            fontSize: '18px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 340, 'Press Space 3x fast for COMBO attacks!', {
            fontSize: '14px', fill: '#aaaaaa'
        }).setOrigin(0.5);

        this.add.text(400, 400, 'To be continued...', {
            fontSize: '20px', fill: '#666666'
        }).setOrigin(0.5);
    }
}
