# Expanded Wilderness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand each wilderness area from ~8 min to ~30 min with villages, quests, shops, mini-games, and multiple sub-areas.

**Architecture:** Each wilderness region gains a village hub scene with NPCs (quests, shop, mini-game entrance), 3 combat sub-areas with quest objectives, and a quest-gate check on fortress scenes. New GameState fields track gold, quests, and attack bonuses. All sprites are base64-embedded, backgrounds are Pillow-generated PNGs. Scenes follow the existing pattern (position-based transitions, physics ground at y=415, Enemy class reuse).

**Tech Stack:** Phaser 3.80.1 (CDN), vanilla JS (no modules), Python/Pillow for asset generation

---

### Task 1: GameState + HUD Updates

**Files:**
- Modify: `js/main.js:1-8` (GameState object)
- Modify: `js/HUD.js` (add gold display)

**Step 1: Add new GameState fields**

In `js/main.js`, replace the GameState object (lines 1-8) with:

```js
const GameState = {
    health: 100,
    maxHealth: 100,
    weapon: 'wood',
    comboUnlocked: false,
    storyPhase: 0,
    swordPowers: [],
    gold: 0,
    attackBonus: 0,
    quests: {
        tundra: { wolves: false, amulet: false, blizzard: false, miniGame: false },
        darkforest: { mushrooms: false, villager: false, nest: false, miniGame: false },
        ruins: { bridge: false, scroll: false, runes: false, miniGame: false }
    },
    shopUpgrades: {
        tundra: { maxHp: false, attack: false },
        darkforest: { maxHp: false, attack: false },
        ruins: { maxHp: false, attack: false }
    }
};
```

**Step 2: Add gold display to HUD**

In `js/HUD.js`, add a gold text element after the kanjiText in the constructor (after line 16):

```js
this.goldText = scene.add.text(680, 12, '', {
    fontSize: '14px', fill: '#ffdd00'
}).setScrollFactor(0).setDepth(101);
```

In the `update()` method, add at the end (before the closing `}`):

```js
this.goldText.setText(GameState.gold + 'g');
```

**Step 3: Test manually**

Open the game in the browser. Verify:
- Gold shows "0g" in top-right of HUD
- No console errors
- Existing gameplay still works

**Step 4: Commit**

```bash
git add js/main.js js/HUD.js
git commit -m "add gold, quests, and shop tracking to GameState + gold HUD display"
```

---

### Task 2: Generate New Sprites

**Files:**
- Modify: `generate_sprites.py` (add new sprite generators)
- Modify: `js/main.js` (add base64 data + BootScene frame definitions)

**Step 1: Add new sprite generators to generate_sprites.py**

Add these new sprite functions to `generate_sprites.py`. Each generates a 2-frame spritesheet:

**Village NPC (generic quest giver)** — 64x48 (2 frames of 32x48, same size as blacksmith):
- Simple humanoid, brown/tan clothes, varied hair color
- Generate 3 color variants by passing a color parameter: `village_npc_1` (blue hat), `village_npc_2` (green hat), `village_npc_3` (red hat)

**Shopkeeper** — 64x48 (2 frames of 32x48):
- Similar to blacksmith but with an apron, gold-colored accents

**Collectible Item** — 32x16 (2 frames of 16x16):
- Glowing orb with sparkle effect, golden color
- Used for: amulet, mushroom, scroll, rune stone (all use same sprite, quests track by scene)

**Gold Coin** — 16x8 (2 frames of 8x8):
- Tiny gold circle with highlight

**Target** — 32x16 (2 frames of 16x16):
- Red/white bullseye target for mini-game

**Lost Child** — 32x24 (2 frames of 16x24):
- Small humanoid, blue clothes

Here's the code to add for each sprite (append to generate_sprites.py):

```python
def generate_village_npc(hat_color, name):
    """Village NPC with colored hat - 64x48 (2 frames of 32x48)"""
    img = Image.new('RGBA', (64, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for frame in range(2):
        ox = frame * 32
        bob = frame * 1
        # Body (brown tunic)
        draw.rectangle([ox+10, 20-bob, ox+22, 38-bob], fill=(139, 90, 43, 255))
        # Head (skin)
        draw.rectangle([ox+12, 10-bob, ox+20, 20-bob], fill=(234, 192, 134, 255))
        # Hat
        draw.rectangle([ox+10, 6-bob, ox+22, 12-bob], fill=hat_color)
        # Eyes
        draw.rectangle([ox+14, 13-bob, ox+15, 15-bob], fill=(0, 0, 0, 255))
        draw.rectangle([ox+18, 13-bob, ox+19, 15-bob], fill=(0, 0, 0, 255))
        # Legs
        draw.rectangle([ox+12, 38-bob, ox+15, 46-bob], fill=(100, 70, 40, 255))
        draw.rectangle([ox+17, 38-bob, ox+20, 46-bob], fill=(100, 70, 40, 255))
        # Arms
        draw.rectangle([ox+7, 22-bob, ox+10, 32-bob], fill=(234, 192, 134, 255))
        draw.rectangle([ox+22, 22-bob, ox+25, 32-bob], fill=(234, 192, 134, 255))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode()
    print(f"{name}: 'data:image/png;base64,{b64}',")

def generate_shopkeeper():
    """Shopkeeper - 64x48 (2 frames of 32x48)"""
    img = Image.new('RGBA', (64, 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for frame in range(2):
        ox = frame * 32
        bob = frame * 1
        # Body (white apron over brown)
        draw.rectangle([ox+10, 20-bob, ox+22, 38-bob], fill=(139, 90, 43, 255))
        draw.rectangle([ox+11, 22-bob, ox+21, 36-bob], fill=(240, 240, 240, 255))
        # Head (skin)
        draw.rectangle([ox+12, 10-bob, ox+20, 20-bob], fill=(234, 192, 134, 255))
        # Gold headband
        draw.rectangle([ox+11, 10-bob, ox+21, 12-bob], fill=(255, 215, 0, 255))
        # Eyes
        draw.rectangle([ox+14, 13-bob, ox+15, 15-bob], fill=(0, 0, 0, 255))
        draw.rectangle([ox+18, 13-bob, ox+19, 15-bob], fill=(0, 0, 0, 255))
        # Smile
        draw.rectangle([ox+15, 17-bob, ox+17, 18-bob], fill=(0, 0, 0, 255))
        # Legs
        draw.rectangle([ox+12, 38-bob, ox+15, 46-bob], fill=(100, 70, 40, 255))
        draw.rectangle([ox+17, 38-bob, ox+20, 46-bob], fill=(100, 70, 40, 255))
        # Arms
        draw.rectangle([ox+7, 22-bob, ox+10, 32-bob], fill=(234, 192, 134, 255))
        draw.rectangle([ox+22, 22-bob, ox+25, 32-bob], fill=(234, 192, 134, 255))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode()
    print(f"shopkeeper: 'data:image/png;base64,{b64}',")

def generate_collectible():
    """Collectible item (glowing orb) - 32x16 (2 frames of 16x16)"""
    img = Image.new('RGBA', (32, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for frame in range(2):
        ox = frame * 16
        # Outer glow
        draw.ellipse([ox+2, 2, ox+14, 14], fill=(255, 223, 100, 100))
        # Inner orb
        draw.ellipse([ox+4, 4, ox+12, 12], fill=(255, 215, 0, 255))
        # Sparkle (alternates frames)
        if frame == 0:
            draw.rectangle([ox+7, 1, ox+9, 3], fill=(255, 255, 200, 255))
        else:
            draw.rectangle([ox+12, 6, ox+14, 8], fill=(255, 255, 200, 255))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode()
    print(f"collectible: 'data:image/png;base64,{b64}',")

def generate_gold_coin():
    """Gold coin drop - 16x8 (2 frames of 8x8)"""
    img = Image.new('RGBA', (16, 8), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for frame in range(2):
        ox = frame * 8
        draw.ellipse([ox+1, 1, ox+7, 7], fill=(255, 215, 0, 255))
        if frame == 0:
            draw.rectangle([ox+3, 2, ox+4, 3], fill=(255, 255, 200, 255))
        else:
            draw.rectangle([ox+4, 3, ox+5, 4], fill=(255, 255, 200, 255))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode()
    print(f"gold_coin: 'data:image/png;base64,{b64}',")

def generate_target():
    """Target for mini-game - 32x16 (2 frames of 16x16)"""
    img = Image.new('RGBA', (32, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for frame in range(2):
        ox = frame * 16
        draw.ellipse([ox+1, 1, ox+15, 15], fill=(255, 0, 0, 255))
        draw.ellipse([ox+3, 3, ox+13, 13], fill=(255, 255, 255, 255))
        draw.ellipse([ox+5, 5, ox+11, 11], fill=(255, 0, 0, 255))
        draw.ellipse([ox+7, 7, ox+9, 9], fill=(255, 255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode()
    print(f"target: 'data:image/png;base64,{b64}',")

def generate_lost_child():
    """Lost child NPC - 32x24 (2 frames of 16x24)"""
    img = Image.new('RGBA', (32, 24), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for frame in range(2):
        ox = frame * 16
        bob = frame * 1
        # Body (blue shirt)
        draw.rectangle([ox+4, 10-bob, ox+12, 18-bob], fill=(80, 130, 200, 255))
        # Head
        draw.rectangle([ox+5, 3-bob, ox+11, 10-bob], fill=(234, 192, 134, 255))
        # Hair (brown)
        draw.rectangle([ox+4, 2-bob, ox+12, 5-bob], fill=(120, 80, 40, 255))
        # Eyes
        draw.rectangle([ox+6, 6-bob, ox+7, 7-bob], fill=(0, 0, 0, 255))
        draw.rectangle([ox+9, 6-bob, ox+10, 7-bob], fill=(0, 0, 0, 255))
        # Legs
        draw.rectangle([ox+5, 18-bob, ox+7, 23-bob], fill=(100, 70, 40, 255))
        draw.rectangle([ox+9, 18-bob, ox+11, 23-bob], fill=(100, 70, 40, 255))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode()
    print(f"lost_child: 'data:image/png;base64,{b64}',")
```

Add to the `if __name__ == '__main__':` block:
```python
generate_village_npc((60, 80, 200, 255), 'village_npc_1')   # blue hat
generate_village_npc((40, 160, 60, 255), 'village_npc_2')    # green hat
generate_village_npc((200, 50, 50, 255), 'village_npc_3')    # red hat
generate_shopkeeper()
generate_collectible()
generate_gold_coin()
generate_target()
generate_lost_child()
```

**Step 2: Run the sprite generator**

```bash
cd /home/dane/Games/mob-slayer
python3 generate_sprites.py
```

Copy the output base64 strings.

**Step 3: Add new sprites to SPRITE_DATA in main.js**

Add these keys to the `SPRITE_DATA` object (after `rune_guardian`):
- `village_npc_1`
- `village_npc_2`
- `village_npc_3`
- `shopkeeper`
- `collectible`
- `gold_coin`
- `target`
- `lost_child`

**Step 4: Add frame definitions to BootScene.onSpritesLoaded()**

Add these frame/animation definitions in `onSpritesLoaded()` (same pattern as existing sprites):

```js
// Village NPCs (32x48, 2 frames each)
['village_npc_1', 'village_npc_2', 'village_npc_3', 'shopkeeper'].forEach(key => {
    this.textures.get(key).add(1, 0, 0, 0, 32, 48);
    this.textures.get(key).add(2, 0, 32, 0, 32, 48);
    this.anims.create({
        key: key + '_idle',
        frames: [{ key: key, frame: 1 }, { key: key, frame: 2 }],
        frameRate: 2, repeat: -1
    });
});

// Collectible (16x16, 2 frames)
this.textures.get('collectible').add(1, 0, 0, 0, 16, 16);
this.textures.get('collectible').add(2, 0, 16, 0, 16, 16);
this.anims.create({
    key: 'collectible_idle',
    frames: [{ key: 'collectible', frame: 1 }, { key: 'collectible', frame: 2 }],
    frameRate: 3, repeat: -1
});

// Gold coin (8x8, 2 frames)
this.textures.get('gold_coin').add(1, 0, 0, 0, 8, 8);
this.textures.get('gold_coin').add(2, 0, 8, 0, 8, 8);
this.anims.create({
    key: 'gold_coin_idle',
    frames: [{ key: 'gold_coin', frame: 1 }, { key: 'gold_coin', frame: 2 }],
    frameRate: 4, repeat: -1
});

// Target (16x16, 2 frames)
this.textures.get('target').add(1, 0, 0, 0, 16, 16);
this.textures.get('target').add(2, 0, 16, 0, 16, 16);
this.anims.create({
    key: 'target_idle',
    frames: [{ key: 'target', frame: 1 }, { key: 'target', frame: 2 }],
    frameRate: 2, repeat: -1
});

// Lost child (16x24, 2 frames)
this.textures.get('lost_child').add(1, 0, 0, 0, 16, 24);
this.textures.get('lost_child').add(2, 0, 16, 0, 16, 24);
this.anims.create({
    key: 'lost_child_idle',
    frames: [{ key: 'lost_child', frame: 1 }, { key: 'lost_child', frame: 2 }],
    frameRate: 2, repeat: -1
});
```

Also update the sprite count check in `create()` — change the `expectedCount` from 11 to 19 (11 original + 8 new).

**Step 5: Test manually**

Open the game, check browser console for errors. All new textures should load without issues.

**Step 6: Commit**

```bash
git add generate_sprites.py js/main.js
git commit -m "add village NPC, collectible, gold coin, target, and lost child sprites"
```

---

### Task 3: Generate New Backgrounds

**Files:**
- Modify: `generate_backgrounds.py` (add 15 new background generators)

**Step 1: Add 15 new background generators to generate_backgrounds.py**

Add these functions following the same pattern as existing backgrounds (800x450 RGBA PNGs saved to `assets/backgrounds/`). Each uses `fill_gradient()`, `blob()`, `draw_rect()`, `draw_triangle()` helper functions already in the file.

**3 Village backgrounds:**

1. `tundra-village-bg.png` — Snowy ground, light blue sky, 3-4 small wooden cabins with warm orange windows, smoke from chimneys, snow on rooftops, pine trees in background
2. `forest-village-bg.png` — Dark green canopy above, elevated wooden platforms/treehouses connected by bridges, lantern lights (orange/yellow dots), moss-covered wood
3. `ruins-village-bg.png` — Sandy/tan ground, partially restored stone buildings with cloth awnings, desert sky with warm sunset tones, scattered pottery/crates

**9 Sub-area backgrounds:**

4. `frozen-lake-bg.png` — Ice-blue flat ground (frozen lake), snowy banks on sides, dead trees, light blue sky, ice reflections (lighter patches)
5. `snow-cave-bg.png` — Dark blue-gray cave interior, ice formations on ceiling, icy blue floor, dim light from cave entrance on left
6. `blizzard-pass-bg.png` — White/light gray sky (blizzard), narrow rocky path, heavy snow, barely visible mountains, wind streaks
7. `mushroom-grove-bg.png` — Very dark ground, giant glowing mushrooms (blue/green/purple), bioluminescent spores floating, dark tree silhouettes
8. `cursed-swamp-bg.png` — Murky green/brown water patches, dead twisted trees, green fog, dark purple sky, eerie green lights
9. `hollow-tree-bg.png` — Inside a massive tree trunk, dark brown wood walls curving inward, small holes letting in light, root patterns on floor
10. `crumbling-bridge-bg.png` — Sandy canyon, broken stone bridge in middle, pillars on sides, blue sky, floating debris/dust
11. `buried-library-bg.png` — Dark stone interior, tall bookshelves, scattered scrolls on ground, faint golden light from runes on wall, dusty atmosphere
12. `lava-pit-bg.png` — Red/orange glow from below, cracked dark ground, lava streams, obsidian rocks, ember particles floating up

**3 Mini-game backgrounds:**

13. `target-practice-bg.png` — Open snowy field with wooden target stands, hay bales, clear sky, training dummies
14. `obstacle-course-bg.png` — Dark forest clearing with wooden platforms, rope bridges, torch-lit path, finish line banner
15. `memory-puzzle-bg.png` — Ancient stone room with 4 large rune pedestals in a row, mystical glow, stone floor with carved patterns

Add calls to `if __name__ == '__main__':` block to generate all 15.

**Step 2: Run the background generator**

```bash
cd /home/dane/Games/mob-slayer
python3 generate_backgrounds.py
```

Verify all 15 new PNGs appear in `assets/backgrounds/`.

**Step 3: Commit**

```bash
git add generate_backgrounds.py assets/backgrounds/
git commit -m "generate 15 new backgrounds for villages, sub-areas, and mini-games"
```

---

### Task 4: Shop System

**Files:**
- Create: `js/ShopMenu.js`

**Step 1: Create ShopMenu class**

The shop uses a simple menu overlay (similar to DialogueBox but with selectable options). Create `js/ShopMenu.js`:

```js
class ShopMenu {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.selectedIndex = 0;
        this.items = [];

        // Dark overlay box
        this.bg = scene.add.rectangle(400, 225, 500, 300, 0x000000, 0.85)
            .setDepth(200).setVisible(false);
        this.titleText = scene.add.text(400, 100, 'SHOP', {
            fontSize: '20px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(201).setVisible(false);
        this.goldText = scene.add.text(400, 130, '', {
            fontSize: '14px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(201).setVisible(false);

        // 3 item slots
        this.itemTexts = [];
        for (let i = 0; i < 3; i++) {
            const t = scene.add.text(400, 170 + i * 50, '', {
                fontSize: '14px', fill: '#fff'
            }).setOrigin(0.5).setDepth(201).setVisible(false);
            this.itemTexts.push(t);
        }

        this.hintText = scene.add.text(400, 340, 'UP/DOWN to select, E to buy, Q to close', {
            fontSize: '11px', fill: '#aaa'
        }).setOrigin(0.5).setDepth(201).setVisible(false);

        // Keys
        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.qKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    }

    open(area) {
        this.isOpen = true;
        this.selectedIndex = 0;
        this.area = area;

        const hpBought = GameState.shopUpgrades[area].maxHp;
        const atkBought = GameState.shopUpgrades[area].attack;

        this.items = [
            { name: 'Health Potion', desc: 'Restore 50 HP', cost: 50, type: 'potion' },
            { name: 'Max HP Up', desc: '+25 Max HP', cost: 100, type: 'maxhp', bought: hpBought },
            { name: 'Attack Up', desc: '+5 Damage', cost: 150, type: 'attack', bought: atkBought }
        ];

        this.bg.setVisible(true);
        this.titleText.setVisible(true);
        this.goldText.setVisible(true);
        this.hintText.setVisible(true);
        this.itemTexts.forEach(t => t.setVisible(true));
        this.refresh();
    }

    refresh() {
        this.goldText.setText('Gold: ' + GameState.gold + 'g');
        this.items.forEach((item, i) => {
            let line = item.name + ' - ' + item.cost + 'g  (' + item.desc + ')';
            if (item.bought) line = item.name + ' - SOLD OUT';
            const prefix = (i === this.selectedIndex) ? '> ' : '  ';
            this.itemTexts[i].setText(prefix + line);
            this.itemTexts[i].setFill(i === this.selectedIndex ? '#ffdd00' : '#fff');
        });
    }

    update() {
        if (!this.isOpen) return;

        if (Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey)) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.refresh();
        }
        if (Phaser.Input.Keyboard.JustDown(this.downKey) || Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
            this.refresh();
        }

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.buySelected();
        }

        if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
            this.close();
        }
    }

    buySelected() {
        const item = this.items[this.selectedIndex];
        if (item.bought) return;
        if (GameState.gold < item.cost) return;

        GameState.gold -= item.cost;

        if (item.type === 'potion') {
            GameState.health = Math.min(GameState.health + 50, GameState.maxHealth);
        } else if (item.type === 'maxhp') {
            GameState.maxHealth += 25;
            GameState.health = Math.min(GameState.health + 25, GameState.maxHealth);
            GameState.shopUpgrades[this.area].maxHp = true;
            item.bought = true;
        } else if (item.type === 'attack') {
            GameState.attackBonus += 5;
            GameState.shopUpgrades[this.area].attack = true;
            item.bought = true;
        }

        this.refresh();
    }

    close() {
        this.isOpen = false;
        this.bg.setVisible(false);
        this.titleText.setVisible(false);
        this.goldText.setVisible(false);
        this.hintText.setVisible(false);
        this.itemTexts.forEach(t => t.setVisible(false));
    }
}
```

**Step 2: Test manually**

This will be tested when village scenes are created (Task 5). For now just verify no syntax errors by loading the file.

**Step 3: Commit**

```bash
git add js/ShopMenu.js
git commit -m "add ShopMenu class for village shop system"
```

---

### Task 5: Gold Drop System in Enemy.js

**Files:**
- Modify: `js/Enemy.js` (add gold drop on death)

**Step 1: Add goldValue property and gold drop**

In `Enemy.js` constructor, add after `this.isDead = false;`:

```js
this.goldValue = 5;
```

In the `die()` method, add before the tween/destroy logic:

```js
GameState.gold += this.goldValue;

// Show floating gold text
const goldText = this.scene.add.text(this.x, this.y - 20, '+' + this.goldValue + 'g', {
    fontSize: '12px', fill: '#ffdd00', fontStyle: 'bold'
}).setOrigin(0.5).setDepth(50);
this.scene.tweens.add({
    targets: goldText,
    y: goldText.y - 30,
    alpha: 0,
    duration: 800,
    onComplete: () => goldText.destroy()
});
```

**Step 2: Test**

Kill an enemy in any existing scene. Verify:
- Gold counter in HUD increases by 5
- Floating "+5g" text appears and fades up

**Step 3: Commit**

```bash
git add js/Enemy.js
git commit -m "enemies drop gold on death with floating text indicator"
```

---

### Task 6: Update VictoryScene Transition

**Files:**
- Modify: `js/scenes/VictoryScene.js`

**Step 1: Change transition target**

In `VictoryScene.js`, find the line that transitions to `'Tundra'` (inside `showWallCrack()`, near the end). Change it to:

```js
this.scene.start('TundraVillage');
```

**Step 2: Commit**

```bash
git add js/scenes/VictoryScene.js
git commit -m "VictoryScene transitions to TundraVillage instead of Tundra"
```

---

### Task 7: Tundra Village Scene

**Files:**
- Create: `js/scenes/TundraVillageScene.js`

**Step 1: Create TundraVillageScene**

This is the village hub for the Frozen Tundra region. It has:
- 3 quest NPCs (Hunter, Elder, Scout)
- 1 shopkeeper NPC
- 1 mini-game entrance (building you walk into)
- Navigation: exit right → FrozenLake, enter mini-game building → TundraTargetPractice

```js
class TundraVillageScene extends Phaser.Scene {
    constructor() { super('TundraVillage'); }

    preload() {
        this.load.image('tundra-village-bg', 'assets/backgrounds/tundra-village-bg.png');
    }

    create() {
        this.add.image(400, 225, 'tundra-village-bg');

        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player
        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);

        this.hud = new HUD(this);
        this.dialogue = new DialogueBox(this);
        this.shop = new ShopMenu(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // NPCs
        this.hunter = this.physics.add.sprite(200, 340, 'village_npc_1');
        this.hunter.play('village_npc_1_idle');
        this.hunter.setScale(2);
        this.physics.add.collider(this.hunter, this.ground);

        this.elder = this.physics.add.sprite(350, 340, 'village_npc_2');
        this.elder.play('village_npc_2_idle');
        this.elder.setScale(2);
        this.physics.add.collider(this.elder, this.ground);

        this.scout = this.physics.add.sprite(500, 340, 'village_npc_3');
        this.scout.play('village_npc_3_idle');
        this.scout.setScale(2);
        this.physics.add.collider(this.scout, this.ground);

        this.shopNpc = this.physics.add.sprite(650, 340, 'shopkeeper');
        this.shopNpc.play('shopkeeper_idle');
        this.shopNpc.setScale(2);
        this.physics.add.collider(this.shopNpc, this.ground);

        // NPC labels
        this.npcs = [
            { sprite: this.hunter, name: 'Hunter', questKey: 'wolves' },
            { sprite: this.elder, name: 'Elder', questKey: 'amulet' },
            { sprite: this.scout, name: 'Scout', questKey: 'blizzard' },
            { sprite: this.shopNpc, name: 'Shop', questKey: null }
        ];

        this.talkPrompt = this.add.text(0, 0, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        // Mini-game entrance (a door/sign on the left)
        this.miniGameSign = this.add.text(100, 350, '[Target Practice]', {
            fontSize: '10px', fill: '#88ccff'
        }).setOrigin(0.5).setDepth(50);

        // Title
        this.add.text(400, 30, 'Tundra Village', {
            fontSize: '18px', fill: '#88ccff'
        }).setOrigin(0.5);

        // Quest status display
        this.questStatus = this.add.text(400, 430, '', {
            fontSize: '10px', fill: '#aaa'
        }).setOrigin(0.5).setDepth(50);

        this.transitioning = false;
    }

    update() {
        if (!this.dialogue.isOpen && !this.shop.isOpen) {
            this.player.update();
        }
        this.hud.update();
        this.dialogue.update();
        this.shop.update();

        // Update quest status bar
        const q = GameState.quests.tundra;
        const done = [q.wolves, q.amulet, q.blizzard, q.miniGame].filter(Boolean).length;
        this.questStatus.setText('Quests: ' + done + '/4 complete');

        // Find nearest NPC
        let nearest = null;
        let nearDist = Infinity;
        this.npcs.forEach(npc => {
            const d = Math.abs(this.player.x - npc.sprite.x);
            if (d < 80 && d < nearDist) { nearest = npc; nearDist = d; }
        });

        if (nearest && !this.dialogue.isOpen && !this.shop.isOpen) {
            this.talkPrompt.setPosition(nearest.sprite.x, nearest.sprite.y - 60);
            this.talkPrompt.setVisible(true);
        } else {
            this.talkPrompt.setVisible(false);
        }

        // E key interactions
        if (!this.dialogue.isOpen && !this.shop.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            if (nearest) {
                if (nearest.name === 'Shop') {
                    this.shop.open('tundra');
                } else if (nearest.name === 'Hunter') {
                    if (GameState.quests.tundra.wolves) {
                        this.dialogue.open('Hunter', ['Thank you for clearing the wolves!']);
                    } else {
                        this.dialogue.open('Hunter', [
                            'Ice wolves are terrorizing the Frozen Lake!',
                            'Kill 5 of them and I can rest easy.',
                            'Head east through the village to reach the lake.'
                        ]);
                    }
                } else if (nearest.name === 'Elder') {
                    if (GameState.quests.tundra.amulet) {
                        this.dialogue.open('Elder', ['My amulet! Thank you, brave one!']);
                    } else {
                        this.dialogue.open('Elder', [
                            'I lost my precious amulet in the Snow Cave...',
                            'It glows golden. You can\'t miss it.',
                            'The cave is past the Frozen Lake.'
                        ]);
                    }
                } else if (nearest.name === 'Scout') {
                    if (GameState.quests.tundra.blizzard) {
                        this.dialogue.open('Scout', ['The pass is safe now. You\'re a hero!']);
                    } else {
                        this.dialogue.open('Scout', [
                            'Blizzard Pass is overrun with wolves!',
                            'Stronger ones... with thick ice armor.',
                            'Clear them all out if you can!'
                        ]);
                    }
                }
            }

            // Mini-game entrance
            if (Math.abs(this.player.x - 100) < 50) {
                if (GameState.quests.tundra.miniGame) {
                    this.dialogue.open('', ['You already completed target practice!']);
                } else {
                    this.scene.start('TundraTargetPractice');
                }
            }
        }

        // Exit right → Frozen Lake
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('FrozenLake');
        }
    }
}
```

**Step 2: Test**

Will test once wired up (Task 14). For now verify no syntax errors.

**Step 3: Commit**

```bash
git add js/scenes/TundraVillageScene.js
git commit -m "add TundraVillageScene with quest NPCs, shop, and mini-game entrance"
```

---

### Task 8: Tundra Sub-Area Scenes (FrozenLake, SnowCave, BlizzardPass)

**Files:**
- Create: `js/scenes/FrozenLakeScene.js`
- Create: `js/scenes/SnowCaveScene.js`
- Create: `js/scenes/BlizzardPassScene.js`

**Step 1: Create FrozenLakeScene**

Kill-quest scene: track kills, complete quest at 5 kills.

```js
class FrozenLakeScene extends Phaser.Scene {
    constructor() { super('FrozenLake'); }
    preload() { this.load.image('frozen-lake-bg', 'assets/backgrounds/frozen-lake-bg.png'); }
    create() {
        this.add.image(400, 225, 'frozen-lake-bg');
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);

        this.killCount = 0;
        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        for (let i = 0; i < 6; i++) {
            const x = 200 + i * 100;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 15);
            enemy.speed = 100; enemy.aggroRange = 250; enemy.damage = 8;
            enemy.goldValue = 5;
            this.enemies.add(enemy);
        }

        this.add.text(400, 50, 'Frozen Lake', { fontSize: '20px', fill: '#88ccff' }).setOrigin(0.5);
        this.questText = this.add.text(400, 430, '', { fontSize: '12px', fill: '#ffdd00' }).setOrigin(0.5);
        this.transitioning = false;
    }
    update() {
        this.player.update();
        this.hud.update();

        // Count dead enemies for quest
        let deadCount = 0;
        this.enemies.children.each(enemy => {
            if (!enemy.isDead) enemy.update(this.player);
            else deadCount++;
        });

        if (!GameState.quests.tundra.wolves) {
            this.questText.setText('Wolves defeated: ' + Math.min(deadCount, 5) + '/5');
            if (deadCount >= 5) {
                GameState.quests.tundra.wolves = true;
                this.questText.setText('Quest Complete: Wolves Cleared!');
            }
        } else {
            this.questText.setText('Wolves Cleared!');
        }

        // Attack hitbox
        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Exit left → Village
        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('TundraVillage');
        }
        // Exit right → Snow Cave
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('SnowCave');
        }
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 2: Create SnowCaveScene**

Fetch-quest scene: find glowing amulet item.

```js
class SnowCaveScene extends Phaser.Scene {
    constructor() { super('SnowCave'); }
    preload() { this.load.image('snow-cave-bg', 'assets/backgrounds/snow-cave-bg.png'); }
    create() {
        this.add.image(400, 225, 'snow-cave-bg');
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        for (let i = 0; i < 5; i++) {
            const x = 200 + i * 120;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 15);
            enemy.speed = 100; enemy.aggroRange = 250; enemy.damage = 8;
            enemy.goldValue = 5;
            this.enemies.add(enemy);
        }

        // Collectible amulet (if not already found)
        this.amulet = null;
        if (!GameState.quests.tundra.amulet) {
            this.amulet = this.physics.add.sprite(650, 390, 'collectible');
            this.amulet.play('collectible_idle');
            this.amulet.setScale(2);
            this.physics.add.collider(this.amulet, this.ground);
        }

        this.pickupPrompt = this.add.text(0, 0, 'Press E to pick up', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        this.add.text(400, 50, 'Snow Cave', { fontSize: '20px', fill: '#aaccff' }).setOrigin(0.5);
        this.questText = this.add.text(400, 430, '', { fontSize: '12px', fill: '#ffdd00' }).setOrigin(0.5);
        this.transitioning = false;
    }
    update() {
        this.player.update();
        this.hud.update();
        this.enemies.children.each(enemy => { if (!enemy.isDead) enemy.update(this.player); });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Amulet pickup
        if (this.amulet && !GameState.quests.tundra.amulet) {
            const dist = Math.abs(this.player.x - this.amulet.x);
            if (dist < 50) {
                this.pickupPrompt.setPosition(this.amulet.x, this.amulet.y - 30);
                this.pickupPrompt.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                    GameState.quests.tundra.amulet = true;
                    this.amulet.destroy();
                    this.amulet = null;
                    this.pickupPrompt.setVisible(false);
                    this.questText.setText('Found the Elder\'s Amulet!');
                }
            } else {
                this.pickupPrompt.setVisible(false);
            }
        }

        if (GameState.quests.tundra.amulet) {
            this.questText.setText('Amulet Found!');
        } else {
            this.questText.setText('Find the Elder\'s Amulet...');
        }

        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('FrozenLake');
        }
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('BlizzardPass');
        }
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 3: Create BlizzardPassScene**

Clear-all-enemies quest with tougher wolves.

```js
class BlizzardPassScene extends Phaser.Scene {
    constructor() { super('BlizzardPass'); }
    preload() { this.load.image('blizzard-pass-bg', 'assets/backgrounds/blizzard-pass-bg.png'); }
    create() {
        this.add.image(400, 225, 'blizzard-pass-bg');
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        for (let i = 0; i < 7; i++) {
            const x = 150 + i * 90;
            const enemy = new Enemy(this, x, 340, 'ice_wolf', 25);
            enemy.speed = 120; enemy.aggroRange = 300; enemy.damage = 12;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        }

        this.add.text(400, 50, 'Blizzard Pass', { fontSize: '20px', fill: '#ccddff' }).setOrigin(0.5);
        this.questText = this.add.text(400, 430, '', { fontSize: '12px', fill: '#ffdd00' }).setOrigin(0.5);
        this.transitioning = false;
    }
    update() {
        this.player.update();
        this.hud.update();
        this.enemies.children.each(enemy => { if (!enemy.isDead) enemy.update(this.player); });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        const alive = this.enemies.countActive();
        if (!GameState.quests.tundra.blizzard) {
            this.questText.setText('Wolves remaining: ' + alive);
            if (alive === 0) {
                GameState.quests.tundra.blizzard = true;
                this.questText.setText('Quest Complete: Pass Cleared!');
            }
        } else {
            this.questText.setText('Pass Cleared!');
        }

        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('SnowCave');
        }
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('IceFortress');
        }
        if (GameState.health <= 0) {
            GameState.health = GameState.maxHealth;
            this.scene.restart();
        }
    }
}
```

**Step 4: Commit**

```bash
git add js/scenes/FrozenLakeScene.js js/scenes/SnowCaveScene.js js/scenes/BlizzardPassScene.js
git commit -m "add 3 tundra sub-area scenes with quest tracking"
```

---

### Task 9: Tundra Mini-Game (Target Practice)

**Files:**
- Create: `js/scenes/TundraTargetPracticeScene.js`

**Step 1: Create target practice mini-game**

5 targets move across screen. Player presses SPACE (attack key) when target overlaps a "strike zone" in the center. Hit 5 targets within 30 seconds to win.

```js
class TundraTargetPracticeScene extends Phaser.Scene {
    constructor() { super('TundraTargetPractice'); }
    preload() { this.load.image('target-practice-bg', 'assets/backgrounds/target-practice-bg.png'); }
    create() {
        this.add.image(400, 225, 'target-practice-bg');

        this.add.text(400, 30, 'Target Practice', { fontSize: '20px', fill: '#ffdd00' }).setOrigin(0.5);
        this.add.text(400, 55, 'Press SPACE when targets cross the center!', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5);

        // Strike zone indicator
        this.add.rectangle(400, 250, 60, 200, 0xffdd00, 0.15).setDepth(1);
        this.add.rectangle(400, 250, 4, 200, 0xffdd00, 0.5).setDepth(1);

        this.hits = 0;
        this.targetGoal = 5;
        this.timeLeft = 30;
        this.gameOver = false;

        this.hitsText = this.add.text(20, 80, 'Hits: 0/5', { fontSize: '16px', fill: '#ffdd00' }).setDepth(10);
        this.timerText = this.add.text(700, 80, 'Time: 30', { fontSize: '16px', fill: '#fff' }).setDepth(10);
        this.resultText = this.add.text(400, 225, '', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setDepth(10);

        // Spawn targets periodically
        this.targets = [];
        this.spawnTimer = this.time.addEvent({
            delay: 1500,
            callback: this.spawnTarget,
            callbackScope: this,
            loop: true
        });

        // Countdown timer
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('Time: ' + this.timeLeft);
                if (this.timeLeft <= 0) this.endGame(false);
            },
            callbackScope: this,
            loop: true
        });

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.spawnTarget();
    }

    spawnTarget() {
        if (this.gameOver) return;
        const fromLeft = Math.random() > 0.5;
        const x = fromLeft ? -20 : 820;
        const y = 150 + Math.random() * 200;
        const speed = (100 + Math.random() * 100) * (fromLeft ? 1 : -1);

        const t = this.add.sprite(x, y, 'target');
        t.play('target_idle');
        t.setScale(2);
        t.speed = speed;
        t.hit = false;
        this.targets.push(t);
    }

    update() {
        if (this.gameOver) return;

        // Move targets
        this.targets.forEach(t => {
            if (!t.hit) t.x += t.speed * (this.game.loop.delta / 1000);
        });

        // Remove off-screen targets
        this.targets = this.targets.filter(t => {
            if (t.x < -50 || t.x > 850) { t.destroy(); return false; }
            return true;
        });

        // SPACE to strike
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            let hitOne = false;
            this.targets.forEach(t => {
                if (!t.hit && Math.abs(t.x - 400) < 40) {
                    t.hit = true;
                    t.setTint(0x00ff00);
                    this.tweens.add({
                        targets: t, alpha: 0, duration: 300,
                        onComplete: () => t.destroy()
                    });
                    this.hits++;
                    hitOne = true;
                }
            });
            if (!hitOne) {
                // Miss flash
                this.cameras.main.flash(100, 255, 0, 0, true);
            }
            this.hitsText.setText('Hits: ' + this.hits + '/' + this.targetGoal);
            if (this.hits >= this.targetGoal) this.endGame(true);
        }
    }

    endGame(won) {
        this.gameOver = true;
        this.spawnTimer.destroy();
        this.countdownTimer.destroy();

        if (won) {
            GameState.quests.tundra.miniGame = true;
            this.resultText.setText('Nice shooting!');
            this.resultText.setFill('#00ff00');
        } else {
            this.resultText.setText('Time\'s up! Try again?');
            this.resultText.setFill('#ff4444');
        }

        this.time.delayedCall(2000, () => {
            this.scene.start('TundraVillage');
        });
    }
}
```

**Step 2: Commit**

```bash
git add js/scenes/TundraTargetPracticeScene.js
git commit -m "add TundraTargetPractice mini-game scene"
```

---

### Task 10: Quest Gate for IceFortressScene + Tundra→DarkForest Transition

**Files:**
- Modify: `js/scenes/IceFortressScene.js` (add quest gate)
- Modify: `js/scenes/TundraScene.js` (update to be unused, or redirect)

**Step 1: Add quest gate to IceFortressScene**

At the top of `IceFortressScene.create()`, after the background and ground setup but before spawning enemies, add a quest gate check:

```js
// Quest gate check
const q = GameState.quests.tundra;
this.questsComplete = q.wolves && q.amulet && q.blizzard && q.miniGame;
if (!this.questsComplete) {
    this.add.text(400, 200, 'The gate is sealed...', {
        fontSize: '18px', fill: '#ff4444'
    }).setOrigin(0.5);
    this.add.text(400, 230, 'Complete all village quests first!', {
        fontSize: '12px', fill: '#aaa'
    }).setOrigin(0.5);
}
```

Then wrap the enemy spawning and combat logic to only run if `this.questsComplete` is true. In `update()`, if `!this.questsComplete`, only let the player move and go back left:

```js
// In update(), at the start:
if (!this.questsComplete) {
    this.player.update();
    this.hud.update();
    if (this.player.x < 20) this.scene.start('BlizzardPass');
    return;
}
```

Also change the transition target: when all enemies are dead and player goes right, go to `'FrostGiantArena'` (this already exists).

**Step 2: Update FrostGiantArenaScene transition**

In `FrostGiantArenaScene.js`, the boss defeat transition should go to `'ForestVillage'` instead of `'DarkForest'`. Find the boss death callback and change the scene.start target.

**Step 3: Commit**

```bash
git add js/scenes/IceFortressScene.js js/scenes/FrostGiantArenaScene.js
git commit -m "add quest gate to IceFortress, transition to ForestVillage after Frost Giant"
```

---

### Task 11: Forest Village Scene

**Files:**
- Create: `js/scenes/ForestVillageScene.js`

**Step 1: Create ForestVillageScene**

Same pattern as TundraVillageScene but with Dark Forest quest NPCs (Herbalist, Mother, Warrior) and obstacle course mini-game entrance. Uses `'darkforest'` quest keys.

```js
class ForestVillageScene extends Phaser.Scene {
    constructor() { super('ForestVillage'); }
    preload() { this.load.image('forest-village-bg', 'assets/backgrounds/forest-village-bg.png'); }
    create() {
        this.add.image(400, 225, 'forest-village-bg');
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);
        this.dialogue = new DialogueBox(this);
        this.shop = new ShopMenu(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.herbalist = this.physics.add.sprite(200, 340, 'village_npc_2');
        this.herbalist.play('village_npc_2_idle');
        this.herbalist.setScale(2);
        this.physics.add.collider(this.herbalist, this.ground);

        this.mother = this.physics.add.sprite(350, 340, 'village_npc_3');
        this.mother.play('village_npc_3_idle');
        this.mother.setScale(2);
        this.physics.add.collider(this.mother, this.ground);

        this.warrior = this.physics.add.sprite(500, 340, 'village_npc_1');
        this.warrior.play('village_npc_1_idle');
        this.warrior.setScale(2);
        this.physics.add.collider(this.warrior, this.ground);

        this.shopNpc = this.physics.add.sprite(650, 340, 'shopkeeper');
        this.shopNpc.play('shopkeeper_idle');
        this.shopNpc.setScale(2);
        this.physics.add.collider(this.shopNpc, this.ground);

        this.npcs = [
            { sprite: this.herbalist, name: 'Herbalist' },
            { sprite: this.mother, name: 'Mother' },
            { sprite: this.warrior, name: 'Warrior' },
            { sprite: this.shopNpc, name: 'Shop' }
        ];

        this.talkPrompt = this.add.text(0, 0, 'Press E to talk', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        this.miniGameSign = this.add.text(100, 350, '[Obstacle Course]', {
            fontSize: '10px', fill: '#88ff88'
        }).setOrigin(0.5).setDepth(50);

        this.add.text(400, 30, 'Forest Village', { fontSize: '18px', fill: '#88ff88' }).setOrigin(0.5);
        this.questStatus = this.add.text(400, 430, '', { fontSize: '10px', fill: '#aaa' }).setOrigin(0.5).setDepth(50);
        this.transitioning = false;
    }
    update() {
        if (!this.dialogue.isOpen && !this.shop.isOpen) this.player.update();
        this.hud.update();
        this.dialogue.update();
        this.shop.update();

        const q = GameState.quests.darkforest;
        const done = [q.mushrooms, q.villager, q.nest, q.miniGame].filter(Boolean).length;
        this.questStatus.setText('Quests: ' + done + '/4 complete');

        let nearest = null;
        let nearDist = Infinity;
        this.npcs.forEach(npc => {
            const d = Math.abs(this.player.x - npc.sprite.x);
            if (d < 80 && d < nearDist) { nearest = npc; nearDist = d; }
        });

        if (nearest && !this.dialogue.isOpen && !this.shop.isOpen) {
            this.talkPrompt.setPosition(nearest.sprite.x, nearest.sprite.y - 60);
            this.talkPrompt.setVisible(true);
        } else {
            this.talkPrompt.setVisible(false);
        }

        if (!this.dialogue.isOpen && !this.shop.isOpen && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            if (nearest) {
                if (nearest.name === 'Shop') {
                    this.shop.open('darkforest');
                } else if (nearest.name === 'Herbalist') {
                    if (q.mushrooms) {
                        this.dialogue.open('Herbalist', ['These mushrooms are perfect! Thank you!']);
                    } else {
                        this.dialogue.open('Herbalist', [
                            'I need 3 glowing mushrooms from the Mushroom Grove.',
                            'They glow bright blue. Collect them for me!',
                            'The grove is east of here.'
                        ]);
                    }
                } else if (nearest.name === 'Mother') {
                    if (q.villager) {
                        this.dialogue.open('Mother', ['My child is safe! Thank you so much!']);
                    } else {
                        this.dialogue.open('Mother', [
                            'My child wandered into the Cursed Swamp!',
                            'Please find them and bring them back!',
                            'The swamp is past the Mushroom Grove...'
                        ]);
                    }
                } else if (nearest.name === 'Warrior') {
                    if (q.nest) {
                        this.dialogue.open('Warrior', ['The nest is destroyed. Well fought!']);
                    } else {
                        this.dialogue.open('Warrior', [
                            'Shadow beasts have a nest in the Hollow Tree.',
                            'Destroy every last one of them!',
                            'It\'s the furthest area east.'
                        ]);
                    }
                }
            }
            if (Math.abs(this.player.x - 100) < 50) {
                if (q.miniGame) {
                    this.dialogue.open('', ['You already completed the obstacle course!']);
                } else {
                    this.scene.start('ForestObstacleCourse');
                }
            }
        }

        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('MushroomGrove');
        }
    }
}
```

**Step 2: Commit**

```bash
git add js/scenes/ForestVillageScene.js
git commit -m "add ForestVillageScene with quest NPCs, shop, and obstacle course entrance"
```

---

### Task 12: Dark Forest Sub-Area Scenes

**Files:**
- Create: `js/scenes/MushroomGroveScene.js`
- Create: `js/scenes/CursedSwampScene.js`
- Create: `js/scenes/HollowTreeScene.js`

**Step 1: Create MushroomGroveScene**

Collect 3 mushrooms (same collectible sprite, counter tracks pickups).

```js
class MushroomGroveScene extends Phaser.Scene {
    constructor() { super('MushroomGrove'); }
    preload() { this.load.image('mushroom-grove-bg', 'assets/backgrounds/mushroom-grove-bg.png'); }
    create() {
        this.add.image(400, 225, 'mushroom-grove-bg');
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        for (let i = 0; i < 5; i++) {
            const x = 200 + i * 120;
            const enemy = new Enemy(this, x, 340, 'shadow_beast', 12);
            enemy.speed = 120; enemy.aggroRange = 250; enemy.damage = 15;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        }

        // 3 collectible mushrooms
        this.mushroomsCollected = 0;
        this.mushrooms = [];
        if (!GameState.quests.darkforest.mushrooms) {
            [250, 450, 650].forEach(x => {
                const m = this.physics.add.sprite(x, 390, 'collectible');
                m.play('collectible_idle');
                m.setScale(2);
                this.physics.add.collider(m, this.ground);
                this.mushrooms.push(m);
            });
        }

        this.pickupPrompt = this.add.text(0, 0, 'Press E', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        this.add.text(400, 50, 'Mushroom Grove', { fontSize: '20px', fill: '#88ff88' }).setOrigin(0.5);
        this.questText = this.add.text(400, 430, '', { fontSize: '12px', fill: '#ffdd00' }).setOrigin(0.5);
        this.transitioning = false;
    }
    update() {
        this.player.update();
        this.hud.update();
        this.enemies.children.each(enemy => { if (!enemy.isDead) enemy.update(this.player); });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Mushroom pickup
        this.pickupPrompt.setVisible(false);
        this.mushrooms.forEach((m, i) => {
            if (!m.active) return;
            const dist = Math.abs(this.player.x - m.x);
            if (dist < 50) {
                this.pickupPrompt.setPosition(m.x, m.y - 30);
                this.pickupPrompt.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                    m.destroy();
                    this.mushroomsCollected++;
                    if (this.mushroomsCollected >= 3) {
                        GameState.quests.darkforest.mushrooms = true;
                    }
                }
            }
        });

        if (GameState.quests.darkforest.mushrooms) {
            this.questText.setText('Mushrooms Collected!');
        } else {
            this.questText.setText('Mushrooms: ' + this.mushroomsCollected + '/3');
        }

        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('ForestVillage');
        }
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('CursedSwamp');
        }
        if (GameState.health <= 0) { GameState.health = GameState.maxHealth; this.scene.restart(); }
    }
}
```

**Step 2: Create CursedSwampScene**

Rescue lost child NPC at far right of scene.

```js
class CursedSwampScene extends Phaser.Scene {
    constructor() { super('CursedSwamp'); }
    preload() { this.load.image('cursed-swamp-bg', 'assets/backgrounds/cursed-swamp-bg.png'); }
    create() {
        this.add.image(400, 225, 'cursed-swamp-bg');
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);
        this.dialogue = new DialogueBox(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        for (let i = 0; i < 6; i++) {
            const x = 150 + i * 100;
            const enemy = new Enemy(this, x, 340, 'shadow_beast', 12);
            enemy.speed = 120; enemy.aggroRange = 250; enemy.damage = 15;
            enemy.goldValue = 8;
            this.enemies.add(enemy);
        }

        // Lost child at far right
        this.child = null;
        if (!GameState.quests.darkforest.villager) {
            this.child = this.physics.add.sprite(720, 360, 'lost_child');
            this.child.play('lost_child_idle');
            this.child.setScale(2);
            this.physics.add.collider(this.child, this.ground);
        }

        this.talkPrompt = this.add.text(0, 0, 'Press E', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        this.add.text(400, 50, 'Cursed Swamp', { fontSize: '20px', fill: '#44aa44' }).setOrigin(0.5);
        this.questText = this.add.text(400, 430, '', { fontSize: '12px', fill: '#ffdd00' }).setOrigin(0.5);
        this.transitioning = false;
    }
    update() {
        if (!this.dialogue.isOpen) this.player.update();
        this.hud.update();
        this.dialogue.update();
        this.enemies.children.each(enemy => { if (!enemy.isDead) enemy.update(this.player); });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Rescue child
        if (this.child && !GameState.quests.darkforest.villager) {
            const dist = Math.abs(this.player.x - this.child.x);
            if (dist < 60 && !this.dialogue.isOpen) {
                this.talkPrompt.setPosition(this.child.x, this.child.y - 40);
                this.talkPrompt.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                    this.dialogue.open('Lost Child', [
                        'You found me! I was so scared!',
                        'Thank you! I\'ll run back to the village!'
                    ], () => {
                        GameState.quests.darkforest.villager = true;
                        this.child.destroy();
                        this.child = null;
                    });
                }
            } else {
                this.talkPrompt.setVisible(false);
            }
        }

        this.questText.setText(GameState.quests.darkforest.villager ? 'Child Rescued!' : 'Find the lost child...');

        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('MushroomGrove');
        }
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('HollowTree');
        }
        if (GameState.health <= 0) { GameState.health = GameState.maxHealth; this.scene.restart(); }
    }
}
```

**Step 3: Create HollowTreeScene**

Clear all enemies quest with tougher shadow beasts.

```js
class HollowTreeScene extends Phaser.Scene {
    constructor() { super('HollowTree'); }
    preload() { this.load.image('hollow-tree-bg', 'assets/backgrounds/hollow-tree-bg.png'); }
    create() {
        this.add.image(400, 225, 'hollow-tree-bg');
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        for (let i = 0; i < 8; i++) {
            const x = 120 + i * 85;
            const enemy = new Enemy(this, x, 340, 'shadow_beast', 20);
            enemy.speed = 140; enemy.aggroRange = 300; enemy.damage = 18;
            enemy.goldValue = 10;
            this.enemies.add(enemy);
        }

        this.add.text(400, 50, 'Hollow Tree', { fontSize: '20px', fill: '#668844' }).setOrigin(0.5);
        this.questText = this.add.text(400, 430, '', { fontSize: '12px', fill: '#ffdd00' }).setOrigin(0.5);
        this.transitioning = false;
    }
    update() {
        this.player.update();
        this.hud.update();
        this.enemies.children.each(enemy => { if (!enemy.isDead) enemy.update(this.player); });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        const alive = this.enemies.countActive();
        if (!GameState.quests.darkforest.nest) {
            this.questText.setText('Shadow Beasts: ' + alive + ' remaining');
            if (alive === 0) {
                GameState.quests.darkforest.nest = true;
                this.questText.setText('Quest Complete: Nest Destroyed!');
            }
        } else {
            this.questText.setText('Nest Destroyed!');
        }

        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('CursedSwamp');
        }
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('ShadowKeep');
        }
        if (GameState.health <= 0) { GameState.health = GameState.maxHealth; this.scene.restart(); }
    }
}
```

**Step 4: Commit**

```bash
git add js/scenes/MushroomGroveScene.js js/scenes/CursedSwampScene.js js/scenes/HollowTreeScene.js
git commit -m "add 3 dark forest sub-area scenes with quest tracking"
```

---

### Task 13: Forest Obstacle Course Mini-Game

**Files:**
- Create: `js/scenes/ForestObstacleCourseScene.js`

**Step 1: Create obstacle course**

Auto-scrolling scene. Player can jump (SPACE/UP) and duck (DOWN). Obstacles come from the right. Reach the end (survive 30 seconds) to win. 3 lives.

```js
class ForestObstacleCourseScene extends Phaser.Scene {
    constructor() { super('ForestObstacleCourse'); }
    preload() { this.load.image('obstacle-course-bg', 'assets/backgrounds/obstacle-course-bg.png'); }
    create() {
        this.add.image(400, 225, 'obstacle-course-bg');

        this.add.text(400, 30, 'Obstacle Course', { fontSize: '20px', fill: '#88ff88' }).setOrigin(0.5);
        this.add.text(400, 55, 'JUMP over low obstacles, DUCK under high ones!', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5);

        // Ground
        this.ground = this.add.rectangle(400, 400, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        // Player (simplified - just a rectangle)
        this.runner = this.add.rectangle(150, 370, 24, 48, 0x44aaff);
        this.physics.add.existing(this.runner);
        this.runner.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.runner, this.ground);

        this.lives = 3;
        this.timeLeft = 30;
        this.gameOver = false;
        this.isDucking = false;
        this.isInvulnerable = false;

        this.livesText = this.add.text(20, 80, 'Lives: 3', { fontSize: '16px', fill: '#ff4444' }).setDepth(10);
        this.timerText = this.add.text(700, 80, 'Time: 30', { fontSize: '16px', fill: '#fff' }).setDepth(10);
        this.resultText = this.add.text(400, 225, '', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setDepth(10);

        // Obstacles
        this.obstacles = [];
        this.obstacleTimer = this.time.addEvent({
            delay: 1200,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('Time: ' + this.timeLeft);
                if (this.timeLeft <= 0) this.endGame(true);
            },
            callbackScope: this,
            loop: true
        });

        this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    spawnObstacle() {
        if (this.gameOver) return;
        const isHigh = Math.random() > 0.5;
        const y = isHigh ? 340 : 380;
        const h = isHigh ? 30 : 20;
        const color = isHigh ? 0xff4444 : 0xffaa00;

        const obs = this.add.rectangle(820, y, 24, h, color);
        this.physics.add.existing(obs);
        obs.body.setAllowGravity(false);
        obs.body.setVelocityX(-250);
        obs.isHigh = isHigh;
        this.obstacles.push(obs);
    }

    update() {
        if (this.gameOver) return;

        // Jump
        if ((Phaser.Input.Keyboard.JustDown(this.jumpKey) || Phaser.Input.Keyboard.JustDown(this.upKey))
            && this.runner.body.touching.down) {
            this.runner.body.setVelocityY(-400);
        }

        // Duck
        if (this.downKey.isDown) {
            if (!this.isDucking) {
                this.isDucking = true;
                this.runner.setSize(24, 24);
                this.runner.y += 12;
            }
        } else {
            if (this.isDucking) {
                this.isDucking = false;
                this.runner.setSize(24, 48);
                this.runner.y -= 12;
            }
        }

        // Check collisions
        this.obstacles = this.obstacles.filter(obs => {
            if (obs.x < -50) { obs.destroy(); return false; }

            if (!this.isInvulnerable) {
                const b1 = this.runner.getBounds();
                const b2 = obs.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    this.hitObstacle();
                }
            }
            return true;
        });
    }

    hitObstacle() {
        this.lives--;
        this.livesText.setText('Lives: ' + this.lives);
        this.isInvulnerable = true;
        this.runner.setFillStyle(0xff0000);
        this.cameras.main.flash(100, 255, 0, 0, true);
        this.time.delayedCall(1000, () => {
            this.isInvulnerable = false;
            this.runner.setFillStyle(0x44aaff);
        });
        if (this.lives <= 0) this.endGame(false);
    }

    endGame(won) {
        this.gameOver = true;
        this.obstacleTimer.destroy();
        this.countdownTimer.destroy();

        if (won) {
            GameState.quests.darkforest.miniGame = true;
            this.resultText.setText('You made it!');
            this.resultText.setFill('#00ff00');
        } else {
            this.resultText.setText('Knocked out! Try again?');
            this.resultText.setFill('#ff4444');
        }

        this.time.delayedCall(2000, () => {
            this.scene.start('ForestVillage');
        });
    }
}
```

**Step 2: Commit**

```bash
git add js/scenes/ForestObstacleCourseScene.js
git commit -m "add ForestObstacleCourse mini-game scene"
```

---

### Task 14: Quest Gate for ShadowKeep + Forest→Ruins Transition

**Files:**
- Modify: `js/scenes/ShadowKeepScene.js`
- Modify: `js/scenes/ShadowLordArenaScene.js`

**Step 1: Add quest gate to ShadowKeepScene**

Same pattern as Task 10. In `create()`, check `GameState.quests.darkforest`:

```js
const q = GameState.quests.darkforest;
this.questsComplete = q.mushrooms && q.villager && q.nest && q.miniGame;
```

If not complete, show "gate sealed" message and only allow going back left (to `'HollowTree'`).

**Step 2: Update ShadowLordArenaScene transition**

Change boss defeat transition to `'RuinsVillage'` instead of `'Ruins'`.

**Step 3: Commit**

```bash
git add js/scenes/ShadowKeepScene.js js/scenes/ShadowLordArenaScene.js
git commit -m "add quest gate to ShadowKeep, transition to RuinsVillage after Shadow Lord"
```

---

### Task 15: Ruins Village Scene

**Files:**
- Create: `js/scenes/RuinsVillageScene.js`

**Step 1: Create RuinsVillageScene**

Same pattern as TundraVillageScene but with Ruins quest NPCs (Builder, Scholar, Priestess) and memory puzzle mini-game. Uses `'ruins'` quest keys.

Follow the exact same structure as `TundraVillageScene` (Task 7) but with:
- Background: `'ruins-village-bg'`
- Title: `'Ruins Village'` in `'#ddaa44'`
- NPCs: Builder (bridge quest), Scholar (scroll quest), Priestess (runes quest)
- Mini-game sign: `[Memory Puzzle]`
- Shop area: `'ruins'`
- Quest keys: `GameState.quests.ruins`
- Exit right → `'CrumblingBridge'`
- Mini-game → `'RuinsMemoryPuzzle'`

Builder dialogue (not done): "Stone golems guard the Crumbling Bridge. Defeat them all!" / (done): "The bridge is safe now!"
Scholar dialogue (not done): "An ancient scroll is in the Buried Library. Find it!" / (done): "The scroll! Ancient knowledge preserved!"
Priestess dialogue (not done): "Activate 3 rune stones in the Lava Pit." / (done): "The runes are sealed. Thank you!"

**Step 2: Commit**

```bash
git add js/scenes/RuinsVillageScene.js
git commit -m "add RuinsVillageScene with quest NPCs, shop, and memory puzzle entrance"
```

---

### Task 16: Ruins Sub-Area Scenes

**Files:**
- Create: `js/scenes/CrumblingBridgeScene.js`
- Create: `js/scenes/BuriedLibraryScene.js`
- Create: `js/scenes/LavaPitScene.js`

**Step 1: Create CrumblingBridgeScene**

Kill-all-enemies quest. Same pattern as BlizzardPassScene but with stone golems.

- 5 stone golems: HP 50, speed 40, aggroRange 180, damage 20, goldValue 12
- Background: `'crumbling-bridge-bg'`
- Quest key: `GameState.quests.ruins.bridge` (set true when all dead)
- Exit left → `'RuinsVillage'`, exit right → `'BuriedLibrary'`

**Step 2: Create BuriedLibraryScene**

Fetch-quest scene. Same pattern as SnowCaveScene but with stone golems and scroll collectible.

- 6 stone golems: HP 50, speed 40, aggroRange 180, damage 20, goldValue 12
- Collectible scroll at x=650
- Background: `'buried-library-bg'`
- Quest key: `GameState.quests.ruins.scroll`
- Exit left → `'CrumblingBridge'`, exit right → `'LavaPit'`

**Step 3: Create LavaPitScene**

Rune activation quest. 7 tougher stone golems + 3 rune stones (collectible sprites). Player must press E near each rune to activate it. All 3 activated = quest complete.

- 7 stone golems: HP 70, speed 50, aggroRange 200, damage 25, goldValue 15
- 3 rune stones at x=250, 450, 650
- Background: `'lava-pit-bg'`
- Quest key: `GameState.quests.ruins.runes` (set true when all 3 activated)
- Exit left → `'BuriedLibrary'`, exit right → `'ShatteredTemple'`

```js
class LavaPitScene extends Phaser.Scene {
    constructor() { super('LavaPit'); }
    preload() { this.load.image('lava-pit-bg', 'assets/backgrounds/lava-pit-bg.png'); }
    create() {
        this.add.image(400, 225, 'lava-pit-bg');
        this.ground = this.add.rectangle(400, 415, 800, 20);
        this.ground.setVisible(false);
        this.physics.add.existing(this.ground, true);

        this.player = new Player(this, 50, 340);
        this.player.attackDamage = 25 + GameState.attackBonus;
        this.physics.add.collider(this.player, this.ground);
        this.hud = new HUD(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.enemies = this.physics.add.group();
        this.physics.add.collider(this.enemies, this.ground);
        for (let i = 0; i < 7; i++) {
            const x = 120 + i * 95;
            const enemy = new Enemy(this, x, 340, 'stone_golem', 70);
            enemy.speed = 50; enemy.aggroRange = 200; enemy.damage = 25;
            enemy.goldValue = 15;
            this.enemies.add(enemy);
        }

        // 3 rune stones
        this.runesActivated = 0;
        this.runes = [];
        if (!GameState.quests.ruins.runes) {
            [250, 450, 650].forEach(x => {
                const r = this.physics.add.sprite(x, 390, 'collectible');
                r.play('collectible_idle');
                r.setScale(2);
                r.activated = false;
                this.physics.add.collider(r, this.ground);
                this.runes.push(r);
            });
        }

        this.pickupPrompt = this.add.text(0, 0, 'Press E to activate', {
            fontSize: '12px', fill: '#ffdd00'
        }).setOrigin(0.5).setVisible(false).setDepth(50);

        this.add.text(400, 50, 'Lava Pit', { fontSize: '20px', fill: '#ff6644' }).setOrigin(0.5);
        this.questText = this.add.text(400, 430, '', { fontSize: '12px', fill: '#ffdd00' }).setOrigin(0.5);
        this.transitioning = false;
    }
    update() {
        this.player.update();
        this.hud.update();
        this.enemies.children.each(enemy => { if (!enemy.isDead) enemy.update(this.player); });

        if (this.player.attackHitbox) {
            this.enemies.children.each(enemy => {
                if (enemy.isDead || enemy.justHit) return;
                const b1 = this.player.attackHitbox.getBounds();
                const b2 = enemy.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
                    enemy.takeDamage(this.player.currentHitDamage);
                    enemy.justHit = true;
                    this.time.delayedCall(300, () => { if (enemy) enemy.justHit = false; });
                }
            });
        }

        // Rune activation
        this.pickupPrompt.setVisible(false);
        this.runes.forEach(r => {
            if (r.activated) return;
            const dist = Math.abs(this.player.x - r.x);
            if (dist < 50) {
                this.pickupPrompt.setPosition(r.x, r.y - 30);
                this.pickupPrompt.setVisible(true);
                if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
                    r.activated = true;
                    r.setTint(0x00ff00);
                    this.runesActivated++;
                    if (this.runesActivated >= 3) {
                        GameState.quests.ruins.runes = true;
                    }
                }
            }
        });

        if (GameState.quests.ruins.runes) {
            this.questText.setText('Runes Sealed!');
        } else {
            this.questText.setText('Runes: ' + this.runesActivated + '/3 activated');
        }

        if (!this.transitioning && this.player.x < 20) {
            this.transitioning = true;
            this.scene.start('BuriedLibrary');
        }
        if (!this.transitioning && this.player.x > 750) {
            this.transitioning = true;
            this.scene.start('ShatteredTemple');
        }
        if (GameState.health <= 0) { GameState.health = GameState.maxHealth; this.scene.restart(); }
    }
}
```

**Step 4: Commit**

```bash
git add js/scenes/CrumblingBridgeScene.js js/scenes/BuriedLibraryScene.js js/scenes/LavaPitScene.js
git commit -m "add 3 ruins sub-area scenes with quest tracking"
```

---

### Task 17: Ruins Memory Puzzle Mini-Game

**Files:**
- Create: `js/scenes/RuinsMemoryPuzzleScene.js`

**Step 1: Create memory puzzle**

4 rune symbols (colored rectangles). Game shows a sequence, player repeats it by pressing 1-4 keys. 3 rounds (sequence length 3, 4, 5). Complete all rounds to win.

```js
class RuinsMemoryPuzzleScene extends Phaser.Scene {
    constructor() { super('RuinsMemoryPuzzle'); }
    preload() { this.load.image('memory-puzzle-bg', 'assets/backgrounds/memory-puzzle-bg.png'); }
    create() {
        this.add.image(400, 225, 'memory-puzzle-bg');

        this.add.text(400, 30, 'Memory Puzzle', { fontSize: '20px', fill: '#ddaa44' }).setOrigin(0.5);
        this.add.text(400, 55, 'Watch the sequence, then repeat it with 1-2-3-4 keys!', {
            fontSize: '12px', fill: '#fff'
        }).setOrigin(0.5);

        // 4 rune pedestals
        this.colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
        this.dimColors = [0x661111, 0x116611, 0x111166, 0x666611];
        this.runes = [];
        for (let i = 0; i < 4; i++) {
            const x = 200 + i * 150;
            const r = this.add.rectangle(x, 280, 80, 80, this.dimColors[i]);
            r.setStrokeStyle(3, 0xffffff);
            this.runes.push(r);
            this.add.text(x, 340, '' + (i + 1), { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        }

        this.round = 0;
        this.sequenceLengths = [3, 4, 5];
        this.sequence = [];
        this.playerInput = [];
        this.isShowingSequence = false;
        this.gameOver = false;

        this.roundText = this.add.text(400, 180, '', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
        this.resultText = this.add.text(400, 400, '', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

        // Number keys 1-4
        this.numKeys = [
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR)
        ];

        this.startRound();
    }

    startRound() {
        if (this.round >= this.sequenceLengths.length) {
            this.endGame(true);
            return;
        }

        const len = this.sequenceLengths[this.round];
        this.sequence = [];
        for (let i = 0; i < len; i++) {
            this.sequence.push(Math.floor(Math.random() * 4));
        }
        this.playerInput = [];
        this.roundText.setText('Round ' + (this.round + 1) + ' - Watch carefully!');
        this.isShowingSequence = true;

        // Show sequence with delays
        this.sequence.forEach((idx, i) => {
            this.time.delayedCall(800 + i * 600, () => {
                this.flashRune(idx);
            });
        });

        // After sequence shown, allow input
        this.time.delayedCall(800 + this.sequence.length * 600 + 300, () => {
            this.isShowingSequence = false;
            this.roundText.setText('Round ' + (this.round + 1) + ' - Your turn!');
        });
    }

    flashRune(idx) {
        this.runes[idx].setFillStyle(this.colors[idx]);
        this.time.delayedCall(400, () => {
            this.runes[idx].setFillStyle(this.dimColors[idx]);
        });
    }

    update() {
        if (this.gameOver || this.isShowingSequence) return;

        for (let i = 0; i < 4; i++) {
            if (Phaser.Input.Keyboard.JustDown(this.numKeys[i])) {
                this.flashRune(i);
                this.playerInput.push(i);

                const idx = this.playerInput.length - 1;
                if (this.playerInput[idx] !== this.sequence[idx]) {
                    // Wrong!
                    this.resultText.setText('Wrong! Try again...');
                    this.resultText.setFill('#ff4444');
                    this.time.delayedCall(1500, () => {
                        this.resultText.setText('');
                        this.startRound();
                    });
                    return;
                }

                if (this.playerInput.length === this.sequence.length) {
                    // Round complete!
                    this.round++;
                    this.resultText.setText('Correct!');
                    this.resultText.setFill('#00ff00');
                    this.time.delayedCall(1000, () => {
                        this.resultText.setText('');
                        this.startRound();
                    });
                }
            }
        }
    }

    endGame(won) {
        this.gameOver = true;
        if (won) {
            GameState.quests.ruins.miniGame = true;
            this.resultText.setText('Puzzle Solved!');
            this.resultText.setFill('#00ff00');
        }
        this.time.delayedCall(2000, () => {
            this.scene.start('RuinsVillage');
        });
    }
}
```

**Step 2: Commit**

```bash
git add js/scenes/RuinsMemoryPuzzleScene.js
git commit -m "add RuinsMemoryPuzzle mini-game scene"
```

---

### Task 18: Quest Gate for ShatteredTemple

**Files:**
- Modify: `js/scenes/ShatteredTempleScene.js`

**Step 1: Add quest gate**

Same pattern as Tasks 10 and 14. Check `GameState.quests.ruins`:

```js
const q = GameState.quests.ruins;
this.questsComplete = q.bridge && q.scroll && q.runes && q.miniGame;
```

If not complete, show sealed message, only allow going back left to `'LavaPit'`.

**Step 2: Commit**

```bash
git add js/scenes/ShatteredTempleScene.js
git commit -m "add quest gate to ShatteredTemple"
```

---

### Task 19: Wire Up Everything (index.html + main.js)

**Files:**
- Modify: `index.html` (add script tags)
- Modify: `js/main.js` (add scenes to config)

**Step 1: Add new script tags to index.html**

Add these script tags BEFORE `<script src="js/main.js"></script>`:

```html
<script src="js/ShopMenu.js"></script>
<script src="js/scenes/TundraVillageScene.js"></script>
<script src="js/scenes/FrozenLakeScene.js"></script>
<script src="js/scenes/SnowCaveScene.js"></script>
<script src="js/scenes/BlizzardPassScene.js"></script>
<script src="js/scenes/TundraTargetPracticeScene.js"></script>
<script src="js/scenes/ForestVillageScene.js"></script>
<script src="js/scenes/MushroomGroveScene.js"></script>
<script src="js/scenes/CursedSwampScene.js"></script>
<script src="js/scenes/HollowTreeScene.js"></script>
<script src="js/scenes/ForestObstacleCourseScene.js"></script>
<script src="js/scenes/RuinsVillageScene.js"></script>
<script src="js/scenes/CrumblingBridgeScene.js"></script>
<script src="js/scenes/BuriedLibraryScene.js"></script>
<script src="js/scenes/LavaPitScene.js"></script>
<script src="js/scenes/RuinsMemoryPuzzleScene.js"></script>
```

**Step 2: Add scenes to Phaser config in main.js**

Update the scene array to include all new scenes:

```js
scene: [
    BootScene,
    VillageScene, WoodsDayScene, WoodsNightScene,
    BossArenaScene, VictoryScene,
    TundraVillageScene, FrozenLakeScene, SnowCaveScene, BlizzardPassScene,
    TundraTargetPracticeScene,
    TundraScene, IceFortressScene, FrostGiantArenaScene,
    ForestVillageScene, MushroomGroveScene, CursedSwampScene, HollowTreeScene,
    ForestObstacleCourseScene,
    DarkForestScene, ShadowKeepScene, ShadowLordArenaScene,
    RuinsVillageScene, CrumblingBridgeScene, BuriedLibraryScene, LavaPitScene,
    RuinsMemoryPuzzleScene,
    RuinsScene, ShatteredTempleScene, RuneGuardianArenaScene,
    FinalVictoryScene
]
```

**Step 3: Test the full game**

Open in browser and play through:
1. Village → Woods Day → find sword → Village → Woods Night → Boss Arena → Victory
2. Victory wall crack → Tundra Village (should appear instead of Tundra)
3. Talk to all NPCs, visit shop, do target practice
4. Clear FrozenLake, SnowCave (find amulet), BlizzardPass
5. Try entering IceFortress with quests incomplete (should be sealed)
6. Complete all quests → IceFortress should open
7. Beat Frost Giant → Forest Village
8. Repeat for Dark Forest and Ruins areas

**Step 4: Commit**

```bash
git add index.html js/main.js
git commit -m "wire up all new scenes in index.html and Phaser config"
```

---

### Task 20: Remove Old Direct-Access TundraScene/DarkForestScene/RuinsScene

**Files:**
- Modify: `js/scenes/TundraScene.js` (redirect to TundraVillage or remove)
- Modify: `js/scenes/DarkForestScene.js` (redirect to ForestVillage or remove)
- Modify: `js/scenes/RuinsScene.js` (redirect to RuinsVillage or remove)

**Step 1: Keep old scenes but they're now bypassed**

The old TundraScene, DarkForestScene, and RuinsScene are no longer in the main flow (villages route to sub-areas, sub-areas route to fortresses). They can be kept as-is since they're registered but never transitioned to in the new flow. No changes needed unless we want to clean up.

Actually, verify that no scene transitions point to the old scene keys (`'Tundra'`, `'DarkForest'`, `'Ruins'`). If VictoryScene was already updated (Task 6) and boss arenas were updated (Tasks 10, 14), then the old scenes are orphaned and harmless.

**Step 2: Commit (if any changes)**

Only commit if changes were made. Otherwise skip.

---

### Task 21: Push to GitHub

**Step 1: Push all commits**

```bash
git push origin main
```

**Step 2: Verify on GitHub**

Check that all files are present in the repository.
