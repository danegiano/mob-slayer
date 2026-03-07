class Chest extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, chestId, reward) {
        super(scene, x, y, 'chest_closed');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.chestId = chestId;
        this.reward = reward;
        this.isOpened = GameState.chests[chestId] || false;
        this.setScale(2);
        this.setDepth(5);

        if (this.isOpened) {
            this.setTexture('chest_open');
        }

        this.prompt = scene.add.text(x, y - 25, 'Press E', {
            fontSize: '8px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);
    }

    tryOpen(player, scene) {
        if (this.isOpened) return;

        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        if (dist > 50) return;

        this.isOpened = true;
        GameState.chests[this.chestId] = true;
        this.setTexture('chest_open');
        this.prompt.setVisible(false);

        if (this.reward.type === 'sword') {
            if (!GameState.inventory.swords.includes(this.reward.id)) {
                GameState.inventory.swords.push(this.reward.id);
            }
            GameState.equipment.sword = this.reward.id;
        } else if (this.reward.type === 'armor') {
            if (!GameState.inventory.armors.includes(this.reward.id)) {
                GameState.inventory.armors.push(this.reward.id);
            }
            GameState.equipment.armor = this.reward.id;
        } else if (this.reward.type === 'gold') {
            GameState.gold += this.reward.amount;
        } else if (this.reward.type === 'potion') {
            GameState.health = Math.min(GameState.health + this.reward.amount, GameState.maxHealth);
        } else if (this.reward.type === 'accessory') {
            GameState.accessories[this.reward.id] = true;
            if (this.reward.id === 'lifeRing') {
                GameState.maxHealth += 25;
                GameState.health = Math.min(GameState.health + 25, GameState.maxHealth);
            }
        }

        const text = scene.add.text(this.x, this.y - 40, 'Found: ' + this.reward.name + '!', {
            fontSize: '12px', fill: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);
        scene.tweens.add({
            targets: text,
            y: text.y - 30, alpha: 0,
            duration: 2500, delay: 1000,
            onComplete: () => text.destroy()
        });
    }

    showPrompt(player) {
        if (this.isOpened) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        this.prompt.setVisible(dist < 50);
    }
}
