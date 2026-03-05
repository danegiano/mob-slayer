const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood',        // 'wood' or 'slayer'
    comboUnlocked: false,
    storyPhase: 0           // 0=start, 1=found sword, 2=talked to blacksmith, 3=night
};

const SPRITE_DATA = {
    player: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAADW0lEQVR4nO2ZK1QbQRSG//T0VIzZChBUJGJNKhKRmgowCGoqiKCmJqIYBKqWiNYgiiCiCCIwVQgQrcgKTFdQ0RVEgGBFIooA0TUraqaCJmcfM7t3Z1/hNN85iJnJnfnz586TClJwcTniANB8Xquk6UeFoy8n3FvuvG0raXiURoBlWbAsKyTmIfG4bAFUGNN8Jm9tdiLbXdchZQQ5bYIDxEEVQB378+ERWq1WqM2yLGHM1maHpIGUAYoCeJYmRI2VhkRTIA8BVEzTzKVfsgF5CSgSxrRQVha6CIoEUOkf7FWo65DrOqHPMqbx0a9bLD59knzwSWeMaZzy543x9nH7+4/ydsmYxq8H+/x6sM8557xaXZ6Wq9VlzjmflqPGDrYl2gUuTj4AAPS1bdRqKzg73AAArG4eYzT6DtvoAQCa7a5vBfa4X1HNAu/4cYjGP/t+Dl3XUXu26GtTOgjZRm/65QHg7HBj+uWlMbaNNBmQFw/mIAQAu6fjzPtMZEAeAqi4rlPpH+wBAL5+eifMpNfv+4mnFtmAvATIiFrx33SPE8fIkBpQlIAozn9eAABevmhCa+wAABb05cgYvV4HABi7NV+8jMgMKEJAFJST551tSjVR4iMNKEKAChOTJ+NPyvbVVeK+lHaBLAUE8U6j4JU3KZT4kAFFCxChNXZ8WWWfvlLqR18fxMYLM6BIASr8+NYXluPWJxFKUyBLASp4x4lagwBgadiGHahbayxxY3hTARQNyFJAUXQ7q8L6wo7CMgF5c9M4gd4AWL0OY7cG13UqxtCZtiu/CicSsD4A27iEabv/BGT361OnXd1awfZaNVSf2oC0Asom9wyYdWbyOuwMP8IZ+usa7v1FDMO9yFjXE+fbfiXZJzSgSAEigi8/zXYXLX3BV1fXl3zlK/vGVzbtsbCfIEIDihRApWcE3yKyeZsgT4G8BIiQGSU7ocrqKYYLDShSQBDZg2le/5oLGVC0gLL577fBuQFlCyibuQFlCyibmTwKe/HuPqITqqx+Ehe3G8VuVWnf+tNuh4xpXHaL7BnjyBtmzxjHjk/KgDQCsiJ49L5nLG0LHs1lkKdAXgLKZubXgAlRhqYxm2xAXgIoWPadUhsFkgF5CiibBzEFTNtVaqMw89vgnDn58hc1x+vN5+KzzwAAAABJRU5ErkJggg==',
    goblin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAB0klEQVR4nO1XIXPCMBh93W0mJqYGw2wN2JkZNJhZ9BQGg+EXYDAzqJkZfgGYGQxiGkzEzGYwNTW1mRhhSZN+Tdfsxu727rhLwuN7ecn3fS0RCDDGJfW9Qp5nkQ/PFbszT0jefiJIjcsQAoxxWccEY1x25slpc/uJQH/VMzjrweakfeQ6NS4oAX2T7aRlfJS4EvC9rWJsAOivepiNBGajz5izkcCu3TI4ZRqWgdACReR5FunmFaaLBNNFYo0V9hPhTCMrhY4Clgk94GksDpUChAnD7HqwMTh6SlGxnTUQUqAMeZ5F+o29vtxgnDIAwEOcY5yaXADY7d5kt3tt6JQWcSgBH7yLA+4AABkAGGMFxrgUwm4YpQZCCVTBVQ8uHGNasSsNNBUooljo8TBGss3QjpnFfU6ukC5TsjlYBkILuKAahO/hUM8i5w2EFPhpOB9k54rt09haC2rAJRASj5uDtebVhZoIuFBMTXHLQSUrlcpWx3AVMYV0mRrzui91PjwqZq2W9x2BKjDGpTokdRj6vCo2WQPqx/EwNm5CnzfZfAj8qS7kwp83ELQL1YWqsWIj0OdV71a/WsSMcXnf+/pjpNpwca2RgaYCVfF9eGd7A/8A8AF5OD9bBXRTPAAAAABJRU5ErkJggg=='
};

class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }

    create() {
        this.add.text(400, 225, 'Mob Slayer モブスレイヤー', {
            fontSize: '48px', fill: '#fff'
        }).setOrigin(0.5);
        this.add.text(400, 280, 'Loading...', {
            fontSize: '20px', fill: '#aaa'
        }).setOrigin(0.5);

        const keys = Object.keys(SPRITE_DATA);
        let loaded = 0;

        keys.forEach(key => {
            this.textures.once('addtexture-' + key, () => {
                loaded++;
                if (loaded === keys.length) this.onSpritesLoaded();
            });
            this.textures.addBase64(key, SPRITE_DATA[key]);
        });
    }

    onSpritesLoaded() {
        // Player: 2 frames of 32x48
        this.textures.get('player').add(0, 0, 0, 0, 32, 48);
        this.textures.get('player').add(1, 0, 32, 0, 32, 48);

        this.anims.create({
            key: 'player_idle',
            frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }],
            frameRate: 3,
            repeat: -1
        });

        // Goblin: 2 frames of 24x24
        this.textures.get('goblin').add(0, 0, 0, 0, 24, 24);
        this.textures.get('goblin').add(1, 0, 24, 0, 24, 24);

        this.anims.create({
            key: 'goblin_idle',
            frames: [{ key: 'goblin', frame: 0 }, { key: 'goblin', frame: 1 }],
            frameRate: 3,
            repeat: -1
        });

        this.scene.start('TestScene');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: [BootScene, TestScene]
};

const game = new Phaser.Game(config);
