class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.currentLine = 0;
        this.onComplete = null;

        this.bg = scene.add.rectangle(0, 0, 180, 30, 0x000000, 0.9)
            .setDepth(200).setVisible(false);

        this.nameText = scene.add.text(0, 0, '', {
            fontSize: '10px', fill: '#ffcc00', fontStyle: 'bold'
        }).setDepth(201).setVisible(false);

        this.text = scene.add.text(0, 0, '', {
            fontSize: '9px', fill: '#fff', wordWrap: { width: 170 }
        }).setDepth(201).setVisible(false);

        this.hint = scene.add.text(0, 0, '[E]', {
            fontSize: '8px', fill: '#aaa'
        }).setDepth(201).setVisible(false);

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
        if (this.isOpen) {
            const cam = this.scene.cameras.main;
            const viewW = cam.width / cam.zoom;
            const viewH = cam.height / cam.zoom;
            const cx = cam.scrollX + viewW / 2;
            const cy = cam.scrollY + viewH - 20;

            this.bg.setPosition(cx, cy);
            this.nameText.setPosition(cx - 85, cy - 12);
            this.text.setPosition(cx - 85, cy - 4);
            this.hint.setPosition(cx + 75, cy + 8);
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
        this.bg.setVisible(false);
        this.nameText.setVisible(false);
        this.text.setVisible(false);
        this.hint.setVisible(false);
        if (this.onComplete) this.onComplete();
    }
}
