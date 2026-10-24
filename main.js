
import Phaser from "phaser";
import "./style.css";

class DrawFightScene extends Phaser.Scene {
  constructor() {
    super("DrawFight");
  }

  create() {
    this.strokes = [];
    this.activeStroke = null;

    this.playerHP = 100;
    this.enemyHP = 100;
    this.damage = 20;
    this.weaponType = "balanced";
    this.weaponReady = false;

    this.isFighting = false;
    this.autoBattle = false;
    this.battleOver = false;
    this.roundId = 0;

    this.createBackground();
    this.createDrawingArea();
    this.createCharacters();
    this.createHealthBars();
    this.createButtons();

    this.input.on("pointerdown", (pointer) => {
      if (
        this.isFighting ||
        this.autoBattle ||
        this.battleOver ||
        !this.insideBox(pointer.x, pointer.y)
      ) {
        return;
      }

      this.activeStroke = {
        points: [{ x: pointer.x, y: pointer.y }],
      };

      this.strokes.push(this.activeStroke);
      this.drawWeapon();
    });

    this.input.on("pointermove", (pointer) => {
      if (!this.activeStroke || !pointer.isDown) return;

      if (this.insideBox(pointer.x, pointer.y)) {
        this.activeStroke.points.push({
          x: pointer.x,
          y: pointer.y,
        });
        this.drawWeapon();
      }
    });

    this.input.on("pointerup", () => {
      if (!this.activeStroke) return;

      this.activeStroke = null;
      this.analyzeWeapon();
    });

    this.updateHealth();
    this.setStatus("Draw your weapon to get started!");
  }

  createBackground() {
    this.cameras.main.setBackgroundColor("#090e19");

    const g = this.add.graphics();

    // Main frame
    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(15, 15, 930, 510, 18);

    g.lineStyle(1, 0x39445b, 1);
    g.strokeRoundedRect(15, 15, 930, 510, 18);

    // Header
    this.add.text(480, 38, "DRAW & FIGHT", {
      fontFamily: "Georgia, serif",
      fontSize: "29px",
      fontStyle: "bold",
      color: "#f3f0e8",
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.add.text(480, 69, "FORGE YOUR WEAPON  •  CLAIM VICTORY", {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#a9b6cc",
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Drawing panel
    g.fillStyle(0x0b1220, 1);
    g.fillRoundedRect(30, 145, 420, 275, 12);

    g.lineStyle(2, 0x465673, 1);
    g.strokeRoundedRect(30, 145, 420, 275, 12);

    // Arena
    g.fillStyle(0x151c2b, 1);
    g.fillRoundedRect(480, 105, 445, 330, 14);

    g.lineStyle(2, 0x45516a, 0.9);
    g.strokeRoundedRect(480, 105, 445, 330, 14);

    // Stone wall
    g.lineStyle(1, 0x344056, 0.8);

    for (let x = 510; x < 915; x += 52) {
      g.lineBetween(x, 120, x, 260);
    }

    g.lineBetween(495, 200, 910, 200);
    g.lineBetween(495, 260, 910, 260);

    // Pillars
    for (const x of [515, 890]) {
      g.fillStyle(0x29354a, 1);
      g.fillRoundedRect(x - 9, 125, 18, 255, 4);

      g.fillStyle(0x52617a, 1);
      g.fillRect(x - 13, 135, 26, 9);
      g.fillRect(x - 13, 365, 26, 9);

      g.fillStyle(0x1b2536, 1);
      g.fillRect(x - 4, 150, 8, 205);
    }

    // Floor
    g.fillStyle(0x202a3b, 1);
    g.fillRect(495, 280, 415, 105);

    g.lineStyle(1, 0x39465c, 0.8);

    for (let x = 500; x < 910; x += 42) {
      g.lineBetween(x, 280, x, 385);
    }

    for (let y = 305; y < 385; y += 27) {
      g.lineBetween(495, y, 910, y);
    }

    g.lineStyle(2, 0x74829a, 0.7);
    g.lineBetween(495, 385, 910, 385);

    // Decorative floor lights
    g.lineStyle(2, 0x4c7691, 0.6);
    g.lineBetween(545, 374, 875, 374);

    g.fillStyle(0x080c14, 0.6);
    g.fillEllipse(590, 350, 78, 20);
    g.fillEllipse(805, 350, 78, 20);

    g.fillStyle(0x111827, 1);
    g.fillRoundedRect(500, 392, 405, 25, 7);

    g.lineStyle(1, 0x45516a, 0.8);
    g.strokeRoundedRect(500, 392, 405, 25, 7);

    this.add.text(702, 404, "THE BATTLE ARENA", {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#c0cce0",
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Drawing grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x202c40, 0.8);

    for (let x = 60; x < 440; x += 30) {
      grid.lineBetween(x, 155, x, 410);
    }

    for (let y = 175; y < 420; y += 30) {
      grid.lineBetween(40, y, 440, y);
    }

    // Subtle panel details
    this.add.text(42, 153, "WEAPON FORGE", {
      fontFamily: "Arial",
      fontSize: "8px",
      color: "#526783",
      letterSpacing: 1,
    });

    this.add.text(500, 125, "BATTLE", {
      fontFamily: "Arial",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#dce7ff",
    });
  }

  createDrawingArea() {
    this.add.text(30, 105, "1. DRAW YOUR WEAPON", {
      fontFamily: "Arial",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#dce7ff",
    });

    this.add.text(30, 124, "Use your mouse or finger", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#8294b5",
    });

    this.drawingGraphics = this.add.graphics();

    this.drawingHint = this.add.text(240, 278, "✦\nDRAW SOMETHING!", {
      fontFamily: "Arial",
      fontSize: "18px",
      fontStyle: "bold",
      color: "#40516f",
      align: "center",
      lineSpacing: 8,
    }).setOrigin(0.5);

    this.weaponLabel = this.add.text(240, 442, "WEAPON: NONE", {
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#a8b9d8",
    }).setOrigin(0.5);

    this.damageLabel = this.add.text(240, 462, "DAMAGE: --", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#7f91b2",
    }).setOrigin(0.5);

    this.statusText = this.add.text(702, 477, "", {
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#c7d6f4",
      align: "center",
      wordWrap: { width: 430 },
    }).setOrigin(0.5);
  }

  createCharacters() {
    this.hero = this.add.container(590, 280);
    this.enemy = this.add.container(805, 280);

    this.drawCharacter(this.hero, 0x58a6ff, false);
    this.drawCharacter(this.enemy, 0xff657a, true);

    this.heroWeapon = this.add.container(618, 276).setDepth(10);
    this.enemyWeapon = this.add.container(777, 276).setDepth(10);

    this.drawWeaponGraphic(this.heroWeapon, "balanced", 0xf6d365);
    this.drawWeaponGraphic(this.enemyWeapon, "sword", 0xff8794);

    this.heroWeapon.setVisible(false);

    this.add.text(590, 345, "HERO", {
      fontFamily: "Arial",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#80bdff",
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.add.text(805, 345, "ENEMY", {
      fontFamily: "Arial",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#ff929f",
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.enemyWeapon.setAngle(9);

    // Idle breathing animation
    this.tweens.add({
      targets: this.hero,
      y: 276,
      duration: 850,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.enemy,
      y: 276,
      duration: 1050,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
      delay: 150,
    });
  }

  drawCharacter(container, color, isEnemy) {
    const g = this.add.graphics();

    const armor = isEnemy ? 0x792f45 : 0x315f91;
    const armorLight = isEnemy ? 0xc14f64 : 0x68b8f5;
    const skin = isEnemy ? 0xc98c78 : 0xe6b795;
    const dark = 0x101827;

    // Legs and boots
    g.fillStyle(dark, 1);
    g.fillRoundedRect(-18, 31, 15, 34, 5);
    g.fillRoundedRect(4, 31, 15, 34, 5);

    g.fillStyle(0x333b4a, 1);
    g.fillRoundedRect(-23, 59, 24, 12, 4);
    g.fillRoundedRect(1, 59, 24, 12, 4);

    g.lineStyle(2, 0x69768b, 0.8);
    g.lineBetween(-19, 65, -5, 65);
    g.lineBetween(6, 65, 20, 65);

    // Body armor
    g.fillStyle(dark, 1);
    g.fillRoundedRect(-28, -13, 56, 52, 11);

    g.fillStyle(armor, 1);
    g.fillRoundedRect(-25, -16, 50, 51, 10);

    // Chest plate
    g.fillStyle(armorLight, 1);
    g.fillTriangle(-18, -9, 18, -9, 0, 23);

    g.fillStyle(armor, 1);
    g.fillTriangle(-12, -5, 12, -5, 0, 15);

    g.fillStyle(0xf3d18b, 1);
    g.fillCircle(0, 5, 4);

    // Belt
    g.fillStyle(0x382c2a, 1);
    g.fillRect(-24, 24, 48, 7);

    g.fillStyle(0xf3d18b, 1);
    g.fillRect(-4, 23, 8, 9);

    // Neck and arms
    g.fillStyle(skin, 1);
    g.fillRect(-7, -28, 14, 15);

    g.fillStyle(armor, 1);
    g.fillRoundedRect(-34, -10, 13, 30, 5);
    g.fillRoundedRect(21, -10, 13, 30, 5);

    g.fillStyle(0x39475e, 1);
    g.fillRoundedRect(-36, 7, 16, 12, 4);
    g.fillRoundedRect(20, 7, 16, 12, 4);

    g.fillStyle(skin, 1);
    g.fillCircle(-28, 24, 6);
    g.fillCircle(28, 24, 6);

    // Head
    g.fillStyle(skin, 1);
    g.fillCircle(0, -38, 21);

    // Helmet and hair
    g.fillStyle(isEnemy ? 0x3c1728 : 0x1a2a42, 1);
    g.fillRoundedRect(-23, -59, 46, 17, 7);
    g.fillRect(-21, -50, 7, 13);
    g.fillRect(14, -50, 7, 13);

    g.fillStyle(armorLight, 1);
    g.fillRoundedRect(-15, -57, 30, 4, 2);

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-7, -39, 4);
    g.fillCircle(7, -39, 4);

    g.fillStyle(0x111827, 1);
    g.fillCircle(-6, -39, 2);
    g.fillCircle(8, -39, 2);

    // Nose
    g.fillStyle(skin, 1);
    g.fillTriangle(-2, -35, 3, -35, 1, -29);

    // Shoulder armor
    g.fillStyle(armorLight, 1);
    g.fillCircle(-26, -11, 9);
    g.fillCircle(26, -11, 9);

    g.fillStyle(armor, 1);
    g.fillCircle(-26, -11, 5);
    g.fillCircle(26, -11, 5);

    // Shield
    g.fillStyle(0x172235, 1);
    g.fillRoundedRect(-43, -2, 18, 28, 5);

    g.fillStyle(armorLight, 1);
    g.fillTriangle(-34, 1, -27, 8, -34, 22);

    container.add(g);
  }

  createHealthBars() {
    this.add.text(515, 150, "HERO HP", {
      fontFamily: "Arial",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#80bdff",
    });

    this.add.text(740, 150, "ENEMY HP", {
      fontFamily: "Arial",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#ff929f",
    });

    this.heroBarBg = this.add.graphics();
    this.enemyBarBg = this.add.graphics();

    this.heroBarBg.fillStyle(0x26344a, 1);
    this.heroBarBg.fillRoundedRect(515, 166, 170, 10, 5);

    this.enemyBarBg.fillStyle(0x26344a, 1);
    this.enemyBarBg.fillRoundedRect(740, 166, 170, 10, 5);

    this.heroBar = this.add.graphics();
    this.enemyBar = this.add.graphics();

    this.heroHPText = this.add.text(600, 184, "100 / 100", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#cbd5e1",
    }).setOrigin(0.5);

    this.enemyHPText = this.add.text(825, 184, "100 / 100", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#cbd5e1",
    }).setOrigin(0.5);

    this.add.text(702, 218, "VS", {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#8596b2",
    }).setOrigin(0.5);

    this.resultText = this.add.text(702, 250, "", {
      fontFamily: "Georgia, serif",
      fontSize: "25px",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#101522",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5).setDepth(30);
  }

  createButtons() {
    this.clearButton = this.makeButton(
      125, 500, "CLEAR", 0x334155, () => this.clearWeapon()
    );

    this.fightButton = this.makeButton(
      480, 500, "⚔ FIGHT!", 0x2563eb, () => this.startBattle()
    );

    this.restartButton = this.makeButton(
      825, 500, "RESTART", 0x7c3aed, () => this.restartGame()
    );
  }

  makeButton(x, y, label, color, callback) {
    const button = this.add.rectangle(x, y, 160, 48, color, 1)
      .setStrokeStyle(2, 0xffffff, 0.2)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(x, y, label, {
      fontFamily: "Arial",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(101);

    button.on("pointerover", () => {
      if (button.getData("enabled")) {
        button.setScale(1.04);
        buttonText.setScale(1.04);
      }
    });

    button.on("pointerout", () => {
      button.setScale(1);
      buttonText.setScale(1);
    });

    button.on("pointerup", () => {
      if (!button.getData("enabled")) return;
      callback();
    });

    button.setData("enabled", true);
    button.setData("label", buttonText);

    return button;
  }

  setButtonEnabled(button, enabled) {
    if (!button) return;

    button.setData("enabled", enabled);
    button.setAlpha(enabled ? 1 : 0.45);

    const label = button.getData("label");
    if (label) label.setAlpha(enabled ? 1 : 0.6);
  }

  insideBox(x, y) {
    return x >= 30 && x <= 450 && y >= 145 && y <= 420;
  }

  drawWeapon() {
    this.drawingGraphics.clear();

    for (const stroke of this.strokes) {
      const points = stroke.points;
      if (!points.length) continue;

      this.drawingGraphics.lineStyle(5, 0x70e1ff, 0.95);

      if (points.length === 1) {
        this.drawingGraphics.fillStyle(0x70e1ff, 1);
        this.drawingGraphics.fillCircle(points[0].x, points[0].y, 3);
        continue;
      }

      this.drawingGraphics.beginPath();
      this.drawingGraphics.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        this.drawingGraphics.lineTo(points[i].x, points[i].y);
      }

      this.drawingGraphics.strokePath();
    }

    if (this.strokes.length) this.drawingHint.setVisible(false);
  }

  analyzeWeapon() {
    const points = this.strokes.flatMap((s) => s.points);

    if (points.length < 2) {
      this.setStatus("Draw a longer shape to create a weapon.");
      return;
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);

    const longestStroke = Math.max(
      ...this.strokes.map((stroke) => {
        let length = 0;

        for (let i = 1; i < stroke.points.length; i++) {
          const a = stroke.points[i - 1];
          const b = stroke.points[i];

          length += Phaser.Math.Distance.Between(
            a.x, a.y, b.x, b.y
          );
        }

        return length;
      }),
      0
    );

    if (width > height * 1.8 && longestStroke > 90) {
      this.weaponType = "sword";
      this.damage = 14;

      this.weaponLabel
        .setText("WEAPON: FAST SWORD")
        .setColor("#70e1ff");

      this.damageLabel.setText("DAMAGE: 14 • FAST ATTACK");
    } else if (
      this.strokes.length >= 2 &&
      height > width * 0.65 &&
      points.length > 10
    ) {
      this.weaponType = "hammer";
      this.damage = 28;

      this.weaponLabel
        .setText("WEAPON: HEAVY HAMMER")
        .setColor("#ffc66d");

      this.damageLabel.setText("DAMAGE: 28 • HEAVY ATTACK");
    } else {
      this.weaponType = "balanced";
      this.damage = 20;

      this.weaponLabel
        .setText("WEAPON: BALANCED")
        .setColor("#a9f0c2");

      this.damageLabel.setText("DAMAGE: 20 • BALANCED ATTACK");
    }

    this.weaponReady = true;

    this.heroWeapon.removeAll(true);
    this.drawWeaponGraphic(
      this.heroWeapon,
      this.weaponType,
      0xf6d365
    );

    this.heroWeapon.setPosition(this.hero.x + 28, this.hero.y - 4);
    this.heroWeapon.setAngle(-20);
    this.heroWeapon.setVisible(true);

    this.setStatus("Weapon ready! Press FIGHT to battle.");
  }

  drawWeaponGraphic(container, type, color) {
    const g = this.add.graphics();

    g.lineStyle(7, 0x7a4d2a, 1);
    g.lineBetween(0, 0, 36, 0);

    if (type === "sword") {
      g.fillStyle(color, 1);
      g.fillTriangle(30, -8, 65, 0, 30, 8);

      g.fillStyle(0xe9f5ff, 1);
      g.fillTriangle(35, -4, 58, 0, 35, 4);

      g.lineStyle(5, 0xdce6f5, 1);
      g.lineBetween(28, -11, 28, 11);
    } else if (type === "hammer") {
      g.lineStyle(10, 0xd5b6ff, 1);
      g.lineBetween(34, 0, 48, 0);

      g.fillStyle(color, 1);
      g.fillRoundedRect(40, -17, 24, 34, 5);

      g.fillStyle(0xffffff, 0.3);
      g.fillRoundedRect(44, -13, 6, 26, 3);
    } else {
      g.fillStyle(color, 1);
      g.fillTriangle(32, -8, 63, 0, 32, 8);

      g.fillStyle(0xffffff, 0.45);
      g.fillTriangle(36, -4, 55, 0, 36, 4);

      g.lineStyle(4, 0xe8c77a, 1);
      g.lineBetween(30, -10, 30, 10);
    }

    container.add(g);
  }

  // One click starts continuous combat.
  startBattle() {
    if (this.autoBattle || this.isFighting || this.battleOver) return;

    if (!this.weaponReady) {
      this.setStatus("Draw a weapon first!");
      return;
    }

    if (this.enemyHP <= 0 || this.playerHP <= 0) return;

    this.autoBattle = true;

    this.setButtonEnabled(this.fightButton, false);
    this.setButtonEnabled(this.clearButton, false);
    this.setButtonEnabled(this.restartButton, false);

    this.fight();
  }

  // One complete attack round. Automatically repeats until someone wins.
  fight() {
    if (!this.autoBattle || this.isFighting || this.battleOver) return;

    if (this.enemyHP <= 0 || this.playerHP <= 0) return;

    this.isFighting = true;
    const currentRound = ++this.roundId;

    const validRound = () =>
      this.roundId === currentRound &&
      this.isFighting &&
      this.autoBattle &&
      !this.battleOver;

    this.setStatus("Hero attacks!");

    this.tweens.add({
      targets: this.hero,
      x: 645,
      y: 265,
      duration: 250,
      ease: "Cubic.Out",

      onUpdate: () => {
        if (validRound()) {
          this.heroWeapon.setPosition(
            this.hero.x + 28,
            this.hero.y - 4
          );
        }
      },

      onComplete: () => {
        if (!validRound()) return;

        this.tweens.add({
          targets: this.heroWeapon,
          angle: 40,
          duration: 120,
          ease: "Cubic.Out",

          onComplete: () => {
            if (!validRound()) return;

            this.tweens.add({
              targets: this.heroWeapon,
              angle: 75,
              duration: 100,
              ease: "Cubic.In",

              onComplete: () => {
                if (!validRound()) return;

                this.hitEffect(this.enemy, 0xffffff);

                this.enemyHP = Math.max(
                  0,
                  this.enemyHP - this.damage
                );

                this.updateHealth();

                if (this.enemyHP <= 0) {
                  this.finishBattle(true);
                  return;
                }

                this.tweens.add({
                  targets: this.enemy,
                  x: 830,
                  angle: 8,
                  duration: 80,
                  yoyo: true,
                  repeat: 1,

                  onComplete: () => {
                    if (!validRound()) return;

                    this.enemy.setAngle(0);
                    this.enemy.setAlpha(0.45);

                    this.tweens.add({
                      targets: this.enemy,
                      alpha: 1,
                      duration: 150,

                      onComplete: () => {
                        if (!validRound()) return;
                        this.enemyCounterattack(currentRound);
                      },
                    });
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  enemyCounterattack(currentRound) {
    const validRound = () =>
      this.roundId === currentRound &&
      this.isFighting &&
      this.autoBattle &&
      !this.battleOver;

    if (!validRound()) return;

    this.setStatus("Enemy counterattacks!");

    this.tweens.add({
      targets: this.hero,
      x: 590,
      y: 280,
      duration: 220,
      ease: "Cubic.InOut",

      onUpdate: () => {
        if (validRound()) {
          this.heroWeapon.setPosition(
            this.hero.x + 28,
            this.hero.y - 4
          );
        }
      },
    });

    this.tweens.add({
      targets: this.enemy,
      x: 755,
      y: 265,
      duration: 220,
      ease: "Cubic.Out",

      onComplete: () => {
        if (!validRound()) return;

        this.enemyWeapon.setPosition(
          this.enemy.x - 28,
          this.enemy.y - 4
        );

        this.tweens.add({
          targets: this.enemyWeapon,
          angle: -60,
          duration: 180,
          ease: "Cubic.InOut",

          onComplete: () => {
            if (!validRound()) return;

            this.hitEffect(this.hero, 0xff657a);

            this.playerHP = Math.max(0, this.playerHP - 8);
            this.updateHealth();

            this.tweens.add({
              targets: this.hero,
              x: 570,
              angle: -7,
              duration: 80,
              yoyo: true,
              repeat: 1,

              onComplete: () => {
                if (!validRound()) return;

                this.hero.setAngle(0);

                this.tweens.add({
                  targets: this.enemy,
                  x: 805,
                  y: 280,
                  duration: 220,
                  ease: "Cubic.InOut",
                });

                this.tweens.add({
                  targets: this.enemyWeapon,
                  x: 777,
                  y: 276,
                  angle: 9,
                  duration: 220,
                  ease: "Cubic.InOut",

                  onComplete: () => {
                    if (!validRound()) return;

                    if (this.playerHP <= 0) {
                      this.finishBattle(false);
                      return;
                    }

                    this.completeRound(currentRound);
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  hitEffect(character, color) {
    this.cameras.main.shake(110, 0.0035);

    const impactX = character.x;
    const impactY = character.y - 12;

    const flash = this.add.circle(
      impactX,
      impactY,
      18,
      color,
      0.85
    ).setDepth(25);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.4,
      duration: 240,
      ease: "Cubic.Out",
      onComplete: () => flash.destroy(),
    });

    for (let i = 0; i < 9; i++) {
      const spark = this.add.rectangle(
        impactX,
        impactY,
        Phaser.Math.Between(3, 6),
        Phaser.Math.Between(7, 13),
        i % 2 === 0 ? 0xffe5a3 : color,
        1
      ).setDepth(26);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(22, 48);

      this.tweens.add({
        targets: spark,
        x: impactX + Math.cos(angle) * distance,
        y: impactY + Math.sin(angle) * distance,
        alpha: 0,
        angle: Phaser.Math.Between(-180, 180),
        duration: Phaser.Math.Between(180, 320),
        ease: "Cubic.Out",
        onComplete: () => spark.destroy(),
      });
    }
  }

  completeRound(currentRound) {
    if (
      this.battleOver ||
      !this.autoBattle ||
      this.roundId !== currentRound
    ) {
      return;
    }

    this.isFighting = false;

    this.hero.setPosition(590, 280).setAngle(0).setAlpha(1);
    this.enemy.setPosition(805, 280).setAngle(0).setAlpha(1);

    this.heroWeapon.setPosition(618, 276).setAngle(-20);
    this.enemyWeapon.setPosition(777, 276).setAngle(9);

    this.setStatus("Battle in progress...");

    this.time.delayedCall(350, () => {
      if (
        !this.battleOver &&
        this.autoBattle &&
        !this.isFighting &&
        this.enemyHP > 0 &&
        this.playerHP > 0
      ) {
        this.fight();
      }
    });
  }

  updateHealth() {
    this.heroBar.clear();
    this.enemyBar.clear();

    const heroRatio = Phaser.Math.Clamp(this.playerHP / 100, 0, 1);
    const enemyRatio = Phaser.Math.Clamp(this.enemyHP / 100, 0, 1);

    const heroColor = this.playerHP <= 30 ? 0xffb347 : 0x4ade80;
    const enemyColor = this.enemyHP <= 30 ? 0xff334f : 0xff657a;

    this.heroBar.fillStyle(heroColor, 1);
    this.heroBar.fillRoundedRect(
      515, 166, 170 * heroRatio, 10, 5
    );

    this.enemyBar.fillStyle(enemyColor, 1);
    this.enemyBar.fillRoundedRect(
      740, 166, 170 * enemyRatio, 10, 5
    );

    this.heroHPText.setText(`${this.playerHP} / 100`);
    this.enemyHPText.setText(`${this.enemyHP} / 100`);
  }

  setStatus(message) {
    this.statusText.setText(message);
  }

  finishBattle(heroWon) {
    this.battleOver = true;
    this.autoBattle = false;
    this.isFighting = false;
    ++this.roundId;

    this.tweens.killTweensOf(this.hero);
    this.tweens.killTweensOf(this.enemy);
    this.tweens.killTweensOf(this.heroWeapon);
    this.tweens.killTweensOf(this.enemyWeapon);

    this.hero.setAngle(0).setAlpha(1);
    this.enemy.setAngle(0).setAlpha(1);

    this.setButtonEnabled(this.fightButton, false);
    this.setButtonEnabled(this.clearButton, true);
    this.setButtonEnabled(this.restartButton, true);

    this.resultText
      .setText(heroWon ? "VICTORY!" : "DEFEAT!")
      .setColor(heroWon ? "#78ffad" : "#ff7187");

    this.setStatus(
      heroWon
        ? "You won! Press RESTART to play again."
        : "You lost! Press RESTART to try again."
    );

    this.cameras.main.flash(
      250,
      heroWon ? 40 : 255,
      heroWon ? 220 : 50,
      heroWon ? 140 : 70
    );
  }

  clearWeapon() {
    if (this.isFighting || this.autoBattle) return;

    if (this.battleOver) this.resetBattle();

    this.strokes = [];
    this.activeStroke = null;
    this.weaponReady = false;
    this.weaponType = "balanced";
    this.damage = 20;

    this.drawingGraphics.clear();
    this.drawingHint.setVisible(true);

    this.weaponLabel
      .setText("WEAPON: NONE")
      .setColor("#a8b9d8");

    this.damageLabel.setText("DAMAGE: --");

    this.heroWeapon.setVisible(false);
    this.heroWeapon.setPosition(this.hero.x + 28, this.hero.y - 4);
    this.heroWeapon.setAngle(0);

    this.setStatus("Drawing cleared. Draw a new weapon!");
  }

  resetBattle() {
    ++this.roundId;

    this.tweens.killTweensOf(this.hero);
    this.tweens.killTweensOf(this.enemy);
    this.tweens.killTweensOf(this.heroWeapon);
    this.tweens.killTweensOf(this.enemyWeapon);
    this.tweens.killTweensOf(this.resultText);

    this.playerHP = 100;
    this.enemyHP = 100;

    this.isFighting = false;
    this.autoBattle = false;
    this.battleOver = false;

    this.hero.setPosition(590, 280).setAngle(0).setAlpha(1);
    this.enemy.setPosition(805, 280).setAngle(0).setAlpha(1);

    this.heroWeapon
      .setPosition(618, 276)
      .setAngle(-20)
      .setVisible(this.weaponReady);

    this.enemyWeapon
      .setPosition(777, 276)
      .setAngle(9)
      .setVisible(true);

    this.resultText.setText("");

    this.updateHealth();

    // Restore idle animations
    this.tweens.add({
      targets: this.hero,
      y: 276,
      duration: 850,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.enemy,
      y: 276,
      duration: 1050,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
      delay: 150,
    });

    this.setButtonEnabled(this.fightButton, this.weaponReady);
    this.setButtonEnabled(this.clearButton, true);
    this.setButtonEnabled(this.restartButton, true);
  }

  restartGame() {
    // Restart can interrupt an ongoing battle.
    this.resetBattle();

    this.strokes = [];
    this.activeStroke = null;
    this.weaponReady = false;
    this.weaponType = "balanced";
    this.damage = 20;

    this.drawingGraphics.clear();
    this.drawingHint.setVisible(true);

    this.weaponLabel
      .setText("WEAPON: NONE")
      .setColor("#a8b9d8");

    this.damageLabel.setText("DAMAGE: --");

    this.heroWeapon.removeAll(true);
    this.drawWeaponGraphic(
      this.heroWeapon,
      "balanced",
      0xf6d365
    );

    this.heroWeapon.setVisible(false);

    this.setButtonEnabled(this.fightButton, false);
    this.setStatus("New battle! Draw your weapon.");
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: 960,
  height: 540,
  backgroundColor: "#101522",

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  input: {
    activePointers: 3,
  },

  scene: [DrawFightScene],
});
