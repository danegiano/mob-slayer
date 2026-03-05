class WoodsDayScene extends Phaser.Scene {
    constructor() { super('WoodsDay'); }

    create() {
        this.cameras.main.setBackgroundColor('#2d5a1e');

        this.ground = this.add.rectangle(400, 430, 800, 40, 0x3a2a1a);
        this.physics.add.existing(this.ground, true);

        // Trees
        for (let i = 0; i < 5; i++) {
            const tx = 100 + i * 170;
            this.add.rectangle(tx, 350, 20, 80, 0x5a3a1a);
            this.add.circle(tx, 300, 35, 0x1a6a1a);
        }

        this.player = new Player(this, 30, 350);
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);

        // Glowing sword pickup
        if (GameState.storyPhase === 0) {
            this.sword = this.add.rectangle(700, 400, 8, 30, 0xff44ff);
            this.physics.add.existing(this.sword, true);
            this.tweens.add({
                targets: this.sword,
                alpha: 0.4, yoyo: true, repeat: -1, duration: 500
            });
            this.physics.add.overlap(this.player, this.sword, () => {
                this.pickUpSword();
            });
        }

        // Exit left -> village
        this.exitLeft = this.add.zone(10, 225, 20, 450);
        this.physics.add.existing(this.exitLeft, true);
        this.physics.add.overlap(this.player, this.exitLeft, () => {
            this.scene.start('Village');
        });

        this.swordPickedUp = false;
    }

    pickUpSword() {
        if (this.swordPickedUp) return;
        this.swordPickedUp = true;
        GameState.weapon = 'slayer';
        GameState.storyPhase = 1;
        this.player.attackDamage = 25;
        this.sword.destroy();

        const swordText = this.add.text(400, 200, '\u30E2\u30D6\u30B9\u30EC\u30A4\u30E4\u30FC', {
            fontSize: '48px', fill: '#ff44ff'
        }).setOrigin(0.5);
        const subText = this.add.text(400, 250, 'Mob Slayer', {
            fontSize: '20px', fill: '#ffccff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [swordText, subText],
            alpha: 0, y: '-=30',
            duration: 3000, delay: 1500,
            onComplete: () => { swordText.destroy(); subText.destroy(); }
        });
    }

    update() {
        this.player.update();
        this.hud.update();
    }
}
