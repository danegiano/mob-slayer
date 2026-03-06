class WoodsDayScene extends Phaser.Scene {
    constructor() { super('WoodsDay'); }

    preload() {
        this.load.image('woods-day-bg', 'assets/backgrounds/woods-day-bg.png?v=4');
    }

    create() {
        // Background image (covers the whole screen)
        this.add.image(400, 225, 'woods-day-bg');

        // Trees (2x scale) you can't walk through
        this.obstacles = this.physics.add.staticGroup();
        const treePositions = [
            {x:100,y:60}, {x:250,y:80}, {x:450,y:50}, {x:650,y:70}, {x:750,y:40},
            {x:80,y:160}, {x:300,y:140}, {x:500,y:160}, {x:700,y:150},
            {x:100,y:320}, {x:250,y:350}, {x:450,y:330}, {x:600,y:370}, {x:750,y:340},
            {x:80,y:420}, {x:350,y:400}, {x:550,y:420}, {x:700,y:410}
        ];
        treePositions.forEach(p => {
            const t = this.physics.add.sprite(p.x, p.y, 'tree', 0).setScale(2).setImmovable(true);
            t.body.setSize(16, 16);
            this.obstacles.add(t);
        });

        this.player = new Player(this, 50, 225);
        this.physics.add.collider(this.player, this.obstacles);
        this.hud = new HUD(this);

        // Glowing sword pickup
        if (GameState.storyPhase === 0) {
            this.sword = this.add.sprite(600, 225, 'sword_pickup', 0);
            this.physics.add.existing(this.sword, true);
            this.tweens.add({
                targets: this.sword,
                alpha: 0.4, yoyo: true, repeat: -1, duration: 500
            });
            this.physics.add.overlap(this.player, this.sword, () => {
                this.pickUpSword();
            });
        }

        this.swordPickedUp = false;
        this.transitioning = false;

        // Camera: zoom in and follow player
        this.cameras.main.setZoom(2);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, 800, 450);
        this.physics.world.setBounds(0, 0, 800, 450);
    }

    pickUpSword() {
        if (this.swordPickedUp) return;
        this.swordPickedUp = true;
        GameState.weapon = 'slayer';
        GameState.storyPhase = 1;
        this.player.attackDamage = 25;
        this.sword.destroy();

        const swordText = this.add.text(400, 200, '\u30E2\u30D6\u30B9\u30EC\u30A4\u30E4\u30FC', {
            fontSize: '48px', fill: '#ff44ff'
        }).setOrigin(0.5);
        const subText = this.add.text(400, 250, 'Mob Slayer', {
            fontSize: '20px', fill: '#ffccff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [swordText, subText],
            alpha: 0, y: '-=30',
            duration: 3000, delay: 1500,
            onComplete: () => { swordText.destroy(); subText.destroy(); }
        });
    }

    update() {
        this.player.update();
        this.hud.update();

        // Exit left — walk to left edge to go back to village
        if (!this.transitioning && this.player.x < 30) {
            this.transitioning = true;
            this.scene.start('Village');
        }
    }
}
