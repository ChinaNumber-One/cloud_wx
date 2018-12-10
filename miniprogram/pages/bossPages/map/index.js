// miniprogram/pages/map/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: null,
    latitude: null,
    longitude: null,
    warn:'',
    types: 'send',
    fromLoaction: {
      addressName: '从哪里出发',
      address: '从哪里出发',
      latitude: null,
      longitude: null,
      addressDetail: null,
      addresseeName: null,
      phoneNum: null
    },
    toLoaction: {
      addressName: '到哪里去',
      address: '到哪里去',
      latitude: null,
      longitude: null,
      addressDetail: null,
      addresseeName: null,
      phoneNum: null
    },
    lastPageLocationType:null,// 选择完地址后  返回到该页面，记录 type
    locationType: '', // 即将要选择地址的 type
    sendThingskindsText: '要配送的物品类型、重量',
    markers: [{},{}],
    polyline:[],
    district:'',
    runersText:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
      if (options.positionType){
        this.setData({
          lastPageLocationType: options.positionType
        })
      } else {
        wx.clearStorage()
      }
    } else {
      wx.navigateTo({
        url: "/pages/index/index",
      })
    }
    
    

  },
  handelStartPos(data){
    let res = data.data
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
        borderRadius: 4,
        bgColor: '#666',
        color: '#fff',
        padding: 4,
        textAlign: 'center'
      }
    }
    console.log(this.data.markers)
    this.data.markers[0] = startMarker
    console.log(this.data.markers)

    this.setData({
      fromLoaction: {
        addressName: res.name,
        address: res.address,
        latitude: res.latitude,
        longitude: res.longitude,
        addressDetail:res.detail,
        addresseeName:res.addresseeName,
        phoneNum:res.phoneNum
      },
      markers: this.data.markers
    })
    if (this.data.lastPageLocationType === 'from') {
      this.mapCtx.includePoints({
        points: [{
          latitude: res.latitude,
          longitude: res.longitude
        }, {
          latitude: this.data.latitude,
          longitude: this.data.longitude
        }],
        padding: [100, 100, 100, 100]
      })
    }
    
  },
  handelEndPos(data){

    let res = data.data
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
        borderRadius: 4,
        bgColor: '#666',
        color: '#fff',
        padding: 4,
        textAlign: 'center'
      }
    }
    this.data.markers[1] = endMarkder
    this.setData({
      toLoaction: {
        addressName: res.name,
        address: res.address,
        latitude: res.latitude,
        longitude: res.longitude,
        addressDetail: res.detail,
        addresseeName: res.addresseeName,
        phoneNum: res.phoneNum
      },
      markers: this.data.markers.splice(0,2),
      warn:'warnColor',
    })
    this.bicyclingLine()
  },
  choiceThingsType(){
    wx.navigateTo({
      url: "/pages/bossPages/sendThingsType/index",
    })
  },
  getlocation() {
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
    if (this.data.lastPageLocationType !== 'to'){
      console.log('--------------runners----------------')
      const db = wx.cloud.database()
      db.collection('userInfo').where({
        _openid: app.globalData.openid
      }).get({
        success: res => {
          // this.setData({
          //   district: res.data[0].district
          // })
          this.getRunners(res.data[0].town)
          this.timer = setInterval(() => {
            this.getRunners(res.data[0].town)

          }, 5000)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
        }
      })
    } else {
      clearInterval(this.timer)
    }
    
    if ( this.data.lastPageLocationType === 'from') {
      wx.getStorage({
        key: 'startPosition',
        success: this.handelStartPos.bind(this),
        fail: (res) => {
          console.log(res)
        }
      })
    } else if ( this.data.lastPageLocationType === 'to') {
      wx.getStorage({
        key: 'startPosition',
        success: this.handelStartPos.bind(this),
        fail: (res) => {
          console.log(res)
        }
      })
      wx.getStorage({
        key: 'endPosition',
        success: this.handelEndPos.bind(this),
        fail: (res) => {
          console.log(res)
        }
      })
    }
    
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
    if (this.data.locationType === 'to'){
      wx.getStorage({
        key: 'startPosition',
        success: (res)=> {
          wx.navigateTo({
            url: "/pages/bossPages/fillDetail/index?locationType=" + this.data.locationType,
          })
        },
        fail:(res)=>{
          console.log(res)
          wx.showToast({
            title: '请先选择出发地点！',
            icon: 'none',
            duration: 1500,
          })
          return
        }
      })
    } else {
      wx.navigateTo({
        url: "/pages/bossPages/fillDetail/index?locationType=" + this.data.locationType,
      })
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
        _this.mapCtx.includePoints({
          points:pl,
          padding:[100,100,100,100]
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
  choiceAddressBook(e){
    wx.navigateTo({
      url: "/pages/bossPages/addressBook/index?locationType=" + e.currentTarget.dataset.locationtype,
    })
  },
  moveToLocation(){
    this.mapCtx.moveToLocation();
  },
  getRunners(town){
    this.data.markers.splice(2, this.data.markers.length - 2)
    const runersArr = []
    wx.cloud.callFunction({
      name: 'aroundRuners',
      success: (result) => {
        if (result.result.data.length > 0) {
          let aroundRunersArr = result.result.data.filter((item, index) => {
            if (item.town === town && item.identity === 'run' && item._openid !== app.globalData.openid) {
              runersArr.push({
                id: 'runers' + index,
                latitude: item.latitude,
                longitude: item.longitude,
                width: 50,
                height: 50,
                iconPath: '/images/runningBear.png',
              })
              return true
            }
          })
          let newMarkers = this.data.markers.concat(runersArr)
          this.setData({
            markers: newMarkers,
            runersText: '附近有' + (newMarkers.length - 2) + '名奔跑侠～'
          })
        }
      }, fail: function (res) {
        console.log(res)
      }
    })
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
    this.mapCtx = wx.createMapContext('map', this)
    this.getlocation()
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onHide')
    clearInterval(this.timer)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload')
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