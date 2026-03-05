const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood',        // 'wood' or 'slayer'
    comboUnlocked: false,
    storyPhase: 0           // 0=start, 1=found sword, 2=talked to blacksmith, 3=night
};

const SPRITE_DATA = {
    player: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAADW0lEQVR4nO2ZK1QbQRSG//T0VIzZChBUJGJNKhKRmgowCGoqiKCmJqIYBKqWiNYgiiCiCCIwVQgQrcgKTFdQ0RVEgGBFIooA0TUraqaCJmcfM7t3Z1/hNN85iJnJnfnz586TClJwcTniANB8Xquk6UeFoy8n3FvuvG0raXiURoBlWbAsKyTmIfG4bAFUGNN8Jm9tdiLbXdchZQQ5bYIDxEEVQB378+ERWq1WqM2yLGHM1maHpIGUAYoCeJYmRI2VhkRTIA8BVEzTzKVfsgF5CSgSxrRQVha6CIoEUOkf7FWo65DrOqHPMqbx0a9bLD59knzwSWeMaZzy543x9nH7+4/ydsmYxq8H+/x6sM8557xaXZ6Wq9VlzjmflqPGDrYl2gUuTj4AAPS1bdRqKzg73AAArG4eYzT6DtvoAQCa7a5vBfa4X1HNAu/4cYjGP/t+Dl3XUXu26GtTOgjZRm/65QHg7HBj+uWlMbaNNBmQFw/mIAQAu6fjzPtMZEAeAqi4rlPpH+wBAL5+eifMpNfv+4mnFtmAvATIiFrx33SPE8fIkBpQlIAozn9eAABevmhCa+wAABb05cgYvV4HABi7NV+8jMgMKEJAFJST551tSjVR4iMNKEKAChOTJ+NPyvbVVeK+lHaBLAUE8U6j4JU3KZT4kAFFCxChNXZ8WWWfvlLqR18fxMYLM6BIASr8+NYXluPWJxFKUyBLASp4x4lagwBgadiGHahbayxxY3hTARQNyFJAUXQ7q8L6wo7CMgF5c9M4gd4AWL0OY7cG13UqxtCZtiu/CicSsD4A27iEabv/BGT361OnXd1awfZaNVSf2oC0Asom9wyYdWbyOuwMP8IZ+usa7v1FDMO9yFjXE+fbfiXZJzSgSAEigi8/zXYXLX3BV1fXl3zlK/vGVzbtsbCfIEIDihRApWcE3yKyeZsgT4G8BIiQGSU7ocrqKYYLDShSQBDZg2le/5oLGVC0gLL577fBuQFlCyibuQFlCyibmTwKe/HuPqITqqx+Ehe3G8VuVWnf+tNuh4xpXHaL7BnjyBtmzxjHjk/KgDQCsiJ49L5nLG0LHs1lkKdAXgLKZubXgAlRhqYxm2xAXgIoWPadUhsFkgF5CiibBzEFTNtVaqMw89vgnDn58hc1x+vN5+KzzwAAAABJRU5ErkJggg==',
    goblin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAB0klEQVR4nO1XIXPCMBh93W0mJqYGw2wN2JkZNJhZ9BQGg+EXYDAzqJkZfgGYGQxiGkzEzGYwNTW1mRhhSZN+Tdfsxu727rhLwuN7ecn3fS0RCDDGJfW9Qp5nkQ/PFbszT0jefiJIjcsQAoxxWccEY1x25slpc/uJQH/VMzjrweakfeQ6NS4oAX2T7aRlfJS4EvC9rWJsAOivepiNBGajz5izkcCu3TI4ZRqWgdACReR5FunmFaaLBNNFYo0V9hPhTCMrhY4Clgk94GksDpUChAnD7HqwMTh6SlGxnTUQUqAMeZ5F+o29vtxgnDIAwEOcY5yaXADY7d5kt3tt6JQWcSgBH7yLA+4AABkAGGMFxrgUwm4YpQZCCVTBVQ8uHGNasSsNNBUooljo8TBGss3QjpnFfU6ukC5TsjlYBkILuKAahO/hUM8i5w2EFPhpOB9k54rt09haC2rAJRASj5uDtebVhZoIuFBMTXHLQSUrlcpWx3AVMYV0mRrzui91PjwqZq2W9x2BKjDGpTokdRj6vCo2WQPqx/EwNm5CnzfZfAj8qS7kwp83ELQL1YWqsWIj0OdV71a/WsSMcXnf+/pjpNpwca2RgaYCVfF9eGd7A/8A8AF5OD9bBXRTPAAAAABJRU5ErkJggg==',
    blacksmith: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAYAAAChS3wfAAADQElEQVR4nO2ZLWzbQBTHX6aVhIRUmtJJJh4IyYBRaQJKRkJCOpCCjgQ0YAUZ8EALFpCBDZh0IAEtCTFYpKmgJSUhBgsJMZilySQkxKQgA5E9xx937zm+2FLykyol9+7e++f17t6dXYCcUyyWlpuMd5xFgWV/mbUADCfVUqJx99MFtw83AaIFZM2LrAVkDWoG5IFmTQFZllB9JVmG9qevqL7oBIgSQKV9PVz7rqmtUNvPwRXaH3kGpC2Aiqa2oNK8guO3b2Cgnsa2YSHvAZragofff8CBA9DUVmybSGajzzBQT8E0LTBNa62NSqJNME0BGPSJRS6l2DGoJaBPrEKzppDOA/rEKmx6hoii90MPNz4a3sfueYPkj7wHpC1g49gRfbQvH9E+SUsAK0AU3fMGWPaC+Uf9B3DXSbFYWjrOonDbbSxlWQrt+EE0tQWSLMNRvVNwx5IURcTfZDwvPioBIgVQue02mHre93QvHkY7WVzaAgDik5TGJtrva6AoSqTNMAx2ArYh4PKyDY6zYFYM7d0BKNVDAAA4GwE8qNEn0vq1BYPm6rNUkeDobAL9vsbU51UBUQIAVj8Uw81FDZ7Np7W29vg51M+aWSh/GNbKYBYCgriJ9hjbKw1j22s67sWP/2+z4zv5CJ0Dti0AS0Uug/S6jOpbfnUIw9E9AAAYxoTZF30QEiUgiFM+CbSwyy6Puzv2+FACdi1ANA/fVpezemcIDWU1u3Vj7lUe4Q9EeAKoWH/ZSws7S13ICUhbQBLcGK6W4HcKiWZAmgKSEIyzSdxECUhTAJW0Zxg5AduY4tskV0+FP3x/TN1nvUMog1kI8HNzUQu1uZpmpg0zk77UXJ9xvy10FN62AAxu+fRj2utvneRy+O2Vbsy5vlFLQKQAP3FJivPjv0VO7Xmkze8zyg/57h4ngGJz7dg4xWJpqVTltQ1Y//XkxYizYXx7M4A1IC6IS5wt7adBItj5l6P7BGQtIGv2CchaQNbsfAJydRcI4j9HGFMTjKkZaWfZANjlWPh7AZ4AXvyoU6iLbswjT6nBPqz43BmQhoA8s/N7wM4nINebIED41km18+AmQLQAHlM7/GqOYueR6yqwZ494/gGPXM3zfBi5MgAAAABJRU5ErkJggg==',
    night_goblin: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAYCAYAAAC8/X7cAAAB5UlEQVR4nO1WIXDCMBR93W0mJmYGU4PB1NRQMTMzhcCgsPjaqenZ+llUDQKFGAbBDAZTU1ODmamJmejECGuaNE3X7AZ3e3fckeT3v7z8/Nc60IAQWujWORjLHZM4Ve7exNXGHeJMy3Ftg4AQWrQRQQgtehP3tLnh2kM6S4WY/ksfb/d78D0c4kzJcaUj4BiuPdz2ifAbrr3Tem/iGlermhsA0lmK7W6LaBEBAKJFhLk/F2LqOCQBtgmqYCx3+MmXEfgBwnEIAAjHIQI/ENYPcaa8RtIVOhJIIgI/AHycCL6UNRNoRAhi98+JEOM9DoxyK3vAJkEdGMudcsVelx7CzQcAILq7Of3nsQCwXG6L0SgQeGqb2BaBCd5ThmmpmtNUjiGEFkmSSIZRK8AWQRNU/aDCMaeUu1FAV4Iqqo1OfIpB4sIlsl2v3A3YLteagyTANoEK3CBMD0f3LlJWwCbBb0P5IjtXbOInac6qABWBTaz2uTRn5EJdCFSoXs1kkCFB/XXVXWXJMVRNrAPbiZtu+1FnEqfL2cryfkLQBEJowQ+JH0Z53JRb2wP8YeJToRLlcZfN28BFuZAKFy/Aqgu1Be8xyQhK46Zvqz9tYkJo8eB99xa34epcJwFdCZrym8SdbQX+AeATVatCb5qONgIAAAAASUVORK5CYII=',
    troll: 'data:image/png;base64,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'
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

        // Blacksmith: 2 frames of 32x48
        this.textures.get('blacksmith').add(0, 0, 0, 0, 32, 48);
        this.textures.get('blacksmith').add(1, 0, 32, 0, 32, 48);

        this.anims.create({
            key: 'blacksmith_idle',
            frames: [{ key: 'blacksmith', frame: 0 }, { key: 'blacksmith', frame: 1 }],
            frameRate: 2,
            repeat: -1
        });

        // Night Goblin: 2 frames of 24x24
        this.textures.get('night_goblin').add(0, 0, 0, 0, 24, 24);
        this.textures.get('night_goblin').add(1, 0, 24, 0, 24, 24);

        this.anims.create({
            key: 'night_goblin_idle',
            frames: [{ key: 'night_goblin', frame: 0 }, { key: 'night_goblin', frame: 1 }],
            frameRate: 3,
            repeat: -1
        });

        // Troll: 2 frames of 64x80
        this.textures.get('troll').add(0, 0, 0, 0, 64, 80);
        this.textures.get('troll').add(1, 0, 64, 0, 64, 80);
        this.anims.create({
            key: 'troll_idle',
            frames: [{ key: 'troll', frame: 0 }, { key: 'troll', frame: 1 }],
            frameRate: 2, repeat: -1
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
    scene: [BootScene, VillageScene, WoodsDayScene, WoodsNightScene, BossArenaScene, TestScene]
};

const game = new Phaser.Game(config);
