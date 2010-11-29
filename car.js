// Car

define(["game", "sprite"], function (game, Sprite) {

  var keyStatus = game.controls.keyStatus;
  var context  = game.spriteContext;

  var Car = function (name, points, image, tileWidth, tileHeight) {
    var rad, rot;

    this.init(name, points, image, tileWidth, tileHeight);

    this.speed = 0.0;

    this.collided = false;

    this.breaking = false;
    this.driver = null;

    this.acceleration    = 150;
    this.deceleration    = 300;  // breaks!
    this.topSpeed        = 440;  // tops out at 100mph
    this.topReverseSpeed = -132; // reverse at 30mph
    this.topRotation     = 120;

    this.collidesWith = ['car'];

    this.draw = function () {
      if (!this.visible) return;

      if (this.collided) {
        this.collided = false;
        context.fillRect(this.points[0],
                         this.points[1],
                         this.tileWidth,
                         this.tileHeight);
      }

      this.drawTile(0);
      this.drawTile(1);
      if (this.breaking) {
        this.drawTile(4);
        this.drawTile(5);
      }
   };

    // override move
    this.move = function (delta) {
      if (!this.visible) return;

      this.vel.rot = 0;

      if (this.driver) {
        if (keyStatus.left || keyStatus.right) {
          rot = this.speed;
          if (rot > this.topRotation) rot = this.topRotation;
          this.vel.rot = rot * delta * (keyStatus.left ? -1 : 1);
        }
        this.rot += this.vel.rot;

        if (keyStatus.up) {
          this.speed += delta * this.acceleration;
          this.breaking = false;
        } else if (keyStatus.down) {
          if (this.speed > 1.0) { // breaking
            this.breaking = true;
            this.speed -= delta * this.deceleration;
            if (this.speed < 1.0) this.speed = 0.0;
          } else if (this.speed <= 1.0 && !this.breaking) {
            this.speed -= delta * this.acceleration;
          } else {
            this.speed = 0.0;
          }
        } else {
          // friction!
          this.speed += delta * 10 * (this.speed > 0) ? -1 : 1;
          this.breaking = false;
        }
      } else {
        // friction!
        if (this.speed != 0.0) {
          this.speed += delta * 10 * (this.speed > 0) ? -1 : 1;
        }
        // TODO clean this up
      }

      if (this.speed > this.topSpeed) this.speed = this.topSpeed;
      if (this.speed < this.topReverseSpeed) this.speed = this.topReverseSpeed;

      rad = ((this.rot-90) * Math.PI)/180;

      this.vel.x = this.speed * Math.cos(rad) * delta;
      this.vel.y = this.speed * Math.sin(rad) * delta;

      this.x += this.vel.x;
      this.y += this.vel.y;

      if (this.driver) {
        game.map.keepInView(this);
      }
    };

    this.collision = function (other) {
      this.collided = true;
    };

  };
  Car.prototype = new Sprite();

  return Car;
});
