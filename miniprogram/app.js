//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env:'text-58c2a3',
      })
    }

    this.globalData = {
      openid:'o7k1V43zYHPTMWF3Y2Kq0Tpe6HhY'
    }
  }
})
