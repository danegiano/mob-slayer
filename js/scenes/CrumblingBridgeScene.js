class CrumblingBridgeScene extends Phaser.Scene {
    constructor() { super('CrumblingBridge'); }

    preload() {
        this.load.image('crumbling-bridge-bg', 'assets/backgrounds/crumbling-bridge-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'crumbling-bridge-bg');
        this.add.image(1200, 225, 'crumbling-bridge-bg');
        this.add.image(400, 675, 'crumbling-bridge-bg');
        this.add.image(1200, 675, 'crumbling-bridge-bg');

        // Rock obstacles
        this.obstacles = this.physics.add.staticGroup();
        const rockPositions = [
            {x:200,y:100}, {x:450,y:130}, {x:700,y:80}, {x:350,y:280},
            {x:600,y:300}, {x:150,y:400}, {x:500,y:380},
            {x:900,y:120}, {x:1150,y:180}, {x:1400,y:100}, {x:1500,y:250},
            {x:850,y:350}, {x:1100,y:380}, {x:1300,y:300},
            {x:200,y:550}, {x:500,y:580}, {x:700,y:520},
            {x:900,y:550}, {x:1200,y:620}, {x:1400,y:560},
            {x:150,y:750}, {x:450,y:720}, {x:700,y:780},
            {x:950,y:740}, {x:1200,y:800}, {x:1450,y:750}
        ];
        rockPositions.forEach(p => {
            const r = this.add.rectangle(p.x, p.y, 24, 24, 0xaa8844).setDepth(3);
            this.physics.add.existing(r, true);
            this.obstacles.add(r);
        });

        // Player
        this.player = new Player(this, 50, 450);
        this.physics.add.collider(this.player, this.obstacles);

        // HUD
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        // Enemies — 7 Stone Golems spread across area
        this.enemies = this.physics.add.group();
        const golemPositions = [
            {x:250,y:200}, {x:500,y:350}, {x:700,y:150},
            {x:350,y:500}, {x:950,y:280}, {x:1200,y:450}, {x:1400,y:300}
        ];
        golemPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'stone_golem', 100);
            enemy.speed = 40;
            enemy.aggroRange = 180;
            enemy.damage = 20;
            enemy.goldValue = 12;
            this.enemies.add(enemy);
        });

        // Hidden wall for secret room
        this.hiddenTree = this.add.sprite(1400, 650, 'hidden_tree', 0).setScale(2).setDepth(5);

        // Quest status text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Crumbling Bridge', {
            fontSize: '20px', fill: '#ddaa44'
        }).setOrigin(0.5);

        // Camera
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, 1600, 900);
        this.physics.world.setBounds(0, 0, 1600, 900);

        this.transitioning = false;
    }

    update() {
        if (!this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();

        // Update enemies
        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
        });

        // Player attack hitting enemies
        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    this.player.applySwordEffect(enemy, this.enemies);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Clear-all quest
        if (this.enemies.countActive() === 0 && !GameState.quests.ruins.bridge) {
            GameState.quests.ruins.bridge = true;
        }

        if (GameState.quests.ruins.bridge) {
            this.questText.setText('Crumbling Bridge: Cleared!');
        } else {
            this.questText.setText('Clear the Bridge: ' + this.enemies.countActive() + ' golems remaining');
        }

        // Hidden wall
        if (!this.transitioning && this.hiddenTree) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.hiddenTree.x, this.hiddenTree.y);
            if (dist < 20) {
                this.transitioning = true;
                GameState.secretRooms.crumblingBridge = true;
                this.scene.start('CrumblingBridgeSecret');
            }
        }

        // Exit left -> Ruins Village
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('RuinsVillage');
        }

        // Exit right -> Buried Library
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('BuriedLibrary');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
