class CursedSwampScene extends Phaser.Scene {
    constructor() { super('CursedSwamp'); }

    preload() {
        this.load.image('cursed-swamp-bg', 'assets/backgrounds/cursed-swamp-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'cursed-swamp-bg');
        this.add.image(1200, 225, 'cursed-swamp-bg');
        this.add.image(400, 675, 'cursed-swamp-bg');
        this.add.image(1200, 675, 'cursed-swamp-bg');

        // Tree obstacles
        this.obstacles = this.physics.add.staticGroup();
        const treePositions = [
            {x:150,y:100}, {x:400,y:80}, {x:650,y:120}, {x:300,y:280},
            {x:550,y:300}, {x:700,y:200}, {x:100,y:400}, {x:450,y:380},
            // Expanded area
            {x:900,y:100}, {x:1150,y:150}, {x:1350,y:80}, {x:1500,y:200},
            {x:850,y:300}, {x:1050,y:350}, {x:1250,y:280}, {x:1450,y:400},
            {x:200,y:550}, {x:450,y:600}, {x:700,y:540},
            {x:900,y:550}, {x:1150,y:620}, {x:1350,y:560}, {x:1500,y:640},
            {x:150,y:750}, {x:400,y:780}, {x:650,y:720},
            {x:900,y:750}, {x:1150,y:800}, {x:1400,y:730}
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

        // Dialogue
        this.dialogue = new DialogueBox(this);

        // E key
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 8 Shadow Beasts spread across area
        this.enemies = this.physics.add.group();
        const beastPositions = [
            {x:250,y:200}, {x:500,y:350}, {x:700,y:180},
            {x:350,y:500}, {x:600,y:600},
            {x:950,y:300}, {x:1200,y:450}, {x:1400,y:250}
        ];
        beastPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'shadow_beast', 30);
            enemy.speed = 120;
            enemy.aggroRange = 250;
            enemy.damage = 15;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        });

        // Lost child NPC (only if quest not done)
        this.child = null;
        if (!GameState.quests.darkforest.villager) {
            this.child = this.physics.add.sprite(720, 400, 'lost_child');
            this.child.play('lost_child_idle');
            this.child.setScale(2);
        }

        // Talk prompt
        this.talkPrompt = this.add.text(720, 370, 'Press E to talk', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Breakable wall for secret room
        this.breakableWall = new BreakableWall(this, 1400, 650);
        this.physics.add.collider(this.player, this.breakableWall);
        this.secretPassageOpen = false;

        // Scene title
        this.add.text(400, 50, 'Cursed Swamp', {
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
        if (!this.dialogue.isOpen && !this.inventory.isOpen) {
            this.player.update();
        }
        this.hud.update();
        this.inventory.update();
        this.dialogue.update();

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

        // Lost child interaction
        if (this.child && !GameState.quests.darkforest.villager) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.child.x, this.child.y);
            this.talkPrompt.setVisible(dist < 50 && !this.dialogue.isOpen);

            if (dist < 50 && !this.dialogue.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.dialogue.open('Lost Child', [
                    'You found me! I was so scared!',
                    'Thank you! I\'ll run back to the village!'
                ], () => {
                    GameState.quests.darkforest.villager = true;
                    if (this.child) {
                        this.child.destroy();
                        this.child = null;
                    }
                    this.talkPrompt.setVisible(false);
                });
            }
        } else {
            this.talkPrompt.setVisible(false);
        }

        // Secret passage
        if (!this.transitioning && this.secretPassageOpen) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 1400, 650);
            if (dist < 30) {
                this.transitioning = true;
                GameState.secretRooms.cursedSwamp = true;
                this.scene.start('CursedSwampSecret');
            }
        }

        // Exit left -> Mushroom Grove
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('MushroomGrove');
        }

        // Exit right -> Hollow Tree
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('HollowTree');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
