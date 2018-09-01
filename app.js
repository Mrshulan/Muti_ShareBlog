const Koa = require("koa")
const static = require("koa-static")
const views = require("koa-views")
const router = require("./routers/router")
const logger = require("koa-logger")
const { join } = require("path")

const app = new Koa

app.use(logger())

app.use(body())

app.use(static(join(__dirname, "public")))

app.use(views(join(__dirname, "views"), {
    extension: "pug"
}))


app.listen(3000, () => {
    console.log("项目启动成功,监听3000端口")
})