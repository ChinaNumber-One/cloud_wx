// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let total = 5
  let nowDateHour = new Date().getHours

  if (event.distance >= 1 && event.distance < 5) {
    total += event.distance * 1
  } else if (event.distance >= 5 && event.distance < 10) {
    total += event.distance * 2
  } else if (event.distance >= 10 && event.distance < 30) {
    total += event.distance * 3
  } else if (event.distance >= 30 && event.distance < 100) {
    total += event.distance * 15
  }

  if (event.weight >= 6 && event.weight < 10) {
    total += 6
  } else if (event.weight >= 10) {
    total += 10
  }

  

  if (nowDateHour >= 0 && nowDateHour < 2) {
    total += 4
  } else if (nowDateHour >= 2 && nowDateHour < 7) {
    total += 8
  } else if (nowDateHour >= 22 && nowDateHour < 24) {
    total += 4
  }
  return Number(total.toFixed(2))
}