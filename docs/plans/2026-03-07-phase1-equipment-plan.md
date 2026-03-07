# Phase 1: Weapons, Armor & Equipment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 5 swords with special effects, 4 armor tiers, an inventory screen, and treasure chests.

**Architecture:** Equipment data lives in a shared constants file (EquipmentData.js). GameState tracks what's equipped and what's been found. Player.js reads equipment stats for damage/armor. Enemy.js gains burn/freeze/lightning effect handlers. New InventoryMenu and Chest classes handle UI and world interaction.

**Tech Stack:** Phaser 3.80.1, vanilla JS, no build tools. All sprites are base64 in main.js. No test framework — test manually in browser.

---

### Task 1: Create EquipmentData.js constants

**Files:**
- Create: `js/EquipmentData.js`
- Modify: `index.html`

**Step 1: Create the equipment data file**

Create `js/EquipmentData.js` with these contents:

```javascript
const SWORD_DATA = {
    wood:    { attack: 10, effect: 'none',      color: 0x8B4513, name: 'Wood Sword' },
    iron:    { attack: 20, effect: 'none',      color: 0xAAAAAA, name: 'Iron Sword' },
    fire:    { attack: 35, effect: 'burn',      color: 0xFF6600, name: 'Fire Sword' },
    ice:     { attack: 35, effect: 'freeze',    color: 0x44AAFF, name: 'Ice Sword' },
    dragon:  { attack: 50, effect: 'lightning', color: 0xFF2222, name: 'Dragon Sword' },
    slayer:  { attack: 25, effect: 'none',      color: 0x9900FF, name: 'Mob Slayer' }
};

const ARMOR_DATA = {
    none:    { reduction: 0,   color: null,     name: 'No Armor' },
    leather: { reduction: 0.2, color: 0xC4A882, name: 'Leather Armor' },
    chain:   { reduction: 0.4, color: 0xCCCCCC, name: 'Chain Armor' },
    dragon:  { reduction: 0.6, color: 0xFF4444, name: 'Dragon Armor' }
};
```

**Step 2: Add script tag to index.html**

Add this line in `index.html` BEFORE the Player.js script tag (around line 20):

```html
<script src="js/EquipmentData.js"></script>
```

**Step 3: Test manually**

Open browser console, type `SWORD_DATA.fire.attack` — should return `35`.
Type `ARMOR_DATA.chain.reduction` — should return `0.4`.

**Step 4: Commit**

```bash
git add js/EquipmentData.js index.html
git commit -m "add equipment data constants for swords and armor"
```

---

### Task 2: Update GameState with equipment tracking

**Files:**
- Modify: `js/main.js:1-33` (GameState object)

**Step 1: Add equipment fields to GameState**

Add these new properties to the GameState object in `js/main.js`, after the existing `shopUpgrades` block (around line 32):

```javascript
    equipment: {
        sword: 'wood',
        armor: 'none'
    },
    inventory: {
        swords: ['wood'],
        armors: ['none']
    },
    chests: {
        woodsNightFire: false,
        snowCaveIce: false
    }
```

Also remove the `weapon: 'wood'` property (line 4) since we're replacing it with `equipment.sword`. Keep `comboUnlocked` and everything else.

**IMPORTANT:** The old code uses `GameState.weapon === 'slayer'` in Player.js (line 191) to pick the animation prefix. After this change, that check needs to use `GameState.equipment.sword === 'slayer'` instead. Update that in Player.js line 191:

Change:
```javascript
const prefix = GameState.weapon === 'slayer' ? 'slayer_' : 'player_';
```
To:
```javascript
const prefix = GameState.equipment.sword === 'slayer' ? 'slayer_' : 'player_';
```

Also search for any other references to `GameState.weapon` in the codebase and update them to `GameState.equipment.sword`. Check these files:
- `js/scenes/WoodsDayScene.js` — likely sets `GameState.weapon = 'slayer'` when finding the sword. Change to `GameState.equipment.sword = 'slayer'` and also add `'slayer'` to `GameState.inventory.swords` if not already there.
- `js/HUD.js` — may display weapon name.

**Step 2: Test manually**

Open browser console: `GameState.equipment.sword` should return `'wood'`.
`GameState.inventory.swords` should return `['wood']`.
Walk around village — player animation should still work (not break due to weapon → equipment.sword rename).

**Step 3: Commit**

```bash
git add js/main.js js/Player.js
git commit -m "add equipment/inventory/chests to GameState, migrate weapon field"
```

---

### Task 3: Equipment-based damage in Player.js

**Files:**
- Modify: `js/Player.js:28-29` (constructor), `js/Player.js:58` (attack method)

**Step 1: Use SWORD_DATA for attack damage**

In `Player.js` constructor (around line 28), change:
```javascript
this.attackDamage = 10;
```
To:
```javascript
this.attackDamage = SWORD_DATA[GameState.equipment.sword].attack + GameState.attackBonus;
```

In the `attack()` method (around line 58), change:
```javascript
let hitDamage = this.attackDamage;
```
To:
```javascript
// Recalculate damage from current equipment each attack
this.attackDamage = SWORD_DATA[GameState.equipment.sword].attack + GameState.attackBonus;
let hitDamage = this.attackDamage;
```

**Step 2: Remove hardcoded attackDamage in scenes**

Many scenes set `this.player.attackDamage = 25 + GameState.attackBonus;` in their `create()` method. This is now handled by Player.js reading from SWORD_DATA. Remove these lines from ALL scene files that set attackDamage:

Search for `attackDamage` in `js/scenes/` and remove those assignment lines from:
- WoodsNightScene.js (line 27)
- WoodsDayScene.js
- FrozenLakeScene.js (line 19)
- SnowCaveScene.js (line 19)
- BlizzardPassScene.js
- MushroomGroveScene.js
- CursedSwampScene.js
- HollowTreeScene.js
- CrumblingBridgeScene.js
- BuriedLibraryScene.js
- LavaPitScene.js
- TundraVillageScene.js (line 50)
- ForestVillageScene.js (line 50)
- RuinsVillageScene.js (line 50)
- VillageScene.js

**Step 3: Test manually**

Start game, attack a goblin. Damage should be 10 (wood sword base). Check console: `SWORD_DATA[GameState.equipment.sword].attack` should be `10`.

**Step 4: Commit**

```bash
git add js/Player.js js/scenes/
git commit -m "use equipment data for attack damage, remove hardcoded values from scenes"
```

---

### Task 4: Armor damage reduction in Enemy.js

**Files:**
- Modify: `js/Enemy.js:80-96` (attackPlayer method)

**Step 1: Apply armor reduction when enemy hits player**

In `Enemy.js`, in the `attackPlayer` method (around line 84), change:
```javascript
GameState.health -= this.damage;
```
To:
```javascript
const armor = ARMOR_DATA[GameState.equipment.armor];
const reducedDamage = Math.round(this.damage * (1 - armor.reduction));
GameState.health -= reducedDamage;
```

**Step 2: Test manually**

Start game, let a goblin hit you. With no armor, you take full damage (10). Later when you equip leather armor, you should take 8 damage (20% reduction).

To test quickly: open console, type `GameState.equipment.armor = 'chain'`, then let enemy hit you — should take 60% of normal damage.

**Step 3: Commit**

```bash
git add js/Enemy.js
git commit -m "apply armor damage reduction when enemies attack player"
```

---

### Task 5: Sword special effects (burn, freeze, lightning)

**Files:**
- Modify: `js/Enemy.js` (add effect methods)
- Modify: `js/Player.js:42-130` (attack method — apply effects on hit)

**Step 1: Add effect methods to Enemy.js**

Add these methods to the Enemy class, after the `attackPlayer` method (after line 97):

```javascript
applyBurn(scene) {
    if (this.isDead || this.isBurning) return;
    this.isBurning = true;
    this.setTint(0xFF6600);
    let ticks = 0;
    const burnTimer = scene.time.addEvent({
        delay: 1000,
        repeat: 2,
        callback: () => {
            if (this.isDead) { burnTimer.remove(); return; }
            this.takeDamage(3);
            ticks++;
            if (ticks >= 3) {
                this.isBurning = false;
                if (!this.isDead) this.clearTint();
            }
        }
    });
}

applyFreeze(scene) {
    if (this.isDead || this.isFrozen) return;
    this.isFrozen = true;
    this.setTint(0x44AAFF);
    const origSpeed = this.speed;
    this.speed = 0;
    scene.time.delayedCall(1000, () => {
        this.isFrozen = false;
        this.speed = origSpeed;
        if (!this.isDead) this.clearTint();
    });
}
```

**Step 2: Apply effects in attack hit detection**

This is done in each scene's update method where attack hits are detected. There's a common pattern across all combat scenes — the block that checks `this.player.attackHitbox` and calls `enemy.takeDamage()`.

After `enemy.takeDamage(this.player.currentHitDamage);` in each scene, add the effect application. But to avoid duplicating code in every scene, add a helper method to Player.js instead.

Add this method to Player.js (after the `dodge()` method, around line 170):

```javascript
applySwordEffect(enemy, allEnemies) {
    const effect = SWORD_DATA[GameState.equipment.sword].effect;
    if (effect === 'burn') {
        enemy.applyBurn(this.scene);
    } else if (effect === 'freeze') {
        enemy.applyFreeze(this.scene);
    } else if (effect === 'lightning') {
        enemy.applyBurn(this.scene);
        // Chain lightning to nearest alive enemy within 100px
        let nearest = null;
        let minDist = Infinity;
        allEnemies.children.each(other => {
            if (other === enemy || other.isDead) return;
            const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, other.x, other.y);
            if (d < 100 && d < minDist) {
                minDist = d;
                nearest = other;
            }
        });
        if (nearest) {
            nearest.takeDamage(15);
            // Lightning flash
            nearest.setTint(0xFFFFFF);
            this.scene.time.delayedCall(200, () => {
                if (nearest && !nearest.isDead) nearest.clearTint();
            });
            // Draw lightning line
            const line = this.scene.add.graphics();
            line.lineStyle(2, 0xFFFF00, 1);
            line.lineBetween(enemy.x, enemy.y, nearest.x, nearest.y);
            line.setDepth(50);
            this.scene.time.delayedCall(200, () => line.destroy());
        }
    }
}
```

**Step 3: Call applySwordEffect in each combat scene**

In every scene that has the attack-hit-detection block, after `enemy.takeDamage(this.player.currentHitDamage);`, add:

```javascript
this.player.applySwordEffect(enemy, this.enemies);
```

This needs to be added in these scene files (in the `if (Phaser.Geom.Intersects.RectangleToRectangle(b1, b2))` block):
- WoodsDayScene.js
- WoodsNightScene.js
- FrozenLakeScene.js
- SnowCaveScene.js
- BlizzardPassScene.js
- MushroomGroveScene.js
- CursedSwampScene.js
- HollowTreeScene.js
- CrumblingBridgeScene.js
- BuriedLibraryScene.js
- LavaPitScene.js

**Step 4: Test manually**

Open console, type `GameState.equipment.sword = 'fire'`. Hit an enemy — it should turn orange and take 3 burn damage per second for 3 seconds.

Type `GameState.equipment.sword = 'ice'`. Hit an enemy — it should turn blue and stop moving for 1 second.

Type `GameState.equipment.sword = 'dragon'`. Hit an enemy near another — should see a yellow lightning line and the nearby enemy takes 15 damage.

**Step 5: Commit**

```bash
git add js/Player.js js/Enemy.js js/scenes/
git commit -m "add sword special effects: burn, freeze, and chain lightning"
```

---

### Task 6: Create Chest class

**Files:**
- Create: `js/Chest.js`
- Modify: `index.html`

**Step 1: Create the Chest class**

Create `js/Chest.js`:

```javascript
class Chest extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, chestId, reward) {
        super(scene, x, y, 'chest_closed');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static body

        this.chestId = chestId;
        this.reward = reward; // { type: 'sword', id: 'fire', name: 'Fire Sword' }
        this.isOpened = GameState.chests[chestId] || false;
        this.setScale(2);
        this.setDepth(5);

        if (this.isOpened) {
            this.setTexture('chest_open');
        }

        // Prompt text
        this.prompt = scene.add.text(x, y - 25, 'Press E', {
            fontSize: '8px', fill: '#fff'
        }).setOrigin(0.5).setVisible(false).setDepth(50);
    }

    tryOpen(player, scene) {
        if (this.isOpened) return;

        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        if (dist > 50) return;

        this.isOpened = true;
        GameState.chests[this.chestId] = true;
        this.setTexture('chest_open');
        this.prompt.setVisible(false);

        // Give reward
        if (this.reward.type === 'sword') {
            if (!GameState.inventory.swords.includes(this.reward.id)) {
                GameState.inventory.swords.push(this.reward.id);
            }
            GameState.equipment.sword = this.reward.id;
        } else if (this.reward.type === 'armor') {
            if (!GameState.inventory.armors.includes(this.reward.id)) {
                GameState.inventory.armors.push(this.reward.id);
            }
            GameState.equipment.armor = this.reward.id;
        }

        // Show reward text
        const text = scene.add.text(this.x, this.y - 40, 'Found: ' + this.reward.name + '!', {
            fontSize: '12px', fill: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(201);
        scene.tweens.add({
            targets: text,
            y: text.y - 30, alpha: 0,
            duration: 2500, delay: 1000,
            onComplete: () => text.destroy()
        });
    }

    showPrompt(player) {
        if (this.isOpened) return;
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
        this.prompt.setVisible(dist < 50);
    }
}
```

**Step 2: Create chest sprites (base64)**

Add chest sprite data to the `SPRITE_DATA` object in `js/main.js`. The chest needs 2 frames: closed and open. Add these entries:

```javascript
chest_closed: 'data:image/png;base64,...',
chest_open: 'data:image/png;base64,...'
```

For the sprites, generate two 16x16 pixel art images:
- `chest_closed`: A brown wooden chest with gold trim, lid closed
- `chest_open`: Same chest with the lid tilted back, showing gold/items inside

In the Boot scene's `create()` method where other sprites are loaded, add:

```javascript
// Chest sprites (16x16 single frame each)
this.textures.addBase64('chest_closed', SPRITE_DATA.chest_closed);
this.textures.addBase64('chest_open', SPRITE_DATA.chest_open);
```

**Step 3: Add script tag to index.html**

Add before the scene script tags:
```html
<script src="js/Chest.js"></script>
```

**Step 4: Test manually**

Won't work visually yet until chests are placed in scenes (Task 8). But check console: `typeof Chest` should return `'function'`.

**Step 5: Commit**

```bash
git add js/Chest.js js/main.js index.html
git commit -m "add Chest class with open animation and reward system"
```

---

### Task 7: Create InventoryMenu

**Files:**
- Create: `js/InventoryMenu.js`
- Modify: `index.html`

**Step 1: Create the InventoryMenu class**

Create `js/InventoryMenu.js`:

```javascript
class InventoryMenu {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.selectedIndex = 0;
        this.tab = 'swords'; // 'swords' or 'armors'
        this.items = [];

        this.bg = scene.add.rectangle(400, 225, 500, 320, 0x000000, 0.9)
            .setScrollFactor(0).setDepth(300).setVisible(false);
        this.titleText = scene.add.text(400, 80, 'INVENTORY', {
            fontSize: '20px', fill: '#ffdd00'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.tabText = scene.add.text(400, 105, '', {
            fontSize: '12px', fill: '#aaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.equippedText = scene.add.text(400, 125, '', {
            fontSize: '12px', fill: '#88ff88'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.itemTexts = [];
        for (let i = 0; i < 6; i++) {
            const t = scene.add.text(400, 155 + i * 30, '', {
                fontSize: '13px', fill: '#fff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);
            this.itemTexts.push(t);
        }

        this.statsText = scene.add.text(400, 345, '', {
            fontSize: '11px', fill: '#88ccff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.hintText = scene.add.text(400, 370, 'UP/DOWN select | E equip | TAB switch | I close', {
            fontSize: '10px', fill: '#aaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setVisible(false);

        this.iKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.tabKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
        this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.wKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    }

    open() {
        this.isOpen = true;
        this.selectedIndex = 0;
        this.tab = 'swords';
        this.setVisible(true);
        this.refresh();
    }

    close() {
        this.isOpen = false;
        this.setVisible(false);
    }

    setVisible(visible) {
        this.bg.setVisible(visible);
        this.titleText.setVisible(visible);
        this.tabText.setVisible(visible);
        this.equippedText.setVisible(visible);
        this.statsText.setVisible(visible);
        this.hintText.setVisible(visible);
        this.itemTexts.forEach(t => t.setVisible(visible));
    }

    refresh() {
        if (this.tab === 'swords') {
            this.items = GameState.inventory.swords.map(id => ({
                id, ...SWORD_DATA[id]
            }));
            this.tabText.setText('[ SWORDS ]   armors');
            const equipped = SWORD_DATA[GameState.equipment.sword];
            this.equippedText.setText('Equipped: ' + equipped.name + ' (ATK: ' + equipped.attack + ')');
        } else {
            this.items = GameState.inventory.armors.map(id => ({
                id, ...ARMOR_DATA[id]
            }));
            this.tabText.setText('  swords   [ ARMORS ]');
            const equipped = ARMOR_DATA[GameState.equipment.armor];
            this.equippedText.setText('Equipped: ' + equipped.name + ' (DEF: ' + Math.round(equipped.reduction * 100) + '%)');
        }

        this.itemTexts.forEach((t, i) => {
            if (i < this.items.length) {
                const item = this.items[i];
                const isEquipped = (this.tab === 'swords' && GameState.equipment.sword === item.id) ||
                                   (this.tab === 'armors' && GameState.equipment.armor === item.id);
                const prefix = (i === this.selectedIndex) ? '> ' : '  ';
                const suffix = isEquipped ? ' [EQUIPPED]' : '';
                if (this.tab === 'swords') {
                    t.setText(prefix + item.name + ' - ATK: ' + item.attack + suffix);
                } else {
                    t.setText(prefix + item.name + ' - DEF: ' + Math.round(item.reduction * 100) + '%' + suffix);
                }
                t.setFill(i === this.selectedIndex ? '#ffdd00' : '#fff');
            } else {
                t.setText('');
            }
        });

        // Stats summary
        const sword = SWORD_DATA[GameState.equipment.sword];
        const armor = ARMOR_DATA[GameState.equipment.armor];
        const totalAtk = sword.attack + GameState.attackBonus;
        this.statsText.setText('Total ATK: ' + totalAtk + ' | DEF: ' + Math.round(armor.reduction * 100) + '% | Effect: ' + sword.effect);
    }

    update() {
        // Toggle open/close with I
        if (Phaser.Input.Keyboard.JustDown(this.iKey)) {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }

        if (!this.isOpen) return;

        if (Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey)) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.refresh();
        }
        if (Phaser.Input.Keyboard.JustDown(this.downKey) || Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.selectedIndex = Math.min(this.items.length - 1, this.selectedIndex + 1);
            this.refresh();
        }

        if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
            this.tab = (this.tab === 'swords') ? 'armors' : 'swords';
            this.selectedIndex = 0;
            this.refresh();
        }

        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            if (this.items[this.selectedIndex]) {
                const item = this.items[this.selectedIndex];
                if (this.tab === 'swords') {
                    GameState.equipment.sword = item.id;
                } else {
                    GameState.equipment.armor = item.id;
                }
                this.refresh();
            }
        }
    }
}
```

**Step 2: Add script tag to index.html**

Add before the scene script tags:
```html
<script src="js/InventoryMenu.js"></script>
```

**Step 3: Add inventory to all scenes that have a player**

In every scene that creates a Player and has an update loop, add the inventory menu. The pattern is:

In `create()`, after creating the HUD:
```javascript
this.inventory = new InventoryMenu(this);
```

In `update()`, add:
```javascript
this.inventory.update();
```

And modify the player update guard to also check inventory:
```javascript
if (!this.dialogue?.isOpen && !this.shop?.isOpen && !this.inventory?.isOpen) this.player.update();
```

Add the inventory to these scenes:
- VillageScene.js
- WoodsDayScene.js
- WoodsNightScene.js
- BossArenaScene.js
- TundraVillageScene.js
- ForestVillageScene.js
- RuinsVillageScene.js
- FrozenLakeScene.js
- SnowCaveScene.js
- BlizzardPassScene.js
- MushroomGroveScene.js
- CursedSwampScene.js
- HollowTreeScene.js
- CrumblingBridgeScene.js
- BuriedLibraryScene.js
- LavaPitScene.js

**Step 4: Test manually**

Open game, press I — inventory should appear with "Wood Sword" listed. Press I again to close. Player should not move while inventory is open.

**Step 5: Commit**

```bash
git add js/InventoryMenu.js index.html js/scenes/
git commit -m "add inventory menu with sword/armor tabs, accessible with I key"
```

---

### Task 8: Update shops to sell weapons and armor

**Files:**
- Modify: `js/ShopMenu.js`

**Step 1: Update ShopMenu to support more item types and dynamic item count**

The shop currently hardcodes 3 items and 3 text objects. We need to support more items. Replace the constructor's itemTexts creation to support up to 5 items:

In the constructor, change the loop from `i < 3` to `i < 5`, and adjust the spacing:

```javascript
this.itemTexts = [];
for (let i = 0; i < 5; i++) {
    const t = scene.add.text(400, 160 + i * 35, '', {
        fontSize: '13px', fill: '#fff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);
    this.itemTexts.push(t);
}
```

Move the hint text down to accommodate more items:
```javascript
this.hintText = scene.add.text(400, 345, 'UP/DOWN to select, E to buy, Q to close', {
    fontSize: '11px', fill: '#aaa'
}).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false);
```

**Step 2: Update the open() method to add weapon/armor items per area**

Replace the `open()` method:

```javascript
open(area) {
    this.isOpen = true;
    this.selectedIndex = 0;
    this.area = area;

    // Base items every shop has
    this.items = [
        { name: 'Health Potion', desc: 'Restore 50 HP', cost: 50, type: 'potion' }
    ];

    // Area-specific upgrades
    if (area === 'village') {
        if (!GameState.inventory.swords.includes('iron')) {
            this.items.push({ name: 'Iron Sword', desc: 'ATK 20', cost: 200, type: 'sword', itemId: 'iron' });
        }
        if (!GameState.inventory.armors.includes('leather')) {
            this.items.push({ name: 'Leather Armor', desc: 'DEF 20%', cost: 150, type: 'armor', itemId: 'leather' });
        }
    } else if (area === 'tundra') {
        if (!GameState.inventory.armors.includes('chain')) {
            this.items.push({ name: 'Chain Armor', desc: 'DEF 40%', cost: 300, type: 'armor', itemId: 'chain' });
        }
    }

    // Stat upgrades from shopUpgrades (skip for village — it has its own system)
    if (area !== 'village' && GameState.shopUpgrades[area]) {
        const upgrades = GameState.shopUpgrades[area];
        if (!upgrades.maxHp) {
            this.items.push({ name: 'Max HP Up', desc: '+25 Max HP', cost: 100, type: 'maxhp' });
        }
        if (!upgrades.attack) {
            this.items.push({ name: 'Attack Up', desc: '+5 Damage', cost: 150, type: 'attack' });
        }
    }

    this.bg.setVisible(true);
    this.titleText.setVisible(true);
    this.goldText.setVisible(true);
    this.hintText.setVisible(true);
    this.itemTexts.forEach(t => t.setVisible(true));
    this.refresh();
}
```

**Step 3: Update buySelected() to handle sword/armor purchases**

Add these cases to the `buySelected()` method, after the existing `if/else if` blocks:

```javascript
else if (item.type === 'sword') {
    if (!GameState.inventory.swords.includes(item.itemId)) {
        GameState.inventory.swords.push(item.itemId);
    }
    GameState.equipment.sword = item.itemId;
    item.bought = true;
}
else if (item.type === 'armor') {
    if (!GameState.inventory.armors.includes(item.itemId)) {
        GameState.inventory.armors.push(item.itemId);
    }
    GameState.equipment.armor = item.itemId;
    item.bought = true;
}
```

**Step 4: Update VillageScene blacksmith to use ShopMenu**

The Village blacksmith currently uses dialogue-based shopping (in `talkBlacksmith()`). Replace the shop section (after story dialogue) to use the ShopMenu instead:

In VillageScene.js `create()`, add:
```javascript
this.shop = new ShopMenu(this);
```

In `update()`, add:
```javascript
this.shop.update();
```

Update the player movement guard to include shop check:
```javascript
if (!this.dialogue.isOpen && !this.shop?.isOpen && !this.inventory?.isOpen) {
```

In `talkBlacksmith()`, replace the shop upgrade section (after story phase 2, around line 314) with:
```javascript
this.shop.open('village');
```

**Step 5: Test manually**

Go to village, talk to blacksmith after story progression. Shop should show Health Potion, Iron Sword (200g), Leather Armor (150g). Buy Iron Sword — should auto-equip it. Open inventory (I) — should show Wood Sword and Iron Sword.

Go to tundra village shopkeeper. Shop should show Health Potion, Chain Armor (300g), Max HP Up, Attack Up.

**Step 6: Commit**

```bash
git add js/ShopMenu.js js/scenes/VillageScene.js
git commit -m "update shops to sell swords and armor, village blacksmith uses ShopMenu"
```

---

### Task 9: Place treasure chests in WoodsNight and SnowCave

**Files:**
- Modify: `js/scenes/WoodsNightScene.js`
- Modify: `js/scenes/SnowCaveScene.js`

**Step 1: Add Fire Sword chest to WoodsNightScene**

In WoodsNightScene.js `create()`, after creating obstacles, add:

```javascript
// Fire Sword chest — hidden in the bottom-right corner between trees
this.chest = new Chest(this, 720, 300, 'woodsNightFire', {
    type: 'sword', id: 'fire', name: 'Fire Sword'
});
this.physics.add.collider(this.player, this.chest);
```

In `update()`, before the exit-right check, add:

```javascript
// Chest interaction
if (this.chest) {
    this.chest.showPrompt(this.player);
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
        this.chest.tryOpen(this.player, this);
    }
}
```

Also add the E key in `create()`:
```javascript
this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
```

**Step 2: Add Ice Sword chest to SnowCaveScene**

In SnowCaveScene.js `create()`, after creating obstacles (or after enemy setup), add:

```javascript
// Ice Sword chest — in a corner of the cave
this.swordChest = new Chest(this, 700, 250, 'snowCaveIce', {
    type: 'sword', id: 'ice', name: 'Ice Sword'
});
this.physics.add.collider(this.player, this.swordChest);
```

In `update()`, add:

```javascript
// Chest interaction
if (this.swordChest) {
    this.swordChest.showPrompt(this.player);
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
        this.swordChest.tryOpen(this.player, this);
    }
}
```

Note: SnowCave already has an E key for the amulet pickup, so reuse `this.eKey`.

**Step 3: Test manually**

Go to WoodsNight, walk to bottom-right corner. Should see "Press E" near the chest. Press E — should open and show "Found: Fire Sword!". Open inventory — Fire Sword should be listed and equipped. Attack enemy — should see orange burn effect.

Go to SnowCave, walk to the right side. Same thing for Ice Sword with blue freeze effect.

**Step 4: Commit**

```bash
git add js/scenes/WoodsNightScene.js js/scenes/SnowCaveScene.js
git commit -m "place Fire Sword chest in WoodsNight, Ice Sword chest in SnowCave"
```

---

### Task 10: Dragon Sword reward for beating all bosses

**Files:**
- Modify: `js/scenes/FinalVictoryScene.js`

**Step 1: Award Dragon Sword in FinalVictoryScene**

In FinalVictoryScene.js `create()`, add at the top (after setting background color):

```javascript
// Award Dragon Sword
if (!GameState.inventory.swords.includes('dragon')) {
    GameState.inventory.swords.push('dragon');
}
GameState.equipment.sword = 'dragon';
```

Also update the victory text to mention the Dragon Sword. After the existing `endText` tween (around line 59), add:

```javascript
const dragonText = this.add.text(400, 430, 'You received the Dragon Sword!', {
    fontSize: '16px', fill: '#ff4444'
}).setOrigin(0.5).setAlpha(0);

this.tweens.add({
    targets: dragonText, alpha: 1,
    duration: 1000, delay: 6000
});
```

**Step 2: Test manually**

Reach the FinalVictory scene (or temporarily change a scene transition to go there). Should see "You received the Dragon Sword!" text appear. Open inventory — Dragon Sword should be listed and equipped.

**Step 3: Commit**

```bash
git add js/scenes/FinalVictoryScene.js
git commit -m "award Dragon Sword when beating all region bosses"
```

---

### Task 11: Generate chest sprites and update cache busting

**Files:**
- Modify: `js/main.js` (add chest sprite base64 data + texture loading)
- Modify: `index.html` (update cache bust versions)

**Step 1: Generate chest sprites**

Use Python to generate two 16x16 pixel art chest sprites and encode as base64. The chest_closed should be a brown box with gold band. The chest_open should have the lid tilted back showing yellow/gold inside.

Run a Python script to generate them:

```python
from PIL import Image
import base64, io

# Closed chest (16x16)
closed = Image.new('RGBA', (16, 16), (0,0,0,0))
# ... draw pixels for brown chest with gold trim ...
buf = io.BytesIO()
closed.save(buf, 'PNG')
print('closed:', base64.b64encode(buf.getvalue()).decode())

# Open chest (16x16)
# ... same but with open lid ...
```

Add the base64 strings to SPRITE_DATA in main.js.

**Step 2: Load chest textures in Boot scene**

In the Boot scene's `create()` method in `js/main.js`, where other textures are loaded with `this.textures.addBase64()`, add:

```javascript
this.textures.addBase64('chest_closed', SPRITE_DATA.chest_closed);
this.textures.addBase64('chest_open', SPRITE_DATA.chest_open);
```

**Step 3: Update cache bust versions**

In `index.html`, bump the version numbers on all modified script tags:
- `js/main.js?v=11`
- `js/Player.js?v=11`
- `js/Enemy.js?v=11`
- `js/ShopMenu.js?v=3`
- `js/scenes/WoodsNightScene.js?v=11`
- `js/scenes/SnowCaveScene.js` → add `?v=2`
- `js/scenes/VillageScene.js?v=11`
- `js/scenes/FinalVictoryScene.js` → add `?v=2`
- All other modified scene files: bump or add `?v=2`

**Step 4: Test manually**

Hard refresh browser. All scenes should load. Chests should appear as brown boxes. Open one — should change to open sprite.

**Step 5: Commit**

```bash
git add js/main.js index.html
git commit -m "add chest sprites, update cache busting for all modified files"
```

---

### Task 12: Final integration test and push

**Step 1: Full playthrough test**

Test this complete flow:
1. Start game → Wood Sword equipped (ATK 10)
2. Press I → Inventory shows Wood Sword
3. Village blacksmith → Buy Iron Sword (200g) → ATK 20
4. WoodsNight → Find Fire Sword chest → ATK 35, burn effect
5. SnowCave → Find Ice Sword chest → ATK 35, freeze effect
6. Tab to armors in inventory → Only "No Armor"
7. Village shop → Buy Leather Armor → DEF 20%
8. Tundra shop → Buy Chain Armor → DEF 40%
9. Beat all bosses → Dragon Sword awarded → ATK 50, lightning effect
10. Enemies take less damage through armor

**Step 2: Fix any issues found during testing**

**Step 3: Push to GitHub**

```bash
git push
```
