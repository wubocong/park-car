cc.Class({
    extends: cc.Component,

    properties: {
        object: {
            default: null,
            type: cc.Node
        },
        speed: {
            default: {}
        },
        speedDecay: {
            default: 0
        },
        maxSpeed: {
            default: 0
        },
        collided: {
            default: false
        }
    },

    onLoad: function () {
        this.speed.x = this.speed.y = 0; // set default speed to zero
        this.speedDecay = 0.1;
        this.maxSpeed = 30;
        this.collided = false;
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;

        var self = this;

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,

            onKeyPressed: function (keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        self.turnLeft();
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self.turnRight();
                        break;
                    case cc.KEY.w:
                    case cc.KEY.up:
                        self.turnUp();
                        break;
                    case cc.KEY.s:
                    case cc.KEY.down:
                        self.turnDown();
                        break;
                }
            }
        }, self.node);
    },

    // called every frame
    update: function (dt) {
        // time per frame
        // console.log(dt);
        if (!this.collided) {
            this.object.x += this.speed.x * dt;
            this.object.y += this.speed.y * dt;
            this.limitateSpeed();
        } else {
            this.speed.x = this.speed.y = 0;
        }
    },

    turnLeft: function () {
        this.speed.x -= 6;
    },

    turnRight: function () {
        this.speed.x += 6;
    },

    turnUp: function () {
        this.speed.y += 6;
    },

    turnDown: function () {
        this.speed.y -= 6;
    },

    limitateSpeed: function () {
        var speed = Math.sqrt(Math.pow(this.speed.x, 2) + Math.pow(this.speed.y, 2));
        if (speed > this.maxSpeed) {
            this.speed.x *= this.maxSpeed / speed;
            this.speed.y *= this.maxSpeed / speed;
        }
        else {
            var xSpeedDecay = this.speedDecay * this.speed.x / speed;
            var ySpeedDecay = this.speedDecay * this.speed.y / speed;
            if (this.speed.x * (this.speed.x - xSpeedDecay) > 0) {
                this.speed.x -= xSpeedDecay;
            } else {
                this.speed.x = 0;
            }
            if (this.speed.y * (this.speed.y - ySpeedDecay) > 0) {
                this.speed.y -= ySpeedDecay;
            } else {
                this.speed.y = 0;
            }
        }
    },

    onCollisionEnter: function (other, self) {
        this.collided = true;
    },

    onCollisionExit: function () {
        this.collided = false;
    },
});
