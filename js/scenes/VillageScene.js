class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    preload() {
        this.load.image('village-bg', 'assets/backgrounds/village-bg.png?v=4');
    }

    create() {
        // Background image
        this.add.image(400, 225, 'village-bg');

        // Obstacles (trees, houses, well)
        this.obstacles = this.physics.add.staticGroup();

        // Houses (3x scale)
        [{x:120,y:100},{x:300,y:80},{x:570,y:100},{x:700,y:80},{x:120,y:350},{x:680,y:360}].forEach(p => {
            const h = this.add.sprite(p.x, p.y, 'house', 0).setScale(3);
            this.physics.add.existing(h, true);
            this.obstacles.add(h);
        });

        // Trees (2x scale)
        [{x:50,y:50},{x:750,y:50},{x:50,y:400},{x:750,y:400},{x:350,y:350},{x:500,y:340},{x:200,y:60},{x:450,y:50}].forEach(p => {
            const t = this.add.sprite(p.x, p.y, 'tree', 0).setScale(2);
            this.physics.add.existing(t, true);
            this.obstacles.add(t);
        });

        // Well (2x scale)
        const well = this.add.sprite(400, 280, 'well', 0).setScale(2);
        this.physics.add.existing(well, true);
        this.obstacles.add(well);

        // --- NPCs ---
        // Blacksmith (center)
        this.blacksmith = this.physics.add.sprite(400, 200, 'blacksmith');
        this.blacksmith.play('blacksmith_idle');
        this.blacksmith.body.setImmovable(true);
        this.blacksmith.npcName = 'Blacksmith';

        // Farmer (bottom left area)
        this.farmer = this.physics.add.sprite(200, 300, 'village_npc_1');
        this.farmer.play('village_npc_1_idle');
        this.farmer.body.setImmovable(true);
        this.farmer.npcName = 'Farmer';

        // Cook (top right area)
        this.cook = this.physics.add.sprite(600, 200, 'village_npc_2');
        this.cook.play('village_npc_2_idle');
        this.cook.body.setImmovable(true);
        this.cook.npcName = 'Cook';

        // Kid (bottom right area)
        this.kid = this.physics.add.sprite(550, 320, 'village_npc_3');
        this.kid.play('village_npc_3_idle');
        this.kid.body.setImmovable(true);
        this.kid.npcName = 'Kid';

        this.npcs = [this.blacksmith, this.farmer, this.cook, this.kid];

        // Player
        this.player = new Player(this, 200, 225);
        this.physics.add.collider(this.player, this.obstacles);
        this.npcs.forEach(npc => this.physics.add.collider(this.player, npc));

        // --- Quest items hidden in village ---
        this.questItems = this.physics.add.group();

        // 3 ingredients for cook quest (hidden around the village)
        if (GameState.villageQuests.ingredients === 'active') {
            const ingredientSpots = [{x:80,y:300},{x:650,y:130},{x:450,y:380}];
            const placed = GameState.villageQuests.ingredientCount;
            for (let i = placed; i < 3; i++) {
                const item = this.physics.add.sprite(ingredientSpots[i].x, ingredientSpots[i].y, 'collectible');
                item.play('collectible_idle');
                item.setScale(1);
                item.questType = 'ingredient';
                this.questItems.add(item);
            }
        }

        // Lost toy for kid quest
        if (GameState.villageQuests.lostToy === 'active') {
            const toy = this.physics.add.sprite(170, 165, 'collectible');
            toy.play('collectible_idle');
            toy.setScale(1);
            toy.setTint(0xff8800);
            toy.questType = 'toy';
            this.questItems.add(toy);
        }

        // Pickup quest items
        this.physics.add.overlap(this.player, this.questItems, (player, item) => {
            if (item.questType === 'ingredient') {
                GameState.villageQuests.ingredientCount++;
                item.destroy();
                if (GameState.villageQuests.ingredientCount >= 3) {
                    this.showPickupText('All ingredients found!');
                } else {
                    this.showPickupText('Ingredient ' + GameState.villageQuests.ingredientCount + '/3');
                }
            } else if (item.questType === 'toy') {
                GameState.villageQuests.lostToy = 'found';
                item.destroy();
                this.showPickupText('Found the lost toy!');
            }
        });

        // HUD & Dialogue
        this.hud = new HUD(this);
        this.dialogue = new DialogueBox(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Talk prompt (reused for nearest NPC)
        this.talkPrompt = this.add.text(0, 0, 'Press E', {
            fontSize: '8px', fill: '#fff'
        }).setOrigin(0.5, 1).setVisible(false).setDepth(50);

        // Quest tracker text
        this.questText = this.add.text(0, 0, '', {
            fontSize: '8px', fill: '#ffcc00', align: 'right'
        }).setOrigin(1, 0).setDepth(150);

        this.transitioning = false;

        // Camera
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, 800, 450);
        this.physics.world.setBounds(0, 0, 800, 450);
    }

    showPickupText(msg) {
        const t = this.add.text(this.player.x, this.player.y - 30, msg, {
            fontSize: '6px', fill: '#00ff00'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: t, alpha: 0, y: t.y - 20, duration: 1500,
            onComplete: () => t.destroy()
        });
    }

    getActiveQuests() {
        const lines = [];
        const vq = GameState.villageQuests;
        if (vq.delivery === 'active') lines.push('Deliver bread to Cook');
        if (vq.ingredients === 'active') lines.push('Find ingredients ' + vq.ingredientCount + '/3');
        if (vq.lostToy === 'active' || vq.lostToy === 'found') lines.push('Return toy to Kid');
        return lines;
    }

    getNearestNPC() {
        let nearest = null;
        let minDist = Infinity;
        this.npcs.forEach(npc => {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
            if (d < minDist) { minDist = d; nearest = npc; }
        });
        return { npc: nearest, dist: minDist };
    }

    update() {
        if (!this.dialogue.isOpen) {
            this.player.update();
        }
        this.hud.update();
        this.dialogue.update();

        // Quest tracker in top-right of camera view
        const cam = this.cameras.main;
        const vw = cam.width / cam.zoom;
        const vh = cam.height / cam.zoom;
        const quests = this.getActiveQuests();
        this.questText.setText(quests.join('\n'));
        this.questText.setPosition(cam.scrollX + vw - 4, cam.scrollY + 4);

        // Talk prompt near closest NPC
        const { npc, dist } = this.getNearestNPC();
        if (dist < 60 && !this.dialogue.isOpen) {
            this.talkPrompt.setPosition(npc.x, npc.y - 30);
            this.talkPrompt.setVisible(true);
        } else {
            this.talkPrompt.setVisible(false);
        }

        // Exit right
        if (!this.transitioning && this.player.x > 770) {
            this.transitioning = true;
            if (GameState.storyPhase >= 2) {
                this.scene.start('WoodsNight');
            } else {
                this.scene.start('WoodsDay');
            }
        }

        // Talk to NPC
        if (!this.dialogue.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey) && dist < 60) {
            this.talkToNPC(npc);
        }
    }

    talkToNPC(npc) {
        const vq = GameState.villageQuests;

        if (npc === this.blacksmith) {
            // Blacksmith — story dialogue + delivery target
            if (vq.delivery === 'active') {
                this.dialogue.open('Blacksmith', [
                    'Is that bread from the Farmer?',
                    'Thanks! I was starving!',
                    'Here, take 50 gold.'
                ], () => {
                    vq.delivery = 'done';
                    GameState.gold += 50;
                    this.showPickupText('+50 gold!');
                }, npc);
            } else if (GameState.storyPhase === 0) {
                this.dialogue.open('Blacksmith', [
                    'Hey there, adventurer!',
                    "Take this wood sword. It's not much, but it'll do.",
                    'I heard strange noises from the woods to the east...',
                    'Talk to the villagers, they might need help!',
                    'Be careful out there!'
                ], null, npc);
            } else if (GameState.storyPhase === 1) {
                this.dialogue.open('Blacksmith', [
                    "What's that sword?! It's glowing!",
                    "That's the legendary \u30E2\u30D6\u30B9\u30EC\u30A4\u30E4\u30FC!",
                    "I'll give you 1000 gold for it!",
                    '...',
                    'No? Fine. But something feels wrong tonight...',
                    "The animals in the woods... they're changing."
                ], () => {
                    GameState.storyPhase = 2;
                }, npc);
            } else {
                this.dialogue.open('Blacksmith', [
                    'Stay strong out there!',
                    'The woods are dangerous at night.'
                ], null, npc);
            }

        } else if (npc === this.farmer) {
            // Farmer — delivery quest
            if (vq.delivery === 'none') {
                this.dialogue.open('Farmer', [
                    'Hey! Can you help me?',
                    'I baked bread for the Blacksmith.',
                    'But my legs are tired...',
                    'Can you deliver it to him?'
                ], () => {
                    vq.delivery = 'active';
                    this.showPickupText('Quest: Deliver bread!');
                }, npc);
            } else if (vq.delivery === 'active') {
                this.dialogue.open('Farmer', [
                    'Please bring the bread to the Blacksmith!',
                    "He's the big guy with the hammer."
                ], null, npc);
            } else {
                this.dialogue.open('Farmer', [
                    'Thanks for delivering the bread!',
                    'You are a true hero.'
                ], null, npc);
            }

        } else if (npc === this.cook) {
            // Cook — ingredients quest
            if (vq.ingredients === 'none') {
                this.dialogue.open('Cook', [
                    "I'm the village cook!",
                    'I want to make a special stew.',
                    'But I need 3 ingredients!',
                    'They grow around the village.',
                    'Can you find them for me?'
                ], () => {
                    vq.ingredients = 'active';
                    this.showPickupText('Quest: Find 3 ingredients!');
                    // Spawn the ingredients
                    const spots = [{x:80,y:300},{x:650,y:130},{x:450,y:380}];
                    spots.forEach(p => {
                        const item = this.physics.add.sprite(p.x, p.y, 'collectible');
                        item.play('collectible_idle');
                        item.questType = 'ingredient';
                        this.questItems.add(item);
                        this.physics.add.overlap(this.player, item, () => {
                            GameState.villageQuests.ingredientCount++;
                            item.destroy();
                            if (GameState.villageQuests.ingredientCount >= 3) {
                                this.showPickupText('All ingredients found!');
                            } else {
                                this.showPickupText('Ingredient ' + GameState.villageQuests.ingredientCount + '/3');
                            }
                        });
                    });
                }, npc);
            } else if (vq.ingredients === 'active' && vq.ingredientCount >= 3) {
                this.dialogue.open('Cook', [
                    'You found all 3 ingredients!',
                    'Let me cook this up...',
                    'Here, have 75 gold for your trouble!'
                ], () => {
                    vq.ingredients = 'done';
                    GameState.gold += 75;
                    this.showPickupText('+75 gold!');
                }, npc);
            } else if (vq.ingredients === 'active') {
                this.dialogue.open('Cook', [
                    'Still looking for ingredients?',
                    'You have ' + vq.ingredientCount + ' out of 3.',
                    'Look around the village!'
                ], null, npc);
            } else {
                this.dialogue.open('Cook', [
                    'That stew was delicious!',
                    'Thanks again!'
                ], null, npc);
            }

        } else if (npc === this.kid) {
            // Kid — lost toy quest
            if (vq.lostToy === 'none') {
                this.dialogue.open('Kid', [
                    'Waaah! I lost my toy!',
                    'I was playing near the houses...',
                    'Can you find it? Please?'
                ], () => {
                    vq.lostToy = 'active';
                    this.showPickupText('Quest: Find the lost toy!');
                    // Spawn the toy (behind top-left house)
                    const toy = this.physics.add.sprite(170, 165, 'collectible');
                    toy.play('collectible_idle');
                    toy.setTint(0xff8800);
                    toy.questType = 'toy';
                    this.questItems.add(toy);
                    this.physics.add.overlap(this.player, toy, () => {
                        GameState.villageQuests.lostToy = 'found';
                        toy.destroy();
                        this.showPickupText('Found the lost toy!');
                    });
                }, npc);
            } else if (vq.lostToy === 'found') {
                this.dialogue.open('Kid', [
                    'My toy! You found it!',
                    'You are the best!',
                    'Here, take my savings... 60 gold!'
                ], () => {
                    vq.lostToy = 'done';
                    GameState.gold += 60;
                    this.showPickupText('+60 gold!');
                }, npc);
            } else if (vq.lostToy === 'active') {
                this.dialogue.open('Kid', [
                    'Did you find my toy yet?',
                    'I think it was near the houses...'
                ], null, npc);
            } else {
                this.dialogue.open('Kid', [
                    'I love my toy!',
                    'Thanks for finding it!'
                ], null, npc);
            }
        }
    }
}
