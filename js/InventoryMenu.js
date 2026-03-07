class InventoryMenu {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.selectedIndex = 0;
        this.tab = 'swords';
        this.items = [];

        this.bg = scene.add.rectangle(400, 225, 500, 320, 0x000000, 0.9)
            .setScrollFactor(0).setDepth(300).setVisible(false);
        this.titleText = scene.add.text(400, 80, 'INVENTORY', {
            fontSize: '20px', fill: '#ffdd00'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.tabText = scene.add.text(400, 105, '', {
            fontSize: '12px', fill: '#aaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.equippedText = scene.add.text(400, 125, '', {
            fontSize: '12px', fill: '#88ff88'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.itemTexts = [];
        for (let i = 0; i < 6; i++) {
            const t = scene.add.text(400, 155 + i * 30, '', {
                fontSize: '13px', fill: '#fff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);
            this.itemTexts.push(t);
        }

        this.statsText = scene.add.text(400, 345, '', {
            fontSize: '11px', fill: '#88ccff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.hintText = scene.add.text(400, 370, 'UP/DOWN select | E equip | TAB switch | I close', {
            fontSize: '10px', fill: '#aaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.iKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.tabKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
        this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    }

    open() {
        this.isOpen = true;
        this.selectedIndex = 0;
        this.tab = 'swords';
        this.setVisible(true);
        this.refresh();
    }

    close() {
        this.isOpen = false;
        this.setVisible(false);
    }

    setVisible(visible) {
        this.bg.setVisible(visible);
        this.titleText.setVisible(visible);
        this.tabText.setVisible(visible);
        this.equippedText.setVisible(visible);
        this.statsText.setVisible(visible);
        this.hintText.setVisible(visible);
        this.itemTexts.forEach(t => t.setVisible(visible));
    }

    refresh() {
        if (this.tab === 'swords') {
            this.items = GameState.inventory.swords.map(id => ({
                id, ...SWORD_DATA[id]
            }));
            this.tabText.setText('[ SWORDS ]   armors');
            const equipped = SWORD_DATA[GameState.equipment.sword];
            this.equippedText.setText('Equipped: ' + equipped.name + ' (ATK: ' + equipped.attack + ')');
        } else {
            this.items = GameState.inventory.armors.map(id => ({
                id, ...ARMOR_DATA[id]
            }));
            this.tabText.setText('  swords   [ ARMORS ]');
            const equipped = ARMOR_DATA[GameState.equipment.armor];
            this.equippedText.setText('Equipped: ' + equipped.name + ' (DEF: ' + Math.round(equipped.reduction * 100) + '%)');
        }

        this.itemTexts.forEach((t, i) => {
            if (i < this.items.length) {
                const item = this.items[i];
                const isEquipped = (this.tab === 'swords' && GameState.equipment.sword === item.id) ||
                                   (this.tab === 'armors' && GameState.equipment.armor === item.id);
                const prefix = (i === this.selectedIndex) ? '> ' : '  ';
                const suffix = isEquipped ? ' [EQUIPPED]' : '';
                if (this.tab === 'swords') {
                    t.setText(prefix + item.name + ' - ATK: ' + item.attack + suffix);
                } else {
                    t.setText(prefix + item.name + ' - DEF: ' + Math.round(item.reduction * 100) + '%' + suffix);
                }
                t.setFill(i === this.selectedIndex ? '#ffdd00' : '#fff');
            } else {
                t.setText('');
            }
        });

        const sword = SWORD_DATA[GameState.equipment.sword];
        const armor = ARMOR_DATA[GameState.equipment.armor];
        const totalAtk = sword.attack + GameState.attackBonus;
        this.statsText.setText('Total ATK: ' + totalAtk + ' | DEF: ' + Math.round(armor.reduction * 100) + '% | Effect: ' + sword.effect);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.iKey)) {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        if (!this.isOpen) return;

        if (Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey)) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.refresh();
        }
        if (Phaser.Input.Keyboard.JustDown(this.downKey) || Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
            this.refresh();
        }

        if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
            this.tab = (this.tab === 'swords') ? 'armors' : 'swords';
            this.selectedIndex = 0;
            this.refresh();
        }

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            if (this.items[this.selectedIndex]) {
                const item = this.items[this.selectedIndex];
                if (this.tab === 'swords') {
                    GameState.equipment.sword = item.id;
                } else {
                    GameState.equipment.armor = item.id;
                }
                this.refresh();
            }
        }
    }
}
