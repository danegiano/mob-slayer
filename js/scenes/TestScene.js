class TestScene extends Phaser.Scene {
    constructor() { super('TestScene'); }

    create() {
        // Simple ground — a green rectangle
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x4a7a2e);
        this.physics.add.existing(this.ground, true); // true = static

        // Create the player
        this.player = new Player(this, 100, 350);

        // Player stands on the ground
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);
    }

    update() {
        this.player.update();
        this.hud.update();
    }
}
