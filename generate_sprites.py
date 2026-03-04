"""Generate pixel art sprites for Mob Slayer."""
from PIL import Image

def set_pixels(img, pixels, color):
    """Set a list of (x, y) pixels to a color."""
    for x, y in pixels:
        if 0 <= x < img.width and 0 <= y < img.height:
            img.putpixel((x, y), color)

def fill_rect(img, x1, y1, w, h, color):
    """Fill a rectangle."""
    for x in range(x1, x1 + w):
        for y in range(y1, y1 + h):
            if 0 <= x < img.width and 0 <= y < img.height:
                img.putpixel((x, y), color)

def outline_rect(img, x1, y1, w, h, color):
    """Draw rectangle outline."""
    for x in range(x1, x1 + w):
        if 0 <= y1 < img.height:
            img.putpixel((x, y1), color)
        if 0 <= y1 + h - 1 < img.height:
            img.putpixel((x, y1 + h - 1), color)
    for y in range(y1, y1 + h):
        if 0 <= x1 < img.width:
            img.putpixel((x1, y), color)
        if 0 <= x1 + w - 1 < img.width:
            img.putpixel((x1 + w - 1, y), color)

# ============================================================
# PLAYER — Blue Knight (32x48)
# ============================================================
def make_player():
    img = Image.new('RGBA', (32, 48), (0, 0, 0, 0))

    BLACK = (20, 20, 30, 255)
    BLUE = (50, 100, 220, 255)
    BLUE_DARK = (30, 60, 160, 255)
    BLUE_LIGHT = (90, 140, 255, 255)
    SKIN = (240, 200, 160, 255)
    SKIN_DARK = (200, 160, 120, 255)
    GRAY = (180, 180, 195, 255)
    GRAY_DARK = (120, 120, 140, 255)
    BROWN = (140, 90, 50, 255)
    BROWN_DARK = (100, 65, 35, 255)
    WHITE = (230, 235, 240, 255)

    # Helmet (top)
    fill_rect(img, 10, 2, 12, 3, GRAY)       # helmet top
    fill_rect(img, 9, 5, 14, 4, GRAY)         # helmet body
    fill_rect(img, 11, 3, 10, 2, GRAY_DARK)   # helmet shade
    fill_rect(img, 14, 1, 4, 2, GRAY)         # helmet crest

    # Visor / face opening
    fill_rect(img, 11, 7, 10, 3, SKIN)        # face
    set_pixels(img, [(13, 7), (18, 7)], BLACK)  # eyes
    fill_rect(img, 14, 9, 4, 1, SKIN_DARK)    # mouth line

    # Neck
    fill_rect(img, 13, 10, 6, 2, SKIN)

    # Armor body
    fill_rect(img, 8, 12, 16, 12, BLUE)       # torso
    fill_rect(img, 10, 12, 12, 2, BLUE_LIGHT) # shoulder highlight
    fill_rect(img, 9, 14, 14, 2, BLUE_DARK)   # chest shadow
    fill_rect(img, 13, 16, 6, 4, BLUE_LIGHT)  # chest emblem area

    # Belt
    fill_rect(img, 9, 24, 14, 2, BROWN)
    fill_rect(img, 14, 24, 4, 2, BROWN_DARK)  # buckle

    # Arms
    fill_rect(img, 5, 13, 4, 10, BLUE)        # left arm
    fill_rect(img, 23, 13, 4, 10, BLUE)       # right arm
    fill_rect(img, 5, 22, 4, 3, SKIN)         # left hand
    fill_rect(img, 23, 22, 4, 3, SKIN)        # right hand

    # Sword in right hand
    fill_rect(img, 27, 10, 2, 4, BROWN)       # hilt
    fill_rect(img, 25, 13, 6, 2, BROWN_DARK)  # crossguard
    fill_rect(img, 27, 3, 2, 8, GRAY)         # blade
    set_pixels(img, [(27, 2), (28, 2)], WHITE) # blade tip

    # Legs
    fill_rect(img, 10, 26, 5, 12, BLUE_DARK)  # left leg
    fill_rect(img, 17, 26, 5, 12, BLUE_DARK)  # right leg

    # Boots
    fill_rect(img, 9, 38, 7, 5, BROWN)        # left boot
    fill_rect(img, 16, 38, 7, 5, BROWN)       # right boot
    fill_rect(img, 8, 42, 8, 3, BROWN_DARK)   # left sole
    fill_rect(img, 16, 42, 8, 3, BROWN_DARK)  # right sole

    # Outline key features
    outline_rect(img, 9, 1, 14, 10, BLACK)    # helmet outline
    outline_rect(img, 7, 12, 18, 14, BLACK)   # body outline

    img.save('assets/player.png')
    print('  player.png (32x48)')

# ============================================================
# BLACKSMITH — Beefy Orange NPC (32x48)
# ============================================================
def make_blacksmith():
    img = Image.new('RGBA', (32, 48), (0, 0, 0, 0))

    BLACK = (20, 20, 30, 255)
    SKIN = (210, 170, 120, 255)
    SKIN_DARK = (180, 140, 90, 255)
    ORANGE = (230, 140, 30, 255)
    ORANGE_DARK = (190, 100, 20, 255)
    BROWN = (120, 80, 40, 255)
    BROWN_DARK = (80, 55, 30, 255)
    APRON_GRAY = (100, 100, 110, 255)
    APRON_DARK = (70, 70, 80, 255)
    HAIR = (80, 50, 20, 255)

    # Head / hair
    fill_rect(img, 10, 2, 12, 4, HAIR)        # hair top
    fill_rect(img, 9, 4, 14, 8, SKIN)         # face
    fill_rect(img, 9, 2, 2, 6, HAIR)          # left sideburn
    fill_rect(img, 21, 2, 2, 6, HAIR)         # right sideburn

    # Face details
    set_pixels(img, [(12, 6), (19, 6)], BLACK) # eyes
    fill_rect(img, 14, 9, 4, 1, SKIN_DARK)    # mouth
    fill_rect(img, 11, 8, 10, 1, SKIN_DARK)   # mustache area
    set_pixels(img, [(12, 8), (13, 8), (18, 8), (19, 8)], BROWN)  # mustache

    # Neck (thick)
    fill_rect(img, 12, 12, 8, 2, SKIN)

    # Big body (muscular)
    fill_rect(img, 6, 14, 20, 14, ORANGE)     # torso
    fill_rect(img, 8, 14, 16, 2, ORANGE_DARK) # collar shadow

    # Leather apron
    fill_rect(img, 10, 18, 12, 10, APRON_GRAY)
    fill_rect(img, 11, 19, 10, 8, APRON_DARK)

    # Belt
    fill_rect(img, 7, 28, 18, 2, BROWN)
    fill_rect(img, 14, 28, 4, 2, BROWN_DARK)

    # Arms (beefy)
    fill_rect(img, 2, 14, 5, 12, SKIN)        # left arm
    fill_rect(img, 25, 14, 5, 12, SKIN)       # right arm
    fill_rect(img, 2, 14, 5, 3, ORANGE)       # left sleeve
    fill_rect(img, 25, 14, 5, 3, ORANGE)      # right sleeve
    fill_rect(img, 2, 25, 5, 2, SKIN_DARK)    # left hand
    fill_rect(img, 25, 25, 5, 2, SKIN_DARK)   # right hand

    # Hammer in right hand
    fill_rect(img, 28, 18, 2, 10, BROWN)      # handle
    fill_rect(img, 26, 16, 6, 4, (150, 150, 160, 255))  # hammer head

    # Legs
    fill_rect(img, 9, 30, 6, 10, BROWN)       # left leg
    fill_rect(img, 17, 30, 6, 10, BROWN)      # right leg

    # Boots
    fill_rect(img, 8, 40, 8, 5, BROWN_DARK)
    fill_rect(img, 16, 40, 8, 5, BROWN_DARK)
    fill_rect(img, 7, 44, 9, 2, BLACK)        # left sole
    fill_rect(img, 16, 44, 9, 2, BLACK)       # right sole

    img.save('assets/blacksmith.png')
    print('  blacksmith.png (32x48)')

# ============================================================
# GOBLIN ENEMY (24x24)
# ============================================================
def make_goblin():
    img = Image.new('RGBA', (24, 24), (0, 0, 0, 0))

    BLACK = (20, 20, 30, 255)
    GREEN = (60, 160, 60, 255)
    GREEN_DARK = (40, 110, 40, 255)
    GREEN_LIGHT = (90, 200, 90, 255)
    RED = (200, 50, 50, 255)
    YELLOW = (240, 220, 80, 255)
    BROWN = (120, 80, 40, 255)

    # Head
    fill_rect(img, 7, 1, 10, 8, GREEN)
    fill_rect(img, 8, 2, 8, 6, GREEN_LIGHT)

    # Pointy ears
    set_pixels(img, [(5, 3), (6, 2), (6, 3), (6, 4)], GREEN)          # left ear
    set_pixels(img, [(18, 3), (17, 2), (17, 3), (17, 4)], GREEN)      # right ear

    # Eyes (angry!)
    set_pixels(img, [(9, 4), (10, 4)], RED)       # left eye
    set_pixels(img, [(13, 4), (14, 4)], RED)      # right eye
    set_pixels(img, [(9, 3), (14, 3)], BLACK)     # angry eyebrows

    # Mouth (toothy grin)
    set_pixels(img, [(10, 6), (11, 6), (12, 6), (13, 6)], BLACK)
    set_pixels(img, [(10, 6), (13, 6)], YELLOW)   # fangs

    # Body
    fill_rect(img, 8, 9, 8, 7, GREEN_DARK)
    fill_rect(img, 9, 10, 6, 4, BROWN)            # leather vest

    # Arms
    fill_rect(img, 5, 10, 3, 5, GREEN)
    fill_rect(img, 16, 10, 3, 5, GREEN)

    # Little dagger in right hand
    fill_rect(img, 19, 8, 1, 5, (180, 180, 190, 255))
    set_pixels(img, [(19, 12)], BROWN)             # dagger hilt

    # Legs
    fill_rect(img, 9, 16, 3, 5, GREEN_DARK)
    fill_rect(img, 13, 16, 3, 5, GREEN_DARK)

    # Feet
    fill_rect(img, 8, 20, 4, 2, BROWN)
    fill_rect(img, 12, 20, 4, 2, BROWN)

    img.save('assets/goblin.png')
    print('  goblin.png (24x24)')

# ============================================================
# NIGHT GOBLIN — darker, glowing eyes (24x24)
# ============================================================
def make_night_goblin():
    img = Image.new('RGBA', (24, 24), (0, 0, 0, 0))

    BLACK = (20, 20, 30, 255)
    GREEN = (30, 90, 50, 255)
    GREEN_DARK = (20, 60, 35, 255)
    GREEN_LIGHT = (50, 120, 60, 255)
    GLOW = (255, 100, 255, 255)
    PURPLE = (120, 40, 120, 255)
    BROWN = (80, 55, 30, 255)

    # Head
    fill_rect(img, 7, 1, 10, 8, GREEN)
    fill_rect(img, 8, 2, 8, 6, GREEN_LIGHT)

    # Pointy ears
    set_pixels(img, [(5, 3), (6, 2), (6, 3), (6, 4)], GREEN)
    set_pixels(img, [(18, 3), (17, 2), (17, 3), (17, 4)], GREEN)

    # Glowing eyes
    set_pixels(img, [(9, 4), (10, 4)], GLOW)
    set_pixels(img, [(13, 4), (14, 4)], GLOW)
    set_pixels(img, [(9, 3), (14, 3)], PURPLE)

    # Mouth
    set_pixels(img, [(10, 6), (11, 6), (12, 6), (13, 6)], BLACK)
    set_pixels(img, [(10, 6), (13, 6)], (200, 200, 80, 255))

    # Body
    fill_rect(img, 8, 9, 8, 7, GREEN_DARK)
    fill_rect(img, 9, 10, 6, 4, PURPLE)

    # Arms
    fill_rect(img, 5, 10, 3, 5, GREEN)
    fill_rect(img, 16, 10, 3, 5, GREEN)

    # Dagger
    fill_rect(img, 19, 8, 1, 5, (160, 160, 180, 255))
    set_pixels(img, [(19, 12)], BROWN)

    # Legs
    fill_rect(img, 9, 16, 3, 5, GREEN_DARK)
    fill_rect(img, 13, 16, 3, 5, GREEN_DARK)

    # Feet
    fill_rect(img, 8, 20, 4, 2, BROWN)
    fill_rect(img, 12, 20, 4, 2, BROWN)

    img.save('assets/night_goblin.png')
    print('  night_goblin.png (24x24)')

# ============================================================
# TROLL BOSS (64x80)
# ============================================================
def make_troll():
    img = Image.new('RGBA', (64, 80), (0, 0, 0, 0))

    BLACK = (20, 20, 30, 255)
    RED = (180, 40, 40, 255)
    RED_DARK = (130, 25, 25, 255)
    RED_LIGHT = (220, 70, 70, 255)
    SKIN = (160, 80, 70, 255)
    SKIN_DARK = (120, 55, 45, 255)
    YELLOW = (240, 200, 50, 255)
    BROWN = (100, 65, 35, 255)
    BROWN_DARK = (70, 45, 25, 255)
    HORN = (200, 180, 140, 255)
    HORN_DARK = (160, 140, 100, 255)

    # Horns
    fill_rect(img, 10, 0, 5, 8, HORN)
    fill_rect(img, 49, 0, 5, 8, HORN)
    fill_rect(img, 11, 1, 3, 5, HORN_DARK)
    fill_rect(img, 50, 1, 3, 5, HORN_DARK)

    # Big head
    fill_rect(img, 14, 5, 36, 20, SKIN)
    fill_rect(img, 16, 7, 32, 16, SKIN_DARK)

    # Eyes (angry, glowing)
    fill_rect(img, 20, 11, 8, 5, YELLOW)
    fill_rect(img, 36, 11, 8, 5, YELLOW)
    fill_rect(img, 22, 12, 4, 3, RED)         # left pupil
    fill_rect(img, 38, 12, 4, 3, RED)         # right pupil

    # Angry brow ridge
    fill_rect(img, 18, 9, 12, 2, SKIN_DARK)
    fill_rect(img, 34, 9, 12, 2, SKIN_DARK)

    # Nose
    fill_rect(img, 29, 15, 6, 4, SKIN)

    # Mouth with tusks
    fill_rect(img, 22, 20, 20, 4, BLACK)      # mouth
    fill_rect(img, 24, 19, 4, 4, HORN)        # left tusk
    fill_rect(img, 36, 19, 4, 4, HORN)        # right tusk

    # Neck
    fill_rect(img, 22, 25, 20, 4, SKIN)

    # Massive body
    fill_rect(img, 10, 29, 44, 24, RED)
    fill_rect(img, 12, 30, 40, 10, RED_DARK)  # chest shadow
    fill_rect(img, 14, 32, 36, 6, RED_LIGHT)  # chest highlight

    # Belt with skull buckle
    fill_rect(img, 10, 52, 44, 4, BROWN)
    fill_rect(img, 28, 52, 8, 4, HORN)        # skull buckle
    set_pixels(img, [(30, 53), (34, 53)], BLACK)  # skull eyes

    # Arms (huge)
    fill_rect(img, 2, 30, 9, 18, SKIN)        # left arm
    fill_rect(img, 53, 30, 9, 18, SKIN)       # right arm
    fill_rect(img, 2, 30, 9, 5, RED)          # left shoulder pad
    fill_rect(img, 53, 30, 9, 5, RED)         # right shoulder pad
    fill_rect(img, 3, 46, 7, 4, SKIN_DARK)    # left fist
    fill_rect(img, 54, 46, 7, 4, SKIN_DARK)   # right fist

    # Club in right hand
    fill_rect(img, 57, 20, 4, 28, BROWN)      # handle
    fill_rect(img, 55, 12, 8, 10, BROWN_DARK) # club head
    set_pixels(img, [(56, 14), (61, 14), (56, 18), (61, 18)],
               (160, 160, 170, 255))           # spikes/studs

    # Legs
    fill_rect(img, 14, 56, 12, 16, RED_DARK)  # left leg
    fill_rect(img, 38, 56, 12, 16, RED_DARK)  # right leg

    # Feet / boots
    fill_rect(img, 12, 72, 16, 6, BROWN)
    fill_rect(img, 36, 72, 16, 6, BROWN)
    fill_rect(img, 10, 76, 18, 3, BROWN_DARK) # left sole
    fill_rect(img, 36, 76, 18, 3, BROWN_DARK) # right sole

    img.save('assets/troll.png')
    print('  troll.png (64x80)')

# ============================================================
# RUN ALL
# ============================================================
if __name__ == '__main__':
    print('Generating sprites...')
    make_player()
    make_blacksmith()
    make_goblin()
    make_night_goblin()
    make_troll()
    print('Done! All sprites saved to assets/')
