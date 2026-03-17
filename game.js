// Step 3c: Heavier bob feel - larger, less responsive to pivot movement

const GAME_WIDTH = 390;
const GAME_HEIGHT = 844;

const PIVOT_Y = GAME_HEIGHT - 300;
const ROPE_LENGTH = 100;
const BOB_RADIUS = 18;    // bigger = looks heavier
const BOB_MASS = 8;       // higher = less impulse from pivot

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

    this.angle = 0;
    this.angleVel = 0;
    this.damping = 0.992;
    this.gravity = 0.04;

    this.gfx = this.add.graphics();

    this.input.on('pointermove', (p) => { this.pivotX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
    this.input.on('pointerdown',  (p) => { this.pivotX = Phaser.Math.Clamp(p.x, 0, GAME_WIDTH); });
  }

  update() {
    const pivotVelX = this.pivotX - this.prevPivotX;
    const pivotAccX = pivotVelX   - this.prevPivotVelX;
    this.prevPivotX    = this.pivotX;
    this.prevPivotVelX = pivotVelX;

    const L = ROPE_LENGTH;
    // Divide impulse by BOB_MASS - heavier bob = less reactive to pivot
    this.angleVel += -(this.gravity / L) * Math.sin(this.angle)
                   - (pivotAccX * 0.4 / L / BOB_MASS) * Math.cos(this.angle);
    this.angleVel *= this.damping;
    this.angle    += this.angleVel;

    const bobX = this.pivotX + L * Math.sin(this.angle);
    const bobY = PIVOT_Y    + L * Math.cos(this.angle);

    this.gfx.clear();

    // Pivot
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
    this.gfx.fillCircle(bobX, bobY, BOB_RADIUS);
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
