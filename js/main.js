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
        // Load sprite sheets — each is a 2-frame horizontal strip for idle animation
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('blacksmith', 'assets/blacksmith.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('goblin', 'assets/goblin.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('night_goblin', 'assets/night_goblin.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('troll', 'assets/troll.png', { frameWidth: 64, frameHeight: 80 });
    }
    create() {
        // Create idle animations for all characters
        this.anims.create({ key: 'player_idle', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'blacksmith_idle', frames: this.anims.generateFrameNumbers('blacksmith', { start: 0, end: 1 }), frameRate: 2, repeat: -1 });
        this.anims.create({ key: 'goblin_idle', frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'night_goblin_idle', frames: this.anims.generateFrameNumbers('night_goblin', { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'troll_idle', frames: this.anims.generateFrameNumbers('troll', { start: 0, end: 1 }), frameRate: 2, repeat: -1 });

        this.add.text(400, 225, 'Mob Slayer', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 280, 'Loading...', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);
        this.time.delayedCall(1000, () => this.scene.start('Village'));
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,  // crisp pixel art — no blurry smoothing!
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: [BootScene, VillageScene, WoodsDayScene, WoodsNightScene, BossArenaScene, VictoryScene, House1Scene, House2Scene, ForgeScene]
};

const game = new Phaser.Game(config);
