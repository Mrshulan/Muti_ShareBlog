const { db } = require("../Schema/config")
const UserSchema = require("../Schema/user")
const encrypt = require("../util/encrypt")

// 通过db对象在库里边创建了users数据库表/集合(collection)以UserShema作为数据模型 User操作整张表
const User = db.model("users", UserSchema)

// 用户注册
exports.reg = async ctx => {
   // ctx.request.body 接受注册时 post发过来的数据
   const user = ctx.request.body
   const username = user.username
   const password = user.password
   
   // 给个promise承诺 
   await new Promise((resolve, reject) => {
       // 1、先去数据库里边查一下是否有这个用户
        User.find({username}, (err, data) => {
           // 查询出错 
           if(err) return reject(err)
           // 用户名已经存在
           if(data.length !== 0){
               return resolve("")
           }

           // 用User模子new一个	数据记录行/文档BSON 记得用模块导出的函数加密 函数返回的是加密后的数据
           const _user = new User({
               username,
               password: encrypt(password),
               commentNum: 0,
               articleNum: 0
           })
           // 保存该数据
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
       // then 也是异步 所以都是用async await进行先操作
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

// 用户登录
exports.login = async ctx => {
    // 拿到 post数据
    const user = ctx.request.body
    const username = user.username
    const password = user.password

    await new Promise((resolve, reject) => {
        User.find({username}, (err, data) => {
            if(err) return reject(err)
            if(data.length === 0) return reject("用户名不存在")
            
            // 数据库中的加密密码是否和输入的加密一致，
            if(data[0].password === encrypt(password)){
                return resolve(data)
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

        // 在用户里边的cookies里边设置 username passwoerd加密的,和权限
        ctx.cookies.set("username", username, {
            domain: "localhost",
            path: "/",
            maxAge: 36e5,
            httpOnly: true,
            overwrite: false
        })
        ctx.cookies.set("uid", data[0]._id, {
            domain: "localhost",
            path: "/",
            maxAge: 36e5,
            httpOnly: true,
            overwrite: false
        })

        // session里边再记录一遍
        ctx.session = {
            username,
            uid: data[0]._id,
            avatar: data[0].avatar,
            role: data[0].role
        }
        // 成功登录
        await ctx.render("isOk", {
            status: "登录成功"
        })
     })
    .catch(async err => {
        await ctx.render("isOk", {
            status: "登录失败"
        })
    })
}

// 确定和记录 用户的状态
exports.keepLog = async (ctx, next) => {
    if(ctx.session.isNew){ // 初次isNew为true 登录之后为false
        if(ctx.cookies.get("username")){
            ctx.session = {
                username: ctx.cookies.get("username"),
                uid: ctx.cookies.get("uid")
            }
        }
    }
    await next() //移交下一个中间件
}

// 用户退出中间件
exports.logout = async ctx => {
    ctx.session = null

    ctx.cookies.set("username", null, {
        maxAge: 0
    })

    ctx.cookies.set("uid", null, {
        maxAge: 0
    })

    // 在后台重定向到 根
    ctx.redirect("/")
}

// 用户的头像上传
exports.upload = async ctx => {
    const filename = ctx.req.file.filename
  
    let data = {}
    await User.update({_id: ctx.session.uid}, {$set: {avatar: "/avatar/" + filename}}, (err, res) => {
      if(err){
        data = {
          status: 0,
          message: "上传失败"
        }
      }else{
        data = {
          status: 1,
          message: '上传成功'
        }
      }
    })
  
    ctx.body =  data
  }