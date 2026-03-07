class FrozenLakeScene extends Phaser.Scene {
    constructor() { super('FrozenLake'); }

    preload() {
        this.load.image('frozen-lake-bg', 'assets/backgrounds/frozen-lake-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'frozen-lake-bg');
        this.add.image(1200, 225, 'frozen-lake-bg');
        this.add.image(400, 675, 'frozen-lake-bg');
        this.add.image(1200, 675, 'frozen-lake-bg');

        // Rock obstacles spread across area
        this.obstacles = this.physics.add.staticGroup();
        const rockPositions = [
            {x:150,y:100}, {x:400,y:80}, {x:650,y:120}, {x:300,y:250},
            {x:550,y:300}, {x:700,y:200}, {x:200,y:400}, {x:500,y:380},
            {x:100,y:550}, {x:350,y:600}, {x:600,y:550}, {x:750,y:650},
            // Expanded area
            {x:900,y:100}, {x:1100,y:150}, {x:1350,y:80}, {x:1500,y:200},
            {x:850,y:300}, {x:1050,y:350}, {x:1250,y:280}, {x:1450,y:400},
            {x:900,y:500}, {x:1100,y:550}, {x:1350,y:480}, {x:1500,y:600},
            {x:850,y:700}, {x:1100,y:780}, {x:1300,y:700}, {x:1500,y:800},
            {x:200,y:700}, {x:450,y:750}, {x:650,y:800}, {x:400,y:850}
        ];
        rockPositions.forEach(p => {
            const r = this.add.rectangle(p.x, p.y, 24, 24, 0x8899aa).setDepth(3);
            this.physics.add.existing(r, true);
            this.obstacles.add(r);
        });

        // Player
        this.player = new Player(this, 50, 450);
        this.physics.add.collider(this.player, this.obstacles);

        // HUD
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        // Enemies — 8 Ice Wolves spread across bigger area
        this.enemies = this.physics.add.group();
        const wolfPositions = [
            {x:250,y:200}, {x:450,y:350}, {x:600,y:150}, {x:350,y:500},
            {x:900,y:250}, {x:1100,y:400}, {x:1300,y:550}, {x:1500,y:300}
        ];
        wolfPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'ice_wolf', 15);
            enemy.speed = 100;
            enemy.aggroRange = 250;
            enemy.damage = 8;
            enemy.goldValue = 5;
            this.enemies.add(enemy);
        });

        // Track kills for quest
        this.killCount = 0;

        // Hidden wall for secret room
        this.hiddenTree = this.add.sprite(1300, 750, 'hidden_tree', 0).setScale(2).setDepth(5);

        // Quest progress text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Frozen Lake', {
            fontSize: '20px', fill: '#88ccff'
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
                    const wasDead = enemy.isDead;
                    enemy.takeDamage(this.player.currentHitDamage);
                    this.player.applySwordEffect(enemy, this.enemies);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });

                    // Count kill if enemy just died
                    if (!wasDead && enemy.isDead) {
                        this.killCount++;
                        if (this.killCount >= 5 && !GameState.quests.tundra.wolves) {
                            GameState.quests.tundra.wolves = true;
                        }
                    }
                }
            });
        }

        // Quest progress display
        if (GameState.quests.tundra.wolves) {
            this.questText.setText('Wolf Hunt: Complete!');
        } else {
            this.questText.setText('Wolf Hunt: ' + Math.min(this.killCount, 5) + '/5 wolves');
        }

        // Hidden wall — walk through to secret room
        if (!this.transitioning && this.hiddenTree) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.hiddenTree.x, this.hiddenTree.y);
            if (dist < 20) {
                this.transitioning = true;
                GameState.secretRooms.frozenLake = true;
                this.scene.start('FrozenLakeSecret');
            }
        }

        // Exit left -> Tundra Village
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('TundraVillage');
        }

        // Exit right -> Snow Cave
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('SnowCave');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
