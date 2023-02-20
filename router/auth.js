const router = require("express").Router()
const pgClient = require("../config/pgClient.js")
const {Client} = require("pg")
const bcrypt = require("bcrypt")
const smtpTransport = require("../config/email.js")
const passport = require("passport")
const kakao = require("../config/kakao.js")
const axios = require('axios')
const qs = require('qs')

router.post("/email/signUp", async (req, res) => {  //이메일 인증번호 발송 api
    const userEmail = req.body.emailValue
    const checkEmailSql = "SELECT * FROM eodilo.account WHERE userEmail=$1"
    const values = [userEmail]
    let client

    const result = {
        "success": false,
        "message": ""
    }

    try {
        if(userEmail == undefined || userEmail.length > 320 || userEmail.length == 0) {
            throw new Error("부적합한 이메일 규격")
        }
        client = new Client(pgClient)
        await client.connect()
        const data = await client.query(checkEmailSql, values)
        const row = data.rows
        if(row.length > 0) {
            throw new Error("중복되는 이메일이 이미 존재함")
        }
        const randNum = Math.random().toString().substr(2,6)
        const authNum = await bcrypt.hash(randNum, 10)
        res.cookie("authNum", authNum, {maxAge: 1000*60*3, sameSite: "none", secure: true})
        const mailOptions = {
            from: process.env.emailAddress,
            to: userEmail,
            subject: "eodilo 이메일 인증번호입니다. 6자리 숫자를 정확히 입력해 주세요.",
            text: randNum
        }
        await smtpTransport.sendMail(mailOptions)
        await smtpTransport.close()
        result.success = true
    } catch (err) {
        result.message = err.message
    }
    if(client) client.end()
    res.send(result)
})

router.post("/email/signUp/confirm", async (req, res) => {  //이메일 인증번호 인증 api
    const authCode = req.body.authCode
    const authNum = req.cookies.authNum

    const result = {
        "success": false,
        "message": ""
    }

    try {
        if(authCode == undefined || authCode.length != 6) {
            throw new Error("입력 정보의 규격이 적합하지 않음")
        }
        else if(bcrypt.compareSync(authCode, authNum)) {
            result.success = true
        }
    } catch(err) {
        result.message = err.message
    }
    res.send(result)
})

router.post("/email/findId", async (req, res) => {  //아이디 찾기 인증번호 발송 api
    const userName = req.body.nameValue
    const userEmail = req.body.emailValue
    const checkUserInfoSql = "SELECT * FROM eodilo.account WHERE userEmail=$1 AND userName=$2"
    const values = [userEmail, userName]
    let client

    const result = {
        "success": false,
        "message": ""
    }

    try {
        if(userEmail == undefined || userEmail.length > 320 || userEmail.length == 0) {
            throw new Error("부적합한 이메일 규격")
        }
        if(userName == undefined || userName.length > 20 || userName.length == 0) {
            throw new Error("부적합한 이름 규격")
        }
        client = new Client(pgClient)
        await client.connect()
        const data = await client.query(checkUserInfoSql, values)
        const row = data.rows
        if(row.length == 0) {
            throw new Error("해당하는 계정이 존재하지 않음")
        }
        const randNum = Math.random().toString().substr(2,6)
        const authNum = await bcrypt.hash(randNum, 10)
        res.cookie("authInfo", {"authNum": authNum, "userEmail": userEmail}, {maxAge: 1000*60*3, sameSite: "none", secure: true})
        const mailOptions = {
            from: process.env.emailAddress,
            to: userEmail,
            subject: "eodilo 이메일 인증번호입니다. 6자리 숫자를 정확히 입력해 주세요.",
            text: randNum
        }
        await smtpTransport.sendMail(mailOptions)
        await smtpTransport.close()
        result.success = true
    } catch (err) {
        result.message = err.message
    }
    if(client) client.end()
    res.send(result)

})

router.post("/email/findId/confirm", async (req, res) => {  //아이디 찾기 api
    const authCode = req.body.authCode
    const authNum = req.cookies.authInfo.authNum
    const userEmail = req.cookies.authInfo.userEmail
    const findIdSql = "SELECT * FROM eodilo.account WHERE userEmail=$1"
    const values = [userEmail]
    let client

    const result = {
        "success": false,
        "message": "",
        "userId": ""
    }

    try {
        if(authCode == undefined || authCode.length != 6) {
            throw new Error("입력 정보의 규격이 적합하지 않음")
        }
        else if(bcrypt.compareSync(authCode, authNum)) {
            client = new Client(pgClient)
            await client.connect()
            const data = await client.query(findIdSql, values)
            result.userId = data.rows[0].userid
            result.success = true
        }
    } catch(err) {
        result.message = err.message
    }
    if(client) client.end()
    res.send(result)
})

router.post("/email/findPw", async (req, res) => {  //비밀번호 찾기 인증번호 발송 api
    const userId = req.body.idValue
    const userEmail = req.body.emailValue
    const checkUserInfoSql = "SELECT * FROM eodilo.account WHERE userId=$1 AND userEmail=$2"
    const values = [userId, userEmail]
    let client

    const result = {
        "success": false,
        "message": ""
    }

    try {
        if(userEmail == undefined || userEmail.length > 320 || userEmail.length == 0) {
            throw new Error("부적합한 이메일 규격")
        }
        if(userId == undefined || userId.length > 20 || userId.length == 0) {
            throw new Error("부적합한 아이디 규격")
        }
        client = new Client(pgClient)
        await client.connect()
        const data = await client.query(checkUserInfoSql, values)
        const row = data.rows
        if(row.length == 0) {
            throw new Error("해당하는 계정이 존재하지 않음")
        }
        const randNum = Math.random().toString().substr(2,6)
        const authNum = await bcrypt.hash(randNum, 10)
        res.cookie("authNum", authNum, {maxAge: 1000*60*3, sameSite: "none", secure: true})
        const mailOptions = {
            from: process.env.emailAddress,
            to: userEmail,
            subject: "eodilo 이메일 인증번호입니다. 6자리 숫자를 정확히 입력해 주세요.",
            text: randNum
        }
        await smtpTransport.sendMail(mailOptions)
        await smtpTransport.close()
        result.success = true
    } catch (err) {
        result.message = err.message
    }
    if(client) client.end()
    res.send(result)
})

router.post("/email/findPw/confirm", async (req, res) => {  //비밀번호 찾기 api
    const authCode = req.body.authCode
    const authNum = req.cookies.authNum

    const result = {
        "success": false,
        "message": ""
    }

    try {
        if(authCode == undefined || authCode.length != 6) {
            throw new Error("입력 정보의 규격이 적합하지 않음")
        }
        else if(bcrypt.compareSync(authCode, authNum)) {
            result.success = true
        }
    } catch(err) {
        result.message = err.message
    }
    res.send(result)
})

router.get("/google", passport.authenticate("google", { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
       res.redirect('/')
    },
) 

router.get("/kakao/", (req, res) => {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.clientID}&redirect_uri=${kakao.redirectUri}&response_type=code&scope=profile,account_email`;
    res.redirect(kakaoAuthURL);
})

router.get('/kakao/callback', async (req,res)=>{

    let user = null
    let token = null 

    try{
        // Authorization Server 부터 Access token 발급받기
        token = await axios({
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers:{
                'content-type':'application/x-www-form-urlencoded'
            },
            data:qs.stringify({ 
                grant_type: 'authorization_code', 
                client_id:kakao.clientID,
                client_secret:kakao.clientSecret,
                redirectUri:kakao.redirectUri,
                code:req.query.code,
            })
        })
    } catch(err){
        res.json(err.data);
    }
 
    try{
         // access_token 으로 사용자 정보 요청하기
        console.log(token);//access정보를 가지고 또 요청해야 정보를 가져올 수 있음.

        user = await axios({
            method:'get',
            url:'https://kapi.kakao.com/v2/user/me',
            headers:{
                Authorization: `Bearer ${token.data.access_token}`
            }
        })
    } catch(err){
        res.json(err.data);
    }
    console.log(user);
 
    req.session.kakao = user.data;    
    res.send('success');
})

module.exports = router