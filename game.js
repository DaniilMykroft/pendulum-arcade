// Step 2: Pendulum swing + tap to push

const GAME_WIDTH = 390;
const GAME_HEIGHT = 844;

// Pendulum config
const PIVOT_X = GAME_WIDTH / 2;
const PIVOT_Y = 120;
const ARM_LENGTH = 180;

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Pendulum state
    this.angle = -0.6;         // radians, start tilted left
    this.angleVel = 0;         // angular velocity
    this.angleDamp = 0.995;    // damping (friction)
    this.gravity = 0.004;      // pendulum gravity constant

    // Graphics objects
    this.armLine = this.add.graphics();
    this.pivotDot = this.add.graphics();
    this.paddle = this.add.graphics();

    // Draw static pivot point
    this.pivotDot.fillStyle(0xffffff, 0.8);
    this.pivotDot.fillCircle(PIVOT_X, PIVOT_Y, 6);

    // Tap/click = push the pendulum
    this.input.on('pointerdown', (pointer) => {
      // Push direction depends on which side of center the tap is
      const push = pointer.x < GAME_WIDTH / 2 ? -0.04 : 0.04;
      this.angleVel += push;
    });

    // Hint text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Tap left / right to push', {
      fontSize: '18px',
      color: '#ffffff88',
      align: 'center'
    }).setOrigin(0.5);
  }

  update() {
    // Pendulum physics (simple harmonic)
    this.angleVel += -this.gravity * Math.sin(this.angle);
    this.angleVel *= this.angleDamp;
    this.angle += this.angleVel;

    // Paddle tip position
    const tipX = PIVOT_X + ARM_LENGTH * Math.sin(this.angle);
    const tipY = PIVOT_Y + ARM_LENGTH * Math.cos(this.angle);

    // Paddle orientation (perpendicular to arm)
    const paddleLen = 60;
    const perpAngle = this.angle + Math.PI / 2;
    const px1 = tipX - paddleLen / 2 * Math.cos(perpAngle);
    const py1 = tipY - paddleLen / 2 * Math.sin(perpAngle);
    const px2 = tipX + paddleLen / 2 * Math.cos(perpAngle);
    const py2 = tipY + paddleLen / 2 * Math.sin(perpAngle);

    // Redraw arm
    this.armLine.clear();
    this.armLine.lineStyle(3, 0xaaaaaa, 0.8);
    this.armLine.beginPath();
    this.armLine.moveTo(PIVOT_X, PIVOT_Y);
    this.armLine.lineTo(tipX, tipY);
    this.armLine.strokePath();

    // Redraw paddle
    this.paddle.clear();
    this.paddle.lineStyle(10, 0x00d4ff, 1);
    this.paddle.beginPath();
    this.paddle.moveTo(px1, py1);
    this.paddle.lineTo(px2, py2);
    this.paddle.strokePath();

    // Glow dot at tip
    this.paddle.fillStyle(0x00d4ff, 1);
    this.paddle.fillCircle(tipX, tipY, 5);
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
