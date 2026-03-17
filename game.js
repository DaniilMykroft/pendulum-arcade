// Step 3a: Classic pendulum. Pivot follows cursor. Rope + bob hang below.

const GAME_WIDTH = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y = GAME_HEIGHT - 300;  // pivot lives in lower third of screen
const ROPE_LENGTH = 100;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.pivotX = GAME_WIDTH / 2;
    this.prevPivotX = this.pivotX;
    this.prevPivotVelX = 0;

    // angle from vertical (0 = bob hangs straight down)
    this.angle = 0;
    this.angleVel = 0;
    this.damping = 0.992;
    this.gravity = 0.005;  // angular gravity: angleAcc = -(g/L)*sin(angle)

    this.gfx = this.add.graphics();

    this.input.on('pointermove', (p) => { this.pivotX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
    this.input.on('pointerdown',  (p) => { this.pivotX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
  }

  update() {
    // Pivot kinematics
    const pivotVelX  = this.pivotX - this.prevPivotX;
    const pivotAccX  = pivotVelX   - this.prevPivotVelX;
    this.prevPivotX    = this.pivotX;
    this.prevPivotVelX = pivotVelX;

    // Pendulum ODE:
    // d²θ/dt² = -(g/L)·sin θ  −  (ẍ_pivot / L)·cos θ
    const L = ROPE_LENGTH;
    this.angleVel += -(this.gravity / L) * Math.sin(this.angle)
                   - (pivotAccX * 0.4 / L) * Math.cos(this.angle);
    this.angleVel *= this.damping;
    this.angle    += this.angleVel;

    // Bob position
    const bobX = this.pivotX + L * Math.sin(this.angle);
    const bobY = PIVOT_Y    + L * Math.cos(this.angle);

    // Draw
    this.gfx.clear();

    // Pivot dot
    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(this.pivotX, PIVOT_Y, 7);

    // Rope
    this.gfx.lineStyle(2, 0xcccccc, 0.8);
    this.gfx.beginPath();
    this.gfx.moveTo(this.pivotX, PIVOT_Y);
    this.gfx.lineTo(bobX, bobY);
    this.gfx.strokePath();

    // Bob
    this.gfx.fillStyle(0x00d4ff, 1);
    this.gfx.fillCircle(bobX, bobY, 10);
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
