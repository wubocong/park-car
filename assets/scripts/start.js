cc.Class({
    extends: cc.Component,

    properties: {
        beginButton: {
            default: null,
            type: cc.Button
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    jumpToMain: function () {
        cc.director.loadScene('first');
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
