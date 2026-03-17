// Step 7c: Debug mode ON - see actual physics bodies and constraints

const GAME_WIDTH  = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y     = GAME_HEIGHT - 280;
const ROPE_LENGTH = 120;
const PADDLE_W    = 90;
const PADDLE_H    = 12;
const ATTACH_X    = -PADDLE_W / 2 + 8;

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

    this.targetX = GAME_WIDTH / 2;
    this.input.on('pointermove', (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
    this.input.on('pointerdown',  (p) => { this.targetX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
  }

  update() {
    const MatterLib = Phaser.Physics.Matter.Matter;
    MatterLib.Body.setPosition(this.pivotBody, { x: this.targetX, y: PIVOT_Y });
    MatterLib.Body.setVelocity(this.pivotBody, { x: 0, y: 0 });
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
      debug: {
        showBody: true,
        showStaticBody: true,
        showVelocity: true,
        showAngleIndicator: true,
        showConstraints: true,
        constraintColor: 0xff0000
      }
    }
  },
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
