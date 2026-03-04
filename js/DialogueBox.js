class DialogueBox {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.lines = [];
        this.currentLine = 0;
        this.onComplete = null;

        // Dark semi-transparent background box
        this.bg = scene.add.rectangle(400, 400, 760, 80, 0x000000, 0.8);
        this.bg.setScrollFactor(0).setDepth(200);
        this.bg.setVisible(false);

        // Text
        this.text = scene.add.text(40, 375, '', {
            fontSize: '16px', fill: '#fff', wordWrap: { width: 720 }
        }).setScrollFactor(0).setDepth(201);
        this.text.setVisible(false);

        // "Press E" hint
        this.hint = scene.add.text(720, 420, '[E]', {
            fontSize: '12px', fill: '#aaa'
        }).setScrollFactor(0).setDepth(201);
        this.hint.setVisible(false);

        // E key
        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    open(lines, onComplete) {
        this.lines = lines;
        this.currentLine = 0;
        this.onComplete = onComplete || null;
        this.isOpen = true;
        this.bg.setVisible(true);
        this.text.setVisible(true);
        this.hint.setVisible(true);
        this.text.setText(this.lines[0]);
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
        this.text.setVisible(false);
        this.hint.setVisible(false);
        if (this.onComplete) this.onComplete();
    }
}
