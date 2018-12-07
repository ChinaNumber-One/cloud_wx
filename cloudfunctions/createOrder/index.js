// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const data = {
    bossLatitude: event.bossLatitude,
    bossLongitude: event.bossLongitude,
    bossOpenid: event.bossOpenid,
    arriveDate: event.arriveDate,
    distance: event.distance,
    startPosition: event.startPosition,
    endPosition: event.endPosition,
    sendThingsKind: event.sendThingsKind,
    weight: event.weight,
    price: event.price,
    tip: event.price,
    remark: event.remark,
    code: event.code,
    bossPhoneNum: event.bossPhoneNum,
    state: 0,
    orderCreateTime: new Date().getFullYear() + '-' + ((new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate()) + ' ' + (new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours()) + ':' + (new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()) + ':' + (new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds()),
    orderCreateId: event.bossOpenid + new Date().getTime()
  }
  try {
    return await db.collection('order').add({
      data: data
    })
  } catch (e) {
    console.log(e)
  }
}