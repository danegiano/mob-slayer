class HUD {
    constructor(scene) {
        this.scene = scene;

        // Health bar background (dark red)
        this.healthBarBg = scene.add.rectangle(120, 30, 200, 20, 0x660000);
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setDepth(100);

        // Health bar fill (green)
        this.healthBarFill = scene.add.rectangle(120, 30, 200, 20, 0x00cc00);
        this.healthBarFill.setScrollFactor(0);
        this.healthBarFill.setDepth(101);

        // Health text
        this.healthText = scene.add.text(120, 30, '100/100', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        // Weapon label
        this.weaponText = scene.add.text(16, 50, 'Weapon: Wood Sword', {
            fontSize: '14px', fill: '#333'
        }).setScrollFactor(0).setDepth(100);
    }

    update() {
        const pct = GameState.health / GameState.maxHealth;
        this.healthBarFill.setScale(pct, 1);
        this.healthBarFill.setX(120 - (1 - pct) * 100);
        this.healthText.setText(`${GameState.health}/${GameState.maxHealth}`);

        if (GameState.weapon === 'slayer') {
            this.weaponText.setText('Weapon: モブスレイヤー');
        }
    }
}
