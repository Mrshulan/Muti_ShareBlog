const Router = require("koa-router")
const user = require("../control/user")

const router = new Router

router.get("/", async (ctx) => {
    await ctx.render("index", {
        title: "动态输入的title"
    })
})

router.get(/^\/user\/(?=reg|login)/, async (ctx) => {
    const show = /reg$/.test(ctx.path)

    await ctx.render("register", show)
})

router.post("/user/reg", user.reg)

router.post("/user/login", user.login)

module.exports = router