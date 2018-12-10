//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: '/images/user-unlogin.png',
    userInfo: {},
  },

  onLoad: function() {
    // console.log(app.globalData.openid)
  },

  onGetBossUserInfo: function(e) {
    const identity = 'boss'
    if (e.detail.userInfo) {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      app.globalData.userInfo = this.data.userInfo
      app.globalData.avatarUrl = this.data.userInfo.avatarUrl
      app.globalData.logged = this.data.logged
      this.onGetOpenid(identity)
    }
  },
  onGetRunUserInfo: function (e) {
    const identity = 'run'
    if (e.detail.userInfo) {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      app.globalData.userInfo = this.data.userInfo
      app.globalData.avatarUrl = this.data.userInfo.avatarUrl
      app.globalData.logged = this.data.logged
      this.onGetOpenid(identity)
    }
  },
  onGetOpenid: function (identity) {
    wx.showLoading({
      title: '同步用户信息…',
    })
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        app.globalData.openid = res.result.openid
        const db = wx.cloud.database()
        // 查询当前用户所有的 counters
        db.collection('userInfo').where({
          _openid: res.result.openid
        }).get({
          success: res => {
            wx.hideLoading()
            if(res.data.length===0){
              // 用户表里没有此用户 ===》未注册
              wx.navigateTo({
                url: '/pages/bindPhone/index?identity=' + identity,
              })
            } else {
              //  已注册
              db.collection('userInfo').doc(res.data[0]._id).update({
                data:{
                  isLogin:true,
                  identity: identity
                },
                success:(res)=>{
                  if (identity === 'run') {
                    wx.switchTab({
                      url: '/pages/runPages/list/index',
                    })
                  } else if (identity === 'boss') {
                    wx.reLaunch({
                      url: '/pages/bossPages/map/index',
                    })
                  }
                },fail:(res)=>{
                  wx.showToast({
                    title: '登录失败，请重试',
                    complete:()=>{
                      wx.reLaunch({
                        url: '/pages/index/index',
                      })
                    }
                  })
                }
              })
              // if(res.data[0].isLogin){
              //   console.log(identity)
              //   if (identity === 'run') {
              //     wx.switchTab({
              //       url: '/pages/runPages/list/index',
              //     })
              //   } else if (identity === 'boss') {
              //     wx.reLaunch({
              //       url: '/pages/bossPages/map/index',
              //     })
              //   }
              // } else {
              //   wx.navigateTo({
              //     url: '/pages/bindPhone/index',
              //   })
              // }
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
  // doUpload: function() {
  //   // 选择图片
  //   wx.chooseImage({
  //     count: 1,
  //     sizeType: ['compressed'],
  //     sourceType: ['album', 'camera'],
  //     success: function(res) {

  //       wx.showLoading({
  //         title: '上传中……',
  //       })

  //       const filePath = res.tempFilePaths[0]

  //       // 上传图片
  //       const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
  //       wx.cloud.uploadFile({
  //         cloudPath,
  //         filePath,
  //         success: res => {
  //           console.log('[上传文件] 成功：', res)

  //           app.globalData.fileID = res.fileID
  //           app.globalData.cloudPath = cloudPath
  //           app.globalData.imagePath = filePath

  //         },
  //         fail: e => {
  //           console.error('[上传文件] 失败：', e)
  //           wx.showToast({
  //             icon: 'none',
  //             title: '上传失败',
  //           })
  //         },
  //         complete: () => {
  //           wx.hideLoading()
  //         }
  //       })

  //     },
  //     fail: e => {
  //       console.error(e)
  //     }
  //   })
  // },

})