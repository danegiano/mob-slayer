class BlizzardPassScene extends Phaser.Scene {
    constructor() { super('BlizzardPass'); }

    preload() {
        this.load.image('blizzard-pass-bg', 'assets/backgrounds/blizzard-pass-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'blizzard-pass-bg');
        this.add.image(1200, 225, 'blizzard-pass-bg');
        this.add.image(400, 675, 'blizzard-pass-bg');
        this.add.image(1200, 675, 'blizzard-pass-bg');

        // Rock obstacles
        this.obstacles = this.physics.add.staticGroup();
        const rockPositions = [
            {x:200,y:100}, {x:400,y:150}, {x:650,y:80}, {x:300,y:300},
            {x:550,y:280}, {x:700,y:350}, {x:150,y:450},
            {x:900,y:120}, {x:1100,y:200}, {x:1350,y:150}, {x:1500,y:280},
            {x:850,y:400}, {x:1050,y:350}, {x:1250,y:450},
            {x:200,y:600}, {x:450,y:550}, {x:650,y:620}, {x:350,y:750},
            {x:900,y:600}, {x:1100,y:700}, {x:1350,y:550}, {x:1500,y:650},
            {x:200,y:830}, {x:500,y:800}, {x:750,y:850},
            {x:1000,y:830}, {x:1300,y:800}, {x:1500,y:850}
        ];
        rockPositions.forEach(p => {
            const r = this.add.rectangle(p.x, p.y, 24, 24, 0x7799aa).setDepth(3);
            this.physics.add.existing(r, true);
            this.obstacles.add(r);
        });

        // Player
        this.player = new Player(this, 50, 450);
        this.physics.add.collider(this.player, this.obstacles);

        // HUD
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        // Enemies — 9 tougher Ice Wolves spread across area
        this.enemies = this.physics.add.group();
        const wolfPositions = [
            {x:200,y:200}, {x:400,y:350}, {x:600,y:180},
            {x:300,y:500}, {x:550,y:600}, {x:700,y:450},
            {x:950,y:300}, {x:1200,y:500}, {x:1400,y:350}
        ];
        wolfPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'ice_wolf', 50);
            enemy.speed = 120;
            enemy.aggroRange = 300;
            enemy.damage = 12;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        });

        // Locked door for secret room
        this.lockedDoor = new LockedDoor(this, 1350, 400);
        this.physics.add.collider(this.player, this.lockedDoor);

        // Quest status text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Blizzard Pass', {
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
        }

        // Clear-all quest
        if (this.enemies.countActive() === 0 && !GameState.quests.tundra.blizzard) {
            GameState.quests.tundra.blizzard = true;
        }

        // Quest status display
        if (GameState.quests.tundra.blizzard) {
            this.questText.setText('Blizzard Pass: Cleared!');
        } else {
            this.questText.setText('Clear the Pass: ' + this.enemies.countActive() + ' wolves remaining');
        }

        // Locked door check
        if (this.lockedDoor) {
            this.lockedDoor.checkUnlock(this.enemies, this.player);
        }

        // Walk through unlocked door to secret room
        if (!this.transitioning && this.lockedDoor && this.lockedDoor.isUnlocked) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.lockedDoor.x, this.lockedDoor.y);
            if (dist < 30) {
                this.transitioning = true;
                GameState.secretRooms.blizzardPass = true;
                this.scene.start('BlizzardPassSecret');
            }
        }

        // Exit left -> Snow Cave
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('SnowCave');
        }

        // Exit right -> Ice Fortress
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('IceFortress');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
