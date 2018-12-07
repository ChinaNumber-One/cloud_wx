// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const _id = event._id
  const data = {
    runOpenid:event.runOpenid,
    runPhoneNum:event.runPhoneNum,
    runLongitude:event.runLongitude,
    runLatitude: event.runLatitude,
    state:1
  }
  try {
    return await db.collection('order').doc(_id).update({
      data: data
    })
  } catch (e) {
    console.log(e)
  }
}