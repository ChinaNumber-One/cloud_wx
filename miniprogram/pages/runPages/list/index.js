// miniprogram/pages/runPages/list/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList:null,
    index:0,
    distance:[],
    latitude:null,
    longitude:null,
    _id:null
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
    this.getLocation()
    
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
  changeIndex(e){
    if (Number(e.currentTarget.dataset.index) === 0){
      this.getLocation()
    }
    this.setData({
      index: Number(e.currentTarget.dataset.index)
    })
  },
  getOrderList(){
    const db = wx.cloud.database()
    db.collection('order').where({
      state: 0
    }).get({
      success: res => {
        console.log(res)
        if(res.data.length!==0){
          this.setData({
            orderList: res.data.reverse().filter(item => {
              if (item.state === 0) {
                return true
              }
            })
          })
          wx.hideLoading()
          for(let i = 0;i<res.data.length;i++){
            console.log(i)
            this.getDistance(res.data[i].boss.startPosition.latitude, res.data[i].boss.startPosition.longitude)
          }
        }
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  getLocation() {
    wx.showLoading({
      title:'正在加载数据…'
    })
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: this.handleGetLocationSucc.bind(this)
    })
  },
  handleGetLocationSucc(res) {
    console.log(res)
    this.setData({
      latitude: res.latitude,
      longitude: res.longitude
    })
    this.getOrderList()
  },
  getDistance(lat,lon){
    console.log(lat,lon)
    wx.request({
      url: 'https://apis.map.qq.com/ws/distance/v1/?mode=driving&from=' + this.data.latitude + ',' + this.data.longitude + '&to=' + lat + ',' + lon + '&key=M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2',
      success: this.getdrivingDistanceSuccess.bind(this)
    })
  },
  getdrivingDistanceSuccess(res){
    this.data.distance.push(res.data.result.elements[0].distance)
    this.setData({
      distance:this.data.distance
    })
  },
  orderReceiving(e){
    console.log(e.currentTarget.dataset.id)
    const db = wx.cloud.database()
    db.collection('order').doc(e.currentTarget.dataset.id).update({
      data: {
        state: 1
      },
      success: res => {
        wx.showToast({
          title: '抢单成功',
        })
        this.setData({
          _id: e.currentTarget.dataset.id,
          index:1
        })
        
      },
      fail: err => {
        wx.showToast({
          title: '抢单失败',
        })
        icon: 'none',
          console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  }
})