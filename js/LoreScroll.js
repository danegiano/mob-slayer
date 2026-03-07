class LoreScroll extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, scrollId, loreLines) {
        super(scene, x, y, 'lore_scroll');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(2);
        this.setDepth(5);
        this.scrollId = scrollId;
        this.loreLines = loreLines;
        this.isRead = false;

        this.prompt = scene.add.text(x, y - 20, 'Press E', {
            fontSize: '8px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);
    }

    showPrompt(player) {
        if (this.isRead) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        this.prompt.setVisible(dist < 50);
    }

    tryRead(player, dialogue) {
        if (this.isRead) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        if (dist > 50) return;
        this.isRead = true;
        this.prompt.setVisible(false);
        this.setAlpha(0.4);
        dialogue.open('Ancient Scroll', this.loreLines, null, this);
    }
}
