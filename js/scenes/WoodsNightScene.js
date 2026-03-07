class WoodsNightScene extends Phaser.Scene {
    constructor() { super('WoodsNight'); }

    preload() {
        this.load.image('woods-night-bg', 'assets/backgrounds/woods-night-bg.png?v=4');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'woods-night-bg');
        this.add.image(1200, 225, 'woods-night-bg');
        this.add.image(400, 675, 'woods-night-bg');
        this.add.image(1200, 675, 'woods-night-bg');

        // Trees spread across bigger area
        this.obstacles = this.physics.add.staticGroup();
        const treePositions = [
            {x:100,y:60}, {x:300,y:70}, {x:500,y:50}, {x:700,y:80},
            {x:80,y:170}, {x:350,y:140}, {x:550,y:170}, {x:720,y:130},
            {x:100,y:340}, {x:300,y:370}, {x:500,y:350}, {x:700,y:380},
            {x:80,y:420}, {x:400,y:400}, {x:600,y:430}, {x:750,y:410},
            // Expanded area
            {x:900,y:90}, {x:1050,y:60}, {x:1250,y:80}, {x:1450,y:50},
            {x:850,y:200}, {x:1050,y:180}, {x:1250,y:210}, {x:1400,y:190},
            {x:900,y:370}, {x:1100,y:340}, {x:1300,y:380}, {x:1500,y:360},
            {x:850,y:500}, {x:1050,y:520}, {x:1250,y:490}, {x:1450,y:530},
            {x:900,y:650}, {x:1100,y:680}, {x:1300,y:660}, {x:1500,y:640},
            {x:850,y:800}, {x:1050,y:830}, {x:1250,y:810}, {x:1450,y:840},
            {x:100,y:550}, {x:300,y:580}, {x:500,y:560}, {x:700,y:590},
            {x:100,y:700}, {x:350,y:720}, {x:550,y:740}, {x:700,y:710},
            {x:100,y:850}, {x:300,y:830}, {x:500,y:860}, {x:750,y:840}
        ];
        treePositions.forEach(p => {
            const t = this.add.sprite(p.x, p.y, 'tree', 0).setScale(2);
            this.physics.add.existing(t, true);
            this.obstacles.add(t);
        });

        this.player = new Player(this, 50, 225);
        this.physics.add.collider(this.player, this.obstacles);

        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        this.enemies = this.physics.add.group();

        // Spawn 6 night goblins across bigger area
        const positions = [
            { x: 300, y: 150 }, { x: 500, y: 300 },
            { x: 400, y: 200 }, { x: 600, y: 250 },
            { x: 900, y: 400 }, { x: 1100, y: 550 }
        ];
        positions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'night_goblin', 20);
            this.enemies.add(enemy);
        });

        this.transitioning = false;

        // Camera: zoom in and follow player
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, 1600, 900);
        this.physics.world.setBounds(0, 0, 1600, 900);

        // Fire Sword chest
        this.chest = new Chest(this, 720, 300, 'woodsNightFire', {
            type: 'sword', id: 'fire', name: 'Fire Sword'
        });
        this.physics.add.collider(this.player, this.chest);

        // Breakable wall for secret room
        this.breakableWall = new BreakableWall(this, 1350, 650);
        this.physics.add.collider(this.player, this.breakableWall);
        this.secretPassageOpen = false;

        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.add.text(400, 30, 'The woods are cursed...', {
            fontSize: '20px', fill: '#ff4444'
        }).setOrigin(0.5);
    }

    update() {
        if (!this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();

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

        if (this.chest) {
            this.chest.showPrompt(this.player);
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.chest.tryOpen(this.player, this);
            }
        }

        // Secret passage — walk to where wall was
        if (!this.transitioning && this.secretPassageOpen) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 1350, 650);
            if (dist < 30) {
                this.transitioning = true;
                GameState.secretRooms.woodsNight = true;
                this.scene.start('WoodsNightSecret');
            }
        }

        // Exit right — walk to right edge after killing all enemies
        if (!this.transitioning && this.player.x > 1570 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('BossArena');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
