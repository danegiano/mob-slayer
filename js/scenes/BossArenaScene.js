class BossArenaScene extends Phaser.Scene {
    constructor() { super('BossArena'); }

    preload() {
        this.load.image('boss-arena-bg', 'assets/backgrounds/boss-arena-bg.png?v=4');
    }

    create() {
        // Tile background to fill 1600x900
        this.add.image(400, 225, 'boss-arena-bg');
        this.add.image(1200, 225, 'boss-arena-bg');
        this.add.image(400, 675, 'boss-arena-bg');
        this.add.image(1200, 675, 'boss-arena-bg');

        this.player = new Player(this, 150, 450);

        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        this.boss = new TrollBoss(this, 800, 450);

        this.bossDefeated = false;

        // Locked door — opens when boss is dead
        this.lockedDoor = new LockedDoor(this, 1400, 400);
        this.physics.add.collider(this.player, this.lockedDoor);

        // Track boss as enemy group for door unlock check
        this.bossGroup = this.physics.add.group();

        // Camera: zoom in and follow player
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

        // Player attack hitting boss
        if (this.player.attackHitbox && this.boss && !this.boss.isDead) {
            const b1 = this.player.attackHitbox.getBounds();
            const b2 = this.boss.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                if (!this.boss.justHit) {
                    this.boss.takeDamage(this.player.currentHitDamage);
                    const fx = SWORD_DATA[GameState.equipment.sword].effect;
                    if (fx === 'burn' || fx === 'lightning') this.boss.applyBurn(this);
                    else if (fx === 'freeze') this.boss.applyFreeze(this);
                    this.boss.justHit = true;
                    this.time.delayedCall(300, () => {
                        if (this.boss) this.boss.justHit = false;
                    });
                }
            }
        }

        // Boss defeated -> victory
        if (this.boss && this.boss.isDead && !this.bossDefeated) {
            this.bossDefeated = true;
            GameState.comboUnlocked = true;
            this.time.delayedCall(2000, () => {
                this.scene.start('Victory');
            });
        }

        // Boss attacks hitting player
        if (this.boss && this.boss.isAttacking && !this.player.isDodging) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.boss.x, this.boss.y
            );
            if (dist < 80 && !this.boss.playerHitThisAttack) {
                GameState.health -= 20;
                if (GameState.health < 0) GameState.health = 0;
                this.boss.playerHitThisAttack = true;
                this.player.setTint(0xff0000);
                this.time.delayedCall(200, () => this.player.clearTint());
                this.time.delayedCall(500, () => {
                    if (this.boss) this.boss.playerHitThisAttack = false;
                });
            }
        }

        // Locked door check — unlocks when boss is dead
        if (this.lockedDoor && !this.lockedDoor.isUnlocked) {
            if (this.boss && this.boss.isDead) {
                this.lockedDoor.unlock();
            } else {
                // Show lock text if player is close
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.lockedDoor.x, this.lockedDoor.y);
                if (dist < 60) {
                    this.lockedDoor.lockText.setVisible(true);
                } else {
                    this.lockedDoor.lockText.setVisible(false);
                }
            }
        }

        // Walk through unlocked door to secret room
        if (!this.transitioning && this.lockedDoor && this.lockedDoor.isUnlocked) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.lockedDoor.x, this.lockedDoor.y);
            if (dist < 30) {
                this.transitioning = true;
                GameState.secretRooms.bossArena = true;
                this.scene.start('BossArenaSecret');
            }
        }

        // Death check
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
