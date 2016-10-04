cc.Class({
  extends: cc.Component,

  properties: {
    bgm: {
      default: null,
      type: cc.VideoPlayer
    }
  },

  // use this for initialization
  onLoad: function () {
    this.bgm.stop();
  },

  playerCallback: function (e) {
    if (!this.bgm.isPlaying()) {
      this.bgm.play();
      // console.log(e);
    }
  }
});