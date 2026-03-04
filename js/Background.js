/**
 * Background — Draws animated pixel art backgrounds for each scene type.
 * All drawn with Phaser graphics (no file loading needed).
 *
 * Usage:  Background.village(scene)
 *         Background.woodsDay(scene)
 *         Background.woodsNight(scene)
 *         Background.bossArena(scene)
 */
const Background = {

    // ── VILLAGE — sunny day, clouds, grass, flowers ──────────
    village(scene) {
        // Sky gradient (drawn as horizontal stripes)
        const skyColors = [0x4488dd, 0x55aaee, 0x66bbee, 0x77ccee, 0x99ddee, 0xaaeeff, 0xccf0ff];
        const stripeH = Math.ceil(410 / skyColors.length);
        skyColors.forEach((color, i) => {
            scene.add.rectangle(400, i * stripeH + stripeH / 2, 800, stripeH + 1, color).setDepth(-10);
        });

        // Sun with glow
        const sunGlow = scene.add.circle(680, 60, 40, 0xffee88, 0.3).setDepth(-9);
        scene.add.circle(680, 60, 22, 0xffdd44).setDepth(-9);
        scene.add.circle(680, 60, 16, 0xffee88).setDepth(-9);
        // Animate sun glow pulsing
        scene.tweens.add({
            targets: sunGlow,
            scaleX: { from: 1, to: 1.3 },
            scaleY: { from: 1, to: 1.3 },
            alpha: { from: 0.3, to: 0.15 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        // Clouds — multiple layers drifting at different speeds
        const cloudColors = [0xffffff, 0xeef4ff, 0xddeeff];
        for (let i = 0; i < 5; i++) {
            const cx = Phaser.Math.Between(0, 800);
            const cy = Phaser.Math.Between(30, 120);
            const size = Phaser.Math.Between(30, 60);
            const color = Phaser.Utils.Array.GetRandom(cloudColors);
            const cloud = scene.add.ellipse(cx, cy, size, size * 0.4, color, 0.8).setDepth(-8);
            // Add a smaller bump on top
            const bump = scene.add.ellipse(cx - size * 0.2, cy - size * 0.12, size * 0.6, size * 0.3, color, 0.8).setDepth(-8);

            const speed = 15000 + Phaser.Math.Between(0, 20000); // slower = farther
            scene.tweens.add({
                targets: [cloud, bump],
                x: '+=900',
                duration: speed,
                repeat: -1,
                onRepeat: (tween, targets) => {
                    targets.forEach(t => t.x -= 900);
                }
            });
        }

        // Distant hills
        for (let x = 0; x < 820; x += 80) {
            const hillH = 20 + Math.sin(x * 0.02) * 15;
            scene.add.ellipse(x, 410 - hillH / 2, 100, hillH, 0x4a9a3a, 0.6).setDepth(-7);
        }

        // Grass layer on ground
        scene.add.rectangle(400, 412, 800, 6, 0x3a8a2a).setDepth(-5);
        // Grass tufts
        for (let x = 10; x < 800; x += Phaser.Math.Between(12, 25)) {
            const h = Phaser.Math.Between(4, 10);
            scene.add.rectangle(x, 408 - h / 2, 2, h, 0x2d7a1e).setDepth(-4);
        }

        // Flowers
        const flowerColors = [0xff4466, 0xffaa33, 0xff66aa, 0xffff55, 0xaa66ff];
        for (let i = 0; i < 12; i++) {
            const fx = Phaser.Math.Between(20, 780);
            const color = Phaser.Utils.Array.GetRandom(flowerColors);
            scene.add.circle(fx, 406, 2, color).setDepth(-3);
            scene.add.rectangle(fx, 409, 1, 4, 0x2d7a1e).setDepth(-3); // stem
        }

        // Birds (tiny V shapes that drift)
        for (let i = 0; i < 3; i++) {
            const bx = Phaser.Math.Between(100, 700);
            const by = Phaser.Math.Between(40, 100);
            const bird = scene.add.text(bx, by, 'v', {
                fontSize: '8px', fill: '#333'
            }).setDepth(-6);
            scene.tweens.add({
                targets: bird,
                x: bx + Phaser.Math.Between(-100, 100),
                y: by + Phaser.Math.Between(-20, 20),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1
            });
        }
    },

    // ── WOODS DAY — dense canopy, light rays, floating pollen ──
    woodsDay(scene) {
        scene.cameras.main.setBackgroundColor('#2a5a20');

        // Dark canopy gradient
        const canopyColors = [0x1a3a10, 0x1e4012, 0x224814, 0x2a5818, 0x305a1a, 0x3a6a20, 0x4a8a2a];
        const stripeH = Math.ceil(410 / canopyColors.length);
        canopyColors.forEach((color, i) => {
            scene.add.rectangle(400, i * stripeH + stripeH / 2, 800, stripeH + 1, color).setDepth(-10);
        });

        // Ground with leaves/moss
        scene.add.rectangle(400, 412, 800, 6, 0x3a5a1a).setDepth(-5);
        for (let x = 5; x < 800; x += Phaser.Math.Between(8, 20)) {
            const leafColor = Phaser.Utils.Array.GetRandom([0x2a4a10, 0x3a5a1a, 0x4a6a20]);
            scene.add.rectangle(x, Phaser.Math.Between(406, 412), 3, 2, leafColor).setDepth(-4);
        }

        // Light rays — diagonal beams of light through the canopy
        for (let i = 0; i < 4; i++) {
            const rx = Phaser.Math.Between(50, 750);
            const ray = scene.add.rectangle(rx, 200, 15, 400, 0xffff88, 0.06).setDepth(-6);
            ray.setAngle(Phaser.Math.Between(-10, 10));
            // Rays shimmer
            scene.tweens.add({
                targets: ray,
                alpha: { from: 0.03, to: 0.1 },
                scaleX: { from: 0.8, to: 1.3 },
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1
            });
        }

        // Floating pollen / dust particles
        for (let i = 0; i < 20; i++) {
            const px = Phaser.Math.Between(0, 800);
            const py = Phaser.Math.Between(50, 400);
            const particle = scene.add.circle(px, py, 1, 0xffff88, 0.5).setDepth(-2);
            scene.tweens.add({
                targets: particle,
                x: px + Phaser.Math.Between(-60, 60),
                y: py + Phaser.Math.Between(-30, 30),
                alpha: { from: 0.2, to: 0.7 },
                duration: Phaser.Math.Between(2000, 5000),
                yoyo: true,
                repeat: -1
            });
        }

        // Mushrooms on ground
        const mushColors = [0xcc3333, 0xddaa33, 0xeeeecc];
        for (let i = 0; i < 5; i++) {
            const mx = Phaser.Math.Between(30, 770);
            const mc = Phaser.Utils.Array.GetRandom(mushColors);
            scene.add.rectangle(mx, 407, 3, 4, 0xccccaa).setDepth(-3); // stem
            scene.add.ellipse(mx, 404, 6, 4, mc).setDepth(-3);         // cap
        }
    },

    // ── WOODS NIGHT — stars, moon, fireflies ─────────────────
    woodsNight(scene) {
        scene.cameras.main.setBackgroundColor('#0a0a1e');

        // Night sky gradient
        const skyColors = [0x050510, 0x0a0a1e, 0x0e1028, 0x121430, 0x181a3a, 0x1a1a3a];
        const stripeH = Math.ceil(410 / skyColors.length);
        skyColors.forEach((color, i) => {
            scene.add.rectangle(400, i * stripeH + stripeH / 2, 800, stripeH + 1, color).setDepth(-10);
        });

        // Stars — twinkling
        for (let i = 0; i < 40; i++) {
            const sx = Phaser.Math.Between(5, 795);
            const sy = Phaser.Math.Between(5, 250);
            const size = Phaser.Math.Between(1, 2);
            const starColor = Phaser.Utils.Array.GetRandom([0xffffff, 0xccccff, 0xffffcc, 0xaaaaff]);
            const star = scene.add.circle(sx, sy, size, starColor, 0.8).setDepth(-9);
            // Twinkle!
            scene.tweens.add({
                targets: star,
                alpha: { from: 0.2, to: 1 },
                duration: Phaser.Math.Between(500, 2000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }

        // Moon with glow
        const moonGlow = scene.add.circle(650, 50, 35, 0x8888cc, 0.15).setDepth(-9);
        scene.add.circle(650, 50, 18, 0xddddee).setDepth(-9);
        scene.add.circle(650, 50, 14, 0xeeeeff).setDepth(-9);
        // Craters
        scene.add.circle(645, 45, 3, 0xccccdd).setDepth(-9);
        scene.add.circle(655, 55, 2, 0xccccdd).setDepth(-9);
        // Moon glow pulse
        scene.tweens.add({
            targets: moonGlow,
            scaleX: { from: 1, to: 1.2 },
            scaleY: { from: 1, to: 1.2 },
            alpha: { from: 0.15, to: 0.08 },
            duration: 3000,
            yoyo: true,
            repeat: -1
        });

        // Ground — dark with moss
        scene.add.rectangle(400, 412, 800, 6, 0x1a2a10).setDepth(-5);

        // Fireflies — glowing dots that float around
        for (let i = 0; i < 15; i++) {
            const fx = Phaser.Math.Between(30, 770);
            const fy = Phaser.Math.Between(200, 400);
            const firefly = scene.add.circle(fx, fy, 2, 0xaaff44, 0.8).setDepth(-1);
            const glow = scene.add.circle(fx, fy, 5, 0xaaff44, 0.15).setDepth(-1);

            // Float around randomly
            const moveFirefly = () => {
                const nx = fx + Phaser.Math.Between(-80, 80);
                const ny = fy + Phaser.Math.Between(-40, 40);
                scene.tweens.add({
                    targets: [firefly, glow],
                    x: Phaser.Math.Clamp(nx, 10, 790),
                    y: Phaser.Math.Clamp(ny, 150, 410),
                    duration: Phaser.Math.Between(2000, 4000),
                    onComplete: moveFirefly
                });
            };
            // Glow pulse
            scene.tweens.add({
                targets: [firefly],
                alpha: { from: 0.3, to: 1 },
                duration: Phaser.Math.Between(400, 800),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
            scene.tweens.add({
                targets: [glow],
                alpha: { from: 0.05, to: 0.25 },
                duration: Phaser.Math.Between(400, 800),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
            moveFirefly();
        }

        // Fog near ground
        for (let i = 0; i < 6; i++) {
            const fog = scene.add.ellipse(
                Phaser.Math.Between(0, 800), Phaser.Math.Between(380, 410),
                Phaser.Math.Between(100, 200), Phaser.Math.Between(15, 30),
                0x8888aa, 0.08
            ).setDepth(-3);
            scene.tweens.add({
                targets: fog,
                x: '+=120',
                alpha: { from: 0.05, to: 0.12 },
                duration: Phaser.Math.Between(5000, 10000),
                yoyo: true,
                repeat: -1
            });
        }
    },

    // ── BOSS ARENA — dark red sky, embers, cracks, ominous ───
    bossArena(scene) {
        scene.cameras.main.setBackgroundColor('#1a0505');

        // Red/black sky gradient
        const skyColors = [0x0a0000, 0x150505, 0x200808, 0x2a0a0a, 0x351010, 0x401515, 0x4a1a1a];
        const stripeH = Math.ceil(410 / skyColors.length);
        skyColors.forEach((color, i) => {
            scene.add.rectangle(400, i * stripeH + stripeH / 2, 800, stripeH + 1, color).setDepth(-10);
        });

        // Ominous red glow on horizon
        const horizonGlow = scene.add.ellipse(400, 420, 600, 80, 0xff2200, 0.08).setDepth(-9);
        scene.tweens.add({
            targets: horizonGlow,
            scaleX: { from: 1, to: 1.2 },
            alpha: { from: 0.06, to: 0.12 },
            duration: 2000,
            yoyo: true,
            repeat: -1
        });

        // Floating embers / sparks rising up
        for (let i = 0; i < 25; i++) {
            const ex = Phaser.Math.Between(10, 790);
            const ey = Phaser.Math.Between(300, 420);
            const emberColor = Phaser.Utils.Array.GetRandom([0xff4400, 0xff6600, 0xffaa00, 0xff2200]);
            const ember = scene.add.circle(ex, ey, Phaser.Math.Between(1, 2), emberColor, 0.8).setDepth(-2);

            // Rise up and fade out, then reset
            const animateEmber = () => {
                ember.x = Phaser.Math.Between(10, 790);
                ember.y = Phaser.Math.Between(350, 430);
                ember.setAlpha(0.8);
                scene.tweens.add({
                    targets: ember,
                    y: ember.y - Phaser.Math.Between(100, 350),
                    x: ember.x + Phaser.Math.Between(-40, 40),
                    alpha: 0,
                    duration: Phaser.Math.Between(1500, 3000),
                    onComplete: animateEmber
                });
            };
            // Stagger start times
            scene.time.delayedCall(Phaser.Math.Between(0, 2000), animateEmber);
        }

        // Ground cracks (glowing red lines)
        for (let i = 0; i < 8; i++) {
            const cx = Phaser.Math.Between(50, 750);
            const crack = scene.add.rectangle(cx, 425, Phaser.Math.Between(20, 50), 1, 0xff3300, 0.3).setDepth(-4);
            crack.setAngle(Phaser.Math.Between(-20, 20));
            scene.tweens.add({
                targets: crack,
                alpha: { from: 0.15, to: 0.5 },
                duration: Phaser.Math.Between(500, 1500),
                yoyo: true,
                repeat: -1
            });
        }

        // Dark pillars / rocks in background
        for (let i = 0; i < 4; i++) {
            const px = 100 + i * 200 + Phaser.Math.Between(-30, 30);
            const ph = Phaser.Math.Between(60, 120);
            scene.add.rectangle(px, 410 - ph / 2, Phaser.Math.Between(15, 25), ph, 0x1a0a08).setDepth(-7);
            scene.add.rectangle(px, 410 - ph, Phaser.Math.Between(20, 30), 5, 0x1a0a08).setDepth(-7);
        }

        // Smoke wisps
        for (let i = 0; i < 4; i++) {
            const smoke = scene.add.ellipse(
                Phaser.Math.Between(50, 750), Phaser.Math.Between(300, 400),
                Phaser.Math.Between(30, 60), Phaser.Math.Between(10, 20),
                0x331111, 0.15
            ).setDepth(-6);
            scene.tweens.add({
                targets: smoke,
                y: '-=80',
                x: '+=30',
                alpha: 0,
                scaleX: 1.5,
                duration: Phaser.Math.Between(3000, 5000),
                yoyo: false,
                repeat: -1
            });
        }
    }
};
