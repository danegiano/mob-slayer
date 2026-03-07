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
        for (let i = 0; i < 5; i++) {
            const t = scene.add.text(400, 160 + i * 35, '', {
                fontSize: '13px', fill: '#fff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);
            this.itemTexts.push(t);
        }

        this.hintText = scene.add.text(400, 345, 'UP/DOWN to select, E to buy, Q to close', {
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

        // Base items every shop has
        this.items = [
            { name: 'Health Potion', desc: 'Restore 50 HP', cost: 50, type: 'potion' }
        ];

        // Area-specific equipment
        if (area === 'village') {
            if (!GameState.inventory.swords.includes('iron')) {
                this.items.push({ name: 'Iron Sword', desc: 'ATK 20', cost: 200, type: 'sword', itemId: 'iron' });
            }
            if (!GameState.inventory.armors.includes('leather')) {
                this.items.push({ name: 'Leather Armor', desc: 'DEF 20%', cost: 150, type: 'armor', itemId: 'leather' });
            }
        } else if (area === 'tundra') {
            if (!GameState.inventory.armors.includes('chain')) {
                this.items.push({ name: 'Chain Armor', desc: 'DEF 40%', cost: 300, type: 'armor', itemId: 'chain' });
            }
        }

        // Stat upgrades (skip for village — it has its own system via dialogue)
        if (area !== 'village' && GameState.shopUpgrades[area]) {
            const upgrades = GameState.shopUpgrades[area];
            if (!upgrades.maxHp) {
                this.items.push({ name: 'Max HP Up', desc: '+25 Max HP', cost: 100, type: 'maxhp' });
            }
            if (!upgrades.attack) {
                this.items.push({ name: 'Attack Up', desc: '+5 Damage', cost: 150, type: 'attack' });
            }
        }

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
        // Clear unused text slots
        for (let i = this.items.length; i < this.itemTexts.length; i++) {
            this.itemTexts[i].setText('');
        }
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
        } else if (item.type === 'sword') {
            if (!GameState.inventory.swords.includes(item.itemId)) {
                GameState.inventory.swords.push(item.itemId);
            }
            GameState.equipment.sword = item.itemId;
            item.bought = true;
        } else if (item.type === 'armor') {
            if (!GameState.inventory.armors.includes(item.itemId)) {
                GameState.inventory.armors.push(item.itemId);
            }
            GameState.equipment.armor = item.itemId;
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
