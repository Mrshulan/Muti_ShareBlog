const { Schema } = require("./config")
const ObjectId = Schema.Types.ObjectId

const CommentSchema = new Schema({
    content: String,
    from: {
        type: ObjectId,
        ref: "users"
    },
    article: {
        type: ObjectId,
        ref: "articles"
    }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created"
    }
})

module.exports = CommentSchema