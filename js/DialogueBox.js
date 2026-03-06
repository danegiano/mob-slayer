class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.currentLine = 0;
        this.onComplete = null;

        // Full screen dark overlay
        this.bg = scene.add.rectangle(0, 0, 800, 450, 0x000000, 0.85)
            .setDepth(200).setVisible(false);

        this.nameText = scene.add.text(0, 0, '', {
            fontSize: '20px', fill: '#ffcc00', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201).setVisible(false);

        this.text = scene.add.text(0, 0, '', {
            fontSize: '16px', fill: '#fff', wordWrap: { width: 600 }, align: 'center'
        }).setOrigin(0.5).setDepth(201).setVisible(false);

        this.hint = scene.add.text(0, 0, 'Press E to continue', {
            fontSize: '12px', fill: '#aaa'
        }).setOrigin(0.5).setDepth(201).setVisible(false);

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
            // Keep centered on camera
            const cam = this.scene.cameras.main;
            const viewW = cam.width / cam.zoom;
            const viewH = cam.height / cam.zoom;
            const cx = cam.scrollX + viewW / 2;
            const cy = cam.scrollY + viewH / 2;

            this.bg.setPosition(cx, cy);
            this.bg.setSize(viewW + 20, viewH + 20);
            this.nameText.setPosition(cx, cy - 40);
            this.text.setPosition(cx, cy + 10);
            this.hint.setPosition(cx, cy + 60);
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
