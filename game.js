// Step 2b: Pivot follows pointer horizontally, rope+paddle hang freely (360 rotation)

const GAME_WIDTH = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y = GAME_HEIGHT - 320;  // pivot is in lower area
const ROPE_LENGTH = 80;
const PADDLE_LEN = 70;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Pivot state
    this.pivotX = GAME_WIDTH / 2;
    this.prevPivotX = this.pivotX;

    // Rope angle state (angle from vertical DOWN = 0)
    this.angle = 0;       // radians
    this.angleVel = 0;    // angular velocity
    this.damping = 0.98;  // air friction
    this.gravity = 0.006; // pulls rope down (toward angle=0)

    // Graphics
    this.gfx = this.add.graphics();

    // Hint
    this.add.text(GAME_WIDTH / 2, 40, 'Move cursor / drag to swing', {
      fontSize: '16px',
      color: '#ffffff66',
      align: 'center'
    }).setOrigin(0.5);

    // Track pointer
    this.input.on('pointermove', (pointer) => {
      this.pivotX = Phaser.Math.Clamp(pointer.x, 0, GAME_WIDTH);
    });
    this.input.on('pointerdown', (pointer) => {
      this.pivotX = Phaser.Math.Clamp(pointer.x, 0, GAME_WIDTH);
    });
  }

  update() {
    // Pivot acceleration = delta movement of pivot (inertia transfer)
    const pivotDeltaX = this.pivotX - this.prevPivotX;
    this.prevPivotX = this.pivotX;

    // Pendulum equation + pivot acceleration drives swing
    const gravityTorque = -this.gravity * Math.sin(this.angle);
    const pivotTorque = -(pivotDeltaX * 0.003) / ROPE_LENGTH;
    this.angleVel += gravityTorque + pivotTorque;
    this.angleVel *= this.damping;
    this.angle += this.angleVel;
    // Full 360 - no clamping

    // Rope tip position
    const ropeEndX = this.pivotX + ROPE_LENGTH * Math.sin(this.angle);
    const ropeEndY = PIVOT_Y + ROPE_LENGTH * Math.cos(this.angle);

    // Paddle endpoints (perpendicular to rope direction)
    const perpAngle = this.angle + Math.PI / 2;
    const px1 = ropeEndX - PADDLE_LEN / 2 * Math.cos(perpAngle);
    const py1 = ropeEndY - PADDLE_LEN / 2 * Math.sin(perpAngle);
    const px2 = ropeEndX + PADDLE_LEN / 2 * Math.cos(perpAngle);
    const py2 = ropeEndY + PADDLE_LEN / 2 * Math.sin(perpAngle);

    // Draw
    this.gfx.clear();

    // Pivot point
    this.gfx.fillStyle(0xffffff, 0.9);
    this.gfx.fillCircle(this.pivotX, PIVOT_Y, 7);

    // Rope
    this.gfx.lineStyle(2, 0xaaaaaa, 0.7);
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

    // Glow at rope tip
    this.gfx.fillStyle(0x00d4ff, 0.6);
    this.gfx.fillCircle(ropeEndX, ropeEndY, 8);
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
