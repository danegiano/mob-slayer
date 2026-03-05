#!/usr/bin/env python3
"""
generate_backgrounds.py
-----------------------
Generates 4 pixel-art background PNGs (800x450) for Mob Slayer.
Uses Pillow to draw chunky pixel art with limited palettes.

Run:  python3 generate_backgrounds.py
Output goes to assets/backgrounds/
"""

import os
import random
from PIL import Image, ImageDraw

# We fix the seed so the art is reproducible — change this number to get
# different random cloud/star/flower placements.
random.seed(42)

WIDTH, HEIGHT = 800, 450
OUT_DIR = os.path.join(os.path.dirname(__file__), "assets", "backgrounds")
os.makedirs(OUT_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Helper functions — these make it easier to draw chunky pixel shapes
# ---------------------------------------------------------------------------

def fill_gradient(draw, y_start, y_end, color_top, color_bot):
    """Draw a vertical gradient between two RGB(A) colors."""
    for y in range(y_start, y_end):
        t = (y - y_start) / max(1, y_end - y_start - 1)
        r = int(color_top[0] + (color_bot[0] - color_top[0]) * t)
        g = int(color_top[1] + (color_bot[1] - color_top[1]) * t)
        b = int(color_top[2] + (color_bot[2] - color_top[2]) * t)
        draw.line([(0, y), (WIDTH - 1, y)], fill=(r, g, b, 255))


def blob(draw, cx, cy, radius, color, chunks=8):
    """Draw an irregular blobby shape made of overlapping circles."""
    for _ in range(chunks):
        ox = random.randint(-radius // 2, radius // 2)
        oy = random.randint(-radius // 3, radius // 3)
        r = random.randint(radius // 2, radius)
        draw.ellipse([cx + ox - r, cy + oy - r, cx + ox + r, cy + oy + r],
                     fill=color)


def draw_rect(draw, x, y, w, h, color):
    """Shortcut for a filled rectangle."""
    draw.rectangle([x, y, x + w - 1, y + h - 1], fill=color)


def draw_triangle(draw, x1, y1, x2, y2, x3, y3, color):
    """Draw a filled triangle."""
    draw.polygon([(x1, y1), (x2, y2), (x3, y3)], fill=color)


# ---------------------------------------------------------------------------
# 1. Village Background
# ---------------------------------------------------------------------------

def generate_village():
    print("Generating village-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Sky gradient ---
    fill_gradient(draw, 0, 250, (0x87, 0xCE, 0xEB), (0xB0, 0xE0, 0xFF))

    # --- Clouds ---
    cloud_positions = [(120, 50), (350, 70), (600, 40), (750, 80)]
    for cx, cy in cloud_positions:
        for _ in range(6):
            ox = random.randint(-20, 20)
            oy = random.randint(-8, 8)
            r = random.randint(10, 22)
            draw.ellipse([cx + ox - r, cy + oy - r, cx + ox + r, cy + oy + r],
                         fill=(255, 255, 255, 220))

    # --- Mountains ---
    # Mountain 1 — big one in the middle
    draw.polygon([(100, 280), (300, 170), (500, 280)], fill=(0x6B, 0x7F, 0x98))
    # Mountain 2 — overlapping to the right
    draw.polygon([(350, 280), (550, 180), (720, 280)], fill=(0x7B, 0x8F, 0xA8))
    # Mountain 3 — small one on the left
    draw.polygon([(0, 280), (150, 200), (280, 280)], fill=(0x7B, 0x8F, 0xA8))

    # Fill below mountains to horizon so there's no gap
    draw.rectangle([0, 280, WIDTH, HEIGHT], fill=(0x4A, 0x8A, 0x2E))

    # --- Ground layers ---
    # Darker green underlayer
    draw.rectangle([0, 400, WIDTH, HEIGHT], fill=(0x3A, 0x6A, 0x1E))

    # Bright grass top with irregular edge
    for x in range(0, WIDTH, 3):
        jitter = random.randint(-5, 5)
        grass_top = 395 + jitter
        draw.rectangle([x, grass_top, x + 2, 410], fill=(0x4A, 0x8A, 0x2E))

    # Dirt path
    draw.rectangle([0, 415, WIDTH, 430], fill=(0x8B, 0x73, 0x55))

    # Bottom dirt
    draw.rectangle([0, 430, WIDTH, HEIGHT], fill=(0x6B, 0x5B, 0x3A))

    # --- Small flowers in the grass ---
    flower_colors = [(0xCC, 0x44, 0x44), (0xFF, 0xCC, 0x44), (0x99, 0x44, 0xCC)]
    for _ in range(30):
        fx = random.randint(0, WIDTH)
        fy = random.randint(385, 410)
        fc = random.choice(flower_colors)
        size = random.choice([1, 2])
        draw.rectangle([fx, fy, fx + size, fy + size], fill=fc)

    # --- Fence posts along path ---
    fence_color = (0x6B, 0x4B, 0x2B)
    fence_xs = [80, 200, 340, 500, 650]
    for fx in fence_xs:
        # Vertical post
        draw_rect(draw, fx, 390, 4, 28, fence_color)
    # Horizontal rail connecting them
    draw.rectangle([fence_xs[0], 398, fence_xs[-1] + 4, 401], fill=fence_color)
    draw.rectangle([fence_xs[0], 408, fence_xs[-1] + 4, 411], fill=fence_color)

    # --- House 1 (left) ---
    hx, hy = 150, 310
    hw, hh = 70, 55
    # Walls
    draw_rect(draw, hx, hy, hw, hh, (0x8B, 0x6B, 0x3D))
    # Roof — peaked triangle
    draw_triangle(draw, hx - 8, hy, hx + hw // 2, hy - 30, hx + hw + 8, hy,
                  (0xCC, 0x44, 0x44))
    # Door
    draw_rect(draw, hx + hw // 2 - 6, hy + hh - 22, 12, 22, (0x5C, 0x3A, 0x1A))
    # Window
    draw_rect(draw, hx + 10, hy + 12, 10, 10, (0xFF, 0xE0, 0x66))
    draw_rect(draw, hx + 14, hy + 12, 2, 10, (0x8B, 0x6B, 0x3D))  # cross bar v
    draw_rect(draw, hx + 10, hy + 16, 10, 2, (0x8B, 0x6B, 0x3D))  # cross bar h

    # --- House 2 (right) ---
    hx2, hy2 = 500, 305
    hw2, hh2 = 80, 60
    draw_rect(draw, hx2, hy2, hw2, hh2, (0x9B, 0x7B, 0x4D))
    draw_triangle(draw, hx2 - 8, hy2, hx2 + hw2 // 2, hy2 - 35,
                  hx2 + hw2 + 8, hy2, (0xBB, 0x55, 0x55))
    draw_rect(draw, hx2 + hw2 // 2 - 7, hy2 + hh2 - 24, 14, 24,
              (0x5C, 0x3A, 0x1A))
    draw_rect(draw, hx2 + 12, hy2 + 14, 10, 10, (0xFF, 0xE0, 0x66))
    draw_rect(draw, hx2 + 16, hy2 + 14, 2, 10, (0x9B, 0x7B, 0x4D))
    draw_rect(draw, hx2 + 12, hy2 + 18, 10, 2, (0x9B, 0x7B, 0x4D))
    # Second window on house 2
    draw_rect(draw, hx2 + hw2 - 22, hy2 + 14, 10, 10, (0xFF, 0xE0, 0x66))
    draw_rect(draw, hx2 + hw2 - 18, hy2 + 14, 2, 10, (0x9B, 0x7B, 0x4D))
    draw_rect(draw, hx2 + hw2 - 22, hy2 + 18, 10, 2, (0x9B, 0x7B, 0x4D))

    # --- Blacksmith (center) ---
    bx, by = 340, 320
    # Wooden posts
    post_color = (0x7B, 0x5B, 0x2D)
    draw_rect(draw, bx, by, 6, 50, post_color)
    draw_rect(draw, bx + 70, by, 6, 50, post_color)
    # Flat roof / awning
    draw_rect(draw, bx - 6, by - 4, 88, 8, post_color)
    # Anvil — dark gray trapezoid shape
    draw.polygon([(bx + 22, by + 46), (bx + 20, by + 35),
                  (bx + 56, by + 35), (bx + 54, by + 46)],
                 fill=(0x3A, 0x3A, 0x3A))
    # Anvil top (wider)
    draw_rect(draw, bx + 16, by + 30, 44, 6, (0x4A, 0x4A, 0x4A))
    # Forge fire glow
    for _ in range(12):
        ox = random.randint(-6, 6)
        oy = random.randint(-6, 2)
        r = random.randint(2, 5)
        c = random.choice([(0xFF, 0x66, 0x00, 160), (0xFF, 0x33, 0x00, 140),
                           (0xFF, 0xAA, 0x00, 120)])
        draw.ellipse([bx + 8 + ox - r, by + 38 + oy - r,
                      bx + 8 + ox + r, by + 38 + oy + r], fill=c)

    # --- Arrow hint at right edge ---
    ax, ay = WIDTH - 25, HEIGHT // 2
    draw.polygon([(ax, ay - 10), (ax + 14, ay), (ax, ay + 10)],
                 fill=(255, 255, 255, 180))

    img.save(os.path.join(OUT_DIR, "village-bg.png"))
    print("  -> village-bg.png saved!")


# ---------------------------------------------------------------------------
# 2. Woods Day Background
# ---------------------------------------------------------------------------

def generate_woods_day():
    print("Generating woods-day-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Sky ---
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(0x6B, 0x9B, 0x6B))

    # --- Background trees (lighter, smaller) ---
    bg_trees = [(80, 200), (250, 210), (450, 195), (650, 205), (780, 215)]
    for tx, ty in bg_trees:
        trunk_w, trunk_h = 8, 80
        draw_rect(draw, tx - trunk_w // 2, ty, trunk_w, trunk_h,
                  (0x7A, 0x5A, 0x3A))
        blob(draw, tx, ty - 15, 28, (0x3D, 0x8B, 0x2E), chunks=7)

    # --- Ground base ---
    draw.rectangle([0, 370, WIDTH, HEIGHT], fill=(0x3A, 0x7A, 0x2E))

    # --- Dirt path ---
    draw.rectangle([0, 390, WIDTH, 420], fill=(0x6B, 0x5B, 0x3A))
    # Path highlights
    for x in range(0, WIDTH, 20):
        pw = random.randint(4, 10)
        draw.rectangle([x, 395, x + pw, 398],
                       fill=(0x7B, 0x6B, 0x4A))

    # Grass below path
    draw.rectangle([0, 420, WIDTH, HEIGHT], fill=(0x3A, 0x7A, 0x2E))
    # Grass highlights
    for x in range(0, WIDTH, 6):
        gy = random.randint(368, 388)
        draw.rectangle([x, gy, x + 3, gy + 4], fill=(0x4A, 0x9A, 0x3E))

    # --- Foreground trees (darker, bigger) ---
    fg_trees = [(50, 180), (200, 160), (380, 170), (550, 155), (700, 175),
                (150, 190), (500, 185)]
    for tx, ty in fg_trees:
        trunk_w = random.randint(10, 14)
        trunk_h = random.randint(100, 160)
        draw_rect(draw, tx - trunk_w // 2, ty, trunk_w, trunk_h,
                  (0x5A, 0x3A, 0x1A))
        # Canopy — overlapping dark green blobs
        blob(draw, tx, ty - 10, 38, (0x2D, 0x6B, 0x1E), chunks=9)
        blob(draw, tx, ty - 20, 30, (0x1A, 0x5A, 0x0E), chunks=6)

    # --- Undergrowth bushes ---
    bush_xs = [30, 130, 280, 420, 580, 720, 770]
    for bx in bush_xs:
        by = random.randint(365, 380)
        for _ in range(4):
            ox = random.randint(-12, 12)
            oy = random.randint(-6, 4)
            r = random.randint(6, 12)
            draw.ellipse([bx + ox - r, by + oy - r, bx + ox + r, by + oy + r],
                         fill=(0x1A, 0x4A, 0x0E))

    # --- Mushrooms ---
    mushroom_spots = [(160, 385), (410, 388), (620, 382)]
    for mx, my in mushroom_spots:
        # Stem
        draw_rect(draw, mx, my, 3, 5, (0xDD, 0xDD, 0xBB))
        # Red cap
        draw.ellipse([mx - 3, my - 4, mx + 5, my + 1], fill=(0xCC, 0x22, 0x22))
        # White dots on cap
        draw.rectangle([mx - 1, my - 3, mx, my - 2], fill=(255, 255, 255))
        draw.rectangle([mx + 2, my - 2, mx + 3, my - 1], fill=(255, 255, 255))

    # --- Sunbeams (semi-transparent diagonal strips) ---
    sunbeam = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    sb_draw = ImageDraw.Draw(sunbeam)
    beams = [(180, -20, 220, 350), (400, -10, 440, 340), (620, -30, 660, 330)]
    for x1, y1, x2, y2 in beams:
        sb_draw.polygon([(x1, y1), (x2, y1), (x2 + 40, y2), (x1 + 40, y2)],
                        fill=(0xFF, 0xFF, 0x88, 35))
    img = Image.alpha_composite(img, sunbeam)

    img.save(os.path.join(OUT_DIR, "woods-day-bg.png"))
    print("  -> woods-day-bg.png saved!")


# ---------------------------------------------------------------------------
# 3. Woods Night Background
# ---------------------------------------------------------------------------

def generate_woods_night():
    print("Generating woods-night-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Dark sky ---
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(0x0A, 0x0A, 0x2A))

    # --- Stars ---
    for _ in range(25):
        sx = random.randint(0, WIDTH)
        sy = random.randint(0, 200)
        sc = random.choice([(255, 255, 255), (200, 200, 255), (220, 220, 255)])
        size = random.choice([1, 1, 2])
        draw.rectangle([sx, sy, sx + size, sy + size], fill=sc)

    # --- Moon (crescent) ---
    # Draw a full circle then cover part of it with the sky color
    mx, my = 700, 40
    draw.ellipse([mx - 12, my - 12, mx + 12, my + 12],
                 fill=(0xEE, 0xEE, 0xCC))
    draw.ellipse([mx - 4, my - 14, mx + 16, my + 10],
                 fill=(0x0A, 0x0A, 0x2A))

    # --- Background trees (very dark silhouettes) ---
    bg_trees = [(80, 200), (250, 210), (450, 195), (650, 205), (780, 215)]
    for tx, ty in bg_trees:
        draw_rect(draw, tx - 5, ty, 10, 90, (0x0A, 0x08, 0x08))
        blob(draw, tx, ty - 10, 30, (0x0A, 0x1A, 0x0A), chunks=7)

    # --- Ground ---
    draw.rectangle([0, 370, WIDTH, HEIGHT], fill=(0x1A, 0x1A, 0x0A))

    # Dead brownish grass
    for x in range(0, WIDTH, 5):
        gy = random.randint(365, 378)
        draw.rectangle([x, gy, x + 3, gy + 5], fill=(0x2A, 0x2A, 0x1A))

    # --- Foreground trees (dark silhouettes) ---
    fg_trees = [(50, 170), (200, 150), (380, 160), (550, 145), (700, 165),
                (150, 180), (500, 175)]
    for tx, ty in fg_trees:
        trunk_w = random.randint(10, 16)
        trunk_h = random.randint(110, 170)
        draw_rect(draw, tx - trunk_w // 2, ty, trunk_w, trunk_h,
                  (0x1A, 0x0A, 0x0A))
        blob(draw, tx, ty - 10, 40, (0x0A, 0x1A, 0x0A), chunks=9)
        blob(draw, tx, ty - 25, 32, (0x0A, 0x2A, 0x0A), chunks=6)

    # --- Undergrowth bushes ---
    bush_xs = [30, 130, 280, 420, 580, 720, 770]
    for bx in bush_xs:
        by = random.randint(360, 378)
        for _ in range(4):
            ox = random.randint(-12, 12)
            oy = random.randint(-6, 4)
            r = random.randint(6, 12)
            draw.ellipse([bx + ox - r, by + oy - r, bx + ox + r, by + oy + r],
                         fill=(0x08, 0x14, 0x08))

    # --- Fog (semi-transparent white strips) ---
    fog = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    fog_draw = ImageDraw.Draw(fog)
    for fy in range(340, 400, 18):
        alpha = random.randint(15, 25)
        fog_draw.rectangle([0, fy, WIDTH, fy + 10],
                           fill=(255, 255, 255, alpha))
    img = Image.alpha_composite(img, fog)

    # --- Creepy eyes ---
    # We draw on the composited image
    draw = ImageDraw.Draw(img)
    eye_spots = [
        (145, 362, (0xFF, 0x00, 0x00)),   # red eyes behind bush
        (430, 355, (0xFF, 0xFF, 0x00)),    # yellow eyes
        (590, 368, (0xFF, 0x00, 0x00)),    # more red eyes
        (720, 345, (0xFF, 0xFF, 0x00)),    # yellow eyes up higher
    ]
    for ex, ey, ec in eye_spots:
        draw.rectangle([ex, ey, ex + 2, ey + 2], fill=ec)
        draw.rectangle([ex + 7, ey, ex + 9, ey + 2], fill=ec)

    img.save(os.path.join(OUT_DIR, "woods-night-bg.png"))
    print("  -> woods-night-bg.png saved!")


# ---------------------------------------------------------------------------
# 4. Boss Arena Background
# ---------------------------------------------------------------------------

def generate_boss_arena():
    print("Generating boss-arena-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Stormy sky gradient (fill all the way to the floor line) ---
    fill_gradient(draw, 0, 350, (0x2A, 0x0A, 0x0A), (0x1A, 0x0A, 0x0A))

    # --- Lightning bolts ---
    def draw_lightning(draw, sx, sy):
        """Draw a jagged lightning bolt going downward."""
        x, y = sx, sy
        color = (0xFF, 0xFF, 0xDD)
        glow = (0xFF, 0xFF, 0x88, 80)
        for _ in range(6):
            nx = x + random.randint(-15, 15)
            ny = y + random.randint(15, 30)
            draw.line([(x, y), (nx, ny)], fill=color, width=2)
            # glow around bolt
            draw.line([(x - 1, y), (nx - 1, ny)], fill=glow, width=4)
            x, y = nx, ny

    draw_lightning(draw, 200, 10)
    draw_lightning(draw, 550, 20)
    draw_lightning(draw, 700, 5)

    # --- Arena stone walls on the sides ---
    for wy in range(0, HEIGHT, 16):
        for wx_offset in range(0, 50, 16):
            shade = random.choice([(0x3A, 0x3A, 0x3A), (0x4A, 0x4A, 0x4A),
                                   (0x33, 0x33, 0x33)])
            # Left wall
            draw_rect(draw, wx_offset, wy, 15, 15, shade)
            draw_rect(draw, wx_offset, wy, 15, 1, (0x55, 0x55, 0x55))  # top edge
            # Right wall
            draw_rect(draw, WIDTH - 50 + wx_offset, wy, 15, 15, shade)
            draw_rect(draw, WIDTH - 50 + wx_offset, wy, 15, 1,
                      (0x55, 0x55, 0x55))

    # --- Broken stone pillars ---
    # Left pillar
    px, py = 100, 160
    draw_rect(draw, px, py, 22, 200, (0x5A, 0x5A, 0x5A))
    # Broken jagged top
    draw.polygon([(px, py), (px + 5, py - 12), (px + 10, py - 5),
                  (px + 16, py - 18), (px + 22, py - 8), (px + 22, py)],
                 fill=(0x5A, 0x5A, 0x5A))
    # Pillar shading
    draw_rect(draw, px + 18, py, 4, 200, (0x4A, 0x4A, 0x4A))

    # Right pillar
    px2, py2 = 670, 180
    draw_rect(draw, px2, py2, 22, 180, (0x5A, 0x5A, 0x5A))
    draw.polygon([(px2, py2), (px2 + 4, py2 - 10), (px2 + 12, py2 - 20),
                  (px2 + 18, py2 - 6), (px2 + 22, py2 - 14), (px2 + 22, py2)],
                 fill=(0x5A, 0x5A, 0x5A))
    draw_rect(draw, px2 + 18, py2, 4, 180, (0x4A, 0x4A, 0x4A))

    # --- Stone floor with flagstone pattern ---
    floor_y = 350
    draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(0x2A, 0x2A, 0x2A))

    # Draw stone tile cracks
    for ty in range(floor_y, HEIGHT, 20):
        for tx in range(0, WIDTH, 30):
            offset = 15 if ((ty - floor_y) // 20) % 2 == 1 else 0
            bx = tx + offset
            # Horizontal crack line
            draw.line([(bx, ty), (bx + 30, ty)], fill=(0x3A, 0x3A, 0x3A), width=1)
            # Vertical crack line
            draw.line([(bx, ty), (bx, ty + 20)], fill=(0x3A, 0x3A, 0x3A), width=1)

    # Slightly lighter floor near center for contrast
    draw.rectangle([80, floor_y + 5, WIDTH - 80, floor_y + 8],
                   fill=(0x35, 0x35, 0x35))

    # --- Ember / fire particles floating around ---
    embers = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    em_draw = ImageDraw.Draw(embers)
    for _ in range(30):
        ex = random.randint(60, WIDTH - 60)
        ey = random.randint(100, HEIGHT - 40)
        ec = random.choice([
            (0xFF, 0x66, 0x00, 200),
            (0xFF, 0x33, 0x00, 180),
            (0xFF, 0xAA, 0x00, 160),
            (0xFF, 0x22, 0x00, 140),
        ])
        size = random.choice([1, 2, 2, 3])
        em_draw.rectangle([ex, ey, ex + size, ey + size], fill=ec)
    img = Image.alpha_composite(img, embers)

    img.save(os.path.join(OUT_DIR, "boss-arena-bg.png"))
    print("  -> boss-arena-bg.png saved!")


# ---------------------------------------------------------------------------
# 5. Tundra Background
# ---------------------------------------------------------------------------

def generate_tundra():
    print("Generating tundra-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Sky gradient: light blue at top fading to white-ish ---
    fill_gradient(draw, 0, 370, (0xAA, 0xCC, 0xEE), (0xE8, 0xF4, 0xFF))

    # --- Snow-covered ground ---
    draw.rectangle([0, 370, WIDTH, HEIGHT], fill=(0xD0, 0xE8, 0xF8))

    # Jagged snow edge at horizon
    for x in range(0, WIDTH, 4):
        jitter = random.randint(-6, 6)
        snow_top = 370 + jitter
        draw.rectangle([x, snow_top, x + 3, 380], fill=(0xE8, 0xF4, 0xFF))

    # --- Dirt/ice path area ---
    draw.rectangle([0, 395, WIDTH, 422], fill=(0xB8, 0xCC, 0xDD))
    # Path ice texture streaks
    for x in range(0, WIDTH, 18):
        pw = random.randint(5, 14)
        draw.rectangle([x, 400, x + pw, 402], fill=(0xC8, 0xDC, 0xEE))

    # --- Bottom darker snow/ice ---
    draw.rectangle([0, 422, WIDTH, HEIGHT], fill=(0xA8, 0xBC, 0xCC))

    # --- Dead frozen trees ---
    tree_positions = [(80, 200), (200, 210), (380, 195), (560, 205),
                      (680, 200), (760, 215)]
    for tx, ty in tree_positions:
        trunk_w = random.randint(6, 10)
        trunk_h = random.randint(80, 130)
        # Trunk (white-gray for snow-covered)
        draw_rect(draw, tx - trunk_w // 2, ty, trunk_w, trunk_h,
                  (0xCC, 0xCC, 0xDD))
        # Bare branches — short horizontal lines sticking out
        for bh in range(ty + 20, ty + trunk_h - 10, 22):
            blen = random.randint(14, 28)
            draw.line([(tx - blen, bh), (tx, bh)], fill=(0xBB, 0xBB, 0xCC), width=2)
            draw.line([(tx, bh), (tx + blen, bh)], fill=(0xBB, 0xBB, 0xCC), width=2)
            # Small sub-branches
            draw.line([(tx - blen, bh), (tx - blen - 8, bh - 8)],
                      fill=(0xBB, 0xBB, 0xCC), width=1)
            draw.line([(tx + blen, bh), (tx + blen + 8, bh - 8)],
                      fill=(0xBB, 0xBB, 0xCC), width=1)
        # Icicles hanging from lowest branch
        icicle_y = ty + trunk_h - 30
        for ix in range(tx - 20, tx + 22, 7):
            ilen = random.randint(8, 18)
            draw_triangle(draw, ix, icicle_y, ix + 3, icicle_y, ix + 1,
                          icicle_y + ilen, (0xCC, 0xEE, 0xFF))

    # --- Falling snow particles ---
    for _ in range(120):
        sx = random.randint(0, WIDTH)
        sy = random.randint(0, HEIGHT - 40)
        size = random.choice([1, 1, 2, 2, 3])
        alpha = random.randint(160, 240)
        draw.ellipse([sx, sy, sx + size, sy + size], fill=(255, 255, 255, alpha))

    img.save(os.path.join(OUT_DIR, "tundra-bg.png"))
    print("  -> tundra-bg.png saved!")


# ---------------------------------------------------------------------------
# 6. Ice Fortress Background
# ---------------------------------------------------------------------------

def generate_ice_fortress():
    print("Generating ice-fortress-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Dark blue interior background ---
    fill_gradient(draw, 0, HEIGHT, (0x08, 0x10, 0x2A), (0x05, 0x0A, 0x1E))

    # --- Ice/stone walls on left and right (dark blue-gray bricks) ---
    wall_w = 55
    for wy in range(0, HEIGHT, 16):
        for wx_offset in range(0, wall_w, 16):
            shade = random.choice([
                (0x1A, 0x2A, 0x44), (0x22, 0x33, 0x55), (0x18, 0x26, 0x3E)
            ])
            # Left wall
            draw_rect(draw, wx_offset, wy, 15, 15, shade)
            draw_rect(draw, wx_offset, wy, 15, 1, (0x30, 0x44, 0x66))
            # Right wall
            draw_rect(draw, WIDTH - wall_w + wx_offset, wy, 15, 15, shade)
            draw_rect(draw, WIDTH - wall_w + wx_offset, wy, 15, 1,
                      (0x30, 0x44, 0x66))

    # --- Icicles hanging from ceiling ---
    for ix in range(30, WIDTH - 30, 28):
        ilen = random.randint(30, 80)
        iw = random.randint(6, 14)
        # Icicle body (triangle pointing down)
        draw_triangle(draw, ix, 0, ix + iw, 0, ix + iw // 2, ilen,
                      (0xAA, 0xCC, 0xEE))
        # Inner highlight
        draw_triangle(draw, ix + 2, 0, ix + iw - 2, 0, ix + iw // 2, ilen - 8,
                      (0xCC, 0xEE, 0xFF))

    # --- Blue torch flames on walls ---
    torch_positions = [(wall_w + 10, 120), (wall_w + 10, 260),
                       (WIDTH - wall_w - 30, 120), (WIDTH - wall_w - 30, 260)]
    for tx, ty in torch_positions:
        # Torch bracket (small rectangle)
        draw_rect(draw, tx, ty, 8, 14, (0x44, 0x55, 0x77))
        # Blue flame glow (layered ellipses)
        draw.ellipse([tx - 8, ty - 20, tx + 16, ty + 4],
                     fill=(0x33, 0x66, 0xCC, 100))
        draw.ellipse([tx - 4, ty - 16, tx + 12, ty + 2],
                     fill=(0x66, 0xAA, 0xFF, 160))
        draw.ellipse([tx - 1, ty - 10, tx + 9, ty],
                     fill=(0xAA, 0xDD, 0xFF, 200))
        draw.ellipse([tx + 2, ty - 6, tx + 6, ty - 1],
                     fill=(255, 255, 255, 220))

    # --- Frozen floor ---
    floor_y = 350
    draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(0x18, 0x28, 0x44))

    # Ice crack lines on floor
    for ty in range(floor_y, HEIGHT, 20):
        for tx in range(0, WIDTH, 30):
            offset = 15 if ((ty - floor_y) // 20) % 2 == 1 else 0
            bx = tx + offset
            draw.line([(bx, ty), (bx + 30, ty)], fill=(0x28, 0x40, 0x66), width=1)
            draw.line([(bx, ty), (bx, ty + 20)], fill=(0x28, 0x40, 0x66), width=1)

    # Icy reflective highlights on floor
    for _ in range(20):
        hx = random.randint(60, WIDTH - 60)
        hy = random.randint(floor_y + 5, HEIGHT - 10)
        hw = random.randint(10, 40)
        draw.rectangle([hx, hy, hx + hw, hy + 2], fill=(0x40, 0x60, 0x99, 80))

    img.save(os.path.join(OUT_DIR, "ice-fortress-bg.png"))
    print("  -> ice-fortress-bg.png saved!")


# ---------------------------------------------------------------------------
# 7. Frost Giant Arena Background
# ---------------------------------------------------------------------------

def generate_frost_giant_arena():
    print("Generating frost-giant-arena-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Dark icy cavern gradient ---
    fill_gradient(draw, 0, 360, (0x02, 0x06, 0x18), (0x06, 0x10, 0x2A))

    # --- Frozen stalactites from ceiling ---
    for ix in range(0, WIDTH, 22):
        ilen = random.randint(20, 100)
        iw = random.randint(8, 20)
        draw_triangle(draw, ix, 0, ix + iw, 0, ix + iw // 2, ilen,
                      (0x44, 0x66, 0x99))
        # Inner lighter highlight
        draw_triangle(draw, ix + 2, 0, ix + iw - 2, 0, ix + iw // 2, ilen - 10,
                      (0x88, 0xAA, 0xCC))

    # --- Ice pillars on sides ---
    pillar_xs = [80, 160, WIDTH - 160, WIDTH - 80]
    for px in pillar_xs:
        pw = 28
        draw_rect(draw, px - pw // 2, 50, pw, 310, (0x22, 0x44, 0x77))
        # Pillar highlight
        draw_rect(draw, px - pw // 2 + 4, 50, 6, 310, (0x44, 0x66, 0x99))
        # Broken jagged top
        draw.polygon([(px - pw // 2, 50), (px - 4, 35), (px, 45),
                      (px + 4, 30), (px + pw // 2, 50)],
                     fill=(0x33, 0x55, 0x88))

    # --- Icy blue floor ---
    floor_y = 360
    draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(0x10, 0x20, 0x38))

    # Reflective highlights on floor
    for _ in range(30):
        hx = random.randint(0, WIDTH - 20)
        hy = random.randint(floor_y + 2, HEIGHT - 8)
        hw = random.randint(15, 60)
        draw.rectangle([hx, hy, hx + hw, hy + 3], fill=(0x30, 0x55, 0x88, 70))

    # Floor grid lines
    for ty in range(floor_y, HEIGHT, 18):
        for tx in range(0, WIDTH, 25):
            offset = 12 if ((ty - floor_y) // 18) % 2 == 1 else 0
            bx = tx + offset
            draw.line([(bx, ty), (bx + 25, ty)], fill=(0x20, 0x38, 0x60), width=1)
            draw.line([(bx, ty), (bx, ty + 18)], fill=(0x20, 0x38, 0x60), width=1)

    # --- Blizzard particles ---
    blizzard = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    bl_draw = ImageDraw.Draw(blizzard)
    for _ in range(80):
        bx = random.randint(0, WIDTH)
        by = random.randint(0, HEIGHT - 40)
        blen = random.randint(4, 12)
        alpha = random.randint(80, 180)
        # Horizontal streak
        bl_draw.line([(bx, by), (bx + blen, by + 2)],
                     fill=(255, 255, 255, alpha), width=1)
    for _ in range(40):
        bx = random.randint(0, WIDTH)
        by = random.randint(0, HEIGHT - 40)
        size = random.choice([1, 2])
        bl_draw.rectangle([bx, by, bx + size, by + size],
                          fill=(255, 255, 255, 160))
    img = Image.alpha_composite(img, blizzard)

    img.save(os.path.join(OUT_DIR, "frost-giant-arena-bg.png"))
    print("  -> frost-giant-arena-bg.png saved!")


# ---------------------------------------------------------------------------
# 8. Dark Forest Background
# ---------------------------------------------------------------------------

def generate_dark_forest():
    print("Generating dark-forest-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Very dark green/black background ---
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(0x04, 0x08, 0x04))

    # Slight gradient — a little lighter near the horizon
    fill_gradient(draw, 150, 380, (0x06, 0x10, 0x06), (0x0C, 0x18, 0x0C))

    # --- Background trees (faint dark silhouettes) ---
    bg_trees = [(70, 200), (220, 210), (430, 195), (610, 205), (760, 210)]
    for tx, ty in bg_trees:
        draw_rect(draw, tx - 6, ty, 12, 90, (0x08, 0x06, 0x06))
        blob(draw, tx, ty - 10, 32, (0x06, 0x12, 0x06), chunks=7)

    # --- Dark green/brown ground ---
    draw.rectangle([0, 375, WIDTH, HEIGHT], fill=(0x08, 0x10, 0x06))
    draw.rectangle([0, 420, WIDTH, HEIGHT], fill=(0x10, 0x0C, 0x06))

    # Ground texture
    for x in range(0, WIDTH, 5):
        gy = random.randint(370, 384)
        draw.rectangle([x, gy, x + 3, gy + 4], fill=(0x0C, 0x16, 0x08))

    # --- Foreground gnarled trees ---
    fg_trees = [(50, 160), (190, 150), (360, 155), (530, 145), (690, 165),
                (140, 175), (490, 170)]
    for tx, ty in fg_trees:
        trunk_w = random.randint(12, 18)
        trunk_h = random.randint(120, 175)
        # Very dark brown/black trunk
        draw_rect(draw, tx - trunk_w // 2, ty, trunk_w, trunk_h,
                  (0x18, 0x0C, 0x04))
        # Dark gnarled canopy
        blob(draw, tx, ty - 10, 42, (0x08, 0x18, 0x06), chunks=10)
        blob(draw, tx, ty - 25, 34, (0x06, 0x12, 0x04), chunks=7)
        # Gnarled branches
        draw.line([(tx, ty + 30), (tx - 30, ty + 15)],
                  fill=(0x14, 0x0A, 0x02), width=3)
        draw.line([(tx, ty + 50), (tx + 28, ty + 35)],
                  fill=(0x14, 0x0A, 0x02), width=3)

    # --- Glowing mushrooms ---
    for _ in range(35):
        mx = random.randint(20, WIDTH - 20)
        my = random.randint(372, 400)
        mc = random.choice([
            (0x00, 0xCC, 0xAA, 200),  # cyan-green
            (0x44, 0xFF, 0x88, 180),  # bright green
            (0x00, 0xFF, 0xCC, 160),  # teal
        ])
        size = random.choice([2, 2, 3])
        draw.ellipse([mx, my, mx + size, my + size], fill=mc)

    # --- Purple/green fog strips ---
    fog = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    fog_draw = ImageDraw.Draw(fog)
    fog_strips = [
        (330, 12, (0x44, 0x00, 0x44)),
        (348, 10, (0x00, 0x22, 0x11)),
        (365, 14, (0x33, 0x00, 0x33)),
        (385, 10, (0x00, 0x1A, 0x0A)),
    ]
    for fy, alpha, fc in fog_strips:
        fog_draw.rectangle([0, fy, WIDTH, fy + 12], fill=(fc[0], fc[1], fc[2], alpha))
    img = Image.alpha_composite(img, fog)

    img.save(os.path.join(OUT_DIR, "dark-forest-bg.png"))
    print("  -> dark-forest-bg.png saved!")


# ---------------------------------------------------------------------------
# 9. Shadow Keep Background
# ---------------------------------------------------------------------------

def generate_shadow_keep():
    print("Generating shadow-keep-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Near-black interior ---
    fill_gradient(draw, 0, HEIGHT, (0x06, 0x04, 0x08), (0x0A, 0x06, 0x0C))

    # --- Twisted wood and stone walls ---
    wall_w = 60
    for wy in range(0, HEIGHT, 18):
        for wx_offset in range(0, wall_w, 18):
            # Alternate wood and stone look
            if (wy // 18 + wx_offset // 18) % 3 == 0:
                shade = random.choice([(0x22, 0x14, 0x0C), (0x1C, 0x10, 0x08)])
            else:
                shade = random.choice([(0x18, 0x16, 0x1C), (0x20, 0x1A, 0x22)])
            # Left wall
            draw_rect(draw, wx_offset, wy, 17, 17, shade)
            draw_rect(draw, wx_offset, wy, 17, 1, (0x30, 0x24, 0x2C))
            # Right wall
            draw_rect(draw, WIDTH - wall_w + wx_offset, wy, 17, 17, shade)
            draw_rect(draw, WIDTH - wall_w + wx_offset, wy, 17, 1,
                      (0x30, 0x24, 0x2C))

    # --- Purple torch flames ---
    torch_positions = [(wall_w + 12, 110), (wall_w + 12, 270),
                       (WIDTH - wall_w - 32, 110), (WIDTH - wall_w - 32, 270)]
    for tx, ty in torch_positions:
        # Bracket
        draw_rect(draw, tx, ty, 8, 14, (0x33, 0x22, 0x44))
        # Purple glow layers
        draw.ellipse([tx - 10, ty - 22, tx + 18, ty + 5],
                     fill=(0x44, 0x00, 0x66, 90))
        draw.ellipse([tx - 5, ty - 17, tx + 13, ty + 2],
                     fill=(0x77, 0x11, 0xAA, 150))
        draw.ellipse([tx - 1, ty - 11, tx + 9, ty],
                     fill=(0xAA, 0x44, 0xDD, 200))
        draw.ellipse([tx + 2, ty - 7, tx + 6, ty - 1],
                     fill=(0xDD, 0xAA, 0xFF, 230))

    # --- Dark stone floor ---
    floor_y = 355
    draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(0x10, 0x0C, 0x14))

    for ty in range(floor_y, HEIGHT, 22):
        for tx in range(0, WIDTH, 32):
            offset = 16 if ((ty - floor_y) // 22) % 2 == 1 else 0
            bx = tx + offset
            draw.line([(bx, ty), (bx + 32, ty)], fill=(0x1C, 0x16, 0x22), width=1)
            draw.line([(bx, ty), (bx, ty + 22)], fill=(0x1C, 0x16, 0x22), width=1)

    # --- Shadow wisps (semi-transparent floating shapes) ---
    wisps = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    wisp_draw = ImageDraw.Draw(wisps)
    wisp_positions = [(200, 180), (400, 140), (580, 200), (300, 300), (500, 280)]
    for wx, wy in wisp_positions:
        wr = random.randint(18, 36)
        alpha = random.randint(25, 55)
        wisp_draw.ellipse([wx - wr, wy - wr // 2, wx + wr, wy + wr // 2],
                          fill=(0x55, 0x00, 0x77, alpha))
        # Smaller brighter core
        wisp_draw.ellipse([wx - wr // 2, wy - wr // 4, wx + wr // 2, wy + wr // 4],
                          fill=(0x88, 0x22, 0xAA, 40))
    img = Image.alpha_composite(img, wisps)

    img.save(os.path.join(OUT_DIR, "shadow-keep-bg.png"))
    print("  -> shadow-keep-bg.png saved!")


# ---------------------------------------------------------------------------
# 10. Shadow Lord Arena Background
# ---------------------------------------------------------------------------

def generate_shadow_lord_arena():
    print("Generating shadow-lord-arena-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Almost black with purple gradient ---
    fill_gradient(draw, 0, HEIGHT, (0x06, 0x02, 0x0E), (0x10, 0x04, 0x18))

    # --- Ominous purple glow from center ---
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for radius in range(200, 10, -20):
        alpha = max(0, int(30 * (1 - radius / 200)))
        glow_draw.ellipse([WIDTH // 2 - radius, HEIGHT // 2 - radius // 2,
                           WIDTH // 2 + radius, HEIGHT // 2 + radius // 2],
                          fill=(0x66, 0x00, 0x99, alpha))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # --- Dark pillars on sides ---
    pillar_data = [(70, 100), (160, 130), (WIDTH - 90, 100), (WIDTH - 180, 130)]
    for px, py in pillar_data:
        pw = 24
        draw_rect(draw, px - pw // 2, py, pw, 280, (0x18, 0x08, 0x22))
        draw_rect(draw, px - pw // 2 + 4, py, 5, 280, (0x24, 0x0C, 0x30))
        # Jagged broken top
        draw.polygon([(px - pw // 2, py), (px - 3, py - 14), (px + 3, py - 6),
                      (px + 8, py - 18), (px + pw // 2, py)],
                     fill=(0x22, 0x0A, 0x2E))

    # --- Cracked dark floor ---
    floor_y = 355
    draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(0x0C, 0x04, 0x14))

    for ty in range(floor_y, HEIGHT, 20):
        for tx in range(0, WIDTH, 28):
            offset = 14 if ((ty - floor_y) // 20) % 2 == 1 else 0
            bx = tx + offset
            draw.line([(bx, ty), (bx + 28, ty)], fill=(0x20, 0x08, 0x2C), width=1)
            draw.line([(bx, ty), (bx, ty + 20)], fill=(0x20, 0x08, 0x2C), width=1)

    # Purple light seeping through cracks
    for _ in range(18):
        cx = random.randint(80, WIDTH - 80)
        cy = random.randint(floor_y + 5, HEIGHT - 10)
        clen = random.randint(15, 50)
        draw.line([(cx, cy), (cx + clen, cy)], fill=(0x88, 0x22, 0xCC, 90), width=1)

    # --- Floating dark energy orbs ---
    orbs = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    orb_draw = ImageDraw.Draw(orbs)
    orb_positions = [(160, 100), (340, 150), (480, 80), (620, 130),
                     (250, 260), (550, 240), (700, 200)]
    for ox, oy in orb_positions:
        r = random.randint(8, 18)
        orb_draw.ellipse([ox - r, oy - r, ox + r, oy + r],
                         fill=(0x55, 0x00, 0x88, 140))
        orb_draw.ellipse([ox - r // 2, oy - r // 2, ox + r // 2, oy + r // 2],
                         fill=(0xAA, 0x33, 0xFF, 180))
        orb_draw.ellipse([ox - 2, oy - 2, ox + 2, oy + 2],
                         fill=(0xDD, 0xAA, 0xFF, 220))
    img = Image.alpha_composite(img, orbs)

    img.save(os.path.join(OUT_DIR, "shadow-lord-arena-bg.png"))
    print("  -> shadow-lord-arena-bg.png saved!")


# ---------------------------------------------------------------------------
# 11. Ruins Background
# ---------------------------------------------------------------------------

def generate_ruins():
    print("Generating ruins-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Sandy brown/warm gray sky gradient ---
    fill_gradient(draw, 0, 370, (0xCC, 0xB8, 0x88), (0xE8, 0xD4, 0xAA))

    # --- Sandy ground ---
    draw.rectangle([0, 370, WIDTH, HEIGHT], fill=(0xB8, 0x9A, 0x5E))

    # Dirt path
    draw.rectangle([0, 395, WIDTH, 425], fill=(0xAA, 0x8C, 0x52))
    for x in range(0, WIDTH, 15):
        pw = random.randint(4, 10)
        draw.rectangle([x, 400, x + pw, 403], fill=(0xBB, 0x9C, 0x60))

    # Bottom section
    draw.rectangle([0, 425, WIDTH, HEIGHT], fill=(0x96, 0x7C, 0x44))

    # --- Crumbling stone pillars ---
    pillar_data = [
        (90, 150, 26, 220),   (220, 180, 24, 190),
        (560, 160, 26, 210),  (690, 170, 24, 200),
        (400, 200, 22, 175),
    ]
    for px, py, pw, ph in pillar_data:
        # Main pillar body
        draw_rect(draw, px, py, pw, ph, (0x88, 0x80, 0x70))
        # Side shadow
        draw_rect(draw, px + pw - 5, py, 5, ph, (0x70, 0x68, 0x58))
        # Broken/jagged top
        jag_points = [(px, py)]
        step = pw // 3
        for i in range(3):
            jag_points.append((px + i * step, py - random.randint(5, 20)))
        jag_points.append((px + pw, py))
        draw.polygon(jag_points, fill=(0x88, 0x80, 0x70))

    # --- Floating stone pieces at various heights ---
    for _ in range(22):
        fx = random.randint(50, WIDTH - 50)
        fy = random.randint(60, 340)
        fw = random.randint(8, 22)
        fh = random.randint(6, 16)
        angle_offset = random.randint(-6, 6)
        fc = random.choice([(0x80, 0x78, 0x68), (0x70, 0x68, 0x58),
                            (0x90, 0x88, 0x78)])
        # Slight skew for "floating debris" look
        draw.polygon([
            (fx, fy + angle_offset), (fx + fw, fy),
            (fx + fw, fy + fh), (fx, fy + fh - angle_offset)
        ], fill=fc)

    # --- Sparse dry grass ---
    for _ in range(40):
        gx = random.randint(0, WIDTH)
        gy = random.randint(368, 393)
        gc = random.choice([(0x88, 0x7A, 0x40), (0x70, 0x64, 0x30)])
        draw.line([(gx, gy), (gx + random.randint(-3, 3), gy - 8)],
                  fill=gc, width=1)

    img.save(os.path.join(OUT_DIR, "ruins-bg.png"))
    print("  -> ruins-bg.png saved!")


# ---------------------------------------------------------------------------
# 12. Shattered Temple Background
# ---------------------------------------------------------------------------

def generate_shattered_temple():
    print("Generating shattered-temple-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Ancient stone interior ---
    fill_gradient(draw, 0, HEIGHT, (0x3A, 0x34, 0x2A), (0x28, 0x24, 0x1C))

    # --- Walls on sides (stone with rune slots) ---
    wall_w = 60
    for wy in range(0, HEIGHT, 18):
        for wx_offset in range(0, wall_w, 18):
            shade = random.choice([
                (0x44, 0x3C, 0x30), (0x3C, 0x34, 0x28), (0x50, 0x48, 0x3C)
            ])
            draw_rect(draw, wx_offset, wy, 17, 17, shade)
            draw_rect(draw, wx_offset, wy, 17, 1, (0x60, 0x56, 0x44))
            draw_rect(draw, WIDTH - wall_w + wx_offset, wy, 17, 17, shade)
            draw_rect(draw, WIDTH - wall_w + wx_offset, wy, 17, 1,
                      (0x60, 0x56, 0x44))

    # --- Glowing gold runes on walls ---
    rune_positions_left = [(10, 80), (28, 140), (10, 200), (28, 260),
                           (10, 320), (28, 380)]
    rune_positions_right = [(WIDTH - 28, 80), (WIDTH - 44, 140),
                            (WIDTH - 28, 200), (WIDTH - 44, 260),
                            (WIDTH - 28, 320), (WIDTH - 44, 380)]
    for rx, ry in rune_positions_left + rune_positions_right:
        rw, rh = random.randint(6, 10), random.randint(8, 14)
        draw_rect(draw, rx, ry, rw, rh, (0xCC, 0x99, 0x00))
        # Glow dot
        draw.ellipse([rx + 1, ry + 1, rx + rw - 1, ry + rh - 1],
                     fill=(0xFF, 0xCC, 0x44, 120))

    # --- Tall broken pillars ---
    pillar_data = [(90, 80, 26, 290), (200, 120, 24, 250),
                   (WIDTH - 116, 80, 26, 290), (WIDTH - 224, 110, 24, 260)]
    for px, py, pw, ph in pillar_data:
        draw_rect(draw, px, py, pw, ph, (0x55, 0x4C, 0x3C))
        draw_rect(draw, px + pw - 5, py, 5, ph, (0x44, 0x3C, 0x2E))
        # Broken top
        draw.polygon([(px, py), (px + 5, py - 16), (px + 12, py - 8),
                      (px + 18, py - 22), (px + pw, py - 10), (px + pw, py)],
                     fill=(0x55, 0x4C, 0x3C))

    # --- Stone floor with crack pattern ---
    floor_y = 355
    draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(0x30, 0x28, 0x20))

    for ty in range(floor_y, HEIGHT, 22):
        for tx in range(0, WIDTH, 30):
            offset = 15 if ((ty - floor_y) // 22) % 2 == 1 else 0
            bx = tx + offset
            draw.line([(bx, ty), (bx + 30, ty)], fill=(0x44, 0x3A, 0x2E), width=1)
            draw.line([(bx, ty), (bx, ty + 22)], fill=(0x44, 0x3A, 0x2E), width=1)

    # --- Golden light from above ---
    golden_light = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gl_draw = ImageDraw.Draw(golden_light)
    beams = [(250, 0, 300, 360), (380, 0, 420, 340), (500, 0, 540, 350)]
    for x1, y1, x2, y2 in beams:
        gl_draw.polygon([(x1, y1), (x2, y1), (x2 + 50, y2), (x1 + 50, y2)],
                        fill=(0xFF, 0xCC, 0x44, 30))
    img = Image.alpha_composite(img, golden_light)

    img.save(os.path.join(OUT_DIR, "shattered-temple-bg.png"))
    print("  -> shattered-temple-bg.png saved!")


# ---------------------------------------------------------------------------
# 13. Rune Guardian Arena Background
# ---------------------------------------------------------------------------

def generate_rune_guardian_arena():
    print("Generating rune-guardian-arena-bg.png ...")
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # --- Grand temple interior ---
    fill_gradient(draw, 0, HEIGHT, (0x44, 0x3A, 0x28), (0x30, 0x28, 0x1C))

    # --- Stone pillars with golden runes ---
    pillar_positions = [(70, 60), (170, 80), (WIDTH - 94, 60), (WIDTH - 194, 80)]
    for px, py in pillar_positions:
        pw, ph = 28, 310
        draw_rect(draw, px - pw // 2, py, pw, ph, (0x50, 0x48, 0x38))
        draw_rect(draw, px - pw // 2 + 5, py, 6, ph, (0x64, 0x5A, 0x48))
        # Broken top
        draw.polygon([(px - pw // 2, py), (px - 4, py - 18),
                      (px + 4, py - 8), (px + 10, py - 24),
                      (px + pw // 2, py - 12), (px + pw // 2, py)],
                     fill=(0x50, 0x48, 0x38))
        # Gold runes on pillar
        for ry in range(py + 20, py + ph - 20, 40):
            draw_rect(draw, px - 5, ry, 10, 12, (0xCC, 0x99, 0x00))
            draw.ellipse([px - 3, ry + 2, px + 3, ry + 8],
                         fill=(0xFF, 0xCC, 0x44, 150))

    # --- Stone floor ---
    floor_y = 355
    draw.rectangle([0, floor_y, WIDTH, HEIGHT], fill=(0x28, 0x22, 0x18))

    for ty in range(floor_y, HEIGHT, 22):
        for tx in range(0, WIDTH, 30):
            offset = 15 if ((ty - floor_y) // 22) % 2 == 1 else 0
            bx = tx + offset
            draw.line([(bx, ty), (bx + 30, ty)], fill=(0x3C, 0x34, 0x28), width=1)
            draw.line([(bx, ty), (bx, ty + 22)], fill=(0x3C, 0x34, 0x28), width=1)

    # --- Glowing rune circle on floor ---
    cx, cy = WIDTH // 2, floor_y + 50
    for radius in [80, 60, 40]:
        # Draw circle as many short line segments
        import math
        prev = None
        for angle in range(0, 361, 5):
            rad = math.radians(angle)
            px_pt = cx + int(radius * math.cos(rad))
            py_pt = cy + int(radius * math.sin(rad))
            if prev is not None:
                draw.line([prev, (px_pt, py_pt)], fill=(0xCC, 0x99, 0x00, 200), width=2)
            prev = (px_pt, py_pt)
    # Rune dots around the circle
    for angle in range(0, 360, 30):
        rad = math.radians(angle)
        rdx = cx + int(80 * math.cos(rad))
        rdy = cy + int(80 * math.sin(rad))
        draw.ellipse([rdx - 4, rdy - 4, rdx + 4, rdy + 4],
                     fill=(0xFF, 0xCC, 0x44))
    # Cross lines through circle
    draw.line([(cx - 80, cy), (cx + 80, cy)], fill=(0xCC, 0x99, 0x00, 180), width=2)
    draw.line([(cx, cy - 80), (cx, cy + 80)], fill=(0xCC, 0x99, 0x00, 180), width=2)

    # --- Floating debris ---
    for _ in range(25):
        dx = random.randint(80, WIDTH - 80)
        dy = random.randint(60, floor_y - 20)
        dw = random.randint(6, 18)
        dh = random.randint(5, 12)
        dc = random.choice([(0x60, 0x58, 0x48), (0x50, 0x48, 0x38)])
        draw.polygon([
            (dx, dy + random.randint(-3, 3)),
            (dx + dw, dy),
            (dx + dw, dy + dh),
            (dx, dy + dh + random.randint(-3, 3))
        ], fill=dc)

    # --- Golden energy beams (diagonal strips) ---
    beams_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(beams_layer)
    beam_data = [
        (100, 0, 160, 360),
        (300, 0, 350, 340),
        (480, 0, 520, 350),
        (650, 0, 700, 360),
    ]
    for x1, y1, x2, y2 in beam_data:
        b_draw.polygon([(x1, y1), (x2, y1), (x2 + 40, y2), (x1 + 40, y2)],
                       fill=(0xFF, 0xCC, 0x44, 25))
    img = Image.alpha_composite(img, beams_layer)

    img.save(os.path.join(OUT_DIR, "rune-guardian-arena-bg.png"))
    print("  -> rune-guardian-arena-bg.png saved!")


# ---------------------------------------------------------------------------
# Run everything
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== Mob Slayer Background Generator ===")
    print(f"Output: {OUT_DIR}\n")
    generate_village()
    generate_woods_day()
    generate_woods_night()
    generate_boss_arena()
    generate_tundra()
    generate_ice_fortress()
    generate_frost_giant_arena()
    generate_dark_forest()
    generate_shadow_keep()
    generate_shadow_lord_arena()
    generate_ruins()
    generate_shattered_temple()
    generate_rune_guardian_arena()
    print("\nAll 13 backgrounds generated!")
