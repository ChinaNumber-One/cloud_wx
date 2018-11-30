// miniprogram/pages/bossPages/sendThingsType/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: ["餐饮", "文件", "生鲜", "蛋糕", "鲜花", "钥匙", "数码", "服饰", "其他"],
    weightNum:'小于5',
    choice:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },
  sliderChange(e) {
    if(e.detail.value > 5) {
      this.setData({
        weightNum: e.detail.value
      })
    } else {
      this.setData({
        weightNum: '小于5'
      })
    }
  },
  choiceType(e) {
    this.setData({
      choice: e.currentTarget.dataset.type
    })
  },
  submit(){
    if(this.data.choice !==''){
      wx.setStorage({
        key: 'thingsType',
        data: {
          type:this.data.choice,
          weight:this.data.weightNum
        },
        success:(res)=>{
          wx.navigateTo({
            url: "/pages/bossPages/order/index",
          })
        }
      })
    } else {
      wx.showToast({
        title: '请选择物品种类！',
        icon: 'none',
        duration: 1500,
      })
    }
  }
})