const { db } = require("../Schema/config")
const ArticleSchema = require("../Schema/article")
// 通过db对象在库里边创建了users数据库表/集合(collection)以ArticleSchema作为数据模型 Article操作整张表
const Article = db.model("articles", ArticleSchema)

// 返回文章发表页
exports.addPage = async (ctx) => {
    await ctx.render("add-article", {
        title: "文章发表页",
        session: ctx.session
    })
}
// 文章的发表(保存到数据库)
exports.add = async ctx => {
    if(ctx.session.isNew){
        // true没登录 就不需要查询数据库
        return ctx.body = {
            msg: "用户未登录",
            status: 0
        }
    }

    // 用户登录发表 post发来的数据
    const data = ctx.request.body
    // 主动添加一下文章的作者
    data.author = ctx.session.username

    await new Promise((resolve, reject) => {
        new Article(data).save((err, data) => {
            if(err){ return reject(err) }
            resolve(data)
        })
    })
    .then(data => {
        ctx.body = {
            msg: "发表成功",
            status: 1
        }
    })
    .catch(err => {
        ctx.body = {
            msg: "发表失败",
            status: 0
        }
    })
}