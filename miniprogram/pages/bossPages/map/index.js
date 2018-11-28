// miniprogram/pages/map/index.js
const app = getApp()
// var QQMapWX = require('../../../lib/qqmap-wx-jssdk1.0/qqmap-wx-jssdk.min.js');
// var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    latitude: null,
    longitude: null,
    types: 'send',
    fromLoaction: {
      name: '从哪里出发',
      address: '从哪里出发',
      latitude: null,
      longitude: null
    },
    toLoaction: {
      name: '到哪里去',
      address: '到哪里去',
      latitude: null,
      longitude: null
    },
    locationType: '',
    sendThingskindsText: '要配送的物品类型、重量',
    markers: [{},{}],
    polyline:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
      this.getlocation()
      // qqmapsdk = new QQMapWX({
      //   key: 'M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2'
      // });
      
    } else {
      wx.navigateTo({
        url: "/pages/index/index",
      })
    }

  },
  getlocation() {
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
  },
  // 送/买 ？
  changeTypes(e) {
    this.setData({
      types: e.currentTarget.dataset.types
    })
  },
  choiceLoaction(e) {
    this.setData({
      locationType: e.currentTarget.dataset.locationtype
    })
    wx.chooseLocation({
      success: this.handleChooseLocationSucc.bind(this)
    })
  },
  handleChooseLocationSucc(res) {
    console.log(res)
    // 选择 出发地点
    if (this.data.locationType === 'from') {
      let startMarker = {
        id: 'from',
        latitude: res.latitude,
        longitude: res.longitude,
        title: res.name,
        address: res.address,
        width: 30,
        height: 30,
        iconPath: '/images/startPos.png',
        callout: {
          display: "ALWAYS",
          content: res.name,
          color: "green"
        }
      }
      this.data.markers[0] = startMarker

      this.setData({
        fromLoaction: {
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        },
        markers:this.data.markers
      })
      this.mapCtx.includePoints({
        points: [{
          latitude: res.latitude,
          longitude: res.longitude
        },{
            latitude: this.data.latitude,
            longitude: this.data.longitude
        }],
        padding: [30]
      })
      this.bicyclingLine()
      wx.setStorage({
        key: "startPosition",
        data: res,
        success:function(res){
          wx.navigateTo({
            url: "/pages/bossPages/fillDetail/index?locationType=from",
          })
        }
      })
    } else if (this.data.locationType === 'to') {
      // 选择  到达地点
      let endMarkder = {
        id: 'to',
        latitude: res.latitude,
        longitude: res.longitude,
        title: res.name,
        address: res.address,
        width: 30,
        height: 30,
        iconPath: '/images/endPos.png',
        callout: {
          display: "ALWAYS",
          content: res.name,
          color: "red"
        }
      }
      this.data.markers[1] = endMarkder
      this.setData({
        toLoaction: {
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude
        },
        markers: this.data.markers
      })
      // this.mapCtx.includePoints({
      //   points: [{
      //     latitude: res.latitude,
      //     longitude: res.longitude
      //   }, {
      //       latitude: this.data.latitude,
      //       longitude: this.data.longitude
      //     }],
      //   padding: [30]
      // })
      this.bicyclingLine()
      this.drivingDistance()
    }
  },
  drivingDistance(){
    wx.request({
      url: 'https://apis.map.qq.com/ws/distance/v1/?mode=driving&from=' + this.data.fromLoaction.latitude + ',' + this.data.fromLoaction.longitude + '&to=' + this.data.toLoaction.latitude + ',' + this.data.toLoaction.longitude + '&key=M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2',
      success: this.getdrivingDistanceSuccess.bind(this)
    })
  },
  getdrivingDistanceSuccess(res){
    if (res.statusCode === 200){
      console.log(res.data.result.elements[0].distance+'米')
      console.log(res.data.result.elements[0].duration+'秒')
    }
    
  },
  bicyclingLine: function () {
    var _this = this;
    //网络请求设置
    var opt = {
      //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
      url: 'https://apis.map.qq.com/ws/direction/v1/bicycling/?from=' + _this.data.fromLoaction.latitude + ',' + _this.data.fromLoaction.longitude + '&to=' + _this.data.toLoaction.latitude + ',' + _this.data.toLoaction.longitude+'&key=M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2',
      method: 'GET',
      dataType: 'json',
      //请求成功回调
      success: function (res) {
        var ret = res.data
        if (ret.status != 0) return; //服务异常处理
        var coors = ret.result.routes[0].polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        //设置polyline属性，将路线显示出来
        console.log(pl)
        _this.mapCtx.includePoints({
          points:pl,
          padding:[30]
        })
        _this.setData({
          polyline: [{
            points: pl,
            color: '#1aad19',
            width: 4
          }]
        })
       
      }
    };
    wx.request(opt);
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
    // qqmapsdk.search({
    //   keyword: '酒店',
    //   success: function (res) {
    //     console.log(res);
    //   },
    //   fail: function (res) {
    //     console.log(res);
    //   },
    //   complete: function (res) {
    //     console.log(res);
    //   }
    // })
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