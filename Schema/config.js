// 用mongoose连接数据库 导出db 和 Schema
const mongoose = require("mongoose")
// 路由里边自动创建一个blogproject数据库 导出db
const db = mongoose.createConnection("mongodb://localhost:27017/blogproject", {useNewUrlParser: true})
// 用原生的ES6的Promise代替mongoosed自实现的promise
mongoose.Promise = global.Promise
// 导出Schema构造函数
const Schema = mongoose.Schema

// db连接状况
db.on("error", () => {
    console.log("数据库连接失败")
})
db.on("open", () => {
    console.log("bloghproject数据库连接成功")
})

module.exports = {
    db,
    Schema
}
