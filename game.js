// Step 4: Matter.js physics - real pendulum
// Pivot = static body that follows cursor
// Bob = dynamic body with real mass
// Rope = Matter constraint between pivot and bob

const GAME_WIDTH  = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y     = GAME_HEIGHT - 280;
const ROPE_LENGTH = 120;
const BOB_RADIUS  = 16;

class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const M = Phaser.Physics.Matter;
    const Bodies  = Phaser.Physics.Matter.Matter.Bodies;
    const Body    = Phaser.Physics.Matter.Matter.Body;
    const Constraint = Phaser.Physics.Matter.Matter.Constraint;
    const World   = Phaser.Physics.Matter.Matter.World;

    // --- Pivot: small static circle, will be moved every frame ---
    this.pivotBody = this.matter.add.circle(GAME_WIDTH / 2, PIVOT_Y, 6, {
      isStatic: true,
      collisionFilter: { mask: 0 }  // no collisions
    });

    // --- Bob: dynamic circle with real mass ---
    this.bobBody = this.matter.add.circle(
      GAME_WIDTH / 2,
      PIVOT_Y + ROPE_LENGTH,
      BOB_RADIUS,
      {
        mass: 5,
        frictionAir: 0.01,
        restitution: 0.2,
        collisionFilter: { mask: 0 }
      }
    );

    // --- Rope: constraint between pivot and bob ---
    this.rope = Constraint.create({
      bodyA: this.pivotBody,
      bodyB: this.bobBody,
      length: ROPE_LENGTH,
      stiffness: 1,
      damping: 0
    });
    World.add(this.matter.world.localWorld, this.rope);

    // Graphics layer for drawing
    this.gfx = this.add.graphics();

    // Pointer tracking
    this.targetX = GAME_WIDTH / 2;
    this.input.on('pointermove', (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
    this.input.on('pointerdown',  (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
  }

  update() {
    // Move pivot to follow cursor (instantly)
    Phaser.Physics.Matter.Matter.Body.setPosition(this.pivotBody, {
      x: this.targetX,
      y: PIVOT_Y
    });

    const px = this.pivotBody.position.x;
    const py = this.pivotBody.position.y;
    const bx = this.bobBody.position.x;
    const by = this.bobBody.position.y;

    this.gfx.clear();

    // Pivot dot
    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(px, py, 7);

    // Rope
    this.gfx.lineStyle(2, 0xcccccc, 0.8);
    this.gfx.beginPath();
    this.gfx.moveTo(px, py);
    this.gfx.lineTo(bx, by);
    this.gfx.strokePath();

    // Bob
    this.gfx.fillStyle(0x00d4ff, 1);
    this.gfx.fillCircle(bx, by, BOB_RADIUS);
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1 },   // real gravity
      debug: false
    }
  },
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
