const crtpto = require("crypto")

// 加密对象 ---> 返回加密成功的数据，
module.exports = function(password, key = "shulan"){
    const hmac = crypto.createHmac("sha256", key)
    hmac.updata(password)
    const passwordHmac = hmac.digest("hex")
    return passwordHmac;
}