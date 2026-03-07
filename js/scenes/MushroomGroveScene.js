class MushroomGroveScene extends Phaser.Scene {
    constructor() { super('MushroomGrove'); }

    preload() {
        this.load.image('mushroom-grove-bg', 'assets/backgrounds/mushroom-grove-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'mushroom-grove-bg');
        this.add.image(1200, 225, 'mushroom-grove-bg');
        this.add.image(400, 675, 'mushroom-grove-bg');
        this.add.image(1200, 675, 'mushroom-grove-bg');

        // Tree obstacles spread across area
        this.obstacles = this.physics.add.staticGroup();
        const treePositions = [
            {x:150,y:80}, {x:350,y:120}, {x:550,y:60}, {x:700,y:140},
            {x:200,y:250}, {x:450,y:280}, {x:650,y:220},
            {x:100,y:400}, {x:350,y:380}, {x:600,y:420}, {x:750,y:360},
            // Expanded area
            {x:900,y:100}, {x:1100,y:150}, {x:1300,y:80}, {x:1500,y:130},
            {x:850,y:280}, {x:1050,y:300}, {x:1250,y:250}, {x:1450,y:310},
            {x:900,y:420}, {x:1150,y:460}, {x:1350,y:400}, {x:1500,y:480},
            {x:100,y:560}, {x:300,y:600}, {x:550,y:540}, {x:700,y:580},
            {x:900,y:600}, {x:1100,y:640}, {x:1300,y:580}, {x:1500,y:620},
            {x:150,y:750}, {x:400,y:780}, {x:650,y:720}, {x:350,y:850},
            {x:900,y:780}, {x:1100,y:800}, {x:1350,y:740}
        ];
        treePositions.forEach(p => {
            const t = this.add.sprite(p.x, p.y, 'tree', 0).setScale(2);
            this.physics.add.existing(t, true);
            this.obstacles.add(t);
        });

        // Player
        this.player = new Player(this, 50, 450);
        this.physics.add.collider(this.player, this.obstacles);

        // HUD
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        // E key for picking up mushrooms
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 7 Shadow Beasts spread across area
        this.enemies = this.physics.add.group();
        const beastPositions = [
            {x:250,y:180}, {x:500,y:350}, {x:700,y:200},
            {x:350,y:500}, {x:900,y:300}, {x:1150,y:450}, {x:1350,y:250}
        ];
        beastPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'shadow_beast', 30);
            enemy.speed = 120;
            enemy.aggroRange = 250;
            enemy.damage = 15;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        });

        // Collectible mushrooms (only if quest not done)
        this.mushrooms = [];
        this.mushroomsCollected = 0;
        if (!GameState.quests.darkforest.mushrooms) {
            const positions = [{x:250,y:300}, {x:550,y:500}, {x:1000,y:350}];
            positions.forEach(p => {
                const mush = this.physics.add.sprite(p.x, p.y, 'collectible');
                mush.play('collectible_idle');
                mush.setScale(2);
                this.mushrooms.push(mush);
            });
        }

        // Pickup prompt
        this.pickupPrompt = this.add.text(400, 360, 'Press E to pick up', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Quest progress text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Hidden wall for secret room
        this.hiddenTree = this.add.sprite(1350, 700, 'hidden_tree', 0).setScale(2).setDepth(5);

        // Scene title
        this.add.text(400, 50, 'Mushroom Grove', {
            fontSize: '20px', fill: '#88ff88'
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

        // Mushroom pickup
        let nearestMush = null;
        let nearestDist = Infinity;
        this.mushrooms.forEach(mush => {
            if (!mush.active) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, mush.x, mush.y);
            if (dist < 50 && dist < nearestDist) {
                nearestDist = dist;
                nearestMush = mush;
            }
        });

        if (nearestMush) {
            this.pickupPrompt.setPosition(nearestMush.x, nearestMush.y - 30);
            this.pickupPrompt.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                nearestMush.destroy();
                this.mushroomsCollected++;

                const pickText = this.add.text(this.player.x, this.player.y - 40, 'Mushroom ' + this.mushroomsCollected + '/3!', {
                    fontSize: '24px', fill: '#ffdd00'
                }).setOrigin(0.5).setDepth(50);
                this.tweens.add({
                    targets: pickText,
                    alpha: 0, y: pickText.y - 30,
                    duration: 2000, delay: 1000,
                    onComplete: () => pickText.destroy()
                });

                if (this.mushroomsCollected >= 3) {
                    GameState.quests.darkforest.mushrooms = true;
                }
            }
        } else {
            this.pickupPrompt.setVisible(false);
        }

        // Quest progress display
        if (GameState.quests.darkforest.mushrooms) {
            this.questText.setText('Mushrooms: Complete!');
        } else {
            this.questText.setText('Mushrooms: ' + this.mushroomsCollected + '/3 collected');
        }

        // Hidden wall — walk through to secret room
        if (!this.transitioning && this.hiddenTree) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.hiddenTree.x, this.hiddenTree.y);
            if (dist < 20) {
                this.transitioning = true;
                GameState.secretRooms.mushroomGrove = true;
                this.scene.start('MushroomGroveSecret');
            }
        }

        // Exit left -> Forest Village
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('ForestVillage');
        }

        // Exit right -> Cursed Swamp
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('CursedSwamp');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
