const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood',       // 'wood' or 'slayer'
    comboUnlocked: false,  // unlocked after beating troll
    storyPhase: 0          // 0=start, 1=found sword, 2=talked to blacksmith, 3=night mode
};

// Sprite data embedded as base64 — no file loading needed!
const SPRITE_DATA = {
    player: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAADW0lEQVR4nO2ZK1QbQRSG//T0VIzZChBUJGJNKhKRmgowCGoqiKCmJqIYBKqWiNYgiiCiCCIwVQgQrcgKTFdQ0RVEgGBFIooA0TUraqaCJmcfM7t3Z1/hNN85iJnJnfnz586TClJwcTniANB8Xquk6UeFoy8n3FvuvG0raXiURoBlWbAsKyTmIfG4bAFUGNN8Jm9tdiLbXdchZQQ5bYIDxEEVQB378+ERWq1WqM2yLGHM1maHpIGUAYoCeJYmRI2VhkRTIA8BVEzTzKVfsgF5CSgSxrRQVha6CIoEUOkf7FWo65DrOqHPMqbx0a9bLD59knzwSWeMaZzy543x9nH7+4/ydsmYxq8H+/x6sM8557xaXZ6Wq9VlzjmflqPGDrYl2gUuTj4AAPS1bdRqKzg73AAArG4eYzT6DtvoAQCa7a5vBfa4X1HNAu/4cYjGP/t+Dl3XUXu26GtTOgjZRm/65QHg7HBj+uWlMbaNNBmQFw/mIAQAu6fjzPtMZEAeAqi4rlPpH+wBAL5+eifMpNfv+4mnFtmAvATIiFrx33SPE8fIkBpQlIAozn9eAABevmhCa+wAABb05cgYvV4HABi7NV+8jMgMKEJAFJST551tSjVR4iMNKEKAChOTJ+NPyvbVVeK+lHaBLAUE8U6j4JU3KZT4kAFFCxChNXZ8WWWfvlLqR18fxMYLM6BIASr8+NYXluPWJxFKUyBLASp4x4lagwBgadiGHahbayxxY3hTARQNyFJAUXQ7q8L6wo7CMgF5c9M4gd4AWL0OY7cG13UqxtCZtiu/CicSsD4A27iEabv/BGT361OnXd1awfZaNVSf2oC0Asom9wyYdWbyOuwMP8IZ+usa7v1FDMO9yFjXE+fbfiXZJzSgSAEigi8/zXYXLX3BV1fXl3zlK/vGVzbtsbCfIEIDihRApWcE3yKyeZsgT4G8BIiQGSU7ocrqKYYLDShSQBDZg2le/5oLGVC0gLL577fBuQFlCyibuQFlCyibmTwKe/HuPqITqqx+Ehe3G8VuVWnf+tNuh4xpXHaL7BnjyBtmzxjHjk/KgDQCsiJ49L5nLG0LHs1lkKdAXgLKZubXgAlRhqYxm2xAXgIoWPadUhsFkgF5CiibBzEFTNtVaqMw89vgnDn58hc1x+vN5+KzzwAAAABJRU5ErkJggg==',
    blacksmith: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAADQElEQVR4nO2ZLWzbQBTHX6aVhIRUmtJJJh4IyYBRaQJKRkJCOpCCjgQ0YAUZ8EALFpCBDZh0IAEtCTFYpKmgJSUhBgsJMZilySQkxKQgA5E9xx937zm+2FLykyol9+7e++f17t6dXYCcUyyWlpuMd5xFgWV/mbUADCfVUqJx99MFtw83AaIFZM2LrAVkDWoG5IFmTQFZllB9JVmG9qevqL7oBIgSQKV9PVz7rqmtUNvPwRXaH3kGpC2Aiqa2oNK8guO3b2Cgnsa2YSHvAZragofff8CBA9DUVmybSGajzzBQT8E0LTBNa62NSqJNME0BGPSJRS6l2DGoJaBPrEKzppDOA/rEKmx6hoii90MPNz4a3sfueYPkj7wHpC1g49gRfbQvH9E+SUsAK0AU3fMGWPaC+Uf9B3DXSbFYWjrOonDbbSxlWQrt+EE0tQWSLMNRvVNwx5IURcTfZDwvPioBIgVQue02mHre93QvHkY7WVzaAgDik5TGJtrva6AoSqTNMAx2ArYh4PKyDY6zYFYM7d0BKNVDAAA4GwE8qNEn0vq1BYPm6rNUkeDobAL9vsbU51UBUQIAVj8Uw81FDZ7Np7W29vg51M+aWSh/GNbKYBYCgriJ9hjbKw1j22s67sWP/2+z4zv5CJ0Dti0AS0Uug/S6jOpbfnUIw9E9AAAYxoTZF30QEiUgiFM+CbSwyy6Puzv2+FACdi1ANA/fVpezemcIDWU1u3Vj7lUe4Q9EeAKoWH/ZSws7S13ICUhbQBLcGK6W4HcKiWZAmgKSEIyzSdxECUhTAJW0Zxg5AduY4tskV0+FP3x/TN1nvUMog1kI8HNzUQu1uZpmpg0zk77UXJ9xvy10FN62AAxu+fRj2utvneRy+O2Vbsy5vlFLQKQAP3FJivPjv0VO7Xmkze8zyg/57h4ngGJz7dg4xWJpqVTltQ1Y//XkxYizYXx7M4A1IC6IS5wt7adBItj5l6P7BGQtIGv2CchaQNbsfAJydRcI4j9HGFMTjKkZaWfZANjlWPh7AZ4AXvyoU6iLbswjT6nBPqz43BmQhoA8s/N7wM4nINebIED41km18+AmQLQAHlM7/GqOYueR6yqwZ494/gGPXM3zfBi5MgAAAABJRU5ErkJggg==',
    goblin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAB0klEQVR4nO1XIXPCMBh93W0mJqYGw2wN2JkZNJhZ9BQGg+EXYDAzqJkZfgGYGQxiGkzEzGYwNTW1mRhhSZN+Tdfsxu727rhLwuN7ecn3fS0RCDDGJfW9Qp5nkQ/PFbszT0jefiJIjcsQAoxxWccEY1x25slpc/uJQH/VMzjrweakfeQ6NS4oAX2T7aRlfJS4EvC9rWJsAOivepiNBGajz5izkcCu3TI4ZRqWgdACReR5FunmFaaLBNNFYo0V9hPhTCMrhY4Clgk94GksDpUChAnD7HqwMTh6SlGxnTUQUqAMeZ5F+o29vtxgnDIAwEOcY5yaXADY7d5kt3tt6JQWcSgBH7yLA+4AABkAGGMFxrgUwm4YpQZCCVTBVQ8uHGNasSsNNBUooljo8TBGss3QjpnFfU6ukC5TsjlYBkILuKAahO/hUM8i5w2EFPhpOB9k54rt09haC2rAJRASj5uDtebVhZoIuFBMTXHLQSUrlcpWx3AVMYV0mRrzui91PjwqZq2W9x2BKjDGpTokdRj6vCo2WQPqx/EwNm5CnzfZfAj8qS7kwp83ELQL1YWqsWIj0OdV71a/WsSMcXnf+/pjpNpwca2RgaYCVfF9eGd7A/8A8AF5OD9bBXRTPAAAAABJRU5ErkJggg==',
    night_goblin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAB5UlEQVR4nO1WIXDCMBR93W0mJmYGU4PB1NRQMTMzhcCgsPjaqenZ+llUDQKFGAbBDAZTU1ODmamJmejECGuaNE3X7AZ3e3fckeT3v7z8/Nc60IAQWujWORjLHZM4Ve7exNXGHeJMy3Ftg4AQWrQRQQgtehP3tLnh2kM6S4WY/ksfb/d78D0c4kzJcaUj4BiuPdz2ifAbrr3Tem/iGlermhsA0lmK7W6LaBEBAKJFhLk/F2LqOCQBtgmqYCx3+MmXEfgBwnEIAAjHIQI/ENYPcaa8RtIVOhJIIgI/AHycCL6UNRNoRAhi98+JEOM9DoxyK3vAJkEdGMudcsVelx7CzQcAILq7Of3nsQCwXG6L0SgQeGqb2BaBCd5ThmmpmtNUjiGEFkmSSIZRK8AWQRNU/aDCMaeUu1FAV4Iqqo1OfIpB4sIlsl2v3A3YLteagyTANoEK3CBMD0f3LlJWwCbBb0P5IjtXbOInac6qABWBTaz2uTRn5EJdCFSoXs1kkCFB/XXVXWXJMVRNrAPbiZtu+1FnEqfL2cryfkLQBEJowQ+JH0Z53JRb2wP8YeJToRLlcZfN28BFuZAKFy/Aqgu1Be8xyQhK46Zvqz9tYkJo8eB99xa34epcJwFdCZrym8SdbQX+AeATVatCb5qONgIAAAAASUVORK5CYII=',
    tilemap: 'data:image/png;base64,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',
    troll: 'data:image/png;base64,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'
};

class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() {
        this.add.text(400, 225, 'Mob Slayer', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 280, 'Loading...', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);

        // Load sprites from embedded base64 data (no file loading = works everywhere)
        const keys = Object.keys(SPRITE_DATA);
        let loaded = 0;

        keys.forEach(key => {
            this.textures.once('addtexture-' + key, () => {
                loaded++;
                if (loaded === keys.length) {
                    this.onSpritesLoaded();
                }
            });
            this.textures.addBase64(key, SPRITE_DATA[key]);
        });
    }

    onSpritesLoaded() {
        // Add spritesheet frame data so animations work
        // Player: 2 frames of 32x48 in a 64x48 strip
        this.textures.get('player').add(0, 0, 0, 0, 32, 48);
        this.textures.get('player').add(1, 0, 32, 0, 32, 48);

        // Blacksmith: 2 frames of 32x48
        this.textures.get('blacksmith').add(0, 0, 0, 0, 32, 48);
        this.textures.get('blacksmith').add(1, 0, 32, 0, 32, 48);

        // Goblin: 2 frames of 24x24
        this.textures.get('goblin').add(0, 0, 0, 0, 24, 24);
        this.textures.get('goblin').add(1, 0, 24, 0, 24, 24);

        // Night goblin: 2 frames of 24x24
        this.textures.get('night_goblin').add(0, 0, 0, 0, 24, 24);
        this.textures.get('night_goblin').add(1, 0, 24, 0, 24, 24);

        // Troll: 2 frames of 64x80
        this.textures.get('troll').add(0, 0, 0, 0, 64, 80);
        this.textures.get('troll').add(1, 0, 64, 0, 64, 80);

        // Tilemap: 132 frames of 16x16 (12 columns x 11 rows)
        const tm = this.textures.get('tilemap');
        for (let row = 0; row < 11; row++) {
            for (let col = 0; col < 12; col++) {
                const frameId = row * 12 + col;
                tm.add(frameId, 0, col * 16, row * 16, 16, 16);
            }
        }

        // Create idle animations
        this.anims.create({ key: 'player_idle', frames: [{ key: 'player', frame: 0 }, { key: 'player', frame: 1 }], frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'blacksmith_idle', frames: [{ key: 'blacksmith', frame: 0 }, { key: 'blacksmith', frame: 1 }], frameRate: 2, repeat: -1 });
        this.anims.create({ key: 'goblin_idle', frames: [{ key: 'goblin', frame: 0 }, { key: 'goblin', frame: 1 }], frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'night_goblin_idle', frames: [{ key: 'night_goblin', frame: 0 }, { key: 'night_goblin', frame: 1 }], frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'troll_idle', frames: [{ key: 'troll', frame: 0 }, { key: 'troll', frame: 1 }], frameRate: 2, repeat: -1 });

        // Go to village!
        this.scene.start('Village');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,  // crisp pixel art — no blurry smoothing!
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: [BootScene, VillageScene, WoodsDayScene, WoodsNightScene, BossArenaScene, VictoryScene, House1Scene, House2Scene, ForgeScene]
};

const game = new Phaser.Game(config);
