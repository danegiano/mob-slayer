const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood',       // 'wood' or 'slayer'
    comboUnlocked: false,  // unlocked after beating troll
    storyPhase: 0          // 0=start, 1=found sword, 2=talked to blacksmith, 3=night mode
};

class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    preload() {
        // Load all pixel art sprites
        this.load.image('player', 'assets/player.png');
        this.load.image('blacksmith', 'assets/blacksmith.png');
        this.load.image('goblin', 'assets/goblin.png');
        this.load.image('night_goblin', 'assets/night_goblin.png');
        this.load.image('troll', 'assets/troll.png');
    }
    create() {
        this.add.text(400, 225, 'Mob Slayer', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 280, 'Loading...', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);
        this.time.delayedCall(1000, () => this.scene.start('Village'));
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: [BootScene, VillageScene, WoodsDayScene, WoodsNightScene, BossArenaScene, VictoryScene, House1Scene, House2Scene, ForgeScene]
};

const game = new Phaser.Game(config);
