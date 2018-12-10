// miniprogram/pages/runPages/list/index.js
const app = getApp()
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
    runPhone:null,
    claimGood:null,
    timer:null,
    markers: [{}, {}],
    polyline: [],
    timer:null,
    to:''
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
    this.mapCtx = wx.createMapContext('map', this)
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
    // clearInterval(this.timer)
    // this.timer = setInterval(() => {
      this.getOrderList()
    // }, 10000)
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
  getLocation() {
    wx.showLoading({
      title: '正在定位…',
      mask:true,
    })
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: this.handleGetLocationSucc.bind(this)
    })
  },
  handleGetLocationSucc(res) {
    this.setData({
      latitude: res.latitude,
      longitude: res.longitude
    })
    
    this.getAddressText()

    // this.timer = setInterval(()=>{
      this.getOrderList()
    // },10000)


  },
  getOrderList(){
    this.setData({
      to: ''
    })
    console.log('获取list')
    wx.showLoading({
      title: '获取数据中…',
      mask: true,
    })
    const db = wx.cloud.database()
    db.collection('order').where({
      state:0
    }).get({
      success: res => {
        console.log(res)
        wx.stopPullDownRefresh()
        wx.hideLoading()
        if(res.data.length!==0){
          this.setData({
            orderList: res.data.reverse().filter((item)=>{
              if (item.bossOpenid !== app.globalData.openid){
                return true
              }
            })
          })
          for(let i = 0;i<res.data.length;i++){
            if(i<res.data.length-1){
              this.data.to += res.data[i].startPosition.latitude + ',' + res.data[i].startPosition.longitude + ';'
            } else {
              this.data.to += res.data[i].startPosition.latitude + ',' + res.data[i].startPosition.longitude
            }
            this.setData({
              to:this.data.to
            })
          }
          this.getDistance()
        } else {
          this.setData({
            orderList: []
          })
        }
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
  
  getDistance(){
    wx.request({
      url: 'https://apis.map.qq.com/ws/distance/v1/?mode=driving&from=' + this.data.latitude + ',' + this.data.longitude + '&to=' + this.data.to + '&key=M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2',
      success: this.getdrivingDistanceSuccess.bind(this)
    })
  },
  getdrivingDistanceSuccess(res){
    const distanceArr = res.data.result.elements;
    this.setData({
      distance: distanceArr
    })
  },
  orderReceiving(e){
    console.log(e.currentTarget.dataset.id)
    wx.cloud.callFunction({
      name: 'recevingOrder',
      data: {
        _id: e.currentTarget.dataset.id,
        runOpenid: app.globalData.openid,
        runPhoneNum: this.data.runPhone,
        runLongitude: this.data.longitude,
        runLatitude: this.data.latitude,
      }, success: function (res) {
        if (res.result.errMsg === "document.update:ok"){
          wx.showToast({
            title: '抢单成功',
            complete:()=>{
              wx.switchTab({
                url: '/pages/runPages/claimGood/index',
              })
            }
          })
        }
      }, fail: function (res) {
        console.log(res)
      }
    })
  },
  getAddressText() {
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + this.data.latitude + ',' + this.data.longitude + '&key=M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2',
      success: (posres) => {
        console.log(posres)
        if (posres.statusCode === 200) {
          const db = wx.cloud.database()
          db.collection('userInfo').where({
            _openid: app.globalData.openid
          }).get({
            success: res => {
              this.setData({
                runPhone: res.data[0].phoneNum
              })
              db.collection('userInfo').doc(res.data[0]._id).update({
                data: {
                  latitude: this.data.latitude,
                  longitude: this.data.longitude,
                  nation: posres.data.result.address_component.nation,
                  province: posres.data.result.address_component.province,
                  city: posres.data.result.address_component.nation,
                  district: posres.data.result.address_component.district,
                  street: posres.data.result.address_component.street,
                  street_number: posres.data.result.address_component.street_number,
                  town: posres.data.result.address_reference.town.title,
                }
              })
            }
          })
        }
      }
    })
  }
})