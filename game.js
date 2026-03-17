// Step 5b: Rope attaches to END of paddle (nunchaku), stiffness back to 0.9

const GAME_WIDTH  = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y     = GAME_HEIGHT - 280;
const ROPE_LENGTH = 100;
const PADDLE_W    = 90;
const PADDLE_H    = 12;

class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const MatterLib  = Phaser.Physics.Matter.Matter;
    const Constraint = MatterLib.Constraint;
    const World      = MatterLib.World;

    // Pivot: static, follows cursor
    this.pivotBody = this.matter.add.circle(GAME_WIDTH / 2, PIVOT_Y, 5, {
      isStatic: true,
      collisionFilter: { mask: 0 }
    });

    // Paddle: dynamic rectangle
    this.paddleBody = this.matter.add.rectangle(
      GAME_WIDTH / 2,
      PIVOT_Y + ROPE_LENGTH,
      PADDLE_W, PADDLE_H,
      {
        mass: 5,
        frictionAir: 0.008,
        restitution: 0.3,
        collisionFilter: { mask: 0 }
      }
    );

    // Rope attaches to LEFT END of paddle (pointB.x = -PADDLE_W/2)
    this.rope = Constraint.create({
      bodyA: this.pivotBody,
      bodyB: this.paddleBody,
      pointB: { x: -PADDLE_W / 2, y: 0 },  // left end of paddle
      length: ROPE_LENGTH,
      stiffness: 0.9,
      damping: 0.05
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
    const bx = this.paddleBody.position.x;
    const by = this.paddleBody.position.y;
    const angle = this.paddleBody.angle;

    // World position of rope attachment point (left end of paddle)
    const attachX = bx + Math.cos(angle) * (-PADDLE_W / 2);
    const attachY = by + Math.sin(angle) * (-PADDLE_W / 2);

    this.gfx.clear();

    // Pivot dot
    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(px, py, 7);

    // Rope
    this.gfx.lineStyle(2, 0xcccccc, 0.8);
    this.gfx.beginPath();
    this.gfx.moveTo(px, py);
    this.gfx.lineTo(attachX, attachY);
    this.gfx.strokePath();

    // Paddle (rotated)
    this.gfx.save();
    this.gfx.translateCanvas(bx, by);
    this.gfx.rotateCanvas(angle);
    this.gfx.fillStyle(0x00d4ff, 1);
    this.gfx.fillRect(-PADDLE_W / 2, -PADDLE_H / 2, PADDLE_W, PADDLE_H);
    this.gfx.restore();

    // Dot at attachment point
    this.gfx.fillStyle(0xffffff, 0.7);
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
