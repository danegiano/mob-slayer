class ForestVillageScene extends Phaser.Scene {
    constructor() { super('ForestVillage'); }

    preload() {
        this.load.image('forest-village-bg', 'assets/backgrounds/forest-village-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'forest-village-bg');

        // Invisible ground for physics
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 400, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);

        // HUD
        this.hud = new HUD(this);

        // Dialogue
        this.dialogue = new DialogueBox(this);

        // Shop
        this.shop = new ShopMenu(this);

        // E key for interacting
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // --- NPCs ---
        // Herbalist at x=200
        this.herbalist = this.physics.add.sprite(200, 340, 'village_npc_2');
        this.herbalist.play('village_npc_2_idle');
        this.herbalist.setScale(2);
        this.physics.add.collider(this.herbalist, this.ground);

        // Mother at x=350
        this.mother = this.physics.add.sprite(350, 340, 'village_npc_3');
        this.mother.play('village_npc_3_idle');
        this.mother.setScale(2);
        this.physics.add.collider(this.mother, this.ground);

        // Warrior at x=500
        this.warrior = this.physics.add.sprite(500, 340, 'village_npc_1');
        this.warrior.play('village_npc_1_idle');
        this.warrior.setScale(2);
        this.physics.add.collider(this.warrior, this.ground);

        // Shopkeeper at x=650
        this.shopkeeper = this.physics.add.sprite(650, 340, 'shopkeeper');
        this.shopkeeper.play('shopkeeper_idle');
        this.shopkeeper.setScale(2);
        this.physics.add.collider(this.shopkeeper, this.ground);

        // NPC list for easy distance checks
        this.npcs = [
            { sprite: this.herbalist, name: 'Herbalist', type: 'herbalist' },
            { sprite: this.mother, name: 'Mother', type: 'mother' },
            { sprite: this.warrior, name: 'Warrior', type: 'warrior' },
            { sprite: this.shopkeeper, name: 'Shopkeeper', type: 'shopkeeper' }
        ];

        // Talk prompt
        this.talkPrompt = this.add.text(400, 320, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Mini-game prompt at x=100
        this.miniGamePrompt = this.add.text(100, 320, 'Press E for Obstacle Course', {
            fontSize: '11px', fill: '#88ff88'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Quest status bar at bottom
        this.questBar = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Forest Village', {
            fontSize: '20px', fill: '#88ff88'
        }).setOrigin(0.5);

        this.transitioning = false;
    }

    update() {
        // Don't move player when dialogue or shop is open
        if (!this.dialogue.isOpen && !this.shop.isOpen) {
            this.player.update();
        }
        this.hud.update();
        this.dialogue.update();
        this.shop.update();

        // Count completed quests
        const q = GameState.quests.darkforest;
        const done = (q.mushrooms ? 1 : 0) + (q.villager ? 1 : 0) +
                     (q.nest ? 1 : 0) + (q.miniGame ? 1 : 0);
        this.questBar.setText('Quests: ' + done + '/4 complete');

        // Find nearest NPC within 80px
        let nearestNpc = null;
        let nearestDist = Infinity;
        this.npcs.forEach(npc => {
            const dist = Math.abs(this.player.x - npc.sprite.x);
            if (dist < 80 && dist < nearestDist) {
                nearestDist = dist;
                nearestNpc = npc;
            }
        });

        // Show/hide talk prompt
        if (nearestNpc && !this.dialogue.isOpen && !this.shop.isOpen) {
            this.talkPrompt.setPosition(nearestNpc.sprite.x, nearestNpc.sprite.y - 50);
            this.talkPrompt.setVisible(true);
        } else {
            this.talkPrompt.setVisible(false);
        }

        // Mini-game entrance at x=100
        const miniDist = Math.abs(this.player.x - 100);
        this.miniGamePrompt.setVisible(
            miniDist < 80 && !this.dialogue.isOpen && !this.shop.isOpen &&
            !GameState.quests.darkforest.miniGame
        );

        // E key interactions (only when nothing is open)
        if (!this.dialogue.isOpen && !this.shop.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            // Check mini-game entrance first
            if (miniDist < 80 && !GameState.quests.darkforest.miniGame) {
                this.scene.start('ForestObstacleCourse');
                return;
            }

            // Talk to nearest NPC
            if (nearestNpc) {
                this.talkToNpc(nearestNpc);
            }
        }

        // Exit right → Mushroom Grove
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('MushroomGrove');
        }
    }

    talkToNpc(npc) {
        const q = GameState.quests.darkforest;

        if (npc.type === 'herbalist') {
            if (q.mushrooms) {
                this.dialogue.open('Herbalist', [
                    'You found all three mushrooms! Wonderful!',
                    'I can brew powerful potions with these.'
                ]);
            } else {
                this.dialogue.open('Herbalist', [
                    'I need 3 glowing mushrooms from the grove.',
                    'They grow in the Mushroom Grove to the east.',
                    'Please collect them for my potions!'
                ]);
            }
        } else if (npc.type === 'mother') {
            if (q.villager) {
                this.dialogue.open('Mother', [
                    'My child is safe! Thank you so much!',
                    'You are a true hero of the forest.'
                ]);
            } else {
                this.dialogue.open('Mother', [
                    'My child wandered into the Cursed Swamp!',
                    'Please find them and bring them home!',
                    'The swamp is past the Mushroom Grove.'
                ]);
            }
        } else if (npc.type === 'warrior') {
            if (q.nest) {
                this.dialogue.open('Warrior', [
                    'You cleared the shadow beast nest! Amazing!',
                    'The Hollow Tree is safe once more.'
                ]);
            } else {
                this.dialogue.open('Warrior', [
                    'Shadow beasts have taken over the Hollow Tree.',
                    'Their nest must be destroyed!',
                    'Clear them ALL out. It\'s past the Cursed Swamp.'
                ]);
            }
        } else if (npc.type === 'shopkeeper') {
            this.shop.open('darkforest');
        }
    }
}
