const { db } = require("../Schema/config")
const UserSchema = require("../Schema/user")
const encrypt = require("../util/emcrypt")

const User = db.model("users", UserSchema)

exports.reg = async ctx => {
    
   const user = ctx.request.body
   const username = user.username
   const password = user.password
   
   await new Promise((resolve, reject) => {
       user.find({username}, (err,data) => {
           if(err) return reject(err)

           if(data.length !== 0){
               return resolve("")
           }

           const _user = new User({
               username,
               password: encrypt(password)
           })

           _user.save((err, data) => {
               if(err){
                   reject(err)
               }else{
                   resolve(data)
               }
           })
       })
   })
   .then(async data => {
       if(data){
           await ctx.render("isOk", {
               status:"注册成功"
            })
       }else{
           await ctx.render("isOk", {
               status: "用户名已存在"
           })
       }
   })
   .catch(async err => {
       await ctx.render("isOk", {
           status: "注册失败，请重试"
       })
   })
}

exports.login = async ctx => {
    const user = ctx.request.body
    const username = user.username
    const password = user.password

    await new Promise((resolve, reject) => {
        User.find({username}, (err, data) => {
            if(err) return reject(err)
            if(data.length === 0) return reject("用户名不存在")
        
            if(data[0].password === encrypt(password)){
                return resolv(data)
            }
            resolve("")
        })
    })
    .then(async data => {
        if(!data){
            return ctx.render("isOk", {
                status: "密码不正确，登录失败"
            })
        }


        await ctx.render("isOk", {
            status: "登录成功"
        })
        .catch(async err => {
            await ctx.render("isOk", {
                status: "登录失败"
            })
        })

    })
}