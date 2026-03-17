// Step 8b: Rope stiffness 0.98 - almost inextensible

const GAME_WIDTH  = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y     = GAME_HEIGHT - 300;
const ROPE_LENGTH = 100;
const PADDLE_W    = 90;
const PADDLE_H    = 12;

class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const M          = Phaser.Physics.Matter.Matter;
    const Constraint = M.Constraint;
    const World      = M.World;
    const world      = this.matter.world.localWorld;

    this.pivot = this.matter.add.circle(GAME_WIDTH / 2, PIVOT_Y, 5, {
      isStatic: true,
      collisionFilter: { mask: 0 }
    });

    this.hinge = this.matter.add.circle(GAME_WIDTH / 2, PIVOT_Y + ROPE_LENGTH, 5, {
      mass: 0.1,
      frictionAir: 0.02,
      collisionFilter: { mask: 0 }
    });

    this.paddle = this.matter.add.rectangle(
      GAME_WIDTH / 2 + PADDLE_W / 2,
      PIVOT_Y + ROPE_LENGTH,
      PADDLE_W, PADDLE_H,
      {
        mass: 3,
        frictionAir: 0.01,
        frictionAngular: 0.005,
        restitution: 0.3,
        collisionFilter: { mask: 0 }
      }
    );

    // Rope: stiffness 0.98 - almost no stretch
    World.add(world, Constraint.create({
      bodyA: this.pivot,
      bodyB: this.hinge,
      length: ROPE_LENGTH,
      stiffness: 0.98,
      damping: 0
    }));

    // Pin joint hinge -> paddle end
    World.add(world, Constraint.create({
      bodyA: this.hinge,
      bodyB: this.paddle,
      pointB: { x: -PADDLE_W / 2, y: 0 },
      length: 0,
      stiffness: 1,
      damping: 0
    }));

    this.gfx = this.add.graphics();
    this.targetX = GAME_WIDTH / 2;
    this.input.on('pointermove', (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
    this.input.on('pointerdown',  (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
  }

  update() {
    const M = Phaser.Physics.Matter.Matter;
    M.Body.setPosition(this.pivot, { x: this.targetX, y: PIVOT_Y });
    M.Body.setVelocity(this.pivot, { x: 0, y: 0 });

    const px = this.pivot.position.x;
    const py = this.pivot.position.y;
    const hx = this.hinge.position.x;
    const hy = this.hinge.position.y;
    const bx = this.paddle.position.x;
    const by = this.paddle.position.y;
    const angle = this.paddle.angle;

    this.gfx.clear();

    // Pivot
    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(px, py, 7);

    // Rope
    this.gfx.lineStyle(2, 0xcccccc, 0.8);
    this.gfx.beginPath();
    this.gfx.moveTo(px, py);
    this.gfx.lineTo(hx, hy);
    this.gfx.strokePath();

    // Hinge dot
    this.gfx.fillStyle(0xffffff, 0.6);
    this.gfx.fillCircle(hx, hy, 4);

    // Paddle
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
