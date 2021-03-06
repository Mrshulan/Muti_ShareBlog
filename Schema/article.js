const { Schema } = require("./config")
const ObjectId = Schema.Types.ObjectId

const ArticleSchema = new Schema({
  title: String,
  content: String,
  author: {
    type: ObjectId,
    ref: "users"
  },
  tips: String,
  commentNum: Number
},{
  versionKey: false,
  timestamps: {
    createdAt: "created"
  }
})

// 设置文章删除的钩子
ArticleSchema.post('remove', async doc => {
  const User = require('../Models/user')
  const Comment = require('../Models/comment')

  const { _id: artId, author: authorId } = doc

  await User.findByIdAndUpdate(authorId, {$inc: {articleNum: -1}}).exec()

  await Comment.find({article: artId})
    .then(data => {
      data.forEach(v => v.remove())
    })
    .catch(err => {
      console.log("文章删除连接Comment失败")
    })
})


module.exports = ArticleSchema