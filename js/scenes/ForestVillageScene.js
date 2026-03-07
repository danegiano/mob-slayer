class ForestVillageScene extends Phaser.Scene {
    constructor() { super('ForestVillage'); }

    preload() {
        this.load.image('forest-village-bg', 'assets/backgrounds/forest-village-bg.png?v=2');
    }

    create() {
        this.add.image(400, 225, 'forest-village-bg');

        // Obstacles
        this.obstacles = this.physics.add.staticGroup();
        [{x:120,y:100},{x:300,y:80},{x:570,y:100},{x:700,y:80},{x:120,y:350},{x:680,y:360}].forEach(p => {
            const h = this.add.sprite(p.x, p.y, 'house', 0).setScale(3);
            this.physics.add.existing(h, true);
            this.obstacles.add(h);
        });
        [{x:50,y:50},{x:750,y:50},{x:50,y:400},{x:750,y:400},{x:350,y:370},{x:500,y:350}].forEach(p => {
            const t = this.add.sprite(p.x, p.y, 'tree', 0).setScale(2);
            this.physics.add.existing(t, true);
            this.obstacles.add(t);
        });

        // NPCs
        this.herbalist = this.physics.add.sprite(250, 200, 'village_npc_2');
        this.herbalist.play('village_npc_2_idle');
        this.herbalist.body.setImmovable(true);

        this.mother = this.physics.add.sprite(450, 280, 'village_npc_3');
        this.mother.play('village_npc_3_idle');
        this.mother.body.setImmovable(true);

        this.warrior = this.physics.add.sprite(600, 200, 'village_npc_1');
        this.warrior.play('village_npc_1_idle');
        this.warrior.body.setImmovable(true);

        this.shopkeeper = this.physics.add.sprite(350, 180, 'shopkeeper');
        this.shopkeeper.play('shopkeeper_idle');
        this.shopkeeper.body.setImmovable(true);

        this.npcs = [
            { sprite: this.herbalist, name: 'Herbalist', type: 'herbalist' },
            { sprite: this.mother, name: 'Mother', type: 'mother' },
            { sprite: this.warrior, name: 'Warrior', type: 'warrior' },
            { sprite: this.shopkeeper, name: 'Shopkeeper', type: 'shopkeeper' }
        ];

        // Player
        this.player = new Player(this, 200, 225);
        this.physics.add.collider(this.player, this.obstacles);
        this.npcs.forEach(n => this.physics.add.collider(this.player, n.sprite));

        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);
        this.dialogue = new DialogueBox(this);
        this.shop = new ShopMenu(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.talkPrompt = this.add.text(0, 0, 'Press E', {
            fontSize: '8px', fill: '#fff'
        }).setOrigin(0.5, 1).setVisible(false).setDepth(50);

        this.questBar = this.add.text(0, 0, '', {
            fontSize: '8px', fill: '#ffdd00'
        }).setOrigin(0.5, 1).setDepth(50);

        this.transitioning = false;

        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, 800, 450);
        this.physics.world.setBounds(0, 0, 800, 450);
    }

    update() {
        if (!this.dialogue.isOpen && !this.shop.isOpen && !this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();
        this.dialogue.update();
        this.shop.update();

        const cam = this.cameras.main;
        const vw = cam.width / cam.zoom;
        const vh = cam.height / cam.zoom;
        const q = GameState.quests.darkforest;
        const done = (q.mushrooms?1:0)+(q.villager?1:0)+(q.nest?1:0);
        this.questBar.setText('Quests: ' + done + '/3');
        this.questBar.setPosition(cam.scrollX + vw/2, cam.scrollY + vh - 4);

        let nearest = null, minDist = Infinity;
        this.npcs.forEach(n => {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, n.sprite.x, n.sprite.y);
            if (d < minDist) { minDist = d; nearest = n; }
        });

        if (minDist < 60 && !this.dialogue.isOpen && !this.shop.isOpen) {
            this.talkPrompt.setPosition(nearest.sprite.x, nearest.sprite.y - 30);
            this.talkPrompt.setVisible(true);
        } else {
            this.talkPrompt.setVisible(false);
        }

        if (!this.transitioning && this.player.x > 770) {
            this.transitioning = true;
            this.scene.start('MushroomGrove');
        }
        if (!this.transitioning && this.player.x < 30 && !GameState.quests.darkforest.miniGame) {
            this.transitioning = true;
            this.scene.start('ForestObstacleCourse');
        }

        if (!this.dialogue.isOpen && !this.shop.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey) && minDist < 60) {
            this.talkToNpc(nearest);
        }
    }

    talkToNpc(npc) {
        const q = GameState.quests.darkforest;
        if (npc.type === 'herbalist') {
            this.dialogue.open('Herbalist', q.mushrooms ?
                ['You found all three mushrooms! Wonderful!'] :
                ['I need 3 glowing mushrooms from the grove.', 'Head east to the Mushroom Grove!'],
            null, npc.sprite);
        } else if (npc.type === 'mother') {
            this.dialogue.open('Mother', q.villager ?
                ['My child is safe! Thank you!'] :
                ['My child wandered into the Cursed Swamp!', 'Please find them!'],
            null, npc.sprite);
        } else if (npc.type === 'warrior') {
            this.dialogue.open('Warrior', q.nest ?
                ['The shadow beast nest is cleared!'] :
                ['Shadow beasts in the Hollow Tree!', 'Clear them ALL out!'],
            null, npc.sprite);
        } else if (npc.type === 'shopkeeper') {
            this.shop.open('darkforest');
        }
    }
}
