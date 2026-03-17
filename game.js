// Step 5: Soft rope + paddle (rectangle) instead of bob

const GAME_WIDTH  = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y     = GAME_HEIGHT - 280;
const ROPE_LENGTH = 120;
const PADDLE_W    = 80;
const PADDLE_H    = 12;

class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const MatterLib   = Phaser.Physics.Matter.Matter;
    const Body        = MatterLib.Body;
    const Constraint  = MatterLib.Constraint;
    const World       = MatterLib.World;

    // Pivot: static, follows cursor
    this.pivotBody = this.matter.add.circle(GAME_WIDTH / 2, PIVOT_Y, 5, {
      isStatic: true,
      collisionFilter: { mask: 0 }
    });

    // Paddle: dynamic rectangle, attached at its top-center to rope end
    this.paddleBody = this.matter.add.rectangle(
      GAME_WIDTH / 2,
      PIVOT_Y + ROPE_LENGTH,
      PADDLE_W, PADDLE_H,
      {
        mass: 5,
        frictionAir: 0.01,
        restitution: 0.3,
        collisionFilter: { mask: 0 }
      }
    );

    // Soft rope: low stiffness so it sags and swings naturally
    this.rope = Constraint.create({
      bodyA: this.pivotBody,
      bodyB: this.paddleBody,
      pointB: { x: 0, y: -PADDLE_H / 2 }, // attach to top-center of paddle
      length: ROPE_LENGTH,
      stiffness: 0.05,
      damping: 0.01
    });
    World.add(this.matter.world.localWorld, this.rope);

    this.gfx = this.add.graphics();

    this.targetX = GAME_WIDTH / 2;
    this.input.on('pointermove', (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
    this.input.on('pointerdown',  (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
  }

  update() {
    Phaser.Physics.Matter.Matter.Body.setPosition(this.pivotBody, {
      x: this.targetX,
      y: PIVOT_Y
    });

    const px = this.pivotBody.position.x;
    const py = this.pivotBody.position.y;

    // Paddle position and angle from Matter
    const bx = this.paddleBody.position.x;
    const by = this.paddleBody.position.y;
    const angle = this.paddleBody.angle;

    // Rope attachment point on paddle (top-center in world space)
    const attachX = bx - Math.sin(angle) * (PADDLE_H / 2);
    const attachY = by - Math.cos(angle) * (PADDLE_H / 2);

    this.gfx.clear();

    // Pivot dot
    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(px, py, 7);

    // Rope (from pivot to top of paddle)
    this.gfx.lineStyle(2, 0xcccccc, 0.8);
    this.gfx.beginPath();
    this.gfx.moveTo(px, py);
    this.gfx.lineTo(attachX, attachY);
    this.gfx.strokePath();

    // Paddle (rotated rectangle drawn manually)
    this.gfx.save();
    this.gfx.translateCanvas(bx, by);
    this.gfx.rotateCanvas(angle);
    this.gfx.fillStyle(0x00d4ff, 1);
    this.gfx.fillRect(-PADDLE_W / 2, -PADDLE_H / 2, PADDLE_W, PADDLE_H);
    this.gfx.restore();
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
