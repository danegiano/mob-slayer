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
# Run everything
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== Mob Slayer Background Generator ===")
    print(f"Output: {OUT_DIR}\n")
    generate_village()
    generate_woods_day()
    generate_woods_night()
    generate_boss_arena()
    print("\nAll 4 backgrounds generated!")
