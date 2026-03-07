class CursedSwampScene extends Phaser.Scene {
    constructor() { super('CursedSwamp'); }

    preload() {
        this.load.image('cursed-swamp-bg', 'assets/backgrounds/cursed-swamp-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'cursed-swamp-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);

        // Dialogue
        this.dialogue = new DialogueBox(this);

        // E key for interacting
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Enemies — 6 Shadow Beasts
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);

        for (let i = 0; i < 6; i++) {
            const x = 150 + i * 90;
            const enemy = new Enemy(this, x, 340, 'shadow_beast', 12);
            enemy.speed = 120;
            enemy.aggroRange = 250;
            enemy.damage = 15;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        }

        // Lost child NPC at x=720 (only if quest not done)
        this.child = null;
        if (!GameState.quests.darkforest.villager) {
            this.child = this.physics.add.sprite(720, 360, 'lost_child');
            this.child.play('lost_child_idle');
            this.child.setScale(2);
            this.physics.add.collider(this.child, this.ground);
        }

        // Talk prompt
        this.talkPrompt = this.add.text(720, 330, 'Press E to talk', {
            fontSize: '11px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Cursed Swamp', {
            fontSize: '20px', fill: '#88ff88'
        }).setOrigin(0.5);

        this.transitioning = false;
    }

    update() {
        // Don't move player when dialogue is open
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
        }

        // Lost child interaction
        if (this.child && !GameState.quests.darkforest.villager) {
            const childDist = Math.abs(this.player.x - this.child.x);
            this.talkPrompt.setVisible(childDist < 80 && !this.dialogue.isOpen);

            if (childDist < 80 && !this.dialogue.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.dialogue.open('Lost Child', [
                    'You found me! I was so scared!',
                    'Thank you! I\'ll run back to the village!'
                ], () => {
                    // On dialogue complete — mark quest done and remove child
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

        // Exit left → Mushroom Grove
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('MushroomGrove');
        }

        // Exit right → Hollow Tree
        if (!this.transitioning && this.player.x > 750) {
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
