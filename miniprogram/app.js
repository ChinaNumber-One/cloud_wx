//app.js
App({
  onLaunch: function (options) {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env:'ittalkshow-58c2a3',
      })
    }

    this.globalData = {
      openid:'o7k1V43zYHPTMWF3Y2Kq0Tpe6HhY'
    }
  },
  onHide() {
    // 登录状态改为false
    if(this.globalData.openid){
      console.log(this.globalData.openid,'-----hide')
      const db = wx.cloud.database()
      this.timer = setTimeout(()=>{
        db.collection('userInfo').where({
          _openid: this.globalData.openid
        }).get({
          success: res => {
            db.collection('userInfo').doc(res.data[0]._id).update({
              data: {
                isLogin: false
              }
            })
          },
          fail: err => {
            console.error('[数据库] [查询记录] 失败：', err)
          }
        })
      },1000)
    }
  },
  onShow(){
    // 登录状态 改为 true
    clearTimeout(this.timer)
    if (this.globalData.openid) {
      console.log(this.globalData.openid , '-----show')
      const db = wx.cloud.database()
      db.collection('userInfo').where({
        _openid: this.globalData.openid
      }).get({
        success: res => {
          db.collection('userInfo').doc(res.data[0]._id).update({
            data: {
              isLogin: true
            }
          })
        },
        fail: err => {
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
    }
  }
})
