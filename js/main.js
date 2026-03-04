// ============================================
// Mob Slayer — Village Preview
// Kenney Tiny Town tileset (16x16, 12 cols x 11 rows)
// Hand-crafted village map — every tile placed on purpose!
// ============================================

// Short names so the map grid is easy to read
const T = {
    // Ground
    g1: 0,    // grass
    g2: 1,    // grass variant
    gf: 2,    // grass with flowers
    d1: 24,   // dirt
    d2: 25,   // dirt variant
    d3: 26,   // dirt edge

    // Green tree (2x2 block)
    Tl: 3,    // tree top-left
    Tr: 4,    // tree top-right
    tl: 15,   // tree bottom-left
    tr: 16,   // tree bottom-right

    // Autumn tree (2x2 block)
    Al: 9,    // autumn top-left
    Ar: 10,   // autumn top-right
    al: 21,   // autumn bottom-left
    ar: 22,   // autumn bottom-right

    // Bush (2x2 block)
    Bl: 5,    // bush top-left
    Br: 6,    // bush top-right
    bl: 17,   // bush bottom-left
    br: 18,   // bush bottom-right

    // Round tree (2x2 block)
    Rl: 7,    // round top-left
    Rr: 8,    // round top-right
    rl: 19,   // round bottom-left
    rr: 20,   // round bottom-right

    // House 1 — brown roof (row 3-4, cols 0-2)
    h1: 36,   // roof left
    h2: 37,   // roof mid
    h3: 38,   // roof right
    h4: 48,   // wall left
    h5: 49,   // wall door
    h6: 50,   // wall right/window

    // House 2 — red roof (row 3-4, cols 3-5)
    r1: 39,   // roof left
    r2: 40,   // roof mid
    r3: 41,   // roof right
    r4: 51,   // wall left
    r5: 52,   // wall window
    r6: 50,   // wall right

    // Big building front pieces
    s1: 60,   // stone top-left
    s2: 61,   // stone top-mid
    s3: 62,   // stone top-right
    s4: 72,   // stone mid-left
    s5: 73,   // stone mid-mid
    s6: 74,   // stone mid-right
    s7: 84,   // stone bot-left
    s8: 85,   // stone bot-mid
    s9: 86,   // stone bot-right

    // Doors (wooden)
    D1: 76,   // door left
    D2: 77,   // door center
    D3: 78,   // door right
    // Big doors
    D4: 88,   // big door left
    D5: 89,   // big door center
    D6: 90,   // big door right

    // Props
    fl: 27,   // flower
    mu: 29,   // mushroom
    sg: 69,   // sign post
    sa: 70,   // sign arrow
    we: 81,   // well
    to: 82,   // torch
    la: 93,   // lantern
    ba: 95,   // barrel
    ch: 43,   // chest

    // Fence
    fL: 96,   // fence left end
    fM: 97,   // fence middle
    fR: 98,   // fence right end

    // Roof triangle
    rt: 63,   // triangle roof peak

    // characters
    kn: 128,  // knight (player!)

    // Decorative ground
    p1: 30,   // path/platform
    p2: 31,   // path variant
};

// The village map! Each row is one row of tiles.
// Read it like a picture — trees at top, houses in middle, path at bottom
// __ = grass (we'll replace with random grass)
const __ = 'g';  // placeholder for random grass

const villageMap = [
    // Row 0: Tree line across the top
    [T.Tl,T.Tr, __, T.Rl,T.Rr, __, __, T.Tl,T.Tr, __, __, __, __, __, __, __, T.Al,T.Ar, __, __, T.Tl,T.Tr, __, T.Al,T.Ar],
    // Row 1: Tree bottoms
    [T.tl,T.tr, __, T.rl,T.rr, __, __, T.tl,T.tr, __, __, __, __, __, __, __, T.al,T.ar, __, __, T.tl,T.tr, __, T.al,T.ar],
    // Row 2: Open grass with some flowers
    [  __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __],
    // Row 3: Space above houses
    [  __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __, __],
    // Row 4: House roofs
    [  __,T.Bl,T.Br, T.h1,T.h2,T.h3, __, __, T.r1,T.r2,T.r3, __, __, __, T.s1,T.s2,T.s3, __,T.Bl,T.Br, __, __, T.h1,T.h2,T.h3],
    // Row 5: House walls
    [  __,T.bl,T.br, T.h4,T.h5,T.h6, __, __, T.r4,T.r5,T.r4, __, __,  __, T.s4,T.D2,T.s6, __,T.bl,T.br, __, __, T.h4,T.h5,T.h6],
    // Row 6: Space between houses and path
    [  __, __, __, __, T.ba, __, __, __, __, __, __, __, T.we, __, __, __, __, __, __, __, __, __, __, T.ba, __],
    // Row 7: Fence line and items
    [  __, T.fL,T.fM,T.fM,T.fR, __, T.to, __, __, T.sg, __, __, __, __, T.fL,T.fM,T.fR, __, T.to, __, __, T.fL,T.fM,T.fM,T.fR],
    // Row 8: Dirt path (main road through village)
    [T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1],
    // Row 9: Dirt path bottom
    [T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.kn,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2,T.d1,T.d2],
    // Row 10: Below path — grass with flowers
    [  __, __, T.fl, __, __, __, __, T.gf, __, __, __, __, __, __, __, T.fl, __, __, __, T.gf, __, __, __, __, __],
    // Row 11: More grass, some trees
    [  __, __, __, T.Tl,T.Tr, __, __, __, __, T.Bl,T.Br, __, __, __, __, __, __, T.Al,T.Ar, __, __, __, T.Tl,T.Tr, __],
    // Row 12: Tree bottoms
    [  __, __, __, T.tl,T.tr, __, __, __, __, T.bl,T.br, __, __, __, __, __, __, T.al,T.ar, __, __, __, T.tl,T.tr, __],
    // Row 13: Bottom edge
    [T.Rl,T.Rr, __, __, __, __, __, __, __, __, __, __, __, T.mu, __, __, __, __, __, __, __, __, __, T.Rl,T.Rr],
];

class VillagePreview extends Phaser.Scene {
    constructor() {
        super('VillagePreview');
    }

    preload() {
        this.load.spritesheet('tiles', 'assets/tilemap.png', {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        const ROWS = villageMap.length;
        const COLS = villageMap[0].length;
        const SCALE = 3;

        // Center the map on screen
        const offsetX = (800 - COLS * 16 * SCALE) / 2;
        const offsetY = (450 - ROWS * 16 * SCALE) / 2;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let tileId = villageMap[r][c];

                // Replace grass placeholder with random grass
                if (tileId === 'g') {
                    tileId = (Math.random() > 0.8) ? T.g2 : T.g1;
                }

                const tile = this.add.image(
                    offsetX + c * 16 * SCALE + 8 * SCALE,
                    offsetY + r * 16 * SCALE + 8 * SCALE,
                    'tiles',
                    tileId
                );
                tile.setScale(SCALE);
            }
        }

        // Title
        this.add.text(400, 12, 'Mob Slayer — Village', {
            fontSize: '22px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    pixelArt: true,
    backgroundColor: '#5a8f3c',
    scene: [VillagePreview]
};

const game = new Phaser.Game(config);
