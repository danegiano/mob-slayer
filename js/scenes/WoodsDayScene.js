class WoodsDayScene extends Phaser.Scene {
    constructor() { super('WoodsDay'); }

    preload() {
        this.load.image('woods-day-bg', 'assets/backgrounds/woods-day-bg.png?v=4');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'woods-day-bg');
        this.add.image(1200, 225, 'woods-day-bg');
        this.add.image(400, 675, 'woods-day-bg');
        this.add.image(1200, 675, 'woods-day-bg');

        // Trees spread across the bigger 1600x900 area
        this.obstacles = this.physics.add.staticGroup();
        const treePositions = [
            {x:100,y:60}, {x:250,y:80}, {x:450,y:50}, {x:650,y:70}, {x:750,y:40},
            {x:80,y:160}, {x:300,y:140}, {x:500,y:160}, {x:700,y:150},
            {x:100,y:320}, {x:250,y:350}, {x:450,y:330}, {x:600,y:370}, {x:750,y:340},
            {x:80,y:420}, {x:350,y:400}, {x:550,y:420}, {x:700,y:410},
            // New trees in expanded area
            {x:900,y:80}, {x:1050,y:60}, {x:1200,y:90}, {x:1400,y:50},
            {x:850,y:200}, {x:1000,y:180}, {x:1150,y:210}, {x:1350,y:170},
            {x:900,y:350}, {x:1100,y:380}, {x:1300,y:340}, {x:1500,y:370},
            {x:850,y:500}, {x:1000,y:520}, {x:1200,y:490}, {x:1400,y:510},
            {x:900,y:650}, {x:1100,y:680}, {x:1300,y:640}, {x:1500,y:670},
            {x:850,y:800}, {x:1050,y:820}, {x:1250,y:790}, {x:1450,y:830},
            {x:100,y:550}, {x:300,y:580}, {x:500,y:540}, {x:700,y:570},
            {x:100,y:700}, {x:300,y:730}, {x:500,y:710}, {x:700,y:750},
            {x:100,y:840}, {x:350,y:860}, {x:550,y:830}, {x:750,y:850}
        ];
        treePositions.forEach(p => {
            const t = this.add.sprite(p.x, p.y, 'tree', 0).setScale(2);
            this.physics.add.existing(t, true);
            this.obstacles.add(t);
        });

        // Hidden wall — slightly lighter tree that player can walk through
        this.hiddenTree = this.add.sprite(1400, 700, 'hidden_tree', 0).setScale(2).setDepth(5);

        this.player = new Player(this, 50, 225);
        this.physics.add.collider(this.player, this.obstacles);
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

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
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, 1600, 900);
        this.physics.world.setBounds(0, 0, 1600, 900);
    }

    pickUpSword() {
        if (this.swordPickedUp) return;
        this.swordPickedUp = true;
        GameState.equipment.sword = 'slayer';
        GameState.storyPhase = 1;
        this.sword.destroy();

        const swordText = this.add.text(this.player.x, this.player.y - 40, '\u30E2\u30D6\u30B9\u30EC\u30A4\u30E4\u30FC', {
            fontSize: '48px', fill: '#ff44ff'
        }).setOrigin(0.5);
        const subText = this.add.text(this.player.x, this.player.y + 10, 'Mob Slayer', {
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
        if (!this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();

        // Exit left — walk to left edge to go back to village
        if (!this.transitioning && this.player.x < 30) {
            this.transitioning = true;
            this.scene.start('Village');
        }

        // Hidden wall — walk through to secret room
        if (!this.transitioning && this.hiddenTree) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.hiddenTree.x, this.hiddenTree.y);
            if (dist < 20) {
                this.transitioning = true;
                GameState.secretRooms.woodsDay = true;
                this.scene.start('WoodsDaySecret');
            }
        }
    }
}
