"""
Generate top-notch pixel art sprite sheets for Mob Slayer.
Each character gets a 2-frame idle animation as a horizontal strip.
Uses proper pixel art techniques: black outlines, 3-tone shading, sub-pixel detail.
"""
from PIL import Image, ImageDraw


# ── Helpers ──────────────────────────────────────────────────

def px(img, x, y, color):
    """Set a single pixel (bounds-checked)."""
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), color)

def fill(img, x1, y1, w, h, color):
    """Fill a solid rectangle."""
    for yy in range(y1, y1 + h):
        for xx in range(x1, x1 + w):
            px(img, xx, yy, color)

def outline(img, x1, y1, w, h, color):
    """Draw 1px rectangle outline."""
    for xx in range(x1, x1 + w):
        px(img, xx, y1, color)
        px(img, xx, y1 + h - 1, color)
    for yy in range(y1, y1 + h):
        px(img, x1, yy, color)
        px(img, x1 + w - 1, yy, color)

def hline(img, x, y, length, color):
    for xx in range(x, x + length):
        px(img, xx, y, color)

def vline(img, x, y, length, color):
    for yy in range(y, y + length):
        px(img, x, yy, color)

def pixels(img, coords, color):
    for x, y in coords:
        px(img, x, y, color)

T = (0, 0, 0, 0)  # transparent


# ── PLAYER KNIGHT (32x48, 2 idle frames = 64x48) ────────────

def make_player():
    W, H = 32, 48
    img = Image.new('RGBA', (W * 2, H), T)

    # Color palette — proper 3-tone shading
    BLK = (10, 10, 15, 255)
    # Armor
    ARM_D = (25, 55, 140, 255)    # dark blue
    ARM_M = (45, 90, 200, 255)    # mid blue
    ARM_L = (80, 130, 240, 255)   # highlight blue
    # Skin
    SKN_D = (180, 140, 100, 255)
    SKN_M = (220, 185, 145, 255)
    SKN_L = (240, 210, 175, 255)
    # Helmet / metal
    MET_D = (100, 105, 115, 255)
    MET_M = (160, 165, 175, 255)
    MET_L = (210, 215, 225, 255)
    # Sword
    SWD_D = (150, 155, 165, 255)
    SWD_M = (200, 205, 215, 255)
    SWD_L = (235, 240, 250, 255)
    # Belt / boots
    BRN_D = (70, 45, 25, 255)
    BRN_M = (120, 80, 45, 255)
    BRN_L = (160, 115, 70, 255)
    # Cape
    CAP_D = (120, 20, 20, 255)
    CAP_M = (180, 40, 35, 255)
    # Eye
    EYE = (255, 255, 255, 255)
    PUPIL = (30, 30, 60, 255)

    for frame in range(2):
        ox = frame * W  # x offset for this frame
        bob = 1 if frame == 1 else 0  # frame 2 bobs up 1px

        # ── Helmet ──
        # Crest on top
        for yy in range(1 - bob, 3 - bob):
            hline(img, ox + 14, yy, 4, MET_M)
        pixels(img, [(ox + 15, 0 - bob), (ox + 16, 0 - bob)], MET_L)

        # Helmet dome
        hline(img, ox + 10, 3 - bob, 12, BLK)  # top outline
        for yy in range(4 - bob, 6 - bob):
            px(img, ox + 9, yy, BLK)
            fill(img, ox + 10, yy, 12, 1, MET_M)
            px(img, ox + 22, yy, BLK)
        # Highlight on helmet
        hline(img, ox + 11, 4 - bob, 5, MET_L)

        # Helmet lower / visor area
        for yy in range(6 - bob, 8 - bob):
            px(img, ox + 9, yy, BLK)
            fill(img, ox + 10, yy, 12, 1, MET_D)
            px(img, ox + 22, yy, BLK)

        # Visor slit (face showing through)
        hline(img, ox + 11, 8 - bob, 10, BLK)  # visor top line
        px(img, ox + 9, 8 - bob, BLK)
        px(img, ox + 22, 8 - bob, BLK)

        # Face through visor
        fill(img, ox + 11, 9 - bob, 10, 3, SKN_M)
        px(img, ox + 10, 9 - bob, BLK)
        px(img, ox + 10, 10 - bob, BLK)
        px(img, ox + 10, 11 - bob, BLK)
        px(img, ox + 21, 9 - bob, BLK)
        px(img, ox + 21, 10 - bob, BLK)
        px(img, ox + 21, 11 - bob, BLK)

        # Eyes
        px(img, ox + 13, 9 - bob, EYE)
        px(img, ox + 14, 9 - bob, PUPIL)
        px(img, ox + 18, 9 - bob, EYE)
        px(img, ox + 17, 9 - bob, PUPIL)

        # Chin guard
        hline(img, ox + 10, 12 - bob, 12, BLK)
        fill(img, ox + 11, 12 - bob, 10, 1, MET_D)

        # ── Neck ──
        fill(img, ox + 13, 13 - bob, 6, 2, SKN_D)

        # ── Armor Body ──
        # Shoulder plates
        fill(img, ox + 7, 15 - bob, 5, 3, MET_M)
        fill(img, ox + 20, 15 - bob, 5, 3, MET_M)
        hline(img, ox + 7, 15 - bob, 5, MET_L)
        hline(img, ox + 20, 15 - bob, 5, MET_L)
        outline(img, ox + 6, 14 - bob, 7, 5, BLK)
        outline(img, ox + 19, 14 - bob, 7, 5, BLK)

        # Chest armor
        fill(img, ox + 10, 15 - bob, 12, 12, ARM_M)
        # Armor shading — left side darker, right side lighter
        for yy in range(15 - bob, 27 - bob):
            px(img, ox + 10, yy, ARM_D)
            px(img, ox + 11, yy, ARM_D)
            px(img, ox + 20, yy, ARM_L)
            px(img, ox + 21, yy, ARM_L)
        # Chest plate highlight
        fill(img, ox + 13, 17 - bob, 6, 3, ARM_L)
        # Chest cross detail
        vline(img, ox + 16, 16 - bob, 8, ARM_D)
        hline(img, ox + 13, 20 - bob, 6, ARM_D)
        # Outline
        outline(img, ox + 9, 14 - bob, 14, 14, BLK)

        # ── Cape (behind, showing on sides) ──
        fill(img, ox + 8, 18 - bob, 2, 10, CAP_D)
        fill(img, ox + 22, 18 - bob, 2, 10, CAP_M)
        # Cape bottom flutter (frame 2 slightly different)
        if frame == 1:
            px(img, ox + 7, 27 - bob, CAP_D)
            px(img, ox + 23, 27 - bob, CAP_M)

        # ── Belt ──
        fill(img, ox + 10, 27 - bob, 12, 2, BRN_M)
        fill(img, ox + 14, 27 - bob, 4, 2, BRN_L)  # buckle
        hline(img, ox + 10, 27 - bob, 12, BRN_D)

        # ── Arms ──
        # Left arm
        fill(img, ox + 5, 19 - bob, 4, 8, ARM_M)
        vline(img, ox + 5, 19 - bob, 8, ARM_D)
        outline(img, ox + 4, 18 - bob, 6, 10, BLK)
        # Left hand
        fill(img, ox + 5, 27 - bob, 4, 3, SKN_M)
        outline(img, ox + 4, 27 - bob, 6, 4, BLK)

        # Right arm
        fill(img, ox + 23, 19 - bob, 4, 8, ARM_M)
        vline(img, ox + 26, 19 - bob, 8, ARM_L)
        outline(img, ox + 22, 18 - bob, 6, 10, BLK)
        # Right hand
        fill(img, ox + 23, 27 - bob, 4, 3, SKN_M)
        outline(img, ox + 22, 27 - bob, 6, 4, BLK)

        # ── Sword in right hand ──
        # Hilt
        fill(img, ox + 26, 24 - bob, 2, 4, BRN_M)
        # Crossguard
        hline(img, ox + 24, 21 - bob, 6, BRN_D)
        hline(img, ox + 24, 22 - bob, 6, BRN_D)
        # Blade
        fill(img, ox + 26, 10 - bob, 2, 12, SWD_M)
        vline(img, ox + 27, 10 - bob, 12, SWD_L)
        # Blade tip
        px(img, ox + 26, 9 - bob, SWD_L)
        px(img, ox + 27, 8 - bob, SWD_L)
        # Blade outline
        vline(img, ox + 25, 9 - bob, 14, BLK)
        vline(img, ox + 28, 9 - bob, 14, BLK)
        px(img, ox + 26, 8 - bob, BLK)
        px(img, ox + 27, 7 - bob, BLK)

        # ── Legs ──
        # Left leg
        fill(img, ox + 11, 29 - bob, 5, 10, ARM_D)
        fill(img, ox + 12, 30 - bob, 3, 8, ARM_M)
        outline(img, ox + 10, 29 - bob, 6, 10, BLK)

        # Right leg
        fill(img, ox + 17, 29 - bob, 5, 10, ARM_D)
        fill(img, ox + 18, 30 - bob, 3, 8, ARM_M)
        outline(img, ox + 16, 29 - bob, 6, 10, BLK)

        # ── Boots ──
        fill(img, ox + 9, 39 - bob, 7, 5, BRN_M)
        fill(img, ox + 10, 40 - bob, 5, 2, BRN_L)
        fill(img, ox + 8, 43 - bob, 8, 2, BRN_D)  # sole
        outline(img, ox + 8, 38 - bob, 8, 8, BLK)

        fill(img, ox + 16, 39 - bob, 7, 5, BRN_M)
        fill(img, ox + 17, 40 - bob, 5, 2, BRN_L)
        fill(img, ox + 16, 43 - bob, 8, 2, BRN_D)
        outline(img, ox + 15, 38 - bob, 9, 8, BLK)

    img.save('assets/player.png')
    print('  player.png (64x48 — 2 frames of 32x48)')


# ── BLACKSMITH NPC (32x48, 2 idle frames = 64x48) ───────────

def make_blacksmith():
    W, H = 32, 48
    img = Image.new('RGBA', (W * 2, H), T)

    BLK = (10, 10, 15, 255)
    # Skin — tanned
    SKN_D = (165, 120, 80, 255)
    SKN_M = (200, 155, 110, 255)
    SKN_L = (230, 190, 145, 255)
    # Hair / beard
    HAIR_D = (50, 30, 15, 255)
    HAIR_M = (80, 55, 30, 255)
    # Shirt — orange/brown
    SHT_D = (160, 85, 20, 255)
    SHT_M = (210, 130, 40, 255)
    SHT_L = (240, 170, 70, 255)
    # Apron — dark leather
    APR_D = (50, 45, 40, 255)
    APR_M = (80, 72, 65, 255)
    APR_L = (105, 95, 85, 255)
    # Boots/belt
    BRN_D = (55, 35, 20, 255)
    BRN_M = (90, 60, 35, 255)
    # Pants
    PNT_D = (60, 55, 50, 255)
    PNT_M = (90, 82, 75, 255)
    # Hammer
    HAM_D = (100, 100, 110, 255)
    HAM_M = (150, 150, 165, 255)
    HAM_L = (200, 200, 215, 255)
    # Eye
    EYE_W = (240, 240, 240, 255)
    EYE_P = (40, 30, 20, 255)

    for frame in range(2):
        ox = frame * W
        bob = 1 if frame == 1 else 0

        # ── Head ──
        # Hair (big, bushy)
        fill(img, ox + 9, 2 - bob, 14, 5, HAIR_M)
        hline(img, ox + 10, 1 - bob, 12, HAIR_D)
        fill(img, ox + 8, 4 - bob, 2, 5, HAIR_M)   # left sideburn
        fill(img, ox + 22, 4 - bob, 2, 5, HAIR_M)  # right sideburn

        # Face
        fill(img, ox + 10, 5 - bob, 12, 8, SKN_M)
        # Face shading
        vline(img, ox + 10, 5 - bob, 8, SKN_D)
        vline(img, ox + 21, 5 - bob, 8, SKN_L)
        # Outline
        outline(img, ox + 8, 1 - bob, 16, 13, BLK)

        # Eyes
        px(img, ox + 13, 7 - bob, EYE_W)
        px(img, ox + 14, 7 - bob, EYE_P)
        px(img, ox + 18, 7 - bob, EYE_W)
        px(img, ox + 19, 7 - bob, EYE_P)
        # Thick eyebrows
        hline(img, ox + 12, 6 - bob, 4, HAIR_D)
        hline(img, ox + 17, 6 - bob, 4, HAIR_D)

        # Nose
        fill(img, ox + 15, 8 - bob, 2, 2, SKN_D)

        # Bushy mustache + beard
        hline(img, ox + 12, 10 - bob, 8, HAIR_M)
        hline(img, ox + 11, 11 - bob, 10, HAIR_M)
        fill(img, ox + 12, 12 - bob, 8, 2, HAIR_D)
        # Beard outline
        hline(img, ox + 11, 13 - bob, 10, BLK)

        # ── Neck (thick) ──
        fill(img, ox + 12, 14 - bob, 8, 2, SKN_D)

        # ── Shirt / torso ──
        fill(img, ox + 8, 16 - bob, 16, 12, SHT_M)
        # Shading
        for yy in range(16 - bob, 28 - bob):
            px(img, ox + 8, yy, SHT_D)
            px(img, ox + 9, yy, SHT_D)
            px(img, ox + 22, yy, SHT_L)
            px(img, ox + 23, yy, SHT_L)
        # Collar
        hline(img, ox + 12, 16 - bob, 8, SHT_L)
        outline(img, ox + 7, 15 - bob, 18, 14, BLK)

        # ── Leather apron (over shirt) ──
        fill(img, ox + 10, 19 - bob, 12, 9, APR_M)
        # Apron shading
        vline(img, ox + 10, 19 - bob, 9, APR_D)
        vline(img, ox + 21, 19 - bob, 9, APR_L)
        # Apron straps
        vline(img, ox + 12, 16 - bob, 3, APR_D)
        vline(img, ox + 19, 16 - bob, 3, APR_D)
        # Apron pockets
        outline(img, ox + 12, 22 - bob, 4, 3, APR_D)
        outline(img, ox + 16, 22 - bob, 4, 3, APR_D)
        # Outline
        outline(img, ox + 9, 18 - bob, 14, 11, BLK)

        # ── Belt ──
        fill(img, ox + 8, 28 - bob, 16, 2, BRN_M)
        fill(img, ox + 14, 28 - bob, 4, 2, BRN_D)
        hline(img, ox + 8, 28 - bob, 16, BLK)

        # ── Arms (beefy!) ──
        # Left arm
        fill(img, ox + 3, 17 - bob, 5, 10, SKN_M)
        fill(img, ox + 3, 17 - bob, 5, 3, SHT_M)  # sleeve
        hline(img, ox + 3, 17 - bob, 5, SHT_D)
        vline(img, ox + 3, 17 - bob, 10, SKN_D)
        outline(img, ox + 2, 16 - bob, 7, 12, BLK)
        # Fist
        fill(img, ox + 3, 27 - bob, 5, 3, SKN_D)
        outline(img, ox + 2, 27 - bob, 7, 4, BLK)

        # Right arm
        fill(img, ox + 24, 17 - bob, 5, 10, SKN_M)
        fill(img, ox + 24, 17 - bob, 5, 3, SHT_M)
        hline(img, ox + 24, 17 - bob, 5, SHT_D)
        vline(img, ox + 28, 17 - bob, 10, SKN_L)
        outline(img, ox + 23, 16 - bob, 7, 12, BLK)
        # Fist
        fill(img, ox + 24, 27 - bob, 5, 3, SKN_D)
        outline(img, ox + 23, 27 - bob, 7, 4, BLK)

        # ── Hammer in right hand ──
        # Handle
        fill(img, ox + 27, 20 - bob, 2, 10, BRN_M)
        vline(img, ox + 26, 20 - bob, 10, BLK)
        vline(img, ox + 29, 20 - bob, 10, BLK)
        # Head
        fill(img, ox + 24, 15 - bob, 8, 5, HAM_M)
        hline(img, ox + 25, 15 - bob, 6, HAM_L)  # highlight
        fill(img, ox + 24, 19 - bob, 8, 1, HAM_D)
        outline(img, ox + 23, 14 - bob, 10, 7, BLK)

        # ── Legs ──
        fill(img, ox + 10, 30 - bob, 5, 10, PNT_M)
        vline(img, ox + 10, 30 - bob, 10, PNT_D)
        outline(img, ox + 9, 30 - bob, 6, 10, BLK)

        fill(img, ox + 17, 30 - bob, 5, 10, PNT_M)
        vline(img, ox + 17, 30 - bob, 10, PNT_D)
        outline(img, ox + 16, 30 - bob, 6, 10, BLK)

        # ── Boots ──
        fill(img, ox + 8, 40 - bob, 8, 5, BRN_M)
        hline(img, ox + 8, 44 - bob, 8, BRN_D)
        outline(img, ox + 7, 39 - bob, 10, 7, BLK)

        fill(img, ox + 16, 40 - bob, 8, 5, BRN_M)
        hline(img, ox + 16, 44 - bob, 8, BRN_D)
        outline(img, ox + 15, 39 - bob, 10, 7, BLK)

    img.save('assets/blacksmith.png')
    print('  blacksmith.png (64x48 — 2 frames of 32x48)')


# ── GOBLIN (24x24, 2 idle frames = 48x24) ───────────────────

def make_goblin():
    W, H = 24, 24
    img = Image.new('RGBA', (W * 2, H), T)

    BLK = (10, 10, 15, 255)
    GRN_D = (30, 100, 35, 255)
    GRN_M = (55, 150, 55, 255)
    GRN_L = (85, 190, 80, 255)
    RED = (220, 40, 40, 255)
    YLW = (230, 210, 70, 255)
    BRN_D = (70, 45, 25, 255)
    BRN_M = (110, 75, 40, 255)
    VEST = (100, 60, 30, 255)
    VEST_D = (70, 40, 20, 255)
    MET = (170, 170, 185, 255)
    MET_L = (210, 210, 225, 255)

    for frame in range(2):
        ox = frame * W
        bob = 1 if frame == 1 else 0

        # ── Head ──
        fill(img, ox + 8, 1 - bob, 8, 7, GRN_M)
        fill(img, ox + 9, 2 - bob, 6, 5, GRN_L)
        outline(img, ox + 7, 0 - bob, 10, 9, BLK)

        # Pointy ears
        pixels(img, [(ox + 5, 3 - bob), (ox + 6, 2 - bob), (ox + 6, 3 - bob), (ox + 6, 4 - bob)], GRN_M)
        pixels(img, [(ox + 18, 3 - bob), (ox + 17, 2 - bob), (ox + 17, 3 - bob), (ox + 17, 4 - bob)], GRN_M)
        # Ear outlines
        pixels(img, [(ox + 4, 3 - bob), (ox + 5, 2 - bob), (ox + 5, 4 - bob), (ox + 6, 1 - bob), (ox + 6, 5 - bob)], BLK)
        pixels(img, [(ox + 19, 3 - bob), (ox + 18, 2 - bob), (ox + 18, 4 - bob), (ox + 17, 1 - bob), (ox + 17, 5 - bob)], BLK)

        # Eyes (angry red)
        px(img, ox + 10, 3 - bob, RED)
        px(img, ox + 11, 3 - bob, RED)
        px(img, ox + 13, 3 - bob, RED)
        px(img, ox + 14, 3 - bob, RED)
        # Angry brow
        px(img, ox + 9, 2 - bob, BLK)
        px(img, ox + 14, 2 - bob, BLK)

        # Fangs
        px(img, ox + 10, 6 - bob, YLW)
        px(img, ox + 13, 6 - bob, YLW)
        hline(img, ox + 10, 5 - bob, 4, BLK)

        # ── Body + vest ──
        fill(img, ox + 8, 8 - bob, 8, 7, GRN_D)
        fill(img, ox + 9, 9 - bob, 6, 5, VEST)
        vline(img, ox + 9, 9 - bob, 5, VEST_D)
        outline(img, ox + 7, 8 - bob, 10, 8, BLK)

        # ── Arms ──
        fill(img, ox + 5, 9 - bob, 3, 5, GRN_M)
        outline(img, ox + 4, 9 - bob, 4, 6, BLK)
        fill(img, ox + 16, 9 - bob, 3, 5, GRN_M)
        outline(img, ox + 16, 9 - bob, 4, 6, BLK)

        # ── Dagger in right hand ──
        vline(img, ox + 19, 7 - bob, 5, MET)
        px(img, ox + 19, 6 - bob, MET_L)  # tip
        px(img, ox + 19, 12 - bob, BRN_M)  # hilt
        px(img, ox + 18, 7 - bob, BLK)
        px(img, ox + 20, 7 - bob, BLK)

        # ── Legs ──
        fill(img, ox + 9, 15 - bob, 3, 5, GRN_D)
        outline(img, ox + 8, 15 - bob, 4, 6, BLK)
        fill(img, ox + 13, 15 - bob, 3, 5, GRN_D)
        outline(img, ox + 12, 15 - bob, 4, 6, BLK)

        # ── Feet ──
        fill(img, ox + 7, 20 - bob, 5, 2, BRN_M)
        outline(img, ox + 7, 20 - bob, 5, 3, BLK)
        fill(img, ox + 12, 20 - bob, 5, 2, BRN_M)
        outline(img, ox + 12, 20 - bob, 5, 3, BLK)

    img.save('assets/goblin.png')
    print('  goblin.png (48x24 — 2 frames of 24x24)')


# ── NIGHT GOBLIN (24x24, 2 idle frames = 48x24) ─────────────

def make_night_goblin():
    W, H = 24, 24
    img = Image.new('RGBA', (W * 2, H), T)

    BLK = (10, 10, 15, 255)
    GRN_D = (20, 60, 30, 255)
    GRN_M = (35, 95, 45, 255)
    GRN_L = (55, 130, 55, 255)
    GLOW = (255, 80, 255, 255)
    GLOW2 = (200, 50, 200, 255)
    PRP = (90, 30, 90, 255)
    PRP_D = (60, 20, 60, 255)
    YLW = (200, 190, 60, 255)
    BRN_D = (50, 30, 18, 255)
    BRN_M = (80, 55, 30, 255)
    MET = (140, 140, 160, 255)
    MET_L = (180, 180, 200, 255)

    for frame in range(2):
        ox = frame * W
        bob = 1 if frame == 1 else 0

        # ── Head ──
        fill(img, ox + 8, 1 - bob, 8, 7, GRN_M)
        fill(img, ox + 9, 2 - bob, 6, 5, GRN_L)
        outline(img, ox + 7, 0 - bob, 10, 9, BLK)

        # Pointy ears
        pixels(img, [(ox + 5, 3 - bob), (ox + 6, 2 - bob), (ox + 6, 3 - bob), (ox + 6, 4 - bob)], GRN_M)
        pixels(img, [(ox + 18, 3 - bob), (ox + 17, 2 - bob), (ox + 17, 3 - bob), (ox + 17, 4 - bob)], GRN_M)
        pixels(img, [(ox + 4, 3 - bob), (ox + 5, 2 - bob), (ox + 5, 4 - bob), (ox + 6, 1 - bob), (ox + 6, 5 - bob)], BLK)
        pixels(img, [(ox + 19, 3 - bob), (ox + 18, 2 - bob), (ox + 18, 4 - bob), (ox + 17, 1 - bob), (ox + 17, 5 - bob)], BLK)

        # Glowing eyes
        px(img, ox + 10, 3 - bob, GLOW)
        px(img, ox + 11, 3 - bob, GLOW2)
        px(img, ox + 13, 3 - bob, GLOW2)
        px(img, ox + 14, 3 - bob, GLOW)
        px(img, ox + 9, 2 - bob, PRP)
        px(img, ox + 14, 2 - bob, PRP)

        # Fangs
        px(img, ox + 10, 6 - bob, YLW)
        px(img, ox + 13, 6 - bob, YLW)
        hline(img, ox + 10, 5 - bob, 4, BLK)

        # ── Body + purple vest ──
        fill(img, ox + 8, 8 - bob, 8, 7, GRN_D)
        fill(img, ox + 9, 9 - bob, 6, 5, PRP)
        vline(img, ox + 9, 9 - bob, 5, PRP_D)
        outline(img, ox + 7, 8 - bob, 10, 8, BLK)

        # ── Arms ──
        fill(img, ox + 5, 9 - bob, 3, 5, GRN_M)
        outline(img, ox + 4, 9 - bob, 4, 6, BLK)
        fill(img, ox + 16, 9 - bob, 3, 5, GRN_M)
        outline(img, ox + 16, 9 - bob, 4, 6, BLK)

        # ── Dagger ──
        vline(img, ox + 19, 7 - bob, 5, MET)
        px(img, ox + 19, 6 - bob, MET_L)
        px(img, ox + 19, 12 - bob, BRN_M)
        px(img, ox + 18, 7 - bob, BLK)
        px(img, ox + 20, 7 - bob, BLK)

        # ── Legs ──
        fill(img, ox + 9, 15 - bob, 3, 5, GRN_D)
        outline(img, ox + 8, 15 - bob, 4, 6, BLK)
        fill(img, ox + 13, 15 - bob, 3, 5, GRN_D)
        outline(img, ox + 12, 15 - bob, 4, 6, BLK)

        # ── Feet ──
        fill(img, ox + 7, 20 - bob, 5, 2, BRN_M)
        outline(img, ox + 7, 20 - bob, 5, 3, BLK)
        fill(img, ox + 12, 20 - bob, 5, 2, BRN_M)
        outline(img, ox + 12, 20 - bob, 5, 3, BLK)

    img.save('assets/night_goblin.png')
    print('  night_goblin.png (48x24 — 2 frames of 24x24)')


# ── TROLL BOSS (64x80, 2 idle frames = 128x80) ──────────────

def make_troll():
    W, H = 64, 80
    img = Image.new('RGBA', (W * 2, H), T)

    BLK = (10, 10, 15, 255)
    # Body — deep red
    RED_D = (100, 20, 20, 255)
    RED_M = (160, 40, 35, 255)
    RED_L = (200, 65, 55, 255)
    # Skin / face — reddish brown
    SKN_D = (120, 60, 50, 255)
    SKN_M = (155, 85, 65, 255)
    SKN_L = (185, 110, 85, 255)
    # Horns
    HRN_D = (140, 120, 80, 255)
    HRN_M = (190, 170, 120, 255)
    HRN_L = (220, 200, 155, 255)
    # Eyes
    EYE_Y = (255, 220, 40, 255)
    EYE_R = (220, 30, 20, 255)
    # Tusks / teeth
    TUSK = (230, 220, 190, 255)
    # Belt
    BRN_D = (55, 35, 20, 255)
    BRN_M = (90, 60, 35, 255)
    # Club
    CLB_D = (60, 40, 25, 255)
    CLB_M = (100, 70, 40, 255)
    CLB_L = (135, 100, 60, 255)
    # Metal studs
    STD = (170, 170, 180, 255)
    # Loincloth
    LCL_D = (60, 50, 40, 255)
    LCL_M = (90, 75, 60, 255)

    for frame in range(2):
        ox = frame * W
        bob = 1 if frame == 1 else 0
        # Troll breathes heavier — slight arm shift too
        arm_shift = 1 if frame == 1 else 0

        # ── Horns ──
        # Left horn (curves outward)
        fill(img, ox + 12, 2 - bob, 5, 8, HRN_M)
        vline(img, ox + 13, 3 - bob, 6, HRN_L)
        fill(img, ox + 10, 0 - bob, 4, 4, HRN_M)
        pixels(img, [(ox + 10, 0 - bob), (ox + 11, 0 - bob)], HRN_L)
        outline(img, ox + 9, 0 - bob, 9, 10, BLK)

        # Right horn
        fill(img, ox + 47, 2 - bob, 5, 8, HRN_M)
        vline(img, ox + 50, 3 - bob, 6, HRN_L)
        fill(img, ox + 50, 0 - bob, 4, 4, HRN_M)
        pixels(img, [(ox + 52, 0 - bob), (ox + 53, 0 - bob)], HRN_L)
        outline(img, ox + 46, 0 - bob, 9, 10, BLK)

        # ── Head (massive) ──
        fill(img, ox + 16, 6 - bob, 32, 18, SKN_M)
        # Face shading
        for yy in range(6 - bob, 24 - bob):
            fill(img, ox + 16, yy, 6, 1, SKN_D)
            fill(img, ox + 42, yy, 6, 1, SKN_L)
        # Brow ridge (heavy)
        fill(img, ox + 16, 8 - bob, 32, 3, SKN_D)
        fill(img, ox + 18, 8 - bob, 28, 2, (90, 45, 35, 255))
        outline(img, ox + 15, 5 - bob, 34, 20, BLK)

        # ── Eyes (glowing yellow with red pupils) ──
        fill(img, ox + 21, 12 - bob, 7, 4, EYE_Y)
        fill(img, ox + 36, 12 - bob, 7, 4, EYE_Y)
        # Pupils
        fill(img, ox + 23, 13 - bob, 3, 2, EYE_R)
        fill(img, ox + 38, 13 - bob, 3, 2, EYE_R)
        # Eye outlines
        outline(img, ox + 20, 11 - bob, 9, 6, BLK)
        outline(img, ox + 35, 11 - bob, 9, 6, BLK)

        # ── Nose ──
        fill(img, ox + 29, 16 - bob, 6, 4, SKN_D)
        pixels(img, [(ox + 30, 19 - bob), (ox + 33, 19 - bob)], BLK)  # nostrils

        # ── Mouth + tusks ──
        fill(img, ox + 22, 21 - bob, 20, 3, BLK)  # mouth opening
        fill(img, ox + 24, 21 - bob, 16, 2, (80, 20, 15, 255))  # inner mouth
        # Tusks
        fill(img, ox + 23, 19 - bob, 3, 5, TUSK)
        fill(img, ox + 38, 19 - bob, 3, 5, TUSK)
        px(img, ox + 24, 19 - bob, HRN_L)
        px(img, ox + 39, 19 - bob, HRN_L)
        # Small teeth
        pixels(img, [(ox + 28, 21 - bob), (ox + 31, 21 - bob), (ox + 34, 21 - bob)], TUSK)

        # ── Neck ──
        fill(img, ox + 22, 25 - bob, 20, 4, SKN_D)
        vline(img, ox + 22, 25 - bob, 4, BLK)
        vline(img, ox + 41, 25 - bob, 4, BLK)

        # ── Massive body ──
        fill(img, ox + 12, 29 - bob, 40, 22, RED_M)
        # Body shading
        for yy in range(29 - bob, 51 - bob):
            fill(img, ox + 12, yy, 6, 1, RED_D)
            fill(img, ox + 46, yy, 6, 1, RED_L)
        # Chest muscle definition
        fill(img, ox + 22, 31 - bob, 8, 6, RED_L)
        fill(img, ox + 34, 31 - bob, 8, 6, RED_L)
        vline(img, ox + 32, 30 - bob, 10, RED_D)  # center line
        # Belly
        fill(img, ox + 24, 40 - bob, 16, 6, RED_D)
        hline(img, ox + 26, 42 - bob, 12, (130, 35, 30, 255))  # belly line
        outline(img, ox + 11, 28 - bob, 42, 24, BLK)

        # ── Belt with skull buckle ──
        fill(img, ox + 12, 51 - bob, 40, 3, BRN_M)
        hline(img, ox + 12, 51 - bob, 40, BRN_D)
        # Skull buckle
        fill(img, ox + 28, 51 - bob, 8, 3, TUSK)
        pixels(img, [(ox + 30, 52 - bob), (ox + 34, 52 - bob)], BLK)  # eyes
        px(img, ox + 32, 53 - bob, BLK)  # nose

        # ── Arms (HUGE) ──
        # Left arm
        fill(img, ox + 3, 30 - bob + arm_shift, 10, 18, SKN_M)
        vline(img, ox + 3, 30 - bob + arm_shift, 18, SKN_D)
        vline(img, ox + 12, 30 - bob + arm_shift, 18, SKN_L)
        # Shoulder pad
        fill(img, ox + 3, 29 - bob, 10, 4, RED_D)
        hline(img, ox + 4, 29 - bob, 8, RED_L)
        outline(img, ox + 2, 28 - bob, 12, 6, BLK)
        # Arm outline
        outline(img, ox + 2, 29 - bob + arm_shift, 12, 20, BLK)
        # Fist
        fill(img, ox + 3, 48 - bob + arm_shift, 10, 4, SKN_D)
        outline(img, ox + 2, 47 - bob + arm_shift, 12, 6, BLK)

        # Right arm
        fill(img, ox + 51, 30 - bob + arm_shift, 10, 18, SKN_M)
        vline(img, ox + 51, 30 - bob + arm_shift, 18, SKN_D)
        vline(img, ox + 60, 30 - bob + arm_shift, 18, SKN_L)
        fill(img, ox + 51, 29 - bob, 10, 4, RED_D)
        hline(img, ox + 52, 29 - bob, 8, RED_L)
        outline(img, ox + 50, 28 - bob, 12, 6, BLK)
        outline(img, ox + 50, 29 - bob + arm_shift, 12, 20, BLK)
        fill(img, ox + 51, 48 - bob + arm_shift, 10, 4, SKN_D)
        outline(img, ox + 50, 47 - bob + arm_shift, 12, 6, BLK)

        # ── Club in right hand ──
        # Handle
        fill(img, ox + 56, 22 - bob, 3, 26, CLB_M)
        vline(img, ox + 57, 23 - bob, 24, CLB_L)
        outline(img, ox + 55, 21 - bob, 5, 28, BLK)
        # Club head (big gnarly)
        fill(img, ox + 53, 10 - bob, 9, 13, CLB_M)
        fill(img, ox + 54, 11 - bob, 7, 11, CLB_D)
        fill(img, ox + 55, 12 - bob, 5, 4, CLB_L)  # wood highlight
        # Studs / spikes
        pixels(img, [
            (ox + 54, 12 - bob), (ox + 60, 12 - bob),
            (ox + 54, 17 - bob), (ox + 60, 17 - bob),
            (ox + 57, 10 - bob), (ox + 57, 22 - bob)
        ], STD)
        outline(img, ox + 52, 9 - bob, 11, 15, BLK)

        # ── Loincloth ──
        fill(img, ox + 20, 54 - bob, 24, 5, LCL_M)
        fill(img, ox + 22, 55 - bob, 20, 3, LCL_D)
        # Tattered edges
        pixels(img, [
            (ox + 21, 58 - bob), (ox + 25, 59 - bob),
            (ox + 30, 58 - bob), (ox + 35, 59 - bob),
            (ox + 40, 58 - bob)
        ], LCL_D)
        outline(img, ox + 19, 53 - bob, 26, 7, BLK)

        # ── Legs ──
        fill(img, ox + 16, 55 - bob, 10, 15, SKN_D)
        fill(img, ox + 17, 56 - bob, 8, 13, SKN_M)
        outline(img, ox + 15, 55 - bob, 11, 16, BLK)

        fill(img, ox + 38, 55 - bob, 10, 15, SKN_D)
        fill(img, ox + 39, 56 - bob, 8, 13, SKN_M)
        outline(img, ox + 37, 55 - bob, 11, 16, BLK)

        # ── Feet (big!) ──
        fill(img, ox + 12, 70 - bob, 16, 6, SKN_D)
        fill(img, ox + 13, 71 - bob, 14, 3, SKN_M)
        hline(img, ox + 12, 75 - bob, 16, BRN_D)
        outline(img, ox + 11, 69 - bob, 18, 8, BLK)
        # Toenails
        pixels(img, [(ox + 13, 70 - bob), (ox + 16, 70 - bob), (ox + 19, 70 - bob)], HRN_M)

        fill(img, ox + 36, 70 - bob, 16, 6, SKN_D)
        fill(img, ox + 37, 71 - bob, 14, 3, SKN_M)
        hline(img, ox + 36, 75 - bob, 16, BRN_D)
        outline(img, ox + 35, 69 - bob, 18, 8, BLK)
        pixels(img, [(ox + 37, 70 - bob), (ox + 40, 70 - bob), (ox + 43, 70 - bob)], HRN_M)

    img.save('assets/troll.png')
    print('  troll.png (128x80 — 2 frames of 64x80)')


# ── RUN ALL ──────────────────────────────────────────────────

if __name__ == '__main__':
    print('Generating top-notch pixel art sprite sheets...')
    print()
    make_player()
    make_blacksmith()
    make_goblin()
    make_night_goblin()
    make_troll()
    print()
    print('Done! All sprites saved to assets/')
    print('Each sprite is a 2-frame idle animation (horizontal strip)')
