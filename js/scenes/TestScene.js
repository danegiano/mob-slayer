// Placeholder — Task 2 will fill this in
class TestScene extends Phaser.Scene {
    constructor() { super('TestScene'); }
    create() {
        this.add.text(400, 225, 'TestScene — coming soon!', {
            fontSize: '24px', fill: '#fff'
        }).setOrigin(0.5);
    }
}
