// miniprogram/pages/bossPages/order/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: '',
    latitude: null,
    longitude: null,
    distance: '',
    duration: '',
    arriveDate: '',
    markers: [{}, {}],
    polyline: [],
    fromLoaction: {
      addressName: '',
      address: '',
      latitude: null,
      longitude: null,
      addressDetail: null,
      addresseeName: null,
      phoneNum: null
    },
    toLoaction: {
      addressName: '',
      address: '',
      latitude: null,
      longitude: null,
      addressDetail: null,
      addresseeName: null,
      phoneNum: null
    },
    sendThingskindsText: '',
    weight: 5,
    totalPrice: 0,
    tip: 0,
    locationType: '',
    remarkText:'',
    code:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getlocation()
    this.mapCtx = wx.createMapContext('map', this)
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getlocation() {
    wx.showLoading({
      title: '加载数据中……',
      mask: true
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
    try {
      var value = wx.getStorageSync('startPosition')
      if (value) {
        this.handelStartPos(value)
      }
    } catch (e) {
      console.log(e)
    }

    try {
      var value = wx.getStorageSync('endPosition')
      if (value) {
        this.handelEndPos(value)
      }
    } catch (e) {
      console.log(e)
    }

    try {
      var value = wx.getStorageSync('thingsType')
      if (value) {
        this.handelThingsType(value)
      }
    } catch (e) {
      console.log(e)
    }
    // wx.getStorageSync({
    //   key: 'startPosition',
    //   success: this.handelStartPos.bind(this)
    // })
    // wx.getStorageSync({
    //   key: 'endPosition',
    //   success: this.handelEndPos.bind(this)
    // })
    // wx.getStorageSync({
    //   key: 'thingsType',
    //   success: this.handelThingsType.bind(this)
    // })
  },
  handelStartPos(res) {
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
    this.data.markers[0] = startMarker


    this.setData({
      fromLoaction: {
        addressName: res.name,
        address: res.address,
        latitude: res.latitude,
        longitude: res.longitude,
        addressDetail: res.detail,
        addresseeName: res.addresseeName,
        phoneNum: res.phoneNum
      },
      markers: this.data.markers
    })
    // console.log(this.data.markers)
    // console.log(this.data.fromLoaction)
    // this.mapCtx.includePoints({
    //   // points: [{
    //   //   latitude: res.latitude,
    //   //   longitude: res.longitude
    //   // }, {
    //   //   latitude: this.data.latitude,
    //   //   longitude: this.data.longitude
    //   // }],
    //   // padding: [0]
    // })
    // console.log([{
    //   latitude: res.latitude,
    //   longitude: res.longitude
    // }, {
    //   latitude: this.data.latitude,
    //   longitude: this.data.longitude
    // }])
    this.bicyclingLine()
  },
  handelEndPos(res) {
    // console.log('endpos')
    // let res = data.data
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
      markers: this.data.markers,
      warn: 'warnColor',
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
  },
  drivingDistance() {
    // console.log('打')
    wx.request({
      url: 'https://apis.map.qq.com/ws/distance/v1/?mode=driving&from=' + this.data.fromLoaction.latitude + ',' + this.data.fromLoaction.longitude + '&to=' + this.data.toLoaction.latitude + ',' + this.data.toLoaction.longitude + '&key=M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2',
      success: this.getdrivingDistanceSuccess.bind(this)
    })
  },
  getdrivingDistanceSuccess(res) {
    // console.log(res)
    if (res.statusCode === 200) {
      let distance
      let duration
      let nowDateTimes = new Date().getTime()
      let arriveDateTImes
      let arriveDate
      distance = (res.data.result.elements[0].distance / 1000).toFixed(2)
      duration = 35 + Math.round(res.data.result.elements[0].duration / 60)
      arriveDateTImes = nowDateTimes + 60 * 1000 * (35 + Math.round(res.data.result.elements[0].duration / 60))
      // console.log(new Date(arriveDateTImes))
      let hour = (new Date(arriveDateTImes).getHours() < 10 ? '0' + new Date(arriveDateTImes).getHours() : new Date(arriveDateTImes).getHours())
      let minute = (new Date(arriveDateTImes).getMinutes() < 10 ? '0' + new Date(arriveDateTImes).getMinutes() : new Date(arriveDateTImes).getMinutes())
      arriveDate = hour + ':' + minute
      this.data.markers[1].callout.content = this.data.markers[1].callout.content + '\n' + distance + '公里  预计' + arriveDate + '送达'
      this.setData({
        distance: Number(distance),
        duration: duration,
        arriveDate: arriveDate,
        markers: this.data.markers
      })
      console.log(this.data.distance)
      console.log(this.data.weight)
      wx.cloud.callFunction({
        name: 'calculateTotalPrice',
        data: {
          distance: this.data.distance,
          weight: this.data.weight === '小于5' ? '5' : this.data.weight
        },
        success: (res) => {
          console.log(res)
          this.setData({
            totalPrice: res.result
          })
          wx.hideLoading()
        },
        fail: (res) => {
          console.log(res)
        }
      })
    }

  },
  bicyclingLine: function() {
    var _this = this;
    //网络请求设置
    var opt = {
      //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
      url: 'https://apis.map.qq.com/ws/direction/v1/bicycling/?from=' + _this.data.fromLoaction.latitude + ',' + _this.data.fromLoaction.longitude + '&to=' + _this.data.toLoaction.latitude + ',' + _this.data.toLoaction.longitude + '&key=M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2',
      method: 'GET',
      dataType: 'json',
      //请求成功回调
      success: function(res) {
        var ret = res.data
        if (ret.status != 0) return; //服务异常处理
        var coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        //设置polyline属性，将路线显示出来
        _this.mapCtx.includePoints({
          points: pl,
          padding: [30]
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
  handelThingsType(res) {
    this.setData({
      weight: res.weight,
      sendThingskindsText: res.type + '、' + res.weight + '公斤'
    })
  },
  choiceThingsType() {
    wx.navigateTo({
      url: "/pages/bossPages/sendThingsType/index",
    })
  },
  choiceLoaction(e) {
    this.setData({
      locationType: e.currentTarget.dataset.locationtype
    })
    if (this.data.locationType === 'to') {
      wx.getStorage({
        key: 'startPosition',
        success: (res) => {
          wx.navigateTo({
            url: "/pages/bossPages/fillDetail/index?locationType=" + this.data.locationType + '&page=order',
          })
        },
        fail: (res) => {
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
        url: "/pages/bossPages/fillDetail/index?locationType=" + this.data.locationType + '&page=order',
      })
    }

  },
  choiceAddressBook(e) {
    wx.navigateTo({
      url: "/pages/bossPages/addressBook/index?locationType=" + e.currentTarget.dataset.locationtype+'&page=order'
    })
  },
  remarkChange(e){
    console.log(e.detail.value)
    this.setData({
      remarkText: e.detail.value
    })
  },
  tipChange(e) {
    console.log(typeof e.detail.value)
    this.setData({
      tip: Number(e.detail.value)
    })
  },
  moveToLocation() {
    this.mapCtx.moveToLocation();
  },
  submit(){
    this.createCode()
    const db = wx.cloud.database()
    db.collection('order').add({
      data: {
        boss:{
          arriveDate:this.data.arriveDate,
          distance:this.data.distance,
          startPosition: this.data.fromLoaction,
          endPositon:this.data.toLoaction,
          sendThingsKind:this.data.sendThingskindsText,
          weight:this.data.weight,
          price:this.data.totalPrice,
          tip:this.data.tip,
          remark:this.data.remarkText,
          code:this.data.code,
        },
        state:0,
        orderCreateTime: new Date().getFullYear() + '-' + ((new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate()) + ' ' + (new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours()) + ':' + (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()) + ':' + (new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds()),
        orderCreateId: app.globalData.openid + new Date().getTime()
      },
      success: res => {
        console.log(res)
        // 在返回结果中会包含新创建的记录的 _id
        // this.setData({
        //   counterId: res._id,
        //   count: 1
        // })
        // wx.showToast({
        //   title: '新增记录成功',
        // })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  createCode(){
    let code='';
    //设置长度，这里看需求，我这里设置了4
    let codeLength = 6;
    //设置随机字符
    let random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    //循环codeLength 我设置的4就是循环4次
    for (let i = 0; i < codeLength; i++) {
      //设置随机数范围,这设置为0 ~ 36
      let index = Math.floor(Math.random() * 36);
      //字符串拼接 将每次随机的字符 进行拼接
      code += random[index];
    }
    //将拼接好的字符串赋值给展示的Value
    this.setData({
      code:code
    })
  }
})