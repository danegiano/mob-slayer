#!/usr/bin/env python3
"""Generate pixel art sprites for wilderness enemies/bosses as base64."""
import io, base64
from PIL import Image, ImageDraw

def to_base64(img):
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def draw_ice_wolf_frame(draw, ox, oy, leg_offset):
    """Draw a white/ice-blue wolf in a 24x24 tile at offset (ox, oy)."""
    ice_blue  = (180, 220, 255, 255)
    white     = (240, 248, 255, 255)
    dark_fur  = (140, 190, 230, 255)
    red       = (220,  40,  40, 255)
    dark_nose = ( 60,  60,  80, 255)

    # Body (oval-ish rectangle)
    draw.rectangle([ox+4, oy+9, ox+19, oy+17], fill=ice_blue)
    # Round out body with extra pixels
    draw.rectangle([ox+5, oy+8, ox+18, oy+18], fill=ice_blue)

    # Head
    draw.rectangle([ox+16, oy+5, ox+23, oy+13], fill=white)
    # Snout
    draw.rectangle([ox+20, oy+8, ox+23, oy+12], fill=ice_blue)
    draw.point([ox+22, oy+11], fill=dark_nose)

    # Ears (pointy triangles approximated as pixels)
    draw.rectangle([ox+17, oy+3, ox+18, oy+5], fill=white)
    draw.rectangle([ox+20, oy+3, ox+21, oy+5], fill=white)
    draw.point([ox+18, oy+2], fill=white)
    draw.point([ox+21, oy+2], fill=white)

    # Eyes
    draw.point([ox+18, oy+7], fill=red)
    draw.point([ox+21, oy+7], fill=red)

    # Legs (4 short legs)
    leg_y1 = oy + 17 + leg_offset
    leg_y2 = oy + 17
    # front legs
    draw.rectangle([ox+16, leg_y2, ox+17, leg_y2+4], fill=dark_fur)
    draw.rectangle([ox+13, leg_y1, ox+14, leg_y1+3], fill=dark_fur)
    # back legs
    draw.rectangle([ox+6,  leg_y2, ox+7,  leg_y2+4], fill=dark_fur)
    draw.rectangle([ox+9,  leg_y1, ox+10, leg_y1+3], fill=dark_fur)

    # Tail (curves up at back)
    draw.rectangle([ox+1, oy+6, ox+4, oy+8], fill=white)
    draw.rectangle([ox+2, oy+5, ox+4, oy+6], fill=white)


def make_ice_wolf():
    img = Image.new('RGBA', (48, 24), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_ice_wolf_frame(draw, 0,  0, 0)   # frame 1: legs down
    draw_ice_wolf_frame(draw, 24, 0, -2)  # frame 2: legs up (walk)
    return img


def draw_shadow_beast_frame(draw, ox, oy, crouched):
    """Dark purple/black beast with yellow eyes."""
    dark   = ( 30,   5,  50, 255)
    purple = ( 80,  20, 110, 255)
    wisp   = ( 60,  10,  90, 180)
    yellow = (255, 220,   0, 255)

    body_y = oy + 7 + crouched
    # Hunched body
    draw.ellipse([ox+4, body_y, ox+19, body_y+10], fill=dark)
    # Shoulder hump
    draw.ellipse([ox+7, body_y-3, ox+16, body_y+3], fill=purple)

    # Head
    draw.ellipse([ox+13, oy+3+crouched, ox+22, oy+11+crouched], fill=dark)

    # Eyes
    draw.point([ox+15, oy+6+crouched], fill=yellow)
    draw.point([ox+16, oy+6+crouched], fill=yellow)
    draw.point([ox+19, oy+6+crouched], fill=yellow)
    draw.point([ox+20, oy+6+crouched], fill=yellow)

    # Legs / haunches
    draw.rectangle([ox+5,  body_y+9, ox+7,  body_y+13], fill=purple)
    draw.rectangle([ox+14, body_y+9, ox+16, body_y+13], fill=purple)

    # Wispy edges
    for dx, dy in [(ox+2, body_y+2), (ox+1, body_y+5), (ox+20, body_y+1),
                   (ox+21, body_y+4), (ox+10, body_y-4), (ox+12, body_y-5)]:
        draw.ellipse([dx, dy, dx+2, dy+2], fill=wisp)


def make_shadow_beast():
    img = Image.new('RGBA', (48, 24), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_shadow_beast_frame(draw, 0,  0, 0)
    draw_shadow_beast_frame(draw, 24, 0, 2)  # frame 2: more crouched
    return img


def draw_stone_golem_frame(draw, ox, oy, arms_raised):
    """Gray/brown blocky humanoid."""
    gray   = (120, 110, 100, 255)
    dark_g = ( 80,  72,  65, 255)
    light_g= (160, 150, 140, 255)
    brown  = (100,  80,  60, 255)

    # Legs
    draw.rectangle([ox+10, oy+22, ox+14, oy+31], fill=gray)
    draw.rectangle([ox+17, oy+22, ox+21, oy+31], fill=gray)

    # Body (wide rectangle)
    draw.rectangle([ox+6, oy+10, ox+25, oy+22], fill=gray)
    # Body shading
    draw.rectangle([ox+6, oy+10, ox+8,  oy+22], fill=dark_g)
    draw.rectangle([ox+23,oy+10, ox+25, oy+22], fill=dark_g)
    draw.rectangle([ox+7, oy+10, ox+24, oy+12], fill=light_g)

    # Arms
    arm_y = oy + 10 - arms_raised
    draw.rectangle([ox+1,  arm_y,     ox+6,  arm_y+8], fill=brown)
    draw.rectangle([ox+25, arm_y,     ox+30, arm_y+8], fill=brown)
    # Fists
    draw.rectangle([ox+1,  arm_y+8,   ox+5,  arm_y+12], fill=gray)
    draw.rectangle([ox+26, arm_y+8,   ox+30, arm_y+12], fill=gray)

    # Head (small, square)
    draw.rectangle([ox+11, oy+3, ox+20, oy+10], fill=gray)
    draw.rectangle([ox+11, oy+3, ox+20, oy+5],  fill=light_g)

    # Eyes (dark slits)
    draw.rectangle([ox+13, oy+6, ox+14, oy+7], fill=dark_g)
    draw.rectangle([ox+17, oy+6, ox+18, oy+7], fill=dark_g)

    # Crack lines on body
    draw.line([ox+13, oy+12, ox+13, oy+20], fill=dark_g)
    draw.line([ox+19, oy+14, ox+19, oy+21], fill=dark_g)


def make_stone_golem():
    img = Image.new('RGBA', (64, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_stone_golem_frame(draw, 0,  0, 0)
    draw_stone_golem_frame(draw, 32, 0, 3)  # frame 2: arms raised
    return img


def draw_frost_giant_frame(draw, ox, oy, lean):
    """Tall ice-blue humanoid with icy crown."""
    ice    = (140, 200, 240, 255)
    dark_i = ( 80, 140, 180, 255)
    white  = (220, 240, 255, 255)
    skin   = (180, 215, 245, 255)
    dark_e = ( 20,  40,  80, 255)

    # Legs
    draw.rectangle([ox+14+lean, oy+55, ox+22+lean, oy+79], fill=ice)
    draw.rectangle([ox+26+lean, oy+55, ox+34+lean, oy+79], fill=ice)
    draw.rectangle([ox+14+lean, oy+75, ox+23+lean, oy+79], fill=dark_i)  # boot
    draw.rectangle([ox+26+lean, oy+75, ox+35+lean, oy+79], fill=dark_i)

    # Body
    draw.rectangle([ox+10+lean, oy+25, ox+38+lean, oy+56], fill=ice)
    draw.rectangle([ox+10+lean, oy+25, ox+13+lean, oy+56], fill=dark_i)  # shading
    draw.rectangle([ox+35+lean, oy+25, ox+38+lean, oy+56], fill=dark_i)

    # Arms (big fists)
    draw.rectangle([ox+2+lean,  oy+28, ox+10+lean, oy+48], fill=skin)
    draw.rectangle([ox+38+lean, oy+28, ox+46+lean, oy+48], fill=skin)
    # Fists
    draw.rectangle([ox+1+lean,  oy+44, ox+11+lean, oy+52], fill=ice)
    draw.rectangle([ox+37+lean, oy+44, ox+47+lean, oy+52], fill=ice)

    # Head
    draw.ellipse([ox+14+lean, oy+6, ox+34+lean, oy+26], fill=skin)

    # Icy crown (white triangles)
    for cx in [ox+16+lean, ox+21+lean, ox+26+lean, ox+31+lean]:
        draw.polygon([(cx, oy+6), (cx+2, oy+6), (cx+1, oy+0)], fill=white)

    # Eyes
    draw.rectangle([ox+17+lean, oy+13, ox+20+lean, oy+15], fill=dark_e)
    draw.rectangle([ox+28+lean, oy+13, ox+31+lean, oy+15], fill=dark_e)

    # Beard / chin shading
    draw.rectangle([ox+16+lean, oy+20, ox+32+lean, oy+25], fill=white)


def make_frost_giant():
    img = Image.new('RGBA', (128, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_frost_giant_frame(draw, 0,  0, 0)
    draw_frost_giant_frame(draw, 64, 0, 2)  # frame 2: slight lean
    return img


def draw_shadow_lord_frame(draw, ox, oy, cape_var):
    """Dark flowing robes, glowing purple eyes."""
    dark_p = ( 25,   5,  45, 255)
    purple = ( 80,  15, 110, 255)
    mid_p  = ( 55,  10,  80, 255)
    glow_p = (200,  50, 255, 255)
    black  = (  5,   0,  10, 255)

    # Cape/cloak base (wide triangle shape)
    cape_w = 8 + cape_var
    draw.polygon([
        (ox+32, oy+8),
        (ox+10-cape_w, oy+63),
        (ox+54+cape_w, oy+63)
    ], fill=dark_p)

    # Inner robe (slightly lighter)
    draw.polygon([
        (ox+32, oy+12),
        (ox+18, oy+63),
        (ox+46, oy+63)
    ], fill=mid_p)

    # Hood/head
    draw.ellipse([ox+22, oy+3, ox+42, oy+20], fill=dark_p)
    # Face shadow (nearly black)
    draw.ellipse([ox+25, oy+7, ox+39, oy+18], fill=black)

    # Glowing eyes
    draw.ellipse([ox+26, oy+10, ox+30, oy+13], fill=glow_p)
    draw.ellipse([ox+34, oy+10, ox+38, oy+13], fill=glow_p)
    # Eye glow halos
    draw.ellipse([ox+25, oy+9,  ox+31, oy+14], fill=(glow_p[0], glow_p[1], glow_p[2], 100))
    draw.ellipse([ox+33, oy+9,  ox+39, oy+14], fill=(glow_p[0], glow_p[1], glow_p[2], 100))

    # Hands peeking from robe
    draw.ellipse([ox+12, oy+35, ox+19, oy+42], fill=purple)
    draw.ellipse([ox+45, oy+35, ox+52, oy+42], fill=purple)

    # Cape highlights
    draw.line([ox+32, oy+8, ox+10-cape_w, oy+63], fill=purple)
    draw.line([ox+32, oy+8, ox+54+cape_w, oy+63], fill=purple)


def make_shadow_lord():
    img = Image.new('RGBA', (128, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_shadow_lord_frame(draw, 0,  0, 0)
    draw_shadow_lord_frame(draw, 64, 0, 4)  # frame 2: cape billows more
    return img


def draw_rune_guardian_frame(draw, ox, oy, rune_set):
    """Sandy brown/gold stone body with glowing rune lines."""
    stone  = (160, 130,  80, 255)
    dark_s = (110,  85,  45, 255)
    light_s= (200, 170, 110, 255)
    gold   = (255, 200,   0, 255)
    gold_b = (255, 160,   0, 255)  # brighter gold

    # Legs
    draw.rectangle([ox+14, oy+55, ox+23, oy+79], fill=stone)
    draw.rectangle([ox+27, oy+55, ox+36, oy+79], fill=stone)
    # Foot plates
    draw.rectangle([ox+12, oy+74, ox+25, oy+79], fill=dark_s)
    draw.rectangle([ox+25, oy+74, ox+38, oy+79], fill=dark_s)

    # Body
    draw.rectangle([ox+10, oy+22, ox+40, oy+56], fill=stone)
    draw.rectangle([ox+10, oy+22, ox+13, oy+56], fill=dark_s)
    draw.rectangle([ox+37, oy+22, ox+40, oy+56], fill=dark_s)
    draw.rectangle([ox+10, oy+22, ox+40, oy+25], fill=light_s)

    # Shoulder pads
    draw.rectangle([ox+5,  oy+22, ox+12, oy+30], fill=dark_s)
    draw.rectangle([ox+38, oy+22, ox+45, oy+30], fill=dark_s)

    # Arms
    draw.rectangle([ox+3,  oy+28, ox+11, oy+50], fill=stone)
    draw.rectangle([ox+39, oy+28, ox+47, oy+50], fill=stone)
    # Fists
    draw.rectangle([ox+2,  oy+48, ox+12, oy+56], fill=dark_s)
    draw.rectangle([ox+38, oy+48, ox+48, oy+56], fill=dark_s)

    # Head
    draw.rectangle([ox+15, oy+5, ox+35, oy+22], fill=stone)
    draw.rectangle([ox+15, oy+5, ox+35, oy+8], fill=light_s)
    # Face visor
    draw.rectangle([ox+17, oy+10, ox+33, oy+16], fill=dark_s)
    # Eye slits glow
    draw.rectangle([ox+18, oy+11, ox+23, oy+13], fill=gold)
    draw.rectangle([ox+27, oy+11, ox+32, oy+13], fill=gold)

    # Rune lines on body (two sets alternating)
    if rune_set == 0:
        # Set A: vertical and diagonal runes
        draw.line([ox+16, oy+27, ox+16, oy+50], fill=gold)
        draw.line([ox+24, oy+25, ox+24, oy+52], fill=gold_b)
        draw.line([ox+32, oy+27, ox+32, oy+50], fill=gold)
        draw.line([ox+20, oy+30, ox+28, oy+30], fill=gold)
        draw.line([ox+20, oy+42, ox+28, oy+42], fill=gold)
        # Runes on arms
        draw.line([ox+5,  oy+33, ox+9,  oy+33], fill=gold)
        draw.line([ox+41, oy+33, ox+45, oy+33], fill=gold)
        draw.line([ox+5,  oy+43, ox+9,  oy+43], fill=gold)
        draw.line([ox+41, oy+43, ox+45, oy+43], fill=gold)
    else:
        # Set B: different rune positions
        draw.line([ox+18, oy+26, ox+18, oy+51], fill=gold_b)
        draw.line([ox+28, oy+26, ox+28, oy+51], fill=gold_b)
        draw.line([ox+36, oy+28, ox+36, oy+49], fill=gold)
        draw.line([ox+20, oy+36, ox+30, oy+36], fill=gold_b)
        draw.line([ox+20, oy+46, ox+30, oy+46], fill=gold_b)
        # Runes on arms (different spots)
        draw.line([ox+4,  oy+36, ox+10, oy+36], fill=gold_b)
        draw.line([ox+40, oy+36, ox+46, oy+36], fill=gold_b)
        draw.line([ox+4,  oy+46, ox+10, oy+46], fill=gold_b)
        draw.line([ox+40, oy+46, ox+46, oy+46], fill=gold_b)


def make_rune_guardian():
    img = Image.new('RGBA', (128, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_rune_guardian_frame(draw, 0,  0, 0)
    draw_rune_guardian_frame(draw, 64, 0, 1)  # frame 2: runes in different spots
    return img


def draw_village_npc_frame(draw, ox, oy, hat_color, bob):
    """Draw a simple village NPC humanoid with colored hat."""
    skin   = (220, 180, 140, 255)
    brown  = (120,  80,  40, 255)
    dark_b = ( 80,  50,  20, 255)
    black  = (  0,   0,   0, 255)

    y = oy + bob

    # Legs
    draw.rectangle([ox+11, y+36, ox+14, y+46], fill=dark_b)
    draw.rectangle([ox+17, y+36, ox+20, y+46], fill=dark_b)

    # Body (brown tunic)
    draw.rectangle([ox+9, y+20, ox+22, y+37], fill=brown)

    # Arms (skin)
    draw.rectangle([ox+5,  y+22, ox+9,  y+34], fill=skin)
    draw.rectangle([ox+22, y+22, ox+26, y+34], fill=skin)

    # Head (skin)
    draw.rectangle([ox+10, y+8, ox+21, y+20], fill=skin)

    # Eyes
    draw.point([ox+13, y+13], fill=black)
    draw.point([ox+18, y+13], fill=black)

    # Hat (colored)
    hat = (hat_color[0], hat_color[1], hat_color[2], 255)
    draw.rectangle([ox+8,  y+4, ox+23, y+9], fill=hat)
    draw.rectangle([ox+10, y+1, ox+21, y+5], fill=hat)


def make_village_npc(hat_color):
    img = Image.new('RGBA', (64, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_village_npc_frame(draw, 0,  0, hat_color, 0)
    draw_village_npc_frame(draw, 32, 0, hat_color, 1)  # frame 2: 1px bob
    return img


def draw_shopkeeper_frame(draw, ox, oy, bob):
    """Shopkeeper: brown body with white apron, gold headband, smile."""
    skin   = (220, 180, 140, 255)
    brown  = (120,  80,  40, 255)
    dark_b = ( 80,  50,  20, 255)
    white  = (240, 240, 240, 255)
    gold   = (255, 200,   0, 255)
    black  = (  0,   0,   0, 255)

    y = oy + bob

    # Legs
    draw.rectangle([ox+11, y+36, ox+14, y+46], fill=dark_b)
    draw.rectangle([ox+17, y+36, ox+20, y+46], fill=dark_b)

    # Body (brown)
    draw.rectangle([ox+9, y+20, ox+22, y+37], fill=brown)

    # White apron over body
    draw.rectangle([ox+11, y+24, ox+20, y+37], fill=white)

    # Arms (skin)
    draw.rectangle([ox+5,  y+22, ox+9,  y+34], fill=skin)
    draw.rectangle([ox+22, y+22, ox+26, y+34], fill=skin)

    # Head (skin)
    draw.rectangle([ox+10, y+8, ox+21, y+20], fill=skin)

    # Eyes
    draw.point([ox+13, y+13], fill=black)
    draw.point([ox+18, y+13], fill=black)

    # Smile
    draw.line([ox+13, y+16, ox+18, y+16], fill=black)
    draw.point([ox+12, y+15], fill=black)
    draw.point([ox+19, y+15], fill=black)

    # Gold headband
    draw.rectangle([ox+9, y+7, ox+22, y+9], fill=gold)


def make_shopkeeper():
    img = Image.new('RGBA', (64, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_shopkeeper_frame(draw, 0,  0, 0)
    draw_shopkeeper_frame(draw, 32, 0, 1)  # frame 2: 1px bob
    return img


def draw_collectible_frame(draw, ox, oy, sparkle_offset):
    """Glowing golden orb with sparkle."""
    gold     = (255, 200,  50, 255)
    bright   = (255, 255, 150, 255)
    glow     = (255, 230, 100, 120)

    # Outer glow
    draw.ellipse([ox+2, oy+2, ox+13, oy+13], fill=glow)
    # Main orb
    draw.ellipse([ox+4, oy+4, ox+11, oy+11], fill=gold)
    # Highlight
    draw.ellipse([ox+5, oy+5, ox+7, oy+7], fill=bright)

    # Sparkle (alternates position)
    sx = ox + 1 + sparkle_offset * 10
    sy = oy + 1 + sparkle_offset * 2
    draw.point([sx, sy], fill=bright)
    draw.point([sx+1, sy], fill=bright)
    draw.point([sx, sy+1], fill=bright)


def make_collectible():
    img = Image.new('RGBA', (32, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_collectible_frame(draw, 0,  0, 0)
    draw_collectible_frame(draw, 16, 0, 1)  # frame 2: sparkle moves
    return img


def draw_gold_coin_frame(draw, ox, oy, highlight_offset):
    """Tiny gold coin with moving highlight."""
    gold   = (255, 200,  50, 255)
    bright = (255, 255, 150, 255)
    dark   = (180, 140,  20, 255)

    # Coin body
    draw.ellipse([ox+1, oy+1, ox+6, oy+6], fill=gold)
    # Edge shading
    draw.point([ox+1, oy+1], fill=dark)
    draw.point([ox+6, oy+6], fill=dark)
    # Moving highlight
    hx = ox + 2 + highlight_offset
    draw.point([hx, oy+2], fill=bright)
    draw.point([hx, oy+3], fill=bright)


def make_gold_coin():
    img = Image.new('RGBA', (16, 8), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_gold_coin_frame(draw, 0, 0, 0)
    draw_gold_coin_frame(draw, 8, 0, 2)  # frame 2: highlight shifts
    return img


def draw_target_frame(draw, ox, oy, frame):
    """Red/white bullseye target."""
    red   = (220,  40,  40, 255)
    white = (240, 240, 240, 255)

    # Outer circle (red)
    draw.ellipse([ox+1, oy+1, ox+14, oy+14], fill=red)
    # Middle ring (white)
    draw.ellipse([ox+3, oy+3, ox+12, oy+12], fill=white)
    # Inner circle (red)
    draw.ellipse([ox+5, oy+5, ox+10, oy+10], fill=red)
    # Bullseye center (white)
    draw.ellipse([ox+7, oy+7, ox+8, oy+8], fill=white)

    # Slight pulse: frame 1 has extra outer ring pixel
    if frame == 1:
        draw.point([ox+0, oy+7], fill=red)
        draw.point([ox+15, oy+7], fill=red)
        draw.point([ox+7, oy+0], fill=red)
        draw.point([ox+7, oy+15], fill=red)


def make_target():
    img = Image.new('RGBA', (32, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_target_frame(draw, 0,  0, 0)
    draw_target_frame(draw, 16, 0, 1)  # frame 2: slight pulse
    return img


def draw_lost_child_frame(draw, ox, oy, bob):
    """Small humanoid child, blue shirt, brown hair."""
    skin   = (220, 180, 140, 255)
    blue   = ( 60, 100, 200, 255)
    hair   = (100,  60,  30, 255)
    dark_b = ( 80,  50,  20, 255)
    black  = (  0,   0,   0, 255)

    y = oy + bob

    # Legs
    draw.rectangle([ox+5, y+17, ox+7, y+22], fill=dark_b)
    draw.rectangle([ox+9, y+17, ox+11, y+22], fill=dark_b)

    # Body (blue shirt)
    draw.rectangle([ox+4, y+10, ox+12, y+18], fill=blue)

    # Arms (skin)
    draw.rectangle([ox+2,  y+11, ox+4,  y+16], fill=skin)
    draw.rectangle([ox+12, y+11, ox+14, y+16], fill=skin)

    # Head (skin)
    draw.rectangle([ox+5, y+3, ox+11, y+10], fill=skin)

    # Hair (brown, on top)
    draw.rectangle([ox+4, y+1, ox+12, y+5], fill=hair)

    # Eyes
    draw.point([ox+6, y+6], fill=black)
    draw.point([ox+10, y+6], fill=black)


def make_lost_child():
    img = Image.new('RGBA', (32, 24), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw_lost_child_frame(draw, 0,  0, 0)
    draw_lost_child_frame(draw, 16, 0, 1)  # frame 2: 1px bob
    return img


if __name__ == '__main__':
    sprites = {
        'ice_wolf':      make_ice_wolf(),
        'shadow_beast':  make_shadow_beast(),
        'stone_golem':   make_stone_golem(),
        'frost_giant':   make_frost_giant(),
        'shadow_lord':   make_shadow_lord(),
        'rune_guardian': make_rune_guardian(),
        'village_npc_1': make_village_npc((60, 80, 200)),
        'village_npc_2': make_village_npc((40, 160, 60)),
        'village_npc_3': make_village_npc((200, 50, 50)),
        'shopkeeper':    make_shopkeeper(),
        'collectible':   make_collectible(),
        'gold_coin':     make_gold_coin(),
        'target':        make_target(),
        'lost_child':    make_lost_child(),
    }

    print("// Paste these into SPRITE_DATA in js/main.js\n")
    for name, img in sprites.items():
        b64 = to_base64(img)
        print(f"    {name}: '{b64}',\n")
