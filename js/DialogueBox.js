class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.lineIndex = 0;
        this.onCloseCallback = null;

        this.bg = scene.add.rectangle(400, 400, 760, 80, 0x000000, 0.85)
            .setDepth(200).setVisible(false);
        this.nameText = scene.add.text(40, 370, '', {
            fontSize: '14px', fill: '#ffcc00'
        }).setDepth(201).setVisible(false);
        this.text = scene.add.text(40, 390, '', {
            fontSize: '14px', fill: '#ffffff', wordWrap: { width: 720 }
        }).setDepth(201).setVisible(false);
        this.hint = scene.add.text(730, 425, 'E ▶', {
            fontSize: '12px', fill: '#aaaaaa'
        }).setDepth(201).setVisible(false);

        this.talkKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    open(speakerName, lines, onClose) {
        this.lines = lines;
        this.lineIndex = 0;
        this.isOpen = true;
        this.onCloseCallback = onClose || null;
        this.nameText.setText(speakerName);
        this.text.setText(this.lines[0]);
        this.bg.setVisible(true);
        this.nameText.setVisible(true);
        this.text.setVisible(true);
        this.hint.setVisible(true);
    }

    advance() {
        if (!this.isOpen) return;
        this.lineIndex++;
        if (this.lineIndex >= this.lines.length) {
            this.close();
        } else {
            this.text.setText(this.lines[this.lineIndex]);
        }
    }

    close() {
        this.isOpen = false;
        this.bg.setVisible(false);
        this.nameText.setVisible(false);
        this.text.setVisible(false);
        this.hint.setVisible(false);
        if (this.onCloseCallback) this.onCloseCallback();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.talkKey) && this.isOpen) {
            this.advance();
        }
    }
}
