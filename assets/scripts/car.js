cc.Class({
    extends: cc.Component,

    properties: {
        targetPos: {
            default: null,
            type: cc.Node
        },
        timer: {
            default: null,
            type: cc.Label
        },
        failLayer: {
            default: null,
            type: cc.Node
        },
        succeedLayer: {
            default: null,
            type: cc.Node
        },
        control: {
            default: null,
            type: cc.Node
        }
    },

    onLoad: function () {
        if (!cc.game.curOrdeal) {
            cc.game.curOrdeal = 1;
        } else {
            cc.game.curOrdeal++;
        }
        this.wheel = this.node.getChildByName('frontWheel');
        this.staticData = {
            speedMax: 45,
            acceleration: 1.8,
            friction: 1.2,
            initCarAngleDegree: 90 - this.node.rotation,
            initWheelAngleDegree: this.wheel.rotation,
            wheelPos: this.wheel.y,
            wheelDis: this.wheel.getChildByName('right').x,
            initX: this.node.x,
            initY: this.node.y,
            targetPoint: [
                [this.targetPos.x - this.targetPos.width / 2, this.targetPos.y - this.targetPos.height / 2],
                [this.targetPos.x + this.targetPos.width / 2, this.targetPos.y + this.targetPos.height / 2]
            ]
        };

        this.data = {
            speed: 0,
            speedX: 0,
            speedY: 0,
            speedStatus: 0,
            collided: false,
            collidedDirection: null,
            isPlaying: true,
            carAngleDegree: this.staticData.initCarAngleDegree,
            carAngle: this.staticData.initCarAngleDegree / 180 * Math.PI,
            wheelAngleDegree: this.staticData.initWheelAngleDegree,
            wheelAngle: this.staticData.initWheelAngleDegree / 180 * Math.PI,
            startTime: new Date(),
            directionFunc: {}
        };
        this.bindDirectionBtn();

        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;

        var self = this;

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,

            onKeyPressed: function (keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        self.data.directionFunc.left = true;
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self.data.directionFunc.right = true;
                        break;
                    case cc.KEY.w:
                    case cc.KEY.up:
                        self.data.directionFunc.up = true;
                        break;
                    case cc.KEY.s:
                    case cc.KEY.down:
                        self.data.directionFunc.down = true;
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

                    case cc.KEY.a:
                    case cc.KEY.left:
                        self.data.directionFunc.left = false;
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self.data.directionFunc.right = false;
                        break;
                    default:
                        break;
                }
            }
        }, self.node);
    },

    // 每一帧调用的方法
    update: function (dt) {
        // dt为该帧的时间
        // console.log(dt);
        if (this.data.isPlaying) {
            if (this.data.directionFunc.left) {
                this.turnLeft();
            }
            if (this.data.directionFunc.right) {
                this.turnRight();
            }
            if (this.data.directionFunc.up) {
                this.turnUp();
            }
            if (this.data.directionFunc.down) {
                this.turnDown();
            }
            var curTime = new Date();
            var useTime = curTime - this.data.startTime;

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
            this.timer.string = s + '.' + ms + 's';

            if (useTime > 60000) {
                this.fail();
                return;
            }
            // 分别为两个轮子设置角度
            this.wheel.getChildByName('left').rotation = this.data.wheelAngleDegree;
            this.wheel.getChildByName('right').rotation = this.data.wheelAngleDegree;
            if (!this.data.collided) {
                this.node.x += this.data.speedX * dt;
                this.node.y += this.data.speedY * dt;
                this.calcSpeed(dt);
            } else {
                this.stop();
            }
            this.node.rotation = 90 - this.data.carAngleDegree;

            this.judgeSuccess(useTime, this.timer.string);
        }
    },

    onCollisionEnter: function (other, self) {
        // console.warn('crash!');
        this.data.collided = true;
        this.fail()
    },

    onCollisionExit: function () {
        // console.log('exit crash');
        this.data.collided = false; // useless
    },

    bindDirectionBtn: function () {
        var self = this;
        this.node.parent.on(cc.Node.EventType.TOUCH_START, function (e) {
            self.clearShare();
            var up = self.control.getChildByName('Up').getNodeToWorldTransformAR(),
                down = self.control.getChildByName('Down').getNodeToWorldTransformAR(),
                left = self.control.getChildByName('Left').getNodeToWorldTransformAR(),
                right = self.control.getChildByName('Right').getNodeToWorldTransformAR();
            var pos = e.getTouches()[0].getLocation();
            var target;
            if (self.isPointInCircle(pos, up, 30)) {
                target = 'Up';
            }
            if (self.isPointInCircle(pos, down, 30)) {
                target = 'Down';
            }
            if (self.isPointInCircle(pos, left, 30)) {
                target = 'Left';
            }
            if (self.isPointInCircle(pos, right, 30)) {
                target = 'Right';
            }
            switch (target) {
                case 'Up':
                    self.data.directionFunc.up = true;
                    break;
                case 'Down':
                    self.data.directionFunc.down = true;
                    break;
                case 'Left':
                    self.data.directionFunc.left = true;
                    break;
                case 'Right':
                    self.data.directionFunc.right = true;
                    break;
            }
        }, this.node);
        this.node.parent.on(cc.Node.EventType.TOUCH_END, this.slide.bind(this), this.node);
        this.node.parent.on(cc.Node.EventType.TOUCH_CANCEL, this.slide.bind(this), this.node);
        // this.node.parent.on(cc.Node.EventType.MOUSE_DOWN, start, this.node);
        // this.node.parent.on(cc.Node.EventType.MOUSE_UP, this.slide.bind(this), this.node);
    },

    judgeSuccess: function (useTime, timeString) {
        var isInTargetPos = true;
        var deltaAngle = this.data.carAngle - Math.PI / 2;
        var carPolygon = this.node.getComponent(cc.PolygonCollider).points;
        for (var i = carPolygon.length - 1; i >= 0; i--) {
            var x = carPolygon[i].x * Math.cos(deltaAngle) - carPolygon[i].y * Math.sin(deltaAngle);
            var y = carPolygon[i].x * Math.sin(deltaAngle) + carPolygon[i].y * Math.cos(deltaAngle);
            if (!this.isPointInRectangle(x + this.node.x, y + this.node.y)) {
                isInTargetPos = false;
                break;
            }
        }
        if (isInTargetPos) {
            var succeedDialog = this.succeedLayer.getChildByName('succeedDialog');
            if (cc.game.curOrdeal === 1) {
                succeedDialog.getChildByName('succeedTime').getComponent(cc.Label).string = timeString;
                cc.game.firstTime = useTime;
                succeedDialog.getChildByName('succeedNext').getComponent(cc.Button).interactable = true;
                succeedDialog.getChildByName('succeedRetry').getComponent(cc.Button).interactable = true;
            } else {
                var totalTime = useTime + cc.game.firstTime;
                succeedDialog.getChildByName('succeedWord').getComponent(cc.Label).string = '恭喜你获得老司机资格证！\n总成绩：' + parseInt(totalTime / 1000) + '.' + totalTime % 1000 + 's';
                succeedDialog.getChildByName('succeedRank').getComponent(cc.Label).string = '排名：前30%';
                succeedDialog.getChildByName('succeedNotify').getComponent(cc.Button).interactable = true;
                succeedDialog.getChildByName('succeedRetry').getComponent(cc.Button).interactable = true;
            }
            this.succeedLayer.opacity = 255;
            this.data.isPlaying = false;
        }
    },

    calcSpeed: function (dt) {
        var forward = 0;
        if (this.data.speed !== 0) {
            forward = (this.data.speed > 0) ? 1 : -1;
        }
        var speedPre = this.data.speed;
        this.data.speed += this.data.speedStatus * this.staticData.acceleration - forward * this.staticData.friction;
        // console.log('current speed: ' + this.data.speed);
        if (this.data.speedStatus === 0 && this.data.speed * speedPre < 0) {
            this.stop();
        }
        if (Math.abs(this.data.speed) > this.staticData.speedMax) {
            this.data.speed = this.staticData.speedMax * forward;
        }
        if (this.data.wheelAngleDegree !== 0 && this.data.speed !== 0) {
            var frontLine = {
                first: {
                    first: this.node.x + Math.cos(this.data.carAngle) * this.staticData.wheelPos,
                    second: this.node.y + Math.sin(this.data.carAngle) * this.staticData.wheelPos
                },
                second: {
                    first: this.staticData.wheelDis * Math.cos(this.data.carAngle - this.data.wheelAngle),
                    second: -this.staticData.wheelDis * Math.sin(this.data.carAngle - this.data.wheelAngle)
                }
            }
            var rearLine = {
                first: {
                    first: this.node.x - Math.cos(this.data.carAngle) * this.staticData.wheelPos,
                    second: this.node.y - Math.sin(this.data.carAngle) * this.staticData.wheelPos
                },
                second: {
                    first: this.staticData.wheelDis * Math.cos(this.data.carAngle),
                    second: this.staticData.wheelDis * Math.sin(this.data.carAngle)
                }
            }
            // console.log('frontLine: ');
            // console.log(frontLine);
            // console.log('rearLine: ');
            // console.log(rearLine);
            var t = this.calcT(frontLine, rearLine);
            if (!isNaN(t[0]) && !isNaN(t[1]) && isFinite(t[0]) && isFinite(t[1])) {

                var point = [rearLine.first.first + t[0] * rearLine.second.first, rearLine.first.second + t[0] * rearLine.second.second];
                // console.log("circle's center: " + point[0] + ', ' + point[1] + ' ');

                var carNormal = {
                    x: point[0] - this.node.x,
                    y: point[1] - this.node.y
                };
                // console.log(carNormal.x + ' ' + carNormal.y + ' ');

                var radius = Math.sqrt(carNormal.x * carNormal.x + carNormal.y * carNormal.y);
                // console.log('radius: ' + Math.sqrt(carNormal.x * carNormal.x + carNormal.y * carNormal.y));

                // console.log('car speed: x: ' + this.data.speedX + ' y: ' + this.data.speedY);

                var turning = 0;
                if (this.data.wheelAngleDegree !== 0) {
                    turning = (this.data.wheelAngleDegree > 0) ? -1 : 1;
                }

                // angle reduce a half
                this.data.carAngle += (Math.atan(dt * this.data.speed / radius) * turning) / 4;
                this.data.carAngleDegree = (this.data.carAngle * 180 / Math.PI) % 360;
                // console.log('car angle: ' + this.data.carAngleDegree + '°');
            }
        }

        this.data.speedX = this.data.speed * Math.cos(this.data.carAngle);
        this.data.speedY = this.data.speed * Math.sin(this.data.carAngle);
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

    isPointInRectangle: function (x, y) {
        var bl = this.staticData.targetPoint[0];
        var tr = this.staticData.targetPoint[1];
        if (x >= bl[0] && x <= tr[0] && y >= bl[1] && y <= tr[1]) {
            return true;
        } else {
            return false;
        }
    },

    isPointInCircle: function (point, center, radius) {
        if (Math.pow(point.x - center.tx, 2) + Math.pow(point.y - center.ty, 2) < radius * radius) {
            return true;
        } else {
            return false;
        }
    },

    turnLeft: function () {
        if (this.data.wheelAngleDegree > -30) {
            if (this.data.wheelAngleDegree <= 5 && this.data.wheelAngleDegree > 0) this.data.wheelAngleDegree = 0;
            else this.data.wheelAngleDegree -= 0.4;
        } else {
            this.data.wheelAngleDegree = -30;
        }
        this.data.wheelAngle = Math.PI * this.data.wheelAngleDegree / 180;
    },

    turnRight: function () {
        if (this.data.wheelAngleDegree < 30) {
            if (this.data.wheelAngleDegree >= -5 && this.data.wheelAngleDegree < 0) this.data.wheelAngleDegree = 0;
            else this.data.wheelAngleDegree += 0.4;
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
        this.data.directionFunc = {};
        // console.log('slide');
    },

    stop: function () {
        this.data.speed = this.data.speedX = this.data.speedY = 0;
    },

    retry: function () {
        this.data = {
            speed: 0,
            speedX: 0,
            speedY: 0,
            speedStatus: 0,
            wheelAngleDegree: this.staticData.initWheelAngleDegree,
            wheelAngle: this.staticData.initWheelAngleDegree / 180 * Math.PI,
            carAngleDegree: this.staticData.initCarAngleDegree,
            carAngle: this.staticData.initCarAngleDegree / 180 * Math.PI,
            collided: false,
            collidedDirection: null,
            isPlaying: true,
            startTime: new Date(),
            directionFunc: {}
        };
        this.succeedLayer.opacity = 0;
        this.failLayer.opacity = 0;
        this.node.x = this.staticData.initX;
        this.node.y = this.staticData.initY;
        this.failLayer.getChildByName('failDialog').getChildByName('failRetry').getComponent(cc.Button).interactable = false;
        var succeedDialog = this.succeedLayer.getChildByName('succeedDialog');
        if (cc.game.curOrdeal === 1) {
            // succeedDialog.getChildByName('succeedNext').getComponent(cc.Button).interactable = false;
        } else {
            succeedDialog.getChildByName('succeedRetry').getComponent(cc.Button).interactable = false;
            succeedDialog.getChildByName('succeedNotify').getComponent(cc.Button).interactable = false;
        }
    },

    next: function () {
        if (cc.game.curOrdeal === 1) {
            cc.director.loadScene('second');
        }
    },

    fail: function () {
        this.data.isPlaying = false;
        this.failLayer.opacity = 255;
        this.failLayer.getChildByName('failDialog').getChildByName('failRetry').getComponent(cc.Button).interactable = true;
    },

    share: function () {
        this.succeedLayer.getChildByName('Share').opacity = 255;
    },

    clearShare: function () {
        var share = this.succeedLayer.getChildByName('Share');
        if (share && share.opacity === 255) {
            share.opacity = 0;
        }
    }
});