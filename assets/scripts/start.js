cc.Class({
    extends: cc.Component,

    properties: {
        tips: {
            default: null,
            type: cc.Node
        },
        beginBtn: {
            default: null,
            type: cc.Node
        },
        tipsBtn: {
            default: null,
            type: cc.Node
        }
    },

    toggleTips: function () {
        this.tips.opacity = 255;
        this.tipsBtn.removeFromParent();
        this.beginBtn.getComponent(cc.Button).interactable = true;
        this.beginBtn.opacity = 255;
    },

    jumpToMain: function () {
        cc.director.loadScene('first');
    }
});
//恭喜你！1234567890总成绩：.s排名前%了一快带朋友们开车吧你离还差一步本关成绩获得老司机资格证！加油哦~不远了