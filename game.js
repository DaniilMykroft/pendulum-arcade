// Step 2f: Fix paddle direction - rope and paddle always consistent
// Rope hangs from pivot, paddle is perpendicular at rope end, attached at one end

const GAME_WIDTH = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y = GAME_HEIGHT - 320;
const ROPE_LENGTH = 40;
const PADDLE_LEN = 70;

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

    // angle = rotation of rope from pointing straight DOWN (0)
    // positive = clockwise
    this.angle = 0;
    this.angleVel = 0;
    this.damping = 0.990;
    this.gravity = 0.006;

    this.gfx = this.add.graphics();

    this.add.text(GAME_WIDTH / 2, 40, 'Move fast to spin 360°', {
      fontSize: '16px',
      color: '#ffffff66',
    }).setOrigin(0.5);

    this.input.on('pointermove', (p) => { this.pivotX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
    this.input.on('pointerdown', (p) => { this.pivotX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
  }

  update() {
    const pivotVelX = this.pivotX - this.prevPivotX;
    const pivotAccX = pivotVelX - this.prevPivotVelX;
    this.prevPivotX = this.pivotX;
    this.prevPivotVelX = pivotVelX;

    const L = ROPE_LENGTH;
    const angleAcc =
      -(this.gravity / L) * Math.sin(this.angle)
      - (pivotAccX * 0.5 / L) * Math.cos(this.angle);

    this.angleVel += angleAcc;
    this.angleVel *= this.damping;
    this.angle += this.angleVel;

    // Rope direction vector (unit)
    const rx = Math.sin(this.angle);
    const ry = Math.cos(this.angle);  // positive Y = down

    // Rope end point
    const ropeEndX = this.pivotX + L * rx;
    const ropeEndY = PIVOT_Y + L * ry;

    // Paddle is perpendicular to rope, attached at ropeEnd (one end of paddle)
    // Perpendicular to (rx, ry) = (-ry, rx)  -- always 90deg clockwise from rope
    const pdx = -ry;
    const pdy = rx;

    const px1 = ropeEndX;
    const py1 = ropeEndY;
    const px2 = ropeEndX + PADDLE_LEN * pdx;
    const py2 = ropeEndY + PADDLE_LEN * pdy;

    this.gfx.clear();

    // Pivot
    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(this.pivotX, PIVOT_Y, 7);

    // Rope
    this.gfx.lineStyle(2, 0xaaaaaa, 0.8);
    this.gfx.beginPath();
    this.gfx.moveTo(this.pivotX, PIVOT_Y);
    this.gfx.lineTo(ropeEndX, ropeEndY);
    this.gfx.strokePath();

    // Paddle
    this.gfx.lineStyle(12, 0x00d4ff, 1);
    this.gfx.beginPath();
    this.gfx.moveTo(px1, py1);
    this.gfx.lineTo(px2, py2);
    this.gfx.strokePath();

    // Joint dot
    this.gfx.fillStyle(0x00d4ff, 0.9);
    this.gfx.fillCircle(ropeEndX, ropeEndY, 6);
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
