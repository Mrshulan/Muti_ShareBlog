const Koa = require("koa")
const static = require("koa-static")
const views = require("koa-views")
const router = require("./routers/router")
const logger = require("koa-logger")
const { join } = require("path")
const session = require("koa-session")

const app = new Koa

app.keys = ["shulan"]

const CONFIG = {
    key: "Sid",
    maxAge: 36e5,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: true
}


app.use(logger())

app.use(session(CONFIG))

app.use(body())

app.use(static(join(__dirname, "public")))

app.use(views(join(__dirname, "views"), {
    extension: "pug"
}))


app.listen(3000, () => {
    console.log("项目启动成功,监听3000端口")
})