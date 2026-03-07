class BuriedLibraryScene extends Phaser.Scene {
    constructor() { super('BuriedLibrary'); }

    preload() {
        this.load.image('buried-library-bg', 'assets/backgrounds/buried-library-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'buried-library-bg');
        this.add.image(1200, 225, 'buried-library-bg');
        this.add.image(400, 675, 'buried-library-bg');
        this.add.image(1200, 675, 'buried-library-bg');

        // Rock obstacles
        this.obstacles = this.physics.add.staticGroup();
        const rockPositions = [
            {x:200,y:100}, {x:450,y:80}, {x:700,y:130}, {x:300,y:280},
            {x:550,y:320}, {x:150,y:420}, {x:650,y:380},
            {x:900,y:100}, {x:1150,y:160}, {x:1400,y:120}, {x:1500,y:280},
            {x:850,y:350}, {x:1100,y:400}, {x:1300,y:320},
            {x:200,y:580}, {x:500,y:550}, {x:700,y:600},
            {x:900,y:580}, {x:1200,y:620}, {x:1400,y:560},
            {x:150,y:750}, {x:450,y:780}, {x:700,y:720},
            {x:950,y:760}, {x:1200,y:800}, {x:1450,y:740}
        ];
        rockPositions.forEach(p => {
            const r = this.add.rectangle(p.x, p.y, 24, 24, 0x997744).setDepth(3);
            this.physics.add.existing(r, true);
            this.obstacles.add(r);
        });

        // Player
        this.player = new Player(this, 50, 450);
        this.physics.add.collider(this.player, this.obstacles);

        // HUD
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        // E key
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 8 Stone Golems
        this.enemies = this.physics.add.group();
        const golemPositions = [
            {x:250,y:200}, {x:500,y:350}, {x:700,y:180},
            {x:350,y:500}, {x:600,y:600},
            {x:950,y:300}, {x:1200,y:450}, {x:1400,y:250}
        ];
        golemPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'stone_golem', 100);
            enemy.speed = 40;
            enemy.aggroRange = 180;
            enemy.damage = 20;
            enemy.goldValue = 12;
            this.enemies.add(enemy);
        });

        // Collectible scroll (only if quest not done)
        this.questScroll = null;
        if (!GameState.quests.ruins.scroll) {
            this.questScroll = this.physics.add.sprite(650, 400, 'collectible');
            this.questScroll.play('collectible_idle');
            this.questScroll.setScale(2);
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
        this.add.text(400, 50, 'Buried Library', {
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

            // Check breakable wall
            if (this.breakableWall && !this.breakableWall.isBroken) {
                this.breakableWall.checkAttack(this.player.attackHitbox, this);
                if (this.breakableWall.isBroken) {
                    this.secretPassageOpen = true;
                }
            }
        }

        // Quest scroll pickup
        if (this.questScroll && !GameState.quests.ruins.scroll) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.questScroll.x, this.questScroll.y);
            this.pickupPrompt.setPosition(this.questScroll.x, this.questScroll.y - 30);
            this.pickupPrompt.setVisible(dist < 50);

            if (dist < 50 && Phaser.Input.Keyboard.JustDown(this.eKey)) {
                GameState.quests.ruins.scroll = true;
                this.questScroll.destroy();
                this.questScroll = null;
                this.pickupPrompt.setVisible(false);

                const pickText = this.add.text(this.player.x, this.player.y - 40, 'Ancient Scroll Found!', {
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
                GameState.secretRooms.buriedLibrary = true;
                this.scene.start('BuriedLibrarySecret');
            }
        }

        // Exit left -> Crumbling Bridge
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('CrumblingBridge');
        }

        // Exit right -> Lava Pit
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('LavaPit');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
