const express = require("express")
const app = express()
const port = 3000
app.use(express.json())
require("dotenv").config()

const accountApi = require("./router/account.js")
app.use("/account", accountApi)
const alarmApi = require("./router/alarm.js")
app.use("/alarm", alarmApi)
const authApi = require("./router/auth.js")
app.use("/auth", authApi)
const cityApi = require("./router/city.js")
app.use("/city", cityApi)
const postApi = require("./router/post.js")
app.use("/post", postApi)
const scheduleApi = require("./router/schedule.js")
app.use("/schedule", scheduleApi)

app.listen(port, () => {
    console.log(`${port} 번에서 웹 서버가 실행됨`)
})
