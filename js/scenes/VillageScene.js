class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    create() {
        // Ground — brown rectangle across the bottom
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x8B4513);
        this.physics.add.existing(this.ground, true); // true = static body

        // Player
        this.player = new Player(this, 100, 350);
        this.physics.add.collider(this.player, this.ground);

        // Scene label
        this.add.text(16, 16, 'Village', { fontSize: '18px', fill: '#333' });
    }

    update() {
        this.player.update();
    }
}
