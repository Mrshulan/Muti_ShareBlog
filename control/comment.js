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

exports.comlist = async ctx => {
    const uid = ctx.session.uid

    const data = await Comment.find({from: uid}).populate("article", "title")

    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

exports.del = async ctx => {
    const commentId = ctx.params.id;

    let isOk = true;
    let articleId, uid;

    await Comment.findById(commentId, (err, data) => {
        if(err) {
            console.log(err)
            isOk = false
            return
        } else {
            articleId = data.article
            uid = data.from
        }
    })

    await Article
        .update({_id: articleId}, {$inc: {commentNum: -1}})
    await User
        .update({_id: uid}, {$inc: {commentNum: -1}});
    await Comment.deleteOne({_id: commentId})

    if(isOk){
        ctx.body = {
            state: 1,
            message: "删除成功"
        }
    }
}