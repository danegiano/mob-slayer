class TundraTargetPracticeScene extends Phaser.Scene {
    constructor() { super('TundraTargetPractice'); }

    preload() {
        this.load.image('target-practice-bg', 'assets/backgrounds/target-practice-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'target-practice-bg');

        // Strike zone — vertical line at x=400
        this.add.rectangle(400, 250, 4, 250, 0xffdd00, 0.3).setDepth(1);
        this.add.text(400, 100, 'HIT ZONE', {
            fontSize: '10px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(1);

        // SPACE key to strike
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Targets group
        this.targets = this.add.group();

        // Score tracking
        this.hits = 0;
        this.timeLeft = 30;
        this.gameOver = false;

        // Timer text
        this.timerText = this.add.text(700, 20, 'Time: 30', {
            fontSize: '16px', fill: '#fff'
        }).setDepth(50);

        // Score text
        this.scoreText = this.add.text(50, 20, 'Hits: 0/5', {
            fontSize: '16px', fill: '#ffdd00'
        }).setDepth(50);

        // Scene title
        this.add.text(400, 30, 'Target Practice', {
            fontSize: '20px', fill: '#88ccff'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 60, 'Press SPACE when targets cross the yellow line!', {
            fontSize: '12px', fill: '#aaa'
        }).setOrigin(0.5);

        // Result text (hidden until game ends)
        this.resultText = this.add.text(400, 200, '', {
            fontSize: '28px', fill: '#fff'
        }).setOrigin(0.5).setDepth(50).setVisible(false);

        // Spawn targets every 1.5 seconds
        this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnTarget,
            callbackScope: this,
            loop: true
        });

        // Countdown timer — ticks every second
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('Time: ' + this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.endGame(false);
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    spawnTarget() {
        if (this.gameOver) return;

        // Random side: left or right
        const fromLeft = Math.random() > 0.5;
        const startX = fromLeft ? -20 : 820;
        const y = Phaser.Math.Between(150, 350);
        const speed = Phaser.Math.Between(100, 200);

        const target = this.add.sprite(startX, y, 'target');
        target.play('target_idle');
        target.setScale(2);
        target.setDepth(10);
        target.speed = fromLeft ? speed : -speed;
        target.hit = false;

        this.targets.add(target);
    }

    update() {
        if (this.gameOver) return;

        // Move targets across screen
        this.targets.children.each(target => {
            if (target.hit) return;
            target.x += target.speed * (this.game.loop.delta / 1000);

            // Remove targets that go off-screen
            if (target.x < -50 || target.x > 850) {
                target.destroy();
            }
        });

        // SPACE key — check for hit
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let hitAny = false;

            this.targets.children.each(target => {
                if (target.hit) return;
                // Check if target is within 40px of center (x=400)
                if (Math.abs(target.x - 400) < 40) {
                    // Hit! Tint green and fade out
                    target.hit = true;
                    target.setTint(0x00ff00);
                    this.tweens.add({
                        targets: target,
                        alpha: 0, y: target.y - 30,
                        duration: 500,
                        onComplete: () => target.destroy()
                    });
                    hitAny = true;
                    this.hits++;
                    this.scoreText.setText('Hits: ' + this.hits + '/5');

                    // Check win condition
                    if (this.hits >= 5) {
                        this.endGame(true);
                    }
                }
            });

            // Miss — red flash on the strike zone
            if (!hitAny) {
                const flash = this.add.rectangle(400, 250, 60, 250, 0xff0000, 0.4).setDepth(2);
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => flash.destroy()
                });
            }
        }
    }

    endGame(won) {
        this.gameOver = true;
        this.spawnTimer.remove();
        this.countdownTimer.remove();

        if (won) {
            GameState.quests.tundra.miniGame = true;
            this.resultText.setText('Nice shooting!');
            this.resultText.setFill('#00ff00');
        } else {
            this.resultText.setText('Time\'s up! Try again?');
            this.resultText.setFill('#ff4444');
        }
        this.resultText.setVisible(true);

        // Go back to village after 2 seconds
        this.time.delayedCall(2000, () => {
            this.scene.start('TundraVillage');
        });
    }
}
