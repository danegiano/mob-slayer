class ForestObstacleCourseScene extends Phaser.Scene {
    constructor() { super('ForestObstacleCourse'); }

    preload() {
        this.load.image('obstacle-course-bg', 'assets/backgrounds/obstacle-course-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'obstacle-course-bg');

        // Ground line (visible for the mini-game)
        this.add.rectangle(400, 410, 800, 4, 0x88ff88, 0.5).setDepth(1);

        // Runner — blue rectangle (24x48) at x=150
        this.runner = this.add.rectangle(150, 380, 24, 48, 0x4488ff);
        this.runner.setDepth(10);
        this.runnerHeight = 48;
        this.isDucking = false;
        this.onGround = true;
        this.runnerVelY = 0;

        // Input keys
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // Obstacles group
        this.obstacles = [];

        // Game state
        this.lives = 3;
        this.timeLeft = 30;
        this.gameOver = false;
        this.invulnerable = false;

        // Spawn obstacles every 1.2 seconds
        this.spawnTimer = this.time.addEvent({
            delay: 1200,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        // Countdown timer
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('Time: ' + this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.endGame(true);
                }
            },
            callbackScope: this,
            loop: true
        });

        // Timer text
        this.timerText = this.add.text(700, 20, 'Time: 30', {
            fontSize: '16px', fill: '#fff'
        }).setDepth(50);

        // Lives text
        this.livesText = this.add.text(50, 20, 'Lives: 3', {
            fontSize: '16px', fill: '#ff4444'
        }).setDepth(50);

        // Scene title
        this.add.text(400, 30, 'Forest Obstacle Course', {
            fontSize: '20px', fill: '#88ff88'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 60, 'SPACE/UP to jump, DOWN to duck!', {
            fontSize: '12px', fill: '#aaa'
        }).setOrigin(0.5);

        // Result text (hidden until game ends)
        this.resultText = this.add.text(400, 200, '', {
            fontSize: '28px', fill: '#fff'
        }).setOrigin(0.5).setDepth(50).setVisible(false);
    }

    spawnObstacle() {
        if (this.gameOver) return;

        // 50/50 chance: low obstacle (jump over) or high obstacle (duck under)
        const isLow = Math.random() > 0.5;

        let obs;
        if (isLow) {
            // Low obstacle at y=380 — jump over it
            obs = this.add.rectangle(820, 380, 24, 20, 0xff8800);
            obs.type = 'low';
        } else {
            // High obstacle at y=340 — duck under it
            obs = this.add.rectangle(820, 340, 24, 30, 0xff0000);
            obs.type = 'high';
        }
        obs.setDepth(10);
        obs.velX = -250;
        this.obstacles.push(obs);
    }

    update(time, delta) {
        if (this.gameOver) return;

        const dt = delta / 1000;
        const groundY = 404; // Bottom of runner touches here

        // --- Runner physics ---
        // Jump (only when on ground)
        if (this.onGround &&
            (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.upKey))) {
            this.runnerVelY = -400;
            this.onGround = false;
        }

        // Duck (only when on ground and down is held)
        const wantDuck = this.downKey.isDown && this.onGround;
        if (wantDuck && !this.isDucking) {
            // Shrink to 24x24, shift down 12px
            this.isDucking = true;
            this.runner.setSize(24, 24);
            this.runner.y += 12;
        } else if (!wantDuck && this.isDucking) {
            // Stand back up
            this.isDucking = false;
            this.runner.setSize(24, 48);
            this.runner.y -= 12;
        }

        // Gravity
        if (!this.onGround) {
            this.runnerVelY += 800 * dt;
            this.runner.y += this.runnerVelY * dt;

            // Land on ground
            const halfH = this.isDucking ? 12 : 24;
            if (this.runner.y + halfH >= groundY) {
                this.runner.y = groundY - halfH;
                this.runnerVelY = 0;
                this.onGround = true;
            }
        }

        // --- Move obstacles and check collisions ---
        const runnerBounds = this.runner.getBounds();

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x += obs.velX * dt;

            // Remove off-screen obstacles
            if (obs.x < -50) {
                obs.destroy();
                this.obstacles.splice(i, 1);
                continue;
            }

            // Collision check
            if (!this.invulnerable) {
                const obsBounds = obs.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(runnerBounds, obsBounds)) {
                    this.hitObstacle();
                }
            }
        }
    }

    hitObstacle() {
        this.lives--;
        this.livesText.setText('Lives: ' + this.lives);

        if (this.lives <= 0) {
            this.endGame(false);
            return;
        }

        // 1 second invulnerability with red tint
        this.invulnerable = true;
        this.runner.fillColor = 0xff4444;
        this.time.delayedCall(1000, () => {
            this.invulnerable = false;
            this.runner.fillColor = 0x4488ff;
        });
    }

    endGame(won) {
        this.gameOver = true;
        this.spawnTimer.remove();
        this.countdownTimer.remove();

        if (won) {
            GameState.quests.darkforest.miniGame = true;
            this.resultText.setText('You survived!');
            this.resultText.setFill('#00ff00');
        } else {
            this.resultText.setText('Knocked out! Try again?');
            this.resultText.setFill('#ff4444');
        }
        this.resultText.setVisible(true);

        // Go back to village after 2 seconds
        this.time.delayedCall(2000, () => {
            this.scene.start('ForestVillage');
        });
    }
}
