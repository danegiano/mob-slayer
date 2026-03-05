class TundraVillageScene extends Phaser.Scene {
    constructor() { super('TundraVillage'); }

    preload() {
        this.load.image('tundra-village-bg', 'assets/backgrounds/tundra-village-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'tundra-village-bg');

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
        // Hunter at x=200
        this.hunter = this.physics.add.sprite(200, 340, 'village_npc_1');
        this.hunter.play('village_npc_1_idle');
        this.hunter.setScale(2);
        this.physics.add.collider(this.hunter, this.ground);

        // Elder at x=350
        this.elder = this.physics.add.sprite(350, 340, 'village_npc_2');
        this.elder.play('village_npc_2_idle');
        this.elder.setScale(2);
        this.physics.add.collider(this.elder, this.ground);

        // Scout at x=500
        this.scout = this.physics.add.sprite(500, 340, 'village_npc_3');
        this.scout.play('village_npc_3_idle');
        this.scout.setScale(2);
        this.physics.add.collider(this.scout, this.ground);

        // Shopkeeper at x=650
        this.shopkeeper = this.physics.add.sprite(650, 340, 'shopkeeper');
        this.shopkeeper.play('shopkeeper_idle');
        this.shopkeeper.setScale(2);
        this.physics.add.collider(this.shopkeeper, this.ground);

        // NPC list for easy distance checks
        this.npcs = [
            { sprite: this.hunter, name: 'Hunter', type: 'hunter' },
            { sprite: this.elder, name: 'Elder', type: 'elder' },
            { sprite: this.scout, name: 'Scout', type: 'scout' },
            { sprite: this.shopkeeper, name: 'Shopkeeper', type: 'shopkeeper' }
        ];

        // Talk prompt
        this.talkPrompt = this.add.text(400, 320, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Mini-game prompt at x=100
        this.miniGamePrompt = this.add.text(100, 320, 'Press E for Target Practice', {
            fontSize: '11px', fill: '#88ccff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Quest status bar at bottom
        this.questBar = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Tundra Village', {
            fontSize: '20px', fill: '#88ccff'
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
        const q = GameState.quests.tundra;
        const done = (q.wolves ? 1 : 0) + (q.amulet ? 1 : 0) +
                     (q.blizzard ? 1 : 0) + (q.miniGame ? 1 : 0);
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
            !GameState.quests.tundra.miniGame
        );

        // E key interactions (only when nothing is open)
        if (!this.dialogue.isOpen && !this.shop.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            // Check mini-game entrance first
            if (miniDist < 80 && !GameState.quests.tundra.miniGame) {
                this.scene.start('TundraTargetPractice');
                return;
            }

            // Talk to nearest NPC
            if (nearestNpc) {
                this.talkToNpc(nearestNpc);
            }
        }

        // Exit right → Frozen Lake
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('FrozenLake');
        }
    }

    talkToNpc(npc) {
        const q = GameState.quests.tundra;

        if (npc.type === 'hunter') {
            if (q.wolves) {
                this.dialogue.open('Hunter', [
                    'You cleared those wolves! The lake is safe again.',
                    'You\'re a real hero, adventurer.'
                ]);
            } else {
                this.dialogue.open('Hunter', [
                    'The Frozen Lake is overrun with ice wolves!',
                    'Can you take out 5 of them for us?',
                    'Head east to the Frozen Lake. Be careful!'
                ]);
            }
        } else if (npc.type === 'elder') {
            if (q.amulet) {
                this.dialogue.open('Elder', [
                    'You found the ancient amulet! Amazing!',
                    'This will protect our village through the winter.'
                ]);
            } else {
                this.dialogue.open('Elder', [
                    'An ancient amulet was lost in the Snow Cave...',
                    'It has the power to ward off the endless cold.',
                    'Please find it! The cave is past the Frozen Lake.'
                ]);
            }
        } else if (npc.type === 'scout') {
            if (q.blizzard) {
                this.dialogue.open('Scout', [
                    'Blizzard Pass is clear! Great work!',
                    'The path to the Ice Fortress is open now.'
                ]);
            } else {
                this.dialogue.open('Scout', [
                    'Blizzard Pass is crawling with tough wolves.',
                    'We need someone to clear them ALL out.',
                    'It\'s past the Snow Cave. Watch your back!'
                ]);
            }
        } else if (npc.type === 'shopkeeper') {
            this.shop.open('tundra');
        }
    }
}
