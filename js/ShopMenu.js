class ShopMenu {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.selectedIndex = 0;
        this.items = [];

        this.bg = scene.add.rectangle(400, 225, 500, 300, 0x000000, 0.85)
            .setScrollFactor(0).setDepth(200).setVisible(false);
        this.titleText = scene.add.text(400, 100, 'SHOP', {
            fontSize: '20px', fill: '#ffdd00'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);
        this.goldText = scene.add.text(400, 130, '', {
            fontSize: '14px', fill: '#ffdd00'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);

        this.itemTexts = [];
        for (let i = 0; i < 3; i++) {
            const t = scene.add.text(400, 170 + i * 50, '', {
                fontSize: '14px', fill: '#fff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);
            this.itemTexts.push(t);
        }

        this.hintText = scene.add.text(400, 340, 'UP/DOWN to select, E to buy, Q to close', {
            fontSize: '11px', fill: '#aaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);

        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.qKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    }

    open(area) {
        this.isOpen = true;
        this.selectedIndex = 0;
        this.area = area;

        const hpBought = GameState.shopUpgrades[area].maxHp;
        const atkBought = GameState.shopUpgrades[area].attack;

        this.items = [
            { name: 'Health Potion', desc: 'Restore 50 HP', cost: 50, type: 'potion' },
            { name: 'Max HP Up', desc: '+25 Max HP', cost: 100, type: 'maxhp', bought: hpBought },
            { name: 'Attack Up', desc: '+5 Damage', cost: 150, type: 'attack', bought: atkBought }
        ];

        this.bg.setVisible(true);
        this.titleText.setVisible(true);
        this.goldText.setVisible(true);
        this.hintText.setVisible(true);
        this.itemTexts.forEach(t => t.setVisible(true));
        this.refresh();
    }

    refresh() {
        this.goldText.setText('Gold: ' + GameState.gold + 'g');
        this.items.forEach((item, i) => {
            let line = item.name + ' - ' + item.cost + 'g  (' + item.desc + ')';
            if (item.bought) line = item.name + ' - SOLD OUT';
            const prefix = (i === this.selectedIndex) ? '> ' : '  ';
            this.itemTexts[i].setText(prefix + line);
            this.itemTexts[i].setFill(i === this.selectedIndex ? '#ffdd00' : '#fff');
        });
    }

    update() {
        if (!this.isOpen) return;

        if (Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey)) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.refresh();
        }
        if (Phaser.Input.Keyboard.JustDown(this.downKey) || Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
            this.refresh();
        }

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.buySelected();
        }

        if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
            this.close();
        }
    }

    buySelected() {
        const item = this.items[this.selectedIndex];
        if (item.bought) return;
        if (GameState.gold < item.cost) return;

        GameState.gold -= item.cost;

        if (item.type === 'potion') {
            GameState.health = Math.min(GameState.health + 50, GameState.maxHealth);
        } else if (item.type === 'maxhp') {
            GameState.maxHealth += 25;
            GameState.health = Math.min(GameState.health + 25, GameState.maxHealth);
            GameState.shopUpgrades[this.area].maxHp = true;
            item.bought = true;
        } else if (item.type === 'attack') {
            GameState.attackBonus += 5;
            GameState.shopUpgrades[this.area].attack = true;
            item.bought = true;
        }

        this.refresh();
    }

    close() {
        this.isOpen = false;
        this.bg.setVisible(false);
        this.titleText.setVisible(false);
        this.goldText.setVisible(false);
        this.hintText.setVisible(false);
        this.itemTexts.forEach(t => t.setVisible(false));
    }
}
