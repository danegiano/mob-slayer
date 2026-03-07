class TundraVillageScene extends Phaser.Scene {
    constructor() { super('TundraVillage'); }

    preload() {
        this.load.image('tundra-village-bg', 'assets/backgrounds/tundra-village-bg.png?v=2');
    }

    create() {
        this.add.image(400, 225, 'tundra-village-bg');

        // Obstacles
        this.obstacles = this.physics.add.staticGroup();
        [{x:120,y:100},{x:300,y:80},{x:570,y:100},{x:700,y:80},{x:120,y:350},{x:680,y:360}].forEach(p => {
            const h = this.add.sprite(p.x, p.y, 'house', 0).setScale(3);
            this.physics.add.existing(h, true);
            this.obstacles.add(h);
        });
        [{x:50,y:50},{x:750,y:50},{x:50,y:400},{x:750,y:400},{x:400,y:350},{x:250,y:60}].forEach(p => {
            const t = this.add.sprite(p.x, p.y, 'tree', 0).setScale(2);
            this.physics.add.existing(t, true);
            this.obstacles.add(t);
        });

        // NPCs
        this.hunter = this.physics.add.sprite(250, 200, 'village_npc_1');
        this.hunter.play('village_npc_1_idle');
        this.hunter.body.setImmovable(true);

        this.elder = this.physics.add.sprite(400, 300, 'village_npc_2');
        this.elder.play('village_npc_2_idle');
        this.elder.body.setImmovable(true);

        this.scout = this.physics.add.sprite(600, 250, 'village_npc_3');
        this.scout.play('village_npc_3_idle');
        this.scout.body.setImmovable(true);

        this.shopkeeper = this.physics.add.sprite(550, 150, 'shopkeeper');
        this.shopkeeper.play('shopkeeper_idle');
        this.shopkeeper.body.setImmovable(true);

        this.npcs = [
            { sprite: this.hunter, name: 'Hunter', type: 'hunter' },
            { sprite: this.elder, name: 'Elder', type: 'elder' },
            { sprite: this.scout, name: 'Scout', type: 'scout' },
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
        const q = GameState.quests.tundra;
        const done = (q.wolves?1:0)+(q.amulet?1:0)+(q.blizzard?1:0);
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
            this.scene.start('FrozenLake');
        }
        if (!this.transitioning && this.player.x < 30 && !GameState.quests.tundra.miniGame) {
            this.transitioning = true;
            this.scene.start('TundraTargetPractice');
        }

        if (!this.dialogue.isOpen && !this.shop.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey) && minDist < 60) {
            this.talkToNpc(nearest);
        }
    }

    talkToNpc(npc) {
        const q = GameState.quests.tundra;
        if (npc.type === 'hunter') {
            this.dialogue.open('Hunter', q.wolves ?
                ['You cleared those wolves! The lake is safe again.'] :
                ['The Frozen Lake is overrun with ice wolves!', 'Can you take out 5 of them?', 'Head east to the Frozen Lake!'],
            null, npc.sprite);
        } else if (npc.type === 'elder') {
            this.dialogue.open('Elder', q.amulet ?
                ['You found the ancient amulet! Amazing!'] :
                ['An ancient amulet was lost in the Snow Cave...', 'Please find it! Past the Frozen Lake.'],
            null, npc.sprite);
        } else if (npc.type === 'scout') {
            this.dialogue.open('Scout', q.blizzard ?
                ['Blizzard Pass is clear! Great work!'] :
                ['Blizzard Pass is crawling with tough wolves.', 'Clear them ALL out!'],
            null, npc.sprite);
        } else if (npc.type === 'shopkeeper') {
            this.shop.open('tundra');
        }
    }
}
