cc.Class({
    extends: cc.Component,

    properties: {
        car: {
            default: null,
            type: cc.Node
        },
        wheel: {
            default: null,
            type: cc.Node
        },
        data: {
            default: {}
        }
    },

    onLoad: function () {
        this.data = {
            speed: 0,
            speedX: 0,
            speedY: 0,
            speedMax: 30,
            status: 0,
            wheelAngleDegree: 0,
            wheelAngle: 0,
            carAngle: 0,
            collided: false,
            acceleration: 2,
            tangentFriction: 0.1,
            normalFriction: 0.2
        };

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
            },
            onKeyReleased: function (keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.w:
                    case cc.KEY.up:
                        self.slide();
                        break;
                    case cc.KEY.s:
                    case cc.KEY.down:
                        self.slide();
                        break;
                }
            }
        }, self.node);
    },

    // called every frame
    update: function (dt) {
        // time per frame
        // console.log(dt);

        if (!this.data.collided) {
            this.data.x += this.data.speedX * dt;
            this.data.y += this.data.speedY * dt;
            this.calcSpeed();
        } else {
            this.data.speed = 0;
        }
        this.data.wheelAngle = Math.PI * this.data.wheelAngleDegree / 180;
        this.wheel.rotation = this.data.wheelAngleDegree;
        this.car.rotation = this.data.carAngle * 180 / Math.PI;
    },

    turnLeft: function () {
        if (this.data.wheelAngleDegree > -30) {
            this.data.wheelAngleDegree -= 2;
        }
    },

    turnRight: function () {
        if (this.data.wheelAngleDegree < 30) {
            this.data.wheelAngleDegree += 2;
        }
    },

    turnUp: function () {
        this.data.status = 1;
    },

    turnDown: function () {
        this.data.status = -1;
    },

    slide: function () {
        this.data.status = 0;
    },

    calcSpeed: function () {
        var forward = (this.data.dataAngle > -Math.PI / 2 && this.data.dataAngle < Math.PI / 2) ? 1 : -1;
        var tangentDelta = this.data.status * this.data.acceleration * Math.cos(this.data.wheelAngle);
        var normalDelta = this.data.acceleration * Math.sin(this.data.wheelAngle);

        // friction effect
        if (normalDelta * (normalDelta -= this.data.normalFriction) < 0) {
            normalDelta = 0;
        }

        // tangent special
        tangentDelta -= forward * this.data.tangentFriction;
        var x = this.data.speedX;
        var y = this.data.speedY;
        this.data.speedX += tangentDelta * Math.sin(this.data.dataAngle);
        this.data.speedY += tangentDelta * Math.cos(this.data.dataAngle);
        if (x * this.data.speedX < 0 || y * this.data.speedY < 0) {
            this.data.speedX = this.data.speedY = 0;
        }

        this.data.speedX += normalDelta * Math.cos(this.data.dataAngle);
        this.data.speedY += -normalDelta * Math.sin(this.data.dataAngle);

        this.data.dataAngle = Math.atan(this.data.speedX / this.data.speedY) || this.data.dataAngle;
        this.data.speed = Math.sqrt(this.data.speedX * this.data.speedX + this.data.speedY * this.data.speedY);
        if (this.data.speed > this.data.speedMax) {
            this.data.speed = this.data.speedMax;
            this.data.speedX = this.data.speed * Math.sin(this.data.dataAngle);
            this.data.speedY = this.data.speed * Math.cos(this.data.dataAngle);
        }
    },

    onCollisionEnter: function (other, self) {
        console.warn('crash!');
        this.data.collided = true;
    },

    onCollisionExit: function () {
        this.data.collided = false;
    },
});
