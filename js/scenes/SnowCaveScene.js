class SnowCaveScene extends Phaser.Scene {
    constructor() { super('SnowCave'); }

    preload() {
        this.load.image('snow-cave-bg', 'assets/backgrounds/snow-cave-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'snow-cave-bg');
        this.add.image(1200, 225, 'snow-cave-bg');
        this.add.image(400, 675, 'snow-cave-bg');
        this.add.image(1200, 675, 'snow-cave-bg');

        // Rock obstacles
        this.obstacles = this.physics.add.staticGroup();
        const rockPositions = [
            {x:200,y:100}, {x:450,y:130}, {x:650,y:80}, {x:350,y:300},
            {x:550,y:350}, {x:150,y:400}, {x:700,y:250},
            {x:900,y:120}, {x:1150,y:180}, {x:1400,y:100}, {x:1500,y:300},
            {x:850,y:350}, {x:1100,y:400}, {x:1300,y:350},
            {x:200,y:550}, {x:450,y:600}, {x:650,y:520}, {x:350,y:700},
            {x:900,y:550}, {x:1150,y:650}, {x:1400,y:550}, {x:1500,y:700},
            {x:200,y:800}, {x:500,y:830}, {x:750,y:780},
            {x:1000,y:800}, {x:1250,y:830}, {x:1450,y:780}
        ];
        rockPositions.forEach(p => {
            const r = this.add.rectangle(p.x, p.y, 24, 24, 0x667788).setDepth(3);
            this.physics.add.existing(r, true);
            this.obstacles.add(r);
        });

        // Player
        this.player = new Player(this, 50, 450);
        this.physics.add.collider(this.player, this.obstacles);

        // HUD
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        // E key for picking up amulet and opening chests
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 7 Ice Wolves spread across area
        this.enemies = this.physics.add.group();
        const wolfPositions = [
            {x:250,y:200}, {x:450,y:300}, {x:600,y:180}, {x:350,y:450},
            {x:900,y:300}, {x:1150,y:500}, {x:1350,y:250}
        ];
        wolfPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'ice_wolf', 15);
            enemy.speed = 100;
            enemy.aggroRange = 250;
            enemy.damage = 8;
            enemy.goldValue = 5;
            this.enemies.add(enemy);
        });

        // Ice Sword chest
        this.swordChest = new Chest(this, 700, 250, 'snowCaveIce', {
            type: 'sword', id: 'ice', name: 'Ice Sword'
        });
        this.physics.add.collider(this.player, this.swordChest);

        // Collectible amulet (only if quest not done)
        this.amulet = null;
        if (!GameState.quests.tundra.amulet) {
            this.amulet = this.physics.add.sprite(650, 400, 'collectible');
            this.amulet.play('collectible_idle');
            this.amulet.setScale(2);
        }

        // Pickup prompt
        this.pickupPrompt = this.add.text(650, 370, 'Press E to pick up', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Breakable wall for secret room
        this.breakableWall = new BreakableWall(this, 1400, 600);
        this.physics.add.collider(this.player, this.breakableWall);
        this.secretPassageOpen = false;

        // Scene title
        this.add.text(400, 50, 'Snow Cave', {
            fontSize: '20px', fill: '#aaddff'
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

            // Check breakable wall
            if (this.breakableWall && !this.breakableWall.isBroken) {
                this.breakableWall.checkAttack(this.player.attackHitbox, this);
                if (this.breakableWall.isBroken) {
                    this.secretPassageOpen = true;
                }
            }
        }

        // Chest interaction
        if (this.swordChest) {
            this.swordChest.showPrompt(this.player);
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.swordChest.tryOpen(this.player, this);
            }
        }

        // Amulet pickup
        if (this.amulet && !GameState.quests.tundra.amulet) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.amulet.x, this.amulet.y);
            this.pickupPrompt.setPosition(this.amulet.x, this.amulet.y - 30);
            this.pickupPrompt.setVisible(dist < 50);

            if (dist < 50 && Phaser.Input.Keyboard.JustDown(this.eKey)) {
                GameState.quests.tundra.amulet = true;
                this.amulet.destroy();
                this.amulet = null;
                this.pickupPrompt.setVisible(false);

                const pickText = this.add.text(this.player.x, this.player.y - 40, 'Ancient Amulet Found!', {
                    fontSize: '24px', fill: '#ffdd00'
                }).setOrigin(0.5).setDepth(50);
                this.tweens.add({
                    targets: pickText,
                    alpha: 0, y: pickText.y - 30,
                    duration: 2000, delay: 1000,
                    onComplete: () => pickText.destroy()
                });
            }
        } else {
            this.pickupPrompt.setVisible(false);
        }

        // Secret passage
        if (!this.transitioning && this.secretPassageOpen) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 1400, 600);
            if (dist < 30) {
                this.transitioning = true;
                GameState.secretRooms.snowCave = true;
                this.scene.start('SnowCaveSecret');
            }
        }

        // Exit left -> Frozen Lake
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('FrozenLake');
        }

        // Exit right -> Blizzard Pass
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('BlizzardPass');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
