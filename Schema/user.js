const { Schema } = require('./config')

// 生成Schema实例规范
const UserSchema = new Schema({
  username: String,
  password: String
}, {versionKey: false})


module.exports = UserSchema