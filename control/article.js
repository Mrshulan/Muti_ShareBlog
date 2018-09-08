const { db } = require("../Schema/config")
const ArticleSchema = require("../Schema/article")
// 通过db对象在库里边创建了users数据库表/集合(collection)以ArticleSchema作为数据模型 Article操作整张表
const Article = db.model("articles", ArticleSchema)

// 拿到users的Schema 拿到可以控制的实例对象
const UserSchema = require("../Schema/user")
const User = db.model("users", UserSchema)

const CommentSchema = require("../Schema/comment")
const Comment = db.model("comments", CommentSchema)


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
    // 主动添加一下文章的作者的uid
    data.author = ctx.session.uid;
    data.commentNum = 0;

    await new Promise((resolve, reject) => {
        new Article(data).save((err, data) => {
            if(err){ return reject(err) }

            User.update({_id: data.author}, {$inc: {articleNum: 1}}, err => {
                if(err) return console.log(err)
                console.log("文章保存成功")
            })
            console.log(data.author);
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

// 获取文章列表
exports.getList = async ctx => {
    let page = ctx.params.id || 1
    page--
 
    const maxNum = await Article.estimatedDocumentCount((err, num) => err? console.log(err) : num)
    const artList = await Article
        .find()
        .sort("-created")
        .skip(2 * page)
        .limit(2)
        .populate({
            path: "author",
            select: "_id username avatar"
        })
        .then(data => data)
        .catch(err => console.log(err))
    await ctx.render("index", {
        session: ctx.session,
        title: "博客实战首页",
        artList,
        maxNum
    })
}

exports.details = async ctx => {
    const _id = ctx.params.id

    const article = await Article
        .findById(_id)
        .populate("author", "username")
        .then(data => data)

    const comment = await Comment
        .find({article: _id})
        .sort("-created")
        .populate("from", "username avatar")
        .then(data => data)
        .catch(err => {
            console.log(err)
        })

    await ctx.render("article", {
        title: article.title,
        article,
        comment,
        session: ctx.session
    })
}

exports.artlist = async ctx => {
    const uid = ctx.session.uid;

    const data = await Article.find({author: uid})

    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

// 删除对应 id 的文章
exports.del = async ctx => {
    const _id = ctx.params.id
    
    let uid;
  
    // 用户的 articleNum  -= 1
    // 删除文章对应的所有的评论
    // 被删除评论对应的用户表里的 commnetNum -= 1
  
    let res = {}
  
    // 删除文章
    // await Article.deleteOne({_id}).exec(async err => {
    //   if(err){
    //     res = {
    //       state: 0,
    //       message: '删除失败'
    //     }
    //   }else{
    //     await Article.findById(_id).then(data => {
    //       uid = data.author
    //     })
    //   }
    // })

    await Article.findById(_id).then(async data => {
        uid = data.author;
        await Article.deleteOne({_id}).exec(async err => {
            if(err){
                res = {
                    state: 0,
                    message: '删除失败'
                  }
            }else{
                 await User.update({_id: uid}, {$inc: {articleNum: -1}})
            }
        });
    })
  
    // 删除所有评论
    await Comment.find({article: _id}).then(async data => {
      // data => array
      let len = data.length
      let i = 0
  
      async function deleteUser(){
        if(i >= len)return
        const cId = data[i]._id
  
        // await Comment.deleteOne({_id: cId}).then(data => {
        //   User.update({_id: data[i].from}, {$inc: {commentNum: -1}}, err => {
        //     if(err)return console.log(err)
        //     i++
        //   })
        // })
        
        await User.update({_id: data[i].from}, {$inc: {commentNum: -1}}).then(async err => {
            if(err)return console.log(err)
            i++;
            console.log(i)
            await Comment.deleteOne({_id: cId});
        })

      }
  
  
      await deleteUser()
  
  
      res = {
        state: 1,
        message: "成功"
      }
  
    })
  
  
    ctx.body = res
  }