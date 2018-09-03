const { Schema } = require("./config")

const ArticleSchema = new Schema({
    title: String,
    content: String,
    author: String,
    tips: String
}, {
    versionKey: false,
    // 时间戳createAt
    timestamps: {
        createAt: "created"
    }
})

module.exports = ArticleSchema