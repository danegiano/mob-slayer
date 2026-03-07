class HollowTreeScene extends Phaser.Scene {
    constructor() { super('HollowTree'); }

    preload() {
        this.load.image('hollow-tree-bg', 'assets/backgrounds/hollow-tree-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'hollow-tree-bg');
        this.add.image(1200, 225, 'hollow-tree-bg');
        this.add.image(400, 675, 'hollow-tree-bg');
        this.add.image(1200, 675, 'hollow-tree-bg');

        // Tree obstacles
        this.obstacles = this.physics.add.staticGroup();
        const treePositions = [
            {x:150,y:80}, {x:400,y:120}, {x:650,y:60}, {x:300,y:250},
            {x:550,y:280}, {x:700,y:200}, {x:100,y:400}, {x:450,y:380},
            // Expanded area
            {x:900,y:100}, {x:1150,y:180}, {x:1350,y:80}, {x:1500,y:150},
            {x:850,y:300}, {x:1050,y:280}, {x:1250,y:350}, {x:1450,y:280},
            {x:200,y:550}, {x:450,y:580}, {x:700,y:520},
            {x:900,y:550}, {x:1150,y:600}, {x:1350,y:540}, {x:1500,y:620},
            {x:150,y:750}, {x:400,y:720}, {x:650,y:780},
            {x:900,y:730}, {x:1150,y:780}, {x:1400,y:720}
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

        // Enemies — 10 tougher Shadow Beasts spread across area
        this.enemies = this.physics.add.group();
        const beastPositions = [
            {x:250,y:180}, {x:500,y:300}, {x:700,y:150},
            {x:300,y:450}, {x:600,y:550}, {x:200,y:650},
            {x:950,y:250}, {x:1200,y:400}, {x:1400,y:300}, {x:1100,y:600}
        ];
        beastPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'shadow_beast', 20);
            enemy.speed = 140;
            enemy.aggroRange = 300;
            enemy.damage = 18;
            enemy.goldValue = 10;
            this.enemies.add(enemy);
        });

        // Locked door for secret room (mini-boss inside)
        this.lockedDoor = new LockedDoor(this, 1400, 450);
        this.physics.add.collider(this.player, this.lockedDoor);

        // Quest status text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Hollow Tree', {
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

        // Clear-all quest
        if (this.enemies.countActive() === 0 && !GameState.quests.darkforest.nest) {
            GameState.quests.darkforest.nest = true;
        }

        // Quest status display
        if (GameState.quests.darkforest.nest) {
            this.questText.setText('Shadow Nest: Cleared!');
        } else {
            this.questText.setText('Clear the Nest: ' + this.enemies.countActive() + ' beasts remaining');
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
                GameState.secretRooms.hollowTree = true;
                this.scene.start('HollowTreeSecret');
            }
        }

        // Exit left -> Cursed Swamp
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('CursedSwamp');
        }

        // Exit right -> Shadow Keep
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('ShadowKeep');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
