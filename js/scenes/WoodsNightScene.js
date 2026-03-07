class WoodsNightScene extends Phaser.Scene {
    constructor() { super('WoodsNight'); }

    preload() {
        this.load.image('woods-night-bg', 'assets/backgrounds/woods-night-bg.png?v=4');
    }

    create() {
        // Background image (covers the whole screen)
        this.add.image(400, 225, 'woods-night-bg');

        // Trees (2x scale)
        this.obstacles = this.physics.add.staticGroup();
        const treePositions = [
            {x:100,y:60}, {x:300,y:70}, {x:500,y:50}, {x:700,y:80},
            {x:80,y:170}, {x:350,y:140}, {x:550,y:170}, {x:720,y:130},
            {x:100,y:340}, {x:300,y:370}, {x:500,y:350}, {x:700,y:380},
            {x:80,y:420}, {x:400,y:400}, {x:600,y:430}, {x:750,y:410}
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

        // Spawn 4 night goblins
        const positions = [
            { x: 300, y: 150 }, { x: 500, y: 300 },
            { x: 400, y: 200 }, { x: 600, y: 250 }
        ];
        positions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'night_goblin', 20);
            this.enemies.add(enemy);
        });

        this.transitioning = false;

        // Camera: zoom in and follow player
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, 800, 450);
        this.physics.world.setBounds(0, 0, 800, 450);

        // Fire Sword chest
        this.chest = new Chest(this, 720, 300, 'woodsNightFire', {
            type: 'sword', id: 'fire', name: 'Fire Sword'
        });
        this.physics.add.collider(this.player, this.chest);

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
        }

        if (this.chest) {
            this.chest.showPrompt(this.player);
            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.chest.tryOpen(this.player, this);
            }
        }

        // Exit right — walk to right edge after killing all enemies
        if (!this.transitioning && this.player.x > 770 && this.enemies.countActive() === 0) {
            this.transitioning = true;
            this.scene.start('BossArena');
        }

        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
