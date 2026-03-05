class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.currentLine = 0;
        this.onComplete = null;

        // Dark semi-transparent background box
        this.bg = scene.add.rectangle(400, 400, 760, 80, 0x000000, 0.85);
        this.bg.setDepth(200).setVisible(false);

        // Speaker name
        this.nameText = scene.add.text(40, 370, '', {
            fontSize: '14px', fill: '#ffcc00'
        }).setDepth(201).setVisible(false);

        // Dialogue text
        this.text = scene.add.text(40, 390, '', {
            fontSize: '14px', fill: '#fff', wordWrap: { width: 720 }
        }).setDepth(201).setVisible(false);

        // "Press E" hint
        this.hint = scene.add.text(720, 420, '[E]', {
            fontSize: '12px', fill: '#aaa'
        }).setDepth(201).setVisible(false);

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
