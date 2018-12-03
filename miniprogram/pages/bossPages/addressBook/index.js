// miniprogram/pages/bossPages/addressBook/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:'',
    addressList:null,
    locationType:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.page === 'order') {
      this.setData({
        page:options.page
      })
    }
    if (options.locationType) {
      this.setData({
        locationType: options.locationType
      })
    }
  },
  fillBack(e){
    let data = {
      name: e.currentTarget.dataset.info.addressName,
      address: e.currentTarget.dataset.info.address,
      latitude: e.currentTarget.dataset.info.latitude,
      longitude: e.currentTarget.dataset.info.longitude,
      detail: e.currentTarget.dataset.info.addressDetail,
      addresseeName: e.currentTarget.dataset.info.addresseeName,
      sex: e.currentTarget.dataset.info.addresseeSex,
      phoneNum: e.currentTarget.dataset.info.addresseePhoneNum
    }
    let key = this.data.locationType === 'from' ? 'startPosition' :'endPosition'
    // if (this.data.locationType === 'from'){
      wx.setStorage({
        key: key,
        data: data,
        success:(res)=>{
          if(this.data.page === 'order'){
            wx.navigateTo({
              url: "/pages/bossPages/order/index"
            })
          } else {
            wx.navigateTo({
              url: "/pages/bossPages/map/index?positionType=" + this.data.locationType,
            })
          }
          
        }
      })
    // }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showLoading({
      title: '加载中……',
      mask:true
    })
    const db = wx.cloud.database()
    db.collection('addressBook').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        this.setData({
          addressList:res.data
        })
        wx.hideLoading()
        console.log(this.data.addressList)
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})