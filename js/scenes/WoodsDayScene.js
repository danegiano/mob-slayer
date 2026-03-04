class WoodsDayScene extends Phaser.Scene {
    constructor() { super('WoodsDay'); }

    create() {
        // Animated background — canopy, light rays, pollen, mushrooms
        Background.woodsDay(this);

        // Ground
        this.ground = this.add.rectangle(400, 430, 800, 40, 0x5a3a1a);
        this.physics.add.existing(this.ground, true);

        // Trees (dark green rectangles as decoration)
        for (let i = 0; i < 6; i++) {
            const tx = 80 + i * 130;
            this.add.rectangle(tx, 340, 30, 120, 0x2d5a1e); // trunk
            this.add.rectangle(tx, 270, 70, 60, 0x1a4010);  // leaves
        }

        // Player
        this.player = new Player(this, 50, 350);
        this.physics.add.collider(this.player, this.ground);

        // The Slayer sword — glowing yellow rectangle
        if (GameState.storyPhase === 0) {
            if (!this.textures.exists('slayer-sword')) {
                const swordGfx = this.add.graphics();
                swordGfx.fillStyle(0xffdd00);
                swordGfx.fillRect(0, 0, 12, 36);
                swordGfx.generateTexture('slayer-sword', 12, 36);
                swordGfx.destroy();
            }

            this.sword = this.physics.add.staticImage(650, 392, 'slayer-sword');

            // Glow effect — pulsing tint
            this.tweens.add({
                targets: this.sword,
                alpha: { from: 0.6, to: 1 },
                duration: 600,
                yoyo: true,
                repeat: -1
            });

            // Pickup label
            this.swordLabel = this.add.text(650, 360, '???', {
                fontSize: '12px', fill: '#ffdd00'
            }).setOrigin(0.5);

            // Overlap for pickup
            this.physics.add.overlap(this.player, this.sword, () => {
                this.pickUpSword();
            });
        }

        // HUD
        this.hud = new HUD(this);

        // Scene label
        this.add.text(16, 16, 'The Woods', { fontSize: '18px', fill: '#ddd' });

        // Dialogue box
        this.dialogue = new DialogueBox(this);

        // Left edge — back to village
        this.exitZone = this.add.rectangle(0, 225, 20, 450, 0x000000, 0);
        this.physics.add.existing(this.exitZone, true);
        this.physics.add.overlap(this.player, this.exitZone, () => {
            this.scene.start('Village');
        });
    }

    pickUpSword() {
        if (GameState.storyPhase !== 0) return;
        GameState.storyPhase = 1;
        GameState.weapon = 'slayer';
        this.player.attackDamage = 25;

        this.sword.destroy();
        this.swordLabel.destroy();

        this.dialogue.open([
            "You found a glowing sword!",
            "The blade reads: モブスレイヤー",
            "\"Slayer of the Mobs\"",
            "You feel its power flowing through you..."
        ]);
    }

    update() {
        if (this.dialogue && this.dialogue.isOpen) {
            this.dialogue.update();
            this.player.setVelocityX(0);
            return;
        }

        this.player.update();
        this.hud.update();
        this.dialogue.update();
    }
}
