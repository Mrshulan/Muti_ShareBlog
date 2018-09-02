const { Schema } = require("./config")

const UserSchama = new Schema({ 
    username: String,
    password: String
}, {
    versionkey: false
})

module.exports = UserSchema