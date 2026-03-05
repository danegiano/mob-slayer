class RuinsVillageScene extends Phaser.Scene {
    constructor() { super('RuinsVillage'); }

    preload() {
        this.load.image('ruins-village-bg', 'assets/backgrounds/ruins-village-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'ruins-village-bg');

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
        // Builder at x=200
        this.builder = this.physics.add.sprite(200, 340, 'village_npc_1');
        this.builder.play('village_npc_1_idle');
        this.builder.setScale(2);
        this.physics.add.collider(this.builder, this.ground);

        // Scholar at x=350
        this.scholar = this.physics.add.sprite(350, 340, 'village_npc_2');
        this.scholar.play('village_npc_2_idle');
        this.scholar.setScale(2);
        this.physics.add.collider(this.scholar, this.ground);

        // Priestess at x=500
        this.priestess = this.physics.add.sprite(500, 340, 'village_npc_3');
        this.priestess.play('village_npc_3_idle');
        this.priestess.setScale(2);
        this.physics.add.collider(this.priestess, this.ground);

        // Shopkeeper at x=650
        this.shopkeeper = this.physics.add.sprite(650, 340, 'shopkeeper');
        this.shopkeeper.play('shopkeeper_idle');
        this.shopkeeper.setScale(2);
        this.physics.add.collider(this.shopkeeper, this.ground);

        // NPC list for easy distance checks
        this.npcs = [
            { sprite: this.builder, name: 'Builder', type: 'builder' },
            { sprite: this.scholar, name: 'Scholar', type: 'scholar' },
            { sprite: this.priestess, name: 'Priestess', type: 'priestess' },
            { sprite: this.shopkeeper, name: 'Shopkeeper', type: 'shopkeeper' }
        ];

        // Talk prompt
        this.talkPrompt = this.add.text(400, 320, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Mini-game prompt at x=100
        this.miniGamePrompt = this.add.text(100, 320, 'Press E for Memory Puzzle', {
            fontSize: '11px', fill: '#ddaa44'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Quest status bar at bottom
        this.questBar = this.add.text(400, 440, '', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Scene title
        this.add.text(400, 50, 'Ruins Village', {
            fontSize: '20px', fill: '#ddaa44'
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
        const q = GameState.quests.ruins;
        const done = (q.bridge ? 1 : 0) + (q.scroll ? 1 : 0) +
                     (q.runes ? 1 : 0) + (q.miniGame ? 1 : 0);
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
            !GameState.quests.ruins.miniGame
        );

        // E key interactions (only when nothing is open)
        if (!this.dialogue.isOpen && !this.shop.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            // Check mini-game entrance first
            if (miniDist < 80 && !GameState.quests.ruins.miniGame) {
                this.scene.start('RuinsMemoryPuzzle');
                return;
            }

            // Talk to nearest NPC
            if (nearestNpc) {
                this.talkToNpc(nearestNpc);
            }
        }

        // Exit right → Crumbling Bridge
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('CrumblingBridge');
        }
    }

    talkToNpc(npc) {
        const q = GameState.quests.ruins;

        if (npc.type === 'builder') {
            if (q.bridge) {
                this.dialogue.open('Builder', [
                    'The bridge is safe now!'
                ]);
            } else {
                this.dialogue.open('Builder', [
                    'Stone golems guard the Crumbling Bridge!',
                    'Defeat them all to make it safe!'
                ]);
            }
        } else if (npc.type === 'scholar') {
            if (q.scroll) {
                this.dialogue.open('Scholar', [
                    'The scroll! Ancient knowledge preserved!'
                ]);
            } else {
                this.dialogue.open('Scholar', [
                    'An ancient scroll is hidden in the Buried Library.',
                    'Find it among the ruins!'
                ]);
            }
        } else if (npc.type === 'priestess') {
            if (q.runes) {
                this.dialogue.open('Priestess', [
                    'The runes are sealed. Thank you!'
                ]);
            } else {
                this.dialogue.open('Priestess', [
                    '3 rune stones in the Lava Pit need activating.',
                    'Touch each one to seal the breach!'
                ]);
            }
        } else if (npc.type === 'shopkeeper') {
            this.shop.open('ruins');
        }
    }
}
