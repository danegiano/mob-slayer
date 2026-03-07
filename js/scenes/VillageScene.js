class VillageScene extends Phaser.Scene {
    constructor() { super('Village'); }

    preload() {
        this.load.image('village-bg', 'assets/backgrounds/village-bg.png?v=4');
    }

    create() {
        this.add.image(400, 225, 'village-bg');

        // Obstacles
        this.obstacles = this.physics.add.staticGroup();
        [{x:120,y:100},{x:300,y:80},{x:570,y:100},{x:700,y:80},{x:120,y:350},{x:680,y:360}].forEach(p => {
            const h = this.add.sprite(p.x, p.y, 'house', 0).setScale(3);
            this.physics.add.existing(h, true);
            this.obstacles.add(h);
        });
        [{x:50,y:50},{x:750,y:50},{x:50,y:400},{x:750,y:400},{x:350,y:350},{x:500,y:340},{x:200,y:60},{x:450,y:50}].forEach(p => {
            const t = this.add.sprite(p.x, p.y, 'tree', 0).setScale(2);
            this.physics.add.existing(t, true);
            this.obstacles.add(t);
        });
        this.wellSprite = this.add.sprite(400, 280, 'well', 0).setScale(2);
        this.physics.add.existing(this.wellSprite, true);
        this.obstacles.add(this.wellSprite);

        // --- NPCs ---
        this.blacksmith = this.physics.add.sprite(400, 200, 'blacksmith');
        this.blacksmith.play('blacksmith_idle');
        this.blacksmith.body.setImmovable(true);
        this.blacksmith.npcName = 'Blacksmith';

        this.farmer = this.physics.add.sprite(200, 300, 'village_npc_1');
        this.farmer.play('village_npc_1_idle');
        this.farmer.body.setImmovable(true);
        this.farmer.npcName = 'Farmer';

        this.cook = this.physics.add.sprite(600, 200, 'village_npc_2');
        this.cook.play('village_npc_2_idle');
        this.cook.body.setImmovable(true);
        this.cook.npcName = 'Cook';

        this.kid = this.physics.add.sprite(550, 320, 'village_npc_3');
        this.kid.play('village_npc_3_idle');
        this.kid.body.setImmovable(true);
        this.kid.npcName = 'Kid';
        this.kidFollowing = false;

        this.npcs = [this.blacksmith, this.farmer, this.cook, this.kid];

        // Player
        this.player = new Player(this, 200, 225);
        this.physics.add.collider(this.player, this.obstacles);
        this.npcs.forEach(npc => this.physics.add.collider(this.player, npc));

        // Quest items group
        this.questItems = this.physics.add.group();

        // Restore quest items if scene re-entered
        if (GameState.villageQuests.ingredients === 'active') {
            const spots = [{x:80,y:300},{x:650,y:130},{x:450,y:380}];
            for (let i = GameState.villageQuests.ingredientCount; i < 3; i++) {
                this.spawnIngredient(spots[i].x, spots[i].y);
            }
        }
        if (GameState.villageQuests.lostToy === 'active') {
            this.spawnToy();
        }
        if (GameState.villageQuests.escort === 'walking') {
            this.startEscortWalk();
        }

        // HUD & Dialogue
        this.hud = new HUD(this);
        this.dialogue = new DialogueBox(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.talkPrompt = this.add.text(0, 0, 'Press E', {
            fontSize: '8px', fill: '#fff'
        }).setOrigin(0.5, 1).setVisible(false).setDepth(50);

        this.questText = this.add.text(0, 0, '', {
            fontSize: '8px', fill: '#ffcc00', align: 'right'
        }).setOrigin(1, 0).setDepth(150);

        // Timer text for time challenge
        this.timerText = this.add.text(0, 0, '', {
            fontSize: '12px', fill: '#ff4444'
        }).setOrigin(0.5, 0).setDepth(150).setVisible(false);

        this.transitioning = false;
        this.timeChallengeClock = null;
        this.timeChallengeItems = 0;

        // Camera
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, 800, 450);
        this.physics.world.setBounds(0, 0, 800, 450);
    }

    // --- Helper methods ---
    showPickupText(msg) {
        const t = this.add.text(this.player.x, this.player.y - 30, msg, {
            fontSize: '8px', fill: '#00ff00'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: t, alpha: 0, y: t.y - 20, duration: 1500,
            onComplete: () => t.destroy()
        });
    }

    spawnIngredient(x, y) {
        const item = this.physics.add.sprite(x, y, 'collectible');
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
    }

    spawnToy() {
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
    }

    spawnTimeChallengeItem(x, y) {
        const item = this.physics.add.sprite(x, y, 'collectible');
        item.play('collectible_idle');
        item.setTint(0x00ffff);
        item.questType = 'timeItem';
        this.questItems.add(item);
        this.physics.add.overlap(this.player, item, () => {
            this.timeChallengeItems++;
            item.destroy();
            if (this.timeChallengeItems >= 5) {
                this.showPickupText('Got all 5! Go back to Cook!');
                if (this.timeChallengeClock) this.timeChallengeClock.remove();
                this.timerText.setVisible(false);
                GameState.villageQuests.timeChallenge = 'collected';
            } else {
                this.showPickupText('Herb ' + this.timeChallengeItems + '/5');
            }
        });
    }

    startEscortWalk() {
        this.kidFollowing = true;
        this.kid.body.setImmovable(false);
    }

    getActiveQuests() {
        const lines = [];
        const vq = GameState.villageQuests;
        if (vq.delivery === 'active') lines.push('Deliver bread to Blacksmith');
        if (vq.ingredients === 'active') lines.push('Ingredients ' + vq.ingredientCount + '/3');
        if (vq.lostToy === 'active' || vq.lostToy === 'found') lines.push('Return toy to Kid');
        if (vq.timeChallenge === 'active') lines.push('Herbs ' + this.timeChallengeItems + '/5');
        if (vq.timeChallenge === 'collected') lines.push('Return herbs to Cook');
        if (vq.escort === 'walking') lines.push('Walk Kid to the well');
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

    // --- Update ---
    update() {
        if (!this.dialogue.isOpen) {
            this.player.update();
        }
        this.hud.update();
        this.dialogue.update();

        // Quest tracker
        const cam = this.cameras.main;
        const vw = cam.width / cam.zoom;
        const quests = this.getActiveQuests();
        this.questText.setText(quests.join('\n'));
        this.questText.setPosition(cam.scrollX + vw - 4, cam.scrollY + 4);

        // Timer display for time challenge
        if (this.timerText.visible) {
            this.timerText.setPosition(cam.scrollX + vw / 2, cam.scrollY + 4);
        }

        // Kid follows player during escort
        if (this.kidFollowing && GameState.villageQuests.escort === 'walking') {
            const dist = Phaser.Math.Distance.Between(this.kid.x, this.kid.y, this.player.x, this.player.y);
            if (dist > 40) {
                const angle = Phaser.Math.Angle.Between(this.kid.x, this.kid.y, this.player.x, this.player.y);
                this.kid.setVelocityX(Math.cos(angle) * 80);
                this.kid.setVelocityY(Math.sin(angle) * 80);
            } else {
                this.kid.setVelocity(0, 0);
            }
            // Check if kid reached the well
            const wellDist = Phaser.Math.Distance.Between(this.kid.x, this.kid.y, 400, 280);
            if (wellDist < 50) {
                this.kidFollowing = false;
                this.kid.setVelocity(0, 0);
                this.kid.body.setImmovable(true);
                GameState.villageQuests.escort = 'done';
                GameState.gold += 80;
                this.showPickupText('+80 gold!');
                this.dialogue.open('Kid', [
                    'We made it to the well!',
                    'That was fun! Thanks!',
                    'Here, take 80 gold!'
                ], null, this.kid);
            }
        }

        // Talk prompt
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

    // --- NPC Dialogue ---
    talkToNPC(npc) {
        const vq = GameState.villageQuests;
        const shop = GameState.villageShop;

        if (npc === this.blacksmith) {
            this.talkBlacksmith(vq, shop, npc);
        } else if (npc === this.farmer) {
            this.talkFarmer(vq, npc);
        } else if (npc === this.cook) {
            this.talkCook(vq, npc);
        } else if (npc === this.kid) {
            this.talkKid(vq, npc);
        }
    }

    talkBlacksmith(vq, shop, npc) {
        // Delivery quest takes priority
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
            return;
        }

        // Story dialogue
        if (GameState.storyPhase === 0) {
            this.dialogue.open('Blacksmith', [
                'Hey there, adventurer!',
                "Take this wood sword. It's not much, but it'll do.",
                'Talk to the villagers, they might need help!',
                'Come back when you have gold, I sell upgrades!'
            ], null, npc);
            return;
        }
        if (GameState.storyPhase === 1) {
            this.dialogue.open('Blacksmith', [
                "What's that sword?! It's glowing!",
                "That's the legendary \u30E2\u30D6\u30B9\u30EC\u30A4\u30E4\u30FC!",
                "I'll give you 1000 gold for it!",
                '...',
                'No? Fine. But something feels wrong tonight...',
                "The animals in the woods... they're changing."
            ], () => { GameState.storyPhase = 2; }, npc);
            return;
        }

        // Shop — offer upgrades
        if (!shop.attackBoost && GameState.gold >= 100) {
            this.dialogue.open('Blacksmith', [
                'I can sharpen your blade!',
                'Attack Boost: +10 damage',
                'Cost: 100 gold',
                'You have ' + GameState.gold + ' gold.'
            ], () => {
                shop.attackBoost = true;
                GameState.gold -= 100;
                GameState.attackBonus += 10;
                this.showPickupText('Attack +10!');
            }, npc);
        } else if (!shop.hpBoost && GameState.gold >= 75) {
            this.dialogue.open('Blacksmith', [
                'I made some armor for you!',
                'HP Boost: +50 max health',
                'Cost: 75 gold',
                'You have ' + GameState.gold + ' gold.'
            ], () => {
                shop.hpBoost = true;
                GameState.gold -= 75;
                GameState.maxHealth += 50;
                GameState.health += 50;
                this.showPickupText('Max HP +50!');
            }, npc);
        } else if (!shop.speedBoost && GameState.gold >= 120) {
            this.dialogue.open('Blacksmith', [
                'Light boots! You will run faster!',
                'Speed Boost: move faster',
                'Cost: 120 gold',
                'You have ' + GameState.gold + ' gold.'
            ], () => {
                shop.speedBoost = true;
                GameState.gold -= 120;
                this.player.moveSpeed += 30;
                this.showPickupText('Speed up!');
            }, npc);
        } else if (!shop.attackBoost || !shop.hpBoost || !shop.speedBoost) {
            this.dialogue.open('Blacksmith', [
                'I have upgrades but you need more gold!',
                'Go help the villagers for gold.',
                'You have ' + GameState.gold + ' gold.'
            ], null, npc);
        } else {
            this.dialogue.open('Blacksmith', [
                "You're fully upgraded!",
                'Go show those monsters who is boss!'
            ], null, npc);
        }
    }

    talkFarmer(vq, npc) {
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
                'The village is lucky to have you.'
            ], null, npc);
        }
    }

    talkCook(vq, npc) {
        // First quest: collect 3 ingredients
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
                const spots = [{x:80,y:300},{x:650,y:130},{x:450,y:380}];
                spots.forEach(p => this.spawnIngredient(p.x, p.y));
            }, npc);
        } else if (vq.ingredients === 'active' && vq.ingredientCount >= 3) {
            this.dialogue.open('Cook', [
                'You found all 3 ingredients!',
                'Let me cook this up...',
                'Here, have 75 gold!'
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

        // Second quest: time challenge
        } else if (vq.timeChallenge === 'none') {
            this.dialogue.open('Cook', [
                'That stew was great!',
                'Want another challenge?',
                'Collect 5 rare herbs in 25 seconds!',
                'Think you are fast enough?'
            ], () => {
                vq.timeChallenge = 'active';
                this.timeChallengeItems = 0;
                this.showPickupText('GO! Find 5 herbs!');
                // Spawn 5 herbs around village
                const spots = [
                    {x:100,y:200},{x:650,y:300},{x:350,y:400},
                    {x:500,y:150},{x:250,y:350}
                ];
                spots.forEach(p => this.spawnTimeChallengeItem(p.x, p.y));
                // Start countdown
                this.timerText.setVisible(true);
                let timeLeft = 25;
                this.timerText.setText(timeLeft + 's');
                this.timeChallengeClock = this.time.addEvent({
                    delay: 1000, repeat: 24,
                    callback: () => {
                        timeLeft--;
                        this.timerText.setText(timeLeft + 's');
                        if (timeLeft <= 0 && this.timeChallengeItems < 5) {
                            vq.timeChallenge = 'none';
                            this.timerText.setVisible(false);
                            this.showPickupText('Time up! Try again!');
                            // Remove remaining herbs
                            this.questItems.children.each(item => {
                                if (item.questType === 'timeItem') item.destroy();
                            });
                        }
                    }
                });
            }, npc);
        } else if (vq.timeChallenge === 'collected') {
            this.dialogue.open('Cook', [
                'You got all the herbs! Amazing!',
                'You are super fast!',
                'Here is 100 gold!'
            ], () => {
                vq.timeChallenge = 'done';
                GameState.gold += 100;
                this.showPickupText('+100 gold!');
            }, npc);
        } else if (vq.timeChallenge === 'done') {
            this.dialogue.open('Cook', [
                'No more challenges for now.',
                'But that stew is the best!'
            ], null, npc);
        }
    }

    talkKid(vq, npc) {
        // First quest: find lost toy
        if (vq.lostToy === 'none') {
            this.dialogue.open('Kid', [
                'Waaah! I lost my toy!',
                'I was playing near the houses...',
                'Can you find it? Please?'
            ], () => {
                vq.lostToy = 'active';
                this.showPickupText('Quest: Find the lost toy!');
                this.spawnToy();
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

        // Second quest: escort to well
        } else if (vq.escort === 'none' && vq.lostToy === 'done') {
            this.dialogue.open('Kid', [
                'Thanks for my toy!',
                "Hey... can you walk me to the well?",
                "I'm scared to go alone..."
            ], () => {
                vq.escort = 'walking';
                this.startEscortWalk();
                this.showPickupText('Quest: Walk Kid to the well!');
            }, npc);
        } else if (vq.escort === 'walking') {
            this.dialogue.open('Kid', [
                "Let's go to the well!",
                "I'm right behind you!"
            ], null, npc);
        } else if (vq.escort === 'done') {
            this.dialogue.open('Kid', [
                'The well is so cool!',
                'Thanks for walking with me!'
            ], null, npc);
        }
    }
}
