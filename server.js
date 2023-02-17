const express = require("express")
const cookieParser = require("cookie-parser")
const https = require("https")
const app = express()
const port = 3000
app.use(cookieParser())
app.use(express.json())
const cors = require("cors")
app.use(cors())
require("dotenv").config()

const fs = require("fs")
const privateKey = fs.readFileSync("/etc/letsencrypt/live/eodilo.site/privkey.pem")
const fullchain = fs.readFileSync("/etc/letsencrypt/live/eodilo.site/fullchain.pem")
const cert = fs.readFileSync("/etc/letsencrypt/live/eodilo.site/cert.pem")
const credentials = {key: privateKey, ca: fullchain, cert: cert}
// const passport = require("passport")
// require("./passport/googleStrategy.js")(passport)

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

app.get("/", (req, res) => {       //oauth test용
    res.header("Access-Control-Allow-Origin", "*")
    res.sendFile(__dirname + "/testPage.html")
})

app.listen(port, () => {
    console.log(`${port} 번에서 웹 서버가 실행됨`)
})
https.createServer(credentials, app).listen(443, () => {
    console.log("443번에서 https 서버가 실행됨")
})