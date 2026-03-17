// Step 2e: Tuned for full 360 spin on fast movement

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
    this.pivotVelX = 0;
    this.prevPivotX = this.pivotX;
    this.prevPivotVelX = 0;

    this.angle = 0;
    this.angleVel = 0;
    this.damping = 0.995;   // less friction - spin persists longer
    this.gravity = 0.003;   // weaker gravity - easier to overcome for full spin

    this.gfx = this.add.graphics();

    this.add.text(GAME_WIDTH / 2, 40, 'Move fast to spin 360°', {
      fontSize: '16px',
      color: '#ffffff66',
      align: 'center'
    }).setOrigin(0.5);

    this.input.on('pointermove', (pointer) => {
      this.pivotX = Phaser.Math.Clamp(pointer.x, 0, GAME_WIDTH);
    });
    this.input.on('pointerdown', (pointer) => {
      this.pivotX = Phaser.Math.Clamp(pointer.x, 0, GAME_WIDTH);
    });
  }

  update() {
    this.pivotVelX = this.pivotX - this.prevPivotX;
    const pivotAccX = this.pivotVelX - this.prevPivotVelX;
    this.prevPivotX = this.pivotX;
    this.prevPivotVelX = this.pivotVelX;

    // Stronger impulse transfer: coefficient 0.6 instead of 0.1
    const L = ROPE_LENGTH;
    const angleAcc =
      -(this.gravity) * Math.sin(this.angle)
      - (pivotAccX * 0.6 / L) * Math.cos(this.angle);

    this.angleVel += angleAcc;
    this.angleVel *= this.damping;
    this.angle += this.angleVel;

    const ropeEndX = this.pivotX + L * Math.sin(this.angle);
    const ropeEndY = PIVOT_Y + L * Math.cos(this.angle);

    const perpAngle = this.angle + Math.PI / 2;
    const px1 = ropeEndX;
    const py1 = ropeEndY;
    const px2 = ropeEndX + PADDLE_LEN * Math.cos(perpAngle);
    const py2 = ropeEndY + PADDLE_LEN * Math.sin(perpAngle);

    this.gfx.clear();

    // Pivot
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

    // Joint dot
    this.gfx.fillStyle(0x00d4ff, 0.8);
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
