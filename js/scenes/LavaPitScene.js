class LavaPitScene extends Phaser.Scene {
    constructor() { super('LavaPit'); }

    preload() {
        this.load.image('lava-pit-bg', 'assets/backgrounds/lava-pit-bg.png');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'lava-pit-bg');
        this.add.image(1200, 225, 'lava-pit-bg');
        this.add.image(400, 675, 'lava-pit-bg');
        this.add.image(1200, 675, 'lava-pit-bg');

        // Rock obstacles
        this.obstacles = this.physics.add.staticGroup();
        const rockPositions = [
            {x:200,y:100}, {x:450,y:130}, {x:700,y:80}, {x:350,y:280},
            {x:600,y:320}, {x:150,y:420}, {x:500,y:400},
            {x:900,y:120}, {x:1150,y:200}, {x:1400,y:100}, {x:1500,y:280},
            {x:850,y:380}, {x:1100,y:420}, {x:1300,y:350},
            {x:200,y:580}, {x:500,y:550}, {x:700,y:600},
            {x:900,y:560}, {x:1200,y:620}, {x:1400,y:580},
            {x:150,y:750}, {x:450,y:780}, {x:700,y:720},
            {x:950,y:760}, {x:1200,y:800}, {x:1450,y:740}
        ];
        rockPositions.forEach(p => {
            const r = this.add.rectangle(p.x, p.y, 24, 24, 0xcc5533).setDepth(3);
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

        // Enemies — 9 tougher Stone Golems
        this.enemies = this.physics.add.group();
        const golemPositions = [
            {x:250,y:200}, {x:500,y:350}, {x:700,y:150},
            {x:300,y:500}, {x:600,y:600}, {x:200,y:700},
            {x:950,y:280}, {x:1200,y:450}, {x:1400,y:300}
        ];
        golemPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, 'stone_golem', 140);
            enemy.speed = 50;
            enemy.aggroRange = 200;
            enemy.damage = 25;
            enemy.goldValue = 15;
            this.enemies.add(enemy);
        });

        // 3 Rune stones (only if quest not done)
        this.runeStones = [];
        this.runesActivated = 0;
        if (!GameState.quests.ruins.runes) {
            const runePositions = [{x:300,y:300}, {x:600,y:500}, {x:1000,y:350}];
            runePositions.forEach(p => {
                const rune = this.physics.add.sprite(p.x, p.y, 'collectible');
                rune.play('collectible_idle');
                rune.setScale(2);
                rune.activated = false;
                this.runeStones.push(rune);
            });
        }

        // Activate prompt
        this.activatePrompt = this.add.text(400, 360, 'Press E to activate', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Locked door for secret room (mini-boss inside)
        this.lockedDoor = new LockedDoor(this, 1400, 450);
        this.physics.add.collider(this.player, this.lockedDoor);

        // Quest status text
        this.questText = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Lava Pit', {
            fontSize: '20px', fill: '#ff6644'
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

        // Rune stone activation
        let nearRune = null;
        this.runeStones.forEach(rune => {
            if (rune.activated) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, rune.x, rune.y);
            if (dist < 50) {
                nearRune = rune;
            }
        });

        if (nearRune && !GameState.quests.ruins.runes) {
            this.activatePrompt.setPosition(nearRune.x, nearRune.y - 30);
            this.activatePrompt.setVisible(true);

            if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                nearRune.activated = true;
                nearRune.setTint(0x00ff00);
                this.runesActivated++;

                if (this.runesActivated >= 3) {
                    GameState.quests.ruins.runes = true;

                    const doneText = this.add.text(this.player.x, this.player.y - 40, 'All Runes Activated!', {
                        fontSize: '24px', fill: '#00ff00'
                    }).setOrigin(0.5).setDepth(50);
                    this.tweens.add({
                        targets: doneText,
                        alpha: 0, y: doneText.y - 30,
                        duration: 2000, delay: 1000,
                        onComplete: () => doneText.destroy()
                    });
                }
            }
        } else {
            this.activatePrompt.setVisible(false);
        }

        // Quest status display
        if (GameState.quests.ruins.runes) {
            this.questText.setText('Rune Stones: All Sealed!');
        } else {
            this.questText.setText('Rune Stones: ' + this.runesActivated + '/3 activated');
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
                GameState.secretRooms.lavaPit = true;
                this.scene.start('LavaPitSecret');
            }
        }

        // Exit left -> Buried Library
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('BuriedLibrary');
        }

        // Exit right -> Shattered Temple
        if (!this.transitioning && this.player.x > 1570) {
            this.transitioning = true;
            this.scene.start('ShatteredTemple');
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
