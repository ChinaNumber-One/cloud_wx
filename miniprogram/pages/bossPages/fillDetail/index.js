// miniprogram/pages/bossPages/fillDetail/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StorageKey:'',
    storagePos:{},
    locationType:'',
    position:'请点击选择地址',
    detail:'',
    name:'',
    phoneNum:'',
    phonePlaceholder:"手机号",
    placeholderClass:'',
    sexRadio: [
      { name: 1, value: '男', checked: 'true' },
      { name: 0, value: '女' },
    ],
    sex:'男',
    isSavePos:false,
    btnClick:false,
  },
  choiceLoaction(){
    wx.chooseLocation({
      success: this.handleChooseLocationSucc.bind(this)
    })
  },
  handleChooseLocationSucc(res) {
    console.log('选择地址：' + this.data.locationType)
    console.log(this.data.StorageKey)
    this.setData({
      position:res.name,
      storagePos:res
    })
    // 本地存储 选择的地址信息，跳转到填写详情页面
    wx.setStorage({
      key: this.data.StorageKey,
      data: res,
      success:(result)=>{
        console.log(result)
        // this.setDate({
        //   position:res.name // res 为选择地址 的 res 不是本地存储返回的 result
        // })
      }
    })
  },
  detailInputFn(e){
    this.setData({
      detail:e.detail.value
    })
    this.mustFill()
  },
  addresseeInputFn(e){
    this.setData({
      name:e.detail.value
    })
    this.mustFill()
  },
  phoneInputFn(e){
    const regPhone = /^(((13[0-9]{1})|(14[0-9]{1})|(17[0-9]{1})|(15[0-3]{1})|(15[5-9]{1})|(18[0-9]{1}))+\d{8})$/
    if(e.detail.value.length!==11){
      this.setData({
        phoneNum: e.detail.value
      })
      return
    }
    if (!regPhone.test(e.detail.value)) {
      wx.showToast({
        title: '手机号码格式输入有误！',
        icon: 'none',
        duration: 1500
      })
      this.setData({
        phoneNum: '',
        phonePlaceholder:'请重新输入手机号!',
        phonePlaceholderClass:'inputWarn'
      })
    } else {
      this.setData({
        phoneNum: e.detail.value
      })
    }
    this.mustFill()
    
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      sex: Number(e.detail.value)===1?'男':'女'
    })
  },
  switchChange(e){
    // 是否保存到地址簿
    this.setData({
      isSavePos: !this.data.isSavePos
    })
    // 如果要保存，先查询数据库中是否存在相同的 地址
    if (this.data.isSavePos) {
      const db = wx.cloud.database()
      db.collection('addressBook').where({
        _openid: app.globalData.openid,
        addressName: this.data.storagePos.name,
        address: this.data.storagePos.address,
        latitude: this.data.storagePos.latitude,
        longitude: this.data.storagePos.longitude,
        addressDetail: this.data.detail,
        addresseeName: this.data.name,
        addresseePhoneNum: this.data.phoneNum,
        addresseeSex: this.data.sex,
      }).get({
        success: res => {
          console.log(res)
          // res.data.length>0 说明数据库中已存在
          if(res.data.length>0){
            wx.showToast({
              title: '地址簿已存在该地址！',
              icon: 'none',
              duration: 1500,
              complete: () => {
                this.setData ({
                  isSavePos:false
                })
                console.log('[数据库] [查询记录] 成功: ', res)
                return false
              }
            })
          } else {
            // 数据库中不存在，存储新的一条记录
            db.collection('addressBook').add({
              data: {
                addressName: this.data.storagePos.name,
                address: this.data.storagePos.address,
                latitude: this.data.storagePos.latitude,
                longitude: this.data.storagePos.longitude,
                addressDetail: this.data.detail,
                addresseeName: this.data.name,
                addresseePhoneNum: this.data.phoneNum,
                addresseeSex: this.data.sex,
              },
              success: res => {
                // 在返回结果中会包含新创建的记录的 _id
                console.log(res)
                if(res._id){
                  wx.showToast({
                    title: '保存成功！',
                    icon: 'success',
                    duration: 1500,
                  })
                }
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '新增地址失败'
                })
                console.error('[数据库] [新增记录] 失败：', err)
              }
            })
          }
          
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询地址失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })
      
    }
  },
  mustFill(){
    this.setData({
      btnClick: this.data.detail !== '' && this.data.name !== '' && this.data.phoneNum !== ''
    })
  },
  back(){
    this.handleFillPositionDetail(this.data.locationType)
    
  },
  handleFillPositionDetail(str){
    console.log(123)
    var key = str === 'from' ? 'startPosition' : 'endPosition'
    
    var finalInfo = this.data.storagePos
    finalInfo.detail = this.data.detail
    finalInfo.addresseeName = this.data.name
    finalInfo.phoneNum = this.data.phoneNum
    finalInfo.sex = this.data.sex
    finalInfo.fillDetail = true
    wx.setStorage({
      key: key,
      data: finalInfo,
      success: () => {
        wx.navigateTo({
          url: "/pages/bossPages/map/index?positionType=" + this.data.locationType,
        })
        // wx.navigateBack({
        //   delta: 1
        // })
      },
      fail: () => {
        wx.showToast({
          title: '发生未知的错误，请重试！',
          icon: 'none',
          duration: 1500,
          complete: () => {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }
    })
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.locationType){
      let key = options.locationType === 'from' ? 'startPosition' : 'endPosition'
      this.setData({
        StorageKey: key,
        locationType: options.locationType
      })
      console.log(this.data.StorageKey)
      console.log(this.data.locationType)
    }
    // if(options.locationType==='from'){
    //   wx.getStorage({
    //     key: 'startPosition',
    //     success: (res)=> {
    //       console.log(res)
    //       this.setData({
    //         locationType:'from',
    //         storagePos:res.data,
    //         position: res.data.name
    //       })
    //     },
    //   })
    // } else if (options.locationType === 'to') {
    //   wx.getStorage({
    //     key: 'endPosition',
    //     success: (res) => {
    //       console.log(res)
    //       this.setData({
    //         locationType: 'to',
    //         storagePos: res.data,
    //         position: res.data.name
    //       })
    //     },
    //   })
    // }
    // console.log(this.data.btnClick)
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

  }
})