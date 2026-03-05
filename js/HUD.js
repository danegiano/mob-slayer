class HUD {
    constructor(scene) {
        this.scene = scene;

        this.healthBg = scene.add.rectangle(120, 20, 200, 16, 0x333333)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

        this.healthBar = scene.add.rectangle(120, 20, 200, 16, 0x00cc00)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);

        this.healthText = scene.add.text(20, 12, 'HP', {
            fontSize: '14px', fill: '#fff'
        }).setScrollFactor(0).setDepth(101);

        this.weaponText = scene.add.text(20, 36, '', {
            fontSize: '12px', fill: '#ffcc00'
        }).setScrollFactor(0).setDepth(101);
    }

    update() {
        const ratio = GameState.health / GameState.maxHealth;
        this.healthBar.width = 200 * ratio;

        if (ratio > 0.5) this.healthBar.setFillStyle(0x00cc00);
        else if (ratio > 0.25) this.healthBar.setFillStyle(0xcccc00);
        else this.healthBar.setFillStyle(0xcc0000);

        const weaponName = GameState.weapon === 'slayer' ? 'モブスレイヤー' : 'Wood Sword';
        this.weaponText.setText(weaponName);
    }
}
