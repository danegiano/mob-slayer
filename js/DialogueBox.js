class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.currentLine = 0;
        this.onComplete = null;
        this.speaker = null;

        // Speech bubble graphics (drawn each frame)
        this.bubble = scene.add.graphics().setDepth(200).setVisible(false);

        this.nameText = scene.add.text(0, 0, '', {
            fontSize: '12px', fill: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5, 0).setDepth(201).setVisible(false);

        this.text = scene.add.text(0, 0, '', {
            fontSize: '10px', fill: '#000', wordWrap: { width: 200 }, align: 'center'
        }).setOrigin(0.5, 0).setDepth(201).setVisible(false);

        this.hint = scene.add.text(0, 0, '[E]', {
            fontSize: '8px', fill: '#666'
        }).setOrigin(0.5, 0).setDepth(201).setVisible(false);

        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    open(speakerName, lines, onComplete, speakerObj) {
        this.lines = lines;
        this.currentLine = 0;
        this.onComplete = onComplete || null;
        this.speaker = speakerObj || null;
        this.isOpen = true;
        this.nameText.setText(speakerName);
        this.text.setText(this.lines[0]);
        this.bubble.setVisible(true);
        this.nameText.setVisible(true);
        this.text.setVisible(true);
        this.hint.setVisible(true);
    }

    update() {
        if (this.isOpen && this.speaker) {
            // Position bubble above speaker
            const sx = this.speaker.x;
            const sy = this.speaker.y - 40;

            // Measure text to size the bubble
            const padding = 8;
            const textH = this.text.height + this.nameText.height + this.hint.height + 16;
            const bubbleW = 220;
            const bubbleH = textH + padding * 2;
            const bubbleX = sx - bubbleW / 2;
            const bubbleY = sy - bubbleH;

            // Draw bubble
            this.bubble.clear();
            // White rounded rectangle
            this.bubble.fillStyle(0xffffff, 0.95);
            this.bubble.fillRoundedRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
            // Border
            this.bubble.lineStyle(1, 0x333333, 1);
            this.bubble.strokeRoundedRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
            // Triangle pointer
            this.bubble.fillStyle(0xffffff, 0.95);
            this.bubble.fillTriangle(
                sx - 5, bubbleY + bubbleH,
                sx + 5, bubbleY + bubbleH,
                sx, bubbleY + bubbleH + 6
            );
            this.bubble.lineStyle(1, 0x333333, 1);
            this.bubble.lineBetween(sx - 5, bubbleY + bubbleH, sx, bubbleY + bubbleH + 6);
            this.bubble.lineBetween(sx + 5, bubbleY + bubbleH, sx, bubbleY + bubbleH + 6);

            // Position text inside bubble
            this.nameText.setPosition(sx, bubbleY + padding);
            this.text.setPosition(sx, bubbleY + padding + this.nameText.height + 4);
            this.hint.setPosition(sx, bubbleY + bubbleH - this.hint.height - 2);
        }

        if (!this.isOpen) return;

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.currentLine++;
            if (this.currentLine >= this.lines.length) {
                this.close();
            } else {
                this.text.setText(this.lines[this.currentLine]);
            }
        }
    }

    close() {
        this.isOpen = false;
        this.bubble.clear();
        this.bubble.setVisible(false);
        this.nameText.setVisible(false);
        this.text.setVisible(false);
        this.hint.setVisible(false);
        if (this.onComplete) this.onComplete();
    }
}
