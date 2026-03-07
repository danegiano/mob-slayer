# Phase 2: Bigger Levels + Secret Rooms Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand all 12 combat levels to 1600x900, convert remaining side-scroller scenes to top-down, add 12 secret rooms with varied entry mechanics and rewards.

**Architecture:** Each combat scene expands to 1600x900 with tiled backgrounds, more obstacles, more enemies. Secret rooms are small separate scenes (400x300) accessed via hidden walls, breakable walls, or locked doors. New utility classes (BreakableWall, LockedDoor, LoreScroll) handle shared mechanics. Chest class gets updated to support gold/potion/accessory rewards.

**Tech Stack:** Phaser 3.80.1, vanilla JS, no build tools. All sprites base64 in main.js.

---

### Task 1: Foundation — GameState, sprites, utility classes

**Files:**
- Modify: `js/main.js` (GameState + new sprites)
- Modify: `js/Chest.js` (support gold/potion/accessory rewards)
- Create: `js/BreakableWall.js`
- Create: `js/LockedDoor.js`
- Create: `js/LoreScroll.js`
- Modify: `index.html` (new script tags)

**Step 1: Update GameState in js/main.js**

Add these properties to the GameState object, after the `chests` block:

```javascript
secretRooms: {
    woodsDay: false,
    woodsNight: false,
    bossArena: false,
    frozenLake: false,
    snowCave: false,
    blizzardPass: false,
    mushroomGrove: false,
    cursedSwamp: false,
    hollowTree: false,
    crumblingBridge: false,
    buriedLibrary: false,
    lavaPit: false
},
accessories: {
    speedBoots: false,
    lifeRing: false
}
```

Also add new chest IDs to the `chests` object:
```javascript
woodsDayGold: false,
woodsNightGold: false,
bossArenaPotion: false,
frozenLakeGold: false,
snowCaveBoots: false,
blizzardPassGold: false,
mushroomGroveLore: false,
cursedSwampArmor: false,
hollowTreeLore: false,
crumblingBridgeGold: false,
buriedLibraryLore: false,
lavaPitRing: false
```

**Step 2: Generate new sprites using Python**

Generate these 16x16 pixel art sprites and add to SPRITE_DATA:

1. `cracked_rock` — Grey rock with visible cracks/lines
2. `rock_debris` — Small grey fragments (broken rock particles)
3. `locked_door` — Brown wooden door with gold lock
4. `open_door` — Same door, open/ajar
5. `lore_scroll` — Rolled parchment with red ribbon
6. `secret_room_bg` — Dark stone floor/walls (use as 400x300 bg, generate at 200x150 and scale 2x)

Run Python to generate base64 PNGs and add to SPRITE_DATA in js/main.js.

**Step 3: Update Chest.js to support gold/potion/accessory rewards**

The current Chest class only handles sword and armor rewards. Add support for:
- `type: 'gold'` with `amount` field — adds gold to GameState.gold
- `type: 'potion'` with `amount` field — heals player
- `type: 'accessory'` with `id` field — sets GameState.accessories[id] = true and applies effect

In `tryOpen()`, after the existing armor case, add:

```javascript
else if (this.reward.type === 'gold') {
    GameState.gold += this.reward.amount;
} else if (this.reward.type === 'potion') {
    GameState.health = Math.min(GameState.health + this.reward.amount, GameState.maxHealth);
} else if (this.reward.type === 'accessory') {
    GameState.accessories[this.reward.id] = true;
    if (this.reward.id === 'speedBoots') {
        // Speed boost applied when Player reads accessories in update
    } else if (this.reward.id === 'lifeRing') {
        GameState.maxHealth += 25;
        GameState.health = Math.min(GameState.health + 25, GameState.maxHealth);
    }
}
```

**Step 4: Create js/BreakableWall.js**

```javascript
class BreakableWall extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'cracked_rock');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(2);
        this.setDepth(5);
        this.isBroken = false;
    }

    checkAttack(attackHitbox, scene) {
        if (this.isBroken) return false;
        if (!attackHitbox) return false;
        const b1 = attackHitbox.getBounds();
        const b2 = this.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2)) {
            this.breakWall(scene);
            return true;
        }
        return false;
    }

    breakWall(scene) {
        this.isBroken = true;
        // Particle effect — spawn small debris rectangles
        for (let i = 0; i < 6; i++) {
            const debris = scene.add.rectangle(
                this.x + Phaser.Math.Between(-10, 10),
                this.y + Phaser.Math.Between(-10, 10),
                4, 4, 0x888888
            ).setDepth(50);
            scene.tweens.add({
                targets: debris,
                x: debris.x + Phaser.Math.Between(-30, 30),
                y: debris.y + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: 500,
                onComplete: () => debris.destroy()
            });
        }
        this.destroy();
    }
}
```

**Step 5: Create js/LockedDoor.js**

```javascript
class LockedDoor extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'locked_door');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(2);
        this.setDepth(5);
        this.isUnlocked = false;

        this.lockText = scene.add.text(x, y - 20, 'Defeat all enemies!', {
            fontSize: '8px', fill: '#ff4444'
        }).setOrigin(0.5).setVisible(false).setDepth(50);
    }

    checkUnlock(enemies, player) {
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);

        if (!this.isUnlocked && dist < 60) {
            if (enemies.countActive() === 0) {
                this.unlock();
            } else {
                this.lockText.setVisible(true);
            }
        } else {
            this.lockText.setVisible(false);
        }
    }

    unlock() {
        this.isUnlocked = true;
        this.setTexture('open_door');
        this.lockText.setVisible(false);
        // Disable physics body so player can walk through
        this.body.enable = false;
    }
}
```

**Step 6: Create js/LoreScroll.js**

```javascript
class LoreScroll extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, scrollId, loreLines) {
        super(scene, x, y, 'lore_scroll');
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(2);
        this.setDepth(5);
        this.scrollId = scrollId;
        this.loreLines = loreLines;
        this.isRead = false;

        this.prompt = scene.add.text(x, y - 20, 'Press E', {
            fontSize: '8px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);
    }

    showPrompt(player) {
        if (this.isRead) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        this.prompt.setVisible(dist < 50);
    }

    tryRead(player, dialogue) {
        if (this.isRead) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        if (dist > 50) return;
        this.isRead = true;
        this.prompt.setVisible(false);
        this.setAlpha(0.4);
        dialogue.open('Ancient Scroll', this.loreLines, null, this);
    }
}
```

**Step 7: Add script tags to index.html**

Add before the scene script tags:
```html
<script src="js/BreakableWall.js"></script>
<script src="js/LockedDoor.js"></script>
<script src="js/LoreScroll.js"></script>
```

**Step 8: Commit**

```bash
git add js/main.js js/Chest.js js/BreakableWall.js js/LockedDoor.js js/LoreScroll.js index.html
git commit -m "add Phase 2 foundation: GameState, sprites, utility classes for secrets"
```

---

### Task 2: Expand Starter biome + 3 secret rooms

**Files:**
- Modify: `js/scenes/WoodsDayScene.js`
- Modify: `js/scenes/WoodsNightScene.js`
- Modify: `js/scenes/BossArenaScene.js`
- Create: `js/scenes/WoodsDaySecretScene.js`
- Create: `js/scenes/WoodsNightSecretScene.js`
- Create: `js/scenes/BossArenaSecretScene.js`
- Modify: `index.html` (new script tags + Phaser config)

**Pattern for expanding each combat scene to 1600x900 top-down:**

Each scene needs these changes:
1. Place background image at center, add a second copy offset to fill 1600x900 (or use a tileSprite)
2. Remove invisible ground if it exists
3. Change camera bounds and physics world bounds to 1600x900
4. Add camera zoom (1.5) and follow if not already there
5. Add more obstacles (trees/rocks) spread across bigger area
6. Spread enemies across bigger area
7. Update exit triggers for wider boundaries (x > 1570 instead of 750, x < 30 stays)
8. Add secret room entrance

**WoodsDayScene.js — Hidden wall secret (100 gold)**

Expand to 1600x900. Place background twice: `this.add.image(400, 225, bg)` and `this.add.image(1200, 225, bg)`. Update bounds to 1600x900. Add more tree obstacles in the new area. Add a slightly tinted tree at position (1400, 700) that the player can walk through — when player overlaps it, transition to WoodsDaySecret scene. Mark `GameState.secretRooms.woodsDay = true`.

**WoodsNightScene.js — Breakable wall secret (150 gold)**

Same expansion. Add a BreakableWall at (1350, 650). When broken, show passage. When player walks to the passage position, transition to WoodsNightSecret scene.

**BossArenaScene.js — Kill-all puzzle secret (3 potions)**

Same expansion. Add a LockedDoor at (1400, 400). Door unlocks when all enemies dead. Player walks through to BossArenaSecret scene.

**Secret room scene template (all 12 follow this pattern):**

```javascript
class WoodsDaySecretScene extends Phaser.Scene {
    constructor() { super('WoodsDaySecret'); }

    create() {
        // Dark room background
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.add.rectangle(200, 150, 400, 300, 0x2a2a3e).setDepth(0);

        // Torches (decorative)
        const torch1 = this.add.rectangle(40, 80, 6, 12, 0xff6600).setDepth(5);
        const torch2 = this.add.rectangle(360, 80, 6, 12, 0xff6600).setDepth(5);
        this.tweens.add({ targets: [torch1, torch2], alpha: 0.5, yoyo: true, repeat: -1, duration: 300 });

        // Player
        this.player = new Player(this, 200, 250);
        this.hud = new HUD(this);
        this.inventory = new InventoryMenu(this);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Chest with reward
        this.chest = new Chest(this, 200, 100, 'woodsDayGold', {
            type: 'gold', amount: 100, name: '100 Gold'
        });

        // Room bounds
        this.physics.world.setBounds(0, 0, 400, 300);
        this.player.setCollideWorldBounds(true);

        this.transitioning = false;

        // Title
        this.add.text(200, 30, 'Secret Room', {
            fontSize: '14px', fill: '#ffdd00'
        }).setOrigin(0.5).setDepth(50);
    }

    update() {
        if (!this.inventory.isOpen) this.player.update();
        this.hud.update();
        this.inventory.update();

        this.chest.showPrompt(this.player);
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.chest.tryOpen(this.player, this);
        }

        // Exit bottom
        if (!this.transitioning && this.player.y > 280) {
            this.transitioning = true;
            this.scene.start('WoodsDay');
        }
    }
}
```

Each secret room is unique in:
- Scene name and key
- Chest ID and reward
- Optional lore scroll or mini-boss
- Return scene name

**Scenes with mini-bosses (HollowTree, LavaPit):**

```javascript
// In create(), add a tough enemy:
this.miniBoss = new Enemy(this, 200, 120, 'shadow_beast', 60);
this.miniBoss.speed = 80;
this.miniBoss.damage = 20;
this.miniBoss.goldValue = 50;
this.miniBoss.setScale(2); // Big!
this.miniBoss.setTint(0xff4444); // Red tint
this.enemies = this.physics.add.group();
this.enemies.add(this.miniBoss);

// Chest only openable after mini-boss dead:
// In Chest.tryOpen, add guard: if mini-boss alive, show "Defeat the guardian!" text
```

For mini-boss rooms, modify the chest interaction to check if enemies are dead:

```javascript
if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
    if (this.enemies && this.enemies.countActive() > 0) {
        // Show warning
        if (!this.warningText) {
            this.warningText = this.add.text(200, 60, 'Defeat the guardian first!', {
                fontSize: '10px', fill: '#ff4444'
            }).setOrigin(0.5).setDepth(201);
            this.time.delayedCall(2000, () => {
                if (this.warningText) { this.warningText.destroy(); this.warningText = null; }
            });
        }
    } else {
        this.chest.tryOpen(this.player, this);
    }
}
```

**Scenes with lore scrolls (MushroomGrove, HollowTree, BuriedLibrary):**

```javascript
// In create():
this.dialogue = new DialogueBox(this);
this.scroll = new LoreScroll(this, 300, 120, 'mushroomGrove', [
    'The ancient forest spirits once protected this grove...',
    'They say the mushrooms glow with their lingering magic.',
    'Those who listen can still hear their whispers.'
]);

// In update():
this.dialogue.update();
this.scroll.showPrompt(this.player);
if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
    this.scroll.tryRead(this.player, this.dialogue);
    this.chest.tryOpen(this.player, this);
}
```

**Step-by-step for this task:**

1. Expand WoodsDayScene.js to 1600x900 (tile bg, more trees, wider bounds, hidden wall entrance)
2. Create WoodsDaySecretScene.js (100 gold chest)
3. Expand WoodsNightScene.js to 1600x900 (breakable wall entrance)
4. Create WoodsNightSecretScene.js (150 gold chest)
5. Expand BossArenaScene.js to 1600x900 (locked door entrance)
6. Create BossArenaSecretScene.js (3 potions = heal 150 HP)
7. Add new scenes to index.html AND to the Phaser config scene array in js/main.js
8. Commit

**IMPORTANT: Adding scenes to Phaser config**

In js/main.js, find the Phaser game config's `scene` array and add all new secret room scenes to it. They need to be registered or the game won't know about them.

```bash
git add js/scenes/ index.html js/main.js
git commit -m "expand starter biome to 1600x900, add 3 secret rooms"
```

---

### Task 3: Expand Tundra biome + 3 secret rooms

**Files:**
- Modify: `js/scenes/FrozenLakeScene.js`
- Modify: `js/scenes/SnowCaveScene.js`
- Modify: `js/scenes/BlizzardPassScene.js`
- Create: `js/scenes/FrozenLakeSecretScene.js`
- Create: `js/scenes/SnowCaveSecretScene.js`
- Create: `js/scenes/BlizzardPassSecretScene.js`
- Modify: `index.html`, `js/main.js`

**FrozenLakeScene.js — Hidden wall (200 gold)**
- Remove invisible ground, convert to top-down with tree/rock obstacles
- Expand to 1600x900, tile background
- Add camera zoom 1.5 + follow
- Spread 6 ice wolves across bigger area (not just a line)
- Add slightly lighter tree at (1300, 750) as hidden wall
- Keep quest tracking for wolf kills
- Update exit triggers for wider bounds

**SnowCaveScene.js — Breakable wall (Speed Boots)**
- Same conversion + expansion
- Keep existing amulet pickup and Ice Sword chest
- Add BreakableWall at (1400, 600)
- Secret room has Speed Boots chest

**BlizzardPassScene.js — Kill-all puzzle (250 gold)**
- Same conversion + expansion
- Add LockedDoor at (1350, 400)
- Door opens when all enemies dead

**Secret rooms:**
- FrozenLakeSecretScene: 200 gold chest
- SnowCaveSecretScene: Speed Boots accessory chest (GameState.accessories.speedBoots = true, player moveSpeed += 20)
- BlizzardPassSecretScene: 250 gold chest

**Step: Commit**
```bash
git add js/scenes/ index.html js/main.js
git commit -m "expand tundra biome to 1600x900, add 3 secret rooms with Speed Boots"
```

---

### Task 4: Expand Forest biome + 3 secret rooms

**Files:**
- Modify: `js/scenes/MushroomGroveScene.js`
- Modify: `js/scenes/CursedSwampScene.js`
- Modify: `js/scenes/HollowTreeScene.js`
- Create: `js/scenes/MushroomGroveSecretScene.js`
- Create: `js/scenes/CursedSwampSecretScene.js`
- Create: `js/scenes/HollowTreeSecretScene.js`
- Modify: `index.html`, `js/main.js`

**MushroomGroveScene.js — Hidden wall (lore + 150 gold)**
- Convert from side-scroller to top-down
- Expand to 1600x900
- Keep mushroom pickup quest
- Add hidden wall entrance at (1350, 700)

**CursedSwampScene.js — Breakable wall (Dragon Armor)**
- Convert + expand
- Add BreakableWall at (1400, 650)
- Secret room has Dragon Armor chest (ARMOR_DATA already has dragon entry)

**HollowTreeScene.js — Mini-boss (lore + 200 gold)**
- Convert + expand
- Add locked door entrance (kills required to unlock)
- Secret room has a big shadow beast mini-boss (60 HP, 2x scale, red tint)
- Chest only openable after mini-boss dead
- Lore scroll about the shadow beasts

**Secret rooms:**
- MushroomGroveSecretScene: lore scroll + 150 gold chest
- CursedSwampSecretScene: Dragon Armor chest
- HollowTreeSecretScene: mini-boss + lore scroll + 200 gold chest

**Step: Commit**
```bash
git add js/scenes/ index.html js/main.js
git commit -m "expand forest biome to 1600x900, add 3 secret rooms with Dragon Armor"
```

---

### Task 5: Expand Ruins biome + 3 secret rooms

**Files:**
- Modify: `js/scenes/CrumblingBridgeScene.js`
- Modify: `js/scenes/BuriedLibraryScene.js`
- Modify: `js/scenes/LavaPitScene.js`
- Create: `js/scenes/CrumblingBridgeSecretScene.js`
- Create: `js/scenes/BuriedLibrarySecretScene.js`
- Create: `js/scenes/LavaPitSecretScene.js`
- Modify: `index.html`, `js/main.js`

**CrumblingBridgeScene.js — Hidden wall (200 gold)**
- Convert + expand
- Add hidden wall at (1400, 650)

**BuriedLibraryScene.js — Breakable wall (lore + 300 gold)**
- Convert + expand
- Add BreakableWall
- Secret has lore scroll about the ruins civilization

**LavaPitScene.js — Mini-boss (Life Ring)**
- Convert + expand
- Locked door entrance
- Mini-boss: big stone golem (80 HP, 2x scale, red tint, 25 damage)
- Life Ring chest (+25 max HP permanently)
- Chest only openable after mini-boss dead

**Secret rooms:**
- CrumblingBridgeSecretScene: 200 gold chest
- BuriedLibrarySecretScene: lore scroll + 300 gold chest
- LavaPitSecretScene: mini-boss + Life Ring accessory chest

**Step: Commit**
```bash
git add js/scenes/ index.html js/main.js
git commit -m "expand ruins biome to 1600x900, add 3 secret rooms with Life Ring"
```

---

### Task 6: Apply Speed Boots effect + cache busting + final test

**Files:**
- Modify: `js/Player.js` (apply speed boots)
- Modify: `index.html` (cache bust all modified files)

**Step 1: Speed Boots effect in Player.js**

In Player.js constructor, after setting moveSpeed, add:
```javascript
if (GameState.accessories.speedBoots) {
    this.moveSpeed += 20;
}
```

**Step 2: Update cache busting in index.html**

Bump version numbers on all modified files. Add ?v= to all new script tags.

**Step 3: Full playthrough test**

1. Start game, verify all scenes load
2. WoodsDay: walk through lighter tree in expanded area → secret room → 100 gold
3. WoodsNight: attack cracked rock → secret room → 150 gold
4. BossArena: kill all enemies → door opens → secret room → heal
5. FrozenLake: hidden wall → 200 gold
6. SnowCave: breakable wall → Speed Boots
7. BlizzardPass: kill-all → 250 gold
8. MushroomGrove: hidden wall → lore + 150 gold
9. CursedSwamp: breakable wall → Dragon Armor
10. HollowTree: locked door → mini-boss → lore + 200 gold
11. CrumblingBridge: hidden wall → 200 gold
12. BuriedLibrary: breakable wall → lore + 300 gold
13. LavaPit: locked door → mini-boss → Life Ring

**Step 4: Commit and push**

```bash
git add js/Player.js index.html
git commit -m "apply speed boots effect, update cache busting"
git push
```
