//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: '/images/user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
  },

  onLoad: function() {
    
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
    app.globalData.userInfo = this.data.userInfo
    app.globalData.avatarUrl = this.data.userInfo.avatarUrl
    app.globalData.logged = this.data.logged
  },

  onGetOpenid: function(e) {
    wx.showLoading({
      title: '同步用户信息…',
    })
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        db.collection('userInfo').where({
          _openid: res.result.openid
        }).get({
          success: res => {
            wx.hideLoading()
            // wx.navigateTo({
            //   url: '/pages/bindPhone/index',
            // })
            if(res.data.length===0){
              wx.navigateTo({
                url: '/pages/bindPhone/index',
              })
            } else {
              if(res.data[0].isLogin){
                if (e.currentTarget.dataset.identity === 'run') {
                  wx.navigateTo({
                    url: '/pages/runPages/list/index',
                  })
                } else if (e.currentTarget.dataset.identity === 'boss') {
                  wx.navigateTo({
                    url: '/pages/bossPages/map/index',
                  })
                }
              } else {
                wx.navigateTo({
                  url: '/pages/bindPhone/index',
                })
              }
            }
          }
        })
        
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中……',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})