class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.currentLine = 0;
        this.onComplete = null;

        // Create elements — we'll reposition them every frame based on camera
        this.bg = scene.add.rectangle(0, 0, 360, 50, 0x000000, 0.9)
            .setDepth(200).setVisible(false);

        this.nameText = scene.add.text(0, 0, '', {
            fontSize: '10px', fill: '#ffcc00', fontStyle: 'bold'
        }).setDepth(201).setVisible(false);

        this.text = scene.add.text(0, 0, '', {
            fontSize: '9px', fill: '#fff', wordWrap: { width: 340 }
        }).setDepth(201).setVisible(false);

        this.hint = scene.add.text(0, 0, '[E]', {
            fontSize: '8px', fill: '#aaa'
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
        // Reposition to bottom of camera view every frame
        if (this.isOpen) {
            const cam = this.scene.cameras.main;
            const cx = cam.scrollX + cam.width / (2 * cam.zoom);
            const cy = cam.scrollY + cam.height / cam.zoom - 35;

            this.bg.setPosition(cx, cy);
            this.nameText.setPosition(cx - 170, cy - 18);
            this.text.setPosition(cx - 170, cy - 6);
            this.hint.setPosition(cx + 155, cy + 12);
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
