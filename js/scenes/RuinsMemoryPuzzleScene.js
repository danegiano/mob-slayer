class RuinsMemoryPuzzleScene extends Phaser.Scene {
    constructor() { super('RuinsMemoryPuzzle'); }

    preload() {
        this.load.image('memory-puzzle-bg', 'assets/backgrounds/memory-puzzle-bg.png');
    }

    create() {
        // Background
        this.add.image(400, 225, 'memory-puzzle-bg');

        // Scene title
        this.add.text(400, 50, 'Memory Puzzle', {
            fontSize: '20px', fill: '#ddaa44'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 80, 'Watch the sequence, then repeat it with 1-2-3-4!', {
            fontSize: '12px', fill: '#aaa'
        }).setOrigin(0.5);

        // Active (bright) and dim colors for the 4 runes
        this.activeColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
        this.dimColors = [0x661111, 0x116611, 0x111166, 0x666611];

        // Create 4 colored rune rectangles
        this.runes = [];
        const runePositions = [200, 350, 500, 650];
        for (let i = 0; i < 4; i++) {
            const rune = this.add.rectangle(runePositions[i], 280, 80, 80, this.dimColors[i]);
            rune.setDepth(10);
            this.runes.push(rune);

            // Label below each rune
            this.add.text(runePositions[i], 340, '' + (i + 1), {
                fontSize: '16px', fill: '#fff'
            }).setOrigin(0.5).setDepth(10);
        }

        // Number keys for input
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);

        // Status text
        this.statusText = this.add.text(400, 400, '', {
            fontSize: '20px', fill: '#fff'
        }).setOrigin(0.5).setDepth(50);

        // Round text
        this.roundText = this.add.text(400, 140, '', {
            fontSize: '16px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);

        // Game state
        this.currentRound = 0;
        this.sequenceLengths = [3, 4, 5];
        this.sequence = [];
        this.playerInput = [];
        this.showingSequence = false;
        this.acceptingInput = false;
        this.gameOver = false;

        // Start first round
        this.startRound();
    }

    startRound() {
        this.playerInput = [];
        this.acceptingInput = false;
        this.showingSequence = true;

        const seqLength = this.sequenceLengths[this.currentRound];
        this.roundText.setText('Round ' + (this.currentRound + 1) + ' of 3 — Watch!');

        // Generate random sequence
        this.sequence = [];
        for (let i = 0; i < seqLength; i++) {
            this.sequence.push(Phaser.Math.Between(0, 3));
        }

        // Show the sequence one at a time
        this.showSequence(0);
    }

    showSequence(index) {
        if (index >= this.sequence.length) {
            // Done showing — player's turn
            this.showingSequence = false;
            this.acceptingInput = true;
            this.roundText.setText('Round ' + (this.currentRound + 1) + ' of 3 — Your turn!');
            this.statusText.setText('');
            return;
        }

        const runeIndex = this.sequence[index];

        // Flash the rune bright
        this.runes[runeIndex].fillColor = this.activeColors[runeIndex];

        // After 400ms, dim it back
        this.time.delayedCall(400, () => {
            this.runes[runeIndex].fillColor = this.dimColors[runeIndex];

            // After 200ms gap, show next in sequence (600ms total between flashes)
            this.time.delayedCall(200, () => {
                this.showSequence(index + 1);
            });
        });
    }

    flashRune(index) {
        // Brief flash when player presses a key
        this.runes[index].fillColor = this.activeColors[index];
        this.time.delayedCall(300, () => {
            this.runes[index].fillColor = this.dimColors[index];
        });
    }

    handleInput(runeIndex) {
        if (!this.acceptingInput || this.gameOver) return;

        this.flashRune(runeIndex);
        this.playerInput.push(runeIndex);

        const inputIndex = this.playerInput.length - 1;

        // Check if this input is correct
        if (this.playerInput[inputIndex] !== this.sequence[inputIndex]) {
            // Wrong!
            this.acceptingInput = false;
            this.statusText.setText('Wrong! Try again...');
            this.statusText.setFill('#ff4444');

            // Restart current round after 1.5s
            this.time.delayedCall(1500, () => {
                this.statusText.setText('');
                this.startRound();
            });
            return;
        }

        // Check if sequence is complete
        if (this.playerInput.length === this.sequence.length) {
            // Correct!
            this.acceptingInput = false;
            this.statusText.setText('Correct!');
            this.statusText.setFill('#00ff00');

            this.currentRound++;

            if (this.currentRound >= 3) {
                // All rounds done — puzzle solved!
                this.gameOver = true;
                GameState.quests.ruins.miniGame = true;

                this.time.delayedCall(1000, () => {
                    this.statusText.setText('Puzzle Solved!');
                    this.statusText.setFill('#ffdd00');
                    this.roundText.setText('');

                    // Return to village after 2s
                    this.time.delayedCall(2000, () => {
                        this.scene.start('RuinsVillage');
                    });
                });
            } else {
                // Next round after 1s
                this.time.delayedCall(1000, () => {
                    this.statusText.setText('');
                    this.startRound();
                });
            }
        }
    }

    update() {
        if (this.gameOver || this.showingSequence) return;

        // Check number key presses
        if (Phaser.Input.Keyboard.JustDown(this.key1)) {
            this.handleInput(0);
        } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
            this.handleInput(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
            this.handleInput(2);
        } else if (Phaser.Input.Keyboard.JustDown(this.key4)) {
            this.handleInput(3);
        }
    }
}
