class HUD {
    constructor(scene) {
        this.scene = scene;

        // With 2x camera zoom, visible area is 400x225
        // Positions are in world coords but scrollFactor(0) keeps them on screen
        this.healthBg = scene.add.rectangle(60, 10, 100, 8, 0x333333)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

        this.healthBar = scene.add.rectangle(60, 10, 100, 8, 0x00cc00)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

        this.healthText = scene.add.text(10, 6, 'HP', {
            fontSize: '7px', fill: '#fff'
        }).setScrollFactor(0).setDepth(101);

        this.weaponText = scene.add.text(10, 18, '', {
            fontSize: '6px', fill: '#ffcc00'
        }).setScrollFactor(0).setDepth(101);

        this.kanjiText = scene.add.text(10, 27, '', {
            fontSize: '8px', fill: '#ff44ff'
        }).setScrollFactor(0).setDepth(101);

        this.goldText = scene.add.text(340, 6, '', {
            fontSize: '7px', fill: '#ffdd00'
        }).setScrollFactor(0).setDepth(101);
    }

    update() {
        const ratio = GameState.health / GameState.maxHealth;
        this.healthBar.width = 100 * ratio;

        if (ratio > 0.5) this.healthBar.setFillStyle(0x00cc00);
        else if (ratio > 0.25) this.healthBar.setFillStyle(0xcccc00);
        else this.healthBar.setFillStyle(0xcc0000);

        const weaponName = GameState.weapon === 'slayer' ? 'モブスレイヤー' : 'Wood Sword';
        this.weaponText.setText(weaponName);

        const kanjiMap = { ice: '氷', shadow: '影', power: '力' };
        const kanji = GameState.swordPowers.map(p => kanjiMap[p]).join(' ');
        this.kanjiText.setText(kanji);

        this.goldText.setText(GameState.gold + 'g');
    }
}
