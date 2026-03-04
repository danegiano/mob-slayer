// ============================================
// Mob Slayer — Village Preview
// Uses Kenney Tiny Town tileset (16x16 tiles)
// 12 columns x 11 rows = 132 tiles
// ============================================

const TILE = {
    // Ground
    GRASS1: 0,
    GRASS2: 1,
    GRASS_FLOWER: 2,
    DIRT1: 24,
    DIRT2: 25,
    DIRT3: 26,

    // Green trees (2x2)
    GTREE_TL: 3,
    GTREE_TR: 4,
    GTREE_BL: 15,
    GTREE_BR: 16,

    // Small green things
    BUSH_TL: 5,
    BUSH_TR: 6,
    BUSH_BL: 17,
    BUSH_BR: 18,

    // Autumn trees (2x2)
    ATREE_TL: 9,
    ATREE_TR: 10,
    ATREE_BL: 21,
    ATREE_BR: 22,

    // Orange trees
    OTREE_TL: 11,
    OTREE_TR: 23,

    // Mushroom / flower
    MUSHROOM: 29,
    FLOWER1: 27,
    FLOWER2: 28,

    // House 1 — brown roof
    ROOF1_L: 36,
    ROOF1_M: 37,
    ROOF1_R: 38,
    WALL1_L: 48,
    WALL1_M: 49,
    WALL1_R: 50,

    // House 2 — red/orange roof
    ROOF2_L: 39,
    ROOF2_M: 40,
    ROOF2_R: 41,
    WALL2_L: 51,
    WALL2_M: 52,

    // House details
    WINDOW: 50,
    CHIMNEY: 44,

    // Big building / shop
    SHOP_ROOF_L: 42,
    SHOP_ROOF_R: 43,

    // Stone building (row 5-7)
    STONE_TL: 60,
    STONE_TM: 61,
    STONE_TR: 62,
    STONE_ML: 72,
    STONE_MM: 73,
    STONE_MR: 74,
    STONE_BL: 84,
    STONE_BM: 85,
    STONE_BR: 86,

    // Doors
    DOOR_WOOD_L: 76,
    DOOR_WOOD_M: 77,
    DOOR_WOOD_R: 78,
    DOOR_BIG_L: 88,
    DOOR_BIG_M: 89,
    DOOR_BIG_R: 90,

    // Fences
    FENCE_L: 96,
    FENCE_M: 97,
    FENCE_R: 98,

    // Items & props
    BARREL: 107,
    CHEST: 43,
    SIGN_POST: 69,
    SIGN_ARROW: 70,
    TORCH: 82,
    WELL: 81,
    LANTERN: 93,
    CRATE: 94,

    // Characters
    KNIGHT: 128,
    VILLAGER: 127,

    // Castle stuff
    CASTLE_WALL: 99,
    CASTLE_TOP: 100,
    BANNER: 46,
};

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
        const COLS = 25;
        const ROWS = 14;
        const SCALE = 3;

        // Fill with grass
        const map = [];
        for (let r = 0; r < ROWS; r++) {
            map[r] = [];
            for (let c = 0; c < COLS; c++) {
                map[r][c] = (Math.random() > 0.8) ? TILE.GRASS2 : TILE.GRASS1;
            }
        }

        // --- Dirt path across the village ---
        for (let c = 0; c < COLS; c++) {
            map[10][c] = TILE.DIRT1;
            map[11][c] = TILE.DIRT2;
        }
        // Vertical path to middle house
        map[8][10] = TILE.DIRT1;
        map[9][10] = TILE.DIRT2;

        // --- House 1 (left) — brown roof ---
        map[6][3] = TILE.ROOF1_L;
        map[6][4] = TILE.ROOF1_M;
        map[6][5] = TILE.ROOF1_R;
        map[7][3] = TILE.WALL1_L;
        map[7][4] = TILE.WALL1_M;
        map[7][5] = TILE.WALL1_R;

        // --- House 2 (middle) — red roof ---
        map[6][9] = TILE.ROOF2_L;
        map[6][10] = TILE.ROOF2_M;
        map[6][11] = TILE.ROOF2_R;
        map[7][9] = TILE.WALL2_L;
        map[7][10] = TILE.WALL2_M;
        map[7][11] = TILE.WALL1_R;

        // --- House 3 (right) — brown roof ---
        map[6][16] = TILE.ROOF1_L;
        map[6][17] = TILE.ROOF1_M;
        map[6][18] = TILE.ROOF1_R;
        map[7][16] = TILE.WALL1_L;
        map[7][17] = TILE.WALL1_M;
        map[7][18] = TILE.WALL1_R;

        // --- Green trees (left edge) ---
        map[0][0] = TILE.GTREE_TL;
        map[0][1] = TILE.GTREE_TR;
        map[1][0] = TILE.GTREE_BL;
        map[1][1] = TILE.GTREE_BR;

        map[3][0] = TILE.GTREE_TL;
        map[3][1] = TILE.GTREE_TR;
        map[4][0] = TILE.GTREE_BL;
        map[4][1] = TILE.GTREE_BR;

        // --- Autumn trees (right edge) ---
        map[0][23] = TILE.ATREE_TL;
        map[0][24] = TILE.ATREE_TR;
        map[1][23] = TILE.ATREE_BL;
        map[1][24] = TILE.ATREE_BR;

        map[3][23] = TILE.ATREE_TL;
        map[3][24] = TILE.ATREE_TR;
        map[4][23] = TILE.ATREE_BL;
        map[4][24] = TILE.ATREE_BR;

        // --- More trees along top ---
        map[0][5] = TILE.GTREE_TL;
        map[0][6] = TILE.GTREE_TR;
        map[1][5] = TILE.GTREE_BL;
        map[1][6] = TILE.GTREE_BR;

        map[0][12] = TILE.GTREE_TL;
        map[0][13] = TILE.GTREE_TR;
        map[1][12] = TILE.GTREE_BL;
        map[1][13] = TILE.GTREE_BR;

        map[0][19] = TILE.ATREE_TL;
        map[0][20] = TILE.ATREE_TR;
        map[1][19] = TILE.ATREE_BL;
        map[1][20] = TILE.ATREE_BR;

        // --- Bushes ---
        map[5][3] = TILE.BUSH_TL;
        map[5][4] = TILE.BUSH_TR;
        map[5][17] = TILE.BUSH_TL;
        map[5][18] = TILE.BUSH_TR;

        // --- Fences along the path ---
        map[9][3] = TILE.FENCE_L;
        map[9][4] = TILE.FENCE_M;
        map[9][5] = TILE.FENCE_M;
        map[9][6] = TILE.FENCE_R;

        map[9][16] = TILE.FENCE_L;
        map[9][17] = TILE.FENCE_M;
        map[9][18] = TILE.FENCE_R;

        // --- Props ---
        map[9][8] = TILE.BARREL;
        map[9][9] = TILE.BARREL;
        map[8][14] = TILE.SIGN_POST;
        map[9][21] = TILE.TORCH;
        map[9][23] = TILE.TORCH;
        map[12][15] = TILE.CHEST;
        map[8][21] = TILE.WELL;

        // --- Flowers ---
        map[12][3] = TILE.FLOWER1;
        map[12][4] = TILE.FLOWER2;
        map[12][19] = TILE.FLOWER1;
        map[4][10] = TILE.MUSHROOM;

        // --- NPC knight ---
        map[9][13] = TILE.KNIGHT;

        // --- Bottom trees ---
        map[12][0] = TILE.GTREE_TL;
        map[12][1] = TILE.GTREE_TR;
        map[13][0] = TILE.GTREE_BL;
        map[13][1] = TILE.GTREE_BR;

        map[12][23] = TILE.ATREE_TL;
        map[12][24] = TILE.ATREE_TR;
        map[13][23] = TILE.ATREE_BL;
        map[13][24] = TILE.ATREE_BR;

        // --- Draw the map! ---
        const offsetX = (800 - COLS * 16 * SCALE) / 2;
        const offsetY = (450 - ROWS * 16 * SCALE) / 2;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = this.add.image(
                    offsetX + c * 16 * SCALE + 8 * SCALE,
                    offsetY + r * 16 * SCALE + 8 * SCALE,
                    'tiles',
                    map[r][c]
                );
                tile.setScale(SCALE);
            }
        }

        // Title
        this.add.text(400, 16, 'Mob Slayer — Village', {
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
