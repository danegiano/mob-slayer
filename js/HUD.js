class HUD {
    constructor(scene) {
        this.scene = scene;

        // With zoom 1.5x and scrollFactor(0), visible world coords are:
        // X: 133 to 667 (center = 400)
        // Y: 75 to 375 (center = 225)
        const cx = 400;
        const top = 85;
        const bottom = 365;

        this.healthBg = scene.add.rectangle(cx, top, 120, 10, 0x333333)
            .setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(100);

        this.healthBar = scene.add.rectangle(cx - 60, top, 120, 10, 0x00cc00)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

        this.healthText = scene.add.text(cx, top - 1, 'HP', {
            fontSize: '10px', fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.weaponText = scene.add.text(cx, top + 12, '', {
            fontSize: '9px', fill: '#ffcc00'
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

        this.kanjiText = scene.add.text(cx, top + 26, '', {
            fontSize: '12px', fill: '#ff44ff'
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

        this.goldText = scene.add.text(cx, bottom, '', {
            fontSize: '10px', fill: '#ffdd00'
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(101);
    }

    update() {
        const ratio = GameState.health / GameState.maxHealth;
        this.healthBar.width = 120 * ratio;

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
