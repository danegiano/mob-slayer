#!/usr/bin/env python3
"""
Generate all game sprites as base64 PNG strings for Mob Slayer.
Uses PIL/Pillow only. Outputs crisp pixel art with dark outlines and shading.

Sprite specs:
  - Player: 48x48 frames, 9 cols x 4 rows (432x192)
  - Enemies: 48x48 frames, 8 cols x 1 row (384x48)
  - Bosses: 96x96 frames, 2 cols x 1 row (192x96)
  - NPCs: 48x64 frames, 2 cols (96x64); lost_child 32x40 frames (64x40)
"""

import base64
import io
import os
from PIL import Image, ImageDraw

# ─── Color Palettes ───────────────────────────────────────────────

OUTLINE = (30, 30, 30)

PLAYER_NORMAL = {
    'skin':     ((255, 220, 177), (230, 190, 150)),
    'hair':     ((139, 90, 43),   (110, 70, 30)),
    'tunic':    ((76, 153, 76),   (50, 120, 50),  (35, 90, 35)),
    'boots':    ((101, 67, 33),   (80, 50, 25)),
    'sword':    ((192, 192, 192), (160, 160, 160)),
    'outline':  OUTLINE,
}

PLAYER_SLAYER = {
    'skin':     ((255, 220, 177), (230, 190, 150)),
    'hair':     ((139, 90, 43),   (110, 70, 30)),
    'tunic':    ((120, 60, 160),  (90, 40, 130),  (65, 25, 100)),
    'boots':    ((101, 67, 33),   (80, 50, 25)),
    'sword':    ((180, 100, 255), (140, 60, 220)),
    'outline':  OUTLINE,
}

PLAYER_WOOD = {
    'skin':     ((255, 220, 177), (230, 190, 150)),
    'hair':     ((139, 90, 43),   (110, 70, 30)),
    'tunic':    ((76, 153, 76),   (50, 120, 50),  (35, 90, 35)),
    'boots':    ((101, 67, 33),   (80, 50, 25)),
    'sword':    ((139, 90, 43),   (101, 67, 33)),
    'outline':  OUTLINE,
}

PLAYER_IRON = {
    'skin':     ((255, 220, 177), (230, 190, 150)),
    'hair':     ((139, 90, 43),   (110, 70, 30)),
    'tunic':    ((70, 100, 160),  (50, 75, 130),  (35, 55, 100)),
    'boots':    ((101, 67, 33),   (80, 50, 25)),
    'sword':    ((200, 200, 210), (170, 170, 180)),
    'outline':  OUTLINE,
}

PLAYER_FIRE = {
    'skin':     ((255, 220, 177), (230, 190, 150)),
    'hair':     ((139, 90, 43),   (110, 70, 30)),
    'tunic':    ((200, 80, 40),   (170, 55, 25),  (130, 40, 15)),
    'boots':    ((101, 67, 33),   (80, 50, 25)),
    'sword':    ((255, 140, 0),   (255, 100, 0)),
    'outline':  OUTLINE,
}

PLAYER_ICE = {
    'skin':     ((255, 220, 177), (230, 190, 150)),
    'hair':     ((139, 90, 43),   (110, 70, 30)),
    'tunic':    ((100, 170, 220), (70, 140, 200), (45, 110, 170)),
    'boots':    ((101, 67, 33),   (80, 50, 25)),
    'sword':    ((100, 200, 255), (60, 160, 255)),
    'outline':  OUTLINE,
}

PLAYER_DRAGON = {
    'skin':     ((255, 220, 177), (230, 190, 150)),
    'hair':     ((139, 90, 43),   (110, 70, 30)),
    'tunic':    ((180, 40, 40),   (140, 25, 25),  (100, 15, 15)),
    'boots':    ((101, 67, 33),   (80, 50, 25)),
    'sword':    ((255, 50, 50),   (220, 30, 30)),
    'outline':  OUTLINE,
}

GOBLIN_PAL = {
    'skin':      ((76, 175, 80),  (56, 142, 60)),
    'loincloth': ((139, 90, 43),),
    'dagger':    ((180, 180, 180),),
    'eye':       ((255, 255, 0),),
    'outline':   OUTLINE,
}

NIGHT_GOBLIN_PAL = {
    'skin':    ((80, 40, 100),  (50, 25, 70)),
    'eyes':    ((255, 255, 0),),
    'cloak':   ((40, 20, 55),   (60, 35, 75)),
    'outline': OUTLINE,
}

ICE_WOLF_PAL = {
    'fur':     ((200, 220, 255), (150, 180, 220)),
    'fangs':   ((255, 255, 255),),
    'nose':    ((20, 20, 20),),
    'eye':     ((200, 50, 50),),
    'outline': OUTLINE,
}

SHADOW_BEAST_PAL = {
    'body':    ((60, 30, 70),  (40, 20, 50)),
    'eyes':    ((255, 0, 0),),
    'claws':   ((80, 80, 80),),
    'outline': OUTLINE,
}

STONE_GOLEM_PAL = {
    'rock':    ((130, 130, 130), (90, 90, 90)),
    'runes':   ((255, 165, 0),),
    'moss':    ((80, 120, 60),),
    'eye':     ((255, 165, 0),),
    'outline': OUTLINE,
}

TROLL_PAL = {
    'skin':    ((76, 140, 76),  (50, 100, 50)),
    'club':    ((120, 80, 40),  (90, 60, 30)),
    'tusks':   ((240, 240, 220),),
    'eye':     ((255, 200, 0),),
    'scar':    ((120, 60, 60),),
    'outline': OUTLINE,
}

FROST_GIANT_PAL = {
    'skin':    ((140, 180, 220), (100, 150, 200)),
    'armor':   ((180, 210, 240), (150, 185, 215)),
    'ice':     ((200, 230, 255),),
    'eye':     ((100, 200, 255),),
    'outline': OUTLINE,
}

SHADOW_LORD_PAL = {
    'robe':    ((30, 15, 45),   (20, 10, 30)),
    'energy':  ((160, 80, 255), (200, 130, 255)),
    'eyes':    ((255, 0, 0),),
    'outline': OUTLINE,
}

RUNE_GUARDIAN_PAL = {
    'stone':   ((120, 120, 130), (80, 80, 90)),
    'runes':   ((0, 180, 255),),
    'crystal': ((0, 255, 200),),
    'eye':     ((0, 180, 255),),
    'outline': OUTLINE,
}

# ─── Helpers ──────────────────────────────────────────────────────

def px(draw, x, y, color):
    """Draw a single pixel."""
    draw.point((x, y), fill=color)

def rect(draw, x, y, w, h, color):
    """Draw a filled rectangle (no anti-alias)."""
    draw.rectangle([x, y, x + w - 1, y + h - 1], fill=color)

def outline_rect(draw, x, y, w, h, color):
    """Draw rectangle outline only."""
    draw.rectangle([x, y, x + w - 1, y + h - 1], outline=color)

def img_to_base64(img):
    """Convert PIL Image to base64 data URI string."""
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    return f"data:image/png;base64,{b64}"

# ─── Player Drawing ──────────────────────────────────────────────

def draw_player_frame(draw, ox, oy, pal, direction, anim_type, frame_idx):
    """
    Draw one player frame at offset (ox, oy) within a 48x48 cell.
    direction: 0=down, 1=left, 2=right, 3=up
    anim_type: 'idle', 'walk', 'attack'
    frame_idx: index within that animation
    """
    o = pal['outline']
    skin0, skin1 = pal['skin']
    hair0, hair1 = pal['hair']
    tunic0, tunic1, tunic2 = pal['tunic']
    boots0, boots1 = pal['boots']
    sword0, sword1 = pal['sword']

    # Center character in 48x48 cell
    cx = ox + 24  # center x
    cy = oy + 24  # center y

    # Body bob for walk
    bob = 0
    if anim_type == 'walk':
        bob = -1 if frame_idx % 2 == 0 else 1

    # ── Hair / Head ──
    head_y = cy - 18 + bob
    head_x = cx - 7

    # Hair (top of head)
    rect(draw, head_x, head_y, 14, 5, hair0)
    rect(draw, head_x + 1, head_y, 12, 3, hair1)  # highlight
    # Hair sides
    rect(draw, head_x, head_y + 3, 2, 4, hair0)
    rect(draw, head_x + 12, head_y + 3, 2, 4, hair0)

    # Face
    rect(draw, head_x + 2, head_y + 5, 10, 9, skin0)
    rect(draw, head_x + 3, head_y + 6, 8, 7, skin0)
    # Shading on face
    rect(draw, head_x + 2, head_y + 11, 10, 3, skin1)

    # Eyes (direction-dependent)
    if direction == 0:  # facing down
        px(draw, head_x + 4, head_y + 8, o)
        px(draw, head_x + 5, head_y + 8, o)
        px(draw, head_x + 8, head_y + 8, o)
        px(draw, head_x + 9, head_y + 8, o)
    elif direction == 3:  # facing up - no eyes visible
        rect(draw, head_x + 2, head_y + 5, 10, 4, hair0)
    elif direction == 1:  # facing left
        px(draw, head_x + 3, head_y + 8, o)
        px(draw, head_x + 4, head_y + 8, o)
        px(draw, head_x + 7, head_y + 8, o)
        px(draw, head_x + 8, head_y + 8, o)
    elif direction == 2:  # facing right
        px(draw, head_x + 5, head_y + 8, o)
        px(draw, head_x + 6, head_y + 8, o)
        px(draw, head_x + 9, head_y + 8, o)
        px(draw, head_x + 10, head_y + 8, o)

    # Head outline
    outline_rect(draw, head_x - 1, head_y - 1, 16, 16, o)

    # ── Body / Tunic ──
    body_y = head_y + 14
    body_x = cx - 8

    rect(draw, body_x, body_y, 16, 12, tunic0)
    # Shading - darker bottom
    rect(draw, body_x, body_y + 8, 16, 4, tunic1)
    # Darkest edges
    rect(draw, body_x, body_y, 2, 12, tunic2)
    rect(draw, body_x + 14, body_y, 2, 12, tunic2)
    # Belt
    rect(draw, body_x + 1, body_y + 9, 14, 2, boots0)
    px(draw, body_x + 7, body_y + 9, (220, 200, 60))  # belt buckle
    px(draw, body_x + 8, body_y + 9, (220, 200, 60))
    # Outline
    outline_rect(draw, body_x - 1, body_y - 1, 18, 14, o)

    # ── Arms ──
    arm_y = body_y + 1
    l_arm_x = body_x - 4
    r_arm_x = body_x + 16

    # Arm shift for idle
    arm_shift = 0
    if anim_type == 'idle':
        arm_shift = 1 if frame_idx == 1 else 0

    # Attack arm positions
    sword_visible = False
    sword_x, sword_y = 0, 0
    attack_phase = 0

    if anim_type == 'attack':
        attack_phase = frame_idx  # 0=windup, 1=swing, 2=followthrough
        sword_visible = True

    # Left arm (skin + tunic sleeve)
    rect(draw, l_arm_x, arm_y + arm_shift, 4, 8, tunic1)
    rect(draw, l_arm_x, arm_y + 6 + arm_shift, 4, 3, skin0)
    outline_rect(draw, l_arm_x - 1, arm_y - 1 + arm_shift, 6, 12, o)

    # Right arm - varies with attack
    if anim_type == 'attack':
        if attack_phase == 0:  # wind-up: arm pulled back
            ra_x = r_arm_x + 2
            ra_y = arm_y - 2
            rect(draw, ra_x, ra_y, 4, 8, tunic1)
            rect(draw, ra_x, ra_y + 6, 4, 3, skin0)
            outline_rect(draw, ra_x - 1, ra_y - 1, 6, 12, o)
            # Sword behind
            sword_x = ra_x + 1
            sword_y = ra_y - 8
            rect(draw, sword_x, sword_y, 2, 10, sword0)
            rect(draw, sword_x, sword_y, 2, 2, sword1)  # hilt
            outline_rect(draw, sword_x - 1, sword_y - 1, 4, 12, o)
        elif attack_phase == 1:  # swing: arm extended with arc
            if direction == 2 or direction == 0:  # right or down
                ra_x = r_arm_x + 4
                ra_y = arm_y + 2
                rect(draw, r_arm_x, ra_y, 8, 4, tunic1)
                rect(draw, r_arm_x + 6, ra_y, 3, 4, skin0)
                outline_rect(draw, r_arm_x - 1, ra_y - 1, 12, 6, o)
                # Sword extended
                sword_x = r_arm_x + 9
                sword_y = ra_y - 2
                rect(draw, sword_x, sword_y, 2, 8, sword0)
                px(draw, sword_x, sword_y + 7, sword1)
                px(draw, sword_x + 1, sword_y + 7, sword1)
                outline_rect(draw, sword_x - 1, sword_y - 1, 4, 10, o)
                # Sword arc effect
                for i in range(5):
                    px(draw, sword_x + 2 + i, sword_y + i, sword0)
            else:
                ra_x = r_arm_x
                ra_y = arm_y
                rect(draw, ra_x, ra_y, 4, 8, tunic1)
                rect(draw, ra_x, ra_y + 6, 4, 3, skin0)
                outline_rect(draw, ra_x - 1, ra_y - 1, 6, 12, o)
                sword_x = ra_x
                sword_y = ra_y - 10
                rect(draw, sword_x, sword_y, 2, 12, sword0)
                outline_rect(draw, sword_x - 1, sword_y - 1, 4, 14, o)
        elif attack_phase == 2:  # follow-through
            ra_x = r_arm_x + 2
            ra_y = arm_y + 4
            rect(draw, ra_x, ra_y, 4, 8, tunic1)
            rect(draw, ra_x, ra_y + 6, 4, 3, skin0)
            outline_rect(draw, ra_x - 1, ra_y - 1, 6, 12, o)
            sword_x = ra_x + 1
            sword_y = ra_y + 9
            rect(draw, sword_x, sword_y, 2, 8, sword0)
            outline_rect(draw, sword_x - 1, sword_y - 1, 4, 10, o)
    else:
        rect(draw, r_arm_x, arm_y + arm_shift, 4, 8, tunic1)
        rect(draw, r_arm_x, arm_y + 6 + arm_shift, 4, 3, skin0)
        outline_rect(draw, r_arm_x - 1, arm_y - 1 + arm_shift, 6, 12, o)

    # ── Legs / Boots ──
    leg_y = body_y + 12
    l_leg_x = cx - 5
    r_leg_x = cx + 1

    # Walk leg animation
    l_off = 0
    r_off = 0
    if anim_type == 'walk':
        if frame_idx == 0:
            l_off = -2; r_off = 2
        elif frame_idx == 1:
            l_off = 0; r_off = 0
        elif frame_idx == 2:
            l_off = 2; r_off = -2
        elif frame_idx == 3:
            l_off = 0; r_off = 0

    # Left leg
    rect(draw, l_leg_x + l_off, leg_y, 4, 6, tunic1)  # upper leg
    rect(draw, l_leg_x + l_off, leg_y + 6, 4, 4, boots0)
    rect(draw, l_leg_x + l_off, leg_y + 8, 4, 2, boots1)  # darker sole
    outline_rect(draw, l_leg_x - 1 + l_off, leg_y - 1, 6, 12, o)

    # Right leg
    rect(draw, r_leg_x + r_off, leg_y, 4, 6, tunic1)
    rect(draw, r_leg_x + r_off, leg_y + 6, 4, 4, boots0)
    rect(draw, r_leg_x + r_off, leg_y + 8, 4, 2, boots1)
    outline_rect(draw, r_leg_x - 1 + r_off, leg_y - 1, 6, 12, o)


def generate_player_sheet(pal):
    """Generate a 432x192 player sprite sheet (9 cols x 4 rows, 48x48 each)."""
    sheet = Image.new('RGBA', (432, 192), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)

    for row in range(4):  # down, left, right, up
        for col in range(9):
            ox = col * 48
            oy = row * 48

            if col < 2:
                anim_type = 'idle'
                frame_idx = col
            elif col < 6:
                anim_type = 'walk'
                frame_idx = col - 2
            else:
                anim_type = 'attack'
                frame_idx = col - 6

            draw_player_frame(draw, ox, oy, pal, row, anim_type, frame_idx)

    return sheet


# ─── Enemy Drawing ────────────────────────────────────────────────

def draw_goblin_frame(draw, ox, oy, anim_type, frame_idx):
    """Draw goblin in 48x48 cell. Small hunched creature ~30px tall."""
    o = GOBLIN_PAL['outline']
    skin0, skin1 = GOBLIN_PAL['skin']
    loin = GOBLIN_PAL['loincloth'][0]
    dagger = GOBLIN_PAL['dagger'][0]
    eye = GOBLIN_PAL['eye'][0]

    cx = ox + 24
    base_y = oy + 40  # feet at bottom area

    bob = 0
    if anim_type == 'walk':
        bob = -1 if frame_idx % 2 == 0 else 1
    elif anim_type == 'death':
        if frame_idx == 0:  # flash
            skin0 = (255, 255, 200)
            skin1 = (255, 255, 150)
        elif frame_idx == 1:  # shrink
            base_y += 6
        elif frame_idx == 2:  # remnants
            # Just a few pixels
            for i in range(4):
                px(draw, cx - 2 + i * 2, base_y - 2, skin1)
                px(draw, cx - 1 + i, base_y, skin0)
            return

    # Head (round, pointy ears)
    head_y = base_y - 26 + bob
    head_x = cx - 5
    rect(draw, head_x, head_y, 10, 8, skin0)
    rect(draw, head_x + 1, head_y + 5, 8, 3, skin1)
    # Pointy ears
    rect(draw, head_x - 3, head_y + 2, 3, 3, skin0)
    rect(draw, head_x + 10, head_y + 2, 3, 3, skin0)
    # Eyes
    px(draw, head_x + 2, head_y + 3, eye)
    px(draw, head_x + 3, head_y + 3, eye)
    px(draw, head_x + 6, head_y + 3, eye)
    px(draw, head_x + 7, head_y + 3, eye)
    # Mouth
    px(draw, head_x + 4, head_y + 6, o)
    px(draw, head_x + 5, head_y + 6, o)
    outline_rect(draw, head_x - 4, head_y - 1, 18, 10, o)

    # Hunched body
    body_y = head_y + 8
    rect(draw, cx - 6, body_y, 12, 8, skin0)
    rect(draw, cx - 5, body_y + 5, 10, 3, skin1)
    # Loincloth
    rect(draw, cx - 4, body_y + 6, 8, 3, loin)
    outline_rect(draw, cx - 7, body_y - 1, 14, 12, o)

    # Arms
    arm_y = body_y + 1
    rect(draw, cx - 9, arm_y, 3, 6, skin0)
    rect(draw, cx + 6, arm_y, 3, 6, skin0)
    outline_rect(draw, cx - 10, arm_y - 1, 5, 8, o)
    outline_rect(draw, cx + 5, arm_y - 1, 5, 8, o)

    # Dagger in right hand
    rect(draw, cx + 8, arm_y - 2, 2, 6, dagger)
    outline_rect(draw, cx + 7, arm_y - 3, 4, 8, o)

    # Legs
    l_off = 0
    r_off = 0
    if anim_type == 'walk':
        if frame_idx == 0: l_off = -1; r_off = 1
        elif frame_idx == 1: l_off = 1; r_off = -1
        elif frame_idx == 2: l_off = -1; r_off = 1

    leg_y = body_y + 9
    rect(draw, cx - 4 + l_off, leg_y, 3, 5, skin0)
    rect(draw, cx + 1 + r_off, leg_y, 3, 5, skin0)
    outline_rect(draw, cx - 5 + l_off, leg_y - 1, 5, 7, o)
    outline_rect(draw, cx + 0 + r_off, leg_y - 1, 5, 7, o)


def draw_night_goblin_frame(draw, ox, oy, anim_type, frame_idx):
    """Dark purple skin, hooded cloak, yellow glowing eyes."""
    o = NIGHT_GOBLIN_PAL['outline']
    skin0, skin1 = NIGHT_GOBLIN_PAL['skin']
    eyes = NIGHT_GOBLIN_PAL['eyes'][0]
    cloak0, cloak1 = NIGHT_GOBLIN_PAL['cloak']

    cx = ox + 24
    base_y = oy + 42

    bob = 0
    if anim_type == 'walk':
        bob = -1 if frame_idx % 2 == 0 else 1
    elif anim_type == 'death':
        if frame_idx == 0:
            cloak0 = (100, 60, 130)
            skin0 = (150, 100, 180)
        elif frame_idx == 1:
            base_y += 8
        elif frame_idx == 2:
            for i in range(5):
                px(draw, cx - 3 + i * 2, base_y - 2, cloak0)
            return

    # Hood/cloak over head
    head_y = base_y - 28 + bob
    head_x = cx - 6
    rect(draw, head_x, head_y, 12, 10, cloak0)
    rect(draw, head_x + 1, head_y, 10, 3, cloak1)  # hood top lighter
    # Face peek
    rect(draw, head_x + 2, head_y + 4, 8, 5, skin0)
    rect(draw, head_x + 3, head_y + 7, 6, 2, skin1)
    # Glowing eyes
    px(draw, head_x + 3, head_y + 5, eyes)
    px(draw, head_x + 4, head_y + 5, eyes)
    px(draw, head_x + 7, head_y + 5, eyes)
    px(draw, head_x + 8, head_y + 5, eyes)
    # Pointy ears sticking out
    rect(draw, head_x - 2, head_y + 4, 2, 3, skin0)
    rect(draw, head_x + 12, head_y + 4, 2, 3, skin0)
    outline_rect(draw, head_x - 3, head_y - 1, 18, 12, o)

    # Cloaked body
    body_y = head_y + 10
    rect(draw, cx - 7, body_y, 14, 10, cloak0)
    rect(draw, cx - 6, body_y + 6, 12, 4, cloak1)
    outline_rect(draw, cx - 8, body_y - 1, 16, 12, o)

    # Legs hidden under cloak - just feet
    l_off = 0; r_off = 0
    if anim_type == 'walk':
        if frame_idx == 0: l_off = -1; r_off = 1
        elif frame_idx == 2: l_off = 1; r_off = -1

    leg_y = body_y + 10
    rect(draw, cx - 4 + l_off, leg_y, 3, 4, skin0)
    rect(draw, cx + 1 + r_off, leg_y, 3, 4, skin0)
    outline_rect(draw, cx - 5 + l_off, leg_y - 1, 5, 6, o)
    outline_rect(draw, cx + 0 + r_off, leg_y - 1, 5, 6, o)


def draw_ice_wolf_frame(draw, ox, oy, anim_type, frame_idx):
    """Quadruped. Wider than tall ~40x30 within 48x48."""
    o = ICE_WOLF_PAL['outline']
    fur0, fur1 = ICE_WOLF_PAL['fur']
    fangs = ICE_WOLF_PAL['fangs'][0]
    nose = ICE_WOLF_PAL['nose'][0]
    eye = ICE_WOLF_PAL['eye'][0]

    cx = ox + 24
    base_y = oy + 38

    bob = 0
    if anim_type == 'walk':
        bob = -1 if frame_idx % 2 == 0 else 1
    elif anim_type == 'death':
        if frame_idx == 0:
            fur0 = (240, 245, 255)
            fur1 = (220, 230, 250)
        elif frame_idx == 1:
            base_y += 6
        elif frame_idx == 2:
            for i in range(6):
                px(draw, cx - 8 + i * 3, base_y - 1, fur0)
                px(draw, cx - 7 + i * 3, base_y, fur1)
            return

    # Body (elongated horizontal)
    body_y = base_y - 14 + bob
    rect(draw, cx - 16, body_y, 32, 12, fur0)
    rect(draw, cx - 14, body_y + 8, 28, 4, fur1)
    # Lighter belly
    rect(draw, cx - 12, body_y + 6, 24, 4, fur1)
    outline_rect(draw, cx - 17, body_y - 1, 34, 14, o)

    # Head
    head_x = cx + 14
    head_y = body_y - 4
    rect(draw, head_x, head_y, 10, 10, fur0)
    rect(draw, head_x + 2, head_y + 6, 6, 4, fur1)
    # Snout
    rect(draw, head_x + 8, head_y + 4, 5, 4, fur0)
    px(draw, head_x + 12, head_y + 4, nose)
    px(draw, head_x + 12, head_y + 5, nose)
    # Fangs
    px(draw, head_x + 9, head_y + 7, fangs)
    px(draw, head_x + 11, head_y + 7, fangs)
    # Eye
    px(draw, head_x + 3, head_y + 3, eye)
    px(draw, head_x + 4, head_y + 3, eye)
    # Ears
    rect(draw, head_x + 1, head_y - 3, 3, 3, fur0)
    rect(draw, head_x + 5, head_y - 3, 3, 3, fur0)
    outline_rect(draw, head_x - 1, head_y - 4, 15, 15, o)

    # Tail
    rect(draw, cx - 18, body_y - 2, 4, 6, fur0)
    rect(draw, cx - 20, body_y - 4, 3, 4, fur1)
    outline_rect(draw, cx - 21, body_y - 5, 8, 10, o)

    # Legs (4 legs, walking animation)
    l_off = [0, 0, 0, 0]
    if anim_type == 'walk':
        if frame_idx == 0:   l_off = [-2, 2, 2, -2]
        elif frame_idx == 1: l_off = [0, 0, 0, 0]
        elif frame_idx == 2: l_off = [2, -2, -2, 2]

    leg_y = body_y + 12
    leg_positions = [cx - 13, cx - 7, cx + 5, cx + 11]
    for i, lx in enumerate(leg_positions):
        rect(draw, lx + l_off[i], leg_y, 3, 6, fur1)
        outline_rect(draw, lx - 1 + l_off[i], leg_y - 1, 5, 8, o)


def draw_shadow_beast_frame(draw, ox, oy, anim_type, frame_idx):
    """Dark smoky hunched creature, red eyes, claws."""
    o = SHADOW_BEAST_PAL['outline']
    body0, body1 = SHADOW_BEAST_PAL['body']
    eyes = SHADOW_BEAST_PAL['eyes'][0]
    claws = SHADOW_BEAST_PAL['claws'][0]

    cx = ox + 24
    base_y = oy + 42

    bob = 0
    if anim_type == 'walk':
        bob = -1 if frame_idx % 2 == 0 else 1
    elif anim_type == 'death':
        if frame_idx == 0:
            body0 = (120, 60, 140)
            body1 = (100, 50, 120)
        elif frame_idx == 1:
            base_y += 8
        elif frame_idx == 2:
            for i in range(5):
                px(draw, cx - 4 + i * 2, base_y - 2, body0)
                px(draw, cx - 3 + i * 2, base_y - 1, body1)
            return

    # Head
    head_y = base_y - 30 + bob
    rect(draw, cx - 6, head_y, 12, 8, body0)
    rect(draw, cx - 5, head_y + 1, 10, 4, body1)
    # Horns
    rect(draw, cx - 7, head_y - 4, 3, 5, body1)
    rect(draw, cx + 4, head_y - 4, 3, 5, body1)
    outline_rect(draw, cx - 8, head_y - 5, 5, 7, o)
    outline_rect(draw, cx + 3, head_y - 5, 5, 7, o)
    # Red eyes
    px(draw, cx - 3, head_y + 3, eyes)
    px(draw, cx - 2, head_y + 3, eyes)
    px(draw, cx + 2, head_y + 3, eyes)
    px(draw, cx + 3, head_y + 3, eyes)
    outline_rect(draw, cx - 7, head_y - 1, 14, 10, o)

    # Hunched body
    body_y = head_y + 8
    rect(draw, cx - 8, body_y, 16, 12, body0)
    rect(draw, cx - 7, body_y + 6, 14, 6, body1)
    # Smoky wisps
    for i in range(3):
        px(draw, cx - 9 + i * 3, body_y - 1, body1)
        px(draw, cx - 8 + i * 4, body_y + 12, body1)
    outline_rect(draw, cx - 9, body_y - 1, 18, 14, o)

    # Arms with claws
    arm_y = body_y + 2
    rect(draw, cx - 12, arm_y, 4, 8, body0)
    rect(draw, cx + 8, arm_y, 4, 8, body0)
    # Claws
    px(draw, cx - 13, arm_y + 7, claws)
    px(draw, cx - 12, arm_y + 8, claws)
    px(draw, cx + 11, arm_y + 7, claws)
    px(draw, cx + 12, arm_y + 8, claws)
    outline_rect(draw, cx - 14, arm_y - 1, 7, 11, o)
    outline_rect(draw, cx + 7, arm_y - 1, 7, 11, o)

    # Legs
    l_off = 0; r_off = 0
    if anim_type == 'walk':
        if frame_idx == 0: l_off = -1; r_off = 1
        elif frame_idx == 2: l_off = 1; r_off = -1

    leg_y = body_y + 12
    rect(draw, cx - 5 + l_off, leg_y, 4, 5, body0)
    rect(draw, cx + 1 + r_off, leg_y, 4, 5, body0)
    outline_rect(draw, cx - 6 + l_off, leg_y - 1, 6, 7, o)
    outline_rect(draw, cx + 0 + r_off, leg_y - 1, 6, 7, o)


def draw_stone_golem_frame(draw, ox, oy, anim_type, frame_idx):
    """Bulky square body ~40x44, grey with orange rune cracks, mossy."""
    o = STONE_GOLEM_PAL['outline']
    rock0, rock1 = STONE_GOLEM_PAL['rock']
    runes = STONE_GOLEM_PAL['runes'][0]
    moss = STONE_GOLEM_PAL['moss'][0]
    eye = STONE_GOLEM_PAL['eye'][0]

    cx = ox + 24
    base_y = oy + 44

    bob = 0
    if anim_type == 'walk':
        bob = -1 if frame_idx % 2 == 0 else 1
    elif anim_type == 'death':
        if frame_idx == 0:
            rock0 = (180, 170, 150)
            runes = (255, 220, 100)
        elif frame_idx == 1:
            base_y += 8
        elif frame_idx == 2:
            for i in range(6):
                px(draw, cx - 6 + i * 2, base_y - 3, rock0)
                px(draw, cx - 5 + i * 2, base_y - 1, rock1)
                if i % 2 == 0:
                    px(draw, cx - 4 + i * 2, base_y - 2, moss)
            return

    # Head (blocky)
    head_y = base_y - 38 + bob
    rect(draw, cx - 8, head_y, 16, 10, rock0)
    rect(draw, cx - 7, head_y + 6, 14, 4, rock1)
    # Eyes
    px(draw, cx - 4, head_y + 4, eye)
    px(draw, cx - 3, head_y + 4, eye)
    px(draw, cx + 3, head_y + 4, eye)
    px(draw, cx + 4, head_y + 4, eye)
    # Rune on forehead
    px(draw, cx - 1, head_y + 2, runes)
    px(draw, cx, head_y + 2, runes)
    px(draw, cx, head_y + 3, runes)
    outline_rect(draw, cx - 9, head_y - 1, 18, 12, o)

    # Big body
    body_y = head_y + 10
    rect(draw, cx - 12, body_y, 24, 16, rock0)
    rect(draw, cx - 11, body_y + 10, 22, 6, rock1)
    # Rune cracks
    for i in range(4):
        px(draw, cx - 6 + i * 3, body_y + 3, runes)
        px(draw, cx - 5 + i * 3, body_y + 4, runes)
        px(draw, cx - 5 + i * 3, body_y + 5, runes)
    # Moss patches
    rect(draw, cx - 10, body_y + 2, 3, 2, moss)
    rect(draw, cx + 7, body_y + 4, 3, 2, moss)
    rect(draw, cx - 3, body_y + 12, 4, 2, moss)
    outline_rect(draw, cx - 13, body_y - 1, 26, 18, o)

    # Thick arms
    arm_y = body_y + 2
    rect(draw, cx - 16, arm_y, 4, 12, rock0)
    rect(draw, cx - 15, arm_y + 8, 3, 4, rock1)
    rect(draw, cx + 12, arm_y, 4, 12, rock0)
    rect(draw, cx + 12, arm_y + 8, 3, 4, rock1)
    outline_rect(draw, cx - 17, arm_y - 1, 6, 14, o)
    outline_rect(draw, cx + 11, arm_y - 1, 6, 14, o)

    # Stubby legs
    l_off = 0; r_off = 0
    if anim_type == 'walk':
        if frame_idx == 0: l_off = -1; r_off = 1
        elif frame_idx == 2: l_off = 1; r_off = -1

    leg_y = body_y + 16
    rect(draw, cx - 8 + l_off, leg_y, 6, 6, rock0)
    rect(draw, cx + 2 + r_off, leg_y, 6, 6, rock0)
    rect(draw, cx - 7 + l_off, leg_y + 4, 5, 2, rock1)
    rect(draw, cx + 3 + r_off, leg_y + 4, 5, 2, rock1)
    outline_rect(draw, cx - 9 + l_off, leg_y - 1, 8, 8, o)
    outline_rect(draw, cx + 1 + r_off, leg_y - 1, 8, 8, o)


def generate_enemy_sheet(enemy_type):
    """Generate 384x48 enemy sheet (8 cols x 1 row, 48x48 each)."""
    sheet = Image.new('RGBA', (384, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)

    draw_fn = {
        'goblin': draw_goblin_frame,
        'night_goblin': draw_night_goblin_frame,
        'ice_wolf': draw_ice_wolf_frame,
        'shadow_beast': draw_shadow_beast_frame,
        'stone_golem': draw_stone_golem_frame,
    }[enemy_type]

    for col in range(8):
        ox = col * 48
        if col < 2:
            anim_type = 'idle'
            frame_idx = col
        elif col < 5:
            anim_type = 'walk'
            frame_idx = col - 2
        else:
            anim_type = 'death'
            frame_idx = col - 5
        draw_fn(draw, ox, 0, anim_type, frame_idx)

    return sheet


# ─── Boss Drawing ─────────────────────────────────────────────────

def draw_troll_frame(draw, ox, oy, frame_idx):
    """Massive green troll with club, tusks. 96x96."""
    o = TROLL_PAL['outline']
    skin0, skin1 = TROLL_PAL['skin']
    club0, club1 = TROLL_PAL['club']
    tusks = TROLL_PAL['tusks'][0]
    eye = TROLL_PAL['eye'][0]
    scar = TROLL_PAL['scar'][0]

    cx = ox + 48
    cy = oy + 48

    bob = 1 if frame_idx == 1 else 0

    # Head
    head_y = cy - 36 + bob
    head_x = cx - 12
    rect(draw, head_x, head_y, 24, 16, skin0)
    rect(draw, head_x + 2, head_y + 10, 20, 6, skin1)
    # Eyes
    px(draw, head_x + 6, head_y + 6, eye)
    px(draw, head_x + 7, head_y + 6, eye)
    px(draw, head_x + 8, head_y + 6, o)
    px(draw, head_x + 15, head_y + 6, eye)
    px(draw, head_x + 16, head_y + 6, eye)
    px(draw, head_x + 17, head_y + 6, o)
    # Tusks
    rect(draw, head_x + 5, head_y + 13, 3, 5, tusks)
    rect(draw, head_x + 16, head_y + 13, 3, 5, tusks)
    outline_rect(draw, head_x + 4, head_y + 12, 5, 7, o)
    outline_rect(draw, head_x + 15, head_y + 12, 5, 7, o)
    # Brow
    rect(draw, head_x + 4, head_y + 4, 16, 2, skin1)
    outline_rect(draw, head_x - 1, head_y - 1, 26, 18, o)

    # Body
    body_y = head_y + 16
    rect(draw, cx - 18, body_y, 36, 28, skin0)
    rect(draw, cx - 16, body_y + 18, 32, 10, skin1)
    # Scar on chest
    for i in range(6):
        px(draw, cx - 4 + i, body_y + 5 + i, scar)
        px(draw, cx - 3 + i, body_y + 5 + i, scar)
    # Belly
    rect(draw, cx - 10, body_y + 10, 20, 8, skin1)
    outline_rect(draw, cx - 19, body_y - 1, 38, 30, o)

    # Arms
    arm_y = body_y + 2
    # Left arm
    rect(draw, cx - 24, arm_y, 6, 20, skin0)
    rect(draw, cx - 23, arm_y + 14, 5, 6, skin1)
    outline_rect(draw, cx - 25, arm_y - 1, 8, 22, o)
    # Right arm (holding club)
    rect(draw, cx + 18, arm_y, 6, 20, skin0)
    rect(draw, cx + 18, arm_y + 14, 5, 6, skin1)
    outline_rect(draw, cx + 17, arm_y - 1, 8, 22, o)
    # Club
    rect(draw, cx + 22, arm_y - 16, 6, 24, club0)
    rect(draw, cx + 23, arm_y - 16, 4, 8, club1)
    rect(draw, cx + 20, arm_y - 18, 10, 6, club0)  # club head
    outline_rect(draw, cx + 19, arm_y - 19, 12, 28, o)

    # Legs
    leg_y = body_y + 28
    l_off = -1 if frame_idx == 1 else 0
    r_off = 1 if frame_idx == 1 else 0
    rect(draw, cx - 12 + l_off, leg_y, 10, 12, skin0)
    rect(draw, cx - 11 + l_off, leg_y + 8, 8, 4, skin1)
    rect(draw, cx + 2 + r_off, leg_y, 10, 12, skin0)
    rect(draw, cx + 3 + r_off, leg_y + 8, 8, 4, skin1)
    outline_rect(draw, cx - 13 + l_off, leg_y - 1, 12, 14, o)
    outline_rect(draw, cx + 1 + r_off, leg_y - 1, 12, 14, o)


def draw_frost_giant_frame(draw, ox, oy, frame_idx):
    """Ice-blue giant with frost armor, icicle crown. 96x96."""
    o = FROST_GIANT_PAL['outline']
    skin0, skin1 = FROST_GIANT_PAL['skin']
    armor0, armor1 = FROST_GIANT_PAL['armor']
    ice = FROST_GIANT_PAL['ice'][0]
    eye = FROST_GIANT_PAL['eye'][0]

    cx = ox + 48
    cy = oy + 48
    bob = 1 if frame_idx == 1 else 0

    # Icicle crown
    crown_y = cy - 42 + bob
    for i in range(5):
        h = 8 if i % 2 == 0 else 5
        rect(draw, cx - 10 + i * 5, crown_y - h, 3, h, ice)
        outline_rect(draw, cx - 11 + i * 5, crown_y - h - 1, 5, h + 2, o)

    # Head
    head_y = cy - 36 + bob
    rect(draw, cx - 12, head_y, 24, 14, skin0)
    rect(draw, cx - 10, head_y + 8, 20, 6, skin1)
    # Eyes
    px(draw, cx - 5, head_y + 5, eye)
    px(draw, cx - 4, head_y + 5, eye)
    px(draw, cx + 4, head_y + 5, eye)
    px(draw, cx + 5, head_y + 5, eye)
    outline_rect(draw, cx - 13, head_y - 1, 26, 16, o)

    # Armored body
    body_y = head_y + 14
    rect(draw, cx - 16, body_y, 32, 26, armor0)
    rect(draw, cx - 14, body_y + 16, 28, 10, armor1)
    # Armor plate details
    rect(draw, cx - 14, body_y + 2, 28, 3, ice)
    rect(draw, cx - 12, body_y + 8, 24, 2, armor1)
    outline_rect(draw, cx - 17, body_y - 1, 34, 28, o)

    # Arms (armored)
    arm_y = body_y + 2
    rect(draw, cx - 22, arm_y, 6, 18, armor0)
    rect(draw, cx - 21, arm_y + 12, 5, 6, armor1)
    rect(draw, cx + 16, arm_y, 6, 18, armor0)
    rect(draw, cx + 16, arm_y + 12, 5, 6, armor1)
    # Ice gauntlets
    rect(draw, cx - 23, arm_y + 14, 8, 5, ice)
    rect(draw, cx + 15, arm_y + 14, 8, 5, ice)
    outline_rect(draw, cx - 24, arm_y - 1, 10, 21, o)
    outline_rect(draw, cx + 14, arm_y - 1, 10, 21, o)

    # Legs
    leg_y = body_y + 26
    l_off = -1 if frame_idx == 1 else 0
    r_off = 1 if frame_idx == 1 else 0
    rect(draw, cx - 10 + l_off, leg_y, 8, 12, armor0)
    rect(draw, cx + 2 + r_off, leg_y, 8, 12, armor0)
    rect(draw, cx - 9 + l_off, leg_y + 8, 7, 4, armor1)
    rect(draw, cx + 3 + r_off, leg_y + 8, 7, 4, armor1)
    outline_rect(draw, cx - 11 + l_off, leg_y - 1, 10, 14, o)
    outline_rect(draw, cx + 1 + r_off, leg_y - 1, 10, 14, o)


def draw_shadow_lord_frame(draw, ox, oy, frame_idx):
    """Dark robes, floating, purple energy hands. 96x96."""
    o = SHADOW_LORD_PAL['outline']
    robe0, robe1 = SHADOW_LORD_PAL['robe']
    energy0, energy1 = SHADOW_LORD_PAL['energy']
    eyes = SHADOW_LORD_PAL['eyes'][0]

    cx = ox + 48
    cy = oy + 48
    bob = -2 if frame_idx == 1 else 0  # float up

    # Hood
    head_y = cy - 34 + bob
    rect(draw, cx - 10, head_y, 20, 14, robe0)
    rect(draw, cx - 8, head_y, 16, 4, robe1)
    # Face shadow with eyes
    rect(draw, cx - 6, head_y + 5, 12, 6, (10, 5, 15))
    px(draw, cx - 3, head_y + 7, eyes)
    px(draw, cx - 2, head_y + 7, eyes)
    px(draw, cx + 2, head_y + 7, eyes)
    px(draw, cx + 3, head_y + 7, eyes)
    outline_rect(draw, cx - 11, head_y - 1, 22, 16, o)

    # Flowing robe body (wider at bottom)
    body_y = head_y + 14
    for i in range(24):
        w = 20 + i  # gets wider
        rect(draw, cx - w // 2, body_y + i, w, 1, robe0 if i < 16 else robe1)
    # Robe folds
    for i in range(0, 24, 4):
        px(draw, cx - 4, body_y + i, robe1)
        px(draw, cx + 4, body_y + i, robe1)
    outline_rect(draw, cx - 22, body_y - 1, 44, 26, o)

    # Arms with energy
    arm_y = body_y + 4
    rect(draw, cx - 18, arm_y, 6, 14, robe0)
    rect(draw, cx + 12, arm_y, 6, 14, robe0)
    outline_rect(draw, cx - 19, arm_y - 1, 8, 16, o)
    outline_rect(draw, cx + 11, arm_y - 1, 8, 16, o)

    # Energy orbs at hands
    energy_y = arm_y + 12
    for dy in range(-3, 4):
        for dx in range(-3, 4):
            if dx * dx + dy * dy <= 9:
                c = energy0 if (dx + dy) % 2 == 0 else energy1
                px(draw, cx - 16 + dx, energy_y + dy, c)
                px(draw, cx + 14 + dx, energy_y + dy, c)


def draw_rune_guardian_frame(draw, ox, oy, frame_idx):
    """Stone construct, blue runes, crystal core. 96x96."""
    o = RUNE_GUARDIAN_PAL['outline']
    stone0, stone1 = RUNE_GUARDIAN_PAL['stone']
    runes = RUNE_GUARDIAN_PAL['runes'][0]
    crystal = RUNE_GUARDIAN_PAL['crystal'][0]
    eye = RUNE_GUARDIAN_PAL['eye'][0]

    cx = ox + 48
    cy = oy + 48
    bob = 1 if frame_idx == 1 else 0

    # Head (angular stone)
    head_y = cy - 38 + bob
    rect(draw, cx - 10, head_y, 20, 12, stone0)
    rect(draw, cx - 8, head_y + 8, 16, 4, stone1)
    # Eyes (glowing blue)
    px(draw, cx - 4, head_y + 4, eye)
    px(draw, cx - 3, head_y + 4, eye)
    px(draw, cx - 4, head_y + 5, eye)
    px(draw, cx + 3, head_y + 4, eye)
    px(draw, cx + 4, head_y + 4, eye)
    px(draw, cx + 4, head_y + 5, eye)
    # Rune on forehead
    px(draw, cx - 1, head_y + 2, runes)
    px(draw, cx, head_y + 2, runes)
    px(draw, cx + 1, head_y + 2, runes)
    px(draw, cx, head_y + 1, runes)
    outline_rect(draw, cx - 11, head_y - 1, 22, 14, o)

    # Body (big stone block)
    body_y = head_y + 12
    rect(draw, cx - 16, body_y, 32, 28, stone0)
    rect(draw, cx - 14, body_y + 18, 28, 10, stone1)
    # Crystal core in chest
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            if dx * dx + dy * dy <= 16:
                c = crystal if (dx + dy) % 2 == 0 else runes
                px(draw, cx + dx, body_y + 10 + dy, c)
    # Rune lines on body
    for i in range(6):
        px(draw, cx - 12 + i * 2, body_y + 4, runes)
        px(draw, cx - 12 + i * 2, body_y + 5, runes)
        px(draw, cx + 2 + i * 2, body_y + 4, runes)
        px(draw, cx + 2 + i * 2, body_y + 5, runes)
    outline_rect(draw, cx - 17, body_y - 1, 34, 30, o)

    # Arms
    arm_y = body_y + 2
    rect(draw, cx - 22, arm_y, 6, 20, stone0)
    rect(draw, cx - 21, arm_y + 14, 5, 6, stone1)
    rect(draw, cx + 16, arm_y, 6, 20, stone0)
    rect(draw, cx + 16, arm_y + 14, 5, 6, stone1)
    # Runes on arms
    px(draw, cx - 20, arm_y + 4, runes)
    px(draw, cx - 20, arm_y + 8, runes)
    px(draw, cx + 18, arm_y + 4, runes)
    px(draw, cx + 18, arm_y + 8, runes)
    outline_rect(draw, cx - 23, arm_y - 1, 8, 22, o)
    outline_rect(draw, cx + 15, arm_y - 1, 8, 22, o)

    # Legs
    leg_y = body_y + 28
    l_off = -1 if frame_idx == 1 else 0
    r_off = 1 if frame_idx == 1 else 0
    rect(draw, cx - 10 + l_off, leg_y, 8, 10, stone0)
    rect(draw, cx + 2 + r_off, leg_y, 8, 10, stone0)
    rect(draw, cx - 9 + l_off, leg_y + 6, 7, 4, stone1)
    rect(draw, cx + 3 + r_off, leg_y + 6, 7, 4, stone1)
    # Runes on legs
    px(draw, cx - 7 + l_off, leg_y + 3, runes)
    px(draw, cx + 5 + r_off, leg_y + 3, runes)
    outline_rect(draw, cx - 11 + l_off, leg_y - 1, 10, 12, o)
    outline_rect(draw, cx + 1 + r_off, leg_y - 1, 10, 12, o)


def generate_boss_sheet(boss_type):
    """Generate 192x96 boss sheet (2 cols x 1 row, 96x96 each)."""
    sheet = Image.new('RGBA', (192, 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)

    draw_fn = {
        'troll': draw_troll_frame,
        'frost_giant': draw_frost_giant_frame,
        'shadow_lord': draw_shadow_lord_frame,
        'rune_guardian': draw_rune_guardian_frame,
    }[boss_type]

    for col in range(2):
        draw_fn(draw, col * 96, 0, col)

    return sheet


# ─── NPC Drawing ──────────────────────────────────────────────────

def draw_npc_frame(draw, ox, oy, npc_type, frame_idx, fw, fh):
    """Draw NPC in fw x fh cell."""
    cx = ox + fw // 2
    bob = 1 if frame_idx == 1 else 0

    if npc_type == 'blacksmith':
        _draw_blacksmith(draw, cx, oy, bob)
    elif npc_type == 'shopkeeper':
        _draw_shopkeeper(draw, cx, oy, bob)
    elif npc_type == 'village_npc_1':
        _draw_village_npc1(draw, cx, oy, bob)
    elif npc_type == 'village_npc_2':
        _draw_village_npc2(draw, cx, oy, bob)
    elif npc_type == 'village_npc_3':
        _draw_village_npc3(draw, cx, oy, bob)
    elif npc_type == 'lost_child':
        _draw_lost_child(draw, cx, oy, bob)


def _draw_blacksmith(draw, cx, oy, bob):
    """Brown apron, muscular arms, hammer, bald head."""
    o = OUTLINE
    skin0, skin1 = (210, 170, 130), (180, 140, 100)
    apron = (139, 90, 43)
    apron_dark = (110, 70, 30)
    hammer = (160, 160, 160)

    head_y = oy + 6 + bob
    # Bald head
    rect(draw, cx - 7, head_y, 14, 12, skin0)
    rect(draw, cx - 6, head_y + 8, 12, 4, skin1)
    px(draw, cx - 3, head_y + 4, o)
    px(draw, cx - 2, head_y + 4, o)
    px(draw, cx + 2, head_y + 4, o)
    px(draw, cx + 3, head_y + 4, o)
    outline_rect(draw, cx - 8, head_y - 1, 16, 14, o)

    # Body with apron
    body_y = head_y + 12
    rect(draw, cx - 10, body_y, 20, 18, apron)
    rect(draw, cx - 9, body_y + 12, 18, 6, apron_dark)
    # Apron straps
    rect(draw, cx - 4, body_y, 2, 5, apron_dark)
    rect(draw, cx + 2, body_y, 2, 5, apron_dark)
    outline_rect(draw, cx - 11, body_y - 1, 22, 20, o)

    # Muscular arms
    arm_y = body_y + 2
    rect(draw, cx - 15, arm_y, 5, 14, skin0)
    rect(draw, cx - 14, arm_y + 10, 4, 4, skin1)
    rect(draw, cx + 10, arm_y, 5, 14, skin0)
    rect(draw, cx + 10, arm_y + 10, 4, 4, skin1)
    outline_rect(draw, cx - 16, arm_y - 1, 7, 16, o)
    outline_rect(draw, cx + 9, arm_y - 1, 7, 16, o)
    # Hammer
    rect(draw, cx + 13, arm_y - 8, 3, 12, (100, 70, 40))
    rect(draw, cx + 11, arm_y - 10, 7, 4, hammer)
    outline_rect(draw, cx + 10, arm_y - 11, 9, 6, o)

    # Legs
    leg_y = body_y + 18
    rect(draw, cx - 6, leg_y, 5, 10, (80, 60, 40))
    rect(draw, cx + 1, leg_y, 5, 10, (80, 60, 40))
    outline_rect(draw, cx - 7, leg_y - 1, 7, 12, o)
    outline_rect(draw, cx + 0, leg_y - 1, 7, 12, o)


def _draw_shopkeeper(draw, cx, oy, bob):
    """Blue robe, coin pouch, hat."""
    o = OUTLINE
    skin0 = (255, 220, 177)
    robe0 = (60, 80, 160)
    robe1 = (40, 60, 130)
    hat = (80, 100, 180)
    pouch = (180, 140, 60)

    head_y = oy + 4 + bob
    # Hat
    rect(draw, cx - 9, head_y, 18, 5, hat)
    rect(draw, cx - 6, head_y - 4, 12, 5, hat)
    outline_rect(draw, cx - 10, head_y - 5, 20, 11, o)
    # Face
    rect(draw, cx - 6, head_y + 5, 12, 10, skin0)
    px(draw, cx - 3, head_y + 8, o)
    px(draw, cx + 3, head_y + 8, o)
    outline_rect(draw, cx - 7, head_y + 4, 14, 12, o)

    # Robe body
    body_y = head_y + 15
    rect(draw, cx - 10, body_y, 20, 20, robe0)
    rect(draw, cx - 9, body_y + 14, 18, 6, robe1)
    # Coin pouch on belt
    rect(draw, cx + 4, body_y + 12, 5, 4, pouch)
    px(draw, cx + 6, body_y + 13, (220, 180, 60))
    outline_rect(draw, cx - 11, body_y - 1, 22, 22, o)

    # Arms
    arm_y = body_y + 2
    rect(draw, cx - 14, arm_y, 4, 12, robe0)
    rect(draw, cx + 10, arm_y, 4, 12, robe0)
    rect(draw, cx - 14, arm_y + 10, 4, 3, skin0)
    rect(draw, cx + 10, arm_y + 10, 4, 3, skin0)
    outline_rect(draw, cx - 15, arm_y - 1, 6, 15, o)
    outline_rect(draw, cx + 9, arm_y - 1, 6, 15, o)

    # Legs/feet
    leg_y = body_y + 20
    rect(draw, cx - 5, leg_y, 4, 6, robe1)
    rect(draw, cx + 1, leg_y, 4, 6, robe1)
    outline_rect(draw, cx - 6, leg_y - 1, 6, 8, o)
    outline_rect(draw, cx + 0, leg_y - 1, 6, 8, o)


def _draw_village_npc1(draw, cx, oy, bob):
    """Brown tunic, farmer hat."""
    o = OUTLINE
    skin0 = (255, 220, 177)
    hair = (139, 90, 43)
    tunic = (139, 110, 70)
    tunic_d = (110, 85, 50)
    hat = (180, 150, 80)

    head_y = oy + 4 + bob
    # Farmer hat
    rect(draw, cx - 10, head_y + 2, 20, 3, hat)
    rect(draw, cx - 6, head_y - 2, 12, 5, hat)
    outline_rect(draw, cx - 11, head_y - 3, 22, 9, o)
    # Face
    rect(draw, cx - 6, head_y + 5, 12, 10, skin0)
    px(draw, cx - 3, head_y + 8, o)
    px(draw, cx + 3, head_y + 8, o)
    outline_rect(draw, cx - 7, head_y + 4, 14, 12, o)

    body_y = head_y + 15
    rect(draw, cx - 8, body_y, 16, 18, tunic)
    rect(draw, cx - 7, body_y + 12, 14, 6, tunic_d)
    outline_rect(draw, cx - 9, body_y - 1, 18, 20, o)

    arm_y = body_y + 2
    rect(draw, cx - 12, arm_y, 4, 10, tunic)
    rect(draw, cx + 8, arm_y, 4, 10, tunic)
    rect(draw, cx - 12, arm_y + 8, 4, 3, skin0)
    rect(draw, cx + 8, arm_y + 8, 4, 3, skin0)
    outline_rect(draw, cx - 13, arm_y - 1, 6, 13, o)
    outline_rect(draw, cx + 7, arm_y - 1, 6, 13, o)

    leg_y = body_y + 18
    rect(draw, cx - 5, leg_y, 4, 8, (101, 67, 33))
    rect(draw, cx + 1, leg_y, 4, 8, (101, 67, 33))
    outline_rect(draw, cx - 6, leg_y - 1, 6, 10, o)
    outline_rect(draw, cx + 0, leg_y - 1, 6, 10, o)


def _draw_village_npc2(draw, cx, oy, bob):
    """Blue dress, white apron, female villager."""
    o = OUTLINE
    skin0 = (255, 220, 177)
    hair = (160, 100, 50)
    dress = (80, 100, 180)
    dress_d = (60, 80, 150)
    apron_c = (240, 240, 240)

    head_y = oy + 4 + bob
    # Hair
    rect(draw, cx - 7, head_y, 14, 5, hair)
    rect(draw, cx - 8, head_y + 3, 2, 10, hair)
    rect(draw, cx + 6, head_y + 3, 2, 10, hair)
    # Face
    rect(draw, cx - 6, head_y + 5, 12, 10, skin0)
    px(draw, cx - 3, head_y + 8, o)
    px(draw, cx + 3, head_y + 8, o)
    # Smile
    px(draw, cx - 1, head_y + 11, o)
    px(draw, cx, head_y + 11, o)
    px(draw, cx + 1, head_y + 11, o)
    outline_rect(draw, cx - 9, head_y - 1, 18, 17, o)

    # Dress
    body_y = head_y + 15
    rect(draw, cx - 10, body_y, 20, 22, dress)
    rect(draw, cx - 9, body_y + 14, 18, 8, dress_d)
    # White apron
    rect(draw, cx - 5, body_y + 4, 10, 14, apron_c)
    outline_rect(draw, cx - 11, body_y - 1, 22, 24, o)

    arm_y = body_y + 2
    rect(draw, cx - 14, arm_y, 4, 10, dress)
    rect(draw, cx + 10, arm_y, 4, 10, dress)
    rect(draw, cx - 14, arm_y + 8, 4, 3, skin0)
    rect(draw, cx + 10, arm_y + 8, 4, 3, skin0)
    outline_rect(draw, cx - 15, arm_y - 1, 6, 13, o)
    outline_rect(draw, cx + 9, arm_y - 1, 6, 13, o)

    # Feet
    leg_y = body_y + 22
    rect(draw, cx - 4, leg_y, 3, 4, (101, 67, 33))
    rect(draw, cx + 1, leg_y, 3, 4, (101, 67, 33))
    outline_rect(draw, cx - 5, leg_y - 1, 5, 6, o)
    outline_rect(draw, cx + 0, leg_y - 1, 5, 6, o)


def _draw_village_npc3(draw, cx, oy, bob):
    """Grey robe, walking stick, white beard, elder."""
    o = OUTLINE
    skin0 = (230, 200, 170)
    robe = (140, 140, 150)
    robe_d = (110, 110, 120)
    beard_c = (230, 230, 230)
    stick = (120, 80, 40)

    head_y = oy + 4 + bob
    # White hair
    rect(draw, cx - 7, head_y, 14, 4, beard_c)
    # Face
    rect(draw, cx - 6, head_y + 4, 12, 10, skin0)
    px(draw, cx - 3, head_y + 7, o)
    px(draw, cx + 3, head_y + 7, o)
    # Beard
    rect(draw, cx - 5, head_y + 11, 10, 6, beard_c)
    rect(draw, cx - 3, head_y + 15, 6, 3, beard_c)
    outline_rect(draw, cx - 8, head_y - 1, 16, 20, o)

    # Robe
    body_y = head_y + 18
    rect(draw, cx - 10, body_y, 20, 20, robe)
    rect(draw, cx - 9, body_y + 14, 18, 6, robe_d)
    outline_rect(draw, cx - 11, body_y - 1, 22, 22, o)

    # Arms
    arm_y = body_y + 2
    rect(draw, cx - 14, arm_y, 4, 12, robe)
    rect(draw, cx + 10, arm_y, 4, 12, robe)
    outline_rect(draw, cx - 15, arm_y - 1, 6, 14, o)
    outline_rect(draw, cx + 9, arm_y - 1, 6, 14, o)

    # Walking stick
    rect(draw, cx + 14, arm_y - 6, 2, 24, stick)
    outline_rect(draw, cx + 13, arm_y - 7, 4, 26, o)

    # Feet
    leg_y = body_y + 20
    rect(draw, cx - 5, leg_y, 4, 4, robe_d)
    rect(draw, cx + 1, leg_y, 4, 4, robe_d)
    outline_rect(draw, cx - 6, leg_y - 1, 6, 6, o)
    outline_rect(draw, cx + 0, leg_y - 1, 6, 6, o)


def _draw_lost_child(draw, cx, oy, bob):
    """Small child 32x40, messy brown hair, simple brown clothes."""
    o = OUTLINE
    skin0 = (255, 220, 177)
    hair = (139, 90, 43)
    clothes = (160, 120, 80)
    clothes_d = (130, 95, 60)

    head_y = oy + 2 + bob
    # Messy hair
    rect(draw, cx - 5, head_y, 10, 4, hair)
    px(draw, cx - 4, head_y - 1, hair)
    px(draw, cx + 1, head_y - 1, hair)
    px(draw, cx - 3, head_y - 1, hair)
    rect(draw, cx - 6, head_y + 2, 2, 4, hair)
    rect(draw, cx + 4, head_y + 2, 2, 4, hair)
    # Face
    rect(draw, cx - 4, head_y + 4, 8, 7, skin0)
    px(draw, cx - 2, head_y + 6, o)
    px(draw, cx + 2, head_y + 6, o)
    outline_rect(draw, cx - 7, head_y - 2, 14, 14, o)

    # Body
    body_y = head_y + 11
    rect(draw, cx - 5, body_y, 10, 10, clothes)
    rect(draw, cx - 4, body_y + 6, 8, 4, clothes_d)
    outline_rect(draw, cx - 6, body_y - 1, 12, 12, o)

    # Arms
    rect(draw, cx - 8, body_y + 1, 3, 7, clothes)
    rect(draw, cx + 5, body_y + 1, 3, 7, clothes)
    rect(draw, cx - 8, body_y + 6, 3, 2, skin0)
    rect(draw, cx + 5, body_y + 6, 3, 2, skin0)
    outline_rect(draw, cx - 9, body_y, 5, 9, o)
    outline_rect(draw, cx + 4, body_y, 5, 9, o)

    # Legs
    leg_y = body_y + 10
    rect(draw, cx - 3, leg_y, 3, 6, clothes_d)
    rect(draw, cx + 0, leg_y, 3, 6, clothes_d)
    rect(draw, cx - 3, leg_y + 4, 3, 2, (101, 67, 33))
    rect(draw, cx + 0, leg_y + 4, 3, 2, (101, 67, 33))
    outline_rect(draw, cx - 4, leg_y - 1, 5, 8, o)
    outline_rect(draw, cx - 1, leg_y - 1, 5, 8, o)


def generate_npc_sheet(npc_type):
    """Generate NPC sheet. 2 idle frames side by side."""
    if npc_type == 'lost_child':
        fw, fh = 32, 40
    else:
        fw, fh = 48, 64

    sheet = Image.new('RGBA', (fw * 2, fh), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)

    for col in range(2):
        draw_npc_frame(draw, col * fw, 0, npc_type, col, fw, fh)

    return sheet


# ─── Main ─────────────────────────────────────────────────────────

def main():
    results = {}

    # Players
    print("Generating player sprites...")
    results['player'] = img_to_base64(generate_player_sheet(PLAYER_NORMAL))
    results['player_slayer'] = img_to_base64(generate_player_sheet(PLAYER_SLAYER))
    results['player_wood'] = img_to_base64(generate_player_sheet(PLAYER_WOOD))
    results['player_iron'] = img_to_base64(generate_player_sheet(PLAYER_IRON))
    results['player_fire'] = img_to_base64(generate_player_sheet(PLAYER_FIRE))
    results['player_ice'] = img_to_base64(generate_player_sheet(PLAYER_ICE))
    results['player_dragon'] = img_to_base64(generate_player_sheet(PLAYER_DRAGON))

    # Enemies
    enemies = ['goblin', 'night_goblin', 'ice_wolf', 'shadow_beast', 'stone_golem']
    for e in enemies:
        print(f"Generating {e} sprites...")
        results[e] = img_to_base64(generate_enemy_sheet(e))

    # Bosses
    bosses = ['troll', 'frost_giant', 'shadow_lord', 'rune_guardian']
    for b in bosses:
        print(f"Generating {b} sprites...")
        results[b] = img_to_base64(generate_boss_sheet(b))

    # NPCs
    npcs = ['blacksmith', 'shopkeeper', 'village_npc_1', 'village_npc_2',
            'village_npc_3', 'lost_child']
    for n in npcs:
        print(f"Generating {n} sprites...")
        results[n] = img_to_base64(generate_npc_sheet(n))

    # Write output
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'sprite_output.txt')
    with open(output_path, 'w') as f:
        for key, val in results.items():
            f.write(f"{key} = '{val}'\n")

    print(f"\nDone! Output written to {output_path}")
    print(f"Generated {len(results)} sprite sheets.")


if __name__ == '__main__':
    main()
