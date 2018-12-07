// miniprogram/pages/runPages/claimGood/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

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
    this.handleWaitClaimGood()
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
  handleWaitClaimGood(){
    const db = wx.cloud.database()
    db.collection('order').where({
      runOpenid: app.globalData.openid,
      // state:1
    }).get({
      success: res => {
        // console.log(res)
        for(var i =0;i<res.data.length;i++){
          console.log(res.data[i].runOpenid)
        }
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },
  // moveToLocation() {
  //   this.mapCtx.moveToLocation();
  // },
  // bicyclingLine: function (from_lat,from_lon,to_lat,to_lon) {
  //   var _this = this;
  //   //网络请求设置
  //   var opt = {
  //     //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
  //     url: 'https://apis.map.qq.com/ws/direction/v1/bicycling/?from=' + from_lat + ',' + from_lon + '&to=' + to_lat + ',' + to_lon + '&key=M7JBZ-3TSKJ-U3FFV-KVSPJ-LKHE6-QTFJ2',
  //     method: 'GET',
  //     dataType: 'json',
  //     //请求成功回调
  //     success: function (res) {
  //       var ret = res.data
  //       if (ret.status != 0) return; //服务异常处理
  //       var coors = ret.result.routes[0].polyline, pl = [];
  //       //坐标解压（返回的点串坐标，通过前向差分进行压缩）
  //       var kr = 1000000;
  //       for (var i = 2; i < coors.length; i++) {
  //         coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
  //       }
  //       //将解压后的坐标放入点串数组pl中
  //       for (var i = 0; i < coors.length; i += 2) {
  //         pl.push({ latitude: coors[i], longitude: coors[i + 1] })
  //       }
  //       //设置polyline属性，将路线显示出来
  //       _this.mapCtx.includePoints({
  //         points: pl,
  //         padding: [30]
  //       })
  //       _this.setData({
  //         polyline: [{
  //           points: pl,
  //           color: '#1aad19',
  //           width: 4
  //         }]
  //       })

  //     }
  //   };
  //   wx.request(opt);
  // },
  // scaleMapAndDrowLine(){
  //   this.mapCtx.includePoints({
  //     points: [{
  //       latitude: this.data.claimGood.boss.startPosition.latitude,
  //       longitude: this.data.claimGood.boss.startPosition.longitude
  //     }, {
  //       latitude: this.data.latitude,
  //       longitude: this.data.longitude
  //     }],
  //     padding: [30]
  //   })
  //   this.bicyclingLine(this.data.latitude, 
  //                      this.data.longitude,  
  //                      this.data.claimGood.boss.startPosition.latitude,     
  //                      this.data.claimGood.boss.startPosition.longitude)
  // }
})

// let endMarker = {
  //         id: 'to',
  //         latitude: res.data[0].boss.startPosition.latitude,
  //         longitude: res.data[0].boss.startPosition.longitude,
  //         title: res.data[0].boss.startPosition.name,
  //         address: res.data[0].boss.startPosition.address,
  //         width: 30,
  //         height: 30,
  //         iconPath: '/images/endPos.png',
  //         callout: {
  //           display: "ALWAYS",
  //           content: res.data[0].boss.startPosition.addressName + res.data[0].boss.startPosition.addressDetail,
  //           borderRadius: 4,
  //           bgColor: '#666',
  //           color: '#fff',
  //           padding: 4,
  //           textAlign: 'center'
  //         }
  //       }
  //       let startMarker = {
  //         id: 'from',
  //         latitude: this.data.latitude,
  //         longitude: this.data.longitude,
  //         title: res.data[0].boss.startPosition.name,
  //         address: res.data[0].boss.startPosition.address,
  //         width: 30,
  //         height: 30,
  //         iconPath: '/images/startPos.png',
  //         callout: {
  //           display: "ALWAYS",
  //           content: '当前位置出发',
  //           borderRadius: 4,
  //           bgColor: '#666',
  //           color: '#fff',
  //           padding: 4,
  //           textAlign: 'center'
  //         }
  //       }

  //       this.data.markers[0] = startMarker
  //       this.data.markers[1] = endMarker
  //       this.setData({
  //         claimGood:res.data[0],
  //         markers: this.data.markers
  //       })

  //       this.scaleMapAndDrowLine()