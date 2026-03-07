class FinalVictoryScene extends Phaser.Scene {
    constructor() { super('FinalVictory'); }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        // Award Dragon Sword
        if (!GameState.inventory.swords.includes('dragon')) {
            GameState.inventory.swords.push('dragon');
        }
        GameState.equipment.sword = 'dragon';

        this.add.text(400, 60, 'モブスレイヤー', {
            fontSize: '48px', fill: '#ff44ff'
        }).setOrigin(0.5);

        this.add.text(400, 110, 'The Mob Slayer', {
            fontSize: '24px', fill: '#ffccff'
        }).setOrigin(0.5);

        const kanjiData = [
            { char: '氷', color: '#88ccff', label: 'Ice', x: 200 },
            { char: '影', color: '#9944ff', label: 'Shadow', x: 400 },
            { char: '力', color: '#ffaa00', label: 'Power', x: 600 }
        ];

        kanjiData.forEach((k, i) => {
            const kanji = this.add.text(k.x, 220, k.char, {
                fontSize: '72px', fill: k.color
            }).setOrigin(0.5).setAlpha(0);

            const label = this.add.text(k.x, 280, k.label, {
                fontSize: '16px', fill: '#ffffff'
            }).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: [kanji, label],
                alpha: 1, duration: 800,
                delay: 1000 + i * 800
            });

            this.tweens.add({
                targets: kanji,
                alpha: 0.6, yoyo: true, repeat: -1,
                duration: 1000, delay: 3500 + i * 200
            });
        });

        const victoryText = this.add.text(400, 350, 'All powers awakened!', {
            fontSize: '28px', fill: '#ffcc00'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: victoryText, alpha: 1,
            duration: 1000, delay: 4000
        });

        const endText = this.add.text(400, 400, 'You have mastered the Mob Slayer.', {
            fontSize: '18px', fill: '#aaaaaa'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: endText, alpha: 1,
            duration: 1000, delay: 5000
        });

        const dragonText = this.add.text(400, 430, 'You received the Dragon Sword!', {
            fontSize: '16px', fill: '#ff4444'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: dragonText, alpha: 1,
            duration: 1000, delay: 6000
        });
    }
}
