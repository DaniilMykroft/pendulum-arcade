// Step 7b: Rope attaches near end of paddle (8px from edge)

const GAME_WIDTH  = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y     = GAME_HEIGHT - 280;
const ROPE_LENGTH = 120;
const PADDLE_W    = 90;
const PADDLE_H    = 12;
const ATTACH_X    = -PADDLE_W / 2 + 8;  // near left end, not exact edge

class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const MatterLib  = Phaser.Physics.Matter.Matter;
    const Constraint = MatterLib.Constraint;
    const World      = MatterLib.World;

    this.pivotBody = this.matter.add.circle(GAME_WIDTH / 2, PIVOT_Y, 5, {
      isStatic: true,
      collisionFilter: { mask: 0 }
    });

    // Paddle starts so that attach point is directly below pivot
    this.paddleBody = this.matter.add.rectangle(
      GAME_WIDTH / 2 - ATTACH_X,
      PIVOT_Y + ROPE_LENGTH,
      PADDLE_W, PADDLE_H,
      {
        mass: 5,
        frictionAir: 0.01,
        frictionAngular: 0.05,
        restitution: 0.2,
        collisionFilter: { mask: 0 }
      }
    );

    this.rope = Constraint.create({
      bodyA: this.pivotBody,
      bodyB: this.paddleBody,
      pointB: { x: ATTACH_X, y: 0 },
      length: ROPE_LENGTH,
      stiffness: 1,
      damping: 0.1
    });
    World.add(this.matter.world.localWorld, this.rope);

    this.gfx = this.add.graphics();
    this.targetX = GAME_WIDTH / 2;
    this.input.on('pointermove', (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
    this.input.on('pointerdown',  (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
  }

  update() {
    const MatterLib = Phaser.Physics.Matter.Matter;
    MatterLib.Body.setPosition(this.pivotBody, { x: this.targetX, y: PIVOT_Y });
    MatterLib.Body.setVelocity(this.pivotBody, { x: 0, y: 0 });

    const px    = this.pivotBody.position.x;
    const py    = this.pivotBody.position.y;
    const bx    = this.paddleBody.position.x;
    const by    = this.paddleBody.position.y;
    const angle = this.paddleBody.angle;

    // World coords of attachment point
    const attachX = bx + Math.cos(angle) * ATTACH_X - Math.sin(angle) * 0;
    const attachY = by + Math.sin(angle) * ATTACH_X + Math.cos(angle) * 0;

    this.gfx.clear();

    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(px, py, 7);

    this.gfx.lineStyle(2, 0xcccccc, 0.8);
    this.gfx.beginPath();
    this.gfx.moveTo(px, py);
    this.gfx.lineTo(attachX, attachY);
    this.gfx.strokePath();

    this.gfx.save();
    this.gfx.translateCanvas(bx, by);
    this.gfx.rotateCanvas(angle);
    this.gfx.fillStyle(0x00d4ff, 1);
    this.gfx.fillRect(-PADDLE_W / 2, -PADDLE_H / 2, PADDLE_W, PADDLE_H);
    this.gfx.restore();

    this.gfx.fillStyle(0xffffff, 0.8);
    this.gfx.fillCircle(attachX, attachY, 4);
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
      gravity: { y: 1 },
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
