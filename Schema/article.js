const { Schema } = require("./config")
const ObjectId = Schema.Types.ObjectId

const ArticleSchema = new Schema({
    title: String,
    content: String,
    author: {
        type: ObjectId,
        ref: "users"
    }, // 关联users集合
    tips: String,
    commentNum: Number
}, {
    versionKey: false,
    // 时间戳createAt
    timestamps: {
        createdAt: "created"
    }
})

module.exports = ArticleSchema