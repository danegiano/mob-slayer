class VictoryScene extends Phaser.Scene {
    constructor() { super('Victory'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a2a');

        this.add.text(400, 120, 'モブスレイヤー', {
            fontSize: '56px', fill: '#ffdd00'
        }).setOrigin(0.5);

        this.add.text(400, 180, 'MOB SLAYER', {
            fontSize: '28px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 240, 'You defeated the troll and unlocked combo attacks!', {
            fontSize: '16px', fill: '#aaaacc'
        }).setOrigin(0.5);

        this.add.text(400, 280, 'The curse on the woods has been lifted...', {
            fontSize: '14px', fill: '#8888aa'
        }).setOrigin(0.5);

        this.add.text(400, 320, 'Or has it?', {
            fontSize: '14px', fill: '#cc4444'
        }).setOrigin(0.5);

        this.add.text(400, 380, 'Press SPACE to play again', {
            fontSize: '18px', fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => {
            GameState.health = 100;
            GameState.weapon = 'wood';
            GameState.comboUnlocked = false;
            GameState.storyPhase = 0;
            this.scene.start('Village');
        });
    }
}
