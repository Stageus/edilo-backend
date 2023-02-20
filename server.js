const express = require("express")
const cookieParser = require("cookie-parser")
const https = require("https")
const fs = require("fs")
const app = express()
const port = 80
app.use(cookieParser())
app.use(express.json())
app.set('trust proxy', true)
// const cors = require("cors")
// app.use(cors())
require("dotenv").config()

app.use((req, res, next) => {
    const corsWhitelist = [
        'https://edilo.site',
        'https://www.edilo.site',
        'https://3.35.230.139',
        'http://localhost:3000'
    ]
    if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        res.header("Access-Control-Allow-Credentials", true)
    }
    next()
})

const privateKey = fs.readFileSync("/etc/letsencrypt/live/edilo.site/privkey.pem")
const fullchain = fs.readFileSync("/etc/letsencrypt/live/edilo.site/fullchain.pem")
const cert = fs.readFileSync("/etc/letsencrypt/live/edilo.site/cert.pem")
const credentials = {key: privateKey, ca: fullchain, cert: cert}

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
const commentApi = require("./router/comment.js")
app.use("/comment", commentApi)

app.get("/", (req, res) => {       //oauth test용
    res.sendFile(__dirname + "/testPage.html")
})

app.listen(port, () => {
    console.log(`${port} 번에서 웹 서버가 실행됨`)
})
https.createServer(credentials, app).listen(443, () => {
    console.log("443번에서 https 서버가 실행됨")
})