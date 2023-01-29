const nodemailer = require("nodemailer")

const smtpTransport = nodemailer.createTransport({
    service: "Naver",
    auth: {
        user: "dydwns0908@naver.com",
        pass: "ghddydwns090800"
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = smtpTransport