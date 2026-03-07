class RuinsVillageScene extends Phaser.Scene {
    constructor() { super('RuinsVillage'); }

    preload() {
        this.load.image('ruins-village-bg', 'assets/backgrounds/ruins-village-bg.png?v=2');
    }

    create() {
        this.add.image(400, 225, 'ruins-village-bg');

        // Obstacles
        this.obstacles = this.physics.add.staticGroup();
        [{x:120,y:100},{x:300,y:80},{x:570,y:100},{x:700,y:80},{x:120,y:350},{x:680,y:360}].forEach(p => {
            const h = this.add.sprite(p.x, p.y, 'house', 0).setScale(3);
            this.physics.add.existing(h, true);
            this.obstacles.add(h);
        });
        [{x:50,y:50},{x:750,y:50},{x:50,y:400},{x:750,y:400},{x:450,y:380},{x:200,y:60}].forEach(p => {
            const t = this.add.sprite(p.x, p.y, 'tree', 0).setScale(2);
            this.physics.add.existing(t, true);
            this.obstacles.add(t);
        });

        // NPCs
        this.builder = this.physics.add.sprite(250, 200, 'village_npc_1');
        this.builder.play('village_npc_1_idle');
        this.builder.body.setImmovable(true);

        this.scholar = this.physics.add.sprite(400, 300, 'village_npc_2');
        this.scholar.play('village_npc_2_idle');
        this.scholar.body.setImmovable(true);

        this.priestess = this.physics.add.sprite(600, 250, 'village_npc_3');
        this.priestess.play('village_npc_3_idle');
        this.priestess.body.setImmovable(true);

        this.shopkeeper = this.physics.add.sprite(500, 160, 'shopkeeper');
        this.shopkeeper.play('shopkeeper_idle');
        this.shopkeeper.body.setImmovable(true);

        this.npcs = [
            { sprite: this.builder, name: 'Builder', type: 'builder' },
            { sprite: this.scholar, name: 'Scholar', type: 'scholar' },
            { sprite: this.priestess, name: 'Priestess', type: 'priestess' },
            { sprite: this.shopkeeper, name: 'Shopkeeper', type: 'shopkeeper' }
        ];

        // Player
        this.player = new Player(this, 200, 225);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.obstacles);
        this.npcs.forEach(n => this.physics.add.collider(this.player, n.sprite));

        this.hud = new HUD(this);
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
        if (!this.dialogue.isOpen && !this.shop.isOpen) this.player.update();
        this.hud.update();
        this.dialogue.update();
        this.shop.update();

        const cam = this.cameras.main;
        const vw = cam.width / cam.zoom;
        const vh = cam.height / cam.zoom;
        const q = GameState.quests.ruins;
        const done = (q.bridge?1:0)+(q.scroll?1:0)+(q.runes?1:0);
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
            this.scene.start('CrumblingBridge');
        }
        if (!this.transitioning && this.player.x < 30 && !GameState.quests.ruins.miniGame) {
            this.transitioning = true;
            this.scene.start('RuinsMemoryPuzzle');
        }

        if (!this.dialogue.isOpen && !this.shop.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey) && minDist < 60) {
            this.talkToNpc(nearest);
        }
    }

    talkToNpc(npc) {
        const q = GameState.quests.ruins;
        if (npc.type === 'builder') {
            this.dialogue.open('Builder', q.bridge ?
                ['The bridge is safe now!'] :
                ['Stone golems guard the Crumbling Bridge!', 'Defeat them all!'],
            null, npc.sprite);
        } else if (npc.type === 'scholar') {
            this.dialogue.open('Scholar', q.scroll ?
                ['The scroll! Ancient knowledge preserved!'] :
                ['An ancient scroll is in the Buried Library.', 'Find it among the ruins!'],
            null, npc.sprite);
        } else if (npc.type === 'priestess') {
            this.dialogue.open('Priestess', q.runes ?
                ['The runes are sealed. Thank you!'] :
                ['3 rune stones in the Lava Pit need activating.', 'Touch each one to seal the breach!'],
            null, npc.sprite);
        } else if (npc.type === 'shopkeeper') {
            this.shop.open('ruins');
        }
    }
}
