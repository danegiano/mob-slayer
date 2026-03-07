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
