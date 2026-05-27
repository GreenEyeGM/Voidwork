import { GAME_WIDTH, GAME_HEIGHT } from "../config/GameConfig.js";

// Health bar dimensions and position relative to asteroid centre
const BAR_WIDTH    = 60;   // total width of the health bar in pixels
const BAR_HEIGHT   = 6;    // height of the bar
const BAR_OFFSET_Y = -56;  // how far above the asteroid centre the bar sits

/* ASTEROID TYPE CONFIGS
// Each type has 3 variants (rows in the spritesheet)
// Each variant has 3 frames: [healthy, cracked, broken]
//
// Spritesheet layout (384x768, 128x128 per frame):
//
//  Row 0 → Impure  variant 1 → frames [0,  1,  2 ]
//  Row 1 → Impure  variant 2 → frames [3,  4,  5 ]
//  Row 2 → Impure  variant 3 → frames [6,  7,  8 ]
//  Row 3 → Normal  variant 1 → frames [9,  10, 11]
//  Row 4 → Normal  variant 2 → frames [12, 13, 14]
//  Row 5 → Normal  variant 3 → frames [15, 16, 17]
----------------------------------------------------------*/
const ASTEROID_TYPES = {
    impure: {
        // 3 variants, each with [healthy, cracked, broken] frames
        variants: [
            [0,  1,  2 ],
            [3,  4,  5 ],
            [6,  7,  8 ],
        ],
        health:       3,          // clicks to break
        minerals:     [5,  10],   // random yield between min and max
        alloys:       [0,  0 ],   // impure has no alloys
        speed:        [20, 50],   // drift speed range
        spawnWeight:  60          // out of 100 — more common
    },
    normal: {
        variants: [
            [9,  10, 11],
            [12, 13, 14],
            [15, 16, 17],
        ],
        health:       3,
        minerals:     [10, 20],
        alloys:       [5,  10],
        speed:        [20, 50],
        spawnWeight:  100         // 61-100 — less common
    }
};
 
// ----------------------------------------------------------
// HELPER — pick a weighted random asteroid type
// Roll 1-100:
//   1-60   → impure
//   61-100 → normal
// ----------------------------------------------------------
export function getRandomAsteroidType() {
    const roll = Phaser.Math.Between(1, 100);
    if (roll <= 60) return 'impure';
    return 'normal';
}
 
// ----------------------------------------------------------
// ASTEROID CLASS
// ----------------------------------------------------------
export class Asteroid extends Phaser.GameObjects.Sprite {
 
    constructor(scene, x, y, type) {
 
        // Pick a random variant for this asteroid type
        const config = ASTEROID_TYPES[type];
        const variant = config.variants[Phaser.Math.Between(0, 2)];
 
        // Call Phaser's Sprite constructor with the healthy frame (index 0 of variant)
        super(scene, x, y, 'Asteroids', variant[0]);
 
        // Store all data this asteroid needs to remember
        this.asteroidType = type;
        this.config = config;
        this.variant = variant;           // e.g. [0, 1, 2] — the 3 frame indexes
        this.health = config.health;     // starts at 3
        this.mineralYield = Phaser.Math.Between(config.minerals[0], config.minerals[1]);
        this.alloyYield = Phaser.Math.Between(config.alloys[0],   config.alloys[1]);
 
        // Add this sprite to the scene display list
        scene.add.existing(this);
 
        // Add arcade physics to this sprite
        scene.physics.add.existing(this);
 
        // Run the rest of the setup
        this.init();
    }
 
    // --------------------------------------------------------
    // INIT — physics, spin, drift, click
    // --------------------------------------------------------
    init() {
 
        // No gravity — this is space
        this.body.setGravity(0, 0);
 
        // Random spin (negative = counterclockwise, positive = clockwise)
        this.body.setAngularVelocity(Phaser.Math.Between(-40, 40));
 
        // Random drift direction and speed
        const speed = Phaser.Math.Between(this.config.speed[0], this.config.speed[1]);
        const angle = Phaser.Math.Between(0, 360);
        this.scene.physics.velocityFromAngle(angle, speed, this.body.velocity);
 
        // Allow this sprite to receive pointer events — circle matches visible asteroid, not full 128×128 frame
        this.setInteractive({ hitArea: new Phaser.Geom.Circle(64, 64, 48), hitAreaCallback: Phaser.Geom.Circle.Contains, useHandCursor: true });
 
        // Each click calls takeDamage
        this.on('pointerdown', () => {
            this.takeDamage();
        });

        // ── HEALTH BAR ────────────────────────────────────────
        // Two rectangles stacked on top of each other.
        // The background is always full-width and dark.
        // The foreground shrinks left-to-right as health drops.
        // setOrigin(0, 0.5) anchors them from the left edge so shrinking is natural.
        // setDepth(2) keeps them drawn above asteroids (depth 0) and the spaceship (depth 1).

        this.healthBarBg = this.scene.add.rectangle(
            this.x - BAR_WIDTH / 2,   // left edge of bar
            this.y + BAR_OFFSET_Y,
            BAR_WIDTH, BAR_HEIGHT,
            0x333333, 0.8             // dark grey background
        ).setOrigin(0, 0.5).setDepth(2);

        this.healthBarFg = this.scene.add.rectangle(
            this.x - BAR_WIDTH / 2,
            this.y + BAR_OFFSET_Y,
            BAR_WIDTH, BAR_HEIGHT,
            0x44ff44                  // green at full health
        ).setOrigin(0, 0.5).setDepth(2);
    }
 
    // --------------------------------------------------------
    // TAKE DAMAGE — swap frame on each click
    // health 3 → 2 : show cracked  (variant frame index 1)
    // health 2 → 1 : show broken   (variant frame index 2)
    // health 1 → 0 : break apart
    // --------------------------------------------------------
    takeDamage() {
        this.health--;
 
        if (this.health === 2) {
            // Switch to cracked frame
            this.setFrame(this.variant[1]);
            // Bar turns orange and shrinks to 2/3 width
            this.healthBarFg.setFillStyle(0xffaa00);
            this.healthBarFg.width = BAR_WIDTH * (this.health / this.config.health);

        } else if (this.health === 1) {
            // Switch to broken frame
            this.setFrame(this.variant[2]);
            // Bar turns red and shrinks to 1/3 width
            this.healthBarFg.setFillStyle(0xff4444);
            this.healthBarFg.width = BAR_WIDTH * (this.health / this.config.health);

        } else if (this.health <= 0) {
            // Time to break apart — bars are destroyed inside breakApart()
            this.breakApart();
        }
    }
 
    // --------------------------------------------------------
    // BREAK APART — spawn chunks, destroy this asteroid
    // --------------------------------------------------------
 
 
    breakApart() {
    // Capture these BEFORE this.destroy() nullifies them
    const scene = this.scene;
    const x = this.x;
    const y = this.y;
 
    const chunkCount = Phaser.Math.Between(2, 3);
 
    for (let i = 0; i < chunkCount; i++) {
        const offsetX = Phaser.Math.Between(-30, 30);
        const offsetY = Phaser.Math.Between(-30, 30);
 
        const chunk = scene.add.sprite(  // ← scene, not this.scene
            x + offsetX,
            y + offsetY,
            'Asteroids',
            this.variant[2]
        );
 
        chunk.setDisplaySize(48, 48);
        scene.physics.add.existing(chunk);  // ← scene
        chunk.body.setGravity(0, 0);
 
        const scatterSpeed = Phaser.Math.Between(20, 60);
        const scatterAngle = Phaser.Math.Between(0, 360);
        scene.physics.velocityFromAngle(scatterAngle, scatterSpeed, chunk.body.velocity);
 
        scene.tweens.add({  // ← scene
            targets:  chunk.body.velocity,
            x: 0,
            y: 0,
            duration: 1000,
            ease: 'Power2'
        });
 
        chunk.setInteractive({ useHandCursor: true });
        chunk.minerals = Math.floor(this.mineralYield / chunkCount);
        chunk.alloys = Math.floor(this.alloyYield   / chunkCount);
 
        chunk.on('pointerdown', () => {
            scene.events.emit('collectResources', {  // ← scene
                minerals: chunk.minerals,
                alloys: chunk.alloys
            });
            chunk.destroy();
            console.log(`Collected chunk with ${chunk.minerals} minerals and ${chunk.alloys} alloys`);
        });
 
        scene.time.delayedCall(8000, () => {  // ← scene
            if (chunk && chunk.active) {
                chunk.destroy();
            }
        });
    }
 
    scene.events.emit('asteroidDestroyed');  // ← scene

    // Destroy health bar graphics before destroying the asteroid sprite
    this.healthBarBg.destroy();
    this.healthBarFg.destroy();

    this.destroy();  // now safe — we're done using this.scene
    }
 
    // --------------------------------------------------------
    // WRAP AROUND — called every frame via preUpdate
    // If asteroid drifts off one edge, it reappears on the other
    // --------------------------------------------------------
    wrapAround() {
        const pad = 64; // half sprite size — so it fully exits before wrapping
 
        if (this.x < -pad) this.x = GAME_WIDTH + pad;
        if (this.x > GAME_WIDTH + pad) this.x = -pad;
        if (this.y < -pad) this.y = GAME_HEIGHT + pad;
        if (this.y > GAME_HEIGHT + pad) this.y = -pad;
    }
 
    // --------------------------------------------------------
    // PRE UPDATE — Phaser calls this every frame automatically
    // We just need to call wrapAround here
    // --------------------------------------------------------
    preUpdate(time, delta) {
        super.preUpdate(time, delta); // always call super first
        this.wrapAround();

        // Keep health bar positioned above the asteroid as it drifts and wraps
        const barX = this.x - BAR_WIDTH / 2;
        const barY = this.y + BAR_OFFSET_Y;
        this.healthBarBg.setPosition(barX, barY);
        this.healthBarFg.setPosition(barX, barY);
    }
}