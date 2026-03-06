class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.currentLine = 0;
        this.onComplete = null;

        // With 2x zoom, visible area is 400x225
        // Dark semi-transparent background box at bottom of screen
        this.bg = scene.add.rectangle(200, 200, 380, 40, 0x000000, 0.85);
        this.bg.setDepth(200).setVisible(false).setScrollFactor(0);

        // Speaker name
        this.nameText = scene.add.text(20, 183, '', {
            fontSize: '7px', fill: '#ffcc00'
        }).setDepth(201).setVisible(false).setScrollFactor(0);

        // Dialogue text
        this.text = scene.add.text(20, 193, '', {
            fontSize: '7px', fill: '#fff', wordWrap: { width: 360 }
        }).setDepth(201).setVisible(false).setScrollFactor(0);

        // "Press E" hint
        this.hint = scene.add.text(360, 208, '[E]', {
            fontSize: '6px', fill: '#aaa'
        }).setDepth(201).setVisible(false).setScrollFactor(0);

        // E key
        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    open(speakerName, lines, onComplete) {
        this.lines = lines;
        this.currentLine = 0;
        this.onComplete = onComplete || null;
        this.isOpen = true;
        this.nameText.setText(speakerName);
        this.text.setText(this.lines[0]);
        this.bg.setVisible(true);
        this.nameText.setVisible(true);
        this.text.setVisible(true);
        this.hint.setVisible(true);
    }

    update() {
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
        this.bg.setVisible(false);
        this.nameText.setVisible(false);
        this.text.setVisible(false);
        this.hint.setVisible(false);
        if (this.onComplete) this.onComplete();
    }
}
