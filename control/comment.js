const { db } = require("../Schema/config")

const ArticleSchema = require("../Schema/article")
const Article = db.model("articles", ArticleSchema)

const UserSchema = require("../Schema/user")
const User = db.model("users", UserSchema)

const CommentSchema = require("../Schema/comment")
const Comment = db.model("comments", CommentSchema)

exports.save = async ctx => {
    let message = {
        status: 0,
        msg: "登录才能发表"
    }

    if(ctx.session.isNew) return ctx.body = message;

    const data = ctx.request.body
    data.from = ctx.session.uid
    
    const _comment = new Comment(data)

    await _comment
        .save()
        .then(data => {
            message = {
                status: 1,
                msg: "评论成功"
            }
            
            // 更新当前文章的评论计数器
            Article
            .update({_id: data.article}, {$inc: {commentNum: 1}}, err => {
                if(err) return console.log(err)
                console.log("评论计数器更新成功")
            })
            
            User
            .update({_id: data.from}, {$inc: {commentNum: 1}}, err => {
                if(err) return console.log(err)
            })
        })
        .catch(err => {
            message = {
                status: 0,
                msg: err
            }
        })

        ctx.body = message
}