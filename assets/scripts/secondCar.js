cc.Class({
    extends: cc.Component,

    properties: {
        car: {
            default: null,
            type: cc.Node
        },
        wheelPos: {
            default: 0,
            type: cc.Integer
        },
        wheelDis: {
            default: 0,
            type: cc.Integer
        },
        targetPos: {
            default: null,
            type: cc.Node
        },
        timer: {
            default: null,
            type: cc.Label
        },
        failCover: {
            default: null,
            type: cc.Node
        },
        succeedCover: {
            default: null,
            type: cc.Node
        },
        succeedTime: {
            default: null,
            type: cc.Label
        }
    },

    onLoad: function () {
        this.data = {
            speed: 0,
            speedX: 0,
            speedY: 0,
            speedMax: 30,
            speedStatus: 0,
            wheelAngleDegree: 0,
            wheelAngle: 0,
            carAngleDegree: 90,
            carAngle: Math.PI / 2,
            collided: false,
            collidedDirection: null,
            acceleration: 1.8,
            friction: 0.8,
            isPlaying: true
        };

        this.wheel = this.car.children[0];
        this.startTime = new Date();
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;

        this.targetPoint = [[this.targetPos.x - this.targetPos.width / 2, this.targetPos.y - this.targetPos.height / 2], [this.targetPos.x + this.targetPos.width / 2, this.targetPos.y + this.targetPos.height / 2]];
        this.carPolygon = this.car.getComponent(cc.PolygonCollider).points;
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
        if (this.data.isPlaying) {
            var curTime = new Date();
            var useTime = curTime - this.startTime;
            var s = parseInt(useTime / 1000);
            var ms = useTime % 1000;
            if (s < 10) {
                s = '0' + s;
            }
            if (ms < 10) {
                ms = '00' + ms;
            } else if (ms < 100) {
                ms = '0' + ms;
            }

            this.timer.string = '0:' + s + ':' + ms;
            this.wheel.rotation = this.data.wheelAngleDegree;
            this.car.rotation = 90 - this.data.carAngleDegree;
            if (!this.data.collided) {
                this.car.x += this.data.speedX * dt;
                this.car.y += this.data.speedY * dt;
                this.calcSpeed(dt);
            } else {
                this.stop();
            }
            this.judgeSuccess(useTime);
        }
    },

    secondOrderDeter: function (a, b, c, d) {
        return a * d - b * c;
    },

    calcT: function (line1, line2) {
        var x1 = line1.first.first;
        var y1 = line1.first.second;
        var dx1 = line1.second.first;
        var dy1 = line1.second.second;
        var x2 = line2.first.first;
        var y2 = line2.first.second;
        var dx2 = line2.second.first;
        var dy2 = line2.second.second;
        var t1 = (this.secondOrderDeter(x2, y2, dx2, dy2) - this.secondOrderDeter(x1, y1, dx2, dy2)) / this.secondOrderDeter(dx1, dy1, dx2, dy2);
        var t2 = (this.secondOrderDeter(x1, y1, dx1, dy1) - this.secondOrderDeter(x2, y2, dx1, dy1)) / this.secondOrderDeter(dx2, dy2, dx1, dy1);
        return [t1, t2];
    },

    turnLeft: function () {
        if (this.data.wheelAngleDegree > -30) {
            this.data.wheelAngleDegree -= 1;
        }
        else {
            this.data.wheelAngleDegree = -30;
        }
        this.data.wheelAngle = Math.PI * this.data.wheelAngleDegree / 180;
    },

    turnRight: function () {
        if (this.data.wheelAngleDegree < 30) {
            this.data.wheelAngleDegree += 1;
        } else {
            this.data.wheelAngleDegree = 30;

        }
        this.data.wheelAngle = Math.PI * this.data.wheelAngleDegree / 180;
    },

    turnUp: function () {
        if (this.data.collidedDirection === 'front') {
            this.data.speedStatus = 0;
        } else {
            if (this.data.collided && !this.data.collidedDirection) {
                this.data.collidedDirection = 'front';
                this.data.speedStatus = 0;
            } else {
                this.data.speedStatus = 1;
                this.data.collided = false;
                this.data.collidedDirection = null;
            }
        }
    },

    turnDown: function () {
        if (this.data.collidedDirection === 'back') {
            this.data.speedStatus = 0;
        } else {
            if (this.data.collided && !this.data.collidedDirection) {
                this.data.collidedDirection = 'back';
                this.data.speedStatus = 0;
            } else {
                this.data.speedStatus = -1;
                this.data.collided = false;
                this.data.collidedDirection = null;
            }
        }
    },

    slide: function () {
        this.data.speedStatus = 0;
    },

    stop: function () {
        this.data.speed = this.data.speedX = this.data.speedY = 0;
    },

    isPointInRectangle: function (x, y) {
        var bl = this.targetPoint[0];
        var tr = this.targetPoint[1];
        if (x >= bl[0] && x <= tr[0] && y >= bl[1] && y <= tr[1]) {
            return true;
        }
        else {
            return false;
        }
    },

    judgeSuccess: function (useTime) {
        var isInTargetPos = true;
        var deltaAngle = this.data.carAngle - Math.PI / 2;
        for (var i = 0; i < this.carPolygon.length; i++) {
            var x = this.carPolygon[i].x * Math.cos(deltaAngle) - this.carPolygon[i].y * Math.sin(deltaAngle);
            var y = this.carPolygon[i].x * Math.sin(deltaAngle) + this.carPolygon[i].y * Math.cos(deltaAngle);
            if (!this.isPointInRectangle(x + this.car.x, y + this.car.y)) {
                isInTargetPos = false;
                break;
            }
        }
        if (isInTargetPos) {
            var time = this.timer.string.split(':');
            this.succeedTime.string = time[1] + '.' + time[2];
            this.succeedTime.string += '\n' + (useTime + cc.game.first) + 'ms';
            this.succeedCover.opacity = 255;
            this.data.isPlaying = false;
        }
    },

    calcSpeed: function (dt) {
        var forward = 0;
        if (this.data.speed !== 0) {
            forward = (this.data.speed > 0) ? 1 : -1;
        }
        var speedPre = this.data.speed;
        this.data.speed += this.data.speedStatus * this.data.acceleration - forward * this.data.friction;
        // console.log('current speed: ' + this.data.speed);
        if (this.data.speedStatus === 0 && this.data.speed * speedPre < 0) {
            this.stop();
        }
        if (Math.abs(this.data.speed) > 30) {
            this.data.speed = 30 * forward;
        }
        if (this.data.wheelAngleDegree !== 0 && this.data.speed !== 0) {
            var frontLine = {
                first: { first: this.car.x + Math.cos(this.data.carAngle) * this.wheelPos, second: this.car.y + Math.sin(this.data.carAngle) * this.wheelPos },
                second: { first: this.wheelDis * Math.cos(this.data.carAngle - this.data.wheelAngle), second: -this.wheelDis * Math.sin(this.data.carAngle - this.data.wheelAngle) }
            }
            var rearLine = {
                first: { first: this.car.x - Math.cos(this.data.carAngle) * this.wheelPos, second: this.car.y - Math.sin(this.data.carAngle) * this.wheelPos },
                second: { first: this.wheelDis * Math.cos(this.data.carAngle), second: this.wheelDis * Math.sin(this.data.carAngle) }
            }
            // console.log('frontLine: ');
            // console.log(frontLine);
            // console.log('rearLine: ');
            // console.log(rearLine);
            var t = this.calcT(frontLine, rearLine);
            if (!isNaN(t[0]) && !isNaN(t[1]) && isFinite(t[0]) && isFinite(t[1])) {

                var point = [rearLine.first.first + t[0] * rearLine.second.first, rearLine.first.second + t[0] * rearLine.second.second];
                // console.log("circle's center: " + point[0] + ', ' + point[1] + ' ');

                var carNormal = { x: point[0] - this.car.x, y: point[1] - this.car.y };
                // console.log(carNormal.x + ' ' + carNormal.y + ' ');

                var radius = Math.sqrt(carNormal.x * carNormal.x + carNormal.y * carNormal.y);
                // console.log('radius: ' + Math.sqrt(carNormal.x * carNormal.x + carNormal.y * carNormal.y));

                // console.log('car speed: x: ' + this.data.speedX + ' y: ' + this.data.speedY);

                var turning = 0;
                if (this.data.wheelAngleDegree !== 0) {
                    turning = (this.data.wheelAngleDegree > 0) ? -1 : 1;
                }

                // angle reduce a half
                this.data.carAngle += (Math.atan(dt * this.data.speed / radius) * turning) / 2;
                this.data.carAngleDegree = (this.data.carAngle * 180 / Math.PI) % 360;
                // console.log('car angle: ' + this.data.carAngleDegree + '°');
            }
        }

        this.data.speedX = this.data.speed * Math.cos(this.data.carAngle);
        this.data.speedY = this.data.speed * Math.sin(this.data.carAngle);
    },

    retry: function () {
        this.data = {
            speed: 0,
            speedX: 0,
            speedY: 0,
            speedMax: 30,
            speedStatus: 0,
            wheelAngleDegree: 0,
            wheelAngle: 0,
            carAngleDegree: 90,
            carAngle: Math.PI / 2,
            collided: false,
            collidedDirection: null,
            acceleration: 1.8,
            friction: 0.8,
            isPlaying: true
        };
        this.startTime = new Date();
        this.failCover.opacity = 0;
        this.car.x = -27;
        this.car.y = -149;
    },

    onCollisionEnter: function (other, self) {
        console.warn('crash!');
        this.data.collided = true;
        this.data.isPlaying = false;
        this.failCover.opacity = 255;
    },

    onCollisionExit: function () {
        // console.log('exit crash');
        this.data.collided = false; // useless
    },
});
